param(
  [string]$Repo = "chouhantrade1986-glitch/Electronic-Store",
  [string]$Branch = "main",
  [string[]]$RequiredChecks = @("smoke"),
  [switch]$CheckOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-GitHubHeaders {
  $token = $env:GITHUB_PAT
  if (-not $token) { $token = $env:GH_TOKEN }
  if (-not $token) { $token = $env:GITHUB_TOKEN }
  if (-not $token) {
    throw "GitHub token missing. Set one of: GITHUB_PAT, GH_TOKEN, or GITHUB_TOKEN."
  }

  return @{
    Authorization = "Bearer $token"
    Accept = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
    "User-Agent" = "electromart-branch-protection-script"
  }
}

function Get-BranchState {
  param(
    [string]$RepoName,
    [string]$BranchName,
    [hashtable]$Headers
  )

  $branchUrl = "https://api.github.com/repos/$RepoName/branches/$BranchName"
  $rulesUrl = "https://api.github.com/repos/$RepoName/rules/branches/$BranchName"
  $branch = Invoke-RestMethod -Method Get -Uri $branchUrl -Headers $Headers
  $rules = Invoke-RestMethod -Method Get -Uri $rulesUrl -Headers $Headers

  $contexts = @()
  foreach ($rule in @($rules)) {
    if ($rule.type -eq "required_status_checks") {
      foreach ($entry in @($rule.parameters.required_status_checks)) {
        if ($entry.context) {
          $contexts += $entry.context
        }
      }
    }
  }

  return [pscustomobject]@{
    Protected = [bool]$branch.protected
    RuleCount = @($rules).Count
    Contexts = @($contexts | Sort-Object -Unique)
  }
}

function Ensure-RequiredChecksPresent {
  param(
    [string[]]$Current,
    [string[]]$Expected
  )

  $missing = @()
  foreach ($item in @($Expected)) {
    if (-not ($Current -contains $item)) {
      $missing += $item
    }
  }
  return $missing
}

$headers = Get-GitHubHeaders

if (-not $CheckOnly) {
  $body = @{
    required_status_checks = @{
      strict = $true
      contexts = @($RequiredChecks)
    }
    enforce_admins = $true
    required_pull_request_reviews = $null
    restrictions = $null
  } | ConvertTo-Json -Depth 10

  $protectUrl = "https://api.github.com/repos/$Repo/branches/$Branch/protection"
  Invoke-RestMethod -Method Put -Uri $protectUrl -Headers $headers -ContentType "application/json" -Body $body | Out-Null
}

$state = Get-BranchState -RepoName $Repo -BranchName $Branch -Headers $headers
$missingChecks = Ensure-RequiredChecksPresent -Current $state.Contexts -Expected $RequiredChecks

Write-Host ("Repo: {0}" -f $Repo)
Write-Host ("Branch: {0}" -f $Branch)
Write-Host ("Protected: {0}" -f $state.Protected)
Write-Host ("Rule count: {0}" -f $state.RuleCount)
Write-Host ("Required checks found: {0}" -f (($state.Contexts -join ", ")))

if (-not $state.Protected -or $missingChecks.Count -gt 0) {
  if ($missingChecks.Count -gt 0) {
    Write-Host ("Missing checks: {0}" -f ($missingChecks -join ", "))
  }
  throw "Branch protection verification failed."
}

Write-Host "Branch protection verification passed."
