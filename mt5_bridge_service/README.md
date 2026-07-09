# MT5 Bridge Service

Windows service that exposes MetaTrader 5 operations over HTTP REST API.
Allows the ForexBot Linux backend to trade through a Windows-hosted MT5 terminal.

## Architecture

```
[Linux Server - Docker]                    [Windows Server]
  ForexBot Backend   ---HTTP--->    MT5 Bridge Service  ----> MetaTrader 5
  (no MetaTrader5)                   (MetaTrader5 installed)
```

## Setup

1. Install MetaTrader 5 on the Windows machine and log in to your broker
2. Install Python 3.12+ on Windows
3. Run:
   ```
   cd mt5_bridge_service
   pip install -r requirements.txt
   python app.py --port 5002
   ```
4. The bridge listens on `http://0.0.0.0:5002`

## Configuration on Linux Backend

Set these environment variables:

```env
MT5_MODE=bridge
MT5_BRIDGE_URL=http://<windows-ip>:5002
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/initialize | Initialize MT5 connection |
| POST | /api/v1/login | Login to broker |
| POST | /api/v1/shutdown | Shutdown MT5 |
| GET | /api/v1/last-error | Get last MT5 error |
| GET | /api/v1/account-info | Get account info |
| GET | /api/v1/terminal-info | Get terminal info |
| GET | /api/v1/symbol-info/{symbol} | Get symbol info |
| GET | /api/v1/symbols-get | Get all symbols |
| POST | /api/v1/symbol-select | Enable/disable symbol |
| GET | /api/v1/tick/{symbol} | Get latest tick |
| GET | /api/v1/rates/{symbol} | Get OHLC rate history |
| POST | /api/v1/order-send | Send trade order |
| POST | /api/v1/order-check | Check order before sending |
| GET | /api/v1/positions | Get open positions |
| GET | /api/v1/health | Health check |

## Security

The bridge does NOT implement authentication by default — secure it with:
- Windows Firewall rules to restrict access to the Linux backend IP
- A reverse proxy (nginx on Windows) with IP whitelisting
- SSH tunnel from Linux to Windows
