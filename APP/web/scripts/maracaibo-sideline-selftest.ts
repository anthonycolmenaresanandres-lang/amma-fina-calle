import assert from "node:assert/strict";
import { characterHeight, pitchToScreen, screenToPitch, sidelineProjection } from "../src/table-os/game/sideline-projection";
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
let checks = 0;
for (const [width, height] of [[272, 240], [342, 354], [390, 420], [700, 260], [1440, 540]]) {
  for (const hideHud of [true, false]) {
    const p = sidelineProjection(width, height, hideHud);
    assert.ok(p.pitchHeight > 0 && p.nearWidth > 0);
    for (const x of [-5, 0, 10, 30, 50, 70, 90, 100, 105]) for (const y of [0, 4, 39, 50, 61, 96, 100]) {
      const floor = pitchToScreen(p, x, y); const inverse = screenToPitch(p, floor.x, floor.y);
      close(inverse.x, x); close(inverse.y, y);
    }
    // The nets include 5 engine units of presentation-only depth outside each goal.
    for (const x of [-5, 105]) for (const y of [39, 61]) {
      const goal = pitchToScreen(p, x, y);
      assert.ok(goal.x >= 0 && goal.x <= width, "Both complete goal mouths and backs fit");
      assert.ok(goal.y - p.playerHeight * 0.57 >= 0, "Raised goal frame fits");
    }
    for (const y of [4, 50, 96]) {
      const lanes = [10, 30, 70, 90].map(x => pitchToScreen(p, x, y));
      assert.ok(lanes.every((lane, i) => i === 0 || lanes[i - 1].x < lane.x), "Role lanes retain their ordering");
      const h = characterHeight(p, y);
      for (const point of lanes) {
        assert.ok(point.y - h >= 0 && point.y + h * 0.14 + 18 <= height, "Upright body and role tag fit");
        assert.ok(point.x - h * 0.4 >= 0 && point.x + h * 0.4 <= width, "Players stay inside view");
      }
    }
    const center = pitchToScreen(p, 30, 50);
    assert.ok(pitchToScreen(p, 30, 49).y < center.y && pitchToScreen(p, 30, 51).y > center.y, "Up/down retain movement direction");
    close(pitchToScreen(p, 50, 50).x, width / 2);
    assert.ok(characterHeight(p, 96) > characterHeight(p, 4), "Near players scale subtly with depth");
    checks++;
  }
}
console.log(`SIDELINE_GEOMETRY_RESULT ${JSON.stringify({ok:true,viewportVariants:checks,roundTrips:630})}`);