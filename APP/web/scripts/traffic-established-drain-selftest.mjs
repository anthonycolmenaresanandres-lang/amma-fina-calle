
// Offline continuity proof for the established production drain. Frozen source
// hashes plus actual SQL in in-memory PGlite; no production payloads or network.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import ts from 'typescript';
import { PGlite } from '@electric-sql/pglite';

const root='src/lib/traffic/established-drain/';
const manifest=JSON.parse(fs.readFileSync('traffic/established-drain-baseline.json','utf8'));
for(const [name,expected] of Object.entries(manifest.files)){
  const source=fs.readFileSync(root+name,'utf8').replaceAll('\r\n','\n');
  assert.equal(crypto.createHash('sha256').update(source).digest('hex'),expected,name);
}
let oldRoute=fs.readFileSync('src/app/api/traffic/drain/route.ts','utf8').replaceAll('\r\n','\n')
  .replaceAll('@/lib/traffic/established-drain/','@/lib/traffic/')
  .replace('  // Keep the established production feed independent of new collector/mail gates.\n  if (process.env.VERCEL_ENV !== "production") return new Response(null, { status: 202 });\n','')
  .replace('} catch {','} catch (error) {')
  .replace('console.error("[traffic/drain] store unavailable");','console.error("[traffic/drain] store error:", error instanceof Error ? error.message : error);');
assert.equal(crypto.createHash('sha1').update(`blob ${Buffer.byteLength(oldRoute)}\0`).update(oldRoute).digest('hex'),manifest.routeBlob);
console.log('PASS established drain dependencies match production hashes; route differs only in isolated imports, preview block and error redaction');

const errors=[];
function load(file,imports,env={}){
  const exports={};
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
  vm.runInNewContext(code,{exports,process:{env},Buffer,Date,URL,Response,Request,TextDecoder,Uint8Array,
    console:{info(){},error(...args){errors.push(args.join(' '));}},
    require(name){if(!(name in imports))throw Error('Unexpected import: '+name);return imports[name];},
  },{filename:file});
  return exports;
}
const legacyEnv={VERCEL_ENV:'production',TRAFFIC_DATABASE_DATABASE_URL:'postgres://synthetic.test/traffic',TRAFFIC_DRAIN_SECRET:'fixture-established-drain',TRAFFIC_HEALTH_RECORD_ENABLED:'false',TRAFFIC_EMAIL_ENABLED:'false'};
const legacyDates=load(root+'date.ts',{});
const legacySanitize=load(root+'sanitize.ts',{});
const legacySites=load(root+'sites.ts',{});
const legacySignature=load(root+'signature.ts',{'node:crypto':crypto});
const legacyParser=load(root+'parse-drain.ts',{'./sanitize':legacySanitize,'./sites':legacySites});
const db=new PGlite();
await db.exec(`CREATE TABLE traffic_events(
  id BIGSERIAL PRIMARY KEY,ts TIMESTAMPTZ NOT NULL,path TEXT NOT NULL,referrer_host TEXT,
  visitor_id TEXT NOT NULL,event_type TEXT NOT NULL,site_id TEXT,event_key TEXT);
  CREATE INDEX traffic_events_ts_idx ON traffic_events(ts);
  CREATE INDEX traffic_events_site_ts_idx ON traffic_events(site_id,ts);
  CREATE UNIQUE INDEX traffic_events_event_key_idx ON traffic_events(event_key);`);
const schemaQuery=`SELECT column_name,data_type FROM information_schema.columns WHERE table_name='traffic_events' ORDER BY ordinal_position`;
const originalSchema=(await db.query(schemaQuery)).rows;
const statements=[],poolOptions=[];
let failInsert=false;
const pool={
  async sql(strings,...values){
    const sql=strings.reduce((text,part,index)=>text+(index?`$${index}`:'')+part,'');
    statements.push(sql);
    if(failInsert && /^\s*INSERT/i.test(sql))throw Error('fixture-private-db-credential');
    return db.query(sql,values);
  },
  async query(sql,values){statements.push(sql);return db.query(sql,values);},
};
const legacyStore=load(root+'store.ts',{'node:fs':fs,'node:crypto':crypto,'node:path':{default:path},'./date':legacyDates,'./sites':legacySites,
  '@vercel/postgres':{createPool(options){poolOptions.push(options);return pool;}}},legacyEnv);
const route=load('src/app/api/traffic/drain/route.ts',{'next/server':{NextResponse:{json:Response.json}},
  '@/lib/traffic/established-drain/signature':legacySignature,
  '@/lib/traffic/established-drain/parse-drain':legacyParser,
  '@/lib/traffic/established-drain/store':legacyStore},legacyEnv);
