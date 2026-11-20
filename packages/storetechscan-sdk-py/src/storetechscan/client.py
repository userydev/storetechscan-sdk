from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Any, Callable, Mapping, Sequence

DEFAULT_BASE_URL = "https://storetechscan.com"
SDK_VERSION = "1.0.0"


class StoreTechScanError(Exception):
    """Structured error raised on non-2xx StoreTechScan API responses."""

    def __init__(
        self,
        message: str,
        *,
        status: int = 0,
        error_code: str | None = None,
        retry_after_seconds: int | None = None,
        pricing_url: str | None = None,
        body: Any = None,
    ) -> None:
        super().__init__(message)
        self.status = status
        self.error_code = error_code
        self.retry_after_seconds = retry_after_seconds
        self.pricing_url = pricing_url
        self.body = body


class StoreTechScanClient:
    """Zero-dependency client for StoreTechScan's REST API."""

    def __init__(
        self,
        api_key: str = "",
        *,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = 60.0,
        user_agent: str = f"storetechscan-py/{SDK_VERSION}",
        opener: Callable[[urllib.request.Request, float], tuple[int, Mapping[str, str], bytes]] | None = None,
    ) -> None:
        self.api_key = (api_key or "").strip()
        self.base_url = (base_url or DEFAULT_BASE_URL).rstrip("/")
        self.timeout = max(1.0, float(timeout))
        self.user_agent = user_agent
        self._opener = opener

    def _default_open(
        self, req: urllib.request.Request, timeout: float
    ) -> tuple[int, Mapping[str, str], bytes]:
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.status, dict(resp.headers.items()), resp.read()
        except urllib.error.HTTPError as err:
            raw = err.read() if err.fp else b""
            headers = dict(err.headers.items()) if err.headers else {}
            return err.code, headers, raw

    def _request(self, method: str, path: str, payload: Mapping[str, Any] | None = None) -> dict[str, Any]:
        headers: dict[str, str] = {
            "Accept": "application/json",
            "User-Agent": self.user_agent,
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        data: bytes | None = None
        if payload is not None:
            headers["Content-Type"] = "application/json"
            data = json.dumps(payload).encode("utf-8")

        req = urllib.request.Request(
            f"{self.base_url}{path}",
            data=data,
            headers=headers,
            method=method,
        )
        opener = self._opener or self._default_open
        status, resp_headers, raw_body = opener(req, self.timeout)
        text = raw_body.decode("utf-8", errors="replace")

        parsed: Any = None
        if text:
            try:
                parsed = json.loads(text)
            except json.JSONDecodeError:
                parsed = None

        if status < 200 or status >= 300:
            lower_headers = {k.lower(): v for k, v in resp_headers.items()}
            retry_val = None
            if isinstance(parsed, dict) and parsed.get("retry_after_seconds") is not None:
                try:
                    retry_val = int(parsed["retry_after_seconds"])
                except (ValueError, TypeError):
                    retry_val = None
            elif "retry-after" in lower_headers:
                try:
                    retry_val = int(lower_headers["retry-after"])
                except (ValueError, TypeError):
                    retry_val = None

            msg = (
                parsed.get("error")
                if isinstance(parsed, dict) and isinstance(parsed.get("error"), str)
                else f"StoreTechScan API error (HTTP {status})"
            )
            pricing_url = f"{self.base_url}/pricing"
            if isinstance(parsed, dict):
                upgrade = parsed.get("upgrade")
                if isinstance(upgrade, dict) and isinstance(upgrade.get("pricing_url"), str):
                    pricing_url = upgrade["pricing_url"]
                elif isinstance(parsed.get("pricing_url"), str):
                    pricing_url = parsed["pricing_url"]

            raise StoreTechScanError(
                msg,
                status=status,
                error_code=parsed.get("error_code") if isinstance(parsed, dict) else None,
                retry_after_seconds=retry_val,
                pricing_url=pricing_url,
                body=parsed if parsed is not None else text,
            )

        return parsed if isinstance(parsed, dict) else {"raw": text}

    def inspect(
        self,
        domains: str | Sequence[str],
        *,
        profile: str = "ecommerce",
        include_evidence: bool = False,
    ) -> dict[str, Any]:
        """Inspect 1 to 100 domains (up to 25 anonymously)."""
        domain_list = [domains] if isinstance(domains, str) else list(domains)
        payload: dict[str, Any] = {"domains": domain_list, "profile": profile}
        if include_evidence:
            payload["include_evidence"] = True
        return self._request("POST", "/api/v1/inspect", payload)

    def inspect_product(self, urls: str | Sequence[str]) -> dict[str, Any]:
        """Probe 1 to 50 public Shopify, WooCommerce, BigCommerce, or Schema.org DTC product URLs."""
        payload: dict[str, Any] = {"url": urls} if isinstance(urls, str) else {"urls": list(urls)}
        return self._request("POST", "/api/v1/product", payload)

    def get_credits(self) -> dict[str, Any]:
        """Check remaining pay-as-you-go credits and recent ledger transactions."""
        if not self.api_key:
            raise StoreTechScanError("get_credits() requires an api_key.", status=401)
        return self._request("GET", "/api/v1/credits")
