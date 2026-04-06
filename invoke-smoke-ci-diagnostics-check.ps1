param(
  [string]$WorkflowName = "Smoke Suite",
  [string]$Ref = "main",
  [string]$DownloadDir = "qa-reports-ci-check",
  [int]$PollSeconds = 15,
  [int]$TimeoutMinutes = 45
)

$ErrorActionPreference = "Stop"

function Require-Command {
  param([string]$Name)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command not found: $Name"
  }
}

Require-Command -Name "gh"

Write-Host "Checking GitHub CLI auth..."
$token = [string]$env:GH_TOKEN
if ([string]::IsNullOrWhiteSpace($token)) {
  throw "GH_TOKEN is missing. Set a real PAT in this shell before running this script."
}
if ($token -eq "PASTE_YOUR_TOKEN_HERE") {
  throw "GH_TOKEN is still set to placeholder text. Replace it with a real PAT (scopes: repo, workflow)."
}

$statusOutput = (& gh auth status -h github.com 2>&1 | Out-String)
if ($LASTEXITCODE -ne 0) {
  throw "GitHub CLI auth failed. Verify GH_TOKEN is a valid PAT with repo + workflow scopes. Details: $statusOutput"
}

Write-Host "Dispatching workflow '$WorkflowName' on ref '$Ref'..."
& gh workflow run $WorkflowName --ref $Ref
if ($LASTEXITCODE -ne 0) {
  throw "Failed to dispatch workflow '$WorkflowName'."
}

Write-Host "Resolving latest run id..."
$runId = (& gh run list --workflow $WorkflowName --branch $Ref --limit 1 --json databaseId --jq ".[0].databaseId").Trim()
if ([string]::IsNullOrWhiteSpace($runId)) {
  throw "Unable to resolve run id for workflow '$WorkflowName'."
}

Write-Host "Watching run $runId..."
& gh run watch $runId --interval $PollSeconds --exit-status
$watchExit = $LASTEXITCODE

if (Test-Path $DownloadDir) {
  Remove-Item -Recurse -Force $DownloadDir
}
New-Item -ItemType Directory -Path $DownloadDir -Force | Out-Null

Write-Host "Downloading artifacts for run $runId..."
& gh run download $runId -D $DownloadDir
if ($LASTEXITCODE -ne 0) {
  throw "Failed to download artifacts for run $runId."
}

$windowCandidates = Get-ChildItem -Path $DownloadDir -Recurse -File -Filter "smoke-trend-window.json"
if (-not $windowCandidates -or $windowCandidates.Count -eq 0) {
  throw "smoke-trend-window.json not found in downloaded artifacts."
}

$windowPath = $windowCandidates[0].FullName
$window = Get-Content -Path $windowPath -Raw | ConvertFrom-Json

$diagnosticsPresentRuns = if ($null -ne $window.diagnosticsPresentRuns) { [int]$window.diagnosticsPresentRuns } else { -1 }
$diagnosticsPresentRate = if ($null -ne $window.diagnosticsPresentRate) { [double]$window.diagnosticsPresentRate } else { -1 }
$windowSize = if ($null -ne $window.windowSize) { [int]$window.windowSize } else { -1 }

Write-Host ""
Write-Host "Smoke diagnostics trend verification"
Write-Host "- runId: $runId"
Write-Host "- runWatchExitCode: $watchExit"
Write-Host "- smokeTrendWindowPath: $windowPath"
Write-Host "- windowSize: $windowSize"
Write-Host "- diagnosticsPresentRuns: $diagnosticsPresentRuns"
Write-Host "- diagnosticsPresentRate: $diagnosticsPresentRate"

$summaryFile = Join-Path $DownloadDir "smoke-ci-diagnostics-check.json"
$result = [ordered]@{
  runId = $runId
  runWatchExitCode = $watchExit
  smokeTrendWindowPath = $windowPath
  windowSize = $windowSize
  diagnosticsPresentRuns = $diagnosticsPresentRuns
  diagnosticsPresentRate = $diagnosticsPresentRate
  verifiedAt = (Get-Date).ToString("o")
}
Set-Content -Path $summaryFile -Value ($result | ConvertTo-Json -Depth 5) -Encoding utf8
Write-Host "- summaryJson: $summaryFile"

if ($diagnosticsPresentRuns -lt 0) {
  throw "diagnosticsPresentRuns is missing in smoke-trend-window.json"
}

Write-Host "Verification complete."
