import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const loadModule=createRequire(import.meta.url);
const {chromium}=loadModule(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const base=process.argv[2], output=process.argv[3];
if(!base||!output)throw new Error('Supply preview origin and evidence directory.');
const checks=[];
const pass=name=>{checks.push(name);console.log('PASS '+name);};
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
  for(const client of ['gran-patron','las-palmas']){
    const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
    await page.goto(`${base}/play/${client}`);
    // Ensure the lobby is hydrated before intercepting only subsequent lazy chunks.
    await page.locator('details summary').click();await page.locator('details summary').click();
    const pattern='**/_next/static/chunks/*.js';let blocked=0;
    await page.route(pattern,route=>{blocked++;return route.abort();});
    await page.getByRole('button',{name:/play/i}).click();
    await page.locator('p[role=alert]').waitFor({timeout:40000});assert.ok(blocked>0);
    await page.screenshot({path:`${output}/${client}-download-error.png`});pass(`${client}: failed download displays recovery`);
    await page.unroute(pattern);
    await page.getByRole('button',{name:'Reload game',exact:true}).click();
    await page.getByRole('button',{name:/play/i}).click();await page.locator('[data-phase=aim]').waitFor({timeout:40000});
    pass(`${client}: fresh download recovers into one playable canvas`);assert.equal(await page.locator('canvas').count(),1);
    await context.close();
  }
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
  await page.goto(`${base}/play/gran-patron`);await page.locator('details summary').click();await page.locator('details summary').click();
  const releases=[];const pattern='**/_next/static/chunks/*.js';
  await page.route(pattern,route=>new Promise(resolve=>releases.push(async()=>{await route.continue();resolve();})));
  await page.getByRole('button',{name:/play/i}).click();await page.getByRole('status').filter({hasText:'Getting the pitch ready'}).waitFor();
  pass('Slow download shows loading status');await page.getByRole('button',{name:'Try again',exact:true}).waitFor({timeout:40000});pass('30-second watchdog provides retry');
  await Promise.all(releases.map(release=>release()));await page.unroute(pattern);
  await page.getByRole('button',{name:'Try again',exact:true}).click();await page.locator('[data-phase=aim]').waitFor({timeout:40000});pass('Delayed download recovers through retry');
  await context.close();
  const extra=await browser.newContext({viewport:{width:390,height:844}}),game=await extra.newPage();
  for(const level of ['club-keeper','pro-keeper']){
    await game.goto(`${base}/play/gran-patron`);await game.locator('details summary').click();await game.locator('select[name=difficulty]').selectOption(level);
    await game.getByRole('button',{name:/play/i}).click();await game.locator('[data-phase=aim]').waitFor();const box=await game.locator('canvas').boundingBox();await game.mouse.click(box.x+box.width*.25,box.y+box.height*.33);await game.waitForFunction(()=>document.querySelector('[data-shot]')?.getAttribute('data-shot')==='2');pass(`Burrito California / ${level}: real shot advances`);
  }
  const held=await game.request.get(base+'/owner-preview');assert.equal(held.status(),404);pass('/owner-preview: remains unavailable');
  // An unconfigured local build deliberately returns a 200 holding page for /m.
  // A connected preview can return 404. Neither may expose a restaurant catalog.
  const menuResponse=await game.goto(base+'/m/las-palmas');
  assert.ok(menuResponse.status()===404 || (menuResponse.status()===200 && await game.getByText("This menu isn't connected yet.").count()===1));
  pass('/m/las-palmas: no connected menu exposed');
  await extra.close();
}finally{await fs.writeFile(`${output}/recovery-report.json`,JSON.stringify({base,checks},null,2));await browser.close();}
