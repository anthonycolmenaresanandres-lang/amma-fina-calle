const assert = require('node:assert/strict');
(async () => {
  const menuResponse = await fetch('http://127.0.0.1:3119/olympia');
  assert.equal(menuResponse.status, 200);
  const menu = await menuResponse.text();
  assert.match(menu, /Chopped<br\s*\/?><em>cheese\.<\/em>/);
  assert.match(menu, /Proudly serving the CNU community/);
  assert.match(menu, /Food photos pending/);
  assert.match(menu, /Supplied photos could not be accessed and are not integrated/);
  assert.match(menu, /customer history is not independently verified/);
  assert.match(menu, /noindex/);
  for (const id of ['deli','rice','juice','visit']) {
    assert.match(menu, new RegExp('href="#' + id + '"'));
    assert.match(menu, new RegExp('id="' + id + '"'));
  }
  for (const name of ['NY Chopped Cheese','Olympia Chopped Cheese','Reuben','Caesar Wrap','Russian Panini','Lamb Over Rice','Halal Chicken Over Rice','Lamb Gyro']) assert(menu.includes(name));
  assert(!menu.includes('deli-juice-concept.svg'));
  for (const asset of ['logo.png','wordmark.png','deli-wrapper-study.svg','juice-study.svg']) {
    const response = await fetch('http://127.0.0.1:3119/assets/olympia/' + asset);
    assert.equal(response.status, 200, asset);
  }
  for (let cycle=0; cycle<3; cycle++) {
    const gameResponse = await fetch('http://127.0.0.1:3119/olympia/play');
    assert.equal(gameResponse.status,200);
    const game=(await gameResponse.text()).replace(/<!--[\s\S]*?-->/g, '');
    assert.match(game, /Juice/); assert.match(game, /Rush/);
    assert.match(game, /href="\/olympia#deli"/);
    assert.match(game, /Round 1/); assert.match(game,/Round 2/); assert.match(game,/Round 3/);
    assert(!game.includes('deli-juice-concept.svg'));
    assert.equal((await fetch('http://127.0.0.1:3119/olympia')).status,200);
  }
  console.log('PASS remake HTTP/source smoke: anchors, all provisional names, approved assumption/photo notes, new artwork assets, 3 server-rendered menu/game/exit-link cycles. Does not certify browser layout or gameplay.');
})().catch(error => { console.error(error); process.exitCode = 1; });
