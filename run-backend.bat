@echo off
setlocal
cd /d "%~dp0backend"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not in PATH.
  echo Install Node.js LTS from https://nodejs.org and reopen terminal.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm is not installed or not in PATH.
  echo Reinstall Node.js LTS from https://nodejs.org and reopen terminal.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing backend dependencies...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

echo Starting backend on port 4000...
call npm run dev

endlocal
