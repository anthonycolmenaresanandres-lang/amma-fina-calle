import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import * as route from '../src/app/vital-vibes/route';

async function main() {
const response = route.GET();
assert.equal(response.status, 200);
assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
assert.match(response.headers.get('x-robots-tag') ?? '', /noindex/);
const csp = response.headers.get('content-security-policy') ?? '';
for (const policy of ["connect-src 'none'", "form-action 'none'", "frame-ancestors 'self'", "script-src 'self'"]) assert.ok(csp.includes(policy), policy);
assert.deepEqual(Object.keys(route).sort(), ['GET', 'dynamic']);
const html = await response.text();
assert.match(html, /<html lang="es">/);
assert.match(html, /Concepto · menú por confirmar/);
assert.match(html, /noindex, nofollow, noarchive/);
assert.doesNotMatch(html, /<form\b|<iframe\b|__NEXT_DATA__|supabase|vercel\/analytics|Borrador privado|Concepto privado/);
assert.doesNotMatch(html, /(?:src|href)="(?:assets\/|style\.css|app\.js|menu-data\.js)/);
for (const match of html.matchAll(/(?:src|href)="(\/vital-vibes\/[^"#]+)"/g)) assert.ok(fs.existsSync(path.join('public', match[1])), match[1]);
const menuSource = fs.readFileSync('public/vital-vibes/menu-data.js', 'utf8');
const sandbox = { window: {} as { VITAL_MENU?: Array<{ id:string; name:string; art:string; groups:Array<{items:string[]}> }> } };
vm.runInNewContext(menuSource, sandbox);
const menu = sandbox.window.VITAL_MENU ?? [];
assert.equal(menu.length, 7);
assert.equal(new Set(menu.map(category => category.id)).size, 7);
assert.equal(menu.reduce((n, category) => n + category.groups.reduce((count, group) => count + group.items.length, 0), 0), 51);
for (const category of menu) {
  assert.match(category.art, /^\/vital-vibes\/assets\/.+\.svg$/);
  assert.ok(fs.existsSync(path.join('public', category.art)), category.art);
}
const allFiles = fs.readdirSync('public/vital-vibes', { recursive:true }).map(String);
assert.ok(allFiles.every(file => !/\.(png|jpe?g|mp4|zip)$/i.test(file)), 'Original SVGs and optimized generated WebPs only; no raw references');
const artContext = { window: {} as { VITAL_ARTWORK?: Record<string,{ id:string; image:string; thumbnail:string; illustrative:boolean }>; VITAL_CATEGORY_ART?: Record<string,string> } };
vm.runInNewContext(fs.readFileSync('public/vital-vibes/artwork.js','utf8'), artContext);
const artwork = artContext.window.VITAL_ARTWORK ?? {};
assert.equal(Object.keys(artwork).length,51);
assert.equal(new Set(Object.values(artwork).map(item => item.id)).size,51);
const imagePaths = new Set<string>();
for (const item of Object.values(artwork)) {
  assert.equal(item.illustrative,true);
  for (const asset of [item.image,item.thumbnail]) {
    assert.match(asset,/^\/vital-vibes\/assets\/ai\/[a-z0-9-]+\.webp$/);
    const bytes=fs.readFileSync(path.join('public',asset));
    assert.equal(bytes.toString('ascii',0,4),'RIFF');
    assert.equal(bytes.toString('ascii',8,12),'WEBP');
    imagePaths.add(asset);
  }
}
assert.equal(imagePaths.size,102);
assert.equal(Object.keys(artContext.window.VITAL_CATEGORY_ART ?? {}).length,7);
assert.ok(fs.existsSync('public/vital-vibes/assets/vital-vibes-logo.webp'));
assert.doesNotMatch(html,/\b(?:AI|IA)\b|AI.generated|cread[ao]s? con/iu);
assert.match(html,/Diseño y software del sitio/);
assert.ok(html.includes('© '+new Date().getUTCFullYear()+' Fina Calle. Todos los derechos reservados.'));
assert.match(html,/href="https:\/\/finacalleos\.com" aria-label="Fina Calle, inicio"/);
assert.match(html,/src="\/assets\/fina-calle\/emblem-colattao\.webp"/);
assert.ok(fs.existsSync('public/assets/fina-calle/emblem-colattao.webp'));
assert.match(html,/class="real-logo"/);
assert.doesNotMatch(html,/class="arch"|class="sun"|assets\/loops\.svg/);
assert.match(html,/ingredient-doodles\.svg/);
assert.ok(fs.existsSync('public/vital-vibes/assets/counter-photographic.webp'));
assert.match(fs.readFileSync('public/vital-vibes/counter-scene.css','utf8'),/counter-photographic\.webp/);
const app = fs.readFileSync('public/vital-vibes/app.js', 'utf8');
assert.doesNotMatch(app, /\bfetch\(|XMLHttpRequest|WebSocket|localStorage|document\.cookie/);
assert.match(app, /showModal/);
assert.ok(app.includes("productDialog.querySelector('details.ingredient-block').open = false;"));
assert.doesNotMatch(app,/\b(?:AI|IA)\b|AI.generated|cread[ao]s? con/iu);
assert.match(fs.readFileSync('public/vital-vibes/style.css','utf8'), /prefers-reduced-motion/);
assert.match(html, /Ingredientes y alérgenos/);
assert.match(html, /Precios y tamaños pendientes de confirmar/);
console.log('PASS: isolated GET/noindex/CSP, seven categories/51 unchanged names, 51 distinct AI image/thumbnail pairs, supplied-reference logo, illustrative notices and no accounts/orders/network integrations.');
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
