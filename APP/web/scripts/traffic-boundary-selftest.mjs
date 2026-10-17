// Offline route, delivery and browser failure tests. All IO is mocked.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import path from 'node:path';
import ts from 'typescript';
function load(file, imports, env={}, fetch=async()=>{throw Error('Unexpected network');}) {
  const exports={};
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
  vm.runInNewContext(code,{exports,process:{env},Buffer,URL,URLSearchParams,Response,Request,TextDecoder,Uint8Array,AbortSignal,Date,fetch,
    console:{error(){},info(){}},require(name){if(!(name in imports))throw Error(`Unmocked ${name}`);return imports[name];}},{filename:file});
  return exports;
}
const env={VERCEL_ENV:'production',TRAFFIC_INGESTION_SOURCE:'first-party'};
const sanitize=load('src/lib/traffic/sanitize.ts',{});
const registry=load('src/lib/traffic/sites.ts',{'./sanitize':sanitize});
const first=load('src/lib/traffic/first-party.ts',{'./sanitize':sanitize,'./sites':registry},env);
let writes=0;let fail=false;
const store={getTrafficStore(){return {async insertEvents(){writes++;if(fail)throw Error('fixture-private-connection');}};}};
const collector=load('src/app/api/traffic/pageview/route.ts',{'@/lib/traffic/first-party':first,'@/lib/traffic/store':store},env);
const body={id:'89c4b568-4138-49d9-84b2-58111abc5678',ts:Date.now(),hostname:'finacalleos.com',path:'/demo/project-seed'};
const request=(payload=body,origin='https://finacalleos.com')=>new Request('https://finacalleos.com/api/traffic/pageview',{method:'POST',headers:{Origin:origin},body:JSON.stringify(payload)});
assert.equal((await collector.POST(request())).status,204);assert.equal(writes,1);
assert.equal((await collector.POST(request({...body,hostname:'bodegacafe757.com'}))).status,400);assert.equal(writes,1);
assert.equal((await collector.POST(request(body,'https://unknown.test'))).status,403);assert.equal(writes,1);
fail=true;assert.equal((await collector.POST(request())).status,503);
env.VERCEL_ENV='preview';assert.equal((await collector.POST(request())).status,202);assert.equal(writes,2);
env.VERCEL_ENV='production';env.TRAFFIC_INGESTION_SOURCE='drain';assert.equal((await collector.POST(request())).status,202);assert.equal(writes,2);
console.log('PASS collector failures isolated, preview excluded, one active source, conflicting identities rejected');

const dates=load('src/lib/traffic/date.ts',{});
const readStatements=[];let poolCreations=0;
const queryPool={
  async sql(strings){readStatements.push(strings.join('?'));return {rows:[]};},
  async query(sql){readStatements.push(sql);return {rows:[]};},
};
const actualStore=load('src/lib/traffic/store.ts',{'node:fs':fs,'node:crypto':crypto,'node:path':{default:path},'./date':dates,'./sites':registry,
  '@vercel/postgres':{createPool:()=>{poolCreations++;return queryPool;}}});
const firstReadStore=new actualStore.__test.PostgresTrafficStore('postgres://fixture-unused.test/traffic');
await firstReadStore.getRangeReport('bodega',Date.now()-60000,Date.now(),'America/New_York');
await firstReadStore.getObservationWindow('bodega');await firstReadStore.getCollectionChecks('bodega',Date.now()-60000,Date.now());
assert.equal(poolCreations,1);assert.equal(readStatements.length,6);assert(readStatements.every(sql=>/^\s*SELECT\b/i.test(sql)));
console.log('PASS actual first connection factory is reused and emits SELECTs only; no schema initialization');
const coverage=load('src/lib/traffic/coverage.ts',{});
const fakeStore={async getRangeReport(){return {pageviews:0,uniqueVisitors:0,daily:[],topPaths:[],topReferrers:[],lastUpdated:null};},async getObservationWindow(){return {firstObservedAt:null,lastObservedAt:null};},async getCollectionChecks(){return [];}};
const service=load('src/lib/traffic/site-traffic.ts',{'server-only':{},'./date':dates,'./coverage':coverage,'./sites':registry,'./store':{getTrafficStore:()=>fakeStore,trafficDatabaseUrl:()=> 'configured-fixture'}},env);
const interval=dates.calendarRange('2026-09-17','2026-10-16');
assert.equal((await service.getSiteTrafficReport(registry.ALL_TRAFFIC_SITES[0],interval)).state,'waiting');
fakeStore.getRangeReport=async()=>{throw Error('fixture');};
assert.equal((await service.getSiteTrafficReport(registry.ALL_TRAFFIC_SITES[0],interval)).state,'unavailable');
console.log('PASS service distinguishes empty evidence from unavailable storage');

let adminOK=false;
const next={NextResponse:{json:(body,init)=>Response.json(body,init)}};
const reportRoute=load('src/app/api/internal/traffic/report/route.ts',{'node:crypto':crypto,'@/lib/traffic/date':dates,'@/lib/admin/auth':{getAdminContext:async()=>({state:adminOK?'authorized':'unauthorized'})},'@/lib/traffic/sites':registry,'@/lib/traffic/site-traffic':service},{TRAFFIC_REPORT_TOKEN:'fixture-report-token'});
const reportURL='https://finacalleos.com/api/internal/traffic/report?start=2026-09-17&end=2026-10-16';
assert.equal((await reportRoute.GET(new Request(reportURL))).status,401);
const read=await reportRoute.GET(new Request(reportURL,{headers:{Authorization:'Bearer fixture-report-token'}}));assert.equal(read.status,200);
const result=await read.json();assert.equal(result.range.since,'2026-09-17T04:00:00.000Z');assert.equal(result.range.until,'2026-10-17T04:00:00.000Z');
assert(result.reports.every(row=>row.state==='unavailable'));
assert.equal(read.headers.get('Cache-Control'),'private, no-store');
console.log('PASS protected connector-readable calendar report, unavailable data remains unavailable');

