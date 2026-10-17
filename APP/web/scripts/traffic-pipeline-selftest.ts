// Offline behavioral verification. PGlite is local/in-memory only. No live
// database, credentials, emails, or network requests are used.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { ALL_TRAFFIC_SITES, siteForPublicVisit } from "../src/lib/traffic/sites";
import { sanitizePath } from "../src/lib/traffic/sanitize";
import { parseFirstParty, AdmissionBudget, boundedText } from "../src/lib/traffic/first-party";
import { parseDrainPayload } from "../src/lib/traffic/parse-drain";
import { calendarRange, completeDays, previousEasternDay, previousCompletedWeek, scheduledTrafficPeriods } from "../src/lib/traffic/date";
import { assessCoverage } from "../src/lib/traffic/coverage";
import { __test } from "../src/lib/traffic/store";
import type { CollectionCheck, NormalizedEvent } from "../src/lib/traffic/types";

async function main() {
let checks = 0;
function check(name: string, fn: () => void) { fn(); checks++; console.log(`PASS ${name}`); }
const now = Date.parse("2026-10-17T16:00:00Z");
const id = "89c4b568-4138-49d9-84b2-58111abc5678";
check("every registered brand hostname/path is independently attributed", () => {
  for (const site of ALL_TRAFFIC_SITES) {
    for (const host of site.domains) for (const path of site.publicPaths) {
      if (site.id === "bodega" && host.includes("finacalleos") && path === "/") continue;
      assert.equal(siteForPublicVisit(host, path)?.id, site.id, `${host}${path}`);
    }
  }
});
check("every AMMA mapping has an actual source route; concepts are explicitly labeled", () => {
  for (const site of ALL_TRAFFIC_SITES.filter(site=>site.id!=="colattao")) {
    for (const route of site.publicPaths) {
      const part=route.replace(/^\//,"");
      const candidates=route.includes("/:table") ? ["src/app/(internal)/table/[venueId]/[tableId]/page.tsx"] :
        route==="/news/:article" ? ["src/app/news/[slug]/page.tsx"] :
        [path.join("public",part),path.join("src/app",part,"page.tsx"),path.join("src/app",part,"route.ts"),path.join("src/app/(internal)",part,"page.tsx")];
      assert(candidates.some(file=>existsSync(file) && statSync(file).isFile()),`${site.id}: ${route}`);
    }
    if (!["bodega","fina-calle","fina-experiences"].includes(site.id)) assert.equal(site.kind,"concept");
  }
  assert.equal(siteForPublicVisit("finacalleos.com","/pilot/las-palmas"),undefined);
  assert.equal(siteForPublicVisit("finacalleos.com","/news/private/nested"),undefined);
});
check("shared roots and hosted menus stay separated", () => {
  assert.equal(siteForPublicVisit("finacalleos.com", "/")?.id, "fina-calle");
  assert.equal(siteForPublicVisit("bodegacafe757.com", "/")?.id, "bodega");
  assert.equal(siteForPublicVisit("finacalleos.com", "/demo/project-seed")?.id, "project-seed");
  assert.equal(siteForPublicVisit("colattao-cafe-rush.vercel.app", "/menu")?.id, "colattao");
});
check("preview/unknown hosts, private routes, internal tests and hostile paths rejected", () => {
  for (const host of ["unknown.test", "amma-fina-calle.vercel.app", "colattao-cafe-rush-abc.vercel.app", "finacalleos.com.evil.test"]) assert.equal(siteForPublicVisit(host,"/"), undefined);
  for (const path of ["/customers/traffic", "/owner/a", "/API/x", "/auth/callback", "/%61pi/x", "/demo/unknown", "/../", "/%252e%252e", "/\\secret", "/?traffic_test=1", "/?qa=1", "/demo/project-seed?internal_test=1"]) assert.equal(siteForPublicVisit("finacalleos.com",path), undefined, path);
  assert.equal(sanitizePath("/table/maracaibo/12"), "/table/maracaibo/:table");
  assert.equal(sanitizePath("/contact?email=private@example.com#token"), "/contact");
});
const event = parseFirstParty({id,ts:now,hostname:"finacalleos.com",path:"/demo/project-seed",email:"do-not-store@example.test"},"https://finacalleos.com",now)!;
check("first-party trusts validated origin/path and stores no user identity", () => {
  assert.equal(event.siteId,"project-seed"); assert.equal(event.visitorId,""); assert.equal(event.eventId,id);
  assert(!JSON.stringify(event).includes("do-not-store"));
  for (const patch of [{hostname:"bodegacafe757.com"},{siteId:"bodega"},{site_id:"bodega"},{internal:true},{ts:now-300001},{ts:now+60001},{id:"invalid"},{path:"/owner/private"}]) {
    assert.equal(parseFirstParty({id,ts:now,hostname:"finacalleos.com",path:"/",...patch},"https://finacalleos.com",now),null);
  }
});
check("drain identifiers are scoped by site and type; missing IDs still yield pageviews", () => {
  const raw = {schema:"vercel.analytics.v2",eventType:"pageview",projectId:ALL_TRAFFIC_SITES[0].projectId,vercelEnvironment:"production",timestamp:now,path:"/",deviceId:123};
  const rows = parseDrainPayload(JSON.stringify([{...raw,origin:"https://finacalleos.com"},{...raw,origin:"https://bodegacafe757.com"}]),now);
  assert.equal(rows.length,2); assert.notEqual(rows[0].visitorId,rows[1].visitorId); assert(!rows[0].visitorId.includes("123"));
  assert.equal(parseDrainPayload(JSON.stringify([{...raw,deviceId:undefined,origin:"https://finacalleos.com"}]),now)[0].visitorId,"");
  assert.equal(parseDrainPayload(JSON.stringify([{...raw,requestHostname:"bodegacafe757.com",origin:"https://finacalleos.com"}]),now).length,0);
});
check("Eastern calendar boundaries, DST and immediately after midnight", () => {
  const range = completeDays(30,now);
  assert.equal(range.since,"2026-09-17T04:00:00.000Z"); assert.equal(range.until,"2026-10-17T04:00:00.000Z");
  for (const [day,hours] of [["2026-03-08",23],["2026-11-01",25]] as const) {
    const interval = calendarRange(day,day); assert.equal((Date.parse(interval.until)-Date.parse(interval.since))/3600000,hours);
  }
  assert.equal(previousEasternDay(Date.parse("2026-11-02T05:10:00Z")).date,"2026-11-01");
  assert.throws(()=>calendarRange("2026-02-30","2026-03-01"));
  assert.throws(()=>calendarRange("2026-10-02","2026-10-01"));
  assert.throws(()=>calendarRange("2026-01-01","2026-04-01"));
  assert.throws(()=>calendarRange("2026-10-04","2026-10-04","Australia/Sydney"),/UNSUPPORTED_TRAFFIC_TIMEZONE/);
  assert.throws(()=>completeDays(30,now,"UTC"),/UNSUPPORTED_TRAFFIC_TIMEZONE/);
});
const a = now-900000, b=now;
const full:CollectionCheck[]=[{start:new Date(a).toISOString(),end:new Date(b).toISOString(),checkedAt:new Date(b).toISOString(),healthy:true}];
check("configuration checks never prove complete coverage or measured zero",()=>{
  assert.equal(assessCoverage([],new Date(a).toISOString(),new Date(b).toISOString(),0,now).state,"waiting");
  assert.equal(assessCoverage([],new Date(a).toISOString(),new Date(b).toISOString(),3,now).state,"partial");
  assert.equal(assessCoverage(full,full[0].start,full[0].end,0,now).state,"partial");
  assert.equal(assessCoverage(full,full[0].start,full[0].end,3,now).state,"partial");
  assert.equal(assessCoverage(full,full[0].start,full[0].end,0,now).complete,false);
  assert.equal(assessCoverage(full,full[0].start,full[0].end,0,now).ingestionVerified,false);
  assert.equal(assessCoverage(full,full[0].start,full[0].end,0,now).collectionStart,null);
  assert.equal(assessCoverage(full,new Date(a-900000).toISOString(),full[0].end,0,now+3600000).state,"stale");
  assert.equal(assessCoverage([{...full[0],healthy:false}],full[0].start,full[0].end,0,now).state,"stale");
  assert.equal(assessCoverage(full,new Date(a-1).toISOString(),full[0].end,0,now).complete,false);
});
check("per-instance admission limits reset without retaining personal data",()=>{
  const budget=new AdmissionBudget(); for(let i=0;i<120;i++) assert(budget.allow("bodega",now));
  assert(!budget.allow("bodega",now)); assert(budget.allow("bodega",now+60000));
});
await assert.rejects(()=>boundedText(new Request("https://finacalleos.com/api/traffic/pageview",{method:"POST",body:"x".repeat(2049)})));
checks++;

// Exercise the actual SQL against a local in-memory PostgreSQL implementation.
const db = new PGlite();
await db.exec(await readFile("traffic/migrations/001_dedicated_traffic.sql","utf8"));
const statements:string[]=[];
const pool = {
  async query(sql:string, values?:unknown[]) { statements.push(sql); return db.query(sql,values); },
  async sql(strings:TemplateStringsArray,...values:unknown[]) {
    const sql = strings.reduce((text,part,index)=>text+(index ? `$${index}`:"")+part,"");
    statements.push(sql); return db.query(sql,values);
  },
};
const store = new __test.PostgresTrafficStore("postgres://unused.test/traffic",pool as never);
await store.getRangeReport("bodega",now-1000,now+1000,"America/New_York");
await store.getObservationWindow("bodega");
await store.getCollectionChecks("bodega",now-1000,now+1000);
check("all first-read database statements are SELECT-only",()=>{assert(statements.length>0);assert(statements.every(sql=>/^\s*(SELECT|WITH)\b/i.test(sql) && !/\b(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|GRANT|REVOKE)\b/i.test(sql)));});
statements.length=0;
const base:NormalizedEvent={siteId:"bodega",ts:now,path:"/",referrerHost:null,visitorId:"same-device",eventType:"pageview"};
await store.insertEvents([base,base,{...base,ts:now+86400000},{...base,ts:now+86400000,visitorId:""},{...base,siteId:"colattao"}]);
await store.insertEvents([event,event]);
const range=await store.getRangeReport("bodega",now,now+2*86400000,"America/New_York");
check("SQL deduplicates retries and computes whole-period distinct, never daily sum",()=>{
  assert.equal(range.pageviews,3);assert.equal(range.uniqueVisitors,1);assert.equal(range.identifiedPageviews,2);
  assert.equal(range.daily.reduce((total,row)=>total+row.visitors,0),2);
});
check("range start inclusive, end exclusive, site isolation, anonymous events not fake visitors",()=>{
  assert.equal(range.siteId,"bodega");
  assert.equal((__test.buildRangeReport([event,event],"project-seed","America/New_York")).pageviews,1);
  assert.equal((__test.buildRangeReport([event],"project-seed","America/New_York")).uniqueVisitors,0);
});
const endOnly=await store.getRangeReport("bodega",now,now+86400000,"America/New_York");assert.equal(endOnly.pageviews,1);
const seed=await store.getRangeReport("project-seed",now-1,now+1,"America/New_York");assert.equal(seed.pageviews,1);assert.equal(seed.uniqueVisitors,0);
await store.recordCollectionProbe("bodega",true,now);
await store.recordCollectionProbe("bodega",false,now+300000);
await store.recordCollectionProbe("bodega",true,now+600000);
await store.recordCollectionProbe("bodega",true,now+900000);
const monitorChecks=(await db.query<{healthy:boolean;probe_ok:boolean}>("SELECT healthy, probe_ok FROM traffic_collection_checks WHERE site_id = 'bodega' ORDER BY checked_at")).rows;
check("monitor failure creates a gap and recovers after successive good probes",()=>{
  assert.deepEqual(monitorChecks.map(check=>check.healthy),[true,false,false,true]);
  assert.deepEqual(monitorChecks.map(check=>check.probe_ok),[true,false,true,true]);
});
const bulkStart=now-90*86400000;
await db.query(`INSERT INTO traffic_collection_checks(site_id,start_at,end_at,checked_at,healthy,probe_ok)
  SELECT 'project-seed',to_timestamp($1::double precision/1000+n*300),
    to_timestamp($1::double precision/1000+(n+1)*300),to_timestamp($1::double precision/1000+(n+1)*300),true,true
  FROM generate_series(0,25919) AS n`,[bulkStart]);
const highVolume=await store.getCollectionChecks("project-seed",bulkStart,now);
const shortHistorical=await store.getCollectionChecks("project-seed",bulkStart,bulkStart+300000);
check("25920 checks aggregate without truncation and latest freshness is independent of interval",()=>{
  assert.equal(highVolume.length,2);assert.equal(highVolume[0].checksInRange,25920);
  assert.equal(highVolume.at(-1)?.checkedAt,new Date(now).toISOString());
  assert.equal(shortHistorical[0].checksInRange,1);
  assert.equal(shortHistorical.at(-1)?.checkedAt,new Date(now).toISOString());
  const assessment=assessCoverage(highVolume,new Date(bulkStart).toISOString(),new Date(now).toISOString(),0,now);
  assert.equal(assessment.configurationChecksInRange,25920);assert.equal(assessment.fresh,true);
  assert.equal(assessment.complete,false);assert.equal(assessment.state,"partial");
});
await store.recordCollectionProbe("project-seed",false,now+300000);
const failedLatest=await store.getCollectionChecks("project-seed",bulkStart,now+300000);
check("latest failure does not hide the independent most recent successful probe",()=>{
  const assessment=assessCoverage(failedLatest,new Date(bulkStart).toISOString(),new Date(now+300000).toISOString(),0,now+300000);
  assert.equal(assessment.checkedAt,new Date(now+300000).toISOString());
  assert.equal(assessment.lastSuccessfulCheck,new Date(now).toISOString());
  assert.equal(assessment.configurationChecksInRange,25921);
  assert.equal(assessment.state,"stale");assert.equal(assessment.complete,false);
});


check("daily plus weekly Mondays, daily cutoff, DST slots and completed weeks",()=>{
  const plan=(date:string,slot="0 12 * * *")=>scheduledTrafficPeriods(slot,Date.parse(date));
  assert.equal(plan("2026-10-17T12:00:00Z"),null);
  for(let day=18;day<=31;day++){
    const date="2026-10-"+day, instant=date+"T12:05:00Z";
    const periods=plan(instant)!;assert(periods);
    assert.deepEqual(periods.map(p=>p.kind),[19,26].includes(day)?["daily","weekly"]:["daily"]);
    assert.equal(periods[0].last,new Date(Date.parse(date+"T00:00:00Z")-86400000).toISOString().slice(0,10));
  }
  const oct19=plan("2026-10-19T12:00:00Z")!;
  assert.equal(oct19[0].first,"2026-10-18");
  assert.equal(oct19[1].first,"2026-10-12");assert.equal(oct19[1].last,"2026-10-18");
  const oct26=plan("2026-10-26T12:00:00Z")!;
  assert.equal(oct26[0].first,"2026-10-25");
  assert.equal(oct26[1].first,"2026-10-19");assert.equal(oct26[1].last,"2026-10-25");
  assert.equal(plan("2026-10-19T13:00:00Z"),null);
  assert.equal(plan("2026-10-19T12:05:00Z","0 13 * * *"),null);
  assert.equal(plan("2026-11-01T13:00:00Z","0 13 * * *"),null);
  assert.equal(plan("2026-11-02T12:00:00Z"),null);
  const november=plan("2026-11-02T13:00:00Z","0 13 * * *")!;
  assert.deepEqual(november.map(p=>p.kind),["weekly"]);
  const autumn=november[0];
  assert.equal(autumn.first,"2026-10-26");assert.equal(autumn.last,"2026-11-01");
  assert.equal((Date.parse(autumn.range.until)-Date.parse(autumn.range.since))/3600000,169);
  assert.equal(plan("2026-11-02T13:00:00Z","0 12 * * *"),null);
  assert.equal(plan("2026-11-03T13:00:00Z","0 13 * * *"),null);
  const spring=plan("2027-03-15T12:00:00Z")!;assert.deepEqual(spring.map(p=>p.kind),["weekly"]);
  assert.equal((Date.parse(spring[0].range.until)-Date.parse(spring[0].range.since))/3600000,167);
  const year=previousCompletedWeek(Date.parse("2027-01-04T13:00:00Z"));
  assert.equal(year.first,"2026-12-28");assert.equal(year.last,"2027-01-03");
});
const week=previousCompletedWeek(Date.parse("2026-10-19T12:00:00Z"));
const weeklyRows=await store.getRangeReport("bodega",Date.parse(week.range.since),Date.parse(week.range.until),"America/New_York");
check("weekly SQL is independent of daily identifier sums",()=>{
  assert.equal(weeklyRows.pageviews,3);assert.equal(weeklyRows.uniqueVisitors,1);
  assert.equal(weeklyRows.daily.reduce((sum,row)=>sum+row.visitors,0),2);
});
// Optional health schemas may be absent or older. Neither requires a migration
// for aggregate reads of the existing eight-column event table.
await db.exec("ALTER TABLE traffic_collection_checks DROP COLUMN probe_ok");
assert.deepEqual(await store.getCollectionChecks("bodega",now-1,now+1),[]);
await db.exec("DROP TABLE traffic_collection_checks");
const legacyStatementsStart=statements.length;
assert.deepEqual(await store.getCollectionChecks("bodega",now-1,now+1),[]);
const legacyReport=await store.getRangeReport("bodega",now,now+2*86400000,"America/New_York");
const columns=(await db.query<{count:number}>("SELECT count(*)::int AS count FROM information_schema.columns WHERE table_name='traffic_events'")).rows[0].count;
check("existing eight-column events readable without health schema or migration",()=>{
  assert.equal(columns,8);assert.equal(legacyReport.pageviews,3);
  assert(statements.slice(legacyStatementsStart).every(sql=>/^\s*(SELECT|WITH)\b/i.test(sql)));
  assert.equal(assessCoverage([],week.range.since,week.range.until,3,now).state,"partial");
  assert.equal(assessCoverage([],week.range.since,week.range.until,0,now).state,"waiting");
});

await db.close();
console.log(`PASS ${checks} traffic pipeline behavioral groups; no live services accessed.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
