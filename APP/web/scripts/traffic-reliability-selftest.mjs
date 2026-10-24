// Synthetic PostgreSQL, real app modules, no environment files or live network.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import ts from 'typescript';
import { PGlite } from '@electric-sql/pglite';
import { triggerMail, mailTriggerDiagnostic } from './traffic-mail-trigger.mjs';
import { scheduleContext } from './traffic-schedule-context.mjs';
import { memoryLedger, keyFor } from './traffic-ledger-fixture.mjs';
function load(file, imports={}, env={}, fetcher=async()=>{throw Error('Unexpected network');}, clock=Date) {
  const exports={};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,
    {exports,process:{env},Buffer,URL,Request,Response,AbortSignal,Date:clock,fetch:fetcher,console:{error(){}},require(n){assert(n in imports,`Unmocked ${n}`);return imports[n];}});
  return exports;
}
let checks=0;
const dates=load('src/lib/traffic/date.ts');
const matrix=[
  ['2026-10-24T11:59:00Z','2026-10-24','17 12 * * *','skip'],
  ['2026-10-24T14:57:27Z','2026-10-24','17 12 * * *','deliver'],
  ['2026-10-24T16:12:10Z','2026-10-24','17 13 * * *','skip'],
  ['2026-10-24T21:59:59Z','2026-10-24','17 20 * * *','deliver'],
  ['2026-10-24T22:00:00Z','2026-10-24','17 20 * * *','missed'],
  ['2026-10-25T12:17:00Z','2026-10-24','17 12 * * *','missed'],
  ['2026-11-02T13:17:00Z','2026-11-02','17 13 * * *','deliver'],
  ['2026-11-02T13:17:00Z','2026-11-02','17 12 * * *','skip'],
  ['2026-11-03T13:17:00Z','2026-11-03','17 13 * * *','skip'],
  ['2027-03-15T12:17:00Z','2027-03-15','17 12 * * *','deliver'],
];
for(const [at,date,slot,state] of matrix){assert.equal(dates.trafficScheduleDecision(slot,date,Date.parse(at)).state,state);checks++;}
for(const [date,length] of [['2026-10-18',1],['2026-10-19',2],['2026-10-26',2],['2026-10-31',1],['2026-11-01',0],['2026-11-02',1]]) {
  assert.equal(dates.trafficPeriodsForDeliveryDate(date).length,length);checks++;
}
const autumn=dates.calendarRange('2026-10-26','2026-11-01'),spring=dates.calendarRange('2027-03-08','2027-03-14');
assert.equal((Date.parse(autumn.until)-Date.parse(autumn.since))/3600000,169);
assert.equal((Date.parse(spring.until)-Date.parse(spring.since))/3600000,167);checks+=2;
assert.throws(()=>dates.trafficPeriodsForDeliveryDate('2026-02-30'));checks++;

// Actual additive migration + actual ledger SQL, synthetic local Postgres.
const db=new PGlite();
await db.exec(fs.readFileSync('traffic/migrations/002_delivery_ledger.sql','utf8'));
const ledgerModule=load('src/lib/traffic/delivery-ledger.ts',{'server-only':{},'node:crypto':crypto,'@vercel/postgres':{createPool(){throw Error('No live DB');}},'./store':{trafficDatabaseUrl(){throw Error('No credentials');}}});
const ledger=new ledgerModule.PostgresDeliveryLedger({query:(sql,params)=>db.query(sql,params)});
await ledger.freeze('fixture-key','{"fixture":"original"}');
await ledger.freeze('fixture-key','{"fixture":"changed"}');
const concurrent=await Promise.all(Array.from({length:8},()=>ledger.claim('fixture-key')));
assert.equal(concurrent.filter(Boolean).length,1);checks++;
const first=concurrent.find(Boolean);assert.equal(first.payload,'{"fixture":"original"}');checks++;
await ledger.finish('fixture-key',first.attemptId,'pending','email_http_429');
const second=await ledger.claim('fixture-key');assert.equal(second.payload,first.payload);checks++;
await ledger.finish('fixture-key',second.attemptId,'accepted',null);
assert.equal(await ledger.claim('fixture-key'),null);assert.equal((await ledger.status('fixture-key')).state,'accepted');checks+=2;
await assert.rejects(()=>ledger.finish('fixture-key',first.attemptId,'pending',null));checks++;
await assert.rejects(()=>db.query("UPDATE traffic_mail_deliveries SET payload='changed' WHERE delivery_key=$1",['fixture-key']));checks++;
for(const state of ['sending','unconfirmed','rejected']) {
  await ledger.freeze(state,'{}');const claim=await ledger.claim(state);
  if(state!=='sending')await ledger.finish(state,claim.attemptId,state,'fixture');
  await db.query("UPDATE traffic_mail_deliveries SET attempted_at=NOW()-INTERVAL '2 days' WHERE delivery_key=$1",[state]);
  assert.equal(await ledger.claim(state),null);checks++;
}
await ledger.freeze('exhausted','{}');
for(let i=0;i<3;i++){const c=await ledger.claim('exhausted');await ledger.finish('exhausted',c.attemptId,'pending','email_http_429');}
assert.equal(await ledger.claim('exhausted'),null);checks++;
await db.query(`INSERT INTO traffic_mail_deliveries(delivery_key,payload,payload_hash,created_at)
  VALUES ('expired','{}',$1,NOW()-INTERVAL '24 hours')`,[crypto.createHash('sha256').update('{}').digest('hex')]);
