$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Install Node.js 22+' }
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw 'Install Docker Desktop with Docker Compose' }
node infra/scripts/setup.mjs
if ($LASTEXITCODE -ne 0) { throw 'Setup failed' }
docker compose up --build -d
if ($LASTEXITCODE -ne 0) { throw 'Docker startup failed; inspect docker compose logs' }
Write-Host 'Storefront: http://localhost:8080/fr'
Write-Host 'Staff dashboard: http://localhost:8081'
Write-Host 'Health: http://localhost:8080/health/ready'
