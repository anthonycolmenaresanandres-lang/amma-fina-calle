// November release diagnostics, QA exclusion and one-owner verification: offline only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import ts from 'typescript';
import { PGlite } from '@electric-sql/pglite';
import { triggerMail } from './traffic-mail-trigger.mjs';
function load(file,imports={},env={},extra={}) {
  const exports={};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,
    {exports,process:{env},Buffer,URL,URLSearchParams,Request,Response,TextDecoder,Uint8Array,AbortSignal,Date,console,require(n){assert(n in imports,`Unmocked ${n}`);return imports[n];},...extra});
  return exports;
}
const db=new PGlite();
await db.exec(`CREATE TABLE traffic_events(id BIGSERIAL PRIMARY KEY,ts TIMESTAMPTZ,path TEXT,referrer_host TEXT,visitor_id TEXT,event_type TEXT,site_id TEXT,event_key TEXT UNIQUE)`);
let ended=0;
const pool={query:(sql,values)=>db.query(sql,values),end:async()=>{ended++;}};
const binding=load('src/lib/traffic/binding.ts',{'server-only':{},'@vercel/postgres':{createPool:()=>pool},'./store':{trafficDatabaseUrl:()=> 'postgres://synthetic:PRIVATE@ep-fixture-pooler.c-13.us-east-1.aws.neon.tech/neondb'}});
const before=await binding.inspectTrafficDatabase();assert.equal(before.endpointId,'ep-fixture');assert.equal(before.ledgerPresent,false);assert.equal(before.eventSelect,true);assert(!JSON.stringify(before).includes('PRIVATE'));
await db.exec(fs.readFileSync('traffic/migrations/002_delivery_ledger.sql','utf8'));
const after=await binding.inspectTrafficDatabase();assert.equal(after.ledgerPresent,true);assert.equal(after.ledgerGuard,true);assert.equal(after.ledgerUpdate,true);assert.equal(ended,2);
console.log('PASS actual read-only binding SQL before/after synthetic ledger; only nonsecret identity/privileges returned');
let inspected=0,sent=0,queries=0,admin=false,privateLog='';
const env={VERCEL_ENV:'production',TRAFFIC_EMAIL_ENABLED:'true',TRAFFIC_SCHEDULE_ENABLED:'true',TRAFFIC_EMAIL_TEST_READBACK_CONFIRMED:'true',TRAFFIC_MAIL_TRIGGER_SECRET:'synthetic-mail-token-at-least-32-characters'};
const route=load('src/app/api/internal/traffic/morning/route.ts',{'node:crypto':crypto,'next/server':{NextResponse:{json:(b,i)=>Response.json(b,i)}},
  '@/lib/admin/auth':{getAdminContext:async()=>({state:admin?'authorized':'unauthorized'})},'@/lib/traffic/date':{dateStringInTz:()=> '2026-11-07',trafficPeriodsForDeliveryDate:()=>[]},
  '@/lib/traffic/binding':{inspectTrafficDatabase:async()=>{inspected++;return after;}},
  '@/lib/traffic/morning-email':{trafficDeliveryStatus:async()=>null,morningEmailStatus:()=>({enabled:true,configured:true}),sendTrafficDeliveryReport:async()=>{sent++;}},
  '@/lib/traffic/site-traffic':{getMorningTrafficReports:async()=>({date:'2026-11-06',reports:[]}),getTrafficPeriodReports:async()=>{queries++;}}},env,{console:{info:(...args)=>{privateLog=args.join(' ');},error(){}}});