assert.equal(await ledger.claim('expired'),null);checks++;
await db.close();

const baseEnv={VERCEL_ENV:'production',TRAFFIC_EMAIL_ENABLED:'true',TRAFFIC_SCHEDULE_ENABLED:'true',TRAFFIC_EMAIL_TEST_READBACK_CONFIRMED:'true',TRAFFIC_RESEND_API_KEY:'synthetic',TRAFFIC_FROM_EMAIL:'reports@finacalleos.com',TRAFFIC_MORNING_REPORT_EMAIL:'anthonycolmenaresanandres@gmail.com',TRAFFIC_MAIL_TRIGGER_SECRET:'synthetic-token-at-least-32-characters'};
const periods=dates.trafficPeriodsForDeliveryDate('2026-10-24');
for(const outcome of ['accepted','timeout','server-error','conflict','rate-limit','db-finish-fails']) {
  const memory=memoryLedger(),payloads=[];let attempts=0;
  if(outcome==='db-finish-fails')memory.finish=async()=>{throw Error('DB down');};
  const mail=load('src/lib/traffic/morning-email.ts',{'server-only':{},'./morning-format':{renderTrafficDeliveryReport:b=>({subject:'fixture',text:b[0].reports[0].text,html:'fixture'})},'./delivery-ledger':{getDeliveryLedger:()=>memory,trafficDeliveryKey:keyFor}},baseEnv,async(url,options)=>{
    attempts++;payloads.push(options.body);
    if(outcome==='timeout')throw Error('synthetic timeout');
    return new Response(null,{status:outcome==='server-error'?500:outcome==='conflict'?409:outcome==='rate-limit'&&attempts===1?429:200});
  });
  const bundle=text=>[{period:periods[0],reports:[{text}]}];
  await mail.sendTrafficDeliveryReport(bundle('original'),'scheduled');
  const next=await mail.sendTrafficDeliveryReport(bundle('changed'),'scheduled');
  assert.equal(attempts,outcome==='rate-limit'?2:1,outcome);
  if(outcome==='accepted')assert.equal(next.deduplicated,true);
  if(outcome==='rate-limit')assert.equal(payloads[0],payloads[1]);
  checks++;
}

