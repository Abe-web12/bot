"""
gemini_client.py
==================
Advisory-only Gemini integration. Gemini NEVER places or approves a
trade by itself — it is called (optionally) by
strategy/signal_orchestrator.py AFTER the deterministic signal_generator
+ signal_scorer have already produced a directional signal and score.
Gemini's structured response is attached to the journal entry as
additional context and MAY be used to slightly adjust the final
confidence score (bounded — see signal_orchestrator.py), but it can
never flip HOLD into a trade, and it can never override the risk gate.

Design:
  - If GEMINI_API_KEY is empty, `is_enabled()` returns False and every
    analyze() call returns a GeminiAdvisory with advisory_available=False
    rather than raising — callers must treat a disabled/failed Gemini
    call as "no opinion", not as an error that blocks trading.
  - Wrapped in gemini_circuit (core/circuit_breaker.py) — repeated
    failures open the circuit and analyze() short-circuits to "no
    opinion" without even attempting the HTTP call, protecting latency.
  - Uses the REST generateContent endpoint directly via httpx rather
    than the google-generativeai SDK, keeping the dependency footprint
    identical to the rest of this codebase (httpx is already a dependency).
"""

from __future__ import annotations

import json
import logging
import re
import time
from dataclasses import dataclass

import httpx

import config
from core.circuit_breaker import CircuitOpenError, gemini_circuit
from core.metrics import metrics

logger = logging.getLogger("gemini_client")

_ENDPOINT_TEMPLATE = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
)
_REQUEST_TIMEOUT = 15.0


class GeminiError(Exception):
    pass


@dataclass(frozen=True)
class GeminiAdvisory:
    advisory_available: bool
    confidence_score: float | None = None       # Gemini's own 0-100 read, independent of our scorer
    reasoning: str = ""
    suggested_action: str = ""                   # "BUY" | "SELL" | "HOLD" | "" (informational only)
    suggested_stop_loss: float | None = None
    suggested_take_profit: float | None = None
    suggested_risk_note: str = ""
    unavailable_reason: str = ""


def is_enabled() -> bool:
    return bool(config.GEMINI_API_KEY)


def _build_prompt(
    symbol: str,
    timeframe: str,
    direction: str,
    our_confidence: float,
    market_context: dict,
) -> str:
    return (
        "You are a market analysis assistant for a rule-based forex trading bot. "
        "The bot has ALREADY decided on a candidate trade using its own deterministic "
        "strategy — you are not deciding whether to trade, only providing a second opinion "
        "on market context. Respond with ONLY a JSON object, no markdown fences, no prose, "
        "matching exactly this schema:\n"
        '{"confidence_score": <0-100 number>, "reasoning": "<short string>", '
        '"suggested_action": "<BUY|SELL|HOLD>", "suggested_stop_loss": <number or null>, '
        '"suggested_take_profit": <number or null>, "risk_note": "<short string>"}\n\n'
        f"Symbol: {symbol}\n"
        f"Timeframe: {timeframe}\n"
        f"Bot's candidate direction: {direction}\n"
        f"Bot's own confidence score: {our_confidence:.1f}/100\n"
        f"Market context: {json.dumps(market_context, default=str)}\n"
    )


def _extract_json(text: str) -> dict:
    """Gemini sometimes wraps JSON in markdown fences despite instructions
    not to — strip those defensively before parsing."""
    stripped = text.strip()
    fence_match = re.match(r"^```(?:json)?\s*(.*?)\s*```$", stripped, re.DOTALL)
    if fence_match:
        stripped = fence_match.group(1)
    return json.loads(stripped)


def analyze(
    symbol: str,
    timeframe: str,
    direction: str,
    our_confidence: float,
    market_context: dict,
) -> GeminiAdvisory:
    """
    Requests Gemini's advisory opinion. Always returns a GeminiAdvisory —
    never raises. advisory_available=False means "treat as no opinion";
    callers must not block trading on this.
    """
    if not is_enabled():
        return GeminiAdvisory(advisory_available=False, unavailable_reason="GEMINI_API_KEY not set.")

    prompt = _build_prompt(symbol, timeframe, direction, our_confidence, market_context)
    url = _ENDPOINT_TEMPLATE.format(model=config.GEMINI_MODEL)
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 300},
    }

    t0 = time.monotonic()
    try:
        response = gemini_circuit.execute(
            httpx.post,
            url,
            params={"key": config.GEMINI_API_KEY},
            json=body,
            timeout=_REQUEST_TIMEOUT,
        )
    except CircuitOpenError as exc:
        logger.warning("Gemini circuit OPEN — skipping call. %s", exc)
        return GeminiAdvisory(advisory_available=False, unavailable_reason=str(exc))
    except httpx.HTTPError as exc:
        logger.error("Gemini HTTP error: %s", exc)
        return GeminiAdvisory(advisory_available=False, unavailable_reason=f"HTTP error: {exc}")
    finally:
        metrics.record_gemini_latency_ms((time.monotonic() - t0) * 1000)

    if response.status_code != 200:
        logger.error("Gemini API returned HTTP %d: %s", response.status_code, response.text[:300])
        return GeminiAdvisory(
            advisory_available=False,
            unavailable_reason=f"HTTP {response.status_code}",
        )

    try:
        payload = response.json()
        candidates = payload.get("candidates", [])
        if not candidates:
            return GeminiAdvisory(advisory_available=False, unavailable_reason="No candidates in response.")
        text_response = candidates[0]["content"]["parts"][0]["text"]
        parsed = _extract_json(text_response)
    except (KeyError, IndexError, json.JSONDecodeError, TypeError) as exc:
        logger.error("Gemini response could not be parsed: %s", exc)
        return GeminiAdvisory(advisory_available=False, unavailable_reason=f"Parse error: {exc}")

    try:
        confidence = float(parsed.get("confidence_score")) if parsed.get("confidence_score") is not None else None
        if confidence is not None:
            confidence = max(0.0, min(100.0, confidence))
    except (TypeError, ValueError):
        confidence = None

    action = str(parsed.get("suggested_action", "")).upper()
    if action not in ("BUY", "SELL", "HOLD"):
        action = ""

    return GeminiAdvisory(
        advisory_available=True,
        confidence_score=confidence,
        reasoning=str(parsed.get("reasoning", ""))[:1000],
        suggested_action=action,
        suggested_stop_loss=_safe_float(parsed.get("suggested_stop_loss")),
        suggested_take_profit=_safe_float(parsed.get("suggested_take_profit")),
        suggested_risk_note=str(parsed.get("risk_note", ""))[:500],
    )


def _safe_float(value) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None
