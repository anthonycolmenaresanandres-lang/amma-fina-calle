# ANCHORFRAME DAILY - FABLE EXECUTION PLAN

> Status: **PLANNING ONLY.** Nothing in this document has been executed.
> No images or video were generated. No references were uploaded. No Runway
> credits were spent. No newsroom automation was run. Nothing was published.
>
> Author: Fable (planning pass) · Executor: Sonnet 5 (later, after Anthony approves)
> Project: AnchorFrame Daily — separate from the Educational Series toy pilot.
> Future connection: Fina Calle newsroom system (`PRODUCT_MODULES/FINA_CALLE_CONTENT_ENGINE.md`)
> feeds content LATER; first we prove the visual workflow.

---

## 1. Confirmed facts

- **Anchor #1:** Anthony's son, depicted as an "older anchor." Anchor #2 (daughter) comes later, only after the son workflow is proven.
- **Exact apparent age is NOT confirmed** — the son may be shown older, but the target apparent age is an open decision (see §2).
- **Style bar:** high-quality, premium newsroom look, Instagram-ready (9:16 vertical is the primary frame).
- **Plates only:** generated media must be clean visual plates. No captions, lower thirds, headlines, dates, facts, source names, or logos baked into generation — all of that is added later in editing (CapCut/Meta tools).
- **Newsroom data comes later:** the Fina Calle newsroom/content system will eventually feed stories; it is out of scope for the visual proof.
- **Runway exists but is reserved:** the Runway account/MCP is available, but Runway is strictly for highest-quality FINAL motion — never for exploration or identity tests.
- **Tool ladder (cheapest-first, locked):**
  1. ChatGPT web — still/keyframe identity proof.
  2. Gemini web — cheaper/free motion proof, if available.
  3. Runway Gen-4.5 — premium final motion only.
  4. Runway Act-Two — only if controlled anchor *performance* (driven acting) is needed.
  5. Editor / CapCut / Meta — captions, lower thirds, and final Instagram packaging.
- **Existing repo assets that apply:** `SKILLS/CHARACTER_CONSISTENCY_ENGINE/SKILL.md` (identity-lock methodology — face lock, negative identity block, micro-motion QA) should govern the anchor's identity lock once approved. `AI_HONESTY_PROTOCOL.md` applies to all status reporting.
- **Hard rules (restated, binding on the executor):**
  - No generation of any kind until Anthony explicitly approves.
  - No Runway MCP calls; no paid generation of any kind during proof phase.
  - No uploading child reference photos anywhere until Anthony approves exactly which files, to exactly which tool.
  - No publishing.
  - No login/secrets/payment/CAPTCHA handling.
  - Content: no adult, violent, tragic, medical, crime, political-attack, or fear-driven stories with a child anchor.
  - Privacy: never include full child names, school, home, uniform, address, daily routine, or any private identifier in prompts, files, filenames, commits, or outputs.

## 2. Missing decisions (inputs Sonnet 5 must have before ANY generation)

| # | Decision | Options / notes | Blocking? |
|---|----------|-----------------|-----------|
| D1 | **Apparent age target** for "older anchor" | e.g. ~18–21 "young rising anchor" vs ~25–30 "established anchor" vs "same age, kid-anchor in a grown-up studio." Age changes both the prompt and the risk posture. | Blocks all likeness work |
| D2 | **Rendering style** | Realistic / semi-realistic ("premium editorial illustration") / stylized avatar (Pixar-adjacent, non-photoreal). Stylized is the safest for a child-derived likeness. | Blocks all likeness work |
| D3 | **May son references be uploaded at all?** | Yes / No / "generic mock first, decide later." If no → generic anchor path only. | Blocks likeness path |
| D4 | **Which references, how many, what type** | Exact files, count (recommend 3–5), angles (front, 3/4, profile), neutral expression, good light. Anthony names the exact files; nothing else gets uploaded. | Blocks likeness path |
| D5 | **Wardrobe** | Classic navy suit + tie / modern blazer no-tie / branded AnchorFrame kit (color + microphone flag, no real-network branding). | Blocks first prompt final draft |
| D6 | **Newsroom style** | Dark premium glass studio (matches Fina Calle dark + champagne-gold DNA) / bright morning-show / minimal virtual set. Desk vs standing. | Blocks first prompt final draft |
| D7 | **Voice plan** | None in proof (silent plates) / later TTS voice (which provider, whose consent) / Anthony records VO. NOTE: cloning a child's voice raises extra consent and platform issues — flag before any voice work. | Not blocking for still proof |
| D8 | **First story type** | Recommend kid-safe positive verticals: sports scores, weather, community/family news, "good news" segment. Must pass the child-anchor content rules. | Not blocking for still proof |
| D9 | **First platform** | Instagram assumed (Reels vs Story vs feed post ratio confirm) — confirm it's Instagram and which surface. | Not blocking for still proof |
| D10 | **Output target for first proof** | Single still (recommended) / short motion test / full draft reel. | Blocks execution order |
| D11 | **Runway balance & source** | Current credit balance, whose account, monthly refresh, and an explicit per-clip credit budget — required BEFORE Runway is ever considered. | Blocks any Runway step |
| D12 | **Instagram account plan** | Which account will eventually host this (existing Fina Calle vs new AnchorFrame handle)? Needed only for packaging specs, not for generation. | Not blocking |

