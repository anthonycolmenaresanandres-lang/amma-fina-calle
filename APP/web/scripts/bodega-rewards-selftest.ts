import assert from "node:assert/strict";
import { BODEGA_CAMPAIGN_MS, BODEGA_CHAPTERS, BODEGA_ITEM_RADIUS, BODEGA_POINTS, BODEGA_SESSION_MAX_MS, makeBodegaRound, verifyBodegaCampaign, type BodegaRun } from "../src/bodega-fall/challenge";
import { CAFERUSH_LEVELS } from "../src/caferush/config";
import { displayClaimCode, normalizeClaimCode } from "../src/lib/bodega-rewards/contracts";
import { isSameOrigin, readRewardBody } from "../src/lib/bodega-rewards/http";

async function main() {
  const baseline = JSON.stringify(CAFERUSH_LEVELS);
  for (let seed = 0; seed < 100; seed += 1) {
    const runs: BodegaRun[] = [];
    for (let chapterIndex = 0; chapterIndex < BODEGA_CHAPTERS.length; chapterIndex += 1) {
      const chapter = BODEGA_CHAPTERS[chapterIndex];
      const plan = makeBodegaRound(seed, chapterIndex);
      assert.deepEqual(makeBodegaRound(seed, chapterIndex), plan);
      assert.equal(new Set(plan.map((p) => p.id)).size, plan.length);
      assert(plan.filter((p) => p.itemId === chapter.required).length >= 3, "Required item must appear reliably");
      const good = plan.filter((p) => p.itemId !== "spill");
      assert(good.reduce((sum, p) => sum + BODEGA_POINTS[p.itemId], 0) >= chapter.targetScore, "Every schedule must be winnable");
      for (const spawn of plan) {
        assert(spawn.atMs + (1 + BODEGA_ITEM_RADIUS) / spawn.speed * 1000 < chapter.durationSec * 1000, "Complete flight fits");
        assert(spawn.xFrac >= BODEGA_ITEM_RADIUS * 1.3 && spawn.xFrac <= 1 - BODEGA_ITEM_RADIUS * 1.3);
      }
      const events = good.map((p) => ({ id: p.id, atMs: Math.round(p.atMs + (BODEGA_ITEM_RADIUS + 0.4) / p.speed * 1000) })).sort((a, b) => a.atMs - b.atMs);
      runs.push({ chapterIndex, events });
    }
    const verified = verifyBodegaCampaign(seed, runs, BODEGA_CAMPAIGN_MS + 1000);
    assert(verified && verified.chapterScores.length === 5);
    if (seed === 0) {
      assert.equal(verifyBodegaCampaign(seed, runs, BODEGA_CAMPAIGN_MS - 1), null);
      assert.equal(verifyBodegaCampaign(seed, runs, BODEGA_SESSION_MAX_MS + 1), null);
      assert.equal(verifyBodegaCampaign(seed, runs.slice(0, 4), BODEGA_CAMPAIGN_MS + 1000), null);
      assert.equal(verifyBodegaCampaign(seed, [runs[1], runs[0], ...runs.slice(2)], BODEGA_CAMPAIGN_MS + 1000), null);
      assert.equal(verifyBodegaCampaign(seed, [{ ...runs[0], events: [...runs[0].events, runs[0].events[0]] }, ...runs.slice(1)], BODEGA_CAMPAIGN_MS + 1000), null);
      assert.equal(verifyBodegaCampaign(seed, [{ ...runs[0], events: [{ id: 9999, atMs: 2000 }] }, ...runs.slice(1)], BODEGA_CAMPAIGN_MS + 1000), null);
      assert.equal(verifyBodegaCampaign(seed, [{ ...runs[0], events: [] }, ...runs.slice(1)], BODEGA_CAMPAIGN_MS + 1000), null);
      assert.equal(verifyBodegaCampaign(seed, [{ ...runs[0], events: [...runs[0].events].reverse() }, ...runs.slice(1)], BODEGA_CAMPAIGN_MS + 1000), null);
    }
  }
  assert.equal(JSON.stringify(CAFERUSH_LEVELS), baseline, "Other café presets stay unchanged");
  const token = "abcdef0123456789abcdef0123456789";
  assert.equal(normalizeClaimCode(displayClaimCode(token)), token);
  for (const invalid of [null, "", "FREEMUFFIN", "a".repeat(31), "g".repeat(32), {}, "a".repeat(100)]) assert.equal(normalizeClaimCode(invalid), null);
  const req = (body: string, origin = "http://localhost:3188") => new Request("http://localhost:3188/api/bodega/rewards", { method: "POST", headers: { origin, "Content-Type": "application/json" }, body });
  assert(isSameOrigin(req("{}")));
  assert(!isSameOrigin(req("{}", "https://attacker.example")));
  assert(!isSameOrigin(new Request("http://localhost:3188/api/bodega/rewards")));
  assert(isSameOrigin(new Request("http://localhost:3188/api/bodega/rewards", { headers: { origin: "http://127.0.0.1:3188", host: "127.0.0.1:3188" } })));
  assert(isSameOrigin(new Request("http://internal/api/bodega/rewards", { headers: { origin: "https://finacalleos.com", host: "finacalleos.com", "x-forwarded-proto": "https" } })));
  assert.deepEqual(await readRewardBody(req('{"action":"start"}')), { action: "start" });
  await assert.rejects(readRewardBody(req("[]")));
  await assert.rejects(readRewardBody(req("invalid")));
  await assert.rejects(readRewardBody(req(JSON.stringify({ large: "x".repeat(66000) }))));
  console.log("PASS: 500 deterministic chapter schedules, full flights, required finds, campaign verifier, replay forgery checks, unchanged shared presets, claim code and request checks.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
