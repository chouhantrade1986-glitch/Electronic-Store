[CmdletBinding()]
param(
  [string]$OutputPath = "qa-reports/release/release-preflight-summary.json",
  [switch]$SkipSmoke,
  [switch]$SkipVisualBaseline
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

$resolvedOutputPath = Join-Path $repoRoot $OutputPath
$outputDir = Split-Path -Parent $resolvedOutputPath
if (-not (Test-Path $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$steps = New-Object System.Collections.Generic.List[object]
$startedAt = (Get-Date).ToUniversalTime().ToString("o")
$currentCommit = (git rev-parse HEAD).Trim()

function Invoke-ReleaseStep {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [scriptblock]$Script,
    [int]$MaxAttempts = 1,
    [string[]]$RetryOnErrorPatterns = @()
  )

  $stepStarted = Get-Date
  $output = ""
  $status = "passed"
  $attempt = 0
  $attemptOutputs = New-Object System.Collections.Generic.List[string]

  try {
    while ($attempt -lt $MaxAttempts) {
      $attempt += 1

      try {
        $attemptOutput = (& $Script 2>&1 | Out-String).Trim()
        if ($attempt -gt 1) {
          $output = ($attemptOutputs + @("Attempt $attempt succeeded:", $attemptOutput)) -join "`n"
        } else {
          $output = $attemptOutput
        }
        break
      }
      catch {
        $attemptError = ($_ | Out-String).Trim()
        $attemptOutputs.Add((@("Attempt $attempt failed:", $attemptError) -join "`n")) | Out-Null

        $canRetry = ($attempt -lt $MaxAttempts)
        if ($canRetry -and $RetryOnErrorPatterns.Count -gt 0) {
          $canRetry = $false
          foreach ($pattern in $RetryOnErrorPatterns) {
            if ($attemptError -match $pattern) {
              $canRetry = $true
              break
            }
          }
        }

        if (-not $canRetry) {
          throw
        }

        Write-Host "Retrying step '$Name' (attempt $($attempt + 1) of $MaxAttempts) due to transient failure."
      }
    }
  } catch {
    $status = "failed"
    $output = ($attemptOutputs -join "`n`n").Trim()
    if ([string]::IsNullOrWhiteSpace($output)) {
      $output = ($_ | Out-String).Trim()
    }
    throw
  } finally {
    $steps.Add([PSCustomObject]@{
      name = $Name
      status = $status
      durationMs = [int][Math]::Max(0, ((Get-Date) - $stepStarted).TotalMilliseconds)
      output = $output.Trim()
    }) | Out-Null
  }
}

try {
  if (-not $SkipSmoke) {
    Invoke-ReleaseStep -Name "smoke-suite" -MaxAttempts 2 -RetryOnErrorPatterns @(
      "page.waitForFunction: Timeout \\d+ms exceeded",
      "Error: Internal server error",
      "TypeError: fetch failed",
      "Unable to connect to the remote server",
      "ECONNRESET",
      "ETIMEDOUT",
      "forcibly closed by the remote host",
      "expected to be kept alive was closed by the server"
    ) -Script { npm.cmd run smoke }
  }

  if (-not $SkipVisualBaseline) {
    Invoke-ReleaseStep -Name "visual-baseline-verify" -Script { npm.cmd run smoke:baseline:verify }
  }

  $summary = [PSCustomObject]@{
    passed = $true
    startedAt = $startedAt
    finishedAt = (Get-Date).ToUniversalTime().ToString("o")
    gitCommit = $currentCommit
    steps = $steps
  }
  $summary | ConvertTo-Json -Depth 6 | Set-Content -Path $resolvedOutputPath -Encoding utf8
  Write-Host "Release preflight passed."
  Write-Host "Summary written to $resolvedOutputPath"
} catch {
  $summary = [PSCustomObject]@{
    passed = $false
    startedAt = $startedAt
    finishedAt = (Get-Date).ToUniversalTime().ToString("o")
    gitCommit = $currentCommit
    steps = $steps
    error = $_.Exception.Message
  }
  $summary | ConvertTo-Json -Depth 6 | Set-Content -Path $resolvedOutputPath -Encoding utf8
  throw
}
