import assert from "node:assert/strict";
import { bodegaFixtureMenu, BODEGA_FIXTURE_COMMIT } from "../src/lib/bodega-controls/fixtures";
import { BODEGA_MANIFEST } from "../src/lib/bodega-controls/catalog";
import { verifyRenderedBodegaMenu } from "../src/lib/bodega-controls/readback";

// Explicit loopback fixture only: never accepts a production host or credentials.
async function main() {
  const origin = "http://127.0.0.1:3147";
  const menu = bodegaFixtureMenu("live"); assert.ok(menu.state.snapshot);
  const item = BODEGA_MANIFEST.entries.find(entry => entry.sourceId === "cafecito-bodega-cat")!;
  for (const mode of ["baseline", "live", "fallback"] as const) {
    const response = await fetch(`${origin}/pilot/bodega-controls?mode=${mode}`, { redirect: "error" });
    assert.equal(response.status, 200); const html = await response.text();
    const proof = verifyRenderedBodegaMenu(html, menu.state.snapshot, item.id, origin, BODEGA_FIXTURE_COMMIT);
    assert.equal(!!proof, mode === "live", `actual Next SSR ${mode}`);
    if (proof) { assert.equal(proof.available, false); assert.equal(proof.item_version, 1); }
    console.log(`PASS actual Next HTTP fixture ${mode}`);
  }
  const off = await fetch(`${origin}/demo/bodega`); assert.equal(off.status, 200);
  assert.doesNotMatch(await off.text(), /data-menu-mode="live"/);
  console.log("PASS actual public page retains flag-off source");
  const blocked = await fetch(`${origin}/pilot/bodega-controls?mode=invalid`); assert.equal(blocked.status, 404);
  console.log("PASS invalid fixture mode blocked");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
