import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const menu = JSON.parse(await readFile(new URL('../src/app/olympia/doordash-menu.json', import.meta.url), 'utf8'));
const escapeHtml = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');

const base = new URL(process.env.OLYMPIA_BASE_URL || 'http://127.0.0.1:3119');
for (const path of ['/olympia', '/olympia/play']) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.match(html, /noindex/);
  assert.match(html, /nofollow/);
  assert.match(html, /Prospect concept/);
  assert(!html.includes('Unpublished concept'));
  assert(!html.includes('50%'));
  assert(!html.includes('Everyday 6AM'));
  assert(!html.includes('William Housten'));
  if (path === '/olympia') {
    assert.match(html, /Selected menu\./);
    assert.match(html, /Full menu on DoorDash/);
    assert.match(html, /DoorDash delivery prices/);
    assert.match(html, /In-store prices may differ/);
    assert.match(html, /datetime="2026-10-12"/i);
    assert.match(html, /href="https:\/\/www.doordash.com\/store\/34805753"/);
    assert(!html.includes('Names pending owner confirmation'));
    assert(!html.includes('Provisional selection'));
    const rows = [...html.matchAll(/<li[^>]*id="olympia-item-(\d+)"[^>]*>[\s\S]*?<\/li>/g)];
    assert.equal(rows.length, 39, 'Every verified item renders exactly once');
    assert.equal(rows.filter(row => /<details[^>]*>/.test(row[0]) && /<summary[^>]*>/.test(row[0])).length, 39, 'Every item has a native disclosure');
    assert(rows.every(row => !/<details[^>]*\sopen(?:[= >])/.test(row[0])), 'Descriptions start collapsed');
    for (const [, number] of rows) {
      const source = menu.items[Number(number) - 1];
      const rendered = rows.find(row => row[1] === number)[0];
      assert(rendered.includes(escapeHtml(source.name.replace(/\s+/g, ' ').trim())), source.name);
      assert(rendered.includes(source.price + ' · DoorDash'), source.name + ' delivery price');
      if (source.description) assert(rendered.includes(escapeHtml(source.description.replace(/\s+/g, ' ').trim())), source.name + ' description');
    }
    assert.match(html, /Pending Olympia approval/);
    assert.match(html, /Original concept illustration/);
    assert.match(html, /https:\/\/finacalleos.com\/olympia/);
    assert.match(html, /Reviewer photos are not integrated/);
  }
}
for (const asset of ['wordmark.png', 'logo.png', 'deli-wrapper-study.svg', 'juice-study.svg']) {
  const response = await fetch(new URL('/assets/olympia/' + asset, base));
  assert.equal(response.status, 200, asset);
  assert((await response.arrayBuffer()).byteLength > 500, asset);
}
console.log('PASS Olympia public prospect HTTP: menu/game 200; noindex/nofollow; 39 source-matched items, delivery-price/source/date disclosure, original assets and template exclusions.');