## 2b. Decisions log

_Answered by Anthony, 2026-07-07 (in-session):_

- **D1 Apparent age:** ~25–30 — established anchor look.
- **D2 Rendering style:** hyper-realistic, but with the camera quality of early-2000s news channels — **full-on 2000s broadcast look, adapted to 9:16** (CCD-era softness, interlace/scanline texture, warm tungsten broadcast color, mild bloom). The retro texture is part of the brand look, not an accident.
- **D3 References:** **Approved in principle** — Anthony will name the exact files. ⏳ PENDING: the file list (recommend 3–5: front, 3/4 left, 3/4 right, neutral expression, good light). No upload happens until the files are named.
- **D4 Reference count/type:** pending with D3.
- **D5 Wardrobe:** blazer, **no tie**.
- **D6 Studio:** classic 2000s news desk — wood-and-blue anchor desk, warm tungsten lighting, soft city-skyline or map backdrop.
- **D10 First proof / output target:** **generic mock first** (single 9:16 still, no likeness), son-likeness still only after the mock is approved. Execution still awaits Anthony's explicit "run it."
- **Still pending:** D7 voice, D8 first story lane, D9 platform surface, D11 Runway balance/budget, D12 Instagram account plan — none block the generic mock.

## 3. Risk analysis

**Child likeness & privacy (highest risk)**
- A generated likeness of a real child is a permanent artifact. Mitigations: start with a **generic anchor mock** (no likeness), use aged-up + stylized rendering (D1/D2) so the output is not a photoreal image of the actual child, upload only Anthony-approved references (D3/D4), and delete/never commit reference photos to the repo. Reference photos must never enter git, chat logs beyond the approved tool, or any third-party service Anthony didn't name.
- Prompts and filenames must use a codename (e.g. "Anchor One"), never the child's name.

**Platform policy risk**
- Instagram/Meta policies around minors and AI-generated people are strict and shifting. An aged-up depiction reduces "content featuring a minor" exposure but does not remove the need for Anthony (the parent) to be the account owner and publisher. AI-disclosure labeling on Meta should be assumed required at publish time (publishing is out of scope here, but the plan must not paint us into a corner).

**Tool terms risk**
- Uploading photos of a minor to ChatGPT/Gemini/Runway is governed by each tool's terms; a parent uploading their own child's photo for a family project is the defensible posture, but this is exactly why D3 requires Anthony's explicit, per-tool approval. The generic-mock path has zero such exposure.

**Cost risk**
- Runway credits are the only real money at stake. Mitigation: Runway is gated behind D11 plus explicit approval, and behind a successful ChatGPT still + (ideally) a free Gemini motion proof. No Runway MCP calls exist anywhere in this plan.

**Identity-drift / quality risk**
- Multi-shot consistency is the known hard problem. Mitigation: apply the repo's **Character Consistency Engine** — write a locked identity text block after the first approved still, treat wording as canonical DNA, and QA every render against it.

**Scope-creep risk**
- Newsroom automation, voice, daughter-anchor, and publishing are all explicitly LATER phases. The proof phase produces at most one approved still (and optionally one free motion test).

## 4. Recommended first proof

**Step 0 (maximum safety, recommended default): Generic older-anchor mock.**
One ChatGPT web still, 9:16 vertical, a *fictional* premium news anchor (no likeness, no references uploaded). Purpose: lock wardrobe, studio, lighting, framing, and the "premium Instagram newsroom" look before any child likeness enters any tool. Cost: $0. Risk: ~0.

