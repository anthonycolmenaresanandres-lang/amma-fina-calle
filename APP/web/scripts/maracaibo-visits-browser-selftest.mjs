// Isolated production-server QA. Synthetic local Supabase REST uses real SQL;
// no production credentials or guest records. Playwright supplied by QA runtime.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { PGlite } from '@electric-sql/pglite';
const require = createRequire(import.meta.url);
const { chromium, request } = require('playwright');
const origin = 'http://127.0.0.1:3020';
const output = process.env.MARACAIBO_VISITS_QA_OUTPUT ?? '/tmp/maracaibo-visits-qa';
await mkdir(output, { recursive: true });
const db = new PGlite();
await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
await db.exec(await readFile(new URL('../supabase/migrations/20261004094018_maracaibo_table_visits.sql', import.meta.url), 'utf8'));
let offline = false;
const fixture = createServer(async (req, res) => {
  res.setHeader('content-type', 'application/json');
  try {
    if (offline) { res.writeHead(503); return res.end('{}'); }
    const url = new URL(req.url, 'http://127.0.0.1:4101');
    if (url.pathname === '/auth/v1/user') return res.end(JSON.stringify({ id: '11111111-1111-4111-8111-111111111111', email: 'staff@example.invalid', app_metadata: {}, aud: 'authenticated' }));
    let raw = ''; for await (const part of req) raw += part;
    const b = raw ? JSON.parse(raw) : {};
    if (url.pathname === '/rest/v1/rpc/maracaibo_visit') {
      const data = (await db.query('select public.maracaibo_visit($1,$2,$3,$4,$5) result', [b.p_table,b.p_action,b.p_hash??null,b.p_active??false,b.p_expected??null])).rows[0].result;
      return res.end(JSON.stringify(data));
    }
    if (url.pathname === '/rest/v1/rpc/is_admin_email') return res.end(JSON.stringify(b.p_email === 'staff@example.invalid'));
    if (url.pathname.startsWith('/rest/v1/rpc/can_current_user_')) return res.end('false');
    if (url.pathname === '/rest/v1/maracaibo_table_visits') {
      return res.end(JSON.stringify((await db.query('select table_id,visit_id,started_at,expires_at,closed_at from public.maracaibo_table_visits order by table_id')).rows));
    }
    res.writeHead(404);res.end('{}');
  } catch(error) {res.writeHead(500);res.end(JSON.stringify({message:error.message}));}
});
await new Promise(resolve=>fixture.listen(4101,'127.0.0.1',resolve));
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--port','3020','--hostname','127.0.0.1'],{
  env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:4101',NEXT_PUBLIC_SUPABASE_ANON_KEY:'fixture-public-key',SUPABASE_SECRET_KEY:'fixture-service-key'},stdio:['ignore','pipe','pipe']});
