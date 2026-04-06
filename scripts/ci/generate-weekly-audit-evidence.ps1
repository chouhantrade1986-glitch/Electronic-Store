[CmdletBinding()]
param(
  [string]$Repository = "chouhantrade1986-glitch/Electronic-Store",
  [string[]]$Workflows = @(
    "smoke-suite.yml",
    "release-guardrails.yml",
    "workflow-action-governance.yml",
    "a2z-weekly-audit-intake.yml"
  ),
  [string]$OutputPath = ""
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptDir "../..")).Path

function Resolve-OutputPath {
  param(
    [AllowEmptyString()]
    [string]$Path
  )

  if ([string]::IsNullOrWhiteSpace($Path)) {
    return ""
  }

  if ([System.IO.Path]::IsPathRooted($Path)) {
    return $Path
  }

  return Join-Path $repoRoot $Path
}

function Get-LatestWorkflowRun {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Repo,
    [Parameter(Mandatory = $true)]
    [string]$Workflow
  )

  $headers = @{
    "User-Agent" = "ElectroMart-Weekly-Audit-Evidence"
    "Accept" = "application/vnd.github+json"
  }

  $uri = "https://api.github.com/repos/$Repo/actions/workflows/$Workflow/runs?per_page=1"
  $response = Invoke-RestMethod -Uri $uri -Headers $headers
  $run = @($response.workflow_runs)[0]
  if ($null -eq $run) {
    throw "No workflow runs found for '$Workflow'."
  }

  return [pscustomobject]@{
    workflow = $Workflow
    run_number = [int]$run.run_number
    status = [string]$run.status
    conclusion = [string]$run.conclusion
    created_at = [string]$run.created_at
    html_url = [string]$run.html_url
  }
}

$rows = @()
foreach ($workflow in $Workflows) {
  $rows += Get-LatestWorkflowRun -Repo $Repository -Workflow $workflow
}

$generatedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$lines = @(
  "## Weekly CI Evidence Snapshot ($generatedAt)",
  "",
  "| Workflow | Run | Status | Created (UTC) |",
  "| --- | --- | --- | --- |"
)

foreach ($row in $rows) {
  $statusLabel = if ([string]::IsNullOrWhiteSpace($row.conclusion)) {
    $row.status
  } else {
    "$($row.status) / $($row.conclusion)"
  }

  $lines += "| ``$($row.workflow)`` | [run $($row.run_number)]($($row.html_url)) | $statusLabel | $($row.created_at) |"
}

$snippet = $lines -join [Environment]::NewLine

$resolvedOutputPath = Resolve-OutputPath -Path $OutputPath
if (-not [string]::IsNullOrWhiteSpace($resolvedOutputPath)) {
  $outputDirectory = Split-Path -Parent $resolvedOutputPath
  if (-not [string]::IsNullOrWhiteSpace($outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
  }
  Set-Content -Path $resolvedOutputPath -Value ($snippet + [Environment]::NewLine) -Encoding utf8
  Write-Host "Weekly audit evidence snippet written to: $resolvedOutputPath"
}

Write-Output $snippet
