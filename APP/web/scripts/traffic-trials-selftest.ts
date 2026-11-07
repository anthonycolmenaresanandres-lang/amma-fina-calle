// Synthetic local data/VM only. No live browser, database, provider or email.
import assert from "node:assert/strict";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { randomUUID } from "node:crypto";
import ts from "typescript";
import { PGlite } from "@electric-sql/pglite";
import * as firstParty from "../src/lib/traffic/first-party";
import * as trial from "../src/lib/traffic/trial-events";
import { ALL_TRAFFIC_SITES, siteForPublicVisit } from "../src/lib/traffic/sites";
import { __test } from "../src/lib/traffic/store";
import { assessCoverage } from "../src/lib/traffic/coverage";
import { dailyTrafficPeriod, previousCompletedWeek } from "../src/lib/traffic/date";
import { renderTrafficDeliveryReport } from "../src/lib/traffic/morning-format";
import type { TrafficReport } from "../src/lib/traffic/site-traffic";

async function main() {
  let groups = 0;
  function check(name: string, fn: () => void) { fn(); groups++; console.log(`PASS ${name}`); }
  const now = Date.now(), origin = "https://finacalleos.com";
  const input = (route: string, eventType = "pageview") => ({ id: randomUUID(), ts: now, hostname: "finacalleos.com", path: route, referrer: null, eventType });
  const gates = { trials: true, firstParty: false };
  check("exact brand routes and redirect destination attribution", () => {
    for (const [site, routes] of Object.entries(trial.TRIAL_PATHS)) {
      for (const route of [routes.menu, routes.game]) assert.equal(trial.parseCollectionEvent(input(route), origin, gates, now)?.siteId, site);
      assert.equal(trial.parseTrialEvent(input(routes.menu, "game_start"), origin, now), null);
    }
    for (const route of ["/project-seed/menu", "/el-mariachi/private", "/demo/project-seed/unknown", "/demo/bodega", "/"])
      assert.equal(trial.parseCollectionEvent(input(route), origin, gates, now), null, route);
    assert.equal(siteForPublicVisit("bodegacafe757.com", "/el-mariachi"), undefined);
    assert.equal(siteForPublicVisit("www.finacalleos.com", "/el-mariachi")?.id, "el-mariachi");
  });
  check("strict events/privacy, hostile origins, timestamps and identities rejected", () => {
    const valid = input("/el-mariachi/play", "game_start");
    for (const bad of [{...valid, siteId:"bodega"}, {...valid, visitorId:"person"}, {...valid, score:100}, {...valid,eventType:"purchase"}, {...valid,eventType:["game_start"]},
      {...valid,ts:now-300001}, {...valid,id:"not-a-uuid"}, {...valid,hostname:"evil.test"}, {...valid,path:"/el-mariachi/play?qa=1"}])
      assert.equal(trial.parseCollectionEvent(bad, origin, {...gates,firstParty:true}, now),null);
    assert.equal(trial.parseTrialEvent(valid,"https://finacalleos.com.evil.test",now),null);
    const event=trial.parseTrialEvent(valid,origin,now)!;
    assert.equal(event.visitorId,""); assert.equal(event.eventType,"game_start");
    assert.equal(trial.parseTrialEvent({...valid,path:"/el-mariachi/play?location=jacksonville"},origin,now)?.path,"/el-mariachi/play");
  });
  check("disabled gate and existing source remain separate, custom events never become pageviews", () => {
    assert.equal(trial.parseCollectionEvent(input("/demo/project-seed"),origin,{trials:false,firstParty:false},now),null);
    assert.equal(trial.parseCollectionEvent(input("/demo/project-seed"),origin,{trials:false,firstParty:true},now),null);
    assert.equal(trial.parseCollectionEvent(input("/demo/bodega"),origin,{trials:true,firstParty:true},now)?.siteId,"bodega");
    assert.equal(trial.parseCollectionEvent(input("/el-mariachi/play","game_start"),origin,{trials:false,firstParty:true},now),null);
    assert.equal(firstParty.parseFirstParty(input("/el-mariachi/play","game_start"),origin,now),null);
  });
  const db = new PGlite();
  // Exact currently observed eight-column traffic_events shape, not a migration.
  await db.exec(`CREATE TABLE traffic_events(id BIGSERIAL PRIMARY KEY,ts TIMESTAMPTZ NOT NULL,path TEXT NOT NULL,
    referrer_host TEXT,visitor_id TEXT NOT NULL,event_type TEXT NOT NULL,site_id TEXT,event_key TEXT UNIQUE)`);
  const pool = {
    query(sql: string, values?: unknown[]) { return db.query(sql,values); },
    sql(strings: TemplateStringsArray,...values: unknown[]) { return db.query(strings.reduce((text,part,index)=>text+(index?`$${index}`:"")+part,""),values); },
  };
  const store = new __test.PostgresTrafficStore("postgres://unused.test/traffic",pool as never);
  const samples = Object.values(trial.TRIAL_PATHS).flatMap(routes => [input(routes.menu),input(routes.game),input(routes.game,"game_start"),input(routes.game,"game_complete")])
    .map(body=>trial.parseTrialEvent(body,origin,now)!);
  await store.insertEvents([...samples,...samples]);
  const result=await store.getRangeReport("project-seed",now-1,now+1,"America/New_York");
  check("actual SQL deduplicates replays, separates brands and never inflates pageviews/identifiers",()=>{
    assert.equal(result.pageviews,2);assert.equal(result.uniqueVisitors,0);assert.equal(result.identifiedPageviews,0);
    assert.deepEqual(result.trialMetrics,{menuPageviews:1,gamePageviews:1,gameStarts:1,gameCompletions:1});
  });
  const other=await store.getRangeReport("el-mariachi",now-1,now+1,"America/New_York");
  assert.deepEqual(other.trialMetrics,result.trialMetrics);
  // A newer QA referrer/identifier must not change any genuine today metric.
  const genuine = {...samples[0], siteId:"el-mariachi", path:"/el-mariachi", ts:now-60000,
    referrerHost:"real.example", visitorId:"real-synthetic-id", eventId:randomUUID()};
  const qa = {...genuine, ts:now+1000, eventType:"qa_pageview", referrerHost:"qa.example", visitorId:"qa-synthetic-id", eventId:randomUUID()};
  await store.insertEvents([genuine,qa]);
  const today=await store.getTodayReport("el-mariachi","America/New_York");
  const realToday=__test.buildReport([...samples.filter(e=>e.siteId==="el-mariachi"),genuine],"el-mariachi","America/New_York",today.date);
  const qaToday=__test.buildReport([...samples.filter(e=>e.siteId==="el-mariachi"),genuine,qa],"el-mariachi","America/New_York",today.date);
  check("real SQL and file daily reports exclude newer QA referrers, identifiers and freshness",()=>{
    assert.deepEqual(qaToday,realToday);
    assert.equal(today.pageviews,realToday.pageviews);assert.equal(today.uniqueVisitors,realToday.uniqueVisitors);
    assert.equal(today.lastUpdated,realToday.lastUpdated);assert.deepEqual(today.topReferrers,realToday.topReferrers);
    const qaOnly=__test.buildReport([genuine,qa],"el-mariachi","America/New_York",today.date);
    assert.equal(qaOnly.lastUpdated,new Date(genuine.ts).toISOString());assert.equal(qaOnly.uniqueVisitors,1);
    assert.deepEqual(qaOnly.topReferrers,[{referrer:"real.example",count:1}]);
  });
  const failedStore=new __test.PostgresTrafficStore("postgres://unused.test/traffic",{...pool,query:async()=>{throw Error("Synthetic aggregate failure");}} as never);
  await assert.rejects(()=>failedStore.getRangeReport("project-seed",now-1,now+1,"America/New_York"));
  const menuOnly=await store.getRangeReport("project-seed",now-1,now+1,"America/New_York","/demo/project-seed");
  const endExcluded=await store.getRangeReport("project-seed",now-1,now,"America/New_York");
  check("path and [start,end) boundaries apply independently to all trial metrics",()=>{
    assert.deepEqual(menuOnly.trialMetrics,{menuPageviews:1,gamePageviews:0,gameStarts:0,gameCompletions:0});
    assert.equal(endExcluded.pageviews,0); assert.equal(endExcluded.trialMetrics?.gameStarts,0);
  });
  const dir=await mkdtemp(path.join(os.tmpdir(),"fc-trial-"));
  try {
    const files=new __test.FileTrafficStore(dir);await files.insertEvents([...samples,...samples]);
    assert.deepEqual((await files.getRangeReport("project-seed",now-1,now+1,"America/New_York")).trialMetrics,result.trialMetrics);
  } finally { await rm(dir,{recursive:true,force:true}); }
  check("missing coverage is waiting; recorded samples are partial, never measured-zero",()=>{
    assert.equal(assessCoverage([],new Date(now-1).toISOString(),new Date(now+1).toISOString(),0,now).state,"waiting");
    const coverage=assessCoverage([],new Date(now-1).toISOString(),new Date(now+1).toISOString(),2,now);
    assert.equal(coverage.state,"partial");assert.equal(coverage.complete,false);assert.equal(coverage.ingestionVerified,false);
  });
  // Execute actual route with an isolated in-memory store; no network or secrets.
  const routeSource=await readFile("src/app/api/traffic/pageview/route.ts","utf8");
  const routeModule={exports:{} as {POST:(request:Request)=>Promise<Response>}};
  const oldEnv={...process.env};process.env.VERCEL_ENV="production";process.env.TRAFFIC_INGESTION_SOURCE="disabled";process.env.TRAFFIC_TRIAL_COLLECTION_ENABLED="true";
  try {
    vm.runInNewContext(ts.transpileModule(routeSource,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,
      {module:routeModule,exports:routeModule.exports,require:(name:string)=>({"@/lib/traffic/first-party":firstParty,"@/lib/traffic/trial-events":trial,"@/lib/traffic/store":{getTrafficStore:()=>store}} as Record<string,unknown>)[name],process,Response,Request,URL,console});
    const post=(body: unknown,source=origin)=>routeModule.exports.POST(new Request(origin+"/api/traffic/pageview",{method:"POST",headers:{Origin:source},body:JSON.stringify(body)}));
    assert.equal((await post(input("/el-mariachi/play","game_start"))).status,204);
    process.env.TRAFFIC_INGESTION_SOURCE="first-party";
    const once=input("/el-mariachi/play","game_complete");
    assert.equal((await post(once)).status,204);assert.equal((await post(once)).status,204);
    const replayed=await store.getRangeReport("el-mariachi",now-1,Date.now()+1,"America/New_York");
    assert.equal(replayed.trialMetrics?.gameCompletions,2); // baseline + one repeated logical event
    process.env.TRAFFIC_INGESTION_SOURCE="disabled";
    assert.equal((await post(input("/demo/bodega"))).status,400);
    assert.equal((await post(input("/el-mariachi"),"https://evil.test")).status,403);
    process.env.TRAFFIC_TRIAL_COLLECTION_ENABLED="false";
    assert.equal((await post(input("/el-mariachi"))).status,202);
    process.env.TRAFFIC_TRIAL_COLLECTION_ENABLED="true";process.env.VERCEL_ENV="preview";
    assert.equal((await post(input("/el-mariachi"))).status,202);
  } finally { process.env=oldEnv; }
  groups++;console.log("PASS actual endpoint production/preview gates and trial-only scope; local SQL only");
  const calls: Array<{eventType:string;id:string;path:string}>=[];
  let enabled=true, dnt="0", query="", gpc=false, cookie="", internalStorage=false;
  const clientModule={exports:{} as {createTrialRun:()=>{start:()=>void;complete:()=>void;finished:boolean}}};
  vm.runInNewContext(ts.transpileModule(await readFile("src/lib/traffic/trial-client.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,
    {module:clientModule,exports:clientModule.exports,document:{get cookie(){return cookie;},querySelector:()=>({getAttribute:(name:string)=>name==="content"&&enabled?"enabled":null})},navigator:{get doNotTrack(){return dnt;},get globalPrivacyControl(){return gpc;}},
      sessionStorage:{getItem:()=>internalStorage?"1":null},location:{hostname:"finacalleos.com",pathname:"/play/project-seed",get search(){return query;}},crypto:{randomUUID},Date,URLSearchParams,AbortSignal,
      fetch:(_url:unknown,options:{body:string;credentials:string})=>{assert.equal(options.credentials,"omit");calls.push(JSON.parse(options.body));return Promise.resolve();}});
  const run=clientModule.exports.createTrialRun();run.complete();run.start();run.start();run.complete();run.complete();
  check("memory-only run guard handles duplicate starts/completions with distinct event IDs",()=>{
    assert.deepEqual(calls.map(c=>c.eventType),["game_start","game_complete"]);assert.notEqual(calls[0].id,calls[1].id);assert.equal(run.finished,true);
  });
  enabled=false;clientModule.exports.createTrialRun().start();enabled=true;dnt="1";clientModule.exports.createTrialRun().start();dnt="0";query="?qa=1";clientModule.exports.createTrialRun().start();
  query="";gpc=true;clientModule.exports.createTrialRun().start();gpc=false;cookie="traffic_internal=1";clientModule.exports.createTrialRun().start();cookie="";internalStorage=true;clientModule.exports.createTrialRun().start();
  assert.equal(calls.length,2);groups++;console.log("PASS disabled flag, DNT/GPC and internal QA/cookie/storage suppress game telemetry");
  const collectorSource=await readFile("public/traffic-collector.js","utf8");
  for (const scope of ["all","trials","all-no-trials"]) {
    const requests:string[]=[];
    const location={hostname:"finacalleos.com",pathname:"/demo/project-seed",search:""};
    const browserWindow:Record<string,unknown>={};browserWindow.top=browserWindow;browserWindow.self=browserWindow;
    const history={pushState(){},replaceState(){}};
    vm.runInNewContext(collectorSource,{window:browserWindow,location,history,navigator:{},document:{cookie:"",referrer:"",currentScript:{getAttribute:(name:string)=>({"data-enabled":"true","data-scope":scope,"data-trials-enabled":scope==="all-no-trials"?"false":"true"} as Record<string,string>)[name]}},
      sessionStorage:{getItem:()=>null,setItem(){}},crypto:{randomUUID},Date,URLSearchParams,URL,AbortSignal,queueMicrotask:(callback:()=>void)=>callback(),addEventListener(){},
      fetch:(_url:unknown,options:{body:string})=>{requests.push(JSON.parse(options.body).path);return Promise.resolve();}});
    if(scope==="all-no-trials") { assert.equal(requests.length,0);location.pathname="/demo/bodega";history.pushState();assert.equal(requests.length,1);continue; }
    history.replaceState();assert.equal(requests.length,1);
    location.pathname="/play/project-seed";history.pushState();assert.equal(requests.length,2);
    location.pathname="/demo/bodega";history.pushState();assert.equal(requests.length,scope==="trials"?2:3);
    location.pathname="/el-mariachi";history.pushState();assert.equal(requests.at(-1),"/el-mariachi");
    if(scope==="trials"){location.pathname="/project-seed/menu";history.pushState();assert.equal(requests.at(-1),"/el-mariachi");}
  }
  groups++;console.log("PASS one collector, SPA navigation dedupe, trial-only scope and redirect exclusion");
  const daily=dailyTrafficPeriod(Date.parse("2026-10-30T15:00:00Z")), weekly=previousCompletedWeek(Date.parse("2026-10-26T15:00:00Z"));
  const reports:TrafficReport[]=ALL_TRAFFIC_SITES.map(site=>({siteId:site.id,siteName:site.name,domains:site.domains,analyticsUrl:site.analyticsUrl,state:"partial",reason:"Unverified",
    observedPageviews:trial.isTrialSite(site.id)?2:0,identifiedPageviews:0,...(trial.isTrialSite(site.id)?{trialMetrics:result.trialMetrics}:{})}));
  const email=renderTrafficDeliveryReport([{period:daily,reports}]);
  const monday=dailyTrafficPeriod(Date.parse("2026-10-26T15:00:00Z"));
  const combined=renderTrafficDeliveryReport([{period:monday,reports},{period:weekly,reports:reports.map(report=>({...report,
    ...(report.trialMetrics?{trialMetrics:{...report.trialMetrics,gameStarts:7}}:{})}))}]);
  check("HTML/text carry separate trial metrics and unavailable/coverage caveats",()=>{
    assert(email.text.includes("game starts 1; game completions 1"));assert(email.html.includes("menu pageviews 1"));assert(email.text.includes("coverage unverified"));
    assert(email.text.includes("not people or physical QR scans"));assert(!email.html.includes("visitor_id"));assert(!email.text.includes(samples[0].eventId!));
    assert(email.text.includes("all three rounds succeed"));assert(email.text.includes("not necessarily winning"));
    assert(combined.text.includes("game starts 1"));assert(combined.text.includes("game starts 7"));assert(!combined.text.includes("game starts 8"));
    assert.notEqual(daily.range.since,weekly.range.since);
  });
  await db.close();console.log(`PASS ${groups} trial behavioral groups; synthetic offline IO only.`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
