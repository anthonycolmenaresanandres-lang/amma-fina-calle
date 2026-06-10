# Lead Arcade — boosting Survey hit-rate (optional free keys)

The Lead Arcade **Survey** action (and **🔭 Survey all**) enriches each lead — hours,
phone, rating, website, theme — from **free, keyless** public data
(OpenStreetMap / Nominatim) by default. That works with **zero setup**.

To raise the match rate and add ratings/photos/hours that OSM often misses, the dossier
route (`src/app/api/lead-arcade/dossier/route.ts`) will **also** fuse **Yelp** and
**Foursquare** — but only if their (free-tier) keys are present. No code change is needed;
the route auto-activates whichever keys it finds and gracefully falls back to OSM without them.

## Add the keys (≈5 min, owner action)
1. **Yelp Fusion** — create a free app at <https://www.yelp.com/developers> → copy the API key.
2. **Foursquare Places** — create a free app at <https://foursquare.com/developers> → copy the key.
3. In **Vercel → `amma-fina-calle` → Settings → Environment Variables**, add:
   - `YELP_API_KEY` = your Yelp key
   - `FOURSQUARE_API_KEY` = your Foursquare key
   (Production scope; mark them as secrets.)
4. **Redeploy** (or push any commit). Survey now fuses OSM + Yelp + Foursquare.

## Notes
- Both are **optional**. With neither key, Survey still works on OpenStreetMap alone.
- Keys live **only in Vercel env**, never in the repo.
- Sequential pacing in "Survey all" (~0.5s/lead) keeps you within free-tier limits and
  improves match success.
