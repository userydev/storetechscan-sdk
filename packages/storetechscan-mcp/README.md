# StoreTechScan MCP Server (`storetechscan-mcp`)

Connect **Claude Desktop, Claude Code, Cursor, VS Code (GitHub Copilot), Windsurf, ChatGPT, or Antigravity** to [StoreTechScan](https://storetechscan.com) — the pay-as-you-go alternative to Store Leads ($250–$950/mo), Wappalyzer ($450/mo), and BuiltWith ($295/mo):

1. **Website Tech Stack + Passive DNS + Auditable `evidence[]`**: 200+ clean-room Web/SaaS/ecommerce fingerprints + parallel `MX / TXT / CNAME / NS / DMARC` backend inference (`profile: "tech_stack" | "full"`).
2. **Live Single-Product URL Probe (`inspect_product_url`)**: Real-time price, variants, native currency, and explicit public `available: true/false` for public Shopify, WooCommerce, BigCommerce, and Schema.org DTC product pages (`$0` on WAF/429/errors).
3. **Shopify Catalog Sampling & Calibrated AI ICP Scoring**: `/products.json` price bands, `1.0–5.0` `icp_fit_score`, `is_real_merchant`, and `has_b2b_wholesale`.
4. **GDPR-Minimized Public Role Contacts**: Same-domain functional inboxes (`hello@`, `sales@`, `support@`) and official social links.

- **Zero-Signup Free Trial**: Works out of the box with **no API key** for up to **25 checks total per IP (one-time)**.
- **Pay-As-You-Go API Key**: One-time, non-expiring credit packs starting at **$9 / 500 credits (+25 first-purchase bonus)** (`$0` charged for dead/unreachable/WAF-blocked checks) at https://storetechscan.com/pricing.
- **Commercial Embedding Permitted**: Embed API/MCP outputs inside commercial SaaS apps, Clay/n8n/Make workflows, and AI agents with no mandatory attribution backlink.

---

## Option 1: Direct Remote Streamable HTTP (Recommended — Zero Install)

Add `https://storetechscan.com/mcp` directly to any MCP client supporting Streamable HTTP:

```json
{
  "mcpServers": {
    "storetechscan": {
      "type": "streamable-http",
      "url": "https://storetechscan.com/mcp",
      "headers": {
        "Authorization": "Bearer zsk_live_YOUR_OPTIONAL_KEY"
      }
    }
  }
}
```
*(Omit `"headers"` to start immediately on the one-time 25-unit trial per IP.)*

## Option 2: Local `stdio` Subprocess Bridge (`npx`)

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
