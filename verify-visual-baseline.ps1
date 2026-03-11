param(
  [string]$SourceDir = "qa-reports/ui",
  [string]$ManifestPath = "qa-baselines/ui/baseline-manifest.json"
)

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourcePath = Join-Path $repoRoot $SourceDir
$manifestFile = Join-Path $repoRoot $ManifestPath

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

  $actualHash = (Get-FileHash -Path $sourceFile -Algorithm SHA256).Hash
  if ($actualHash -ne $expectedHash) {
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
