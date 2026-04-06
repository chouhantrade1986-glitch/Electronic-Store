param(
  [string]$ReportsDir = "qa-reports",
  [int]$MaxEntries = 30,
  [int]$WindowSize = 10,
  [int]$WarnThreshold = 3,
  [int]$ErrorThreshold = 6,
  [int]$FailureWarnThreshold = 2,
  [int]$FailureErrorThreshold = 4,
  [switch]$NoAppend
)

$ErrorActionPreference = "Stop"

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

if ($MaxEntries -lt 5) { $MaxEntries = 5 }
if ($WindowSize -lt 3) { $WindowSize = 3 }
if ($WindowSize -gt $MaxEntries) { $WindowSize = $MaxEntries }
if ($WarnThreshold -lt 1) { $WarnThreshold = 1 }
if ($ErrorThreshold -lt $WarnThreshold) { $ErrorThreshold = $WarnThreshold }
if ($FailureWarnThreshold -lt 1) { $FailureWarnThreshold = 1 }
if ($FailureErrorThreshold -lt $FailureWarnThreshold) { $FailureErrorThreshold = $FailureWarnThreshold }

New-Item -ItemType Directory -Path $ReportsDir -Force | Out-Null

$historyPath = Join-Path $ReportsDir "smoke-trend-history.json"
$latestPath = Join-Path $ReportsDir "smoke-trend-latest.json"
$windowPath = Join-Path $ReportsDir "smoke-trend-window.json"
$summaryPath = Join-Path $ReportsDir "smoke-trend-summary.md"
$smokeReportPath = Join-Path $ReportsDir "smoke-report.json"
$smokeDiagnosticsPath = Join-Path $ReportsDir "smoke-failure-diagnostics.json"

$history = @()
if (Test-Path $historyPath) {
  try {
    $loaded = Get-Content -Path $historyPath -Raw | ConvertFrom-Json
    if ($loaded -is [System.Collections.IEnumerable]) {
      $history = @($loaded)
    } elseif ($null -ne $loaded) {
      # Backward compatibility: accept legacy single-object history files.
      $history = @($loaded)
    }
  } catch {
    $history = @()
  }
}

$entry = [ordered]@{
  schemaVersion = "smoke-trend-entry.v2"
  generatedBy = "smoke-trend.ps1"
  timestamp = (Get-Date).ToString("o")
  runId = "local"
  runAttempt = "1"
  event = "manual"
  refName = "local"
  sha = "local"
  smokeExitCode = $null
  failures = $null
  skipped = $null
  uiRetries = 0
  uiRetrySteps = @()
  failureCode = "none"
  failureCodeSequence = "none"
  failureCodeSequenceArray = @("none")
  hasSmokeReport = $false
  hasDiagnostics = $false
}

$entry.hasDiagnostics = Test-Path $smokeDiagnosticsPath

if (Test-Path $smokeReportPath) {
  try {
    $report = Get-Content -Path $smokeReportPath -Raw | ConvertFrom-Json
    $entry.hasSmokeReport = $true
    if ($null -ne $report.exitCode) { $entry.smokeExitCode = [int]$report.exitCode }
    if ($report.summary -and $null -ne $report.summary.failures) { $entry.failures = [int]$report.summary.failures }
    if ($report.summary -and $null -ne $report.summary.skipped) { $entry.skipped = [int]$report.summary.skipped }
    if ($report.summary -and $null -ne $report.summary.uiRetries) { $entry.uiRetries = [int]$report.summary.uiRetries }
    if ($report.summary -and $null -ne $report.summary.uiRetrySteps) {
      $entry.uiRetrySteps = @($report.summary.uiRetrySteps | ForEach-Object { [string]$_ })
    }

    $failedSuites = @()
    $failedCases = @()
    foreach ($suite in @($report.assertions)) {
      foreach ($testcase in @($suite.testcases)) {
        if (-not [bool]$testcase.passed) {
          if ([string]$suite.name -and -not ($failedSuites -contains [string]$suite.name)) {
            $failedSuites += [string]$suite.name
          }
          $failedCases += ("{0}/{1}" -f [string]$suite.name, [string]$testcase.name)
        }
      }
    }

    $fatalError = [string]$report.fatalError
    if (-not [string]::IsNullOrWhiteSpace($fatalError)) {
      $apiCode = $null
      $uiCode = $null
      if ($report.commands -and $report.commands.api) { $apiCode = $report.commands.api.code }
      if ($report.commands -and $report.commands.ui) { $uiCode = $report.commands.ui.code }

      if ($null -ne $apiCode -and [int]$apiCode -ne 0) {
        $entry.failureCode = "smoke-fatal-api"
      } elseif ($null -ne $uiCode -and [int]$uiCode -ne 0) {
        $entry.failureCode = "smoke-fatal-ui"
      } else {
        $entry.failureCode = "smoke-fatal"
      }
    } elseif ($failedCases.Count -gt 0) {
      if ($failedSuites.Count -eq 1 -and $failedSuites[0] -eq "api") {
        $entry.failureCode = "smoke-assertion-api"
      } elseif ($failedSuites.Count -eq 1 -and $failedSuites[0] -eq "ui") {
        $entry.failureCode = "smoke-assertion-ui"
      } elseif ($failedSuites.Count -gt 1) {
        $entry.failureCode = "smoke-assertion-mixed"
      } else {
        $entry.failureCode = "smoke-assertion"
      }
    } elseif ($null -ne $report.exitCode -and [int]$report.exitCode -ne 0) {
      $entry.failureCode = "smoke-unknown"
    }
  } catch {
    $entry.failureCode = "report-parse-error"
    Write-Warning "Failed to parse smoke report at $smokeReportPath"
  }
} elseif ($null -ne $entry.smokeExitCode -and [int]$entry.smokeExitCode -ne 0) {
  $entry.failureCode = "report-missing"
}

