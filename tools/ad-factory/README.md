# Ad factory

Renders the local restaurant campaign creative from HTML templates to PNGs sized
for Meta and Google. The campaign itself is documented in
`GROWTH/ONLINE_AD_CAMPAIGN.md` — read that first; this is only the renderer.

```bash
npm install
node render.mjs                          # every variant, every size
node render.mjs --variant b-flat-price   # one angle
node render.mjs --size story             # one placement
```

Output goes to `output/ads/` — twelve images plus `AD_COPY_SHEET.txt` so the copy
can be reviewed without opening a single file. One `AD_FACTORY_RESULT` line is
printed; parse that, not the log.

## Why it is built this way

Deterministic and offline. The artwork is HTML/CSS in the Fina Calle palette
painted by the Chromium already installed in this environment, plus a QR code
generated locally. No AI-generated art, no licensed stock, no client logo or
photograph, no network call. The same `campaign.mjs` always produces the same
images, so a copy change is reviewable as a diff.

Editing copy means editing `campaign.mjs` — every headline, proof line and CTA
lives there, which is also where the honesty rule is stated: a line may only
claim what `SALES_DEMO_PACKAGE/FEATURE_STATUS_TABLE.md` marks live.

## What this does not do

It does not upload, publish, schedule or spend. Connecting ad accounts, setting a
budget and pressing publish are Anthony's, permanently.
