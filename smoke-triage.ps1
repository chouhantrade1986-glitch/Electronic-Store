param(
  [string]$ReportsDir = "qa-reports"
)

$ErrorActionPreference = "Continue"

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

Write-Host "Running smoke suite..."
node qa-full-smoke.js --reports-dir=$ReportsDir
$smokeExitCode = $LASTEXITCODE

Write-Host "Updating smoke trend artifacts..."
powershell -ExecutionPolicy Bypass -File .\smoke-trend.ps1 -ReportsDir $ReportsDir
$trendExitCode = $LASTEXITCODE

$reportPath = Join-Path $ReportsDir "smoke-report.json"
$windowPath = Join-Path $ReportsDir "smoke-trend-window.json"
$triageStatusPath = Join-Path $ReportsDir "smoke-triage-status.json"
$trendSummaryPath = Join-Path $ReportsDir "smoke-trend-summary.md"
$schemaReportPath = Join-Path $ReportsDir "smoke-artifact-validation.json"
$diagnosticsPath = Join-Path $ReportsDir "smoke-failure-diagnostics.json"
$schemaValidationExitCode = -1
$schemaCheckedArtifacts = -1
$schemaErrorCount = -1
$schemaPassed = $false
$diagnosticsPresent = $false
$diagnosticsSummary = "none"
$diagnosticsApiExit = $null
$diagnosticsUiExit = $null

$uiRetries = "n/a"
$hottest = "none"
$failureSummary = "none"
$failureCode = "none"
$failedSuites = @()
$dominantNonNoneFailureClass = "none"
$failureCodeSequenceText = "-"
$failureCodeSparkline = "-"
$failureCodeSequenceArray = @()
if (Test-Path $reportPath) {
  try {
    $report = Get-Content -Path $reportPath -Raw | ConvertFrom-Json
    if ($report.summary -and $null -ne $report.summary.uiRetries) {
      $uiRetries = [string]([int]$report.summary.uiRetries)
    }

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
      $fatalCompact = [regex]::Replace($fatalError, "\r?\n+", " | ")
      if ($fatalCompact.Length -gt 220) {
        $fatalCompact = $fatalCompact.Substring(0, 220) + "..."
      }
      $failureSummary = "fatal=" + $fatalCompact
      $apiCode = $null
      $uiCode = $null
      if ($report.commands -and $report.commands.api) {
        $apiCode = $report.commands.api.code
      }
      if ($report.commands -and $report.commands.ui) {
        $uiCode = $report.commands.ui.code
      }

      if ($null -ne $apiCode -and [int]$apiCode -ne 0) {
        $failureCode = "smoke-fatal-api"
      } elseif ($null -ne $uiCode -and [int]$uiCode -ne 0) {
        $failureCode = "smoke-fatal-ui"
      } else {
        $failureCode = "smoke-fatal"
      }
    } elseif ($failedCases.Count -gt 0) {
      $failureSummary = "failed=" + [string]::Join(',', $failedCases)
      if ($failedSuites.Count -eq 1 -and $failedSuites[0] -eq "api") {
        $failureCode = "smoke-assertion-api"
      } elseif ($failedSuites.Count -eq 1 -and $failedSuites[0] -eq "ui") {
        $failureCode = "smoke-assertion-ui"
      } elseif ($failedSuites.Count -gt 1) {
        $failureCode = "smoke-assertion-mixed"
      } else {
        $failureCode = "smoke-assertion"
      }
    } elseif ($smokeExitCode -ne 0) {
      $failureCode = "smoke-unknown"
    }
  } catch {
    $uiRetries = "parse-error"
    $failureSummary = "parse-error"
    $failureCode = "report-parse-error"
  }
} elseif ($smokeExitCode -ne 0) {
  $failureSummary = "report-missing"
  $failureCode = "report-missing"
}

