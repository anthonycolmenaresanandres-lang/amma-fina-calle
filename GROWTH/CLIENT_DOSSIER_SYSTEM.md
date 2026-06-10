# Client Dossier System — research + free-tool stack

_The intake "station" of the factory: for any prospect, auto-assemble a
standardized **public-data dossier** that feeds the acquisition loop's Tailored
Demo Hook and the discovery call. Cheap, repeatable, AI-run._

> **Key insight:** the off-the-shelf "AI prospecting" industry (ZoomInfo, Apollo,
> 150+-provider enrichment) is built for **B2B enterprise firmographics** — funding,
> tech stack, org charts. **We don't need any of that.** Our prospects are **local
> restaurants/cafés**, and everything we need is **public and free**: name, address,
> hours, phone, website, socials, reviews, signature items, brand colors. So we
> skip the expensive stack and assemble the dossier from free sources + an LLM.

## How these systems are built (the pattern)
Five capabilities, usually wired as a small multi-agent pipeline:
1. **Discovery** — find/identify the business.
2. **Enrichment** — pull data from external sources.
3. **Qualification** — score fit.
4. **Synthesis** — an LLM cross-references the data into a "theory of the account."
5. **Delivery** — output the dossier (doc/Slack/Sheet).
Orchestration is either a framework (LangChain/Airflow) or no-code (**n8n**) — or,
for us, **just an LLM with web tools** (Claude/ChatGPT already do discovery →
enrichment → synthesis in one agent).

## Free tools & resources (vetted, ranked for our use)
**Data sources (local business):**
- **OpenStreetMap + Nominatim** — free under ODbL; name/address/coords/hours. Public
  endpoint = 1 req/sec (or self-host). The free backbone.
- **BizData API** — free, **no API key/signup**, OSM-backed; returns JSON name,
  address, phone, website, hours across 37 categories. Easiest drop-in.
- **Foursquare Places** — free tier; ratings, photos, tips, hours (100M+ POIs).
- **Yelp Places API** — **free 30-day trial**; good for review text + photos.
- **AVOID Google Places** — removed its free tier (Feb 2025), now ~$275/mo minimum.
- **Direct fetch** — the prospect's **website + Instagram** (public pages) for menu,
  signature items, brand colors, voice. (This is where the Tailored-Demo inputs come from.)

**Enrichment / agent:**
- **Claude / ChatGPT with web search** — our default "machine"; no infra. _(Claude
  can run the whole dossier in-session right now where outbound web is allowed.)_
- **Fire Enrich** (open-source, ~1.1k★) — specialized research agents; self-host and
  pay only ~$0.01–0.05/enrichment on your own OpenAI key. For **bulk** lists later.

**Orchestration (optional, for a persistent no-code pipeline):**
- **n8n** (free self-host) — free "deep research / dossier" templates (Research →
  Synthesis → Copywriter agents → output to Notion/Sheets/Slack). Use when volume
  outgrows in-session runs.

**Utility:**
- **Wappalyzer** (open source) — detect if a prospect already runs a QR/loyalty/online-
  ordering tool (qualification + objection prep).

## Two build paths
- **Path A — Claude-as-agent (start now, zero infra):** a dossier template + a
  per-prospect runbook; Claude does discovery→enrichment→synthesis with WebSearch/
  WebFetch. Cost ≈ model usage. Fits the factory immediately (Claude is already a
  machine on the line). **Recommended to start.**
- **Path B — n8n + free APIs (persistent, later):** self-hosted n8n pulls
  OSM/BizData/Foursquare + an LLM node, runs unattended on a lead list, outputs to
  a Sheet/Notion. Stand up when intake volume justifies it.

## The Dossier template (fields)
```
BUSINESS:     name · type · address · neighborhood · hours · price tier
CONTACT:      website · phone · Instagram/TikTok (+ follower range, cadence)
REPUTATION:   Google/Yelp rating · review count · top praise themes · top complaints
MENU:         signature item(s) · categories · price points
BRAND:        primary colors (hex) · logo present? · voice/vibe
COMPETITION:  2–3 nearby similar spots · what they do differently
TECH IN USE:  existing QR/menu/loyalty/online-order tool? (Wappalyzer)
FIT SCORE:    HOT/WARM/COLD + one-line why
HOOK INPUTS:  signature item → collectible card idea · brand colors → game recolor
NEXT ACTION:  recommended opener + which demo asset to build
```

## Per-prospect runbook (what Claude runs)
1. Resolve the business (BizData/OSM/Foursquare) → fill BUSINESS/CONTACT.
2. Fetch website + Instagram → MENU, BRAND (extract hex colors), voice.
3. Pull reviews (Yelp/Foursquare) → REPUTATION themes.
4. Wappalyzer/site scan → TECH IN USE.
5. Synthesize FIT SCORE + HOOK INPUTS + NEXT ACTION.
6. Emit the dossier; hand HOOK INPUTS to the Tailored Demo Hook (game recolor + sample card).

## Guardrails
- **Public data only** — no login-gated scraping, respect robots.txt/ToS, honor rate
  limits (Nominatim 1 req/sec).
- **No PII in the public repo** — dossiers with contact data live in a private/owner
  store; the in-repo template stays example-only.
- Owner verifies before outreach; Claude prepares, owner contacts.

## Live in the app — Survey (`/api/lead-arcade/dossier`)
The Lead Arcade "Survey" already calls a server route that returns address, hours,
website, phone, cuisine (OpenStreetMap), theme color + logo candidate (the site),
an operational check, and — when enabled — **Yelp** rating, review count, price,
photo, and a more reliable operational flag.
- **Enable Yelp:** add **`YELP_API_KEY`** (Yelp Fusion, free tier) to the Vercel
  project env. With no key the route silently falls back to OSM only — nothing
  breaks. No key is stored in the repo.
- **Foursquare** is a drop-in alternative/addition later (same pattern, its own key).

## Sources
- Build patterns: classicinformatics.com, datagrid.com, n8n.io (deep-research templates)
- Free data: bizdata-web.vercel.app, developers.google.com/maps (pricing), business.yelp.com, traveltime.com
- Open-source enrichment: firecrawl.dev (Fire Enrich), github.com/eracle/OpenOutreach, Wappalyzer
