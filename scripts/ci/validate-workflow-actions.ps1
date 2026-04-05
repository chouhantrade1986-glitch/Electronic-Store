[CmdletBinding()]
param(
  [string]$WorkflowsDir = ".github/workflows"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptDir "../..")).Path
$workflowRoot = Join-Path $repoRoot $WorkflowsDir

if (-not (Test-Path -Path $workflowRoot)) {
  throw "Workflows directory not found: $workflowRoot"
}

$minimumMajorByAction = @{
  "actions/checkout"        = 6
  "actions/setup-node"      = 6
  "actions/upload-artifact" = 7
  "actions/cache/restore"   = 5
  "actions/cache/save"      = 5
  "actions/github-script"   = 8
}

$workflowFiles = Get-ChildItem -Path $workflowRoot -File -Recurse |
  Where-Object { $_.Extension -in @('.yml', '.yaml') } |
  Sort-Object -Property FullName

function Get-RelativePathCompat {
  param(
    [Parameter(Mandatory = $true)]
    [string]$BasePath,
    [Parameter(Mandatory = $true)]
    [string]$TargetPath
  )

  $method = [System.IO.Path].GetMethod('GetRelativePath', [Type[]]@([string], [string]))
  if ($null -ne $method) {
    return [System.IO.Path]::GetRelativePath($BasePath, $TargetPath)
  }

  $normalizedBase = (Resolve-Path $BasePath).Path.TrimEnd('\\') + '\\'
  $normalizedTarget = (Resolve-Path $TargetPath).Path

  $baseUri = New-Object System.Uri($normalizedBase)
  $targetUri = New-Object System.Uri($normalizedTarget)
  $relativeUri = $baseUri.MakeRelativeUri($targetUri)

  return [System.Uri]::UnescapeDataString($relativeUri.ToString()).Replace('/', '\\')
}

if ($workflowFiles.Count -eq 0) {
  Write-Host "::warning title=Workflow Action Governance::No workflow files found under $workflowRoot"
  exit 0
}

$violations = @()
$ignored = @()

foreach ($workflowFile in $workflowFiles) {
  $relativePath = (Get-RelativePathCompat -BasePath $repoRoot -TargetPath $workflowFile.FullName).Replace('\\', '/')
  $lines = Get-Content -Path $workflowFile.FullName

  for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = [string]$lines[$i]
    if ($line -notmatch '^\s*uses:\s*([^\s@]+)@([^\s#]+)') {
      continue
    }

    $actionName = [string]$matches[1]
    $actionRef = [string]$matches[2]

    if (-not $minimumMajorByAction.ContainsKey($actionName)) {
      continue
    }

    $requiredMajor = [int]$minimumMajorByAction[$actionName]

    if ($actionRef -match '^\$\{\{') {
      $ignored += [pscustomobject]@{
        file = $relativePath
        line = ($i + 1)
        action = $actionName
        ref = $actionRef
        reason = "expression-reference"
      }
      continue
    }

    if ($actionRef -match '^[0-9a-fA-F]{40}$') {
      continue
    }

    if ($actionRef -match '^v(\d+)(?:[.\-].*)?$') {
      $major = [int]$matches[1]
      if ($major -lt $requiredMajor) {
        $violations += [pscustomobject]@{
          file = $relativePath
          line = ($i + 1)
          action = $actionName
          ref = $actionRef
          required = ("v" + $requiredMajor)
          detected = ("v" + $major)
        }
      }
      continue
    }

    $violations += [pscustomobject]@{
      file = $relativePath
      line = ($i + 1)
      action = $actionName
      ref = $actionRef
      required = ("v" + $requiredMajor)
      detected = "unknown"
    }
  }
}

foreach ($entry in $ignored) {
  Write-Host ("::warning file={0},line={1},title=Workflow Action Governance::Skipped {2}@{3} ({4})" -f $entry.file, $entry.line, $entry.action, $entry.ref, $entry.reason)
}

if ($violations.Count -gt 0) {
  foreach ($violation in $violations) {
    Write-Host ("::error file={0},line={1},title=Workflow Action Governance::{2}@{3} is below required {4} (detected {5})" -f $violation.file, $violation.line, $violation.action, $violation.ref, $violation.required, $violation.detected)
  }

  Write-Host ("WORKFLOW-ACTION-GOVERNANCE failed: violations={0}, scannedWorkflows={1}" -f $violations.Count, $workflowFiles.Count)
  exit 1
}

Write-Host ("WORKFLOW-ACTION-GOVERNANCE passed: scannedWorkflows={0}" -f $workflowFiles.Count)
exit 0
