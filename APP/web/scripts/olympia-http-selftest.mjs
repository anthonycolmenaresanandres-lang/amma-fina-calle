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
    const markup = html.match(/<main\b[\s\S]*?<\/main>/)?.[0] || '';
    assert(markup, 'The menu has rendered markup');
    assert.doesNotMatch(markup, /doordash|In-store prices may differ|Oct 12, 2026/i, 'Source wording is internal, not visible');
    assert.doesNotMatch(markup, /[\u2190-\u21ff\u27f0-\u27ff]|<svg\b/i, 'No decorative arrows or chevrons in the menu');
    assert.equal((markup.match(/>Show menu</g) || []).length, 5, 'Category controls retain a clear text action');
    assert.equal((markup.match(/>Hide menu</g) || []).length, 5);
    const summaries = [...markup.matchAll(/<summary\b[^>]*>([\s\S]*?)<\/summary>/g)];
    assert(summaries.every(([, content]) => !/<(?:a|button|summary)\b/.test(content)), 'No nested interactive controls inside summaries');
    assert(!html.includes('Names pending owner confirmation'));
    assert(!html.includes('Provisional selection'));
    const categories = [...html.matchAll(/<details[^>]*data-menu-category="([^"]+)"[^>]*>/g)];
    assert.deepEqual(categories.map(match => match[1]), ['deli', 'special', 'rice', 'popular', 'drinks'], 'All five categories are native disclosures');
    assert.deepEqual(categories.filter(match => /\sopen(?:[= >])/.test(match[0])).map(match => match[1]), ['deli'], 'Signature sandwiches starts visible; other categories start collapsed');
    const rows = [...html.matchAll(/<li[^>]*id="olympia-item-(\d+)"[^>]*>[\s\S]*?<\/li>/g)];
    assert.equal(rows.length, 39, 'Every verified item renders exactly once');
    assert.equal(rows.filter(row => /<details[^>]*>/.test(row[0]) && /<summary[^>]*>/.test(row[0])).length, 39, 'Every item has a native disclosure');
    assert(rows.every(row => !/<details[^>]*\sopen(?:[= >])/.test(row[0])), 'Descriptions start collapsed');
    for (const [, number] of rows) {
      const source = menu.items[Number(number) - 1];
      const rendered = rows.find(row => row[1] === number)[0];
      assert(rendered.includes(escapeHtml(source.name.replace(/\s+/g, ' ').trim())), source.name);
      assert(rendered.includes('>' + source.price + '</span>'), source.name + ' unchanged price');
      if (source.description) assert(rendered.includes(escapeHtml(source.description.replace(/\s+/g, ' ').trim())), source.name + ' description');
    }
    assert.match(html, /Pending Olympia approval/);
    assert.match(html, /The six photographs were supplied for this concept/);
    assert.match(html, /https:\/\/finacalleos.com\/olympia/);
    assert(!html.includes('Reviewer photos are not integrated'));
    assert(!html.includes('Food photos pending'));
    assert.equal((html.match(/<picture/g) || []).length, 6, 'Six supplied general-feature photos render');
    for (const id of ['01','02','03','04','05','06']) {
      assert.match(html, new RegExp('photo-' + id + '-320\\.webp 320w'), 'Responsive small photo ' + id);
    }
  }
}
const photos = JSON.parse(await readFile(new URL('../src/app/olympia/photo-data.json', import.meta.url), 'utf8'));
for (const photo of Object.values(photos)) {
  for (const variant of photo.variants) {
    const response = await fetch(new URL(variant.src, base));
    assert.equal(response.status, 200, variant.src);
    assert.match(response.headers.get('content-type') || '', /image\/webp/);
    assert.equal((await response.arrayBuffer()).byteLength, variant.bytes, variant.src + ' byte length');
  }
}
for (const asset of ['wordmark.png', 'logo.png', 'deli-wrapper-study.svg', 'juice-study.svg']) {
  const response = await fetch(new URL('/assets/olympia/' + asset, base));
  assert.equal(response.status, 200, asset);
  assert((await response.arrayBuffer()).byteLength > 500, asset);
}
console.log('PASS Olympia public prospect HTTP: menu/game 200; noindex/nofollow; 39 source-matched items, 39 native disclosures, six supplied responsive photos/all 12 variants, five native category disclosures, source wording/arrows removed, unchanged prices and preserved original assets and template exclusions.');