const post=(input,token=env.TRAFFIC_MAIL_TRIGGER_SECRET)=>route.POST(new Request('https://finacalleos.com/api/internal/traffic/morning',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(input)}));
assert.equal((await post({mode:'inspect'},'wrong')).status,401);assert.equal(inspected,0);
assert.equal((await post({mode:'inspect',sql:'SELECT secrets'})).status,400);
assert.equal((await post({mode:'inspect',deliveryDate:'2026-11-07'})).status,400);
assert.equal((await route.GET()).status,401);assert.equal(inspected,0);
admin=true;const inspectedResponse=await route.GET();assert.equal(inspectedResponse.status,200);assert.equal((await inspectedResponse.json()).binding.endpointId,'ep-fixture');
const checked=await post({mode:'check',deliveryDate:'2026-11-07'});assert.equal(checked.status,200);assert(!JSON.stringify(await checked.json()).includes('ep-fixture'));assert(privateLog.includes('ep-fixture'));
assert.equal(inspected,2);assert.equal(sent,0);assert.equal(queries,0);
let diagnostic='';const oldLog=console.log;
try { console.log=(...args)=>{diagnostic=args.join(' ');};await triggerMail({TRAFFIC_MAIL_MODE:'check',TRAFFIC_MAIL_DELIVERY_DATE:'2026-11-07',TRAFFIC_MAIL_TRIGGER_SECRET:env.TRAFFIC_MAIL_TRIGGER_SECRET},async(_url,options)=>{
  assert.deepEqual(JSON.parse(options.body),{mode:'check',deliveryDate:'2026-11-07'});return Response.json({ok:true,skipped:true,reason:'not_due',binding:{...after,secret:'PRIVATE',connectionString:'PRIVATE'}});
});}finally{console.log=oldLog;}
assert(!diagnostic.includes('ep-fixture'));assert(!diagnostic.includes('PRIVATE'));
console.log('PASS only ops-admin GET returns identity; mail check logs privately, cannot send and never returns identity');
const ledgerModule=load('src/lib/traffic/delivery-ledger.ts',{'server-only':{},'node:crypto':crypto,'@vercel/postgres':{createPool:()=>pool},'./store':{trafficDatabaseUrl:()=>null}});
const ledger=new ledgerModule.PostgresDeliveryLedger(pool);let providerCalls=0;let payload;
const mailEnv={...env,TRAFFIC_EMAIL_TEST_ENABLED:'true',TRAFFIC_RESEND_API_KEY:'synthetic',TRAFFIC_FROM_EMAIL:'reports@finacalleos.com',TRAFFIC_MORNING_REPORT_EMAIL:'anthonycolmenaresanandres@gmail.com'};
const mail=load('src/lib/traffic/morning-email.ts',{'server-only':{},'./morning-format':{renderTrafficDeliveryReport:()=>({subject:'Synthetic actual-period report',text:'synthetic',html:'<h1>Traffic by site</h1>'})},
  './delivery-ledger':{getDeliveryLedger:()=>ledger,trafficDeliveryKey:()=> 'synthetic-verification'}},mailEnv,{fetch:async(_u,o)=>{providerCalls++;payload=JSON.parse(o.body);return Response.json({id:'01234567-89ab-4def-8abc-0123456789ab'});}});
assert.equal((await mail.sendTrafficDeliveryReport([],'verify')).sent,true);assert.equal((await mail.sendTrafficDeliveryReport([],'verify')).deduplicated,true);
assert.equal(providerCalls,1);assert(payload.subject.startsWith('[VERIFICATION]'));assert.deepEqual(payload.to,['anthonycolmenaresanandres@gmail.com']);
assert.equal((await db.query("SELECT state FROM traffic_mail_deliveries WHERE delivery_key='synthetic-verification-owner-verification-v1'")).rows[0].state,'accepted');
console.log('PASS one labeled owner verification uses actual immutable SQL claims and permanent acceptance dedup');
const sanitize=load('src/lib/traffic/sanitize.ts');
const sites=load('src/lib/traffic/sites.ts',{'./sanitize':sanitize});
const first=load('src/lib/traffic/first-party.ts',{'./sanitize':sanitize,'./sites':sites});
const trial=load('src/lib/traffic/trial-events.ts',{'./first-party':first},{TRAFFIC_EL_MARIACHI_COLLECTION_ENABLED:'true'});
assert.equal(JSON.stringify(trial.enabledTrialSites()),JSON.stringify(['el-mariachi']));
const sample={id:crypto.randomUUID(),ts:Date.now(),hostname:'finacalleos.com',path:'/el-mariachi/play',eventType:'qa_game_complete'};
const qa=trial.parseCollectionEvent(sample,'https://finacalleos.com',{trials:true,trialSites:['el-mariachi'],firstParty:false});assert.equal(qa.eventType,'qa_game_complete');
assert.equal(trial.parseCollectionEvent({...sample,path:'/play/project-seed'},'https://finacalleos.com',{trials:true,trialSites:['el-mariachi'],firstParty:true}),null);
assert(Object.values(trial.countTrialEvents('el-mariachi',[qa])).every(n=>n===0));
console.log('PASS El Mariachi-only gate excludes Seed; QA types cannot inflate any real trial metric');
const state=new Map();
const analytics=load('src/lib/traffic/TrafficAnalytics.tsx',{'react/jsx-runtime':{jsx:(type,props)=>({type,props})},'@vercel/analytics/next':{Analytics:()=>null}},{},
  {document:{cookie:''},sessionStorage:{getItem:k=>state.get(k),setItem:(k,v)=>state.set(k,v)}});
