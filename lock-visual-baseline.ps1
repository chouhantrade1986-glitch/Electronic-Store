param(
  [string]$SourceDir = "qa-reports/ui",
  [string]$DestinationDir = "qa-baselines/ui",
  [string[]]$Files = @(
    "qa-auth-browser.png",
    "qa-account-browser.png",
    "qa-invoice-browser.png",
    "qa-checkout-browser.png",
    "qa-orders-browser.png",
    "qa-wishlist-browser.png"
  )
)

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourcePath = Join-Path $repoRoot $SourceDir
$destinationPath = Join-Path $repoRoot $DestinationDir

function Get-Sha256Hash {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  $hashCommand = Get-Command -Name Get-FileHash -ErrorAction SilentlyContinue
  if ($hashCommand) {
    return ((Get-FileHash -Path $Path -Algorithm SHA256).Hash).ToUpperInvariant()
  }

  $sha = [System.Security.Cryptography.SHA256]::Create()
  try {
    $stream = [System.IO.File]::OpenRead($Path)
    try {
      $bytes = $sha.ComputeHash($stream)
    }
    finally {
      $stream.Dispose()
    }
  }
  finally {
    $sha.Dispose()
  }
  return (($bytes | ForEach-Object { $_.ToString("x2") }) -join "").ToUpperInvariant()
}

if (-not (Test-Path -Path $sourcePath)) {
  throw "Source artifacts directory not found: $sourcePath. Run npm run smoke:ui first."
}

New-Item -ItemType Directory -Path $destinationPath -Force | Out-Null

$copied = @()
foreach ($file in $Files) {
  $sourceFile = Join-Path $sourcePath $file
  if (-not (Test-Path -Path $sourceFile)) {
    throw "Required screenshot is missing: $sourceFile. Run npm run smoke:ui first."
  }

  $destinationFile = Join-Path $destinationPath $file
  Copy-Item -Path $sourceFile -Destination $destinationFile -Force

  $fileItem = Get-Item -Path $destinationFile
  $hash = Get-Sha256Hash -Path $destinationFile
  $copied += [ordered]@{
    name = $file
    bytes = $fileItem.Length
    sha256 = $hash
  }
}

$manifestPath = Join-Path $destinationPath "baseline-manifest.json"
$manifest = [ordered]@{
  baselineType = "ui-visual"
  generatedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  sourceDir = (Resolve-Path -Path $sourcePath).Path
  destinationDir = (Resolve-Path -Path $destinationPath).Path
  files = $copied
}

$manifest | ConvertTo-Json -Depth 5 | Set-Content -Path $manifestPath -Encoding UTF8

Write-Host "Visual baseline locked at: $destinationPath"
Write-Host "Manifest: $manifestPath"
