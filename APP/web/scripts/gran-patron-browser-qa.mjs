// Uses an existing Playwright installation; no application dependency added.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const loadModule = createRequire(import.meta.url);
const { chromium } = loadModule(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const base = process.argv[2] || 'http://localhost:3158';
const output = process.argv[3];
if (!output) throw new Error('Supply an evidence directory.');
const results=[];
const check=(name,value)=>{assert.ok(value,name);results.push(name);console.log('PASS '+name);};
(async()=>{
  await fs.mkdir(output,{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const capture=async name=>{await page.screenshot({path:`${output}/${name}.png`});};
  const noOverflow=async name=>check(name,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const menu=async()=>{await page.goto(base+'/demo/gran-patron');await page.getByRole('button',{name:'Food',exact:true}).waitFor();};
  const play=async(name='Burrito California',mode='tap',level='street-keeper')=>{
    await page.goto(base+'/play/gran-patron');
    await page.locator('label').filter({has:page.getByRole('radio',{name:new RegExp(name)})}).click();
    check(`${name}: label selects player`,await page.getByRole('radio',{name:new RegExp(name)}).isChecked());
    await page.locator('details summary').click();
    await page.locator('select[name=controls]').selectOption(mode);
    await page.locator('select[name=difficulty]').selectOption(level);
    await page.getByRole('button',{name:/play/i}).click();
    await page.locator('[data-phase=aim]').waitFor({timeout:60000});
    check(`${name}/${level}/${mode}: exactly one canvas`,await page.locator('canvas').count()===1);
  };
  const shot=async(mode='tap')=>{
    const canvas=await page.locator('canvas').boundingBox();
    const x=canvas.x+canvas.width*.25, y=canvas.y+canvas.height*.33;
    const current=await page.locator('[data-shot]').getAttribute('data-shot');
    if(mode==='swipe'){
      await page.mouse.move(canvas.x+canvas.width*.68,canvas.y+canvas.height*.82);
      await page.mouse.down();await page.mouse.move(x,y,{steps:12});await page.mouse.up();
    } else await page.mouse.click(x,y);
    await page.waitForFunction(previous=>document.querySelector('[data-shot]')?.getAttribute('data-shot')!==previous||document.querySelector('[data-phase]')?.getAttribute('data-phase')==='gameover',current,{timeout:12000});
    await page.waitForFunction(()=>['aim','gameover'].includes(document.querySelector('[data-phase]')?.getAttribute('data-phase')));
  };
  try{
    for(const width of [320,390,430,1440]){
      await page.setViewportSize({width,height:width===1440?1000:844});await menu();await page.evaluate(()=>document.fonts.ready);
      await noOverflow(`menu ${width}: no overflow`);await capture(`menu-${width}-hero`);
      await page.getByRole('link',{name:'View menu',exact:true}).click();
      await capture(`menu-${width}-rows`);
      check(`menu ${width}: 175 food rows`,await page.locator('[data-item-id]').count()===175);
    }
    await page.setViewportSize({width:390,height:844});await menu();
    await page.getByRole('button',{name:'Lunch',exact:true}).click();
    check('Lunch has 36 rows and source hours',await page.locator('[data-item-id]').count()===36 && await page.getByText(/Served between 11:00/).count()===1);
    check('Lunch inherited $14 visible',await page.locator('[data-item-id]').first().innerText().then(t=>t.includes('$14.00')));
    await page.getByRole('button',{name:'Dinner',exact:true}).click();check('Dinner has 11 rows',await page.locator('[data-item-id]').count()===11);
    await page.getByRole('button',{name:'Drinks',exact:true}).click();check('Drinks has 116 rows',await page.locator('[data-item-id]').count()===116);
    await page.getByRole('searchbox').fill('Dos Equis Ambar');
    await page.locator('[data-item-id="menu_item_5321359"] summary').click();
    check('Draft displays every size',await page.locator('[data-item-id="menu_item_5321359"] li').count()===4);await capture('drinks-draft-sizes-390');
    await page.getByRole('searchbox').fill('pina loca');check('Accent-insensitive global search finds food from Drinks',await page.locator('[data-item-id]').count()===1);
    await page.getByRole('searchbox').fill('taco salad');check('Search retains Food and Lunch context',await page.locator('section[id^=section-] > header').allTextContents().then(t=>t.some(s=>s.includes('Food'))&&t.some(s=>s.includes('Lunch'))));
    await capture('search-across-menus-390');
    await page.getByRole('searchbox').fill('zxq-no-matches');check('Empty state',await page.getByText('No matches yet.').isVisible());
    await page.getByRole('button',{name:'Clear search'}).click();check('Clear restores Drinks',await page.locator('[data-item-id]').count()===116);
    await page.getByRole('button',{name:'Food',exact:true}).click();
    await page.getByRole('combobox',{name:'Jump to a category'}).selectOption('1192867-12'.replace(/^/,'section-'));
    check('Category focus clears sticky controls',await page.locator('#section-1192867-12').evaluate(el=>document.activeElement===el&&el.getBoundingClientRect().top>=document.querySelector('[class*="menuControls"]').getBoundingClientRect().bottom));
    await page.locator('#section-1192867-12 summary').first().focus();await page.keyboard.press('Enter');check('Menu details open with keyboard',await page.locator('#section-1192867-12 details').first().getAttribute('open')!==null);
    await page.getByRole('searchbox').fill('Molcajete Cielo');await page.locator('[data-item-id] summary').click();
    await page.locator('[data-item-id] img').scrollIntoViewIfNeeded();await page.waitForFunction(()=>[...document.querySelectorAll('[data-item-id] img')].every(i=>i.complete&&i.naturalWidth>0));await capture('molcajete-detail-390');
    check('Correct external order destination',await page.getByRole('link',{name:/Order online/}).getAttribute('href')==='https://granpatron.hrpos.heartland.us/menu');
    for(const width of [320,390,430,1440]){
      await page.setViewportSize({width,height:width===1440?1000:844});await page.goto(base+'/play/gran-patron');await page.getByRole('button',{name:/play/i}).waitFor();
      await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));await noOverflow(`lobby ${width}: no overflow`);await capture(`lobby-${width}`);
    }
    await page.setViewportSize({width:390,height:844});
    for(const player of ['Burrito California','Piña Loca']){
      await play(player);await capture(`match-${player==='Piña Loca'?'pina':'burrito'}-390`);
      for(let i=0;i<5;i++)await shot();check(`${player}: real five-shot round reaches full time`,await page.locator('[data-phase]').getAttribute('data-phase')==='gameover');
      check(`${player}: all five outcomes recorded`,await page.locator('[data-outcome=goal],[data-outcome=save],[data-outcome=miss]').count()===5);await capture(`full-time-${player==='Piña Loca'?'pina':'burrito'}`);
      await page.getByRole('button',{name:'Replay'}).click();await page.locator('[data-phase=aim]').waitFor();check(`${player}: replay resets score`,await page.locator('[data-goals]').getAttribute('data-goals')==='0');
      await page.getByRole('button',{name:'Players',exact:true}).click();check(`${player}: canvas destroyed on lobby return`,await page.locator('canvas').count()===0);
    }
    for(const level of ['club-keeper','pro-keeper']) {await play('Piña Loca','swipe',level);await shot('swipe');check(`${level}: real swipe advances`,await page.locator('[data-shot]').getAttribute('data-shot')==='2');}
    await page.setViewportSize({width:320,height:740});await noOverflow('Match resize 320: no overflow');await shot('swipe');await capture('match-resized-320');
    await page.route('**/assets/granpatron/game/**',route=>route.abort());await play();await shot();check('Missing artwork: primitive fallback remains playable',await page.locator('[data-shot]').getAttribute('data-shot')==='2');await capture('fallback-320');await page.unroute('**/assets/granpatron/game/**');
    await page.setViewportSize({width:390,height:844});
    await page.goto(base+'/demo/las-palmas');await noOverflow('Las Palmas menu no overflow');check('Las Palmas retains 39 dishes',await page.locator('details').count()>=39);await capture('las-palmas-menu-390');
    await page.goto(base+'/play/las-palmas');await page.locator('label').filter({has:page.getByRole('radio',{name:/Quesabirria/})}).click();await capture('las-palmas-lobby-390');await page.getByRole('button',{name:/play/i}).click();await page.locator('[data-phase=aim]').waitFor({timeout:60000});await shot();check('Las Palmas still shoots with Quesabirria',await page.locator('[data-shot]').getAttribute('data-shot')==='2');await capture('las-palmas-match-390');
    check('No uncaught page errors',errors.length===0);
  }finally{await fs.writeFile(`${output}/browser-report.json`,JSON.stringify({base,checks:results,errors},null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