if (Test-Path $windowPath) {
  try {
    $window = Get-Content -Path $windowPath -Raw | ConvertFrom-Json
    if ($window -and -not [string]::IsNullOrWhiteSpace([string]$window.hottestFlakyStep)) {
      $hottest = [string]$window.hottestFlakyStep
    }
    if ($window -and -not [string]::IsNullOrWhiteSpace([string]$window.dominantNonNoneFailureClass)) {
      $dominantNonNoneFailureClass = [string]$window.dominantNonNoneFailureClass
    }
    if ($window -and $null -ne $window.failureCodeSequence) {
      $sequence = @($window.failureCodeSequence | ForEach-Object { [string]$_ })
      if ($sequence.Count -gt 0) {
        $failureCodeSequenceArray = @($sequence)
        $failureCodeSequenceText = [string]::Join(', ', $sequence)
      }
    }
    if ($window -and -not [string]::IsNullOrWhiteSpace([string]$window.failureCodeSparkline)) {
      $failureCodeSparkline = [string]$window.failureCodeSparkline
    }
  } catch {
    $hottest = "parse-error"
    $dominantNonNoneFailureClass = "parse-error"
    $failureCodeSequenceText = "parse-error"
    $failureCodeSparkline = "parse-error"
    $failureCodeSequenceArray = @("parse-error")
  }
}

if ($trendExitCode -ne 0 -and $failureCode -eq "none") {
  $failureCode = "trend-fail"
}

if (Test-Path $diagnosticsPath) {
  try {
    $diagnostics = Get-Content -Path $diagnosticsPath -Raw | ConvertFrom-Json
    $diagnosticsPresent = $true
    if ($diagnostics.commands -and $diagnostics.commands.api -and $null -ne $diagnostics.commands.api.code) {
      $diagnosticsApiExit = [int]$diagnostics.commands.api.code
    }
    if ($diagnostics.commands -and $diagnostics.commands.ui -and $null -ne $diagnostics.commands.ui.code) {
      $diagnosticsUiExit = [int]$diagnostics.commands.ui.code
    }

    $fatal = [string]$diagnostics.fatalError
    if (-not [string]::IsNullOrWhiteSpace($fatal)) {
      $compact = [regex]::Replace($fatal, "\r?\n+", " | ")
      if ($compact.Length -gt 200) {
        $compact = $compact.Substring(0, 200) + "..."
      }
      $diagnosticsSummary = $compact
    } elseif ($null -ne $diagnostics.exitCode) {
      $diagnosticsSummary = "exit=" + [string]$diagnostics.exitCode
    } else {
      $diagnosticsSummary = "present"
    }
  } catch {
    $diagnosticsPresent = $true
    $diagnosticsSummary = "parse-error"
  }
}

Write-Host ("LOCAL-SMOKE-STATUS exit={0}, uiRetries={1}, hottest={2}" -f $smokeExitCode, $uiRetries, $hottest)
Write-Host ("LOCAL-SMOKE-FAILURE-SUMMARY {0}" -f $failureSummary)
Write-Host ("LOCAL-SMOKE-FAILURE-CODE {0}" -f $failureCode)
Write-Host ("LOCAL-SMOKE-FAILURE-DOMINANT {0}" -f $dominantNonNoneFailureClass)
Write-Host ("LOCAL-SMOKE-FAILURE-SEQUENCE {0}" -f $failureCodeSequenceText)
Write-Host ("LOCAL-SMOKE-FAILURE-SPARKLINE {0}" -f $failureCodeSparkline)
Write-Host ("LOCAL-SMOKE-DIAGNOSTICS present={0}, apiExit={1}, uiExit={2}, summary={3}" -f $diagnosticsPresent, $diagnosticsApiExit, $diagnosticsUiExit, $diagnosticsSummary)

powershell -ExecutionPolicy Bypass -File .\smoke-validate-artifacts.ps1 -ReportsDir $ReportsDir
$schemaValidationExitCode = $LASTEXITCODE
Write-Host ("LOCAL-SMOKE-SCHEMA-VALIDATION exit={0}" -f $schemaValidationExitCode)

if (Test-Path $schemaReportPath) {
  try {
    $schemaReport = Get-Content -Path $schemaReportPath -Raw | ConvertFrom-Json
    if ($null -ne $schemaReport.checkedArtifacts) {
      $schemaCheckedArtifacts = [int]$schemaReport.checkedArtifacts
    }
    if ($null -ne $schemaReport.errorCount) {
      $schemaErrorCount = [int]$schemaReport.errorCount
    }
    if ($null -ne $schemaReport.passed) {
      $schemaPassed = [bool]$schemaReport.passed
    }
  } catch {
    $schemaCheckedArtifacts = -1
    $schemaErrorCount = -1
    $schemaPassed = $false
  }
}
Write-Host ("LOCAL-SMOKE-SCHEMA-REPORT checkedArtifacts={0}, errorCount={1}, passed={2}" -f $schemaCheckedArtifacts, $schemaErrorCount, $schemaPassed)

