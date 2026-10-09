# Olympia game QA follow-up — 2026-10-09

Runtime under test: local commit `8c13ac86735803541ff130ac38231373fbb1f119`, branch `codex/olympia-prospect-demo-20261009`. No runtime changes resulted from this follow-up. Normal standard round rules and clocks remained unchanged throughout; no keyboard catches or shortened/test clocks were used for these checks.

## Passed

- Real Chrome mouse/pointer catches at a 390 × 844 phone viewport. Temporary read-only DOM event diagnostics recorded trusted browser events: `mouse:63,553:true` and Phaser-local pointer `43,164.84298861228814` caught juice, increasing score 0 → 10; `mouse:169,509:true` and Phaser-local pointer `149,120.78472590042372` caught citrus, increasing score 10 → 25. This is mouse input at mobile dimensions, not touch input or touch emulation.
- Diagnostics only recorded events/coordinates in data attributes; they did not inject input, select targets, alter items, score or timing. They were removed, the exact committed source was restored and the page reloaded. A native mouse click at client `139,439` then caught citrus on the unmodified runtime, increasing score 0 → 15. DOM readback: `Score 15Target 100Time 42s`, one canvas and an empty diagnostic dataset.
- Three final-runtime restarts each yielded `Score 0Target 100Time 45s` with exactly one canvas.
- Three subsequent menu → game → start round → menu cycles passed. Round 1: target 100 / 45s; round 2: target 130 / 45s; round 3: target 170 / 50s. Each started with one canvas and returned to the menu with zero. Navigation was verified after waiting for the destination URL, rather than assuming an immediate click had completed routing.
- Sampled Chrome console contained no warnings/errors. Temporary viewport override reset; final menu tab retained.
- After restoring the source: scoped ESLint and Olympia source self-test passed again. `git diff --exit-code -- APP/web` passed, proving no runtime, asset, test, dependency or lockfile changes remain. Prior full build and type checks therefore still apply to the identical runtime.

## Exact remaining limits

**Normal-clock full round/result: blocked in the available Chrome automation environment.** With round 1 configured at its unchanged 45 seconds, a measured uninterrupted wall-clock wait ran from **18:25:08 UTC to 18:25:56 UTC** (48 seconds). No game input, pause, restart, navigation or clock manipulation occurred during that interval. The HUD advanced only from 45s to 44s and did not reach a result. This demonstrates severe progression throttling in this controlled session; it does not establish normal active-window performance. A requested 55-second result-selector wait also returned a selector deadline after approximately 3.4 seconds. The documented Chrome controls expose viewport sizing, tabs, clicks, drags, keys and DOM inspection, but no foreground-window/visibility control with which to resolve this condition. Native app APIs are disabled in this environment. Do not mark timed completion, result focus, win/loss, Play again or Next round as passed. Normal uninterrupted active-tab manual verification is still required.

**Touch: unsupported by the exposed browser APIs.** Browser capabilities list only `viewport`; tab capabilities list only `pageAssets`. The viewport API accepts width and height, with no mobile/touch mode, and the documented input API exposes click/drag/key rather than tap/touch dispatch. No emulated touch event was generated or claimed, and no physical phone was connected or controlled. Physical touch accuracy and mobile-device performance remain unverified.

The temporary coordinates demonstrated correct mouse/Phaser mapping. Earlier misses were consistent with moving targets and a lagging captured frame; no Olympia-specific pointer defect was found that justified changing the standard engine or timer.

## Evidence

`evidence/olympia-mouse-catch.jpg` shows the first successful mouse catch at score 10. Its image was captured while the read-only diagnostics were present; those diagnostics did not change the rendered design or gameplay. The final unmodified-source score-15 proof is recorded in the browser DOM observations above. Library upload succeeded: `libfile_b021bd5e4fac81919db1d9f5e61b2266`, version 0, file `file_0000000057fc81f59278669c6b98a827`. Exact receipt: `evidence/olympia-mouse-receipt.json`. As with prior screenshots, applying returned extended attributes is unsupported by the current Windows helper (`os.setxattr` unavailable); receipt identity is preserved in JSON.

Local review stays at `http://127.0.0.1:3119/olympia` and `/olympia/play`. No push, PR, merge, deployment, business contact, spend or live-data change occurred. Canonical unrelated queue/log/Bodega changes remain untouched.

**Timer diagnosis follow-up:** Cause now supported by a passive runtime trace and independent native RAF counter: 57.991 seconds wall time / 61 browser and Phaser frames / 1.01654 seconds game delta. All samples visible, active, unpaused, timeScale 1; raw RAF gap 1016.4ms smoothed to 16.6667ms. No Olympia-specific clock override found. Exact trace, observer source and smallest manual foreground-window result check are in OLYMPIA_TIMER_DIAGNOSIS.md. Runtime restored unchanged; no result completion claimed. The previous preview process had stopped and was restarted for diagnosis; restart instructions apply if it stops after this delegated turn.