$entryFailureCode = if (-not [string]::IsNullOrWhiteSpace([string]$entry.failureCode)) {
  [string]$entry.failureCode
} else {
  "none"
}
$entry.failureCodeSequence = $entryFailureCode
$entry.failureCodeSequenceArray = @($entryFailureCode)

if (-not $NoAppend) {
  $history = @($history + @([pscustomobject]$entry))
  if ($history.Count -gt $MaxEntries) {
    $history = @($history | Select-Object -Last $MaxEntries)
  }
}

$windowRows = @($history | Select-Object -Last $WindowSize)
$windowRetryRuns = @($windowRows | Where-Object { [int]($_.uiRetries) -gt 0 })
$windowRetryCount = ($windowRetryRuns | Measure-Object).Count
$windowDiagnosticsRuns = @($windowRows | Where-Object { [bool]$_.hasDiagnostics })
$windowDiagnosticsCount = ($windowDiagnosticsRuns | Measure-Object).Count
$failureCodeSequence = @(
  $windowRows | ForEach-Object {
    $code = [string]$_.failureCode
    if ([string]::IsNullOrWhiteSpace($code)) { "none" } else { $code }
  }
)
$failureCodeSequenceText = if ($failureCodeSequence.Count -gt 0) {

$windowDiagnosticsRate = [math]::Round((100.0 * [double]$windowDiagnosticsCount) / [double]$WindowSize, 1)
  [string]::Join(', ', $failureCodeSequence)
} else {
  "-"
}

$failureSymbolMap = @{
  "none" = "N"
  "smoke-assertion-api" = "A"
  "smoke-assertion-ui" = "U"
  "smoke-assertion-mixed" = "M"
  "smoke-assertion" = "S"
  "smoke-fatal" = "F"
  "smoke-fatal-api" = "R"
  "smoke-fatal-ui" = "V"
  "smoke-unknown" = "K"
  "report-parse-error" = "P"
  "report-missing" = "G"
  "trend-fail" = "T"
}

$failureCodeSparklineSymbols = @(
  $failureCodeSequence | ForEach-Object {
    $code = [string]$_
    if ($failureSymbolMap.ContainsKey($code)) {
      [string]$failureSymbolMap[$code]
    } else {
      "?"
    }
  }
)
$failureCodeSparkline = if ($failureCodeSparklineSymbols.Count -gt 0) {
  [string]::Join('', $failureCodeSparklineSymbols)
} else {
  "-"
}
$failureCodeSparklineLegend = "N=none, A=assertion-api, U=assertion-ui, M=assertion-mixed, S=assertion, F=fatal, R=fatal-api, V=fatal-ui, K=unknown, P=parse-error, G=report-missing, T=trend-fail, ?=other"

