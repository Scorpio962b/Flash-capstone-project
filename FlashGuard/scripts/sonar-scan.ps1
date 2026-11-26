# Local SonarQube quality gate (free Community edition in Docker).
# One-time: docker compose -f docker-compose.sonar.yml up -d ; open http://localhost:9000 ;
#           log in admin/admin ; My Account > Security > generate a token ; $env:SONAR_TOKEN = '<token>'
# Then:     .\scripts\run-all.ps1 -Layers lint      (creates reports\eslint.json)
#           .\scripts\sonar-scan.ps1                (exit code 1 if the quality gate fails)
param([string]$AppDir = (Resolve-Path "$PSScriptRoot\..").Path)
if (-not $env:SONAR_TOKEN) { Write-Error 'Set $env:SONAR_TOKEN first'; exit 2 }
if (-not (Test-Path (Join-Path $AppDir 'reports\eslint.json'))) { Write-Warning 'reports\eslint.json not found - run .\scripts\run-all.ps1 -Layers lint first' }
docker run --rm `
  -e SONAR_HOST_URL=http://host.docker.internal:9000 `
  -e SONAR_TOKEN=$env:SONAR_TOKEN `
  -v "${AppDir}:/usr/src" `
  sonarsource/sonar-scanner-cli
exit $LASTEXITCODE
