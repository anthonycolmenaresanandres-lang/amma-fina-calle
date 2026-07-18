#!/usr/bin/env python3

import tempfile
import unittest
from pathlib import Path

from select_skill import build_result, discover_skills, rank_skills


SKILLS = {
    "documents": "Create and edit Word DOCX documents.",
    "frontend-design": "Build polished frontend UI and web layouts.",
    "deployments-cicd": "Deploy and verify Vercel production applications.",
    "amma-video-game-visuals": "Create video, motion graphics, sprites, and Phaser game visuals.",
    "security-threat-model": "Create repository-grounded security threat models.",
    "web-design-guidelines": "Audit UI accessibility and web interface quality.",
    "gmail": "Read, triage, summarize, draft, and send Gmail messages.",
    "plugin-creator": "Create and scaffold Codex plugins.",
    "spreadsheets": "Create and analyze Excel XLSX and CSV spreadsheet files.",
    "excel-live-control": "Control an open or active Microsoft Excel workbook.",
    "github": "Manage GitHub repositories and pull requests.",
    "gh-fix-ci": "Diagnose and fix failing GitHub pull request CI checks.",
    "select-skill": "Deterministically select installed skills for Haiku-class and small less-capable models.",
}


class SelectorTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        for name, description in SKILLS.items():
            directory = self.root / name
            directory.mkdir()
            (directory / "SKILL.md").write_text(
                f"---\nname: {name}\ndescription: {description}\n---\n",
                encoding="utf-8",
            )
        self.skills = discover_skills([self.root])

    def tearDown(self):
        self.temp.cleanup()

    def result(self, query):
        candidates, gates = rank_skills(query, self.skills)
        return build_result(query, candidates, gates, 5)

    def test_explicit_skill_wins(self):
        result = self.result("Use $security-threat-model on this repository")
        self.assertEqual(result["primary"], "security-threat-model")
        self.assertEqual(result["confidence"], "high")

    def test_video_routes_to_shared_visual_skill(self):
        result = self.result("Create a vertical promotional video with captions")
        self.assertEqual(result["primary"], "amma-video-game-visuals")
        self.assertIn(result["confidence"], {"high", "medium"})

    def test_provider_and_risk_are_independent(self):
        result = self.result("Deploy the frontend to Vercel production")
        self.assertEqual(result["primary"], "deployments-cicd")
        self.assertIn("external_write", result["approval_gates"])
        self.assertIn("production", result["approval_gates"])

    def test_artifact_skill_beats_broad_ui_match(self):
        result = self.result("Create a Word document with this content")
        self.assertEqual(result["primary"], "documents")

    def test_unmatched_request_does_not_fake_confidence(self):
        result = self.result("Explain photosynthesis to a child")
        self.assertIn(result["confidence"], {"low", "none"})
        self.assertIsNone(result["primary"])

    def test_ui_audit_routes_to_review_skill(self):
        result = self.result("Audit this UI for accessibility problems")
        self.assertEqual(result["primary"], "web-design-guidelines")

    def test_send_email_keeps_external_write_gate(self):
        result = self.result("Send this email through Gmail")
        self.assertEqual(result["primary"], "gmail")
        self.assertIn("external_write", result["approval_gates"])

    def test_plugin_creation_prefers_specific_creator(self):
        result = self.result("Create a Codex plugin for this workflow")
        self.assertEqual(result["primary"], "plugin-creator")

    def test_new_spreadsheet_does_not_require_live_excel(self):
        result = self.result("Build an Excel spreadsheet from this CSV")
        self.assertEqual(result["primary"], "spreadsheets")

    def test_open_workbook_uses_live_excel(self):
        result = self.result("Edit the currently open Excel workbook")
        self.assertEqual(result["primary"], "excel-live-control")

    def test_failing_pr_checks_use_ci_specialist(self):
        result = self.result("Debug the failing GitHub pull request checks")
        self.assertEqual(result["primary"], "gh-fix-ci")

    def test_small_model_selection_routes_to_selector(self):
        result = self.result("I need skill selection for a less capable Haiku model")
        self.assertEqual(result["primary"], "select-skill")
        self.assertEqual(result["confidence"], "high")


if __name__ == "__main__":
    unittest.main()