$windowNonNoneFailureRuns = @(
  $windowRows | Where-Object {
    $code = [string]$_.failureCode
    -not [string]::IsNullOrWhiteSpace($code) -and $code -ne "none"
  }
)
$windowNonNoneFailureCount = ($windowNonNoneFailureRuns | Measure-Object).Count
$failureCodeCounts = @{}
foreach ($row in $windowRows) {
  $code = if (-not [string]::IsNullOrWhiteSpace([string]$row.failureCode)) { [string]$row.failureCode } else { "none" }
  if ($failureCodeCounts.ContainsKey($code)) {
    $failureCodeCounts[$code] = [int]$failureCodeCounts[$code] + 1
  } else {
    $failureCodeCounts[$code] = 1
  }
}
$failureCodeRanking = @(
  $failureCodeCounts.GetEnumerator() |
    Sort-Object -Property @{ Expression = { $_.Value }; Descending = $true }, @{ Expression = { $_.Key }; Descending = $false }
)
$nonNoneFailureCodeRanking = @($failureCodeRanking | Where-Object { [string]$_.Key -ne "none" })
$dominantNonNoneFailureClass = if ($nonNoneFailureCodeRanking.Count -gt 0) {
  "{0}={1}" -f $nonNoneFailureCodeRanking[0].Key, $nonNoneFailureCodeRanking[0].Value
} else {
  "none"
}

$topFailureCodes = @(
  ($failureCodeRanking | Select-Object -First 5) | ForEach-Object {
    [pscustomobject]@{
      failureCode = [string]$_.Key
      count = [int]$_.Value
      percentOfWindow = [math]::Round((100.0 * [double]$_.Value) / [double]$WindowSize, 1)
    }
  }
)

$retryStepSet = [System.Collections.Generic.HashSet[string]]::new()
$stepRetryCounts = @{}
foreach ($row in $windowRetryRuns) {
  foreach ($stepName in @($row.uiRetrySteps)) {
    if (-not [string]::IsNullOrWhiteSpace([string]$stepName)) {
      $normalized = [string]$stepName
      [void]$retryStepSet.Add($normalized)
      if ($stepRetryCounts.ContainsKey($normalized)) {
        $stepRetryCounts[$normalized] = [int]$stepRetryCounts[$normalized] + 1
      } else {
        $stepRetryCounts[$normalized] = 1
      }
    }
  }
}

$retryProneSteps = @($retryStepSet)
[array]::Sort($retryProneSteps)

$stepRetryRanking = @(
  $stepRetryCounts.GetEnumerator() |
    Sort-Object -Property @{ Expression = { $_.Value }; Descending = $true }, @{ Expression = { $_.Key }; Descending = $false }
)

$topFlakySteps = @(
  ($stepRetryRanking | Select-Object -First 3) | ForEach-Object {
    [pscustomobject]@{
      step = [string]$_.Key
      count = [int]$_.Value
      percentOfWindow = [math]::Round((100.0 * [double]$_.Value) / [double]$WindowSize, 1)
    }
  }
)

$hottestFlakyStep = if ($stepRetryRanking.Count -gt 0) {
  "{0}={1}" -f $stepRetryRanking[0].Key, $stepRetryRanking[0].Value
} else {
  "none"
}

$windowSnapshot = [pscustomobject]@{
  schemaVersion = "smoke-trend-window.v2"
  generatedBy = "smoke-trend.ps1"
  generatedAt = (Get-Date).ToString("o")
  windowSize = $WindowSize
  maxEntries = $MaxEntries
  thresholds = [pscustomobject]@{
    warning = $WarnThreshold
    error = $ErrorThreshold
    failureWarning = $FailureWarnThreshold
    failureError = $FailureErrorThreshold
  }
  retryAffectedRuns = $windowRetryCount
  diagnosticsPresentRuns = $windowDiagnosticsCount
  diagnosticsPresentRate = $windowDiagnosticsRate
  failureAffectedRuns = $windowNonNoneFailureCount
  failureCodeSequence = @($failureCodeSequence)
  failureCodeSequenceText = $failureCodeSequenceText
  failureCodeSparkline = $failureCodeSparkline
  failureCodeSparklineLegend = $failureCodeSparklineLegend
  retryProneSteps = @($retryProneSteps)
  perStepRetryCounts = [pscustomobject]$stepRetryCounts
  failureCodeCounts = [pscustomobject]$failureCodeCounts
  topFailureCodes = $topFailureCodes
  dominantNonNoneFailureClass = $dominantNonNoneFailureClass
  hottestFlakyStep = $hottestFlakyStep
  topFlakySteps = $topFlakySteps
}

Set-ContentWithRetry -Path $historyPath -Value (ConvertTo-Json -InputObject ([object[]]$history) -Depth 8) -Encoding utf8
Set-ContentWithRetry -Path $latestPath -Value ([pscustomobject]$entry | ConvertTo-Json -Depth 8) -Encoding utf8
Set-ContentWithRetry -Path $windowPath -Value ($windowSnapshot | ConvertTo-Json -Depth 8) -Encoding utf8

