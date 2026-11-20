# storetechscan

Zero-dependency JavaScript / TypeScript SDK for **[StoreTechScan](https://storetechscan.com)** — the pay-as-you-go alternative to Wappalyzer ($450/mo Business API), Store Leads ($250–$950/mo), and BuiltWith ($295/mo).

- **Website Tech Stack + Passive DNS + Auditable `evidence[]`**: 200+ clean-room Web/SaaS/ecommerce fingerprints plus parallel `MX / TXT / CNAME / NS / DMARC` backend inference (`profile: "tech_stack" | "full"`).
- **Live Single-Product URL Probe (`inspectProduct`)**: Real-time title, brand, native currency, price, compare-at price, variants, and explicit public `available: true | false` for Shopify, WooCommerce, BigCommerce, and Schema.org DTC pages.
- **Pay-As-You-Go, No Subscription**: One-time non-expiring credit packs starting at **$9 / 500 credits (+25 first-purchase bonus)**; `$0` billed on unreachable, 429, or WAF-blocked URLs. Free one-time 25-check trial per IP with no API key required.
- **Commercial Embedding Permitted**: Embed API results inside commercial SaaS apps, Clay/n8n/Make workflows, and AI agents with no mandatory attribution backlink.

Links: [API Quickstart](https://storetechscan.com/api) · [OpenAPI 3.1 Docs](https://storetechscan.com/docs/openapi) · [Pricing](https://storetechscan.com/pricing) · [Remote MCP Server](https://storetechscan.com/integrations/mcp-server)

## Install

```bash
npm install storetechscan
```

Requires Node.js 18+ (uses native `fetch`, zero runtime dependencies).

## Quickstart

### 1. Detect Website Tech Stack + Passive DNS + Evidence

```js
import { StoreTechScanClient } from 'storetechscan';

// Omit apiKey to test with the one-time 25-check IP trial
const client = new StoreTechScanClient({
  apiKey: process.env.STORETECHSCAN_API_KEY,
});

const res = await client.inspect(['stripe.com', 'gymshark.com'], {
  profile: 'tech_stack',
});

for (const row of res.results) {
  console.log(row.domain, row.tech_stack, row.dns_signals?.has_dmarc);
  console.log('Evidence:', row.evidence?.slice(0, 3));
}
```

### 2. Probe Live Ecommerce Product Price, Variants & Availability

```js
const prod = await client.inspectProduct([
  'https://www.allbirds.com/products/mens-wool-runners',
]);

for (const item of prod.results) {
  console.log(item.title, item.currency, item.price, 'available:', item.available);
}
```

### 3. Check Credit Balance

```js
const credits = await client.getCredits();
console.log(credits);
```

## Pricing

| Pack | One-Time Price | Credits | Unit Cost | Subscription |
| --- | ---: | ---: | ---: | --- |
| Free Trial | $0 | 25 (one-time / IP) | $0 | None |
| Starter | $9 | 500 (+25 first-order bonus) | $0.018 | $0 / mo |
| Growth | $19 | 2,000 | $0.0095 | $0 / mo |
| Agency | $49 | 10,000 | $0.0049 | $0 / mo |

Unreachable, timeout, 404/5xx, 429, or WAF-blocked checks return `billable: false` and cost **$0**. See https://storetechscan.com/pricing.

## License

MIT
