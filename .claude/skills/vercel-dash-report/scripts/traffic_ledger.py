#!/usr/bin/env python3
"""Append-only Vercel traffic ledger + daily-report renderer.

Ledger: BUSINESS/ANALYTICS/vercel-traffic-ledger.jsonl (one JSON object per line).

Commands:
  append --entry-json '<json>' [--ledger PATH]   validate + de-dupe + append one entry
  report [--ledger PATH] [--today YYYY-MM-DD]    print the markdown traffic block

Stdlib only, deterministic — safe for small models and CI.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
from pathlib import Path

DEFAULT_LEDGER = Path("BUSINESS/ANALYTICS/vercel-traffic-ledger.jsonl")
REQUIRED = ("captured_at", "project", "period", "source")
SOURCES = ("screenshot", "csv", "manual")
STALE_DAYS = 3


def find_ledger(cli_path: str | None) -> Path:
    if cli_path:
        return Path(cli_path)
    # Walk up from cwd so the script works from repo root or the skill folder.
    cur = Path.cwd()
    for base in (cur, *cur.parents):
        cand = base / DEFAULT_LEDGER
        if cand.parent.is_dir():
            return cand
    return DEFAULT_LEDGER


def load_entries(ledger: Path) -> list[dict]:
    if not ledger.exists():
        return []
    entries = []
    for i, line in enumerate(ledger.read_text().splitlines(), 1):
        line = line.strip()
        if not line:
            continue
        try:
            entries.append(json.loads(line))
        except json.JSONDecodeError as e:
            sys.exit(f"ledger corrupt at line {i}: {e}")
    return entries


def validate(entry: dict) -> None:
    missing = [k for k in REQUIRED if not entry.get(k)]
    if missing:
        sys.exit(f"entry missing required field(s): {', '.join(missing)}")
    try:
        dt.date.fromisoformat(entry["captured_at"])
    except ValueError:
        sys.exit("captured_at must be YYYY-MM-DD")
    if entry["source"] not in SOURCES:
        sys.exit(f"source must be one of {SOURCES}")
    if entry.get("visitors") is None and entry.get("pageviews") is None:
        sys.exit("entry needs at least one of visitors/pageviews")
    for k in ("visitors", "pageviews"):
        v = entry.get(k)
        if v is not None and (not isinstance(v, int) or v < 0):
            sys.exit(f"{k} must be a non-negative integer or null")


def cmd_append(args: argparse.Namespace) -> None:
    entry = json.loads(args.entry_json)
    validate(entry)
    ledger = find_ledger(args.ledger)
    for prev in load_entries(ledger):
        if all(prev.get(k) == entry.get(k) for k in ("captured_at", "project", "period")):
            sys.exit(
                f"duplicate: entry for {entry['project']} {entry['period']} "
                f"@ {entry['captured_at']} already recorded"
            )
    entry.setdefault("recorded_at", dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"))
    ledger.parent.mkdir(parents=True, exist_ok=True)
    with ledger.open("a") as f:
        f.write(json.dumps(entry, separators=(",", ":")) + "\n")
    print(f"recorded: {entry['project']} {entry['period']} @ {entry['captured_at']} -> {ledger}")


def fmt_delta(cur: int | None, prev: int | None) -> str:
    if cur is None or prev is None:
        return ""
    diff = cur - prev
    pct = f", {diff / prev:+.0%}" if prev else ""
    return f" ({diff:+d}{pct} vs prior capture)"


def cmd_report(args: argparse.Namespace) -> None:
    ledger = find_ledger(args.ledger)
    entries = load_entries(ledger)
    today = dt.date.fromisoformat(args.today) if args.today else dt.date.today()
    print("### 📊 Business — Traffic (Vercel, from dashboard drops)\n")
    if not entries:
        print("- No traffic data yet — drop a Vercel Web Analytics screenshot to start the ledger.")
        return
    entries.sort(key=lambda e: e["captured_at"])
    latest_by_project: dict[str, dict] = {e["project"]: e for e in entries}
    for project, e in sorted(latest_by_project.items()):
        cap = dt.date.fromisoformat(e["captured_at"])
        age = (today - cap).days
        same_series = [
            p for p in entries
            if p["project"] == project and p["period"] == e["period"] and p["captured_at"] < e["captured_at"]
        ]
        prev = same_series[-1] if same_series else None
        parts = []
        if e.get("visitors") is not None:
            parts.append(f"**{e['visitors']:,} visitors**" + (fmt_delta(e["visitors"], prev.get("visitors")) if prev else ""))
        if e.get("pageviews") is not None:
            parts.append(f"{e['pageviews']:,} page views" + (fmt_delta(e["pageviews"], prev.get("pageviews")) if prev else ""))
        line = f"- **{project}** · last {e['period']} as of {e['captured_at']}: " + ", ".join(parts)
        print(line)
        tops = e.get("top_pages") or []
        if tops:
            top_str = ", ".join(f"`{p['path']}` ({p['views']})" for p in tops[:3])
            print(f"  - top pages: {top_str}")
        if age > STALE_DAYS:
            print(f"  - ⚠️ **stale — {age} days old.** Send a fresh dashboard screenshot for current numbers.")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("append")
    a.add_argument("--entry-json", required=True)
    a.add_argument("--ledger")
    a.set_defaults(func=cmd_append)
    r = sub.add_parser("report")
    r.add_argument("--ledger")
    r.add_argument("--today")
    r.set_defaults(func=cmd_report)
    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
