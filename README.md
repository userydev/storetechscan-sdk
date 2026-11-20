# StoreTechScan SDKs & MCP Client

Official MIT-licensed SDKs and Model Context Protocol (MCP) stdio bridge for **[StoreTechScan](https://storetechscan.com)** — the pay-as-you-go Ecommerce & Website Tech Stack API alternative to Wappalyzer ($450/mo Business API), Store Leads ($250–$950/mo), and BuiltWith ($295/mo).

- **Website Tech Stack + Passive DNS + Auditable `evidence[]`** (`POST /api/v1/inspect`, `profile="tech_stack"` or `"full"`): 200+ clean-room Web/SaaS/ecommerce fingerprints + parallel `MX / TXT / CNAME / NS / DMARC` backend inference.
- **Live Single-Product URL Probe** (`POST /api/v1/product`): real-time title, brand, native currency, price, compare-at price, variants, and explicit public `available: true | false` for public Shopify, WooCommerce, BigCommerce, and Schema.org DTC product pages.
- **Pay-As-You-Go, Zero Subscription**: One-time non-expiring credit packs starting at **$9 / 500 credits (+25 first-purchase bonus)**; `$0` billed for unreachable, 404/5xx, 429, or WAF-blocked checks. Free one-time 25-check trial per IP with no API key required.
- **Commercial Embedding Permitted**: Explicitly permitted for commercial SaaS embedding, Clay/n8n/Make workflows, and AI agents with no mandatory attribution backlink.

Links: [Website](https://storetechscan.com) · [API Quickstart](https://storetechscan.com/api) · [OpenAPI 3.1 Reference](https://storetechscan.com/docs/openapi) · [Pricing](https://storetechscan.com/pricing) · [Remote MCP Guide](https://storetechscan.com/integrations/mcp-server) · [2026 Empirical Benchmark (n=235)](https://storetechscan.com/reports/ecommerce-tech-stack-benchmark-2026)

---

## Packages in This Repository

| Package | Path | Runtime | Description |
| --- | --- | --- | --- |
| `storetechscan` (JS/TS) | [`packages/storetechscan-sdk-js`](./packages/storetechscan-sdk-js) | Node.js 18+ (zero deps) | Official JavaScript / TypeScript client for `/api/v1/inspect`, `/api/v1/product`, and `/api/v1/credits` |
| `storetechscan` (Python) | [`packages/storetechscan-sdk-py`](./packages/storetechscan-sdk-py) | Python 3.9+ (stdlib only) | Zero-dependency Python client for `/api/v1/inspect`, `/api/v1/product`, and `/api/v1/credits` |
| `storetechscan-mcp` | [`packages/storetechscan-mcp`](./packages/storetechscan-mcp) | Node.js 20+ (zero deps) | Local `stdio` MCP bridge to `https://storetechscan.com/mcp` |

---

## Remote MCP Server (Zero Install)

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

## License

MIT — see [LICENSE](./LICENSE).
