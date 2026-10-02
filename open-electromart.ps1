$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root "backend"
$frontendUrl = "http://127.0.0.1:5500/index.html"
$backendHealthUrl = "http://127.0.0.1:4000/api/health"

# Define log file paths for easier debugging
$tempRoot = if ([string]::IsNullOrWhiteSpace([string]$env:TEMP)) { $root } else { $env:TEMP }
$frontendLog = Join-Path $tempRoot "electromart-frontend.log"
$frontendErrLog = Join-Path $tempRoot "electromart-frontend-err.log"
$backendLog = Join-Path $tempRoot "electromart-backend.log"
$backendErrLog = Join-Path $tempRoot "electromart-backend-err.log"

function Test-UrlReady {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Url
  )

  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
    return [int]$response.StatusCode -eq 200
  } catch {
    return $false
  }
}

function Wait-UrlReady {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Url,
    [int]$TimeoutSeconds = 30
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-UrlReady -Url $Url) {
      return $true
    }
    Start-Sleep -Milliseconds 500
  }

  return $false
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js is not installed or not in PATH."
  Write-Host "Install Node.js LTS from https://nodejs.org and reopen this launcher."
  Read-Host "Press Enter to close"
  exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "npm is not installed or not in PATH."
  Write-Host "Reinstall Node.js LTS from https://nodejs.org and reopen this launcher."
  Read-Host "Press Enter to close"
  exit 1
}

if (-not (Test-Path (Join-Path $backendDir "node_modules"))) {
  Write-Host "Backend dependencies not found. Installing once..."
  Push-Location $backendDir
  try {
    & npm install
    if ($LASTEXITCODE -ne 0) {
      throw "Backend dependency install failed."
    }
  } finally {
    Pop-Location
  }
}

if (-not (Test-UrlReady -Url $frontendUrl)) {
  Write-Host "Starting ElectroMart frontend..."
  Start-Process -FilePath "node" -ArgumentList "qa-static-server.js" -WorkingDirectory $root -RedirectStandardOutput $frontendLog -RedirectStandardError $frontendErrLog -PassThru -WindowStyle Hidden
} else {
  Write-Host "Frontend already running."
}

if (-not (Test-UrlReady -Url $backendHealthUrl)) {
  Write-Host "Starting ElectroMart backend..."
  Start-Process -FilePath "node" -ArgumentList "src/server.js" -WorkingDirectory $backendDir -RedirectStandardOutput $backendLog -RedirectStandardError $backendErrLog -PassThru -WindowStyle Hidden
} else {
  Write-Host "Backend already running."
}

Write-Host "Waiting for ElectroMart services to come online..."
$frontendReady = Wait-UrlReady -Url $frontendUrl -TimeoutSeconds 30
$backendReady = Wait-UrlReady -Url $backendHealthUrl -TimeoutSeconds 30

if (-not ($frontendReady -and $backendReady)) {
  Write-Host ""
  Write-Host "-----------------------------------------------------------------" -ForegroundColor Red
  Write-Host "ERROR: ElectroMart did not come online in time." -ForegroundColor Red
  Write-Host "-----------------------------------------------------------------" -ForegroundColor Red
  Write-Host ""
  Write-Host "This usually means one of the servers failed to start."
  Write-Host "Please check the logs below for errors."
  Write-Host ""

  if (-not $frontendReady) {
    Write-Host "Frontend server log ($frontendLog):" -ForegroundColor Yellow
    if (Test-Path $frontendLog) {
      Get-Content $frontendLog -Tail 20 | Out-String | Write-Host
    }
  }

  if (-not $backendReady) {
    Write-Host "Backend server log ($backendLog):" -ForegroundColor Yellow
    if (Test-Path $backendLog) {
      Get-Content $backendLog -Tail 20 | Out-String | Write-Host
    }
  }
  Read-Host "Press Enter to close"
  exit 1
}

Write-Host ""
Write-Host "ElectroMart is ready."
Write-Host "Frontend: $frontendUrl"
Write-Host "Backend:  $backendHealthUrl"
Write-Host "Keep this PowerShell window open while you use the site."
Start-Process $frontendUrl
