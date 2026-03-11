$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$envPath = Join-Path $root "backend\.env"

if (-not (Test-Path $envPath)) {
  throw "backend/.env not found. Create it before copying the GitHub Actions secret."
}

$content = Get-Content -Path $envPath -Raw
if ([string]::IsNullOrWhiteSpace($content)) {
  throw "backend/.env is empty."
}

try {
  Set-Clipboard -Value $content
  Write-Host "Copied backend/.env to clipboard."
} catch {
  Write-Warning "Clipboard copy failed. The file content is printed below so you can copy it manually."
  Write-Output $content
  exit 0
}

Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Open GitHub repository Settings -> Secrets and variables -> Actions."
Write-Host "2. Create a new repository secret named BACKEND_ENV_FILE."
Write-Host "3. Paste the clipboard content as the secret value."
Write-Host "4. Run the Smoke Suite workflow."
