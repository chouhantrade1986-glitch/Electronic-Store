[CmdletBinding()]
param(
  [string]$Repo = "chouhantrade1986-glitch/Electronic-Store",
  [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-GitHubHeaders {
  $token = [string]$env:GITHUB_PAT
  if ([string]::IsNullOrWhiteSpace($token)) {
    $token = [string]$env:GH_TOKEN
  }
  if ([string]::IsNullOrWhiteSpace($token)) {
    $token = [string]$env:GITHUB_TOKEN
  }
  if ([string]::IsNullOrWhiteSpace($token)) {
    throw "GitHub token missing. Set one of: GITHUB_PAT, GH_TOKEN, or GITHUB_TOKEN."
  }

  return @{
    Authorization = "Bearer $token"
    Accept = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
    "User-Agent" = "electromart-issue-seeder"
  }
}

function Get-StatusCode {
  param([Parameter(Mandatory = $true)]$ErrorRecord)
  try {
    return [int]$ErrorRecord.Exception.Response.StatusCode.value__
  } catch {
    return -1
  }
}

function Invoke-GitHubApi {
  param(
    [Parameter(Mandatory = $true)][string]$Method,
    [Parameter(Mandatory = $true)][string]$Url,
    [hashtable]$Headers,
    $Body = $null
  )

  if ($null -eq $Body) {
    return Invoke-RestMethod -Method $Method -Uri $Url -Headers $Headers
  }

  return Invoke-RestMethod -Method $Method -Uri $Url -Headers $Headers -ContentType "application/json" -Body ($Body | ConvertTo-Json -Depth 12)
}

function Ensure-Label {
  param(
    [Parameter(Mandatory = $true)][string]$RepoName,
    [Parameter(Mandatory = $true)][hashtable]$Headers,
    [Parameter(Mandatory = $true)][hashtable]$Label
  )

  $labelName = [string]$Label.name
  $encoded = [System.Uri]::EscapeDataString($labelName)
  $labelUrl = "https://api.github.com/repos/$RepoName/labels/$encoded"

  try {
    $null = Invoke-GitHubApi -Method "GET" -Url $labelUrl -Headers $Headers
    return "exists"
  } catch {
    if ((Get-StatusCode -ErrorRecord $_) -ne 404) {
      throw
    }
  }

  if ($DryRun) {
    return "would-create"
  }

  $createUrl = "https://api.github.com/repos/$RepoName/labels"
  $null = Invoke-GitHubApi -Method "POST" -Url $createUrl -Headers $Headers -Body $Label
  return "created"
}

function Build-IssueBody {
  param(
    [Parameter(Mandatory = $true)]$Issue
  )

  $lines = @()
  $lines += "Source: [PRODUCTION-HARDENING-BACKLOG.md](./PRODUCTION-HARDENING-BACKLOG.md)"
  $lines += ""
  $lines += "## Why"
  foreach ($item in @($Issue.why)) {
    $lines += "- $item"
  }
  $lines += ""
  $lines += "## Scope"
  foreach ($item in @($Issue.scope)) {
    $lines += "- [ ] $item"
  }
  $lines += ""
  $lines += "## Acceptance Criteria"
  foreach ($item in @($Issue.acceptance)) {
    $lines += "- [ ] $item"
  }
  $lines += ""
  $lines += "## Tracking"
  $lines += "- [ ] Implementation complete"
  $lines += "- [ ] Verification evidence attached"
  $lines += "- [ ] Documentation updated"

  return ($lines -join "`n")
}

$headers = Get-GitHubHeaders

$labels = @(
  @{ name = "backlog:production-hardening"; color = "0e8a16"; description = "Production hardening backlog items" },
  @{ name = "type:ops"; color = "1d76db"; description = "Operations and reliability work" },
  @{ name = "type:security"; color = "b60205"; description = "Security hardening work" },
  @{ name = "area:backend"; color = "0052cc"; description = "Backend service scope" },
  @{ name = "area:monitoring"; color = "006b75"; description = "Monitoring and alerting scope" },
  @{ name = "area:data"; color = "5319e7"; description = "Data and persistence scope" },
  @{ name = "area:reliability"; color = "fbca04"; description = "Reliability and recovery scope" },
  @{ name = "area:auth"; color = "d73a4a"; description = "Auth and provisioning scope" },
  @{ name = "area:config"; color = "a2eeef"; description = "Configuration and env scope" },
  @{ name = "area:release"; color = "bfdadc"; description = "Release and deployment scope" },
  @{ name = "priority:high"; color = "d93f0b"; description = "High priority item" },
  @{ name = "priority:medium"; color = "fbca04"; description = "Medium priority item" },
  @{ name = "PH-01"; color = "0e8a16"; description = "Production hardening issue PH-01" },
  @{ name = "PH-02"; color = "0e8a16"; description = "Production hardening issue PH-02" },
  @{ name = "PH-03"; color = "0e8a16"; description = "Production hardening issue PH-03" },
  @{ name = "PH-04"; color = "0e8a16"; description = "Production hardening issue PH-04" },
  @{ name = "PH-05"; color = "0e8a16"; description = "Production hardening issue PH-05" },
  @{ name = "PH-06"; color = "0e8a16"; description = "Production hardening issue PH-06" },
  @{ name = "PH-07"; color = "0e8a16"; description = "Production hardening issue PH-07" }
)

$issues = @(
  @{
    key = "PH-01"
    title = "prod-hardening: monitoring baseline for backend runtime"
    labels = @("backlog:production-hardening", "PH-01", "type:ops", "area:backend", "priority:high")
    why = @("Current logs and health checks are enough for local QA but not enough for production diagnostics.")
    scope = @(
      "Add `/api/health` extended checks for datastore and critical dependencies.",
      "Add `/api/metrics` endpoint (basic process/runtime counters and request rates).",
      "Ensure all backend logs are structured JSON and include `requestId`."
    )
    acceptance = @(
      "Health endpoint returns dependency status details.",
      "Metrics endpoint is available and documented.",
      "At least 3 critical flows emit correlated logs with request IDs.",
      "Smoke suite continues to pass."
    )
  },
  @{
    key = "PH-02"
    title = "prod-hardening: uptime and error alert rules"
    labels = @("backlog:production-hardening", "PH-02", "type:ops", "area:monitoring", "priority:high")
    why = @("Monitoring without actionable alerts does not reduce production risk.")
    scope = @(
      "Define error-rate, latency, and uptime thresholds.",
      "Configure alert destinations (email/webhook/on-call channel).",
      "Add alert runbook links in alert descriptions."
    )
    acceptance = @(
      "Alerts fire in a controlled test.",
      "Alert payload contains service name, threshold, and runbook link.",
      "False-positive baseline reviewed and documented."
    )
  },
  @{
    key = "PH-03"
    title = "prod-hardening: automated backup pipeline with retention"
    labels = @("backlog:production-hardening", "PH-03", "type:ops", "area:data", "priority:high")
    why = @("Manual backups are unreliable and untestable under incident pressure.")
    scope = @(
      "Add scheduled backup job for active datastore (`sqlite` and compatibility snapshots if used).",
      "Add backup naming convention, retention, and integrity checksum.",
      "Store backup metadata (timestamp, size, checksum, source version)."
    )
    acceptance = @(
      "Scheduled backup executes successfully in test environment.",
      "Retention policy automatically prunes old backups.",
      "Backup metadata is queryable/logged."
    )
  },
  @{
    key = "PH-04"
    title = "prod-hardening: automated restore drill and recovery evidence"
    labels = @("backlog:production-hardening", "PH-04", "type:ops", "area:reliability", "priority:high")
    why = @("A backup is only useful if restore is tested and repeatable.")
    scope = @(
      "Add scripted restore flow to a clean environment.",
      "Add verification checks after restore (health + key data sanity).",
      "Capture restore duration and success/failure logs."
    )
    acceptance = @(
      "Restore drill runs end-to-end using latest backup artifact.",
      "Post-restore smoke checks pass.",
      "Recovery time is recorded and published."
    )
  },
  @{
    key = "PH-05"
    title = "prod-hardening: admin provisioning and seeded-demo guardrails"
    labels = @("backlog:production-hardening", "PH-05", "type:security", "area:auth", "priority:high")
    why = @("Production admin access must be tightly controlled and auditable.")
    scope = @(
      "Disable seeded demo users in production mode.",
      "Enforce bootstrap/admin-create flow with strong password and audit trail.",
      "Add startup warning or hard-fail if unsafe admin/demo config is detected."
    )
    acceptance = @(
      "Production profile rejects seeded demo login paths.",
      "Admin creation is auditable via admin audit trail.",
      "Unsafe config combinations fail fast on startup."
    )
  },
  @{
    key = "PH-06"
    title = "prod-hardening: env and secret validation policy"
    labels = @("backlog:production-hardening", "PH-06", "type:security", "area:config", "priority:high")
    why = @("Misconfigured secrets are one of the highest production risks.")
    scope = @(
      "Validate required secrets for selected runtime mode at boot.",
      "Block known-unsafe defaults/placeholders.",
      "Add env policy matrix in docs (`local`, `staging`, `production`)."
    )
    acceptance = @(
      "Startup fails with clear message when required secrets are missing.",
      "Placeholder values are explicitly rejected.",
      "Docs include mode-based required env matrix."
    )
  },
  @{
    key = "PH-07"
    title = "prod-hardening: release gates and rollback runbook"
    labels = @("backlog:production-hardening", "PH-07", "type:ops", "area:release", "priority:medium")
    why = @("Fast rollback and predictable release checks reduce outage blast radius.")
    scope = @(
      "Enforce pre-deploy smoke gate and post-deploy health verification.",
      "Define rollback trigger policy and rollback steps.",
      "Add release checklist file used by deploy owners."
    )
    acceptance = @(
      "Deployment checklist is documented and versioned.",
      "Rollback can be executed using documented steps without ad-hoc decisions.",
      "One controlled dry run is completed and recorded."
    )
  }
)

$labelResults = @()
foreach ($label in $labels) {
  $state = Ensure-Label -RepoName $Repo -Headers $headers -Label $label
  $labelResults += [pscustomobject]@{
    Label = [string]$label.name
    Status = [string]$state
  }
}

$listUrl = "https://api.github.com/repos/$Repo/issues?state=open&per_page=100"
$existingOpen = @(
  Invoke-GitHubApi -Method "GET" -Url $listUrl -Headers $headers |
    Where-Object { -not $_.pull_request }
)
$existingByTitle = @{}
foreach ($issue in $existingOpen) {
  $existingByTitle[[string]$issue.title] = $issue
}

$issueResults = @()
foreach ($issueDef in $issues) {
  $title = [string]$issueDef.title
  if ($existingByTitle.ContainsKey($title)) {
    $existing = $existingByTitle[$title]
    $issueResults += [pscustomobject]@{
      Key = [string]$issueDef.key
      Status = "exists"
      Number = [int]$existing.number
      Url = [string]$existing.html_url
    }
    continue
  }

  if ($DryRun) {
    $issueResults += [pscustomobject]@{
      Key = [string]$issueDef.key
      Status = "would-create"
      Number = 0
      Url = ""
    }
    continue
  }

  $payload = @{
    title = $title
    body = Build-IssueBody -Issue $issueDef
    labels = @($issueDef.labels)
  }
  $createUrl = "https://api.github.com/repos/$Repo/issues"
  $created = Invoke-GitHubApi -Method "POST" -Url $createUrl -Headers $headers -Body $payload
  $issueResults += [pscustomobject]@{
    Key = [string]$issueDef.key
    Status = "created"
    Number = [int]$created.number
    Url = [string]$created.html_url
  }
}

Write-Host "Repo: $Repo"
Write-Host ""
Write-Host "Label setup:"
$labelResults | Format-Table -AutoSize | Out-String | Write-Host
Write-Host ""
Write-Host "Issue results:"
$issueResults | Sort-Object Key | Format-Table -AutoSize | Out-String | Write-Host
