# storetechscan (Python SDK)

Zero-dependency Python SDK for **[StoreTechScan](https://storetechscan.com)** — the pay-as-you-go alternative to Wappalyzer ($450/mo Business API), Store Leads ($250–$950/mo), and BuiltWith ($295/mo).

- **Website Tech Stack + Passive DNS + Auditable `evidence[]`**: 200+ clean-room Web/SaaS/ecommerce fingerprints plus parallel `MX / TXT / CNAME / NS / DMARC` backend inference (`profile="tech_stack"` or `"full"`).
- **Live Single-Product URL Probe (`inspect_product`)**: Real-time title, brand, native currency, price, compare-at price, variants, and explicit public `available: true | false` for Shopify, WooCommerce, BigCommerce, and Schema.org DTC pages.
- **Pay-As-You-Go, No Subscription**: One-time non-expiring credit packs starting at **$9 / 500 credits (+25 first-purchase bonus)**; `$0` billed on unreachable, 429, or WAF-blocked checks. Free one-time 25-check trial per IP with no API key required.
- **Commercial Embedding Permitted**: Embed API results inside commercial SaaS apps, Clay/n8n/Make workflows, and AI agents with no mandatory attribution backlink.

Links: [API Quickstart](https://storetechscan.com/api) · [OpenAPI 3.1 Docs](https://storetechscan.com/docs/openapi) · [Pricing](https://storetechscan.com/pricing) · [Remote MCP Server](https://storetechscan.com/integrations/mcp-server)

## Install

```bash
pip install storetechscan
```

Requires Python 3.9+ (uses Python stdlib only — zero external dependencies).

## Quickstart

```python
import os
from storetechscan import StoreTechScanClient

# Omit api_key to try the one-time 25-check IP trial
client = StoreTechScanClient(api_key=os.environ.get("STORETECHSCAN_API_KEY", ""))

# 1. Website tech stack + passive DNS + auditable evidence[]
tech = client.inspect(["stripe.com", "gymshark.com"], profile="tech_stack")
for row in tech["results"]:
    print(row["domain"], row["tech_stack"], "DMARC:", row["dns_signals"]["has_dmarc"])

# 2. Live single-product URL probe (price, variants, availability)
prod = client.inspect_product("https://www.allbirds.com/products/mens-wool-runners")
for item in prod["results"]:
    print(item["title"], item["currency"], item["price"], "available:", item["available"])

# 3. Check pay-as-you-go credit balance
if client.api_key:
    print(client.get_credits())
```

## Pricing

| Pack | One-Time Price | Credits | Unit Cost | Subscription |
| --- | ---: | ---: | ---: | --- |
| Free Trial | $0 | 25 (one-time / IP) | $0 | None |
| Starter | $9 | 500 (+25 first-order bonus) | $0.018 | $0 / mo |
| Growth | $19 | 2,000 | $0.0095 | $0 / mo |
| Agency | $49 | 10,000 | $0.0049 | $0 / mo |

Failed, unreachable, 429, and WAF-blocked URLs return `billable: false` and cost **$0**. See https://storetechscan.com/pricing.

## License

MIT
