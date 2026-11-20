#!/usr/bin/env node
/**
 * StoreTechScan Local Stdio MCP Bridge (Zero External Dependencies)
 *
 * Bridges standard MCP stdio JSON-RPC 2.0 clients (Claude Desktop, Cursor, VS Code, Windsurf)
 * to StoreTechScan's Streamable HTTP MCP endpoint (`https://storetechscan.com/mcp`).
 *
 * Optional environment variables:
 *   STORETECHSCAN_API_KEY   - Paid Bearer API key (zsk_live_...) for calibrated AI & non-expiring credits.
 *                             Omit to use the one-time 25-domain free trial per IP!
 *   STORETECHSCAN_BASE_URL  - Override server origin (defaults to https://storetechscan.com).
 *                             Must use https:// (except localhost/127.0.0.1) when STORETECHSCAN_API_KEY is set.
 */
import readline from 'node:readline';

const BASE_URL = String(process.env.STORETECHSCAN_BASE_URL || 'https://storetechscan.com').replace(/\/+$/, '');
const MCP_ENDPOINT = `${BASE_URL}/mcp`;
const API_KEY = String(process.env.STORETECHSCAN_API_KEY || '').trim();
const REQUEST_TIMEOUT_MS = Math.max(5_000, Number(process.env.STORETECHSCAN_TIMEOUT_MS) || 55_000);

function isSecureOrLoopbackUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    if (u.protocol === 'https:') return true;
    if (u.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]', '::1'].includes(u.hostname)) return true;
    return false;
  } catch {
    return false;
  }
}

const inFlightControllers = new Map();

function writeStdoutMessage(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

function isValidJsonRpcResponse(val) {
  if (Array.isArray(val)) {
    return val.length > 0 && val.every((item) => item && typeof item === 'object' && item.jsonrpc === '2.0');
  }
  return Boolean(val && typeof val === 'object' && val.jsonrpc === '2.0' && ('result' in val || 'error' in val));
}

async function forwardMessage(line) {
  const trimmed = line.trim();
  if (!trimmed) return;

  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    writeStdoutMessage({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: 'Parse error: invalid JSON on stdin' },
    });
    return;
  }

  // Handle local cancellation immediately without blocking behind slow requests
  if (
    parsed &&
    !Array.isArray(parsed) &&
    parsed.method === 'notifications/cancelled' &&
    parsed.params &&
    parsed.params.requestId !== undefined
  ) {
    const ctrl = inFlightControllers.get(parsed.params.requestId);
    if (ctrl) {
      ctrl.abort(new Error('Cancelled by client'));
      inFlightControllers.delete(parsed.params.requestId);
    }
  }

  const singleId =
    !Array.isArray(parsed) && parsed && typeof parsed === 'object' && 'id' in parsed && parsed.id !== undefined
      ? parsed.id
      : null;
  const hasRequestId = Array.isArray(parsed)
    ? parsed.some((item) => item && typeof item === 'object' && 'id' in item && item.id !== undefined)
    : singleId !== null;

  if (API_KEY && !isSecureOrLoopbackUrl(BASE_URL)) {
    if (hasRequestId) {
      writeStdoutMessage({
        jsonrpc: '2.0',
        id: singleId,
        error: {
          code: -32603,
          message: `Refusing to transmit STORETECHSCAN_API_KEY over insecure non-HTTPS URL: ${BASE_URL}`,
        },
      });
    }
    return;
  }

  const headers = {
    'content-type': 'application/json',
    accept: 'application/json, text/event-stream',
    'mcp-protocol-version': '2025-06-18',
    'user-agent': 'storetechscan-mcp-stdio/1.0.0',
  };
  if (API_KEY) {
    headers.authorization = API_KEY.toLowerCase().startsWith('bearer ') ? API_KEY : `Bearer ${API_KEY}`;
  }

  const abortController = new AbortController();
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const combinedSignal = AbortSignal.any([abortController.signal, timeoutSignal]);
  if (singleId !== null) {
    inFlightControllers.set(singleId, abortController);
  }

  try {
    const res = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(parsed),
      signal: combinedSignal,
    });

    if (res.status === 202 || !hasRequestId) {
      return;
    }

    const text = await res.text();
    let json = null;
    if (text.trim()) {
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }
    }

    if (!res.ok || !isValidJsonRpcResponse(json)) {
      const upstreamError =
        (json && typeof json === 'object' && (json.error?.message || json.error)) ||
        text.slice(0, 240) ||
        `HTTP ${res.status}`;
      const emitErrorForId = (reqId) => ({
        jsonrpc: '2.0',
        id: reqId,
        error: {
          code: res.status === 429 ? -32029 : -32603,
          message: `Upstream StoreTechScan MCP error (HTTP ${res.status}): ${upstreamError}`,
        },
      });
      if (Array.isArray(parsed)) {
        const batchErrors = parsed
          .filter((item) => item && typeof item === 'object' && 'id' in item && item.id !== undefined)
          .map((item) => emitErrorForId(item.id));
        if (batchErrors.length > 0) writeStdoutMessage(batchErrors);
      } else {
        writeStdoutMessage(emitErrorForId(singleId));
      }
      return;
    }

    writeStdoutMessage(json);
  } catch (err) {
    if (!hasRequestId) return;
    if (abortController.signal.aborted) return;
    writeStdoutMessage({
      jsonrpc: '2.0',
      id: singleId,
      error: {
        code: -32603,
        message: `Failed to reach StoreTechScan MCP endpoint (${MCP_ENDPOINT}): ${err?.message || 'network timeout'}`,
      },
    });
  } finally {
    if (singleId !== null) {
      inFlightControllers.delete(singleId);
    }
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
  terminal: false,
});

// Dispatch lines concurrently so fast ping/cancel messages never stall behind a running inspection
rl.on('line', (line) => {
  forwardMessage(line).catch(() => {});
});
