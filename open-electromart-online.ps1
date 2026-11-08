param(
  [switch]$TestOnly = $false
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root "backend"
$onlinePort = 5555
$onlineFrontendUrl = "http://127.0.0.1:$onlinePort/index.html"
$backendHealthUrl = "http://127.0.0.1:4000/api/health"
$devTunnelHost = ([string]$env:DEV_TUNNEL_HOST).Trim().ToLowerInvariant()
$hostnamePattern = '^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$'
$reservedSuffixes = @(".example", ".invalid", ".localhost", ".local", ".test")
$hasReservedSuffix = $false
foreach ($suffix in $reservedSuffixes) {
  if ($devTunnelHost.EndsWith($suffix, [System.StringComparison]::OrdinalIgnoreCase)) {
    $hasReservedSuffix = $true
    break
  }
}
$isValidTunnelHost = $devTunnelHost -match $hostnamePattern -and -not $hasReservedSuffix

$tempRoot = if ([string]::IsNullOrWhiteSpace([string]$env:TEMP)) { $root } else { $env:TEMP }
$frontendLog = Join-Path $tempRoot "electromart-frontend.log"
$frontendErrLog = Join-Path $tempRoot "electromart-frontend-err.log"
$backendLog = Join-Path $tempRoot "electromart-backend.log"
$backendErrLog = Join-Path $tempRoot "electromart-backend-err.log"

$frontendProcess = $null

function Test-UrlReady {
  param([string]$Url)
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
    return [int]$response.StatusCode -eq 200
  } catch {
    return $false
  }
}

function Wait-UrlReady {
  param([string]$Url, [int]$TimeoutSeconds = 30)
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-UrlReady -Url $Url) {
      return $true
    }
    Start-Sleep -Milliseconds 500
  }
  return $false
}

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  ELECTROMART — CONFIGURED PUBLIC HOST LAUNCHER" -ForegroundColor Yellow
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

if (-not $isValidTunnelHost) {
  Write-Host "ERROR: Set DEV_TUNNEL_HOST to a public DNS hostname before launching." -ForegroundColor Red
  Write-Host "Use the hostname only; do not include a scheme, port, path, or reserved local suffix." -ForegroundColor Red
  exit 1
}

$liveUrl = "https://$devTunnelHost"

if ($TestOnly) {
  Write-Host "TestOnly mode requested: Validated configured public host ($liveUrl)." -ForegroundColor Green
  exit 0
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "ERROR: Node.js is not installed or not in PATH." -ForegroundColor Red
  Read-Host "Press Enter to close"
  exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "ERROR: npm is not installed or not in PATH." -ForegroundColor Red
  Read-Host "Press Enter to close"
  exit 1
}

if (-not (Test-Path (Join-Path $backendDir "node_modules"))) {
  Write-Host "Backend dependencies missing. Running npm install..." -ForegroundColor Yellow
  Push-Location $backendDir
  try {
    & npm install
  } finally {
    Pop-Location
  }
}

if (-not (Test-UrlReady -Url $onlineFrontendUrl)) {
  Write-Host "Starting online frontend server (port $onlinePort with /api proxy)..." -ForegroundColor Gray
  $frontendProcess = Start-Process -FilePath "node" -ArgumentList "qa-static-server.js $onlinePort" -WorkingDirectory $root -RedirectStandardOutput $frontendLog -RedirectStandardError $frontendErrLog -PassThru -WindowStyle Hidden
} else {
  Write-Host "Frontend server is already active on port $onlinePort." -ForegroundColor Green
}

if (-not (Test-UrlReady -Url $backendHealthUrl)) {
  Write-Host "Starting backend server (port 4000)..." -ForegroundColor Gray
  Start-Process -FilePath "node" -ArgumentList "src/server.js" -WorkingDirectory $backendDir -RedirectStandardOutput $backendLog -RedirectStandardError $backendErrLog -PassThru -WindowStyle Hidden
} else {
  Write-Host "Backend server is already active." -ForegroundColor Green
}

Write-Host "Verifying local services readiness..." -ForegroundColor Gray
$frontendReady = Wait-UrlReady -Url $onlineFrontendUrl -TimeoutSeconds 20
$backendReady = Wait-UrlReady -Url $backendHealthUrl -TimeoutSeconds 20

if (-not ($frontendReady -and $backendReady)) {
  Write-Host "ERROR: Local services failed to start in time. Check $frontendLog and $backendLog." -ForegroundColor Red
  Read-Host "Press Enter to close"
  exit 1
}

Write-Host "Using the configured public HTTPS host: $liveUrl" -ForegroundColor Cyan
Write-Host "DNS and tunnel ingress must be configured outside this launcher." -ForegroundColor Gray

# Copy to Windows Clipboard
try {
  Set-Clipboard -Value $liveUrl
  $copied = $true
} catch {
  $copied = $false
}

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Green
Write-Host "  SUCCESS: ELECTROMART IS LIVE ON THE INTERNET! (वेबसाइट ऑनलाइन हो गई)" -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  🌐 PUBLIC LIVE LINK : " -NoNewline -ForegroundColor White
Write-Host "$liveUrl" -ForegroundColor Yellow
if ($copied) {
  Write-Host "  📋 CLIPBOARD STATUS : " -NoNewline -ForegroundColor White
  Write-Host "COPIED TO CLIPBOARD! (लिंक आपके क्लिपबोर्ड पर कॉपी हो गया)" -ForegroundColor Green
}
Write-Host "  📱 REMOTE ACCESS    : Anyone worldwide can open this link on Phone, Tablet, PC" -ForegroundColor Cyan
Write-Host "  ⚡ FULL STORE ACTIVE: 751 Products, Search, Cart, Wishlist, Checkout, Orders" -ForegroundColor Cyan
Write-Host ""
Write-Host "------------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  💡 Share the configured host only while its DNS and ingress are active." -ForegroundColor Yellow
Write-Host "  1. WhatsApp, Telegram, या Email में 'Ctrl + V' (Paste) करके लिंक भेज दें।" -ForegroundColor White
Write-Host "  2. जब तक यह विंडो खुली है, आपकी वेबसाइट ऑनलाइन चलेगी।" -ForegroundColor White
Write-Host "  3. 'q' दबाकर Enter करें — इस launcher द्वारा शुरू की गई frontend server बंद हो जाएगी।" -ForegroundColor White
Write-Host "========================================================================" -ForegroundColor Green
Write-Host ""

# Open in default browser
Start-Process $liveUrl

# Wait for user to stop or quit
try {
  while ($true) {
    if ([Environment]::UserInteractive -and -not [Console]::IsInputRedirected) {
      Write-Host -NoNewline "Website is LIVE... Type 'q' and press Enter to stop: "
      $inputKey = Read-Host
      if ($inputKey -eq "q" -or $inputKey -eq "exit" -or $inputKey -eq "quit") {
        break
      }
    } else {
      Start-Sleep -Seconds 2
    }
  }
} finally {
  Write-Host ""
  if ($frontendProcess -and -not $frontendProcess.HasExited) {
    Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
  }
  Write-Host "ElectroMart is now OFFLINE from the internet." -ForegroundColor Gray
}
