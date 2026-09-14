"""Targeted, offline safety checks for the owner-print standard."""

import importlib.util
import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("owner_kit", Path(__file__).with_name("build-owner-portal-kit.py"))
kit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(kit)


class OwnerPrintContract(unittest.TestCase):
    def test_exact_colattao_contract(self):
        kit.validate_url("colattao", "https://finacalleos.com/owner/colattao")

    def test_other_safe_tenant_supported_after_registration(self):
        kit.validate_url("example-cafe", "https://finacalleos.com/owner/example-cafe")

    def test_unsafe_urls_rejected(self):
        values = [
            "http://finacalleos.com/owner/colattao",
            "https://finacalleos.com/owner/colattao/",
            "https://finacalleos.com/owner/colattao?token=example",
            "https://finacalleos.com/owner/colattao#account",
            "https://finacalleos.com/owner/other-business",
            "https://finacalleos.com/demo/colattao",
            "https://finacalleos.com.evil.example/owner/colattao",
            "https://user:password@finacalleos.com/owner/colattao",
            "https://finacalleos.com:443/owner/colattao",
            "https://finacalleos.com/owner/colattao?",
        ]
        for value in values:
            with self.subTest(value=value), self.assertRaises(ValueError):
                kit.validate_url("colattao", value)

    def test_unsafe_ids_rejected(self):
        for value in ("guide", "../colattao", "Colattao", "colattao/", "", "owner@example.com"):
            with self.subTest(value=value), self.assertRaises(ValueError):
                kit.validate_url(value, f"https://finacalleos.com/owner/{value}")

    def test_only_verified_client_registered(self):
        registry = json.loads((ROOT / "PRINT_ASSETS/owner-portal/registry.json").read_text(encoding="utf-8"))
        self.assertEqual(list(registry["clients"]), ["colattao"])
        self.assertEqual(registry["clients"]["colattao"]["menuMode"], "request")
        self.assertIn("PENDING", registry["clients"]["colattao"]["physicalProofStatus"])

    def test_manual_four_pages_and_no_credential_or_service_price(self):
        manual = (ROOT / "OPERATIONS/OWNER_MANUAL.md").read_text(encoding="utf-8")
        self.assertEqual(len(manual.split("<!-- pagebreak -->")), 4)
        self.assertNotIn("1234", manual)
        self.assertNotIn("$500", manual)
        self.assertIn("not connected to that site", manual)
        self.assertIn("A return message or URL is not proof", manual)


if __name__ == "__main__":
    unittest.main(verbosity=2)