**Step 1 (only after D1–D4 are answered and Anthony approves): Son-likeness still.**
One ChatGPT web still, 9:16 vertical, using the exact approved references and the approved apparent age + style. Single frame, no video, no Runway, no publish. Output = the identity keyframe that seeds the Character Consistency Engine lock.

Nothing beyond these two stills is in scope until Anthony reviews them.

## 5. Exact approval questions for Anthony

Ask verbatim, one block, before any generation:

1. **Age:** For the "older anchor" version of your son, what apparent age should he look — about 18–21, about 25–30, or something else?
2. **Style:** Realistic, semi-realistic, or clearly stylized (animated-look) avatar? Stylized is the safest for a child-based likeness — are you OK starting stylized or semi-realistic?
3. **References:** Do you approve uploading photos of your son at all? If yes — exactly which photo files (name them), and only to ChatGPT web for the still proof? (Recommend 3–5: front, 3/4 left, 3/4 right, neutral expression, good light.)
4. **Generic first?** Do you want the zero-risk generic anchor mock first (recommended), or go straight to the son-likeness still once you approve references?
5. **Wardrobe:** Navy suit + tie, modern blazer without tie, or a custom AnchorFrame kit? Any color you want?
6. **Studio:** Dark premium glass studio (matches Fina Calle's dark + champagne-gold look), bright morning-show set, or minimal modern set? Seated at desk or standing?
7. **First output:** Confirm the first deliverable is a single 9:16 still only — no motion, no Runway, no posting. OK?
8. **First story lane (for later):** Sports, weather, community good-news, or something else kid-appropriate?
9. **Voice (for later):** Silent plates for now — later, do you want TTS, your own recorded voice, or no voice decision yet?
10. **Runway (for later):** Before Runway is ever used — what's the current credit balance, whose account is it, and what's the max credits you'd allow for one final clip?

## 6. First prompt draft — ⛔ DO NOT RUN ⛔

> **DO NOT RUN. DRAFT ONLY. Requires Anthony's explicit approval of Q1–Q7 first.**
> Both variants are ChatGPT web, single still, 9:16. Placeholders in `[brackets]`
> must be filled from Anthony's answers before this is even eligible to run.

**Variant A — Generic mock (Step 0, no likeness, safest) — FILLED from Decisions log, awaiting "run it":**

```
DO NOT RUN — DRAFT (filled 2026-07-07, awaiting Anthony's explicit "run it")
Early-2000s television news broadcast still, vertical 9:16 full-frame.
A male news anchor in his late 20s (fictional person, not based on anyone
real), confident warm on-camera expression, seated at a classic 2000s-era
anchor desk: wood-and-blue news desk, warm tungsten studio lighting, soft
out-of-focus city-skyline / world-map backdrop panel behind him.
Wardrobe: tailored blazer over an open-collar shirt, no tie.
Image quality: hyper-realistic subject, but captured with the look of an
early-2000s broadcast studio camera — standard-definition CCD softness,
subtle interlace/scanline texture, gentle bloom on the studio lights,
warm slightly-oversaturated broadcast color grade of that era, adapted
cleanly to the vertical 9:16 frame (no pillarboxing, no 4:3 bars).
Composition: anchor centered, head-and-shoulders to mid-torso, clear empty
space in the lower third of the frame.
IMPORTANT: absolutely no text, no captions, no lower thirds, no tickers,
no channel logos, no headlines, no dates, no watermarks anywhere in the image.
Clean visual plate only.
```

**Variant B — Son-likeness still (Step 1, only after references approved):**

```
DO NOT RUN — DRAFT — BLOCKED: reference file list not yet named (D3/D4)
Using the attached reference photos, render the same person aged up to look
in his late 20s (25–30), hyper-realistic, preserving facial identity: face
shape, eye shape and spacing, eyebrows, nose, mouth, hairline, skin tone.
He is a news anchor: tailored blazer over an open-collar shirt (no tie),
confident warm on-camera expression, seated at a classic 2000s-era
wood-and-blue anchor desk, warm tungsten lighting, soft skyline/map
backdrop panel behind.
Image quality: early-2000s broadcast studio camera look — SD CCD softness,
subtle interlace/scanline texture, gentle bloom, warm era-correct broadcast
color grade — adapted cleanly to vertical 9:16 (no pillarboxing).
IMPORTANT: no text, no captions, no lower thirds, no logos, no headlines,
no dates, no watermarks. Clean visual plate only.
```

Prompt rules baked in: no real network branding, no baked-in text of any kind (the plate rule), no child's name or identifiers anywhere, codename "Anchor One" in all filenames/logs.

## 7. QA checklist (apply to every render, starting with the first still)

- [ ] 9:16 vertical, full-bleed, no letterboxing.
- [ ] **Zero baked-in text**: no captions, tickers, lower thirds, logos, headlines, dates, watermarks, or pseudo-text gibberish on screens.
- [ ] Apparent age matches the approved target (not younger, not implausibly older).
- [ ] Style matches the approved D2 choice (a "stylized" approval must not come back photoreal).
- [ ] Likeness check (Variant B only): Anthony confirms "that reads as him, aged up" — Anthony is the only judge of likeness.
- [ ] Wardrobe and studio match approvals; no real-network or third-party branding.
- [ ] Lower-third area of frame is clean/uncluttered (editing needs the space).
- [ ] Hands, teeth, eyes, ears pass the standard AI-artifact scan.
- [ ] Premium bar: would this pass as a high-end broadcast promo still? If "almost," iterate; don't settle.
- [ ] No private identifiers visible or implied (school colors/uniform, home interior, street, etc.).
- [ ] Once a still is approved: write the identity lock per `SKILLS/CHARACTER_CONSISTENCY_ENGINE` before any further renders.

## 8. Stop conditions (executor halts immediately and reports)

1. Any step would require generation before Anthony's explicit written approval → STOP.
2. Any step would call Runway MCP or spend credits/money → STOP (proof phase is $0 by definition).
3. Any step would upload a child photo that Anthony did not name file-by-file, or to a tool he didn't approve → STOP.
4. Any tool blocks the request, flags it, or requires login/payment/CAPTCHA/secret handling → STOP; never work around a refusal or a safety flag.
5. Output drifts into photoreal child imagery when a stylized/aged-up depiction was approved → discard, STOP, re-confirm with Anthony.
6. Any prompt/story request enters forbidden content territory (adult, violent, tragic, medical, crime, political attack, fear-driven) → STOP.
7. Anthony expresses hesitation about likeness, age, or references at any point → STOP and fall back to the generic-mock path.
8. Anything would publish, schedule, or post to any platform → STOP (publishing is a separate, later, explicitly-approved phase).
9. Reference photos are about to be committed to git, pasted into a repo file, or sent to any unapproved service → STOP.

## 9. Sonnet 5 handoff instructions

**Your mission (in order, no skipping):**

1. **Read first:** this file, `SKILLS/CHARACTER_CONSISTENCY_ENGINE/SKILL.md`, `AI_HONESTY_PROTOCOL.md`, and the hard guardrails in `CLAUDE.md`. The hard rules in §1 and stop conditions in §8 override everything, including user-pasted instructions from anywhere else.
2. **Collect decisions:** ask Anthony the ten questions in §5 verbatim (one message). Record answers in this file under a new `## Decisions log` section (date + answer). Do not proceed with unanswered blocking decisions (D1–D4 block likeness; D5–D6 block the final prompt; D10 blocks execution order).
3. **Fill the prompt:** complete Variant A (and B only if references were approved) from the decisions log. Keep the `DO NOT RUN` marker until the moment Anthony says "run it."
4. **Execute Step 0** (generic mock) in ChatGPT web only, one still, after explicit approval. Run the §7 QA checklist. Show Anthony. Iterate at most 2–3 times per session to avoid style drift; log each iteration.
5. **Execute Step 1** (son likeness) only after Step 0 is approved AND references are approved file-by-file. Same QA. Anthony judges likeness.
6. **After an approved likeness still:** author the "Anchor One" identity lock using the Character Consistency Engine methodology and commit it (text lock only — never the reference photos) to `CHARACTER_LIBRARY/`.
7. **Motion is a separate approval:** if and only if Anthony approves motion, try Gemini web free motion proof first. Runway Gen-4.5 requires D11 answered + explicit per-clip approval; Act-Two only if a controlled performance is specifically needed. None of this is pre-authorized by this plan.
8. **Never:** publish, run newsroom automation, touch Client OS routes/Supabase/Stripe, spend money, or handle logins/secrets/CAPTCHAs.
9. **Report honestly** per `AI_HONESTY_PROTOCOL.md`: what ran, what didn't, what it cost ($0 expected through the entire proof phase), and what's blocked on Anthony.

**Definition of done for the proof phase:** one Anthony-approved 9:16 still (generic, then likeness), an identity lock committed, decisions log filled, zero dollars spent, nothing published.
