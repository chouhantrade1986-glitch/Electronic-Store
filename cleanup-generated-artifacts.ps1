[CmdletBinding()]
param(
  [switch]$Apply
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

$targets = @(
  ".edge-headless-profile",
  ".edge-invoice-profile",
  "qa-reports"
)

$patterns = @(
  "backend-*.log",
  "backend-*.err",
  "cloudflared.log",
  "lt.log",
  "qa-static.log",
  "qa-*.png",
  "qa-*.pdf",
  "qa-*-dom.html"
)

$items = New-Object System.Collections.Generic.List[System.IO.FileSystemInfo]

foreach ($target in $targets) {
  $fullPath = Join-Path $repoRoot $target
  if (Test-Path $fullPath) {
    $items.Add((Get-Item -LiteralPath $fullPath -Force))
  }
}

foreach ($pattern in $patterns) {
  Get-ChildItem -Path $repoRoot -Filter $pattern -Force -ErrorAction SilentlyContinue | ForEach-Object {
    $items.Add($_)
  }
}

$uniqueItems = $items |
  Group-Object -Property FullName |
  ForEach-Object { $_.Group[0] } |
  Sort-Object FullName

if (-not $uniqueItems -or $uniqueItems.Count -eq 0) {
  Write-Host "No generated artifacts found."
  exit 0
}

$summary = foreach ($item in $uniqueItems) {
  [PSCustomObject]@{
    FullPath = $item.FullName
    Type = if ($item.PSIsContainer) { "dir" } else { "file" }
    Path = $item.FullName.Replace($repoRoot, ".")
    Size = if ($item.PSIsContainer) { "" } else { $item.Length }
  }
}

if (-not $Apply) {
  Write-Host "Dry run only. Add -Apply to delete these generated artifacts:`n"
  $summary | Select-Object Type, Path, Size | Format-Table -AutoSize
  exit 0
}

$removed = New-Object System.Collections.Generic.List[string]
$skipped = New-Object System.Collections.Generic.List[string]

foreach ($item in $uniqueItems) {
  try {
    Remove-Item -LiteralPath $item.FullName -Recurse -Force -ErrorAction Stop
    $removed.Add($item.FullName) | Out-Null
  } catch {
    $skipped.Add($item.FullName) | Out-Null
  }
}

Write-Host "Removed generated artifacts:`n"
$summary | Where-Object { $removed -contains $_.FullPath } | Select-Object Type, Path, Size | Format-Table -AutoSize

if ($skipped.Count -gt 0) {
  Write-Host "`nSkipped in-use artifacts:`n"
  $summary | Where-Object { $skipped -contains $_.FullPath } | Select-Object Type, Path, Size | Format-Table -AutoSize
}
