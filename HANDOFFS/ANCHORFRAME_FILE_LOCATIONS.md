# AnchorFrame Daily — CANONICAL FILE LOCATIONS

> Paste the "FILE LOCATIONS" header block below into **every** agent/Codex prompt so no agent has to
> search for files. Codename "Anchor One" only — never the child's real name/home/school/address.

## Canonical LOCAL folder (Anthony's Windows machine, user `antho`)
```
C:\Users\antho\OneDrive\Desktop\AnchorFrame\
  refs\   -> the 5 cropped reference images
  docs\   -> handoff/prompt docs
  out\    -> ALL generated outputs
```
Reference images in `...\AnchorFrame\refs\`:
- `anchorOne_ref1_front_eyesopen.jpg`  (PRIMARY frontal — the strong one)
- `anchorOne_ref2_front_smile.jpg`     (DO NOT upload — laughing/eyes shut)
- `anchorOne_ref3_rightprofile.jpg`
- `anchorOne_ref4_leftprofile.jpg`
- `anchorOne_ref5_backhead.jpg`         (DO NOT upload — hair only)

Outputs in `...\AnchorFrame\out\`: `anchorOne_generic_mock_v1.png` (done),
`anchorOne_likeness_v1.png` (Step 1), `anchorOne_motion_proof_v1.mp4` (Step 2).

## Google Drive
- Docs: folder **"AnchorFrame Daily — DOCS"** — https://drive.google.com/drive/folders/1jkGWLX2gPvdP-dHDvwycf00SzHvlFQU4
  - `AnchorFrame Daily — AGENT HANDOFF (READ FIRST).md` (self-contained: locations + all prompts)
  - `ANCHOR_ONE_IDENTITY_LOCK.md`
- Reference images (Anthony populates): folder **"AnchorFrame Daily - Anchor One references (cropped, private)"** — https://drive.google.com/drive/folders/1Gml5Ypv7yNXV7KycVv2Pjzzj3A1MtFTZ

## Master plan (full)
GitHub `anthonycolmenaresanandres-lang/amma-fina-calle`, branch `claude/anchorframe-daily-plan-aj7jmr`,
PR #148 — `PRODUCT_MODULES/ANCHORFRAME_DAILY_FABLE_EXECUTION_PLAN.md`.

---

## Reusable header to prepend to EVERY prompt

```
FILE LOCATIONS (exact — do not search):
- References: C:\Users\antho\OneDrive\Desktop\AnchorFrame\refs\  (upload anchorOne_ref1/ref3/ref4 only)
- Save outputs to: C:\Users\antho\OneDrive\Desktop\AnchorFrame\out\
- Docs: Google Drive "AnchorFrame Daily — DOCS", or PR #148 in the repo.
If a named file is not at its path, STOP and tell Anthony — do not search the disk or guess.
```

> The reference **images** cannot be uploaded to Drive by Claude (a minor's photo may not pass through
> the assistant transcript). Anthony places the 5 crops into `...\AnchorFrame\refs\` (and the Drive
> references folder) from his own device.
