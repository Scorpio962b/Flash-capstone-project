# Uploads JUnit results from .\results\<layer> to Testmo. Each person runs it for their own layer.
# One-time: Testmo > your profile > API keys > create key ; $env:TESTMO_TOKEN = '<key>'
# Usage:    .\scripts\upload-testmo.ps1 -Layers ui -Instance https://yourorg.testmo.net -ProjectId 1
param(
  [Parameter(Mandatory)][string[]]$Layers,
  [Parameter(Mandatory)][string]$Instance,
  [Parameter(Mandatory)][int]$ProjectId
)
if (-not $env:TESTMO_TOKEN) { Write-Error 'Set $env:TESTMO_TOKEN first'; exit 2 }
$failed = $false
foreach ($l in $Layers) {
  if (-not (Get-ChildItem "results/$l/*.xml" -ErrorAction SilentlyContinue)) { Write-Warning "No XML in results/$l, skipping"; continue }
  npx @testmo/testmo-cli automation:run:submit `
    --instance $Instance --project-id $ProjectId `
    --name "$l - $(Get-Date -Format 'yyyy-MM-dd HH:mm')" --source "local-$l" `
    --results "results/$l/*.xml"
  if ($LASTEXITCODE -ne 0) { $failed = $true }
}
if ($failed) { exit 1 }
