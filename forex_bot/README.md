# Forex Bot — Foundation Stage

This is **increment 1**: core engine, MT5 connection, risk gate skeleton,
logging, state management. It does **not place any trades yet**. Its job
is to prove the foundation is solid before we build strategy/execution
on top of it.

## What's actually in this increment

```
forex_bot/
├── run.py                   Entry point — connects MT5, starts heartbeat, idles
├── config.py                All settings (reads secrets from .env)
├── requirements.txt
├── .env.example              Copy to .env and fill in your password
│
├── core/
│   ├── event_bus.py          Pub/sub so modules don't call each other directly
│   ├── state_manager.py      Single source of truth for runtime state
│   └── logging_setup.py      Rotating file + console logging
│
├── bot/
│   ├── mt5_connector.py      Connect/reconnect/symbol lookup + DEMO-ONLY safety gate
│   └── heartbeat.py          Background thread detecting silent disconnects
│
├── risk/
│   ├── lot_calculator.py     Position sizing from risk % + broker constraints
│   └── drawdown_guard.py     Daily loss limit + max drawdown circuit breaker
│
└── tests/
    └── test_foundation.py    14 unit tests for everything that doesn't need live MT5
```

**Deliberately not built yet** (comes in later increments, once you confirm
this slice works): strategy/signal generation, execution/order placement,
TradingView webhook, AI analysis layer, dashboard frontend, database
persistence. Those all build *on top of* this foundation — building them
now would mean guessing at interfaces that don't exist yet.

## The demo-only safety gate

`bot/mt5_connector.py` reads the account's `trade_mode` directly from MT5
on connect. If it is not `ACCOUNT_TRADE_MODE_DEMO`, the connector refuses
to proceed and raises `LiveAccountBlockedError`. This is enforced in code,
not config — it cannot be flipped by accident via a settings file.

## Setup on your PC

```bash
cd forex_bot
pip install -r requirements.txt --break-system-packages

copy .env.example .env
```

Edit `.env` and fill in:
```
MT5_PASSWORD=your_exness_demo_password
TELEGRAM_TOKEN=8648276527:AAE-Fz80LrWZYXNNuGAwWBURv4cvPW_lZYY
TELEGRAM_CHAT_ID=8708502908
```

Never paste your password into chat with me or anyone else — only into
this local `.env` file.

## Verifying the foundation works

**1. Run the unit tests** (these don't need MT5 running):
```bash
pytest tests/ -v
```
You should see `14 passed`.

**2. Run the actual bot** (needs MT5 terminal logged into your demo account):
```bash
python run.py
```

Expected output: connects, confirms it's a demo account, prints your
balance/equity, starts the heartbeat, then idles printing nothing further
until you press Ctrl+C — at which point it disconnects cleanly.

If instead it prints `REFUSING TO START` with `LiveAccountBlockedError`,
that means MT5 is logged into something other than the demo account — that
is the safety gate working correctly, not a bug.

**3. Kill the connection mid-run** to test heartbeat recovery: close MT5
entirely while `run.py` is running. Within `HEARTBEAT_INTERVAL` (30s) you
should see reconnect attempts logged. Reopen MT5 and it should recover.

## What "done" looks like for this increment

- [ ] `pytest tests/` shows 14/14 passing on your machine
- [ ] `python run.py` connects to your Exness demo account and prints balance
- [ ] Closing/reopening MT5 triggers visible reconnect logs
- [ ] You've read through `mt5_connector.py` and `drawdown_guard.py` and
      the logic makes sense to you (ask me about anything that doesn't —
      better to understand this layer now than after strategy code depends on it)

Once you've checked these, tell me and we move to the next increment:
the execution pipeline (order placement, confirmation, partial fill
handling) — built on top of this exact risk gate and connector.
