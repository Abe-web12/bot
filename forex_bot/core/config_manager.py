"""
config_manager.py
==================
Runtime configuration manager that allows updating selected settings
without restarting the bot.

Architecture:
  - ConfigManager wraps the static config module values in a thread-safe
    layer that can be updated at runtime.
  - Only explicitly whitelisted keys can be changed — anything touching
    credentials (MT5_PASSWORD, TELEGRAM_TOKEN) or structural settings
    (DATABASE_URL, SYMBOLS list) requires a full restart.
  - Every change is validated before being applied. Invalid values are
    rejected with a clear error message; the running config is untouched.
  - Subscribers (execution_engine, risk modules, etc.) are notified via
    the event bus after a successful reload so they can re-read the
    values they care about without polling.
  - Changes are persisted to a JSON sidecar file so they survive restart.
    On startup, ConfigManager loads the sidecar on top of the static
    config, so the last hot-reloaded values are always in effect.
"""

from __future__ import annotations

import json
import logging
import os
import threading
from dataclasses import dataclass, field
from typing import Any

import config as _config_module
from core.event_bus import bus

logger = logging.getLogger("config_manager")

_SIDECAR_PATH = "config_overrides.json"

# Keys that are allowed to change at runtime without a restart.
# Keys NOT in this set are rejected with a clear message.
_HOT_RELOAD_WHITELIST: dict[str, dict] = {
    # Risk
    "RISK_PER_TRADE_PCT":       {"type": float, "min": 0.01, "max": 10.0},
    "MAX_OPEN_TRADES":          {"type": int,   "min": 1,    "max": 20},
    "DAILY_LOSS_LIMIT_PCT":     {"type": float, "min": 0.1,  "max": 20.0},
    "MAX_DRAWDOWN_PCT":         {"type": float, "min": 1.0,  "max": 50.0},
    "MAX_SPREAD_PIPS":          {"type": float, "min": 0.1,  "max": 20.0},
    "MAX_SLIPPAGE_PIPS":        {"type": float, "min": 0.1,  "max": 20.0},
    "MIN_RR_RATIO":             {"type": float, "min": 0.5,  "max": 10.0},
    "SL_ATR_MULTIPLIER":        {"type": float, "min": 0.5,  "max": 5.0},
    "TP1_ATR_MULTIPLIER":       {"type": float, "min": 0.5,  "max": 10.0},
    "TP2_ATR_MULTIPLIER":       {"type": float, "min": 1.0,  "max": 15.0},
    "TP3_ATR_MULTIPLIER":       {"type": float, "min": 1.5,  "max": 20.0},
    "TRAILING_START_PIPS":      {"type": float, "min": 1.0,  "max": 100.0},
    "TRAILING_STEP_PIPS":       {"type": float, "min": 1.0,  "max": 50.0},

    # Strategy / signal
    "RSI_OVERSOLD":             {"type": float, "min": 10.0, "max": 45.0},
    "RSI_OVERBOUGHT":           {"type": float, "min": 55.0, "max": 90.0},
    "RSI_PERIOD":               {"type": int,   "min": 2,    "max": 50},
    "ATR_PERIOD":               {"type": int,   "min": 2,    "max": 50},
    "EMA_FAST":                 {"type": int,   "min": 2,    "max": 50},
    "EMA_SLOW":                 {"type": int,   "min": 5,    "max": 200},
    "EMA_TREND":                {"type": int,   "min": 20,   "max": 500},
    "BB_PERIOD":                {"type": int,   "min": 5,    "max": 100},
    "BB_STD":                   {"type": float, "min": 0.5,  "max": 4.0},
    "MIN_SIGNAL_SCORE":         {"type": float, "min": 0.0,  "max": 100.0},

    # Trading session
    "LONDON_OPEN":              {"type": str,   "pattern": r"^\d{2}:\d{2}$"},
    "LONDON_CLOSE":             {"type": str,   "pattern": r"^\d{2}:\d{2}$"},
    "NY_OPEN":                  {"type": str,   "pattern": r"^\d{2}:\d{2}$"},
    "NY_CLOSE":                 {"type": str,   "pattern": r"^\d{2}:\d{2}$"},
    "TRADE_BEST_HOURS_ONLY":    {"type": bool},

    # Bot behaviour
    "BOT_LOOP_INTERVAL":        {"type": int,   "min": 10,   "max": 3600},
    "HEARTBEAT_INTERVAL":       {"type": int,   "min": 5,    "max": 300},
    "MAX_RETRY_ATTEMPTS":       {"type": int,   "min": 1,    "max": 10},

    # Lot
    "MACD_FAST":                {"type": int,   "min": 2,    "max": 50},
    "MACD_SLOW":                {"type": int,   "min": 5,    "max": 100},
    "MACD_SIGNAL":              {"type": int,   "min": 2,    "max": 50},

    # Dashboard / notifications
    "DASHBOARD_PASSWORD":       {"type": str,   "min_len": 6},
}