const tsFixture=Date.parse('2026-09-25T12:00:00Z'); // older than new parser's 24h cutoff
const raw=[
  {schema:'vercel.analytics.v2',eventType:'pageview',vercelEnvironment:'production',timestamp:tsFixture,projectId:'prj_Y9350Up2cl8sLjYBCZ05lM2lZ0E4',origin:'https://bodegacafe757.com',path:'/',deviceId:'fixture-bodega-id'},
  {schema:'vercel.analytics.v1',eventType:'pageview',vercelEnvironment:'production',timestamp:tsFixture,projectId:'prj_Y9350Up2cl8sLjYBCZ05lM2lZ0E4',origin:'https://finacalleos.com',path:'/news/fixture-story',deviceId:'fixture-fina-id'},
  {schema:'vercel.analytics.v2',eventType:'pageview',vercelEnvironment:'production',timestamp:tsFixture,projectId:'prj_QQgDyof5KInoe8v8M02Q3iDuUWG9',origin:'https://colattao-cafe-rush.vercel.app',path:'/menu',deviceId:'fixture-colattao-id'},
];
const body=JSON.stringify(raw);
const request=(signature=false,authorized=true)=>new Request('https://finacalleos.com/api/traffic/drain',{method:'POST',body,headers:signature?
  {'x-vercel-signature':crypto.createHmac('sha1',legacyEnv.TRAFFIC_DRAIN_SECRET).update(body).digest('hex')}:
  {'x-traffic-secret':authorized?legacyEnv.TRAFFIC_DRAIN_SECRET:'wrong-fixture'}});
for(const mode of [undefined,'disabled']){
  if(mode===undefined)delete legacyEnv.TRAFFIC_INGESTION_SOURCE;else legacyEnv.TRAFFIC_INGESTION_SOURCE=mode;
  const response=await route.POST(request(mode==='disabled'));
  assert.equal(response.status,200);
  assert.equal((await response.json()).received,3);
}
assert.equal(poolOptions.length,1);
assert.deepEqual(Object.keys(poolOptions[0]),['connectionString']); // unchanged pool defaults
assert.equal(poolOptions[0].connectionString,legacyEnv.TRAFFIC_DATABASE_DATABASE_URL);
const rows=(await db.query('SELECT site_id,ts,path,referrer_host,visitor_id,event_type,event_key FROM traffic_events ORDER BY site_id')).rows;
assert.equal(rows.length,3); // exact old composite key deduplicates both deliveries
const normalized=legacyParser.parseDrainPayload(body);
for(const event of normalized){
  const row=rows.find(row=>row.site_id===event.siteId);
  assert.equal(row.visitor_id,event.visitorId); // no rehash/mid-period identifier discontinuity
  const expectedKey=crypto.createHash('sha256').update(JSON.stringify([event.siteId,event.ts,event.path,event.visitorId,event.referrerHost,event.eventType])).digest('hex');
  assert.equal(row.event_key,expectedKey);
}
assert.deepEqual((await db.query(schemaQuery)).rows,originalSchema);
assert.equal((await route.POST(request(false,false))).status,401);
legacyEnv.VERCEL_ENV='preview';assert.equal((await route.POST(request())).status,202);
legacyEnv.VERCEL_ENV='production';failInsert=true;
const failure=await route.POST(request());
assert.equal(failure.status,500);assert(!JSON.stringify(await failure.json()).includes('fixture-private'));
assert(errors.every(line=>!line.includes('fixture-private')));failInsert=false;
console.log('PASS existing production feed stores with new gates absent/disabled, preserves auth/HMAC, old IDs/key/pool/schema and replay dedup; preview/error privacy retained');

const modernDates=load('src/lib/traffic/date.ts',{});
const modernSanitize=load('src/lib/traffic/sanitize.ts',{});
const modernSites=load('src/lib/traffic/sites.ts',{'./sanitize':modernSanitize});
const modernStore=load('src/lib/traffic/store.ts',{'node:fs':fs,'node:crypto':crypto,'node:path':{default:path},'./date':modernDates,'./sites':modernSites,
  '@vercel/postgres':{createPool(){throw Error('Unexpected reporting pool creation');}}});
const reader=new modernStore.__test.PostgresTrafficStore('postgres://synthetic.test/traffic',pool);
const beforeRead=statements.length;
const report=await reader.getRangeReport('fina-calle',Date.parse('2026-09-25T04:00:00Z'),Date.parse('2026-09-26T04:00:00Z'),'America/New_York');
assert.equal(report.pageviews,1);assert.equal(report.uniqueVisitors,1);
assert.equal((await reader.getCollectionChecks('fina-calle',tsFixture-1,tsFixture+1)).length,0);
assert(statements.slice(beforeRead).every(sql=>/^\s*(SELECT|WITH)\b/i.test(sql) && !/\b(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i.test(sql)));
assert.deepEqual((await db.query(schemaQuery)).rows,originalSchema);
await db.close();
console.log('PASS new reporting reads existing feed rows through separate SELECT-only store with no health table or new migration');
