"""
HTTP transport with retry/backoff. Uses httpx (sync + async).
Zero other dependencies.
"""
from __future__ import annotations

import time
from typing import Any

import httpx

_RETRY_DELAYS = [0.2, 0.4, 0.8]
_RETRYABLE_STATUSES = {429, 500, 502, 503, 504}


def post_sync(url: str, body: dict[str, Any], headers: dict[str, str]) -> httpx.Response:
    merged = {"Content-Type": "application/json", **headers}
    last_exc: Exception | None = None

    for attempt in range(len(_RETRY_DELAYS) + 1):
        if attempt > 0:
            time.sleep(_RETRY_DELAYS[attempt - 1])
        try:
            r = httpx.post(url, json=body, headers=merged, timeout=15)
            if r.status_code not in _RETRYABLE_STATUSES:
                return r
            last_exc = Exception(f"HTTP {r.status_code}")
        except httpx.RequestError as exc:
            last_exc = exc

    raise last_exc or Exception("post_sync: unexpected failure")


async def post_async(url: str, body: dict[str, Any], headers: dict[str, str]) -> httpx.Response:
    import asyncio

    merged = {"Content-Type": "application/json", **headers}
    last_exc: Exception | None = None

    async with httpx.AsyncClient(timeout=15) as client:
        for attempt in range(len(_RETRY_DELAYS) + 1):
            if attempt > 0:
                await asyncio.sleep(_RETRY_DELAYS[attempt - 1])
            try:
                r = await client.post(url, json=body, headers=merged)
                if r.status_code not in _RETRYABLE_STATUSES:
                    return r
                last_exc = Exception(f"HTTP {r.status_code}")
            except httpx.RequestError as exc:
                last_exc = exc

    raise last_exc or Exception("post_async: unexpected failure")
