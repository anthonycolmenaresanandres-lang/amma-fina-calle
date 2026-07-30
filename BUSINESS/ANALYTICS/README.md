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