let serverLog='';for(const stream of [server.stdout,server.stderr])stream.on('data',d=>{serverLog=(serverLog+d).slice(-10000);});
let browser;const api=[];const contexts=[];const errors=[];const passed=[];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label,timeout=20000){const end=Date.now()+timeout;while(Date.now()<end){if(await fn())return;await wait(100);}throw new Error(label);}
const pass=name=>{passed.push(name);console.log('PASS',name);};
async function client(){const c=await request.newContext({baseURL:origin,extraHTTPHeaders:{origin}});api.push(c);return c;}
const post=(c,table,action,active=false)=>c.post(`${origin}/api/maracaibo/visit/${table}`,{headers:{origin},data:{action,active}});
const tokenCookie=()=>{const jwt=[{alg:'HS256',typ:'JWT'},{sub:'11111111-1111-4111-8111-111111111111',aud:'authenticated',exp:Math.floor(Date.now()/1000)+3600},'fixture'].map((v,i)=>i<2?Buffer.from(JSON.stringify(v)).toString('base64url'):v).join('.');return {name:'sb-127-auth-token',value:'base64-'+Buffer.from(JSON.stringify({access_token:jwt,refresh_token:'fixture-refresh',expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id:'11111111-1111-4111-8111-111111111111'}})).toString('base64url'),domain:'127.0.0.1',path:'/',httpOnly:false,secure:false,sameSite:'Lax'};};
try {
  await until(async()=>{try{return(await fetch(origin)).ok;}catch{return false;}},'server startup: '+serverLog,40000);
  const guests=await Promise.all(Array.from({length:4},client));
  const joined=await Promise.all(guests.map(async c=>{const r=await post(c,'qa-api','join');assert.equal(r.status(),200);return r.json();}));
  assert.equal(new Set(joined.map(g=>g.visitId)).size,1);assert.equal(new Set(joined.map(g=>g.guestId)).size,4);
  assert.equal((await(await post(guests[0],'qa-api','join')).json()).guestId,joined[0].guestId);
  const cookies=(await guests[0].storageState()).cookies;assert.equal(cookies[0].httpOnly,true);assert.equal(cookies[0].sameSite,'Strict');
  assert.equal((await guests[0].post('/api/maracaibo/visit/qa-api',{headers:{origin:'https://elsewhere.invalid'},data:{action:'leave'}})).status(),403);
  assert.equal((await post(guests[0],'qa-api','reset')).status(),400);
  assert.equal((await guests[0].post('/api/maracaibo/tables',{data:{tableId:'qa-api',visitId:joined[0].visitId}})).status(),403);
  assert.equal((await guests[0].get('/api/maracaibo/tables')).status(),403);
  pass('real Next API: four independent cookies, shared visit, refresh identity, HttpOnly/SameSite, CSRF and staff denial');
  await post(guests[0],'qa-api','leave');assert.equal((await post(guests[0],'qa-api','join')).status(),409);assert.equal((await post(guests[1],'qa-api','ping')).status(),200);
  pass('leave revokes only one phone and stays ended after refresh');
  browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows']});
  async function context(mobile=true){const c=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},hasTouch:mobile,isMobile:mobile});contexts.push(c);await c.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());await c.routeWebSocket(/.*/,s=>s.close());return c;}
  const mobile=await context();
  await mobile.addInitScript(()=>{const Original=window.BroadcastChannel;window.__channels=[];window.BroadcastChannel=class extends Original{constructor(name){super(name);this.qa={name,closed:false};window.__channels.push(this.qa);}close(){this.qa.closed=true;super.close();}};});
  async function page(c,table='qa-ui'){const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());await p.goto(`${origin}/table/maracaibo/${table}`);await p.waitForLoadState('networkidle');const cdp=await c.newCDPSession(p);await cdp.send('Emulation.setFocusEmulationEnabled',{enabled:true});return p;}
  const p=await page(mobile);await p.getByText('Your visit',{exact:false}).waitFor();assert.equal(await p.locator('canvas').count(),0);assert.equal((await p.evaluate(()=>window.__channels)).length,0);
  await p.getByRole('button',{name:/^Play Football/}).click();await p.getByRole('button',{name:/Table Football/}).waitFor();assert.equal(await p.locator('[class*="gameChoices"] button').count(),2);
  assert.equal(await p.getByRole('button',{name:/QR|Invite/}).count(),0);
  await p.screenshot({path:`${output}/games-390.png`});pass('scan associates table without occupying a game seat; exactly two options and no phone QR');
  await p.getByRole('button',{name:/Penalty Shootout/}).click();await p.getByRole('button',{name:'Aim top left'}).waitFor();
  for(let i=0;i<5;i++){await p.getByRole('button',{name:'Aim top left'}).click();if(i<4)await p.waitForFunction(()=>document.querySelector('[aria-label="Aim top left"]')?.disabled===false);}
  await p.getByRole('button',{name:'Play again',exact:true}).waitFor();await p.screenshot({path:`${output}/penalty-result-390.png`});
  await p.getByRole('button',{name:'Play again',exact:true}).click();await p.getByRole('button',{name:'Aim bottom right'}).waitFor();await p.screenshot({path:`${output}/penalty-390.png`});
  await p.getByRole('button',{name:'Games',exact:true}).click();assert.equal(await p.locator('canvas').count(),0);pass('five penalty shots complete, accessible targets work, replay resets and switching destroys canvas');
  await p.getByRole('button',{name:/Table Football/}).click();await p.getByRole('button',{name:'Move up',exact:true}).waitFor();await until(()=>p.getByRole('button',{name:'Move up',exact:true}).isEnabled(),'football ready');
  const v=(await(await post(mobile.request,'qa-ui','ping')).json()).visitId;assert.ok((await p.evaluate(()=>window.__channels.filter(c=>!c.closed).map(c=>c.name))).every(n=>n.includes(v)));await p.screenshot({path:`${output}/football-390.png`});
  await p.getByRole('button',{name:'Games',exact:true}).click();assert.ok((await p.evaluate(()=>window.__channels)).every(c=>c.closed));pass('football rooms include visit ID and switching games closes peers');
  const before=(await(await post(mobile.request,'qa-ui','join')).json()).guestId;
  await p.reload();await p.waitForLoadState('networkidle');await p.getByText('Your visit',{exact:false}).waitFor();assert.equal((await(await post(mobile.request,'qa-ui','join')).json()).guestId,before);pass('browser refresh preserves guest identity');
  await p.getByRole('button',{name:/^Play Football/}).click();await p.getByRole('button',{name:/Penalty Shootout/}).click();await p.getByRole('button',{name:'Aim top left'}).waitFor();
  const staff=await context(false);await staff.addCookies([tokenCookie()]);const staffPage=await staff.newPage();staffPage.on('dialog',d=>d.accept());await staffPage.goto(`${origin}/customers/maracaibo-tables`);await staffPage.getByRole('heading',{name:'Maracaibo tables'}).waitFor();
  const row=staffPage.locator('li').filter({has:staffPage.getByText('Table qa-ui',{exact:true})});await row.getByRole('button',{name:'Reset table'}).click();await staffPage.getByText('Table qa-ui reset.',{exact:false}).waitFor();
  await p.bringToFront();await p.getByRole('button',{name:'Join this table',exact:true}).waitFor({timeout:20000});assert.equal(await p.locator('canvas').count(),0);
  await p.getByRole('button',{name:'Join this table',exact:true}).click();await p.getByRole('button',{name:/Table Football/}).waitFor();const after=(await(await post(mobile.request,'qa-ui','ping')).json()).visitId;assert.notEqual(after,v);pass('authenticated staff reset stops active game; explicit rejoin gets a fresh visit');
  await p.getByRole('button',{name:'Leave table',exact:true}).click();await p.getByText('You’ve left this table.',{exact:true}).waitFor();await p.reload();await p.waitForLoadState('networkidle');await p.getByRole('button',{name:/^Play Football/}).click();await p.getByRole('button',{name:'Join this table',exact:true}).waitFor();pass('leave-table UI stays ended across reload');
  await p.getByRole('button',{name:'Join this table',exact:true}).click();await p.getByRole('button',{name:/Penalty Shootout/}).click();await p.getByRole('button',{name:'Aim top left'}).waitFor();await db.exec("update public.maracaibo_table_guests set expires_at=now()-interval '1 second' where table_id='qa-ui';");await p.getByRole('button',{name:'Join this table',exact:true}).waitFor({timeout:20000});assert.equal(await p.locator('canvas').count(),0);pass('server expiry removes active canvas and guest membership');
  const narrow=await context();const n=await page(narrow,'qa-narrow');await n.setViewportSize({width:320,height:700});await n.getByRole('button',{name:/^Play Football/}).click();await n.getByRole('button',{name:/Table Football/}).waitFor();await n.screenshot({path:`${output}/games-320.png`});assert.ok(await n.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await n.route('**/assets/maracaibo/**',r=>r.abort());await n.getByRole('button',{name:/Penalty Shootout/}).click();await n.getByRole('button',{name:'Aim top left'}).waitFor();await n.getByRole('button',{name:'Aim top left'}).click();await n.screenshot({path:`${output}/penalty-fallback-320.png`});pass('320px layout has no horizontal overflow and penalty works without logo asset');
  const desktop=await context(false);const d=await page(desktop,'qa-desktop');await d.getByRole('button',{name:/^Play Football/}).click();await d.getByRole('heading',{name:'Play on your phone'}).waitFor();assert.equal(await d.locator('canvas').count(),0);assert.equal(await d.locator('img[alt*="QR"]').count(),0);assert.equal((await desktop.cookies()).filter(c=>c.name.startsWith('maracaibo-visit')).length,0);await d.screenshot({path:`${output}/desktop.png`});pass('desktop uses printed-table guidance without guest session or generated QR');
  offline=true;await n.getByRole('button',{name:'Games',exact:true}).click();await n.getByRole('button',{name:'Retry connection',exact:true}).waitFor({timeout:20000});assert.equal(await n.locator('canvas').count(),0);offline=false;await n.getByRole('button',{name:'Retry connection',exact:true}).click();await n.getByRole('button',{name:/Table Football/}).waitFor();pass('backend outage closes play and retry resumes membership');
  assert.deepEqual(errors,[]);await writeFile(`${output}/result.json`,JSON.stringify({ok:true,passed,errors,physicalPhonesVerified:false},null,2));console.log('MARACAIBO_VISITS_QA_PASS',passed.length);
} catch(error) {await writeFile(`${output}/failure.json`,JSON.stringify({message:error.stack,passed,errors,serverLog},null,2));throw error;}
finally{for(const c of contexts)await c.close();await browser?.close();for(const c of api)await c.dispose();server.kill();await new Promise(r=>fixture.close(r));await db.close();}
