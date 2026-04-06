$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root "backend"
$frontendUrl = "http://127.0.0.1:5500/index.html"
$backendHealthUrl = "http://127.0.0.1:4000/api/health"

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
  $nodePath = (Get-Command node -ErrorAction Stop).Source
  Start-Process -FilePath $nodePath -WorkingDirectory $root -ArgumentList @("qa-static-server.js") -RedirectStandardOutput (Join-Path $root "frontend-start.log") -RedirectStandardError (Join-Path $root "frontend-start.err.log")
} else {
  Write-Host "Frontend already running."
}

if (-not (Test-UrlReady -Url $backendHealthUrl)) {
  Write-Host "Starting ElectroMart backend..."
  if (-not $nodePath) {
    $nodePath = (Get-Command node -ErrorAction Stop).Source
  }
  Start-Process -FilePath $nodePath -WorkingDirectory $backendDir -ArgumentList @("src/server.js") -RedirectStandardOutput (Join-Path $root "backend-start.log") -RedirectStandardError (Join-Path $root "backend-start.err.log")
} else {
  Write-Host "Backend already running."
}

Write-Host "Waiting for ElectroMart services to come online..."
$frontendReady = Wait-UrlReady -Url $frontendUrl -TimeoutSeconds 30
$backendReady = Wait-UrlReady -Url $backendHealthUrl -TimeoutSeconds 30

if (-not ($frontendReady -and $backendReady)) {
  Write-Host ""
  Write-Host "ElectroMart did not come online in time."
  Write-Host "Keep the frontend and backend PowerShell windows open and check them for errors."
  Read-Host "Press Enter to close"
  exit 1
}

Write-Host ""
Write-Host "ElectroMart is ready."
Write-Host "Frontend: $frontendUrl"
Write-Host "Backend:  $backendHealthUrl"
Write-Host "Keep this PowerShell window open while you use the site."
Start-Process $frontendUrl
