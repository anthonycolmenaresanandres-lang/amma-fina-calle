import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { LAS_PALMAS_CHARACTERS, characterSkin } from "../src/app/play/las-palmas/characters";
import { LASPALMAS_PENALTY_SKIN } from "../src/penalty/skin/skins";
import { PENALTY_LEVELS } from "../src/penalty/config";

let passed = 0;
function test(name: string, fn: () => void) { fn(); passed++; console.log(`PASS ${name}`); }
const before = JSON.stringify(LASPALMAS_PENALTY_SKIN);
test("three existing difficulty labels are nonempty", () => { assert.equal(PENALTY_LEVELS.length, 3); for (const level of PENALTY_LEVELS) assert.ok(level.levelName); });
test("only the two existing playable characters", () => assert.deepEqual(LAS_PALMAS_CHARACTERS.map(c => c.name), ["Burrito California", "Quesabirria"]));
for (const character of LAS_PALMAS_CHARACTERS) {
  test(`${character.name} original asset exists`, () => assert.ok(existsSync(`public${character.image}`)));
  for (const level of PENALTY_LEVELS) test(`${character.name} remains selected against ${level.levelName}`, () => {
    const skin = characterSkin(character);
    assert.equal(skin.levelKickers?.[level.id] ?? skin.assets?.kicker, character.image);
    assert.equal(skin.id, "laspalmas");
    assert.equal(skin.layoutFit, LASPALMAS_PENALTY_SKIN.layoutFit);
    assert.equal(skin.keeperAppearance, LASPALMAS_PENALTY_SKIN.keeperAppearance);
    assert.equal(skin.ballFit, LASPALMAS_PENALTY_SKIN.ballFit);
    assert.equal(skin.assets?.background, LASPALMAS_PENALTY_SKIN.assets?.background);
    assert.notEqual(skin.assets, LASPALMAS_PENALTY_SKIN.assets);
  });
}
test("shared skin not mutated", () => assert.equal(JSON.stringify(LASPALMAS_PENALTY_SKIN), before));
const read = (file: string) => readFileSync(file, "utf8");
const lobby = read("src/app/play/las-palmas/LasPalmasGame.tsx");
const canvas = read("src/app/play/las-palmas/MatchCanvas.tsx");
const page = read("src/app/play/las-palmas/page.tsx");
const menu = read("src/app/(internal)/demo/las-palmas/page.tsx");
const css = read("src/app/(internal)/demo/las-palmas/LasPalmasWestern.module.css");
test("dedicated route is noindex, not generic skin picker", () => { assert.match(page, /index: false, follow: false/); assert.doesNotMatch(lobby, /PENALTY_SKINS|setSelectedSkin/); });
test("explicit character selection and optional difficulty", () => { assert.match(lobby, /type="radio" name="character"/); assert.match(lobby, /<details/); assert.match(lobby, /PENALTY_LEVELS/); });
test("preserves menu return and approval", () => { assert.match(lobby, /menuHref = presentation\?\.menuHref \?\? "\/demo\/las-palmas"/); assert.match(lobby, /href=\{menuHref\}/); assert.match(lobby, /Pending client approval/); });
test("Phaser lazy loads with cancellation and teardown", () => { assert.match(canvas, /import\("phaser"\)/); assert.match(canvas, /if \(cancelled \|\| !mount.current\)/); assert.match(canvas, /game\?\.destroy\(true\)/); assert.match(canvas, /clearTimeout\(timeout\)/); });
test("loading, retry and error feedback present", () => { assert.match(canvas, /role="status"/); assert.match(canvas, /role="alert"/); assert.match(canvas, /Try again/); });
test("game invitation precedes hero inside full page shell", () => { assert.ok(menu.indexOf("styles.gameBar") < menu.indexOf("styles.hero}")); assert.equal((menu.match(/href="\/play\/las-palmas"/g) ?? []).length, 2); });
test("sticky navigation reserves offsets for anchors and focus", () => { assert.match(css, /gameBar \{ position: sticky; top: 0/); assert.match(css, /categoryNav \{ position: sticky; top: var\(--game-bar-height\)/); assert.match(css, /scroll-margin-top: var\(--menu-clearance\)/); });
test("footer links original emblem directly to canonical company", () => {
  const footer = read("src/components/FinaCalleFooter.tsx");
  assert.match(footer, /href="https:\/\/finacalleos.com"/);
  assert.match(footer, /emblem-colattao.webp/);
  assert.ok(existsSync("public/assets/fina-calle/emblem-colattao.webp"));
  assert.match(menu, /<FinaCalleFooter/);
});
console.log(`${passed} game hub checks passed. Browser/gameplay verification is separate.`);