const formatter=load('src/lib/traffic/morning-format.ts',{'./sites':registry});
let sent=0;const deliveries=[];
const mailEnv={VERCEL_ENV:'production',TRAFFIC_RESEND_API_KEY:'fixture',TRAFFIC_FROM_EMAIL:'fixture@example.test',TRAFFIC_MORNING_REPORT_EMAIL:'anthonycolmenaresanandres@gmail.com'};
const mail=load('src/lib/traffic/morning-email.ts',{'server-only':{},'./morning-format':formatter},mailEnv,async(url,options)=>{sent++;deliveries.push({url,options});return new Response(null,{status:200});});
assert.equal((await mail.sendMorningReport('2026-10-16',result.reports)).reason,'email_delivery_disabled');assert.equal(sent,0);
mailEnv.TRAFFIC_EMAIL_ENABLED='true';mailEnv.TRAFFIC_MORNING_REPORT_EMAIL='somebody@example.test';
assert.equal((await mail.sendMorningReport('2026-10-16',result.reports)).reason,'invalid_report_recipient');assert.equal(sent,0);
mailEnv.TRAFFIC_MORNING_REPORT_EMAIL='anthonycolmenaresanandres@gmail.com';
assert.equal((await mail.sendMorningReport('2026-10-16',result.reports)).sent,true);assert.equal(sent,1);
const delivery=JSON.parse(deliveries[0].options.body);assert.deepEqual(delivery.to,['anthonycolmenaresanandres@gmail.com']);
assert(delivery.text.includes('unavailable'));assert(!delivery.text.includes('Pageviews: 0'));
assert.equal(deliveries[0].options.headers['Idempotency-Key'],'fina-calle-traffic-2026-10-16');
mailEnv.VERCEL_ENV='preview';assert.equal((await mail.sendMorningReport('2026-10-16',result.reports)).reason,'email_delivery_disabled');assert.equal(sent,1);
assert.equal(mail.morningEmailStatus().enabled,false);
sent=0;
const morningEnv={VERCEL_ENV:'preview',CRON_SECRET:'fixture-cron',TRAFFIC_EMAIL_ENABLED:'true'};
const morning=load('src/app/api/internal/traffic/morning/route.ts',{'node:crypto':crypto,'next/server':next,'@/lib/admin/auth':{getAdminContext:async()=>({state:'authorized'})},'@/lib/traffic/morning-email':{morningEmailStatus:()=>({configured:true,enabled:true}),sendMorningReport:async()=>{sent++;return {sent:true};}},'@/lib/traffic/site-traffic':{getMorningTrafficReports:async()=>({date:'2026-10-16',reports:result.reports})}},morningEnv);
const morningPreview=await morning.GET(new Request('https://finacalleos.com/api/internal/traffic/morning'));assert.equal(morningPreview.status,200);assert.equal((await morningPreview.json()).readyToSend,false);assert.equal(sent,0);
assert.equal((await morning.POST(new Request('https://finacalleos.com/api/internal/traffic/morning',{method:'POST',headers:{Authorization:'Bearer fixture-cron'}}))).status,503);assert.equal(sent,0);
morningEnv.TRAFFIC_EMAIL_ENABLED='false';assert.equal((await morning.POST(new Request('https://finacalleos.com/api/internal/traffic/morning',{method:'POST'}))).status,503);assert.equal(sent,0);
assert(!JSON.parse(fs.readFileSync('vercel.json','utf8')).crons.some(cron=>cron.path.includes('/traffic/')));
console.log('PASS all report GETs cannot send mail, owner restriction, disabled delivery, no traffic schedule');
const healthPreview=load('src/app/api/internal/traffic/health/route.ts',{'../report/route':reportRoute,'node:crypto':crypto,'@/lib/traffic/sites':registry,'@/lib/traffic/store':store,'@/lib/traffic/first-party':first},{VERCEL_ENV:'preview',TRAFFIC_HEALTH_RECORD_ENABLED:'true',CRON_SECRET:'fixture-cron'});
const beforeHealth=writes;assert.equal((await healthPreview.POST(new Request('https://preview.example.test/api/internal/traffic/health',{method:'POST',headers:{Authorization:'Bearer fixture-cron'}}))).status,503);assert.equal(writes,beforeHealth);
console.log('PASS preview cannot collect, record monitoring, initialize schema or send even when opt-in flags are inherited');

const script=fs.readFileSync('public/traffic-collector.js','utf8');
let calls=0;const history={pushState(){return 'native-result';},replaceState(){return 'native-result';}};
const context={document:{cookie:'',referrer:'',currentScript:{getAttribute:name=>name==='data-enabled'?'true':null}},navigator:{},location:{pathname:'/',search:'',hostname:'finacalleos.com'},history,
  sessionStorage:{getItem:()=>null,setItem(){}},crypto:{randomUUID:()=>body.id},fetch:()=>{calls++;return Promise.reject(Error('offline'));},URL,URLSearchParams,Date,AbortSignal,queueMicrotask:fn=>fn(),addEventListener(){}};
context.window=context;context.self=context;context.top=context;
vm.runInNewContext(script,context);assert.equal(calls,1);assert.equal(history.pushState({},'', '/'),'native-result');assert.equal(calls,1);
vm.runInNewContext(script,context);assert.equal(calls,1);
await Promise.resolve();
console.log('PASS browser network failure does not throw, navigation preserved, duplicate mounts ignored');
console.log('PASS all offline traffic boundary tests; no external IO.');