const beforeSend=analytics.default().props.beforeSend;
assert.equal(beforeSend({type:'pageview',url:'https://finacalleos.com/el-mariachi?traffic_qa=1'}),null);
assert.equal(beforeSend({type:'pageview',url:'https://finacalleos.com/el-mariachi/play'}),null);
state.clear();const genuine={type:'pageview',url:'https://finacalleos.com/el-mariachi'};assert.equal(beforeSend(genuine),genuine);
console.log('PASS native Analytics excludes QA and subsequent same-tab QA navigation while preserving genuine views');
// Execute the actual component's button handlers and original round engine.
// Effects/renderers are intentionally idle; no browser or live events involved.
const engine=load('src/app/el-mariachi/hole-engine.ts');
let hook=0,starts=0;
const hooks=[];
const react={useState(initial){const i=hook++;if(!(i in hooks))hooks[i]=typeof initial==='function'?initial():initial;return [hooks[i],v=>{hooks[i]=typeof v==='function'?v(hooks[i]):v;}];},
  useRef(initial){const i=hook++;return hooks[i]??(hooks[i]={current:initial});},useCallback:fn=>fn,useEffect(){}};
const jsx=(type,props)=>({type,props});
const game=load('src/app/el-mariachi/MariachiRush.tsx',{'react':react,'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'fragment'},
  'next/image':{},'next/link':{},'lucide-react':{},'@/lib/traffic/trial-client':{createTrialRun:()=>({start(){starts++;},complete(){}})},
  './ElMariachiNav':{},'./hole-engine':engine,'./hole-drawing':{},'./hole-camera':{},'./game.module.css':{default:{}}},{},{document:{hidden:false},performance:{now:()=>1000}});
const render=()=>{hook=0;return game.default({locationSlug:'fixture',locationName:'Fixture',orderUrl:'https://example.test'});};
const textOf=node=>node==null||node===false?'':typeof node==='string'||typeof node==='number'?String(node):Array.isArray(node)?node.map(textOf).join(''):textOf(node.props?.children);
function button(tree,label){if(!tree||typeof tree!=='object')return null;if(tree.type==='button'&&textOf(tree).trim()===label)return tree;
  for(const child of [tree.props?.children].flat(Infinity)){const found=button(child,label);if(found)return found;}return null;}
const play=button(render(),'Play');assert(play);play.props.onClick();play.props.onClick();assert.equal(starts,1);
button(render(),'Pause').props.onClick();assert(button(render(),'Resume'));
button(render(),'Resume').props.onClick();assert.equal(starts,1);assert(!button(render(),'Resume'));
button(render(),'Pause').props.onClick();const restart=button(render(),'Restart round');assert(restart);
restart.props.onClick();restart.props.onClick();assert.equal(starts,2);assert(!button(render(),'Resume'));
assert.equal(button(render(),'Pause').props.disabled,false);
console.log('PASS actual Play/Pause/Resume/Restart handlers: paused restart creates one fresh round; resume/rapid clicks do not duplicate starts');
await db.close();
