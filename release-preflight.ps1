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
    [scriptblock]$Script
  )

  $stepStarted = Get-Date
  $output = ""
  $status = "passed"

  try {
    $output = & $Script 2>&1 | Out-String
  } catch {
    $status = "failed"
    $output = ($_ | Out-String)
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
    Invoke-ReleaseStep -Name "smoke-suite" -Script { npm.cmd run smoke }
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
