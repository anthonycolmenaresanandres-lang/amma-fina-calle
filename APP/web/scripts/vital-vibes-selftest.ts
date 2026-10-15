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
assert.ok(allFiles.every(file => !/\.(png|jpe?g|webp|mp4|zip)$/i.test(file)), 'Only original SVG artwork; no raw references');
const app = fs.readFileSync('public/vital-vibes/app.js', 'utf8');
assert.doesNotMatch(app, /\bfetch\(|XMLHttpRequest|WebSocket|localStorage|document\.cookie/);
assert.match(app, /showModal/);
assert.match(fs.readFileSync('public/vital-vibes/style.css','utf8'), /prefers-reduced-motion/);
assert.match(html, /Ingredientes y alérgenos/);
assert.match(html, /Precios y tamaños pendientes de confirmar/);
console.log('PASS: isolated GET/noindex/CSP, absolute assets, seven categories/51 reference names, original SVG-only art and no accounts/orders/network integrations.');
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
