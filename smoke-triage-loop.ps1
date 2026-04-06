param(
  [int]$Runs = 3,
  [string]$ReportsDir = "qa-reports",
  [switch]$FailOnIterationFailure
)

$ErrorActionPreference = "Stop"
if ($Runs -lt 1) { $Runs = 1 }

function Set-ContentWithRetry {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,
    [Parameter(Mandatory = $true)]
    [AllowEmptyString()]
    [string]$Value,
    [string]$Encoding = "utf8",
    [int]$MaxRetries = 8,
    [int]$RetryDelayMs = 250
  )

  $attempt = 0
  while ($true) {
    try {
      Set-Content -Path $Path -Value $Value -Encoding $Encoding
      return
    }
    catch {
      $attempt += 1
      if ($attempt -ge $MaxRetries) {
        throw
      }
      Start-Sleep -Milliseconds $RetryDelayMs
    }
  }
}

New-Item -ItemType Directory -Path $ReportsDir -Force | Out-Null

$results = @()
for ($i = 1; $i -le $Runs; $i++) {
  Write-Host ("Running smoke triage loop iteration {0}/{1}..." -f $i, $Runs)
  powershell -ExecutionPolicy Bypass -File .\smoke-triage.ps1 -ReportsDir $ReportsDir
  $triageExit = $LASTEXITCODE

  $statusPath = Join-Path $ReportsDir "smoke-triage-status.json"
  $failureCode = "missing-status"
  $schemaValidationExitCode = $null
  $schemaCheckedArtifacts = $null
  $schemaErrorCount = $null
  $schemaPassed = $null
  $smokeExitCode = $null
  $trendExitCode = $null

  if (Test-Path $statusPath) {
    try {
      $status = Get-Content -Path $statusPath -Raw | ConvertFrom-Json
      $failureCode = if ([string]::IsNullOrWhiteSpace([string]$status.failureCode)) { "none" } else { [string]$status.failureCode }
      $schemaValidationExitCode = $status.schemaValidationExitCode
      $schemaCheckedArtifacts = $status.schemaCheckedArtifacts
      $schemaErrorCount = $status.schemaErrorCount
      $schemaPassed = $status.schemaPassed
      $smokeExitCode = $status.smokeExitCode
      $trendExitCode = $status.trendExitCode
    } catch {
      $failureCode = "status-parse-error"
    }
  }

  $results += [pscustomobject]@{
    iteration = $i
    triageExit = $triageExit
    smokeExitCode = $smokeExitCode
    trendExitCode = $trendExitCode
    schemaValidationExitCode = $schemaValidationExitCode
    schemaCheckedArtifacts = $schemaCheckedArtifacts
    schemaErrorCount = $schemaErrorCount
    schemaPassed = $schemaPassed
    failureCode = $failureCode
    recordedAt = (Get-Date).ToString("o")
  }
}

$summaryPath = Join-Path $ReportsDir "smoke-triage-loop-summary.json"
$markdownPath = Join-Path $ReportsDir "smoke-triage-loop-summary.md"

$failureCounts = @{}
foreach ($row in $results) {
  $key = [string]$row.failureCode
  if ($failureCounts.ContainsKey($key)) {
    $failureCounts[$key] = [int]$failureCounts[$key] + 1
  } else {
    $failureCounts[$key] = 1
  }
}

$ranking = @(
  $failureCounts.GetEnumerator() |
    Sort-Object -Property @{ Expression = { $_.Value }; Descending = $true }, @{ Expression = { $_.Key }; Descending = $false }
)

$schemaFailedRuns = @(
  $results | Where-Object {
    ($null -ne $_.schemaValidationExitCode -and [int]$_.schemaValidationExitCode -ne 0) -or
    ($null -ne $_.schemaPassed -and -not [bool]$_.schemaPassed)
  }
).Count

$payload = [pscustomobject]@{
  schemaVersion = "smoke-triage-loop.v1"
  generatedBy = "smoke-triage-loop.ps1"
  generatedAt = (Get-Date).ToString("o")
  runs = $Runs
  schemaFailedRuns = $schemaFailedRuns
  failureCodeCounts = [pscustomobject]$failureCounts
  results = $results
}

Set-ContentWithRetry -Path $summaryPath -Value ($payload | ConvertTo-Json -Depth 8) -Encoding utf8

$lines = @(
  "# Smoke Triage Loop Summary",
  "",
  "Runs: $Runs",
  "Schema-failed runs: $schemaFailedRuns",
  "",
  "Failure code counts:",
  ""
)
if ($ranking.Count -gt 0) {
  foreach ($entry in $ranking) {
    $lines += "- $($entry.Key)=$($entry.Value)"
  }
} else {
  $lines += "- none"
}

$lines += ""
$lines += "| Iteration | triageExit | smokeExit | trendExit | schemaValidationExit | schemaCheckedArtifacts | schemaErrorCount | schemaPassed | failureCode |"
$lines += "|---:|---:|---:|---:|---:|---:|---:|---|---|"
foreach ($row in $results) {
  $lines += "| $($row.iteration) | $($row.triageExit) | $($row.smokeExitCode) | $($row.trendExitCode) | $($row.schemaValidationExitCode) | $($row.schemaCheckedArtifacts) | $($row.schemaErrorCount) | $($row.schemaPassed) | $($row.failureCode) |"
}

Set-ContentWithRetry -Path $markdownPath -Value ($lines -join [Environment]::NewLine) -Encoding utf8

$failedRuns = @($results | Where-Object { [int]$_.triageExit -ne 0 }).Count
Write-Host ("SMOKE-TRIAGE-LOOP runs={0} failed={1} summary={2}" -f $Runs, $failedRuns, $summaryPath)

if ($failedRuns -gt 0 -and $FailOnIterationFailure) {
  exit 1
}

if ($failedRuns -gt 0) {
  Write-Host ("SMOKE-TRIAGE-LOOP warning: failing iterations detected but fail mode is disabled.")
}

exit 0
