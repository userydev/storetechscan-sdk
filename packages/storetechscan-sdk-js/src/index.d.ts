export type InspectProfile = 'ecommerce' | 'tech_stack' | 'full';

export interface EvidenceItem {
  tech: string;
  category: string;
  source:
    | 'dns_mx'
    | 'dns_txt'
    | 'dns_cname'
    | 'dns_ns'
    | 'http_header'
    | 'cookie'
    | 'script_src'
    | 'link_href'
    | 'meta'
    | 'html_marker'
    | 'implied';
  signal: string;
}

export interface DnsSignals {
  mx_hosts: string[];
  spf_includes: string[];
  has_dmarc: boolean;
  www_cname: string[];
  ns_hosts: string[];
}

export interface DomainInspectionResult {
  domain: string;
  final_url: string | null;
  status: string;
  error_code: string | null;
  error_message: string | null;
  http_status: number | null;
  billable: boolean;
  duration_ms: number;
  primary_platform: string | null;
  platforms: string[];
  marketing_plugins: string[];
  support_plugins: string[];
  subscription_reviews_plugins: string[];
  pixels: string[];
  tech_stack: string[];
  tech_count: number;
  is_shopify: boolean;
  is_shopify_plus: boolean;
  is_live_shopify: boolean;
  shopify_probe_status: string | null;
  shopify_products_count_sample: number | null;
  shopify_price_min: number | null;
  shopify_price_median: number | null;
  shopify_price_max: number | null;
  shopify_currency: string | null;
  shopify_latest_updated_at: string | null;
  icp_vertical: string | null;
  business_model: string | null;
  icp_one_liner: string | null;
  icp_source: string | null;
  icp_confidence: number | null;
  icp_fit_score: number | null;
  is_real_merchant: boolean | null;
  has_b2b_wholesale: boolean | null;
  primary_email: string | null;
  generic_emails: string[];
  instagram_url: string | null;
  tiktok_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  x_url: string | null;
  profile?: InspectProfile;
  tech_categories?: Record<string, string[]>;
  dns_signals?: DnsSignals | null;
  evidence?: EvidenceItem[];
}

export interface ProductVariant {
  variant_id: string | null;
  sku: string | null;
  title: string | null;
  price: number | null;
  compare_at_price: number | null;
  available: boolean | null;
}

export interface ProductInspectionResult {
  url: string;
  final_url: string | null;
  domain: string | null;
  status: string;
  error_code: string | null;
  error_message: string | null;
  http_status: number | null;
  billable: boolean;
  observed_at: string;
  duration_ms: number;
  platform: string | null;
  extraction_source:
    | 'shopify_product_js'
    | 'shopify_product_json'
    | 'woocommerce_store_api'
    | 'json_ld'
    | 'opengraph'
    | null;
  title: string | null;
  brand: string | null;
  sku: string | null;
  currency: string | null;
  price: number | null;
  price_min: number | null;
  price_max: number | null;
  compare_at_price: number | null;
  available: boolean | null;
  variants_count: number;
  variants: ProductVariant[];
}

export interface InspectResponse {
  ok: boolean;
  mode?: string;
  total_requested: number;
  billable_domains: number;
  failed_unbilled_domains: number;
  credits_charged: number;
  credits_refunded: number;
  credits_balance: number | null;
  free_quota_remaining?: number;
  results: DomainInspectionResult[];
}

export interface ProductInspectResponse {
  ok: boolean;
  mode?: string;
  total_requested: number;
  billable_products: number;
  failed_unbilled_products: number;
  credits_charged: number;
  credits_refunded: number;
  credits_balance: number | null;
  free_quota_remaining?: number;
  results: ProductInspectionResult[];
}

export interface StoreTechScanClientOptions {
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
  userAgent?: string;
}

export class StoreTechScanError extends Error {
  status: number;
  errorCode: string | null;
  retryAfterSeconds: number | null;
  pricingUrl: string | null;
  body: unknown;
}

export class StoreTechScanClient {
  constructor(options?: StoreTechScanClientOptions);
  inspect(
    domains: string | string[],
    options?: { profile?: InspectProfile; includeEvidence?: boolean },
  ): Promise<InspectResponse>;
  inspectProduct(urls: string | string[]): Promise<ProductInspectResponse>;
  getCredits(): Promise<Record<string, unknown>>;
}

export function createClient(options?: StoreTechScanClientOptions): StoreTechScanClient;
export const DEFAULT_BASE_URL: string;
export const SDK_VERSION: string;
