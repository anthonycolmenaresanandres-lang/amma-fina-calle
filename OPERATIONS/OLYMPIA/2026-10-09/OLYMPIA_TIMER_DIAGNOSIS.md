# Olympia timer diagnosis — 2026-10-09

Conclusion: **browser animation-frame delivery was throttled to about 1 Hz, and the existing Phaser smoothing converted those long frame gaps to about 16.6 ms of game time per frame.** That combination explains the slow countdown. No Olympia-specific clock override or paused-scene defect was found. Normal foreground-window timed completion remains unverified; the earlier attribution is now supported by an independent browser-frame counter and actual runtime state.

## Read-only inspection first

- Olympia references the exact shared `CAFERUSH_LEVELS`: 45 / 45 / 50 seconds, with no test-duration override, test clock, custom `fps` option, injected round plan or time-scale assignment.
- Shared `CafeRushScene.update` subtracts the received `deltaMs` from remaining time and uses the same delta for falling-item simulation. It is a simulation-time countdown, not a Date.now wall-clock deadline. Other existing CafeRush clients use this same engine and default Phaser time-step behavior; no other client was modified.
- Installed Phaser `TimeStep.step` records raw frame gaps, then calls `smoothDelta` before passing delta to scenes. Default `smoothStep=true`, target 60 Hz, and `panicMax=120`. During cooldown or blur it caps delta at the target frame duration; gaps above the minimum-FPS threshold are replaced by recent sane history. The source explicitly describes occluded-Chrome RAF throttling. `VisibilityHandler` emits hidden/visible and blur/focus; the Olympia wrapper additionally pauses the scene on document hiding.
- The supported browser inspection reported `document.visibilityState=visible` and `document.hidden=false`, but did not expose `document.hasFocus()` or the Phaser object. Browser console contained no errors/warnings.

## Passive runtime observation

After inspection, temporary Olympia-only diagnostics observed runtime clocks/state and wrote JSON to a DOM data attribute. A subclass counted calls and summed deltas, then passed the **unchanged** time/delta to `super.update`. A separate browser `requestAnimationFrame` observer counted native callbacks without modifying the game loop. A 1-second diagnostic interval sampled real state; focus/blur/visibility listeners only recorded events. There were no calls to step/tick/wake/pause/resume, no fake input, no clock replacement, no changed RAF mode, no FPS/time-scale/duration assignment and no browser restriction override. The diagnostics were removed and the exact committed runtime restored/reloaded afterward. Reproducible source: `evidence/olympia-timer-observer.tsx.txt`.

Raw trace: `evidence/olympia-timer-diagnostic.json` (59 samples). An untouched external wall-clock wait ran **18:40:00–18:40:48 UTC**, with no game/browser input during that 48-second interval. The trace's first and last 1-second samples include surrounding observation time:

| Measurement | First sample | Last sample | Difference |
| --- | --- | --- | --- |
| Browser Date.now, ms | 1791571196700 | 1791571254691 | 57,991 ms |
| performance elapsed, ms | 1,013.9 | 59,004.5 | 57,990.6 ms |
| Independent native RAF count | 7 | 68 | 61 frames |
| Phaser frame / scene update count | 7 | 68 | 61 frames |
| Sum of actual delta passed to game, ms | 116.5933 | 1,133.1333 | 1,016.54 ms |
| Round HUD | 45s | 44s | 1 displayed second |

At the last sample, independent RAF gap and Phaser raw delta both measured **1,016.4 ms**, while Phaser's smoothed scene delta was **16.6667 ms**. Estimated Phaser FPS converged to **1.0025**, despite configured target **60**, FPS limit **0**, RAF running **true** and forceSetTimeOut **false**. Thus ordinary browser RAF was slow before Phaser processed it; this was not an Olympia update scheduling loop or a shortened/test clock.

Across every sample: document visible, hidden false, document.hasFocus true, game/scene/Clock paused false, scene active true, scene Clock timeScale 1, loop started/running/inFocus true. No focus/blur/visibility event occurred during the captured trace. Phaser Game.hasFocus stayed false; installed source initializes that flag to false until a window focus event, while TimeStep.inFocus starts true. The unchanged flag is not evidence of an observed blur or paused scene. Browser-reported document focus does not establish the physical native window's foreground/occlusion state.

## What is established and what remains uncertain

**Established:** real browser wall/performance clocks advance normally; independent browser RAF dispatch is approximately 1 Hz; Phaser runs each received callback and smooths its delta as its installed source specifies; the scene is active/unpaused and has no time-scale/test override. Browser RAF throttling plus the standard simulation-time clock accounts quantitatively for the discrepancy.

**Unresolved:** the underlying native-window condition responsible for throttling (for example occlusion versus browser automation's focus/visibility handling). The documented controls do not expose native foreground/occlusion state or an OS foreground-window operation; native app APIs are disabled. No restriction was overridden. No result screen was fabricated or marked passed. The evidence supports scheduling throttling in this controlled session, but does not prove normal foreground-browser performance or rule out shared-engine behavior on genuinely slow devices. Replacing the shared simulation clock with wall time would be a broader game-rule change and was not made.

## Smallest remaining manual check

1. If the local process has stopped, restart it using the PowerShell command in `OLYMPIA_REVIEW.md`. Delegated command processes may not persist after a task ends; a retained browser tab alone does not keep the server alive. The diagnosis initially encountered connection refused, restarted the server, and then completed the runtime trace.
2. Open `http://127.0.0.1:3119/olympia/play` in an unobscured foreground Chrome window. Start round 1 and keep it visible/focused with no tab switching or explicit pause for 45 seconds, measured by a separate normal stopwatch. Confirm countdown completion near 45 seconds, result text and focus.
3. Click Play again: confirm score/time reset and one canvas. Click Next round when a result is available, then return to the menu and re-enter. Confirm expected target/duration and no stacked canvas. This result-path check remains outstanding; earlier native mouse catches, restarts and all three menu/game navigation cycles already passed.

Touch unavailability was accepted separately; no new touch service, tool or installation was attempted. After removing diagnostics: scoped lint/self-test, empty APP/web diff and clean browser reload pass. Prior full build/types apply to the unchanged runtime. Canonical unrelated changes remain preserved. Local evidence only; no push, PR, merge, deployment, spend, contact or live-data change.
