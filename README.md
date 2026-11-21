# StoreTechScan SDKs & MCP Client

Official MIT-licensed SDKs and Model Context Protocol (MCP) stdio bridge for **[StoreTechScan](https://storetechscan.com)** — the pay-as-you-go Ecommerce & Website Tech Stack API alternative to Wappalyzer ($450/mo Business API), Store Leads ($250–$950/mo), and BuiltWith ($295/mo).

[![PyPI](https://img.shields.io/pypi/v/storetechscan?label=pypi%20sdk)](https://pypi.org/project/storetechscan/)
[![npm storetechscan](https://img.shields.io/npm/v/storetechscan?label=npm%20sdk)](https://www.npmjs.com/package/storetechscan)
[![npm storetechscan-mcp](https://img.shields.io/npm/v/storetechscan-mcp?label=npm%20mcp)](https://www.npmjs.com/package/storetechscan-mcp)
[![Official MCP Registry](https://img.shields.io/badge/MCP%20Registry-com.storetechscan%2Fstoretechscan-blue)](https://registry.modelcontextprotocol.io/v0/servers?search=com.storetechscan/storetechscan)
[![Apify Store](https://img.shields.io/badge/Apify%20Store-ydev1999%2Fstoretechscan-00C27E)](https://apify.com/ydev1999/storetechscan)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

- **Website Tech Stack + Passive DNS + Auditable `evidence[]`** (`POST /api/v1/inspect`, `profile="tech_stack"` or `"full"`): 200+ clean-room Web/SaaS/ecommerce fingerprints + parallel `MX / TXT / CNAME / NS / DMARC` backend inference.
- **Live Single-Product URL Probe** (`POST /api/v1/product`): real-time title, brand, native currency, price, compare-at price, variants, and explicit public `available: true | false` for public Shopify, WooCommerce, BigCommerce, and Schema.org DTC product pages.
- **Pay-As-You-Go, Zero Subscription**: One-time non-expiring credit packs starting at **$9 / 500 credits (+25 first-purchase bonus)**; `$0` billed for unreachable, 404/5xx, 429, or WAF-blocked checks. Free one-time 25-check trial per IP with no API key required.
- **Commercial Embedding Permitted**: Explicitly permitted for commercial SaaS embedding, Clay/n8n/Make workflows, and AI agents with no mandatory attribution backlink.

Links: [Website](https://storetechscan.com) · [npm (`storetechscan`)](https://www.npmjs.com/package/storetechscan) · [npm (`storetechscan-mcp`)](https://www.npmjs.com/package/storetechscan-mcp) · [PyPI (`storetechscan`)](https://pypi.org/project/storetechscan/) · [Apify Actor](https://apify.com/ydev1999/storetechscan) · [API Quickstart](https://storetechscan.com/api) · [OpenAPI 3.1 Reference](https://storetechscan.com/docs/openapi) · [Pricing](https://storetechscan.com/pricing) · [Remote MCP Guide](https://storetechscan.com/integrations/mcp-server) · [2026 Ecommerce Benchmark (n=235)](https://storetechscan.com/reports/ecommerce-tech-stack-benchmark-2026) · [2026 DNS & Product Probe Benchmark](https://storetechscan.com/reports/dns-and-product-url-benchmark-2026)

---

## Packages in This Repository

| Package | Path | Runtime | Registry / Install | Description |
| --- | --- | --- | --- | --- |
| `storetechscan` (Python) | [`packages/storetechscan-sdk-py`](./packages/storetechscan-sdk-py) | Python 3.9+ (stdlib only) | [PyPI `storetechscan`](https://pypi.org/project/storetechscan/) (`pip install storetechscan`) | Zero-dependency Python client for `/api/v1/inspect`, `/api/v1/product`, and `/api/v1/credits` |
| `storetechscan` (JS/TS) | [`packages/storetechscan-sdk-js`](./packages/storetechscan-sdk-js) | Node.js 18+ (zero deps) | [npm `storetechscan`](https://www.npmjs.com/package/storetechscan) (`npm install storetechscan`) | Official JavaScript / TypeScript client for `/api/v1/inspect`, `/api/v1/product`, and `/api/v1/credits` |
| `storetechscan-mcp` | [`packages/storetechscan-mcp`](./packages/storetechscan-mcp) | Node.js 20+ (zero deps) | [npm `storetechscan-mcp`](https://www.npmjs.com/package/storetechscan-mcp) (`npx -y storetechscan-mcp`) | Local `stdio` MCP bridge to `https://storetechscan.com/mcp` |

---

## MCP Server (Remote HTTP or Local `stdio`)

### Option 1: Direct Remote Streamable HTTP (Recommended — Zero Install)

Connect Claude Desktop, Claude Code, Cursor, VS Code Copilot, Windsurf, or Antigravity directly to `https://storetechscan.com/mcp`:

```json
{
  "mcpServers": {
    "storetechscan": {
      "type": "streamable-http",
      "url": "https://storetechscan.com/mcp"
    }
  }
}
```

Pass `Authorization: Bearer zsk_live_YOUR_KEY` in headers for paid credits and calibrated AI scoring, or omit headers to try up to 25 checks free (one-time per IP).

### Option 2: Local `stdio` Bridge (`npx -y storetechscan-mcp`)

```json
{
  "mcpServers": {
    "storetechscan": {
      "command": "npx",
      "args": ["-y", "storetechscan-mcp"],
      "env": {
        "STORETECHSCAN_API_KEY": "zsk_live_YOUR_OPTIONAL_KEY"
      }
    }
  }
}
```

### Available MCP Tools (7)

| Tool | Purpose |
| --- | --- |
| `inspect_domains` | Batch website tech stack (200+ signatures), passive DNS evidence, Shopify/product price stats, calibrated AI ICP fit, and generic role contacts |
| `inspect_product_url` | Live single-product URL probe for price, native currency, compare-at price, variants, and `available: true \| false` (`$0` on WAF/error) |
| `get_job` | Resume or fetch paginated rows for an existing inspection `job_id` |
| `get_credits` | Check API key credit balance and ledger totals (`0` credits consumed) |
| `get_ecommerce_benchmark_2026` | Read the public CC BY 4.0 235-domain empirical benchmark summary (`0` credits consumed) |
| `buy_credits` | Generate a human-approved Waffo checkout link + `claim_token` for an API credit pack |
| `claim_purchase` | Exchange a paid `claim_token` for a bearer `zsk_live_...` API key |

## Quick cURL Examples

### Website Tech Stack + Passive DNS + Evidence

```bash
curl -X POST https://storetechscan.com/api/v1/inspect \
  -H "Content-Type: application/json" \
  -d '{"domains": ["stripe.com", "gymshark.com"], "profile": "tech_stack"}'
```

### Live Single-Product Price, Variants & Availability

```bash
curl -X POST https://storetechscan.com/api/v1/product \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.allbirds.com/products/mens-wool-runners"}'
```

## Pricing Comparison

| Provider | Minimum API Subscription | Pay-As-You-Go / Non-Expiring | Failed / WAF Checks | Commercial SaaS Embedding |
| --- | --- | --- | --- | --- |
| **StoreTechScan** | **$0 / mo** ($9 / 500 one-time) | Yes — credits never expire | **$0** (auto-refunded) | Explicitly permitted, no backlink required |
| Wappalyzer | $450 / mo (Business API) | Monthly plan required | Varies | Restricted on standard plans |
| Store Leads | $250 / mo (Pro API) · $950 / mo (Product Search) | Recurring subscription | Database quota | Enterprise terms |
| BuiltWith | $295 / mo (Basic) | Recurring subscription | Plan quota | Enterprise license |

## Hosted Apify Actor

Run batches without writing HTTP client code using the public Pay-Per-Event Apify Actor: **[`ydev1999/storetechscan`](https://apify.com/ydev1999/storetechscan)**.

- **Modes**: `domains` (website tech stack + passive DNS + `evidence[]`, ecommerce enrichment, calibrated AI ICP fit) and `products` (live ecommerce product price, variants & stock)
- **Pricing**: **`$5.00 / 1,000`** billable results (`inspection-result`, `User pays platform usage costs: No`) — **`$0`** billed for failed, unreachable, 429, or WAF checks

## License

MIT — see [LICENSE](./LICENSE).
