import test from 'node:test';
import assert from 'node:assert/strict';
import { StoreTechScanClient, StoreTechScanError } from '../src/index.js';

test('StoreTechScanClient calls /api/v1/inspect, /api/v1/product, and /api/v1/credits with expected headers and payloads', async () => {
  const calls = [];
  const fetchFn = async (url, init) => {
    calls.push({ url, method: init.method, headers: init.headers, body: init.body ? JSON.parse(init.body) : null });
    return {
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify({ ok: true, results: [] }),
    };
  };

  const client = new StoreTechScanClient({ apiKey: 'zsk_live_test123', fetchFn });
  await client.inspect(['stripe.com'], { profile: 'tech_stack', includeEvidence: true });
  await client.inspectProduct('https://demo.example/products/shoe');
  await client.getCredits();

  assert.equal(calls.length, 3);
  assert.equal(calls[0].url, 'https://storetechscan.com/api/v1/inspect');
  assert.equal(calls[0].headers.authorization, 'Bearer zsk_live_test123');
  assert.deepEqual(calls[0].body, { domains: ['stripe.com'], profile: 'tech_stack', include_evidence: true });
  assert.equal(calls[1].url, 'https://storetechscan.com/api/v1/product');
  assert.deepEqual(calls[1].body, { url: 'https://demo.example/products/shoe' });
  assert.equal(calls[2].url, 'https://storetechscan.com/api/v1/credits');
  assert.equal(calls[2].method, 'GET');
});

test('StoreTechScanClient throws structured StoreTechScanError on 402 and 429', async () => {
  const fetchFn = async () => ({
    ok: false,
    status: 429,
    headers: new Headers({ 'retry-after': '12' }),
    text: async () => JSON.stringify({ error: 'Rate limited', error_code: 'RATE_LIMITED', retry_after_seconds: 12 }),
  });
  const client = new StoreTechScanClient({ fetchFn });
  await assert.rejects(
    () => client.inspect('stripe.com'),
    (err) => err instanceof StoreTechScanError && err.status === 429 && err.errorCode === 'RATE_LIMITED' && err.retryAfterSeconds === 12,
  );
});
