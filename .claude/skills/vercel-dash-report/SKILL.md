---
name: vercel-dash-report
description: Ingest Vercel Web Analytics dashboard data (screenshots, CSV exports, or pasted numbers from Anthony) into the append-only traffic ledger, and render the "📊 Business" traffic section of the daily caretaker report from that ledger. Use this whenever Anthony shares a Vercel dashboard screenshot or analytics export, mentions site traffic, visitors, page views, or analytics numbers, or whenever a daily/twice-daily caretaker summary or AUTOMATION_STATUS.md refresh should include a Business/traffic section — even if he doesn't name the skill.
---

# Vercel Dash Report

Vercel Web Analytics on the current plan is **dashboard-only** (no API token). So the pipeline is:
Anthony looks at the dashboard → drops a **screenshot** (or CSV export / pasted numbers) →
Claude extracts the visible metrics → appends one entry to the **traffic ledger** →
every daily caretaker report reads the ledger and renders the traffic block.

The ledger is the single source of truth: `BUSINESS/ANALYTICS/vercel-traffic-ledger.jsonl`
(one JSON object per line, append-only, committed to `main`).

## Honesty rules (the whole point is an *accurate* report)

- Record **only numbers actually visible** in the input. Never estimate, interpolate, or
  "round to what looks right". A metric you can't read is `null`, with a note.
- Always capture the **period toggle** the dashboard was showing (Last 24 hours / 7 days /
  30 days / custom). A 7d number compared against a 30d number is misinformation — deltas
  are only computed between entries with the same `project` and `period`.
- If the screenshot isn't clearly Vercel Web Analytics for one of Anthony's projects, say so
  and ask — don't guess the project.
- The report must state data age. Stale data presented as current is worse than no data.

## Ingesting a drop (screenshot / CSV / pasted numbers)

1. Look at the input. Identify: project name, period toggle, capture date (ask or infer
   from context; default = today), and every legible metric.
2. Build one ledger entry (schema below) and append it via the script — it validates,
   de-duplicates, and keeps the file well-formed:

   ```bash
   python .claude/skills/vercel-dash-report/scripts/traffic_ledger.py append --entry-json '<json>'
   ```

3. Echo back to Anthony what was recorded (project, period, headline numbers) so he can
   catch a misread immediately.
4. Commit the ledger append on a short-lived `claude/*` branch → PR → merge when green.
   A ledger append is data-only (no code, no routes) and falls under the caretaker's
   "safe to merge" autonomy; don't leave these PRs hanging.

### Ledger entry schema

```json
{
  "captured_at": "2026-07-23",
  "project": "amma-fina-calle",
  "period": "7d",
  "source": "screenshot",
  "visitors": 1234,
  "pageviews": 5678,
  "bounce_rate": null,
  "top_pages": [{"path": "/m/colattao", "views": 321}],
  "top_referrers": [{"source": "instagram.com", "visitors": 88}],
  "devices": null,
  "countries": null,
  "notes": "bounce rate not shown in screenshot"
}
```

Required: `captured_at`, `project`, `period` (`24h`|`7d`|`30d`|free-text custom label),
`source` (`screenshot`|`csv`|`manual`), and at least one of `visitors`/`pageviews`.
Everything else is optional — omit or `null` what the input didn't show.

## Feeding the daily caretaker report

During each caretaker run (and any AUTOMATION_STATUS.md refresh), render the traffic block:

```bash
python .claude/skills/vercel-dash-report/scripts/traffic_ledger.py report
```

It prints a ready-to-paste markdown block per project: latest numbers, delta vs the previous
same-period entry, and a staleness flag (⚠️ if the newest entry is older than 3 days — the
report then asks Anthony for a fresh screenshot instead of showing old numbers as current).
Paste it into the "📊 Business" section of the summary email and AUTOMATION_STATUS.md.

## Composing with Stripe (revenue half of "📊 Business")

Traffic comes from this ledger; revenue comes live from Stripe **only if** the environment
has `STRIPE_RESTRICTED_KEY` (a read-only restricted key). If present: pull aggregate
charges/payouts/refunds via the Stripe API — aggregates only, never customer PII, never any
write call. If absent: the Business section says `Revenue: Stripe not connected` — don't
skip the line silently. The hard guardrail stands: reporting reads Stripe; nothing in this
skill ever modifies Stripe.
