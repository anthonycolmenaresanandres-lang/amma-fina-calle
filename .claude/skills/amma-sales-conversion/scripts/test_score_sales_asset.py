#!/usr/bin/env python3

import unittest

from score_sales_asset import score_text


class SalesAssetScoreTests(unittest.TestCase):
    def test_verified_pilot_copy_is_field_ready(self):
        text = """
        Your menu should be easy to update. See Colattao's live demo, then request
        a simple pilot with written scope and a fixed quote. Nothing to download;
        we handle setup. Your private owner page lets you update your own menu.
        This demo does not include POS or payment processing. Scan to request a pilot.
        """
        result = score_text(text, "field")
        self.assertTrue(result["field_ready"])
        self.assertGreaterEqual(result["score"], 80)

    def test_unsupported_retention_claim_blocks_field_use(self):
        result = score_text("Turn first-timers into regulars and bring them back.", "field")
        self.assertIn("unsupported retention outcome", result["blocking_issues"])

    def test_placeholder_blocks_field_but_not_draft(self):
        text = "Contact [your email · phone · instagram]"
        self.assertIn("placeholder contact", score_text(text, "field")["blocking_issues"])
        self.assertNotIn("placeholder contact", score_text(text, "draft")["blocking_issues"])

    def test_false_scarcity_blocks(self):
        result = score_text("Only 2 left. Everyone is buying this pilot.", "field")
        self.assertIn("fabricated scarcity or demand", result["blocking_issues"])

    def test_no_data_collection_gets_precision_warning(self):
        result = score_text("No data collection.", "field")
        self.assertIn("overbroad privacy wording", result["warnings"])

    def test_many_questions_warn_about_competing_actions(self):
        result = score_text("Want a demo? Want pricing? Want a call?", "draft")
        self.assertIn("multiple questions may create competing calls to action", result["warnings"])


if __name__ == "__main__":
    unittest.main()
