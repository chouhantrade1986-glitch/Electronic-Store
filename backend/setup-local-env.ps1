# Ensures backend/.env exists and has a valid JWT_SECRET for local development.
# Run from the backend directory: powershell -ExecutionPolicy Bypass -File setup-local-env.ps1

$envFile = Join-Path $PSScriptRoot ".env"
$envExample = Join-Path $PSScriptRoot ".env.example"

if (-not (Test-Path $envFile)) {
  if (Test-Path $envExample) {
    Copy-Item -Path $envExample -Destination $envFile
    Write-Host "Created backend/.env from .env.example."
  }
}

if (-not (Test-Path $envFile)) {
  return
}

$envContents = Get-Content -Path $envFile -Raw
$disallowedJwtSecrets = @("", "dev-secret-change-me", "replace-with-strong-secret", "changeme")
$jwtMatch = [regex]::Match($envContents, '(?m)^JWT_SECRET=(.*)$')
$jwtSecret = if ($jwtMatch.Success) { $jwtMatch.Groups[1].Value.Trim() } else { "" }

if ($disallowedJwtSecrets -contains $jwtSecret) {
  $newSecret = "local-" + [guid]::NewGuid().ToString("N")
  if ($jwtMatch.Success) {
    $envContents = $envContents -replace '(?m)^JWT_SECRET=.*$', ("JWT_SECRET=" + $newSecret)
  } else {
    $envContents = $envContents.TrimEnd() + [Environment]::NewLine + "JWT_SECRET=" + $newSecret + [Environment]::NewLine
  }
  $envContents | Set-Content -Path $envFile -Encoding utf8NoBOM
  Write-Host "Generated a random JWT_SECRET in backend/.env for local use."
}