// Actual route+mailer+ledger, synthetic reports. Complete/partial sites remain
// query independent. All-source failure never creates a payload/provider call.
const sanitize=load('src/lib/traffic/sanitize.ts');
const sites=load('src/lib/traffic/sites.ts',{'./sanitize':sanitize});
const formatter=load('src/lib/traffic/morning-format.ts',{'./date':dates,'./sites':sites});
let now=Date.parse('2026-10-24T14:57:00Z'),queries=0,providerCalls=0,unavailable=false;
class Clock extends Date {static now(){return now;}}
const memory=memoryLedger(),outputs=[];
const mail=load('src/lib/traffic/morning-email.ts',{'server-only':{},'./morning-format':formatter,'./delivery-ledger':{getDeliveryLedger:()=>memory,trafficDeliveryKey:keyFor}},baseEnv,async(u,o)=>{providerCalls++;outputs.push(JSON.parse(o.body));return new Response(null,{status:200});});
const report=p=>sites.ALL_TRAFFIC_SITES.map((s,i)=>({siteId:s.id,siteName:s.name,domains:s.domains,analyticsUrl:s.analyticsUrl,state:unavailable?'unavailable':'partial',reason:'Coverage unverified',since:p.range.since,until:p.range.until,observedPageviews:unavailable?undefined:i,observedIdentifiers:0,identifiedPageviews:0}));
const service={getTrafficPeriodReports:async p=>{queries++;return report(p);},getMorningTrafficReports:async()=>({date:'2026-10-23',reports:report(periods[0])})};
const route=load('src/app/api/internal/traffic/morning/route.ts',{'node:crypto':crypto,'next/server':{NextResponse:{json:(b,i)=>Response.json(b,i)}},'@/lib/admin/auth':{getAdminContext:async()=>({state:'authorized'})},'@/lib/traffic/date':dates,'@/lib/traffic/morning-email':mail,'@/lib/traffic/site-traffic':service},baseEnv,undefined,Clock);
const post=async(body,token=baseEnv.TRAFFIC_MAIL_TRIGGER_SECRET)=>route.POST(new Request('https://finacalleos.com/api/internal/traffic/morning',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)}));
const scheduled={mode:'scheduled',schedule:'17 12 * * *',deliveryDate:'2026-10-24'};
assert.equal((await post(scheduled,'wrong')).status,401);checks++;
assert.equal((await post({...scheduled,to:'client@example.test'})).status,400);checks++;
for (const mode of [['recovery'],['scheduled'],{toString:'recovery'},null,1]) {
  assert.equal((await post({mode,deliveryDate:'2026-10-24'})).status,400);checks++;
}
assert.equal((await post(scheduled)).status,200);assert.equal(providerCalls,1);checks++;
assert(outputs[0].subject.includes('2026-10-23'));assert(outputs[0].text.includes('2026-10-23T04:00:00.000Z'));checks++;
assert(outputs[0].text.indexOf('Bodega Cafe')<outputs[0].text.indexOf('Colattao Coffee House'));
assert(outputs[0].text.indexOf('Colattao Coffee House')<outputs[0].text.indexOf('Fina Calle OS'));checks++;
assert(outputs[0].html.includes('Data not yet available'));assert(outputs[0].text.includes('not people'));checks++;
const queried=queries;unavailable=true;
assert.equal((await (await post(scheduled)).json()).deduplicated,true);assert.equal(queries,queried);assert.equal(providerCalls,1);checks++;
assert.equal((await post({mode:'check',deliveryDate:'2026-10-24'})).status,200);checks++;
now=Date.parse('2026-10-25T12:17:00Z');
assert.equal((await post({mode:'check',deliveryDate:'2026-10-25'})).status,503);assert.equal(providerCalls,1);checks++;
assert.equal((await post({...scheduled,deliveryDate:'2026-10-25'})).status,503);assert.equal(providerCalls,1);checks++;
unavailable=false;now=Date.parse('2026-10-26T22:01:00Z');
assert.equal((await post({...scheduled,deliveryDate:'2026-10-26'})).status,410);checks++;
assert.equal((await post({mode:'recovery',deliveryDate:'2026-10-26'})).status,403);checks++;
baseEnv.TRAFFIC_EMAIL_RECOVERY_ENABLED='true';
assert.equal((await post({mode:'recovery',deliveryDate:'2026-10-24'})).status,403);checks++;
assert.equal((await post({mode:'recovery',deliveryDate:'2026-10-26'})).status,200);assert.equal(providerCalls,2);checks++;
assert.equal((await post({mode:'recovery',deliveryDate:'2026-10-26'})).status,200);assert.equal(providerCalls,2);checks++;
assert(outputs[1].subject.includes('2026-10-25'));assert(outputs[1].subject.includes('week 2026-10-19 through 2026-10-25'));checks++;

let error;
try{await triggerMail({TRAFFIC_MAIL_TRIGGER_SECRET:baseEnv.TRAFFIC_MAIL_TRIGGER_SECRET,TRAFFIC_MAIL_MODE:'scheduled',TRAFFIC_MAIL_DELIVERY_DATE:'2026-10-24',TRAFFIC_MAIL_SCHEDULE:'17 12 * * *'},async()=>Response.json({ok:true,skipped:true,reason:'outside_delivery_window'}));}catch(e){error=e;}
assert(error);assert.equal(mailTriggerDiagnostic(error).code,'response_outcome_unconfirmed');checks++;
const runEnv={GITHUB_REPOSITORY:'anthonycolmenaresanandres-lang/amma-fina-calle',GITHUB_RUN_ID:'123'};
assert.equal(await scheduleContext(runEnv,async()=>Response.json({id:123,repository:{full_name:runEnv.GITHUB_REPOSITORY},head_branch:'main',event:'schedule',created_at:'2026-10-24T15:59:00Z'})),'2026-10-24');checks++;
await assert.rejects(()=>scheduleContext(runEnv,async()=>Response.json({id:123,repository:{full_name:'other/repo'}})));checks++;
console.log(`PASS ${checks} traffic reliability groups: late/DST/cadence, real SQL claims and immutability, retries, partial/unavailable, current-day recovery, watchdog and original run dates. No live requests or sends.`);
