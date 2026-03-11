param(
  [string]$SourceDir = "qa-reports/ui",
  [string]$ManifestPath = "qa-baselines/ui/baseline-manifest.json"
)

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourcePath = Join-Path $repoRoot $SourceDir
$manifestFile = Join-Path $repoRoot $ManifestPath

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

if (-not (Test-Path -Path $manifestFile)) {
  throw "Baseline manifest not found: $manifestFile. Run npm run smoke:baseline:lock first."
}

$manifest = Get-Content -Path $manifestFile -Raw | ConvertFrom-Json
$failures = @()

foreach ($entry in $manifest.files) {
  $fileName = [string]$entry.name
  $expectedHash = [string]$entry.sha256
  $sourceFile = Join-Path $sourcePath $fileName

  if (-not (Test-Path -Path $sourceFile)) {
    $failures += "Missing screenshot: $sourceFile"
    continue
  }

  $actualHash = Get-Sha256Hash -Path $sourceFile
  if ($actualHash -ne [string]$expectedHash.ToUpperInvariant()) {
    $failures += "Hash mismatch for $fileName`n  expected: $expectedHash`n  actual:   $actualHash"
  }
}

if ($failures.Count -gt 0) {
  Write-Host "Visual baseline verification failed:" -ForegroundColor Red
  foreach ($failure in $failures) {
    Write-Host "- $failure"
  }
  exit 1
}

Write-Host "Visual baseline verification passed."
Write-Host "Compared $(($manifest.files | Measure-Object).Count) file(s) from $sourcePath"
