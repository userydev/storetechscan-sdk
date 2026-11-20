import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from storetechscan import StoreTechScanClient, StoreTechScanError


class StoreTechScanClientTests(unittest.TestCase):
    def test_inspect_product_and_credits_payloads(self):
        calls = []

        def fake_opener(req, timeout):
            body = json.loads(req.data.decode("utf-8")) if req.data else None
            calls.append((req.get_method(), req.full_url, dict(req.header_items()), body))
            return 200, {"Content-Type": "application/json"}, json.dumps({"ok": True, "results": []}).encode("utf-8")

        client = StoreTechScanClient(api_key="zsk_live_py123", opener=fake_opener)
        client.inspect(["stripe.com"], profile="tech_stack", include_evidence=True)
        client.inspect_product("https://demo.example/products/item")
        client.get_credits()

        self.assertEqual(len(calls), 3)
        self.assertEqual(calls[0][1], "https://storetechscan.com/api/v1/inspect")
        self.assertEqual(calls[0][2]["Authorization"], "Bearer zsk_live_py123")
        self.assertEqual(calls[0][3], {"domains": ["stripe.com"], "profile": "tech_stack", "include_evidence": True})
        self.assertEqual(calls[1][1], "https://storetechscan.com/api/v1/product")
        self.assertEqual(calls[1][3], {"url": "https://demo.example/products/item"})
        self.assertEqual(calls[2][0], "GET")
        self.assertEqual(calls[2][1], "https://storetechscan.com/api/v1/credits")

    def test_structured_error_on_429(self):
        def fake_opener(req, timeout):
            payload = {"error": "Rate limited", "error_code": "RATE_LIMITED", "retry_after_seconds": 15}
            return 429, {"Retry-After": "15"}, json.dumps(payload).encode("utf-8")

        client = StoreTechScanClient(opener=fake_opener)
        with self.assertRaises(StoreTechScanError) as ctx:
            client.inspect("stripe.com")
        self.assertEqual(ctx.exception.status, 429)
        self.assertEqual(ctx.exception.error_code, "RATE_LIMITED")
        self.assertEqual(ctx.exception.retry_after_seconds, 15)


if __name__ == "__main__":
    unittest.main()
