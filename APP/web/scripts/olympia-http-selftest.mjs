import assert from 'node:assert/strict';
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
    assert.match(html, /NY Chopped Cheese/);
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
console.log('PASS Olympia public prospect HTTP: menu/game 200; noindex/nofollow; provisional disclosure, original assets and template exclusions.');
