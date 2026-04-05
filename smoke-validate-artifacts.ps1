param(
  [string]$ReportsDir = "qa-reports"
)

$ErrorActionPreference = "Stop"

$allowedSparklineSymbols = @('N', 'A', 'U', 'M', 'S', 'F', 'R', 'V', 'K', 'P', 'G', 'T', '?')
$validationReportPath = Join-Path $ReportsDir "smoke-artifact-validation.json"

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

$specs = @(
  [pscustomobject]@{
    Path = (Join-Path $ReportsDir "smoke-trend-latest.json")
    SchemaVersion = "smoke-trend-entry.v2"
    AllowedGeneratedBy = @("smoke-trend.ps1", "smoke-suite.yml")
  },
  [pscustomobject]@{
    Path = (Join-Path $ReportsDir "smoke-trend-window.json")
    SchemaVersion = "smoke-trend-window.v2"
    AllowedGeneratedBy = @("smoke-trend.ps1", "smoke-suite.yml")
  }
)

$optionalSpecs = @(
  [pscustomobject]@{
    Path = (Join-Path $ReportsDir "smoke-triage-status.json")
    SchemaVersion = "smoke-triage-status.v2"
    AllowedGeneratedBy = @("smoke-triage.ps1")
  },
  [pscustomobject]@{
    Path = (Join-Path $ReportsDir "smoke-triage-loop-summary.json")
    SchemaVersion = "smoke-triage-loop.v1"
    AllowedGeneratedBy = @("smoke-triage-loop.ps1")
  },
  [pscustomobject]@{
    Path = (Join-Path $ReportsDir "smoke-failure-diagnostics.json")
    SchemaVersion = "smoke-failure-diagnostics.v1"
    AllowedGeneratedBy = @("qa-full-smoke.js")
  }
)

$errors = @()
$checkedArtifacts = 0
foreach ($spec in $specs) {
  $targetPath = [string]$spec.Path
  if (-not (Test-Path $targetPath)) {
    $errors += "Missing artifact: $targetPath"
    continue
  }
  $checkedArtifacts += 1

  try {
    $json = Get-Content -Path $targetPath -Raw | ConvertFrom-Json
  } catch {
    $errors += "Invalid JSON: $targetPath"
    continue
  }

  $schemaVersion = [string]$json.schemaVersion
  if ($schemaVersion -ne [string]$spec.SchemaVersion) {
    $errors += "Unexpected schemaVersion in $targetPath. Expected '$($spec.SchemaVersion)', found '$schemaVersion'."
  }

  $generatedBy = [string]$json.generatedBy
  $allowed = @($spec.AllowedGeneratedBy | ForEach-Object { [string]$_ })
  if ([string]::IsNullOrWhiteSpace($generatedBy) -or -not ($allowed -contains $generatedBy)) {
    $errors += "Unexpected generatedBy in $targetPath. Expected one of [$([string]::Join(', ', $allowed))], found '$generatedBy'."
  }

  $fileName = [System.IO.Path]::GetFileName($targetPath)
  switch ($fileName) {
    "smoke-trend-latest.json" {
      if ([string]::IsNullOrWhiteSpace([string]$json.timestamp)) {
        $errors += "Missing required field timestamp in $targetPath."
      }
      if ([string]::IsNullOrWhiteSpace([string]$json.failureCodeSequence)) {
        $errors += "Missing required field failureCodeSequence in $targetPath."
      }
      if ($null -eq $json.failureCodeSequenceArray) {
        $errors += "Missing required field failureCodeSequenceArray in $targetPath."
      } else {
        $sequenceArray = @($json.failureCodeSequenceArray | ForEach-Object { [string]$_ })
        if ($sequenceArray.Count -ne 1) {
          $errors += "Expected failureCodeSequenceArray count=1 in $targetPath, found $($sequenceArray.Count)."
        } elseif ([string]$sequenceArray[0] -ne [string]$json.failureCodeSequence) {
          $errors += "Mismatch between failureCodeSequence and failureCodeSequenceArray[0] in $targetPath."
        }
      }

      if ([string]$json.failureCode -ne [string]$json.failureCodeSequence) {
        $errors += "Mismatch between failureCode and failureCodeSequence in $targetPath."
      }
    }
    "smoke-trend-window.json" {
      if ([string]::IsNullOrWhiteSpace([string]$json.generatedAt)) {
        $errors += "Missing required field generatedAt in $targetPath."
      }
      if ([string]::IsNullOrWhiteSpace([string]$json.failureCodeSequenceText)) {
        $errors += "Missing required field failureCodeSequenceText in $targetPath."
      }
      if ($null -eq $json.failureCodeSequence) {
        $errors += "Missing required field failureCodeSequence in $targetPath."
      } else {
        $sequenceArray = @($json.failureCodeSequence | ForEach-Object { [string]$_ })
        if ($sequenceArray.Count -eq 0) {
          $errors += "failureCodeSequence is empty in $targetPath."
        } else {
          $sequenceText = [string]::Join(', ', $sequenceArray)
          if ($sequenceText -ne [string]$json.failureCodeSequenceText) {
            $errors += "Mismatch between failureCodeSequence and failureCodeSequenceText in $targetPath."
          }

          $sparkline = [string]$json.failureCodeSparkline
          if ([string]::IsNullOrWhiteSpace($sparkline)) {
            $errors += "Missing required field failureCodeSparkline in $targetPath."
          } elseif ($sparkline -ne "-" -and $sparkline.Length -ne $sequenceArray.Count) {
            $errors += "failureCodeSparkline length does not match failureCodeSequence count in $targetPath."
          } elseif ($sparkline -ne "-") {
            foreach ($ch in $sparkline.ToCharArray()) {
              if (-not ($allowedSparklineSymbols -contains [string]$ch)) {
                $errors += "Unknown sparkline symbol '$ch' in $targetPath."
                break
              }
            }
          }

          if ($null -ne $json.failureCodeCounts) {
            $countTotal = 0
            foreach ($prop in $json.failureCodeCounts.PSObject.Properties) {
              $countTotal += [int]$prop.Value
            }
            if ($countTotal -ne $sequenceArray.Count) {
              $errors += "failureCodeCounts total ($countTotal) does not match failureCodeSequence count ($($sequenceArray.Count)) in $targetPath."
            }
          }
        }
      }
    }
  }
}

