[CmdletBinding()]
param(
  [string]$TargetCommit = "",
  [string]$Reason = "Controlled rollback dry run",
  [string]$ApiBaseUrl = "http://127.0.0.1:4000/api",
  [string]$OutputDir = "release-evidence"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

function Resolve-Commit {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Ref
  )

  return (git rev-parse --verify "$Ref`^{commit}").Trim()
}

$currentCommit = Resolve-Commit -Ref "HEAD"
$resolvedTargetCommit = if ([string]::IsNullOrWhiteSpace($TargetCommit)) {
  Resolve-Commit -Ref "HEAD~1"
} else {
  Resolve-Commit -Ref $TargetCommit
}

$timestamp = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")
$resolvedOutputDir = Join-Path $repoRoot $OutputDir
if (-not (Test-Path $resolvedOutputDir)) {
  New-Item -ItemType Directory -Path $resolvedOutputDir -Force | Out-Null
}
$outputPath = Join-Path $resolvedOutputDir ("rollback-dry-run-" + $timestamp + ".json")

$recentCommits = git log --oneline -5
$report = [PSCustomObject]@{
  kind = "release-rollback-dry-run"
  generatedAt = (Get-Date).ToUniversalTime().ToString("o")
  currentCommit = $currentCommit
  targetCommit = $resolvedTargetCommit
  reason = $Reason
  apiBaseUrl = $ApiBaseUrl.TrimEnd("/")
  recentCommits = @($recentCommits)
  rollbackSteps = @(
    "Verify incident trigger and confirm rollback decision against release checklist.",
    "Redeploy commit $resolvedTargetCommit using the deployment platform's last-known-good promotion flow.",
    "Run backend release verification: cd backend && npm.cmd run job:release:verify -- --api-base-url=$($ApiBaseUrl.TrimEnd('/')).",
    "If verification passes, announce rollback completion and link this dry-run evidence in the incident timeline."
  )
}

$report | ConvertTo-Json -Depth 6 | Set-Content -Path $outputPath -Encoding utf8
Write-Host "Rollback dry run evidence written to $outputPath"
