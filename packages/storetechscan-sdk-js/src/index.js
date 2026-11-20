export const DEFAULT_BASE_URL = 'https://storetechscan.com';
export const SDK_VERSION = '1.0.0';

export class StoreTechScanError extends Error {
  constructor(message, { status = 0, errorCode = null, retryAfterSeconds = null, pricingUrl = null, body = null } = {}) {
    super(message);
    this.name = 'StoreTechScanError';
    this.status = status;
    this.errorCode = errorCode;
    this.retryAfterSeconds = retryAfterSeconds;
    this.pricingUrl = pricingUrl;
    this.body = body;
  }
}

export class StoreTechScanClient {
  /**
   * @param {object} [options]
   * @param {string} [options.apiKey] Optional Bearer API key (`zsk_live_...`). Omit to use the one-time 25-unit IP trial.
   * @param {string} [options.baseUrl] Defaults to `https://storetechscan.com`.
   * @param {number} [options.timeoutMs] Request timeout in milliseconds (default 60000).
   * @param {typeof fetch} [options.fetchFn] Custom fetch implementation for testing.
   * @param {string} [options.userAgent] Custom User-Agent header.
   */
  constructor({
    apiKey = '',
    baseUrl = DEFAULT_BASE_URL,
    timeoutMs = 60_000,
    fetchFn = globalThis.fetch,
    userAgent = `storetechscan-js/${SDK_VERSION}`,
  } = {}) {
    if (typeof fetchFn !== 'function') {
      throw new Error('Global fetch is unavailable; use Node.js 18+ or pass fetchFn.');
    }
    this.apiKey = String(apiKey || '').trim();
    this.baseUrl = String(baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.timeoutMs = Math.max(1000, Number(timeoutMs) || 60_000);
    this.fetchFn = fetchFn;
    this.userAgent = userAgent;
  }

  async _request(method, path, body = undefined) {
    const headers = {
      accept: 'application/json',
      'user-agent': this.userAgent,
    };
    if (this.apiKey) {
      headers.authorization = `Bearer ${this.apiKey}`;
    }
    if (body !== undefined) {
      headers['content-type'] = 'application/json';
    }

    const res = await this.fetchFn(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!res.ok) {
      const retryHeader = res.headers?.get?.('retry-after');
      const retryAfterSeconds = json?.retry_after_seconds ?? (retryHeader ? Number(retryHeader) : null);
      throw new StoreTechScanError(
        json?.error || `StoreTechScan API error (HTTP ${res.status})`,
        {
          status: res.status,
          errorCode: json?.error_code || null,
          retryAfterSeconds: Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : null,
          pricingUrl: json?.upgrade?.pricing_url || json?.pricing_url || `${this.baseUrl}/pricing`,
          body: json ?? text,
        },
      );
    }

    return json;
  }

  /**
   * Inspect 1 to 100 domains (up to 25 anonymously).
   * @param {string | string[]} domains Single domain or array of domains.
   * @param {{ profile?: 'ecommerce' | 'tech_stack' | 'full', includeEvidence?: boolean }} [options]
   */
  async inspect(domains, { profile = 'ecommerce', includeEvidence = false } = {}) {
    const list = Array.isArray(domains) ? domains : [domains];
    const payload = { domains: list, profile };
    if (includeEvidence) payload.include_evidence = true;
    return this._request('POST', '/api/v1/inspect', payload);
  }

  /**
   * Probe 1 to 50 public ecommerce product URLs (Shopify, WooCommerce, BigCommerce, Schema.org DTC).
   * @param {string | string[]} urls Single product URL or array of product URLs.
   */
  async inspectProduct(urls) {
    const payload = Array.isArray(urls) ? { urls } : { url: urls };
    return this._request('POST', '/api/v1/product', payload);
  }

  /**
   * Retrieve remaining credit balance and recent ledger transactions (requires `apiKey`).
   */
  async getCredits() {
    if (!this.apiKey) {
      throw new StoreTechScanError('getCredits() requires an apiKey.', { status: 401 });
    }
    return this._request('GET', '/api/v1/credits');
  }
}

export function createClient(options = {}) {
  return new StoreTechScanClient(options);
}
