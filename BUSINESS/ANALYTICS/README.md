# BUSINESS/ANALYTICS — traffic ledger

`vercel-traffic-ledger.jsonl` is the append-only record of Vercel Web Analytics numbers,
one JSON entry per dashboard drop (screenshot/CSV/pasted numbers from Anthony).

- **Written by** the `vercel-dash-report` skill (`.claude/skills/vercel-dash-report/`) —
  entries are validated + de-duplicated by its `traffic_ledger.py` script. Don't hand-edit.
- **Read by** the daily caretaker report (`traffic_ledger.py report`) to render the
  "📊 Business" traffic section with deltas + staleness warnings.
- **To add data:** drop a Vercel Web Analytics dashboard screenshot into any Claude session
  (note which period toggle — 24h/7d/30d — the dashboard was showing).

The ledger file appears with the first recorded drop.

## Automated production traffic (2026-10-01)

The new private `/customers/traffic` dashboard and morning email query Vercel Web
Analytics directly. They do **not** read or update the screenshot ledger. Each
business is queried independently using its own project ID, verified hostname
and explicit public-page scope. No combined cross-client visitor number exists.

The site inventory, exclusions, schedule, setup and verification steps are in
`TECH_ARCHITECTURE/MULTI_SITE_TRAFFIC.md`. Keep screenshot-ledger entries labeled
with their original project, date range and source; do not add them to API totals.
