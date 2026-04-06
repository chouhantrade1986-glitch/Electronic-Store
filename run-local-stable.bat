@echo off
setlocal

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js not found in PATH. Install Node.js LTS and reopen terminal.
  pause
  exit /b 1
)

echo Starting ElectroMart frontend on port 5501...
start "ElectroMart Frontend (5501)" cmd /k "cd /d %~dp0 && set FRONTEND_PORT=5501 && node qa-static-server.js"

echo Starting ElectroMart backend on port 4000...
start "ElectroMart Backend (4000)" cmd /k "cd /d %~dp0backend && node src/server.js"

timeout /t 3 >nul
start "" "http://127.0.0.1:5501/index.html"

echo.
echo ElectroMart launch initiated.
echo Keep both new command windows open while using the website.

endlocal