foreach ($spec in $optionalSpecs) {
  $targetPath = [string]$spec.Path
  if (-not (Test-Path $targetPath)) {
    continue
  }

  $checkedArtifacts += 1
  try {
    $json = Get-Content -Path $targetPath -Raw | ConvertFrom-Json
  } catch {
    $errors += "Invalid JSON: $targetPath"
    continue
  }

  $schemaVersion = [string]$json.schemaVersion
  if ($schemaVersion -ne [string]$spec.SchemaVersion) {
    $errors += "Unexpected schemaVersion in $targetPath. Expected '$($spec.SchemaVersion)', found '$schemaVersion'."
  }

  $generatedBy = [string]$json.generatedBy
  $allowed = @($spec.AllowedGeneratedBy | ForEach-Object { [string]$_ })
  if ([string]::IsNullOrWhiteSpace($generatedBy) -or -not ($allowed -contains $generatedBy)) {
    $errors += "Unexpected generatedBy in $targetPath. Expected one of [$([string]::Join(', ', $allowed))], found '$generatedBy'."
  }

  $optionalFileName = [System.IO.Path]::GetFileName($targetPath)
  switch ($optionalFileName) {
    "smoke-triage-status.json" {
      if ([string]::IsNullOrWhiteSpace([string]$json.generatedAt)) {
        $errors += "Missing required field generatedAt in $targetPath."
      }
      if ($null -eq $json.schemaValidationExitCode) {
        $errors += "Missing required field schemaValidationExitCode in $targetPath."
      }
      if ([string]::IsNullOrWhiteSpace([string]$json.failureCodeSequence)) {
        $errors += "Missing required field failureCodeSequence in $targetPath."
      }
      if ($null -eq $json.failureCodeSequenceArray) {
        $errors += "Missing required field failureCodeSequenceArray in $targetPath."
      } else {
        $sequenceArray = @($json.failureCodeSequenceArray | ForEach-Object { [string]$_ })
        if ($sequenceArray.Count -eq 0) {
          $errors += "failureCodeSequenceArray is empty in $targetPath."
        } else {
          $sequenceText = [string]::Join(', ', $sequenceArray)
          if ($sequenceText -ne [string]$json.failureCodeSequence) {
            $errors += "Mismatch between failureCodeSequenceArray and failureCodeSequence in $targetPath."
          }
          $sparkline = [string]$json.failureCodeSparkline
          if ([string]::IsNullOrWhiteSpace($sparkline)) {
            $errors += "Missing required field failureCodeSparkline in $targetPath."
          } elseif ($sparkline -ne "-" -and $sparkline.Length -ne $sequenceArray.Count) {
            $errors += "failureCodeSparkline length does not match failureCodeSequenceArray count in $targetPath."
          } elseif ($sparkline -ne "-") {
            foreach ($ch in $sparkline.ToCharArray()) {
              if (-not ($allowedSparklineSymbols -contains [string]$ch)) {
                $errors += "Unknown sparkline symbol '$ch' in $targetPath."
                break
              }
            }
          }
        }
      }
    }
    "smoke-triage-loop-summary.json" {
      if ($null -eq $json.runs) {
        $errors += "Missing required field runs in $targetPath."
      }
      if ($null -eq $json.results) {
        $errors += "Missing required field results in $targetPath."
      } else {
        $results = @($json.results)
        if ($results.Count -lt 1) {
          $errors += "results is empty in $targetPath."
        } elseif ($null -ne $json.runs -and [int]$json.runs -ne $results.Count) {
          $errors += "runs value ($($json.runs)) does not match results count ($($results.Count)) in $targetPath."
        }
      }
      if ($null -eq $json.failureCodeCounts) {
        $errors += "Missing required field failureCodeCounts in $targetPath."
        continue
      }

      $recomputedCounts = @{}
      foreach ($row in @($json.results)) {
        $code = if ([string]::IsNullOrWhiteSpace([string]$row.failureCode)) { "none" } else { [string]$row.failureCode }
        if ($recomputedCounts.ContainsKey($code)) {
          $recomputedCounts[$code] = [int]$recomputedCounts[$code] + 1
        } else {
          $recomputedCounts[$code] = 1
        }
      }

      $declared = @{}
      foreach ($prop in $json.failureCodeCounts.PSObject.Properties) {
        $declared[[string]$prop.Name] = [int]$prop.Value
      }

      foreach ($key in $recomputedCounts.Keys) {
        if (-not $declared.ContainsKey($key) -or [int]$declared[$key] -ne [int]$recomputedCounts[$key]) {
          $errors += "failureCodeCounts mismatch for '$key' in $targetPath."
        }
      }
      foreach ($key in $declared.Keys) {
        if (-not $recomputedCounts.ContainsKey($key)) {
          $errors += "failureCodeCounts has extra key '$key' not present in results in $targetPath."
        }
      }
    }
    "smoke-failure-diagnostics.json" {
      if ($null -eq $json.exitCode) {
        $errors += "Missing required field exitCode in $targetPath."
      }
      if ([string]::IsNullOrWhiteSpace([string]$json.generatedAt)) {
        $errors += "Missing required field generatedAt in $targetPath."
      }
      if ($null -eq $json.commands) {
        $errors += "Missing required field commands in $targetPath."
      } else {
        if ($null -eq $json.commands.api -and $null -eq $json.commands.ui) {
          $errors += "commands must include api and/or ui sections in $targetPath."
        }
      }
    }
  }
}

$validationReport = [pscustomobject]@{
  schemaVersion = "smoke-artifact-validation.v1"
  generatedBy = "smoke-validate-artifacts.ps1"
  generatedAt = (Get-Date).ToString("o")
  reportsDir = $ReportsDir
  checkedArtifacts = $checkedArtifacts
  passed = ($errors.Count -eq 0)
  errorCount = $errors.Count
  errors = @($errors)
}

Set-ContentWithRetry -Path $validationReportPath -Value ($validationReport | ConvertTo-Json -Depth 8) -Encoding utf8

if ($errors.Count -gt 0) {
  foreach ($line in $errors) {
    Write-Host "ARTIFACT-SCHEMA-ERROR $line"
  }
  Write-Host "ARTIFACT-SCHEMA-REPORT $validationReportPath"
  exit 1
}

Write-Host "ARTIFACT-SCHEMA-OK reportsDir=$ReportsDir artifacts=$checkedArtifacts"
Write-Host "ARTIFACT-SCHEMA-REPORT $validationReportPath"
exit 0