@dataclass
class ConfigChange:
    key: str
    old_value: Any
    new_value: Any
    changed_at: str = field(default_factory=lambda: __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat())


class ConfigValidationError(Exception):
    pass


class ConfigManager:
    """
    Thread-safe runtime configuration store. Reads from the static
    config module at init and applies any saved overrides from the
    sidecar file. Provides get/set interface for live changes.
    """

    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._overrides: dict[str, Any] = {}
        self._change_history: list[ConfigChange] = []
        # Capture the true static default for every hot-reloadable key
        # BEFORE loading any saved overrides. This is what reset()/
        # reset_all() revert to — without this snapshot, reset() would
        # read config module attributes that set() has already mutated,
        # making "reset" a no-op that reassigns a value to itself.
        self._static_defaults: dict[str, Any] = {
            key: getattr(_config_module, key, None) for key in _HOT_RELOAD_WHITELIST
        }
        self._load_sidecar()

    # ------------------------------------------------------------------
    # Public interface
    # ------------------------------------------------------------------

    def get(self, key: str) -> Any:
        """Get current value — overrides take precedence over static config."""
        with self._lock:
            if key in self._overrides:
                return self._overrides[key]
            return getattr(_config_module, key, None)

    def set(self, key: str, value: Any) -> ConfigChange:
        """
        Validate and apply a runtime configuration change.
        Persists the override to disk so it survives restart.
        Raises ConfigValidationError if the key is not hot-reloadable
        or the value fails validation.
        """
        if key not in _HOT_RELOAD_WHITELIST:
            raise ConfigValidationError(
                f"'{key}' is not in the hot-reload whitelist. "
                f"Allowed keys: {sorted(_HOT_RELOAD_WHITELIST.keys())}"
            )

        coerced_value = self._validate_value(key, value)

        with self._lock:
            old_value = self.get(key)
            self._overrides[key] = coerced_value
            # Mirror into the live config module so existing code that
            # reads config.SOME_KEY directly picks up the change.
            setattr(_config_module, key, coerced_value)
            change = ConfigChange(key=key, old_value=old_value, new_value=coerced_value)
            self._change_history.append(change)
            self._save_sidecar()

        logger.info("Config hot-reload: %s = %r (was %r)", key, coerced_value, old_value)

        bus.publish(
            "CONFIG_RELOADED",
            {"key": key, "old_value": old_value, "new_value": coerced_value},
            source="config_manager",
        )
        return change

    def set_many(self, changes: dict[str, Any]) -> list[ConfigChange]:
        """
        Validate ALL changes first, then apply atomically.
        If any validation fails, no changes are applied.
        """
        validated: list[tuple[str, Any]] = []
        for key, value in changes.items():
            if key not in _HOT_RELOAD_WHITELIST:
                raise ConfigValidationError(f"'{key}' is not hot-reloadable.")
            coerced = self._validate_value(key, value)
            validated.append((key, coerced))

        applied: list[ConfigChange] = []
        for key, coerced_value in validated:
            applied.append(self.set(key, coerced_value))
        return applied

    def reset(self, key: str) -> Any:
        """Remove a runtime override, reverting to the true static config default."""
        with self._lock:
            old_override = self._overrides.pop(key, None)
            static_value = self._static_defaults.get(key)
            if old_override is not None:
                setattr(_config_module, key, static_value)
                self._save_sidecar()
                logger.info("Config reset: %s reverted to static default %r", key, static_value)
        return static_value

    def reset_all(self) -> None:
        """Remove all runtime overrides."""
        with self._lock:
            for key in list(self._overrides.keys()):
                static_value = self._static_defaults.get(key)
                setattr(_config_module, key, static_value)
            self._overrides.clear()
            self._save_sidecar()
        logger.info("All config overrides reset to static defaults.")

    def current_overrides(self) -> dict[str, Any]:
        with self._lock:
            return self._overrides.copy()

    def change_history(self) -> list[dict]:
        with self._lock:
            return [
                {"key": c.key, "old": c.old_value, "new": c.new_value, "at": c.changed_at}
                for c in self._change_history[-50:]  # last 50 changes
            ]

    def hot_reloadable_keys(self) -> list[str]:
        return sorted(_HOT_RELOAD_WHITELIST.keys())

    # ------------------------------------------------------------------
    # Validation
    # ------------------------------------------------------------------

    def _validate_value(self, key: str, value: Any) -> Any:
        """Coerce and validate a value against the whitelist spec."""
        import re
        spec = _HOT_RELOAD_WHITELIST[key]
        expected_type = spec.get("type")

        # Type coercion
        try:
            if expected_type == bool:
                if isinstance(value, str):
                    coerced = value.lower() in ("true", "1", "yes")
                else:
                    coerced = bool(value)
            elif expected_type is not None:
                coerced = expected_type(value)
            else:
                coerced = value
        except (ValueError, TypeError) as exc:
            raise ConfigValidationError(
                f"Cannot coerce '{key}' value {value!r} to {expected_type}: {exc}"
            )

        # Range validation for numeric types
        if "min" in spec and coerced < spec["min"]:
            raise ConfigValidationError(
                f"'{key}' value {coerced} is below minimum {spec['min']}."
            )
        if "max" in spec and coerced > spec["max"]:
            raise ConfigValidationError(
                f"'{key}' value {coerced} exceeds maximum {spec['max']}."
            )

        # String length validation
        if "min_len" in spec and isinstance(coerced, str) and len(coerced) < spec["min_len"]:
            raise ConfigValidationError(
                f"'{key}' must be at least {spec['min_len']} characters."
            )

        # Pattern validation (e.g. HH:MM time strings)
        if "pattern" in spec:
            if not re.match(spec["pattern"], str(coerced)):
                raise ConfigValidationError(
                    f"'{key}' value '{coerced}' does not match required pattern '{spec['pattern']}'."
                )

        return coerced

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------

    def _save_sidecar(self) -> None:
        try:
            with open(_SIDECAR_PATH, "w", encoding="utf-8") as f:
                json.dump(self._overrides, f, indent=2, default=str)
        except OSError as exc:
            logger.error("Failed to persist config overrides: %s", exc)

    def _load_sidecar(self) -> None:
        if not os.path.exists(_SIDECAR_PATH):
            return
        try:
            with open(_SIDECAR_PATH, "r", encoding="utf-8") as f:
                saved = json.load(f)
            for key, value in saved.items():
                if key in _HOT_RELOAD_WHITELIST:
                    try:
                        coerced = self._validate_value(key, value)
                        self._overrides[key] = coerced
                        setattr(_config_module, key, coerced)
                    except ConfigValidationError as exc:
                        logger.warning(
                            "Skipping saved override '%s' — no longer valid: %s", key, exc
                        )
            if self._overrides:
                logger.info(
                    "Loaded %d config override(s) from %s: %s",
                    len(self._overrides), _SIDECAR_PATH, list(self._overrides.keys()),
                )
        except (OSError, json.JSONDecodeError) as exc:
            logger.error("Failed to load config overrides from %s: %s", _SIDECAR_PATH, exc)


# Single shared instance for the whole process.
config_manager = ConfigManager()
