import assert from "node:assert/strict";
import { BODEGA_MANIFEST, verifiedCatalog } from "../src/lib/bodega-controls/catalog";
import { bodegaFixtureSnapshot, bodegaFixtureMenu, BODEGA_FIXTURE_COMMIT } from "../src/lib/bodega-controls/fixtures";
import { publishedGroups, publishedContent } from "../src/lib/bodega-controls/source";
import { parseBodegaSnapshot, projectBodegaMenu, resolveBodegaMenu, type BodegaSnapshot } from "../src/lib/bodega-controls/overlay";
import { readBodegaPublicMenu as readPublicMenu, verifyRenderedBodegaMenu as verifyRendered } from "../src/lib/bodega-controls/readback";
import { verifyBodegaQueuedRequest, processBodegaQueuedRequest } from "../src/lib/bodega-controls/verification";
import { renderBodegaControlFixture } from "./bodega-controls-render-fixture";

const readBodegaPublicMenu = (snapshot: BodegaSnapshot,id: string,options: Parameters<typeof readPublicMenu>[2] = {}) => readPublicMenu(snapshot,id,{ expectedCommit: BODEGA_FIXTURE_COMMIT,...options });
const verifyRenderedBodegaMenu = (html: string,snapshot: BodegaSnapshot,id: string,origin: string) => verifyRendered(html,snapshot,id,origin,BODEGA_FIXTURE_COMMIT);
async function main() {
  let checks = 0;const test = async (name: string, action: () => void | Promise<void>) => { await action();checks++;console.log(`PASS ${name}`); };
  const before = JSON.stringify(publishedContent());const snapshot = bodegaFixtureSnapshot();
  const entry = BODEGA_MANIFEST.entries.find(e=>e.sourceId==="cafecito-bodega-cat")!;
  const moved = BODEGA_MANIFEST.entries.find(e=>e.sourceId==="classic-mocha")!;
  const live = bodegaFixtureMenu("live").state.snapshot!;const html = renderBodegaControlFixture({mode:"live",snapshot:live});
  await test("all 50 published entries have permanent source IDs",()=>{assert.equal(verifiedCatalog().length,50);assert.equal(new Set(BODEGA_MANIFEST.entries.map(e=>e.sourceId)).size,50);});
  await test("manifest binds the ID mapping as well as content",()=>{const old=BODEGA_MANIFEST.entries[0].id;BODEGA_MANIFEST.entries[0].id=BODEGA_MANIFEST.entries[1].id;try{assert.throws(verifiedCatalog);}finally{BODEGA_MANIFEST.entries[0].id=old;}});
  await test("complete valid control snapshot accepted",()=>assert.ok(parseBodegaSnapshot(snapshot)));
  const invalids: [string,(s: BodegaSnapshot)=>unknown][] = [
    ["wrong tenant",s=>({...s,tenant:"other"})],["wrong source hash",s=>({...s,manifest_hash:"a".repeat(64)})],
    ["partial response",s=>({...s,items:s.items.slice(1)})],["unknown item",s=>{s.items[0].id="00000000-0000-4000-8000-000000000001";return s;}],
    ["duplicate item",s=>{s.items[1]=s.items[0];return s;}],["occupied group position",s=>{s.items[1].order=s.items[0].order;return s;}],
    ["negative order",s=>{s.items[0].order=-1;return s;}],["fractional order",s=>{s.items[0].order=0.5;return s;}],
    ["unbounded order",s=>{s.items[0].order=10001;return s;}],["bad availability",s=>{return {...s,items:[{...s.items[0],available:"false"},...s.items.slice(1)]};}],
    ["unsafe version",s=>{s.items[0].version=Number.MAX_SAFE_INTEGER+1;return s;}],["impossible item generation",s=>{s.items[0].version=1;return s;}],
    ["private top-level fields",s=>({...s,owner_email:"fixture@example.test"})],["immutable item field",s=>({...s,items:[{...s.items[0],price:0},...s.items.slice(1)]})],
  ];
  for(const [name,mutate] of invalids)await test(`${name} rejected atomically`,()=>assert.equal(parseBodegaSnapshot(mutate(structuredClone(snapshot))),null));
  let calls=0;
  await test("feature off never creates a database client",async()=>{const result=await resolveBodegaMenu(async()=>{calls++;throw new Error("no connection");},{});assert.equal(result.mode,"off");assert.equal(calls,0);});
  await test("unconfigured reader falls back without stale controls",async()=>assert.equal((await resolveBodegaMenu(async()=>null,{BODEGA_MENU_CONTROLS_ENABLED:"true"})).mode,"fallback"));
  await test("transport errors are redacted into fallback",async()=>{const state=await resolveBodegaMenu(async()=>({rpc:async()=>{throw new Error("PRIVATE DATABASE DETAIL");}}),{BODEGA_MENU_CONTROLS_ENABLED:"true"});assert.equal(state.mode,"fallback");assert.doesNotMatch(JSON.stringify(state),/PRIVATE/);});
  await test("single scoped public RPC returns complete validated state",async()=>{const state=await resolveBodegaMenu(async()=>({rpc:async(name,args)=>{assert.equal(name,"get_bodega_menu_controls_v1");assert.deepEqual(args,{p_manifest_hash:BODEGA_MANIFEST.hash});return{data:live,error:null};}}),{BODEGA_MENU_CONTROLS_ENABLED:"true"});assert.equal(state.mode,"live");});
  await test("partial backend response never overlays any items",async()=>{const state=await resolveBodegaMenu(async()=>({rpc:async()=>({data:{...live,items:live.items.slice(1)},error:null})}),{BODEGA_MENU_CONTROLS_ENABLED:"true"});assert.equal(state.mode,"fallback");assert.equal(state.snapshot,null);});
  await test("availability changes leave all original content intact",()=>{const menu=projectBodegaMenu({mode:"live",snapshot:live});const item=menu.sections.find(s=>s.id==="signature-cafecito")!.items[0];assert.equal(item.name,"Bodega Cat");assert.equal(item.description,"Espresso, lavender & white mocha");assert.equal(item.publicControl!.available,false);assert.equal(JSON.stringify(publishedContent()),before);});
  await test("display changes reorder only the same presentation group",()=>{const menu=projectBodegaMenu({mode:"live",snapshot:live});assert.equal(menu.classics[0].name,"Mocha");assert.equal(menu.espresso[0].name,"Espresso");assert.equal(menu.classics[0].prices![0].cents,575);});
  await test("forged internal state falls back as one menu",()=>{const menu=projectBodegaMenu({mode:"live",snapshot:{...live,items:live.items.slice(1)}});assert.equal(menu.state.mode,"fallback");assert.equal(menu.classics[0].name,"Americano");assert.ok(menu.sections.every(s=>s.items.every(i=>!i.publicControl)));});
  await test("unlisted prices remain unlisted",()=>{const menu=projectBodegaMenu({mode:"live",snapshot:live});assert.equal(menu.classics.find(i=>i.name==="Americano")!.prices![1].cents,null);});
  await test("every projected entry preserves every immutable source field",()=>{
    const menu=projectBodegaMenu({mode:"live",snapshot:live});
    const groups=[{scope:"seasonal",items:menu.seasonal},{scope:"espresso",items:menu.espresso},{scope:"classics",items:menu.classics},{scope:"extras",items:menu.extras},...menu.sections.map(s=>({scope:s.id,items:s.items}))];
    for(const group of publishedGroups())for(const item of group.items){const projected=groups.find(g=>g.scope===group.scope)!.items.find(i=>i.name===item.name)!;const clean={...projected} as Record<string,unknown>;delete clean.publicControl;assert.deepEqual(clean,item);}
  });
  await test("real leaf renderers expose 50 visible control markers",()=>assert.equal((html.match(/data-menu-control-id=/g)??[]).length,50));
  await test("readback validates the rendered menu and exact target",()=>{const p=verifyRenderedBodegaMenu(html,live,entry.id,"https://finacalleos.com");assert.ok(p);assert.equal(p.available,false);assert.equal(p.item_version,1);});
  await test("wrong deployment revision cannot reuse a source certificate",()=>assert.equal(verifyRendered(html,live,entry.id,"https://finacalleos.com","b".repeat(40)),null));
  await test("missing deployment revision cannot verify a public read",async()=>assert.equal((await readPublicMenu(live,entry.id,{fetcher:async()=>new Response(html)})).ok,false));
  await test("order readback follows the rendered table row sequence",()=>assert.equal(verifyRenderedBodegaMenu(html,live,moved.id,"https://finacalleos.com")?.sort_order,0));
  await test("reordered DOM rows cannot certify stale position metadata",()=>{
    const americano=BODEGA_MANIFEST.entries.find(e=>e.sourceId==="classic-americano")!;
    const a=new RegExp(`<tr[^>]*data-menu-control-id="${moved.id}"[^>]*>[\\s\\S]*?</tr>`).exec(html)![0];
    const b=new RegExp(`<tr[^>]*data-menu-control-id="${americano.id}"[^>]*>[\\s\\S]*?</tr>`).exec(html)![0];
    const swapped=html.replace(a,"__ROW_SWAP__").replace(b,a).replace("__ROW_SWAP__",b);
    assert.equal(verifyRenderedBodegaMenu(swapped,live,moved.id,"https://finacalleos.com"),null);
  });
  const failures: [string,string,BodegaSnapshot][] = [
    ["feature-off menu",renderBodegaControlFixture({mode:"off",snapshot:null}),live],
    ["fallback menu",renderBodegaControlFixture({mode:"fallback",snapshot:null}),live],
    ["old snapshot",renderBodegaControlFixture({mode:"live",snapshot}),live],
    ["incomplete document",html.slice(0,html.indexOf("</main>")),live],
    ["changed version marker",html.replace(`data-menu-version="1"`,`data-menu-version="0"`),live],
    ["hidden page",html.replace('<main ','<main hidden '),live],
    ["inert template",html.replace('<main ','<template><main ').replace('</main>','</main></template>'),live],
    ["invisible sold-out label",html.replace('>Sold out<','><span hidden>Sold out</span><'),live],
    ["missing sold-out label",html.replaceAll('Sold out',''),live],
    ["wrong visible item name",html.replace('>Bodega Cat<','>Other item<'),live],
    ["metadata only in a comment",`<html><body><!--${html}--></body></html>`,live],
    ["metadata only in a script",`<html><body><script>${html}</script></body></html>`,live],
  ];
  for(const [name,body,expected] of failures)await test(`${name} cannot verify completion`,()=>assert.equal(verifyRenderedBodegaMenu(body,expected,entry.id,"https://finacalleos.com"),null));
  const render = (body:string,status=200,type="text/html") => (async()=>new Response(body,{status,headers:{"Content-Type":type}})) as typeof fetch;
  await test("bounded public readback uses fixed path without credentials",async()=>{const result=await readBodegaPublicMenu(live,entry.id,{fetcher:async(url,init)=>{assert.equal(String(url),"https://finacalleos.com/demo/bodega");assert.equal(init!.redirect,"error");assert.equal(init!.cache,"no-store");assert.deepEqual(init!.headers,{"Cache-Control":"no-cache"});return new Response(html,{headers:{"Content-Type":"text/html"}});}});assert.equal(result.ok,true);});
  for(const origin of ["https://example.invalid","http://finacalleos.com","https://finacalleos.com/other","https://user:pass@finacalleos.com","http://127.0.0.1:3147"])await test(`unapproved origin rejected: ${origin}`,async()=>assert.equal((await readBodegaPublicMenu(live,entry.id,{origin,fetcher:render(html)})).ok,false));
  await test("loopback fixture requires exact local gate",async()=>assert.equal((await readBodegaPublicMenu(live,entry.id,{origin:"http://127.0.0.1:3147",fixture:true,env:{LOCAL_PILOT_PREVIEW:"1"},fetcher:render(html)})).ok,true));
  await test("Vercel cannot use a loopback fixture",async()=>assert.equal((await readBodegaPublicMenu(live,entry.id,{origin:"http://127.0.0.1:3147",fixture:true,env:{LOCAL_PILOT_PREVIEW:"1",VERCEL:"1"},fetcher:render(html)})).ok,false));
  for(const [label,fetcher] of [["HTTP failure",render("unavailable",503)],["wrong MIME",render(html,200,"application/json")],["oversized body",render(" ".repeat(512001))],["fallback response",render(renderBodegaControlFixture({mode:"fallback",snapshot:null}))]] as const)await test(label,async()=>assert.equal((await readBodegaPublicMenu(live,entry.id,{fetcher})).ok,false));
  const requestId="00000000-0000-4000-8000-000000000101"; const env={OWNER_REQUEST_QUEUE_ENABLED:"true",OWNER_REQUEST_QUEUE_TENANTS:"bodega",BODEGA_MENU_CONTROLS_ENABLED:"true",BODEGA_READBACK_ENABLED:"true"};
  let writes=0;
  const client={rpc:async(name:string,args:Record<string,unknown>)=>{if(name==="get_bodega_request_readback_v1")return{error:null,data:{id:requestId,tenant:"bodega",item_id:entry.id,manifest_hash:BODEGA_MANIFEST.hash,publication_commit:BODEGA_FIXTURE_COMMIT,expected_version:1,status:"awaiting_verification",snapshot:live}};assert.equal(name,"verify_bodega_owner_request_v1");writes++;assert.equal(args.p_id,requestId);assert.equal((args.p_proof as {item_id:string}).item_id,entry.id);return{data:"awaiting_owner_ack",error:null};}};
  await test("trusted verifier stays off before activation",async()=>{assert.equal((await verifyBodegaQueuedRequest(client,requestId,{fetcher:render(html),env:{}})).ok,false);assert.equal(writes,0);});
  await test("failed public readback cannot confirm the database request",async()=>{assert.equal((await verifyBodegaQueuedRequest(client,requestId,{fetcher:render("fallback"),env})).ok,false);assert.equal(writes,0);});
  await test("valid rendered readback reaches only the scoped verification RPC",async()=>{assert.deepEqual(await verifyBodegaQueuedRequest(client,requestId,{fetcher:render(html),env}),{ok:true,status:"awaiting_owner_ack"});assert.equal(writes,1);});
  await test("stale target version blocks HTTP and confirmation",async()=>{
    let fetched=0;const stale={rpc:async(name:string)=>name==="record_bodega_request_conflict_v1"?{error:null,data:"completion_conflict"}:({error:null,data:{id:requestId,tenant:"bodega",item_id:entry.id,manifest_hash:BODEGA_MANIFEST.hash,publication_commit:BODEGA_FIXTURE_COMMIT,expected_version:0,status:"awaiting_verification",snapshot:live}})};
    assert.deepEqual(await verifyBodegaQueuedRequest(stale,requestId,{env,fetcher:async()=>{fetched++;return new Response(html,{headers:{"Content-Type":"text/html"}});}}),{ok:false,reason:"target_conflict"});assert.equal(fetched,0);
  });
  await test("wrong tenant frame cannot trigger a public read or write",async()=>{
    const wrong={rpc:async()=>({error:null,data:{id:requestId,tenant:"test-a",item_id:entry.id,manifest_hash:BODEGA_MANIFEST.hash,publication_commit:BODEGA_FIXTURE_COMMIT,expected_version:1,status:"awaiting_verification",snapshot:live}})};
    assert.deepEqual(await verifyBodegaQueuedRequest(wrong,requestId,{env,fetcher:render(html)}),{ok:false,reason:"unavailable"});
  });
  await test("uncertain verification does not claim confirmation or retry",async()=>{
    let attempts=0;const uncertain={rpc:async(name:string,args:Record<string,unknown>)=>name==="get_bodega_request_readback_v1"?client.rpc(name,args):(attempts++,{data:null,error:{message:"PRIVATE PROVIDER DETAIL"}})};
    const result=await verifyBodegaQueuedRequest(uncertain,requestId,{env,fetcher:render(html)});assert.deepEqual(result,{ok:false,reason:"outcome_unconfirmed"});assert.equal(attempts,1);
  });
  function lifecycle({ loseReply = false, wrongCommit = false } = {}) {
    let phase="ready",applies=0,rollbacks=0;let state=bodegaFixtureSnapshot();
    const worker={rpc:async(name:string,args:Record<string,unknown>)=>{
      if(name==="get_bodega_request_readback_v1")return{error:null,data:{id:requestId,tenant:"bodega",item_id:entry.id,manifest_hash:BODEGA_MANIFEST.hash,publication_commit:wrongCommit?"b".repeat(40):BODEGA_FIXTURE_COMMIT,expected_version:state.items.find(i=>i.id===entry.id)!.version,status:phase,snapshot:state}};
      if(name==="execute_owner_request_v1"||name==="rollback_owner_request_v1"){
        assert.equal(args.p_id,requestId);const rollback=name==="rollback_owner_request_v1";assert.equal(phase,rollback?"rollback_requested":"ready");
        const next=structuredClone(state);const item=next.items.find(i=>i.id===entry.id)!;item.available=rollback;item.version++;next.snapshot_version++;state=next;
        if(rollback)rollbacks++;else applies++;phase=rollback?"rolled_back_pending_verification":"awaiting_verification";
        if(loseReply){loseReply=false;throw new Error("Lost response after commit");}return{error:null,data:phase};
      }
      assert.equal(name,"verify_bodega_owner_request_v1");const p=args.p_proof as {available:boolean;deployment_commit:string};assert.equal(p.available,state.items.find(i=>i.id===entry.id)!.available);assert.equal(p.deployment_commit,BODEGA_FIXTURE_COMMIT);phase=phase.startsWith("rolled_back")?"rolled_back":"awaiting_owner_ack";return{error:null,data:phase};
    }};
    const fetcher=(async()=>new Response(renderBodegaControlFixture({mode:"live",snapshot:state}),{headers:{"Content-Type":"text/html"}})) as typeof fetch;
    return{worker,fetcher,counts:()=>({applies,rollbacks}),requestRollback:()=>{phase="rollback_requested";}};
  }
  const executeEnv={...env,BODEGA_EXECUTION_ENABLED:"true"};
  await test("execution coordinator remains off before explicit activation",async()=>{const flow=lifecycle();assert.deepEqual(await processBodegaQueuedRequest(flow.worker,requestId,"apply",{env,fetcher:flow.fetcher}),{ok:false,reason:"disabled"});assert.deepEqual(flow.counts(),{applies:0,rollbacks:0});});
  await test("wrong deployment blocks preflight before any write",async()=>{const flow=lifecycle({wrongCommit:true});assert.deepEqual(await processBodegaQueuedRequest(flow.worker,requestId,"apply",{env:executeEnv,fetcher:flow.fetcher}),{ok:false,reason:"public_readback_unverified"});assert.equal(flow.counts().applies,0);});
  await test("one approved change receives preflight and fresh postflight",async()=>{const flow=lifecycle();assert.deepEqual(await processBodegaQueuedRequest(flow.worker,requestId,"apply",{env:executeEnv,fetcher:flow.fetcher}),{ok:true,status:"awaiting_owner_ack"});assert.deepEqual(await processBodegaQueuedRequest(flow.worker,requestId,"apply",{env:executeEnv,fetcher:flow.fetcher}),{ok:true,status:"awaiting_owner_ack"});assert.equal(flow.counts().applies,1);});
  await test("uncertain apply receipt resumes verification without applying twice",async()=>{const flow=lifecycle({loseReply:true});assert.deepEqual(await processBodegaQueuedRequest(flow.worker,requestId,"apply",{env:executeEnv,fetcher:flow.fetcher}),{ok:false,reason:"outcome_unconfirmed"});assert.deepEqual(await processBodegaQueuedRequest(flow.worker,requestId,"apply",{env:executeEnv,fetcher:flow.fetcher}),{ok:true,status:"awaiting_owner_ack"});assert.equal(flow.counts().applies,1);});
  await test("requested rollback receives independent preflight and restored readback",async()=>{const flow=lifecycle();await processBodegaQueuedRequest(flow.worker,requestId,"apply",{env:executeEnv,fetcher:flow.fetcher});flow.requestRollback();assert.deepEqual(await processBodegaQueuedRequest(flow.worker,requestId,"rollback",{env:executeEnv,fetcher:flow.fetcher}),{ok:true,status:"rolled_back"});assert.deepEqual(flow.counts(),{applies:1,rollbacks:1});});
  await test("source data including every recipe and price remains byte-equivalent",()=>{assert.equal(JSON.stringify(publishedContent()),before);assert.equal(publishedGroups().reduce((n,g)=>n+g.items.length,0),50);});
  console.log(`${checks} Bodega source/overlay/render/readback checks passed.`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
