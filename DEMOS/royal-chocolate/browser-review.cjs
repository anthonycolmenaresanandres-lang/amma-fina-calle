const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require(process.env.ROYAL_PLAYWRIGHT_CORE||'playwright-core');
const out=path.resolve(__dirname,'../../OPERATIONS/ROYAL_CHOCOLATE/2026-10-13/screenshots');
const origin=process.env.ROYAL_PREVIEW_ORIGIN||'http://127.0.0.1:3137';if(!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin))throw new Error('Loopback origin required');
fs.mkdirSync(out,{recursive:true});
const results=[],errors=[];
async function screenshot(page,name,fullPage=false){await page.screenshot({path:path.join(out,name+'.png'),fullPage});}
async function healthy(page){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow');assert(await page.evaluate(()=>[...document.images].filter(i=>i.getBoundingClientRect().width>0).every(i=>i.complete&&i.naturalWidth>0)),'broken DOM image');}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.ROYAL_CHROMIUM||undefined,headless:true,args:['--disable-gpu']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await context.route('**/*',route=>{const url=new URL(route.request().url());return url.origin===origin?route.continue():route.abort();});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const size of [[320,740],[390,844],[1440,900]]){
   await page.setViewportSize({width:size[0],height:size[1]});await page.goto(origin+'/royal-chocolate',{waitUntil:'networkidle'});await healthy(page);
   assert.equal(await page.locator('meta[name=robots]').getAttribute('content'),'noindex, nofollow');assert.equal(await page.locator('details[id]').count(),3);
   await screenshot(page,'menu-'+size[0],true);
   await page.getByRole('link',{name:'Gourmet apples',exact:true}).click();assert(await page.locator('#apples').evaluate(e=>e.open));
   const item=page.locator('#apples details').first();await item.locator('summary').focus();await page.keyboard.press('Enter');assert(await item.evaluate(e=>e.open));await page.keyboard.press('Enter');assert(!(await item.evaluate(e=>e.open)));
   const play=page.locator('a[href="/royal-chocolate/play"]').first();const before=await play.boundingBox();await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));const after=await play.boundingBox();assert(Math.abs(before.y-after.y)<1,'floating play moved');
   const notes=page.getByText('Content & illustration notes',{exact:true});await notes.focus();await notes.scrollIntoViewIfNeeded();const nb=await notes.boundingBox(),pb=await play.boundingBox();assert(nb.y+nb.height<=pb.y+2,'footer focus covered');
   results.push({case:'menu',width:size[0],overflow:false,images:'loaded',categories:'anchor opens',item:'keyboard toggles',floating:'fixed',footerFocus:'clear'});console.log('PASS menu '+size[0]);
  }
  await page.setViewportSize({width:390,height:844});await page.goto(origin+'/royal-chocolate#apples',{waitUntil:'networkidle'});assert(await page.locator('#apples').evaluate(e=>e.open));results.push({case:'direct category hash',passed:true});
  await page.goto(origin+'/royal-chocolate/play',{waitUntil:'networkidle'});await healthy(page);await screenshot(page,'game-ready-390');
  for(let level=1;level<=3;level++){await page.getByRole('button',{name:new RegExp('^Counter '+level)}).click();assert.equal(await page.getByRole('button',{name:new RegExp('^Counter '+level)}).getAttribute('aria-pressed'),'true');await page.getByRole('button',{name:'Start collecting',exact:true}).click();await page.waitForTimeout(800);await screenshot(page,'game-counter-'+level);await page.getByRole('button',{name:'Pause',exact:true}).click();assert(await page.getByRole('heading',{name:'Take a sweet pause.'}).isVisible());const time=await page.locator('[aria-label="Round status"]').innerText();await page.waitForTimeout(1000);assert.equal(await page.locator('[aria-label="Round status"]').innerText(),time,'pause clock changed');await page.getByRole('link',{name:'Back to menu',exact:true}).last().click();await page.goto(origin+'/royal-chocolate/play',{waitUntil:'networkidle'});console.log('PASS counter '+level+' start/pause');results.push({case:'counter '+level,start:true,pause:'clock frozen'});}
  await page.setViewportSize({width:320,height:740});await healthy(page);await screenshot(page,'game-ready-320');
  await page.setViewportSize({width:844,height:390});await healthy(page);await screenshot(page,'game-landscape-ready');
  await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Start collecting',exact:true}).click();await page.waitForTimeout(800);
  // Chromium touch events exercise the real pointer handlers; not a physical-device test.
  const cdp=await context.newCDPSession(page),box=await page.locator('canvas').boundingBox(),x=box.x+box.width*.45,y=box.y+box.height*.58;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+65,y:y-25}]});await page.waitForTimeout(650);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.locator('canvas').focus();await page.keyboard.down('ArrowDown');await page.waitForTimeout(500);await page.keyboard.up('ArrowDown');
  const right=await page.getByRole('button',{name:'Move right',exact:true}).boundingBox();await page.mouse.move(right.x+right.width/2,right.y+right.height/2);await page.mouse.down();await page.waitForTimeout(450);await page.mouse.up();await screenshot(page,'game-input-390');
  await page.locator('canvas').focus();await page.keyboard.press('Escape');assert(await page.getByRole('heading',{name:'Take a sweet pause.'}).isVisible());
  await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Back to menu');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Resume collecting');
  await screenshot(page,'game-paused-390');await page.getByRole('button',{name:'Resume collecting'}).click();
  console.log('PASS touch/key/button/pause dialog inputs; waiting for natural result');
  await page.getByRole('heading',{name:'Round lost',exact:true}).waitFor({timeout:48000});await screenshot(page,'game-result-390');const summary=await page.getByRole('dialog').innerText();await page.waitForTimeout(800);assert.equal(await page.getByRole('dialog').innerText(),summary,'result continued changing');results.push({case:'inputs/result',touch:'Chromium touch dispatched',keyboard:'held arrow and Escape',buttons:'held pointer',pauseFocus:'trap wraps',naturalResult:'loss stopped'});
  await page.getByRole('button',{name:'Play this counter again',exact:true}).click();await page.waitForTimeout(350);assert(await page.getByRole('button',{name:'Pause',exact:true}).isVisible());assert((await page.locator('[aria-label="Round status"]').innerText()).includes('45s'));results.push({case:'replay',passed:true});
  await page.goto(origin+'/royal-chocolate/play',{waitUntil:'networkidle'});
  await context.route('**/assets/royal-chocolate/*.svg',route=>route.abort());await page.getByRole('button',{name:'Start collecting',exact:true}).click();await page.waitForTimeout(900);await screenshot(page,'game-fallback-390');await page.getByRole('button',{name:'Pause',exact:true}).click();results.push({case:'all game SVGs blocked',primitiveCanvas:'rendered and pause usable'});
  assert.equal(errors.length,0);console.log('PASS browser review '+results.length+' cases, page errors0');
 }catch(e){results.push({status:'FAIL',error:e.message});console.error(e.stack);process.exitCode=1;}
 finally{await browser.close();fs.writeFileSync(path.join(out,'browser-review.json'),JSON.stringify({origin,results,errors,limits:'Headless Chromium1.61.1; emulated responsive viewports and Chromium touch events. No physical phone, Safari, cross-device performance, complete player-controlled wins, or human balance certification. External requests aborted.'},null,2));}
})();
