# ODYSSEY DAILY — Production Bible

_AMMA Studio experiment. Started 2026-07-24. Owner: Anthony. Director-of-the-day: Claude._

**The deal:** 10 seconds of finished footage per day. Each day Claude studies ONE
piece of film craft (shot size, angle, movement, transition, cutting rule),
applies it to ONE shot from the shot list, hard-rejects slop, and delivers the
clip to Anthony. **Anthony owns the edit** — clips are building blocks, not cuts.

## Source & rights (absolute)

- Text basis: Homer's *Odyssey*, **Samuel Butler translation (public domain)**.
  Never quote modern copyrighted translations (Wilson, Fagles, Lattimore).
- **No connection to any studio film.** No Nolan-film shots, marks, posters,
  cast likenesses. No real human faces of any living person.
- Characters are original designs. Historically-grounded Mycenaean Bronze Age
  (~1200 BC): boar-tusk helmets, figure-of-eight shields, penteconter galleys,
  no classical-era anachronisms where avoidable.

## The look (locked — every shot must match)

| Axis | Lock |
|---|---|
| Aspect / fps | 16:9 native (Anthony letterboxes to 2.39:1 in edit), 24fps look |
| Palette | Wine-dark sea (deep teal-slate), bronze & oxblood accents, bone-linen sails, dawn gold |
| Light | Natural sources only: sun, sky, fire, moon. No modern glow. |
| Texture | Weathered, sun-bleached, salt-crusted. Epic scale, worn surfaces. |
| Camera grammar | Deliberate, classical. Movement must be motivated. No drone-swoop cliché unless the day's lesson IS crane movement. |
| Odysseus | 40s, black curled beard, weathered olive skin, scarred forearms, oxblood chiton, bronze corselet. Never a real actor's face. |
| Ship | Single-masted penteconter, 25 oars/side, bone sail with faded octopus emblem, eye painted on prow |

## Daily loop (the "no slop" gate)

1. Read today's row in `SHOT_LIST.md`; study the craft topic (1 paragraph of
   notes into `DAILY_LOG.md` — what the technique does, one master example).
2. Generate a **style-anchor still first** (image model), check it against the
   look table. Reject until the still is right — stills are cheap, video is not.
3. Animate the approved still (10s video). **Max 2 video takes/day.**
4. QA the clip frame-by-frame: warped anatomy, morphing objects, text artifacts,
   physics breaks, continuity vs. the locked look → any hit = reject take.
5. Deliver the clip file to Anthony + 1-line craft note. Log DONE/REJECTED
   counts and learnings in `DAILY_LOG.md`. Commit the log (not the video files —
   videos go to Anthony directly; repo stays light).
6. If both takes fail QA: ship nothing, log why, retry tomorrow with a fixed
   prompt. A missed day beats a shipped embarrassment.

## Budget guardrail

- Per-day cap: **1 approved still (+rejects) + max 2 video takes ≈ $5–15/day.**
- Monthly review at Daily Closeout; Anthony can stop the routine any day.
- Engine: Runway (Anthony's personal workspace). Higgsfield free tier is not
  used for video (10 credits only).

## File conventions

- Clip name: `ody-s{NNN}-d{day}-t{take}.mp4` (e.g. `ody-s001-d01-t1.mp4`).
- Anthony's edit bin mirrors shot numbers; shots are designed to cut in
  sequence order but survive reordering.
