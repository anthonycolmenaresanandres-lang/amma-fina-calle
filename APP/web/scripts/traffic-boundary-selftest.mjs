// Offline route, delivery and browser failure tests. All IO is mocked.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import path from 'node:path';
import ts from 'typescript';
function load(file, imports, env={}, fetch=async()=>{throw Error('Unexpected network');}, clock=Date) {
  const exports={};
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
  vm.runInNewContext(code,{exports,process:{env},Buffer,URL,URLSearchParams,Response,Request,TextDecoder,Uint8Array,AbortSignal,Date:clock,fetch,
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
assert.equal(poolCreations,1);assert.equal(readStatements.length,6);assert(readStatements.every(sql=>/^\s*(SELECT|WITH)\b/i.test(sql) && !/\b(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|GRANT|REVOKE)\b/i.test(sql)));
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
const unsupported=await reportRoute.GET(new Request(reportURL+'&timezone=Australia%2FSydney',{headers:{Authorization:'Bearer fixture-report-token'}}));
assert.equal(unsupported.status,400);assert.equal((await unsupported.json()).reason,'unsupported_timezone');
console.log('PASS protected connector-readable calendar report, unavailable data remains unavailable');

// Configuration success must remain unverified even when the independent
// collector resource is missing or an event INSERT fails. All IO is mocked.
for (const failure of ['collector-404','event-insert-fails']) {
  const fixtureNow=Date.now();
  const fixtureRange={since:new Date(fixtureNow-60000).toISOString(),until:new Date(fixtureNow).toISOString()};
  const fixtureChecks=[{start:fixtureRange.since,end:fixtureRange.until,checkedAt:fixtureRange.until,healthy:true,probeHealthy:true}];
  const fixtureStore={
    async insertEvents(){if(failure==='event-insert-fails')throw Error('fixture INSERT failure');},
    async recordCollectionProbe(){},
    async getRangeReport(){return {pageviews:0,uniqueVisitors:0,daily:[],topPaths:[],topReferrers:[],lastUpdated:null};},
    async getObservationWindow(){return {firstObservedAt:null,lastObservedAt:null};},
    async getCollectionChecks(){return fixtureChecks;},
  };
  const fixtureImports={getTrafficStore:()=>fixtureStore,trafficDatabaseUrl:()=> 'configured-fixture'};
  const fixtureEnv={VERCEL_ENV:'production',TRAFFIC_INGESTION_SOURCE:'first-party',TRAFFIC_HEALTH_RECORD_ENABLED:'true',CRON_SECRET:'fixture-cron'};
  const fixtureHealth=load('src/app/api/internal/traffic/health/route.ts',{'../report/route':reportRoute,'node:crypto':crypto,'@/lib/traffic/sites':registry,'@/lib/traffic/store':fixtureImports,'@/lib/traffic/first-party':{activeSource:()=> 'first-party'}},fixtureEnv,
    async url=>String(url).endsWith('/traffic-collector.js') ? new Response(null,{status:404}) : new Response('<meta name="fc-traffic-collector" content="first-party-v1">',{status:200}));
  if(failure==='event-insert-fails'){
    const fixtureCollector=load('src/app/api/traffic/pageview/route.ts',{'@/lib/traffic/first-party':first,'@/lib/traffic/store':fixtureImports},fixtureEnv);
    env.TRAFFIC_INGESTION_SOURCE='first-party';
    assert.equal((await fixtureCollector.POST(request())).status,503);
  }
  const probe=await fixtureHealth.POST(new Request('https://finacalleos.com/api/internal/traffic/health',{method:'POST',headers:{Authorization:'Bearer fixture-cron'}}));
  assert.equal(probe.status,200);const probeResult=await probe.json();
  assert(probeResult.checks.every(check=>check.healthy && check.evidence==='configuration-only'));
  assert.equal(probeResult.ingestionVerified,false);
  const fixtureService=load('src/lib/traffic/site-traffic.ts',{'server-only':{},'./date':dates,'./coverage':coverage,'./sites':registry,'./store':fixtureImports},fixtureEnv);
  const uncertain=await fixtureService.getSiteTrafficReport(registry.ALL_TRAFFIC_SITES[0],fixtureRange);
  assert.equal(uncertain.state,'partial',failure);assert.equal(uncertain.coverage.complete,false);
  assert.equal(uncertain.coverage.ingestionVerified,false);assert.equal(uncertain.observedPageviews,0);
}
console.log('PASS healthy pages plus collector 404 or event INSERT failure cannot establish coverage or measured zero');

const formatter=load('src/lib/traffic/morning-format.ts',{'./sites':registry,'./date':dates});
let sent=0;const deliveries=[];
const mailEnv={VERCEL_ENV:'production',TRAFFIC_RESEND_API_KEY:'fixture',TRAFFIC_FROM_EMAIL:'Traffic <reports@finacalleos.com>',TRAFFIC_MORNING_REPORT_EMAIL:'anthonycolmenaresanandres@gmail.com',TRAFFIC_EMAIL_TEST_ENABLED:'true'};
const mail=load('src/lib/traffic/morning-email.ts',{'server-only':{},'./morning-format':formatter},mailEnv,async(url,options)=>{sent++;deliveries.push({url,options});return new Response(null,{status:200});});
const period=dates.dailyTrafficPeriod(Date.parse('2026-10-17T12:00:00Z'));
assert.equal((await mail.sendTrafficPeriodReport(period,result.reports,'test')).reason,'email_delivery_disabled');assert.equal(sent,0);
mailEnv.TRAFFIC_EMAIL_ENABLED='true';mailEnv.TRAFFIC_MORNING_REPORT_EMAIL='somebody@example.test';
assert.equal((await mail.sendTrafficPeriodReport(period,result.reports,'test')).reason,'invalid_report_recipient');assert.equal(sent,0);
mailEnv.TRAFFIC_MORNING_REPORT_EMAIL='anthonycolmenaresanandres@gmail.com';
mailEnv.TRAFFIC_FROM_EMAIL='reports@otherdomain.test';
assert.equal((await mail.sendTrafficPeriodReport(period,result.reports,'test')).reason,'invalid_report_sender');assert.equal(sent,0);
mailEnv.TRAFFIC_FROM_EMAIL='Traffic <reports@finacalleos.com>';
assert.equal((await mail.sendTrafficPeriodReport(period,result.reports,'test')).sent,true);assert.equal(sent,1);
const delivery=JSON.parse(deliveries[0].options.body);assert.deepEqual(delivery.to,['anthonycolmenaresanandres@gmail.com']);
assert(delivery.text.includes('unavailable'));assert(!delivery.text.includes('Pageviews: 0'));
assert.equal(deliveries[0].options.headers['Idempotency-Key'],'fina-calle-traffic-daily-2026-10-16-2026-10-16');
assert.equal(deliveries[0].options.redirect,'error');
assert.equal((await mail.sendTrafficPeriodReport(period,result.reports,'scheduled')).reason,'schedule_disabled_until_test_readback');
mailEnv.VERCEL_ENV='preview';assert.equal((await mail.sendTrafficPeriodReport(period,result.reports,'test')).reason,'email_delivery_disabled');assert.equal(sent,1);
assert.equal(mail.morningEmailStatus().enabled,false);
mailEnv.VERCEL_ENV='production';
for (const outcome of ['timeout',409,429,500]) {
  let attempts=0;
  const failureMail=load('src/lib/traffic/morning-email.ts',{'server-only':{},'./morning-format':formatter},mailEnv,async()=>{
    attempts++;if(outcome==='timeout')throw Error('unknown delivery outcome');
    return new Response("sensitive-provider-fixture",{status:outcome});
  });
  const failure=await failureMail.sendTrafficPeriodReport(period,result.reports,'test');
  assert.equal(failure.sent,false);assert.equal(attempts,1);assert(!JSON.stringify(failure).includes("sensitive-provider-fixture"));
  if(outcome==='timeout'||outcome===409)assert.equal(failure.reason,'delivery_outcome_unconfirmed');
}
console.log('PASS fixed recipient/verified sender, provider idempotency, one attempt and uncertain-outcome retry suppression');


const combinedPeriods=dates.scheduledTrafficPeriods('0 12 * * *',Date.parse('2026-10-19T12:00:00Z'));
const combinedBundles=combinedPeriods.map((period,index)=>({period,reports:result.reports.map(r=>({...r,state:'partial',reason:'Unverified coverage',observedPageviews:index?23:7,observedIdentifiers:index?4:2,identifiedPageviews:10,visitor_id:'do-not-output-raw-id'}))}));
mailEnv.TRAFFIC_SCHEDULE_ENABLED='true';mailEnv.TRAFFIC_EMAIL_TEST_READBACK_CONFIRMED='true';
const beforeCombined=sent;
assert.equal((await mail.sendTrafficDeliveryReport(combinedBundles,'scheduled')).sent,true);
assert.equal(sent,beforeCombined+1);
const combinedDelivery=deliveries.at(-1),combinedContent=JSON.parse(combinedDelivery.options.body);
assert(combinedContent.text.includes('Yesterday 2026-10-18'));assert(combinedContent.text.includes('Week 2026-10-12 through 2026-10-18'));
assert(combinedContent.text.includes('7 recorded pageviews; 2 tracked identifiers'));
assert(combinedContent.text.includes('23 recorded pageviews; 4 tracked identifiers'));
assert(!combinedContent.text.includes('do-not-output-raw-id'));
assert(!combinedContent.text.includes('30 recorded pageviews'));
assert.equal(combinedDelivery.options.headers['Idempotency-Key'],'fina-calle-traffic-daily-2026-10-18-2026-10-18-and-weekly-2026-10-12-2026-10-18');
assert.throws(()=>formatter.renderTrafficDeliveryReport([combinedBundles[1],combinedBundles[0]]),/INVALID_DELIVERY_PERIODS/);
assert.throws(()=>formatter.renderTrafficDeliveryReport([...combinedBundles,combinedBundles[0]]),/INVALID_DELIVERY_PERIODS/);
console.log('PASS one provider attempt and stable combined-period key; independent daily/weekly values remain distinct and raw IDs omitted');


sent=0;
const morningEnv={VERCEL_ENV:'preview',CRON_SECRET:'global-cron-fixture',TRAFFIC_MAIL_TRIGGER_SECRET:'mail-only-fixture-token-at-least-32-characters',TRAFFIC_EMAIL_ENABLED:'true'};
let fixtureNow=Date.parse('2026-10-19T12:05:00Z');
class FixtureDate extends Date { static now(){return fixtureNow;} }
let queried=0;const queriedPeriods=[],mailBatches=[];
const morning=load('src/app/api/internal/traffic/morning/route.ts',{'node:crypto':crypto,'next/server':next,'@/lib/traffic/date':dates,
  '@/lib/admin/auth':{getAdminContext:async()=>({state:'authorized'})},
  '@/lib/traffic/morning-email':{morningEmailStatus:()=>({configured:true,enabled:true}),sendTrafficDeliveryReport:async bundles=>{sent++;mailBatches.push(bundles);return {sent:true};}},
  '@/lib/traffic/site-traffic':{getMorningTrafficReports:async()=>({date:'2026-10-18',reports:result.reports}),
    getTrafficPeriodReports:async p=>{queried++;queriedPeriods.push(p);return result.reports.map(r=>({...r,state:'partial',reason:'Unverified coverage'}));}}},
  morningEnv,undefined,FixtureDate);
const morningURL='https://finacalleos.com/api/internal/traffic/morning';
const morningRequest=(body={mode:'test'},token=morningEnv.TRAFFIC_MAIL_TRIGGER_SECRET,url=morningURL)=>new Request(url,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)});
const preview=await morning.GET();assert.equal(preview.status,200);assert.equal((await preview.json()).readyToSend,false);assert.equal(sent,0);
assert.equal((await morning.POST(morningRequest())).status,503);assert.equal(sent,0);
morningEnv.VERCEL_ENV='production';
assert.equal((await morning.POST(morningRequest({},'global-cron-fixture'))).status,401);
assert.equal((await morning.POST(morningRequest({},'fixture-report-token'))).status,401);
assert.equal((await morning.POST(morningRequest({mode:'test',to:'somebody@example.test'}))).status,400);
assert.equal((await morning.POST(morningRequest({mode:'test',sql:'SELECT *'}))).status,400);
assert.equal((await morning.POST(morningRequest({mode:'test'},undefined,morningURL+'?to=other'))).status,400);
assert.equal((await morning.POST(morningRequest({mode:'test',padding:'x'.repeat(300)}))).status,400);
assert.equal((await morning.POST(morningRequest())).status,503);assert.equal(sent,0);assert.equal(queried,0);
morningEnv.TRAFFIC_EMAIL_TEST_ENABLED='true';
assert.equal((await morning.POST(morningRequest())).status,200);assert.equal(sent,1);
assert.equal(queriedPeriods[0].kind,'daily');assert.equal(queriedPeriods[0].first,'2026-10-18');
assert.equal((await morning.POST(morningRequest({mode:'scheduled',schedule:'0 12 * * *'}))).status,503);
morningEnv.TRAFFIC_SCHEDULE_ENABLED='true';
assert.equal((await morning.POST(morningRequest({mode:'scheduled',schedule:'0 12 * * *'}))).status,503);assert.equal(sent,1);
morningEnv.TRAFFIC_EMAIL_TEST_READBACK_CONFIRMED='true';
const october19=await morning.POST(morningRequest({mode:'scheduled',schedule:'0 12 * * *'}));
assert.equal(october19.status,200);assert.equal(sent,2);assert.equal(queried,3);
assert.deepEqual((await october19.json()).periods,[
  {kind:'daily',first:'2026-10-18',last:'2026-10-18'},
  {kind:'weekly',first:'2026-10-12',last:'2026-10-18'},
]);
assert.equal(mailBatches[1].length,2);
assert.equal(queriedPeriods[1].kind,'daily');assert.equal(queriedPeriods[2].kind,'weekly');
const wrongSlot=await morning.POST(morningRequest({mode:'scheduled',schedule:'0 13 * * *'}));
assert.equal((await wrongSlot.json()).skipped,true);assert.equal(sent,2);assert.equal(queried,3);
fixtureNow=Date.parse('2026-10-26T12:05:00Z');
const october26=await morning.POST(morningRequest({mode:'scheduled',schedule:'0 12 * * *'}));
assert.equal(sent,3);assert.equal(queried,5);
assert.deepEqual((await october26.json()).periods,[
  {kind:'daily',first:'2026-10-25',last:'2026-10-25'},
  {kind:'weekly',first:'2026-10-19',last:'2026-10-25'},
]);
fixtureNow=Date.parse('2026-11-02T13:05:00Z');
const november2=await morning.POST(morningRequest({mode:'scheduled',schedule:'0 13 * * *'}));
assert.equal(sent,4);assert.equal(queried,6);
assert.deepEqual((await november2.json()).periods,[{kind:'weekly',first:'2026-10-26',last:'2026-11-01'}]);
assert.equal(mailBatches[3].length,1);
fixtureNow=Date.parse('2026-11-03T13:05:00Z');
assert.equal((await (await morning.POST(morningRequest({mode:'scheduled',schedule:'0 13 * * *'}))).json()).skipped,true);assert.equal(sent,4);
assert(!JSON.parse(fs.readFileSync('vercel.json','utf8')).crons.some(cron=>cron.path.includes('/traffic/')));
const workflow=fs.readFileSync('../../.github/workflows/traffic-report-mail.yml','utf8');
assert(workflow.includes("vars.TRAFFIC_REPORT_SCHEDULE_ENABLED == 'true'"));assert(workflow.includes("vars.TRAFFIC_REPORT_TEST_ENABLED == 'true'"));
assert(workflow.includes('cancel-in-progress: false'));assert(!workflow.includes('CRON_SECRET'));assert(!workflow.includes('TRAFFIC_RESEND_API_KEY'));
const {triggerMail}=await import('./traffic-mail-trigger.mjs');
let triggerAttempts=0;
await assert.rejects(()=>triggerMail({TRAFFIC_MAIL_TRIGGER_SECRET:morningEnv.TRAFFIC_MAIL_TRIGGER_SECRET,TRAFFIC_MAIL_MODE:'test'},async(url,options)=>{
  triggerAttempts++;assert.equal(url,morningURL);assert.equal(JSON.parse(options.body).mode,'test');throw Error('timeout fixture');
}));
assert.equal(triggerAttempts,1);
console.log('PASS combined Monday uses two independent queries and one send; November weekly only; restricted gates remain disabled');

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
