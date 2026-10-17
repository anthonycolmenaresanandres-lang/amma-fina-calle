import assert from "node:assert/strict";
import { ownerQueueEnabled, submitOwnerReviewToQueue, submitStructuredQueueRequest, validateStructuredQueueInput, type QueueClient, type StructuredQueueInput } from "../src/lib/owner/queue/client";
import { ownerQueueSourceAssessment } from "../src/lib/owner/queue/sources";
import { deliverOwnerRequestNotice, drainOwnerRequestNotices, type Notice } from "../src/lib/owner/queue/notifications";
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12,"0")}`;
const input: StructuredQueueInput = { restaurantId: "test-a", clientKey: id(1), itemId: id(2), changeType: "availability", expectedVersion: 0, afterValue: false, brief: "Owner confirmed exact change", confirmed: true };
const job: Notice = { id: id(11), lease_token: id(12), request_id: id(13), reference_id: "AMMA-SYNTHETIC-1234ABCD", restaurant_id: "test-a", event_type: "submitted", attempt: 1 };
const env = { OWNER_REQUEST_QUEUE_ENABLED: "true", OWNER_REQUEST_NOTIFICATIONS_ENABLED: "true", REQUESTS_NOTIFICATION_EMAIL: "operations@example.test", REQUESTS_FROM_EMAIL: "Fina Calle <notices@example.test>", RESEND_API_KEY: "SYNTHETIC-NOT-A-CREDENTIAL" };
let checks=0;
async function check(label: string, test: () => unknown | Promise<unknown>) { await test(); checks++; console.log(`PASS ${label}`); }
async function main() {
 let rpcCalls=0;
 const client: QueueClient = { rpc: async (_name,args) => { rpcCalls++; assert.equal("p_contact_info" in args,false); assert.equal("actor_user_id" in args,false); return { data: { id: id(22), reference_id: job.reference_id, status: "needs_review" }, error: null }; } };
 await check("application gate defaults off",()=>assert.equal(ownerQueueEnabled({}),false));
 for(const flag of ["1","TRUE","false",undefined]) await check(`strict gate ${flag}`,()=>assert.equal(ownerQueueEnabled({OWNER_REQUEST_QUEUE_ENABLED:flag}),false));
 await check("disabled submission makes no RPC",async()=>{assert.equal((await submitStructuredQueueRequest(client,input,{})).ok,false);assert.equal(rpcCalls,0)});
 await check("enabled review derives identity only in DB",async()=>{const r=await submitOwnerReviewToQueue(client,{restaurantId:"test-a",clientKey:id(1),brief:"Untrusted instructions are data"},env);assert.equal(r.ok,true);assert.equal(rpcCalls,1)});
 await check("structured payload is bounded",async()=>assert.equal((await submitStructuredQueueRequest(client,input,env)).ok,true));
 for(const patch of [{changeType:"price"},{afterValue:"false"},{expectedVersion:-1},{afterValue:null},{confirmed:false},{clientKey:"bad"},{changeType:"display_order",afterValue:10001},{changeType:"name_typo",afterValue:""}]) await check(`invalid structured input ${JSON.stringify(patch)}`,()=>assert.throws(()=>validateStructuredQueueInput({...input,...patch} as StructuredQueueInput)));
 await check("receipt uncertainty preserves error without DB details",async()=>{
   const r=await submitOwnerReviewToQueue({rpc:async()=>({data:null,error:new Error("SECRET DB DETAIL")})},{restaurantId:"test-a",clientKey:id(1),brief:"Review"},env);
   assert.equal(r.ok,false);assert.doesNotMatch(JSON.stringify(r),/SECRET/);
 });
 for(const tenant of ["bodega","scrambled","project-seed"]) await check(`${tenant} static source cannot promise database propagation`,()=>assert.equal(ownerQueueSourceAssessment(tenant).kind,"static"));
 await check("Colattao separate site",()=>assert.equal(ownerQueueSourceAssessment("colattao").kind,"external"));
 await check("Las Palmas conditional",()=>assert.equal(ownerQueueSourceAssessment("las-palmas-lynnhaven").kind,"conditional"));
 await check("generic menu still requires source certification",()=>assert.equal(ownerQueueSourceAssessment("test-a").certificationRequired,true));
 let claims=0,mail=0,acks=0; const bodies: string[]=[],keys:string[]=[];
 const fetcher: typeof fetch = async (_url,options)=>{mail++;bodies.push(String(options?.body));keys.push((options?.headers as Record<string,string>)["Idempotency-Key"]);return new Response("{}",{status:202})};
 const db: QueueClient={rpc:async(name,args)=>{
   if(name==="claim_owner_request_notices_v1"){claims++;return {data:[job],error:null}};
   assert.equal(name,"finish_owner_request_notice_v1");acks++;assert.equal(args.p_lease_token,job.lease_token);return {data:true,error:null};
 }};
 await check("notification default-off makes no DB or network calls",async()=>{assert.equal((await drainOwnerRequestNotices(db,{},fetcher)).state,"disabled_or_unconfigured");assert.equal(claims,0);assert.equal(mail,0)});
 await check("missing mail config does not lease jobs",async()=>{assert.equal((await drainOwnerRequestNotices(db,{OWNER_REQUEST_QUEUE_ENABLED:"true",OWNER_REQUEST_NOTIFICATIONS_ENABLED:"true"},fetcher)).state,"disabled_or_unconfigured");assert.equal(claims,0)});
 await check("bad batch does not lease jobs",async()=>assert.equal((await drainOwnerRequestNotices(db,env,fetcher,11)).state,"invalid_batch"));
 await check("one lease gets one attempt and fenced acknowledgement",async()=>{assert.deepEqual(await drainOwnerRequestNotices(db,env,fetcher),{state:"drained",processed:1});assert.equal(claims,1);assert.equal(mail,1);assert.equal(acks,1)});
 await check("notice contains only fixed metadata and private link",()=>{
   const body=JSON.parse(bodies[0]);assert.deepEqual(body.to,["operations@example.test"]);assert.match(body.text,/customers\/requests\//);assert.doesNotMatch(bodies[0],/Owner confirmed|owner-a@|attachments|SYNTHETIC-NOT-A-CREDENTIAL/);
 });
 await check("provider idempotency key stable across delivery retry",async()=>{await deliverOwnerRequestNotice({...job,lease_token:id(55),attempt:2},env,fetcher);assert.equal(keys[0],keys[1])});
 await check("untrusted claimed payload never reaches mail",async()=>{
   const calls=mail;const result=await drainOwnerRequestNotices({rpc:async()=>({data:[{...job,reference_id:"<script>"}],error:null})},env,fetcher);assert.equal(result.state,"claim_failed");assert.equal(mail,calls);
 });
 await check("lost acknowledgement is reported without resending",async()=>{
   const calls=mail;const result=await drainOwnerRequestNotices({rpc:async(name)=>({data:name==="claim_owner_request_notices_v1"?[job]:false,error:null})},env,fetcher);assert.equal(result.state,"lease_or_ack_lost");assert.equal(mail,calls+1);
 });
 await check("provider 5xx maps to bounded category",async()=>assert.deepEqual(await deliverOwnerRequestNotice(job,env,async()=>new Response("SECRET RAW PROVIDER BODY",{status:500})),{sent:false,error:"provider_5xx"}));
 await check("provider 4xx maps to bounded category",async()=>assert.deepEqual(await deliverOwnerRequestNotice(job,env,async()=>new Response("SECRET RAW PROVIDER BODY",{status:400})),{sent:false,error:"provider_4xx"}));
 await check("transport exception does not expose error",async()=>assert.deepEqual(await deliverOwnerRequestNotice(job,env,async()=>{throw new Error("SECRET TRANSPORT")}),{sent:false,error:"transport"}));
 await check("timeout ends an unresolved provider attempt",async()=>assert.deepEqual(await deliverOwnerRequestNotice(job,env,async()=>new Promise<Response>(()=>{}),1),{sent:false,error:"timeout"}));
 await check("notification rejection is persisted, not retried in memory",async()=>{
   let outcomes=0;const result=await drainOwnerRequestNotices({rpc:async(name,args)=>{
     if(name==="claim_owner_request_notices_v1")return {data:[job],error:null};
     assert.equal(args.p_sent,false);assert.equal(args.p_error,"provider_5xx");outcomes++;return {data:true,error:null};
   }},env,async()=>new Response("",{status:503}));assert.equal(outcomes,1);assert.equal(result.processed,1);
 });
 console.log(`${checks} queue client/source/notification checks passed. All fetches and RPCs mocked; no messages sent.`);
}
main().catch(error=>{console.error(error);process.exitCode=1});
