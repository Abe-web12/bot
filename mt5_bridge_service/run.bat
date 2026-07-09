@echo off
REM ===========================================================================
REM MT5 Bridge Service — Windows Launcher
REM ===========================================================================
REM Start this on the Windows machine that has MetaTrader 5 installed.
REM The bridge exposes HTTP API on port 5002 (configurable via --port).
REM The Linux backend connects to http://<windows-ip>:5002.
REM
REM Usage:
REM   run.bat                          (starts on port 5002, all interfaces)
REM   run.bat --port 5003 --host 127.0.0.1
REM ===========================================================================

cd /d "%~dp0"

echo ========================================
echo   MT5 Bridge Service - Starting...
echo ========================================

REM Create virtualenv if it doesn't exist
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate
)

echo Starting bridge on %~dp0
python app.py %*

pause
