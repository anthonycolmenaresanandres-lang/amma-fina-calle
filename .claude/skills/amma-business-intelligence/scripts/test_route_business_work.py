#!/usr/bin/env python3

import argparse
import json
import tempfile
import unittest
from pathlib import Path

from route_business_work import learning_report, load_map, record_outcome, route


INSTALLED = {
    "gather-business-context",
    "kpi-reporting",
    "sales-company-research",
    "prioritize-accounts",
    "enrich-company-and-contact-data",
    "fina-calle-client-onboarding",
    "web-studio",
    "agent-browser-verify",
    "campaign-launch-system",
    "amma-video-game-visuals",
    "product-business-analysis",
    "payments",
    "design-kpis",
    "market-sizing",
    "build-competitive-brief",
    "codex-workflow-builder",
    "select-skill",
}


class BusinessIntelligenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        map_path = Path(__file__).resolve().parent.parent / "references" / "operating-map.json"
        cls.operating_map = load_map(map_path)

    def result(self, query, installed=None):
        return route(query, self.operating_map, INSTALLED if installed is None else installed)

    def test_morning_command_routes_to_context(self):
        result = self.result("Run today's AMMA morning command and find the bottleneck")
        self.assertEqual(result["workflow"], "morning_command")
        self.assertEqual(result["role"], "CEO/Strategist")
        self.assertEqual(result["primary_skill"], "gather-business-context")
        self.assertEqual(result["confidence"], "high")

    def test_local_lead_research_routes_to_sales_research(self):
        result = self.result("Find qualified restaurant leads near Virginia Beach")
        self.assertEqual(result["workflow"], "revenue_power_hour")
        self.assertEqual(result["role"], "Revenue Producer")
        self.assertEqual(result["primary_skill"], "sales-company-research")

    def test_grounded_pipeline_prefers_prioritization(self):
        result = self.result("Prioritize the existing lead tracker pipeline for the revenue power hour")
        self.assertEqual(result["primary_skill"], "prioritize-accounts")

    def test_onboarding_routes_to_factory_skill(self):
        result = self.result("Onboard a new restaurant client and complete client intake")
        self.assertEqual(result["workflow"], "client_onboarding")
        self.assertEqual(result["primary_skill"], "fina-calle-client-onboarding")

    def test_finance_review_is_not_payment_integration(self):
        result = self.result("Reconcile Stripe and Zelle payment status for overdue clients")
        self.assertEqual(result["workflow"], "finance_review")
        self.assertEqual(result["primary_skill"], "product-business-analysis")

    def test_payment_integration_prefers_payments(self):
        result = self.result("Integrate a Stripe subscription checkout")
        self.assertEqual(result["primary_skill"], "payments")

    def test_business_learning_routes_to_workflow_builder(self):
        result = self.result("Improve our business automation intelligence so it is always learning")
        self.assertEqual(result["workflow"], "automation_improvement")
        self.assertEqual(result["primary_skill"], "codex-workflow-builder")

    def test_external_actions_return_gates(self):
        result = self.result("Find restaurant leads and send them outreach emails")
        self.assertIn("external_write", result["approval_gates"])

    def test_unmatched_request_stays_low_confidence(self):
        result = self.result("Explain why the sky is blue")
        self.assertIsNone(result["workflow"])
        self.assertIsNone(result["primary_skill"])

    def test_missing_specialists_report_capability_gap(self):
        result = self.result("Run the morning command", installed=set())
        self.assertEqual(result["decision"], "capability_gap")
        self.assertIsNone(result["primary_skill"])

    def test_record_and_report_verified_outcomes(self):
        with tempfile.TemporaryDirectory() as directory:
            state_file = Path(directory) / "outcomes.jsonl"
            args = argparse.Namespace(
                workflow="revenue_power_hour",
                recommended_skill="sales-company-research",
                actual_skill="sales-company-research",
                success="yes",
                kpi_result="Five prospects advanced to dated next actions",
                lesson="Verified local sources improved qualification quality",
                state_file=str(state_file),
            )
            record_outcome(args, self.operating_map)
            report = learning_report(state_file)
            self.assertEqual(report["total_verified_outcomes"], 1)
            self.assertFalse(report["routing_change_authorized"])

    def test_record_rejects_pii(self):
        with tempfile.TemporaryDirectory() as directory:
            args = argparse.Namespace(
                workflow="revenue_power_hour",
                recommended_skill="sales-company-research",
                actual_skill="sales-company-research",
                success="yes",
                kpi_result="Contacted owner@example.com",
                lesson="Good result",
                state_file=str(Path(directory) / "outcomes.jsonl"),
            )
            with self.assertRaises(ValueError):
                record_outcome(args, self.operating_map)


if __name__ == "__main__":
    unittest.main()
