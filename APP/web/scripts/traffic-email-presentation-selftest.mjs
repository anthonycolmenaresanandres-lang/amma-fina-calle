// Offline only: real formatter/registry, synthetic reports and no provider IO.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
function load(file, imports) {
  const exports={};
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
  vm.runInNewContext(code,{exports,Date,require(name){assert(name in imports,`Unexpected import ${name}`);return imports[name];}},{filename:file});
  return exports;
}
const sanitize=load('src/lib/traffic/sanitize.ts',{});
const registry=load('src/lib/traffic/sites.ts',{'./sanitize':sanitize});
const dates=load('src/lib/traffic/date.ts',{});
const formatter=load('src/lib/traffic/morning-format.ts',{'./date':dates,'./sites':registry});
const period=dates.dailyTrafficPeriod(Date.parse('2026-10-17T12:00:00Z'));
const reports=registry.ALL_TRAFFIC_SITES.map(site=>({siteId:site.id,siteName:site.name,domains:site.domains??[],
  state:'waiting',reason:'No verified collection evidence',observedPageviews:0,identifiedPageviews:0,
  since:period.range.since,until:period.range.until,timezone:'America/New_York',
  rawVisitorId:'private-fixture-never-include'}));
Object.assign(reports.find(r=>r.siteId==='bodega'),{state:'partial',observedPageviews:42,observedIdentifiers:17,identifiedPageviews:42});
Object.assign(reports.find(r=>r.siteId==='colattao'),{state:'partial',observedPageviews:128,observedIdentifiers:63,identifiedPageviews:128});
const daily=formatter.renderTrafficDeliveryReport([{period,reports}]);
assert.equal(daily.subject,'Fina Calle traffic by site - 2026-10-16');
assert(daily.text.includes('42 recorded pageviews; 17 tracked identifiers; partial'));
assert(daily.text.includes('128 recorded pageviews; 63 tracked identifiers; partial'));
for(const site of registry.ALL_TRAFFIC_SITES){
  assert(daily.text.includes(`\n\n${site.name} (${site.kind})\n`),`Blank gap before ${site.id}`);
  assert(daily.html.replaceAll("&#39;", "'").replaceAll("&amp;", "&").includes(`>${site.name}</h2>`));
}
assert.equal((daily.html.match(/Data not yet available<\/p>/g)??[]).length,16);
assert.equal((daily.html.match(/0 recorded pageviews; coverage is unverified\./g)??[]).length,16);
assert(!/>0<\/p>/.test(daily.html));
assert(daily.html.includes('>42</p>')&&daily.html.includes('>128</p>'));
assert(daily.html.includes('<strong>17</strong> tracked identifiers'));
assert(daily.html.includes('<strong>63</strong> tracked identifiers'));
for(const text of ['Coverage is unverified.','Tracked identifiers are not people.','No combined cross-brand distinct total or physical QR-scan claim.']){
  assert(daily.text.includes(text));assert(daily.html.includes(text));
}
assert(daily.html.includes(period.range.since)&&daily.html.includes(period.range.until));
assert(daily.html.includes('role="presentation"')&&daily.html.includes('max-width:640px'));
assert(!/<(?:script|img|iframe|form|link)\b/i.test(daily.html));
assert(!/@import|url\(|javascript:/i.test(daily.html));
assert.deepEqual([...daily.html.matchAll(/href="([^"]+)"/g)].map(m=>m[1]),['https://finacalleos.com/customers/traffic']);
assert(!daily.html.includes('private-fixture')&&!daily.text.includes('private-fixture'));
const combinedPeriods=dates.scheduledTrafficPeriods('0 12 * * *',Date.parse('2026-10-19T12:00:00Z'));
const combined=formatter.renderTrafficDeliveryReport(combinedPeriods.map((period,index)=>({period,reports:reports.map(r=>({...r,
  ...(r.siteId==='bodega'?{observedPageviews:index?23:7,observedIdentifiers:index?4:2}:{}),
}))})));
assert.equal(combined.subject,'Fina Calle traffic by site - 2026-10-18 + week 2026-10-12 through 2026-10-18');
assert(combined.text.includes('7 recorded pageviews; 2 tracked identifiers'));
assert(combined.text.includes('23 recorded pageviews; 4 tracked identifiers'));
assert(combined.html.includes('>7</p>')&&combined.html.includes('>23</p>'));
assert(!combined.html.includes('>30</p>')&&!combined.text.includes('30 recorded pageviews'));
const missing=formatter.renderTrafficDeliveryReport([{period,reports:reports.map(r=>({...r,state:'unavailable',observedPageviews:undefined}))}]);
assert.equal((missing.html.match(/Data not yet available<\/p>/g)??[]).length,18);
assert(!missing.html.includes('0 recorded pageviews'));
const maliciousRegistry={...registry,ALL_TRAFFIC_SITES:registry.ALL_TRAFFIC_SITES.map((s,i)=>i? s:{...s,name:'Bodega <img src="x"> & friends'})};
const malicious=load('src/lib/traffic/morning-format.ts',{'./date':dates,'./sites':maliciousRegistry}).renderTrafficDeliveryReport([{period,reports:reports.map(r=>({...r,state:'<script>private-fixture</script>'}))}]);
assert(malicious.html.includes('Bodega &lt;img src=&quot;x&quot;&gt; &amp; friends'));
assert(!/<script>|<img\b/i.test(malicious.html));
for(const output of [daily,combined,missing])assert(Buffer.byteLength(output.html,'utf8')<100000,'Email below client clipping size');
function luminance(hex){const channels=hex.slice(1).match(/../g).map(h=>parseInt(h,16)/255).map(n=>n<=0.04045?n/12.92:((n+0.055)/1.055)**2.4);return channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722;}
for(const [foreground,background]of [['#525a64','#ffffff'],['#0d1115','#ffffff'],['#c8aa72','#07090b'],['#f0ece4','#07090b'],['#b9c0c6','#07090b'],['#0d1115','#c8aa72']]){
  const values=[luminance(foreground),luminance(background)].sort((a,b)=>b-a);assert((values[0]+0.05)/(values[1]+0.05)>=4.5);
}
console.log(`PASS email presentation: HTML/text counts and periods,18 spaced sites, unavailable/recorded-zero distinction, combined-period separation, escaping/privacy, no tracked assets, contrast; ${Buffer.byteLength(daily.html)} daily/${Buffer.byteLength(combined.html)} combined HTML bytes; no send.`);
const previewIndex=process.argv.indexOf('--preview');
if(previewIndex>=0){
  const directory=path.resolve(process.argv[previewIndex+1]);fs.mkdirSync(directory,{recursive:true});
  fs.writeFileSync(path.join(directory,'daily.html'),daily.html);fs.writeFileSync(path.join(directory,'daily.txt'),daily.text);
  fs.writeFileSync(path.join(directory,'monday.html'),combined.html);fs.writeFileSync(path.join(directory,'monday.txt'),combined.text);
  const oldText=['Production website traffic - America/New_York',`Yesterday ${period.first}: [${period.range.since}, ${period.range.until})`,'',`Site | Yesterday ${period.first}`,
    ...registry.ALL_TRAFFIC_SITES.map(site=>{const r=reports.find(r=>r.siteId===site.id);return `${site.name} (${site.kind}) | ${r.observedPageviews} recorded pageviews; ${r.observedIdentifiers??'uncollected'} tracked identifiers; ${r.state}`;})].join('\n');
  fs.writeFileSync(path.join(directory,'before.html'),`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:24px;background:white;color:#171717"><pre style="white-space:pre-wrap;font:14px/1.45 Arial,sans-serif">${oldText}</pre></body></html>`);
  console.log(`Offline preview files: ${directory}`);
}