$frequencyText = if ($stepRetryRanking.Count -gt 0) {
  [string]::Join(', ', @($stepRetryRanking | ForEach-Object { "{0}={1}" -f $_.Key, $_.Value }))
} else {
  "-"
}

$failureCodeText = if ($failureCodeRanking.Count -gt 0) {
  [string]::Join(', ', @($failureCodeRanking | ForEach-Object { "{0}={1}" -f $_.Key, $_.Value }))
} else {
  "-"
}

$lines = @(
  "# Smoke Flake Trend",
  "",
  "Keeping last $MaxEntries runs.",
  "",
  "Window (last $WindowSize runs): $windowRetryCount run(s) required UI retries.",
  "Window (last $WindowSize runs): $windowDiagnosticsCount run(s) produced smoke diagnostics artifacts ($windowDiagnosticsRate%).",
  "Thresholds: warning >= $WarnThreshold, error >= $ErrorThreshold.",
  "Failure-class thresholds: warning >= $FailureWarnThreshold, error >= $FailureErrorThreshold.",
  "Window (last $WindowSize runs): $windowNonNoneFailureCount run(s) had non-none failureCode.",
  "Dominant non-none failure class (window): $dominantNonNoneFailureClass",
  "Failure-class sequence (window, oldest -> newest): $failureCodeSequenceText",
  "Failure-class sparkline (window, oldest -> newest): $failureCodeSparkline",
  "Failure-class sparkline legend: $failureCodeSparklineLegend",
  "Retry-prone steps in window: " + $(if ($retryProneSteps.Count -gt 0) { [string]::Join(', ', $retryProneSteps) } else { '-' }),
  "Per-step retry frequency (window): $frequencyText",
  "Failure class breakdown (window): $failureCodeText",
  "Hottest flaky step (window): $hottestFlakyStep",
  "",
  "Top failure classes (window):",
  "",
  "| FailureCode | Count | % of window |",
  "|---|---:|---:|"
)

if ($topFailureCodes.Count -gt 0) {
  foreach ($row in $topFailureCodes) {
    $lines += "| $($row.failureCode) | $($row.count) | $($row.percentOfWindow)% |"
  }
} else {
  $lines += "| none | 0 | 0% |"
}

$lines += ""

$lines += "Top 3 flaky steps (window):"
$lines += ""
$lines += "| Step | Count | % of window |"
$lines += "|---|---:|---:|"

if ($topFlakySteps.Count -gt 0) {
  foreach ($row in $topFlakySteps) {
    $lines += "| $($row.step) | $($row.count) | $($row.percentOfWindow)% |"
  }
} else {
  $lines += "| - | 0 | 0% |"
}

$lines += ""
$lines += "| Timestamp | Run | Event | Exit | Failures | uiRetries | FailureCode | Diagnostics | Retry Steps |"
$lines += "|---|---:|---|---:|---:|---:|---|---|---|"
foreach ($row in $history) {
  $steps = if ($row.uiRetrySteps -and @($row.uiRetrySteps).Count -gt 0) { [string]::Join(', ', @($row.uiRetrySteps)) } else { '-' }
  $code = if (-not [string]::IsNullOrWhiteSpace([string]$row.failureCode)) { [string]$row.failureCode } else { 'none' }
  $diagnosticsFlag = if ([bool]$row.hasDiagnostics) { 'yes' } else { 'no' }
  $lines += "| $($row.timestamp) | $($row.runId).$($row.runAttempt) | $($row.event) | $($row.smokeExitCode) | $($row.failures) | $($row.uiRetries) | $code | $diagnosticsFlag | $steps |"
}

Set-ContentWithRetry -Path $summaryPath -Value ($lines -join [Environment]::NewLine) -Encoding utf8

Write-Host "Smoke trend files updated:"
Write-Host "- $historyPath"
Write-Host "- $latestPath"
Write-Host "- $windowPath"
Write-Host "- $summaryPath"

if ($windowRetryCount -ge $ErrorThreshold) {
  Write-Warning "Critical flake trend: $windowRetryCount retry-affected run(s) in last $WindowSize."
} elseif ($windowRetryCount -ge $WarnThreshold) {
  Write-Warning "Warning flake trend: $windowRetryCount retry-affected run(s) in last $WindowSize."
}

if ($windowNonNoneFailureCount -ge $FailureErrorThreshold) {
  Write-Warning "Critical failure-class trend: $windowNonNoneFailureCount run(s) with non-none failureCode in last $WindowSize."
} elseif ($windowNonNoneFailureCount -ge $FailureWarnThreshold) {
  Write-Warning "Warning failure-class trend: $windowNonNoneFailureCount run(s) with non-none failureCode in last $WindowSize."
}
