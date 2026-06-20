# Voice Personalities — Operator & Codex Runbook

How the Fina Calle voice gateway's **personalities** work, and exactly how to install / swap /
add / edit them **on Anthony's command** (he usually commands from his phone). Codex: read this
file before acting, then do precisely what the command says below. Act ONLY on Anthony's command.

## TL;DR
- A **personality = a tenant** in `services/voice-gateway/tenants.json` (a JSON array).
- An inbound call routes to a tenant **by the dialled phone number**.
- **Tester number: `+1 757 666 0078`.** Whatever tenant has that number in its `phoneNumbers`
  is the personality that answers when Anthony calls.
- **Install a personality on the tester** = give that tenant `phoneNumbers: ["+1 757 666 0078"]`
  and set **every other tenant** to `phoneNumbers: []`. Only ONE tenant may hold the number.
- **Ship** = edit `tenants.json` → validate → commit → PR → merge to `main`. **Render
  auto-deploys in ~1–3 min.** Nothing else (the number, hosting, and safety are already set up).

## Where everything lives
- Repo: `anthonycolmenaresanandres-lang/amma-fina-calle` · service dir: `services/voice-gateway`.
- Personalities: **`services/voice-gateway/tenants.json`** ← this is the only file you edit for
  install/swap/add/edit.
- Engine (don't edit unless adding a new capability): `src/realtime.ts` (uses each tenant's
  `instructions`/`knowledge`/`tools`), `src/tools.ts` (default script + shared safety), `src/server.ts`.
- Live service: **https://fina-calle-voice-gateway.onrender.com** (Render; `autoDeploy` on merge to `main`).
- `TENANTS_FILE=/app/tenants.json` is baked into the image (see `Dockerfile`), so editing
  `tenants.json` + merging is all it takes.
- **Mandatory rule:** `AI_HONESTY_PROTOCOL.md` (repo root).

## Anatomy of a personality (one tenant)
```jsonc
{
  "id": "kebab-id",                    // unique, e.g. "vbfh-info"
  "phoneNumbers": ["+1 757 666 0078"], // numbers that route here; [] = not assigned
  "connector": "proposeconfirm",       // info/Q&A lines: proposeconfirm (never books/charges)
  "tools": ["take_message"],           // info/Q&A line: take_message ONLY (no ordering/booking)
  "voice": "marin",                    // stable voice: "marin" (or "cedar"). NOT "alloy".
  "language": "English",               // default spoken language; instructions may offer others
  "business": { "name": "...", "kind": "...", "timezone": "America/New_York",
                "hours": "...", "services": [] },
  "disclosure": "...",                 // spoken greeting, said ~verbatim. MUST disclose it's an
                                       //   automated assistant and the call may be recorded.
  "instructions": "...",               // the FULL personality script (replaces the default script)
  "knowledge": "..."                   // the facts it may use (it answers ONLY from this)
}
```
- `instructions` + `knowledge` are the personality's brain. When `instructions` is present, the
  default booking script is NOT used.
- Omit `tools` → it gets all tools (booking flow). For an info/Q&A line set `["take_message"]`.

## MANDATORY rules for every personality
1. **Honesty (AI_HONESTY_PROTOCOL.md):** `instructions` MUST say: answer only from `knowledge`;
   if you don't know, say so plainly and offer to take a message; never guess/invent prices,
   times, scores, addresses, or facts.
2. **No secrets** in `tenants.json` — it's committed to git. Public info only.
3. **One tenant per number.** Installing on the tester removes the number from all others.
4. **Don't duplicate engine safety** (call caps, no-card-by-voice, anti-drift). Just keep
   `voice` = `marin`/`cedar`, and keep the honesty + "never recite live data you don't have" lines
   in `instructions`.

## Commands (what Anthony says → what Codex does)
| Anthony says | Codex does |
|---|---|
| **"Install `<id>` on the tester"** / **"Switch the tester to `<id>`"** | In `tenants.json`, set that tenant `phoneNumbers: ["+1 757 666 0078"]` and **every other** tenant `phoneNumbers: []`. Ship. Verify live. |
| **"What's on the tester?"** | `curl https://fina-calle-voice-gateway.onrender.com/tenants` and report which `id` holds `17576660078`. (No deploy.) |
| **"Add a personality: `<name>` — `<what it does>`, `<language>`, `<facts / where to point people>`"** | Append a new tenant: write `instructions` (persona + tone + the honesty rule + scope + what it must NOT do) and `knowledge` (the facts given), `tools: ["take_message"]`, `connector: "proposeconfirm"`, `voice: "marin"`, `phoneNumbers: []` (don't install unless asked), a disclosure that discloses AI + recording. Ship. Tell Anthony it's added; install on request. |
| **"Edit `<id>`: `<change>`"** | Edit that tenant's `instructions` / `knowledge` / `voice` / `disclosure` / `language` as asked. Ship. |
| **"Remove `<id>`"** | Delete that tenant (or set `phoneNumbers: []`). Ship. |

## Ship procedure (run these)
```bash
cd services/voice-gateway
node -e "require('./tenants.json')"      # must parse (valid JSON) — fix any error before continuing
npm run typecheck                         # must pass
# Optional local route check:
#   PORT=8099 TENANTS_FILE=tenants.json OPENAI_API_KEY=test npm start &
#   curl -s localhost:8099/tenants
#   curl -s -X POST localhost:8099/twiml --data "To=%2B17576660078&From=%2B10000000000"   # expect the intended tenant id
git checkout -b voice/<short-change>
git add services/voice-gateway/tenants.json
git commit -m "voice: <what changed>"
git push -u origin HEAD
gh pr create --base main --fill
gh pr merge --merge            # Anthony commanded it; Render auto-deploys on merge to main
```

## Verify LIVE (after merge, ~1–3 min for deploy)
```bash
curl -s https://fina-calle-voice-gateway.onrender.com/tenants
curl -s -X POST https://fina-calle-voice-gateway.onrender.com/twiml \
  --data "To=%2B17576660078&From=%2B10000000000"   # expect <Parameter name="tenant" value="<id>" />
```
Then report one line: "Tester `+1 757 666 0078` now answers as `<id>`. Call it to hear it." Anthony
calls the number to confirm the voice.

## Current personalities (as of this doc)
- **`vbfh-info`** — Virginia Beach Field House league assistant (English, sports-PA tone; points to
  the League Center / DaySmart for live schedules & standings).
- **`colattao-info`** — Colattao café info (English-first; offers Spanish/other languages).
- **`fina-calle`** — catch-all / default booking demo.

(Whichever tenant holds `+1 757 666 0078` is what the tester answers as.)
