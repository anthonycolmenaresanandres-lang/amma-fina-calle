# Codex Handoff — AnchorFrame Daily, Step 0 (generic anchor mock)

> Full context brief. Do not assume prior knowledge — everything Codex needs is here.
> Companion plan (source of truth): `PRODUCT_MODULES/ANCHORFRAME_DAILY_FABLE_EXECUTION_PLAN.md` (see PR #148).
> Prepared for Codex (local agent on Anthony's machine). Nothing here has been generated yet.

## 1. Who you are in this project
You are **Codex**, the local agent on Anthony's machine. For this task your job is to **drive a Chrome browser into an already-signed-in ChatGPT session and generate one image**, then hand the file back to Anthony (and to Claude/Fable for QA). Claude/Fable runs in a cloud container and has **no ChatGPT or Gemini tool**, which is why image generation is routed to you + ChatGPT. Runway is reserved and stays off (see §8).

## 2. What AnchorFrame Daily is
A future **daily Instagram news system** with a **premium newsroom** look. The on-camera anchor will eventually be **Anthony's son**, aged up and styled as an older, established news anchor (a second anchor — his daughter — comes later). Newsroom data (from the Fina Calle system) will feed the stories later. Right now we are **only proving the visual workflow** — clean visual plates. Captions, lower thirds, headlines, dates, facts, and source names are **added later in editing**, never baked into generation. This project is separate from the Educational Series toy pilot.

## 3. What THIS task is (and is not)
**Step 0 — generic older-anchor mock.** Generate **one** still of a **fictional** premium news anchor to lock the studio/wardrobe/camera look **before** any likeness work.
- **This run uses NO photos of the son, NO reference uploads, NO likeness.** It is a generic person.
- It is the zero-risk first proof. The son-likeness step is **separate, later, and still blocked** (see §7).

## 4. The prompt to run (paste verbatim; request 9:16 vertical)
```
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
Design decisions baked into this prompt (approved by Anthony): apparent age **late 20s (25–30)**; **hyper-realistic** subject with a **full early-2000s broadcast-camera** treatment adapted to 9:16; **blazer, no tie**; **classic 2000s wood-and-blue news desk**.

## 5. Execution steps
1. Open Chrome to an **already-signed-in** ChatGPT (image-capable model).
2. Paste the §4 prompt. Explicitly ask for **9:16 vertical**.
3. If it returns 4:3-with-bars or adds any text/logo, re-prompt **once**: `make it true 9:16 vertical, remove all text/logos — clean plate only`.
4. Download the result. Save as **`anchorOne_generic_mock_v1.png`** (use the codename "Anchor One"; never a real name in filenames).
5. Hand the file to Anthony and to Claude/Fable for QA (§9). Iterate at most **2–3 times** total if off-spec; then stop and report.

## 6. Where the assets live (for LATER likeness steps — NOT this run)
- **Son reference photos:** Anthony's own device / Google Drive. A private Drive folder exists: **"AnchorFrame Daily - Anchor One references (cropped, private)"** (id `1Gml5Ypv7yNXV7KycVv2Pjzzj3A1MtFTZ`). Claude delivered **5 cropped, identifier-stripped head-and-shoulders crops** to Anthony to place there; the raw originals are on Anthony's device. **Do not use any of these for Step 0.**
- **Reference quality note:** batch 1 gave **one strong frontal**; profiles have downcast eyes. A cleaner set (straight-on, ¾-left, ¾-right, eyes open, plain wall) is still wanted before the likeness step.
- **Do NOT** pull references from: group photos with other children, shots showing the family home/street, or any birthday-invitation / screenshot graphics — those were rejected for privacy.
- The cloud container's scratchpad is **ephemeral** and not reachable by Codex; treat Anthony's local files + the Drive folder as the asset source.

## 7. Constraints — HARD RULES (do not violate)
- **No generation beyond what Anthony approved.** Right now that is ONLY the Step 0 generic mock. The **son-likeness** render is **NOT approved yet** and must not be run.
- **No reference uploads** of the son to any tool until Anthony approves exactly which files. (Not needed for Step 0 — it uses none.)
- **No Runway. No paid generation.** Runway is reserved for final motion only; Anthony will bring Claude back for that.
- **No publishing / posting** anywhere.
- **No login/secrets/payment/CAPTCHA handling.** Use an already-signed-in browser; if any auth/payment/CAPTCHA wall appears, **stop and hand back to Anthony**.
- **Plates only:** the image must contain **zero baked-in text** — no captions, lower thirds, tickers, logos, headlines, dates, or watermarks.
- **No real network/FIFA/club/real-face branding.**
- **Privacy:** never put the child's real name, school, home, address, uniform, routine, or any private identifier into prompts, filenames, or outputs. Use codename **"Anchor One."**
- **Content (for later story work, not this run):** no adult, violent, tragic, medical, crime, political-attack, or fear-driven stories with a child anchor.

## 8. Stop conditions (halt and report to Anthony)
- ChatGPT refuses or flags the request → stop; do not work around a refusal.
- Any login / 2FA / CAPTCHA / payment wall → stop.
- Output would require a reference photo, or drifts toward a real child's likeness → stop (Step 0 is generic).
- Anything would publish or leave the local machine / this workflow → stop.
- More than 2–3 iterations without a clean on-spec result → stop and report.

## 9. QA / handback (Claude/Fable will check against this)
- 9:16 vertical, full-bleed, no 4:3 bars.
- **Zero** baked-in text/logos/tickers/watermarks.
- Apparent age late 20s; hyper-realistic with the early-2000s broadcast-camera feel.
- Blazer, no tie; classic 2000s wood-and-blue desk; warm tungsten light.
- Clean, uncluttered lower third (editing needs the space).
- No AI artifacts on hands/eyes/teeth/ears.
- Reads like a high-end broadcast promo still. If "almost," iterate; don't settle.

## 10. What comes next (do not start without approval)
1. Anthony + Claude review the Step 0 mock. If approved, the **look is locked**.
2. **Son-likeness still** (Step 1) — only after Anthony approves the reference set file-by-file and gives the go. Claude will crop references to head-and-shoulders (strip home/name/jersey identifiers) before anything is uploaded.
3. After an approved likeness still, Claude writes the "Anchor One" identity lock (text only, never the photos) into `CHARACTER_LIBRARY/`.
4. **Motion** is a separate approval: Gemini web free proof first; **Runway Gen-4.5** (premium final motion) only when Anthony explicitly brings Claude back with a credit budget. Act-Two only if a controlled performance is needed.
5. Editing (CapCut/Meta) adds captions/lower-thirds and packages the Instagram post. Nothing publishes without Anthony.
