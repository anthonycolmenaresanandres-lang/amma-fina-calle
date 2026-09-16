import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import sharp from "sharp";
import { GRAN_PATRON_MENU as menu, GRAN_PATRON_MANIFEST as manifest, GRAN_PATRON_LINKS as links, itemPrice, searchMenu } from "../src/table-os/menu/gran-patron";
import snapshot from "../src/table-os/menu/gran-patron/source-snapshot.json";
import { GRAN_PATRON_CHARACTERS as players, granPatronSkin } from "../src/app/play/gran-patron/presentation";
import { LASPALMAS_PENALTY_SKIN } from "../src/penalty/skin/skins";
import { PENALTY_LEVELS } from "../src/penalty/config";

let count = 0;
function check(name: string, run: () => void) { run(); count++; console.log(`PASS ${name}`); }
const items = menu.flatMap(section => section.items);
const byName = (name: string) => items.find(item => item.name === name)!;
check("Princess Anne source and order destination are exact", () => {
  assert.equal(links.order, "https://granpatron.hrpos.heartland.us/menu");
  assert.match(manifest.address, /5168 Princess Anne/);
  assert.deepEqual(manifest.sourceUrls, ["https://granpatronvb.com/food-menu", "https://granpatronvb.com/drink-menu"]);
});
check("30 sections and 338 entries reconcile all 339 source rows", () => {
  assert.equal(menu.length, 30); assert.equal(items.length, 338);
  assert.equal(new Set(items.map(item => item.id)).size, 338);
  const raw = snapshot.snapshots.flatMap(source => source.sections.flatMap(section => section.items));
  assert.equal(raw.length, 339);
  assert.deepEqual(raw.filter(item => !items.some(row => row.id === item.id)).map(item => item.name), ["FILLING CHOICES:"]);
  assert.ok(menu.find(section => section.name === "CREATE YOUR OWN COMBO")?.note.includes("Ground Beef"));
  for (const row of items) {
    const original = raw.find(item => item.id === row.id)!;
    assert.equal(row.name, original.name.trim()); assert.equal(row.description, original.description.trim());
    assert.deepEqual(row.prices, original.prices);
  }
});
check("live guacamole price never uses the stale cached value", () => assert.equal(itemPrice(byName("Fresh Guacamole")), "$14.00"));
check("shared lunch and bottle prices survive missing item prices", () => {
  for (const [name, price, total] of [["Lunch Specials", "$14.00", 13], ["IMPORTED", "$5.99", 16], ["DOMESTIC", "$4.99", 8]] as const) {
    const section = menu.find(section => section.name === name)!;
    assert.equal(section.items.length, total);
    for (const item of section.items) assert.equal(itemPrice(item), price);
  }
});
check("draft sizes, margarita sizes and variable spirit prices are explicit", () => {
  const draft = menu.find(section => section.name === "DRAFT")!;
  assert.deepEqual(draft.items[0].prices, ["$6.99/16 Oz", "$8.99/22 Oz", "$11.99/34 Oz", "$17.99/Extra Large"]);
  assert.equal(itemPrice(draft.items[0]), "View sizes");
  assert.equal(itemPrice(byName("House Margarita")), "View options");
  assert.match(byName("House Margarita").description, /Extra Large \$39\.99/);
  assert.equal(itemPrice(byName("Patrón")), "Ask for price");
});
check("all catalog tabs and accent-insensitive full-catalog search", () => {
  for (const [group, expected] of [["Food",175],["Lunch",36],["Dinner",11],["Drinks",116]] as const) assert.equal(searchMenu("",group).flatMap(section => section.items).length,expected);
  assert.ok(searchMenu("pina loca","Drinks").some(section => section.group === "Food"));
  assert.ok(searchMenu("margarita","Lunch").some(section => section.group === "Drinks"));
  const repeated = searchMenu("taco salad","Food");
  assert.ok(repeated.some(section => section.group === "Food")); assert.ok(repeated.some(section => section.group === "Lunch"));
  assert.equal(searchMenu("zxq-no-matches", "Food").length,0);
});
check("all 14 reviewed dish images and original logo exist", () => {
  assert.equal(manifest.photos.length,14);
  for (const photo of manifest.photos) { assert.ok(existsSync(`public${photo.path}`)); assert.equal(items.find(item => item.id === photo.id)?.photo, photo.path); }
  assert.ok(existsSync(`public${manifest.logo.path}`));
});
check("client assets never inherit Las Palmas data or owner integrations", () => {
  const before = JSON.stringify(LASPALMAS_PENALTY_SKIN);
  for (const player of players) {
    const skin = granPatronSkin(player);
    assert.equal(skin.id,"gran-patron"); assert.equal(skin.chrome?.externalHud,true);
    for (const path of Object.values(skin.assets!)) { assert.match(path, /^\/assets\/granpatron\//); assert.ok(existsSync(`public${path}`)); }
    for (const level of PENALTY_LEVELS) { assert.equal(level.rules.totalShots,5); assert.equal(skin.levelKickers?.[level.id] ?? skin.assets?.kicker, player.image); }
  }
  assert.equal(JSON.stringify(LASPALMAS_PENALTY_SKIN),before);
  for (const path of ["src/table-os/menu/gran-patron/index.ts", "src/app/(internal)/demo/gran-patron/page.tsx", "src/app/(internal)/demo/gran-patron/GranPatronMenu.tsx"]) assert.doesNotMatch(readFileSync(path,"utf8"), /laspalmas|las-palmas|RESTAURANT_ID|supabase|owner-preview|menuchow/);
});
async function verifySprites() {
  for (const player of players) {
    const metadata = await sharp(`public${player.image}`).metadata();
    const { data } = await sharp(`public${player.image}`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    check(`${player.name} has real transparent alpha and no keyed backdrop`, () => {
      assert.equal(metadata.hasAlpha,true); assert.equal(metadata.width,640); assert.equal(metadata.height,960);
      assert.equal(data[3],0); assert.equal(data.at(-1),0);
      let opaque = 0, transparent = 0;
      for (let i=0;i<data.length;i+=4) { if(data[i+3]===0) transparent++; if(data[i+3]>240) { opaque++; assert.ok(Math.min(data[i],data[i+2])-data[i+1]<65,"magenta spill"); } }
      assert.ok(transparent>opaque/3); assert.ok(opaque>60000);
    });
  }
  console.log(`${count} Gran Patron content/config/asset checks passed. Browser verification is separate.`);
}
void verifySprites();
