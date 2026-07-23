#!/usr/bin/env python3
"""Tests for traffic_ledger.py — run: python -m unittest test_traffic_ledger -v"""

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).parent / "traffic_ledger.py"


def run(*args: str):
    return subprocess.run(
        [sys.executable, str(SCRIPT), *args], capture_output=True, text=True
    )


def entry(**over):
    base = {
        "captured_at": "2026-07-23",
        "project": "amma-fina-calle",
        "period": "7d",
        "source": "screenshot",
        "visitors": 100,
        "pageviews": 250,
    }
    base.update(over)
    return json.dumps(base)


class TrafficLedgerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.ledger = str(Path(self.tmp.name) / "ledger.jsonl")

    def tearDown(self):
        self.tmp.cleanup()

    def test_append_and_report(self):
        r = run("append", "--entry-json", entry(), "--ledger", self.ledger)
        self.assertEqual(r.returncode, 0, r.stderr)
        out = run("report", "--ledger", self.ledger, "--today", "2026-07-24").stdout
        self.assertIn("100 visitors", out)
        self.assertIn("250 page views", out)
        self.assertNotIn("stale", out)

    def test_duplicate_rejected(self):
        run("append", "--entry-json", entry(), "--ledger", self.ledger)
        r = run("append", "--entry-json", entry(), "--ledger", self.ledger)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("duplicate", r.stderr)

    def test_missing_required_field_rejected(self):
        bad = json.loads(entry())
        del bad["period"]
        r = run("append", "--entry-json", json.dumps(bad), "--ledger", self.ledger)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("period", r.stderr)

    def test_needs_at_least_one_metric(self):
        r = run(
            "append",
            "--entry-json",
            entry(visitors=None, pageviews=None),
            "--ledger",
            self.ledger,
        )
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("at least one", r.stderr)

    def test_delta_same_period_only(self):
        run("append", "--entry-json", entry(captured_at="2026-07-16", visitors=80), "--ledger", self.ledger)
        run("append", "--entry-json", entry(captured_at="2026-07-20", period="30d", visitors=999), "--ledger", self.ledger)
        run("append", "--entry-json", entry(captured_at="2026-07-23", visitors=100), "--ledger", self.ledger)
        out = run("report", "--ledger", self.ledger, "--today", "2026-07-23").stdout
        # Delta must compare 100 vs 80 (same 7d series), never vs the 30d 999 entry.
        self.assertIn("+20", out)
        self.assertIn("+25%", out)

    def test_stale_flagged(self):
        run("append", "--entry-json", entry(), "--ledger", self.ledger)
        out = run("report", "--ledger", self.ledger, "--today", "2026-07-30").stdout
        self.assertIn("stale", out)

    def test_empty_ledger_report(self):
        out = run("report", "--ledger", self.ledger).stdout
        self.assertIn("No traffic data yet", out)


if __name__ == "__main__":
    unittest.main()
