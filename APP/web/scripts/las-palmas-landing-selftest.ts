import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { lasPalmasLynnhavenMenuSections } from "../src/table-os/menu/las-palmas-lynnhaven";
import { OFFICIAL_MENU_URL, previewItemDetails, previewSectionLabel } from "../src/app/(internal)/demo/las-palmas/menu-presentation";

let passed = 0;
function test(label: string, fn: () => void) { fn(); passed++; console.log(`PASS ${label}`); }
const items = lasPalmasLynnhavenMenuSections.flatMap(section => section.items);
test("all 39 original items are preserved with unique names", () => { assert.equal(items.length, 39); assert.equal(new Set(items.map(item => item.name)).size, 39); });
for (const item of items) {
  test(`preview details preserve ${item.name}`, () => {
    const before = JSON.stringify(item);
    const details = previewItemDetails(item, true);
    assert.ok(details.price);
    if (details.photo) { assert.match(details.photo, /^\/assets\/laspalmas\/menu\//); assert.ok(existsSync(`public${details.photo}`)); }
    assert.equal(JSON.stringify(item), before);
  });
  test(`owner values are never overridden for ${item.name}`, () => {
    const connected = { ...item, priceDisplay: "$123.45", photo: "https://example.com/owner-photo.webp" };
    assert.deepEqual(previewItemDetails(connected, false), { price: "$123.45", options: undefined, photo: connected.photo });
  });
}
test("lunch and dinner prices distinguished", () => {
  const item = items.find(item => item.name === "Arroz con Pollo")!;
  const detail = previewItemDetails(item, true);
  assert.equal(detail.price, "Lunch $15.99"); assert.match(detail.options!, /Dinner \$20\.75/);
});
test("fries protein distinction", () => assert.match(previewItemDetails(items.find(i => i.name === "Carne Asada Fries")!, true).options!, /Steak \$22\.99/));
for (const name of ["Tacos de Birria", "Tacos de Carne Asada", "Tacos de Tripa"]) test(`${name} priced per taco`, () => assert.match(previewItemDetails(items.find(i => i.name === name)!, true).price, /each$/));
test("neutral headings do not assert popularity or tableside prep for every appetizer", () => { assert.equal(previewSectionLabel("Most ordered").short, "Highlights"); assert.equal(previewSectionLabel("Made at the table").short, "To start"); });
test("unknown owner category preserved", () => assert.equal(previewSectionLabel("Owner special").full, "Owner special"));
test("official PDF contract", () => assert.equal(OFFICIAL_MENU_URL, "https://irp.cdn-website.com/1508c02f/files/uploaded/Las_Palmas_2-_3_-_4_Menu_2025.pdf"));
const page = readFileSync("src/app/(internal)/demo/las-palmas/page.tsx", "utf8");
test("permanent canonical and on-page menu", () => { assert.match(page, /canonical: "\/demo\/las-palmas"/); assert.match(page, /href="#menu"/); assert.match(page, /id="menu"/); });
test("game retained, no Table 1 or private route routing", () => { assert.match(page, /\/penalty-shootout\?skin=laspalmas/); assert.doesNotMatch(page, /href="\/(table|owner|owner-preview|m)\//); });
test("native menu expansion and preview-only qualifiers", () => { assert.match(page, /<details/); assert.match(page, /<summary>/); assert.match(page, /previewItemDetails\(item, isPreview\)/); });
test("empty/unavailable states handled without fallback prices", () => { assert.match(page, /sections.length === 0/); assert.match(page, /state === "unavailable"/); });
test("approval and noindex retained", () => { assert.match(page, /awaiting restaurant approval/); assert.match(page, /index: false, follow: false/); });
const form = readFileSync("src/app/(internal)/demo/las-palmas/LasPalmasGuestNoteForm.tsx", "utf8");
test("feedback recipient unambiguous and endpoint unchanged", () => { assert.match(form, /not Las Palmas staff/); assert.match(form, /Send note to Fina Calle/); assert.match(form, /fetch\("\/api\/customer-requests"/); assert.doesNotMatch(form, /Tell the Las Palmas team/); });
test("accessible asynchronous feedback", () => { assert.match(form, /role="status"/); assert.match(form, /role="alert"/); });
test("new texture files present", () => { for (const file of ["mesquite-palms-v1.webp", "parchment-v1.webp"]) assert.ok(existsSync(`public/assets/laspalmas/western/${file}`)); });
console.log(`${passed} Las Palmas landing checks passed. No live writes or restaurant certification.`);
