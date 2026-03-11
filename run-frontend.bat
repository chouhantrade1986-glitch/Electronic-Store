@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not in PATH.
  echo Install Node.js LTS from https://nodejs.org and reopen terminal.
  pause
  exit /b 1
)

echo Starting ElectroMart frontend server on http://127.0.0.1:5500 ...
start "" cmd /c "cd /d %CD% && node qa-static-server.js"
timeout /t 3 >nul

echo Opening ElectroMart frontend...
start "" "http://127.0.0.1:5500/index.html"

echo Tip:
echo 1. Keep backend running in another terminal using run-backend.bat
echo 2. Use the browser URL on 127.0.0.1:5500, not file://
echo 3. Login before opening admin-dashboard.html
pause

endlocal