$statusPayload = [pscustomobject]@{
  schemaVersion = "smoke-triage-status.v2"
  generatedBy = "smoke-triage.ps1"
  generatedAt = (Get-Date).ToString("o")
  smokeExitCode = $smokeExitCode
  trendExitCode = $trendExitCode
  uiRetries = $uiRetries
  hottest = $hottest
  failureSummary = $failureSummary
  failureCode = $failureCode
  dominantNonNoneFailureClass = $dominantNonNoneFailureClass
  failureCodeSequence = $failureCodeSequenceText
  failureCodeSequenceArray = @($failureCodeSequenceArray)
  failureCodeSparkline = $failureCodeSparkline
  diagnosticsPresent = $diagnosticsPresent
  diagnosticsSummary = $diagnosticsSummary
  diagnosticsApiExitCode = $diagnosticsApiExit
  diagnosticsUiExitCode = $diagnosticsUiExit
  schemaValidationExitCode = $schemaValidationExitCode
  schemaCheckedArtifacts = $schemaCheckedArtifacts
  schemaErrorCount = $schemaErrorCount
  schemaPassed = $schemaPassed
  failedSuites = @($failedSuites)
  reportsDir = $ReportsDir
}
Set-ContentWithRetry -Path $triageStatusPath -Value ($statusPayload | ConvertTo-Json -Depth 5) -Encoding utf8

if (Test-Path $trendSummaryPath) {
  try {
    $summaryMd = Get-Content -Path $trendSummaryPath -Raw
    $triageLines = @(
      "## Latest Local Triage",
      "",
      "- Timestamp: $($statusPayload.generatedAt)",
      "- SmokeExit: $([string]$statusPayload.smokeExitCode)",
      "- TrendExit: $([string]$statusPayload.trendExitCode)",
      "- UiRetries: $([string]$statusPayload.uiRetries)",
      "- Hottest: $([string]$statusPayload.hottest)",
      "- FailureCode: $([string]$statusPayload.failureCode)",
      "- DominantNonNoneFailureClass: $([string]$statusPayload.dominantNonNoneFailureClass)",
      "- FailureCodeSequence: $([string]$statusPayload.failureCodeSequence)",
      "- FailureCodeSparkline: $([string]$statusPayload.failureCodeSparkline)",
      "- DiagnosticsPresent: $([string]$statusPayload.diagnosticsPresent)",
      "- DiagnosticsSummary: $([string]$statusPayload.diagnosticsSummary)",
      "- DiagnosticsApiExitCode: $([string]$statusPayload.diagnosticsApiExitCode)",
      "- DiagnosticsUiExitCode: $([string]$statusPayload.diagnosticsUiExitCode)",
      "- SchemaValidationExitCode: $([string]$statusPayload.schemaValidationExitCode)",
      "- SchemaCheckedArtifacts: $([string]$statusPayload.schemaCheckedArtifacts)",
      "- SchemaErrorCount: $([string]$statusPayload.schemaErrorCount)",
      "- SchemaPassed: $([string]$statusPayload.schemaPassed)",
      "- FailureSummary: $([string]$statusPayload.failureSummary)",
      ""
    )
    $triageBlock = ($triageLines -join [Environment]::NewLine)

    if ($summaryMd -match "(?ms)^## Latest Local Triage\r?\n.*?(?=\r?\n## |\z)") {
      $summaryMd = [regex]::Replace(
        $summaryMd,
        "(?ms)^## Latest Local Triage\r?\n.*?(?=\r?\n## |\z)",
        $triageBlock
      )
    } else {
      $trimmed = $summaryMd.TrimEnd()
      $summaryMd = $trimmed + [Environment]::NewLine + [Environment]::NewLine + $triageBlock
    }

    Set-ContentWithRetry -Path $trendSummaryPath -Value $summaryMd -Encoding utf8
  } catch {
    Write-Warning "Unable to update latest local triage section in $trendSummaryPath"
  }
}

if ($trendExitCode -ne 0) {
  Write-Warning "Trend update failed with exit code $trendExitCode"
}

if ($schemaValidationExitCode -ne 0) {
  Write-Warning "Artifact schema validation failed with exit code $schemaValidationExitCode"
}

if ($smokeExitCode -ne 0) {
  Write-Host "Smoke failed with exit code $smokeExitCode"
  exit $smokeExitCode
}

if ($schemaValidationExitCode -ne 0) {
  Write-Host "Smoke succeeded but artifact schema validation failed."
  exit $schemaValidationExitCode
}

Write-Host "Smoke and trend update completed successfully."
exit 0
