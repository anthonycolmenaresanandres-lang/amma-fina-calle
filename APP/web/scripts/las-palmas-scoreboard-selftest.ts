import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { beginShot, createMatch, finishShot, recordResult } from "../src/penalty/engine/match";
import { scoreboardModel } from "../src/app/play/las-palmas/scoreboard-model";
import { characterSkin, LAS_PALMAS_CHARACTERS } from "../src/app/play/las-palmas/characters";
import { LASPALMAS_PENALTY_SKIN, PENALTY_SKINS } from "../src/penalty/skin/skins";

let count = 0;
const test = (name: string, run: () => void) => { run(); count++; console.log(`PASS ${name}`); };
test("initial shot is one, not one completed", () => {
  const view = scoreboardModel(createMatch(), 5, "tap");
  assert.equal(view.shotLabel, "SHOT 1 OF 5");
  assert.deepEqual(view.attempts.map(a => a.state), ["current", "pending", "pending", "pending", "pending"]);
});
test("tap and swipe hints describe the real input", () => {
  assert.match(scoreboardModel(createMatch(), 5, "tap").message, /Tap inside the goal/);
  assert.match(scoreboardModel(createMatch(), 5, "swipe").message, /Swipe from the ball/);
});
for (const outcome of ["goal", "save", "miss"] as const) {
  test(`${outcome} records one marker without advancing the current shot early`, () => {
    const match = recordResult(beginShot(createMatch()), outcome);
    const view = scoreboardModel(match, 5, "tap");
    assert.equal(view.shot, 1);
    assert.equal(view.outcome, outcome);
    assert.equal(view.attempts[0].state, outcome);
    assert.equal(view.attempts[1].state, "pending");
    assert.equal(match.goals, outcome === "goal" ? 1 : 0);
    assert.equal(scoreboardModel(finishShot(match, 5), 5, "tap").attempts[1].state, "current");
  });
}
test("full five-shot match, final tally, no nonexistent sixth shot", () => {
  let match = createMatch();
  for (const outcome of ["goal", "save", "miss", "goal", "goal"] as const) match = finishShot(recordResult(beginShot(match), outcome), 5);
  const before = JSON.stringify(match);
  const view = scoreboardModel(match, 5, "tap");
  assert.equal(view.shotLabel, "FULL TIME"); assert.equal(view.shot, 5);
  assert.match(view.message, /^3\/5/);
  assert.deepEqual(view.attempts.map(a => a.state), ["goal", "save", "miss", "goal", "goal"]);
  assert.equal(JSON.stringify(match), before);
});
test("replay returns zero goals and clears all results", () => {
  const match = createMatch();
  assert.equal(match.goals, 0);
  assert.equal(scoreboardModel(match, 5, "tap").outcome, undefined);
});
test("optional display flag is isolated to copied lobby skins", () => {
  const before = JSON.stringify(LASPALMAS_PENALTY_SKIN);
  for (const character of LAS_PALMAS_CHARACTERS) assert.equal(characterSkin(character).chrome?.externalHud, true);
  assert.equal(JSON.stringify(LASPALMAS_PENALTY_SKIN), before);
  for (const skin of PENALTY_SKINS) assert.notEqual(skin.chrome?.externalHud, true);
});
const read = (path: string) => readFileSync(path, "utf8");
test("host receives copied state only on transitions", () => {
  const scene = read("src/penalty/PenaltyScene.ts");
  assert.match(scene, /this.lastPresentedMatch !== this.match/);
  assert.match(scene, /onMatchChange\(\{ \.\.\.this.match, results: \[\.\.\.this.match.results\] \}\)/);
});
test("host opts out of legacy canvas labels and flash effects", () => {
  const renderer = read("src/penalty/skin/PenaltyRenderer.ts");
  assert.match(renderer, /applyImpactFeedback\(state: RenderState\): void \{\s+if \(this.chrome.externalHud\) return/);
  assert.match(renderer, /drawScoreboard\(state: RenderState\): void \{\s+if \(this.chrome.externalHud\) return/);
  for (const label of ["titleText", "scoreText", "statusText", "hintText"]) assert.match(renderer, new RegExp(`${label}\\.setVisible\\(false\\)`));
});
test("semantic markers, announcements and reduced motion", () => {
  const component = read("src/app/play/las-palmas/CantinaScoreboard.tsx");
  const css = read("src/app/play/las-palmas/CantinaScoreboard.module.css");
  assert.match(component, /aria-live="polite"/); assert.match(component, /aria-label="Shot history"/);
  assert.match(component, /<Check/); assert.match(component, /<Shield/); assert.match(component, /<X/);
  assert.match(css, /prefers-reduced-motion: reduce/); assert.match(css, /pointer-events: none/);
  assert.doesNotMatch(css, /infinite|transition: all/);
});
console.log(`${count} scoreboard checks passed. Rendered gameplay verification remains separate.`);
