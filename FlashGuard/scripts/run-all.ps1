
<#
 Runs the QA layers locally and collects results in .\results
 Usage:
   .\scripts\run-all.ps1
   .\scripts\run-all.ps1 -Layers lint,ui,api
   .\scripts\run-all.ps1 -Layers api -ApiEnv tests\api\local.postman_environment.json
   .\scripts\run-all.ps1 -Layers ui -Runs 5
   .\scripts\run-all.ps1 -SkipStack

 Layers: lint, ui, e2e, api, db, mobile, zap
#>

param(
  [string[]]$Layers = @('lint','ui','e2e','api','db','mobile','zap'),
  [string]$AppDir = (Resolve-Path "$PSScriptRoot\..").Path,
  [string]$ApiDir = 'tests/api',
  [string]$ApiEnv = '',
  [string]$DbDir = 'tests/db',
  [string]$SqlServer = 'localhost',
  [string]$SqlDatabase = 'FlashGuard',
  [string]$SqlUser = '',
  [string]$SqlPassword = '',
  [bool]$DbRowsMeanFailure = $true,
  [int]$Runs = 1,
  [switch]$NoRetries,
  [switch]$SkipStack
)

Set-Location $AppDir

$results = Join-Path $AppDir 'results'
New-Item -ItemType Directory -Force -Path $results | Out-Null

$script:summary = @()
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

function Run-Layer([string]$Name, [int]$Run, [scriptblock]$Block) {
  Write-Host "`n=== $Name (run $Run) ===" -ForegroundColor Cyan

  $layerDir = Join-Path $results $Name
  New-Item -ItemType Directory -Force -Path $layerDir | Out-Null

  Remove-Item (Join-Path $layerDir '*.xml') -ErrorAction SilentlyContinue

  $sw = [Diagnostics.Stopwatch]::StartNew()
  $global:LASTEXITCODE = 0

  try {
    & $Block
    $code = $global:LASTEXITCODE
  }
  catch {
    Write-Host "ERROR in ${Name}: $_" -ForegroundColor Red
    $code = 1
  }

  $sw.Stop()

  $hist = Join-Path $results "history\$stamp-run$Run\$Name"
  New-Item -ItemType Directory -Force -Path $hist | Out-Null
  Copy-Item (Join-Path $layerDir '*.xml') $hist -ErrorAction SilentlyContinue

  $script:summary += [pscustomobject]@{
    Run = $Run
    Layer = $Name
    Result = $(if ($code -eq 0) { 'PASS' } else { 'FAIL' })
    ExitCode = $code
    Duration = $sw.Elapsed.ToString('mm\:ss')
  }
}

function Wait-Url([string]$Url) {
  for ($i = 1; $i -le 40; $i++) {
    try {
      Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3 | Out-Null
      return $true
    }
    catch {
      Start-Sleep -Seconds 3
    }
  }

  return $false
}

# Start application stack when required
if (-not $SkipStack -and ($Layers | Where-Object { $_ -in 'ui','e2e','api','db','zap' })) {
  Write-Host 'Starting stack (docker compose up)...' -ForegroundColor Yellow

  docker compose up -d --build

  if (-not (Wait-Url 'http://localhost:4000/health')) {
    Write-Warning 'API health check did not return OK'
  }

  if (-not (Wait-Url 'http://localhost:3000')) {
    Write-Warning 'Web app did not respond'
  }
}

for ($r = 1; $r -le $Runs; $r++) {

  # LINT
  if ($Layers -contains 'lint') {
    Run-Layer 'lint' $r {
      New-Item -ItemType Directory -Force -Path reports | Out-Null

      $eslint = Join-Path $AppDir 'tools\lint\node_modules\.bin\eslint.cmd'
      $config = Join-Path $AppDir 'tools\lint\eslint.config.mjs'

      if (-not (Test-Path $eslint)) {
        throw 'ESLint installation not found in tools\lint'
      }

      if (-not (Test-Path $config)) {
        throw 'ESLint configuration not found in tools\lint'
      }

      & $eslint tests src --config $config --format json --output-file reports/eslint.json
      $jsonExitCode = $LASTEXITCODE

      & $eslint tests src --config $config
      $consoleExitCode = $LASTEXITCODE

      if ($jsonExitCode -ne 0 -or $consoleExitCode -ne 0) {
        $global:LASTEXITCODE = 1
      }
    }
  }

  # UI TESTS
  if ($Layers -contains 'ui') {
    Run-Layer 'ui' $r {
      npx cucumber-js --format junit:results/ui/junit.xml --format html:results/ui/cucumber-report.html
    }
  }

  # END-TO-END TESTS
  if ($Layers -contains 'e2e') {
    Run-Layer 'e2e' $r {
      $env:PLAYWRIGHT_JUNIT_OUTPUT_NAME = 'results/e2e/junit.xml'
      $env:PW_TEST_HTML_REPORT_OPEN = 'never'

      $extra = @()
      if ($NoRetries) {
        $extra += '--retries=0'
      }

      npx playwright test --reporter=list,html,junit,allure-playwright @extra
    }
  }

  # API TESTS
  if ($Layers -contains 'api') {
    Run-Layer 'api' $r {
      $collections = @(
        Get-ChildItem $ApiDir -Recurse -Filter *.json |
        Where-Object { $_.Name -notmatch 'environment' }
      )

      if ($collections.Count -eq 0) {
        throw "No Postman collections (.json) found in $ApiDir"
      }

      $failed = 0

      foreach ($c in $collections) {
        Write-Host "--- $($c.Name)" -ForegroundColor DarkCyan

        $a = @(
          'newman',
          'run',
          $c.FullName,
          '-r',
          'cli,junit',
          '--reporter-junit-export',
          "results/api/$($c.BaseName).xml"
        )

        if ($ApiEnv) {
          $a += @('-e', $ApiEnv)
        }

        & npx @a

        if ($LASTEXITCODE -ne 0) {
          $failed++
        }
      }

      Write-Host "API: $failed of $($collections.Count) collections failed"

      $global:LASTEXITCODE = $(if ($failed -gt 0) { 1 } else { 0 })
    }
  }

  # DATABASE TESTS
  if ($Layers -contains 'db') {
    Run-Layer 'db' $r {
      if (-not (Get-Command sqlcmd -ErrorAction SilentlyContinue)) {
        throw 'sqlcmd is not installed or not on PATH'
      }

      $sqlFiles = @(
        Get-ChildItem $DbDir -Recurse -Filter *.sql |
        Where-Object { $_.FullName -notmatch 'concurrency-locking' }
      )

      if ($sqlFiles.Count -eq 0) {
        throw "No .sql files found in $DbDir"
      }

      $cases = @()
      $failures = 0

      $sqlFiles | ForEach-Object {
        $f = $_.FullName

        $a = @('-S', $SqlServer, '-d', $SqlDatabase, '-b', '-C', '-i', $f)

        if ($SqlUser) {
          $a += @('-U', $SqlUser, '-P', $SqlPassword)
        }
        else {
          $a += '-E'
        }

        $sw = [Diagnostics.Stopwatch]::StartNew()
        $out = & sqlcmd @a 2>&1 | Out-String
        $code = $global:LASTEXITCODE
        $sw.Stop()

        Set-Content -Path "results/db/$($_.BaseName).log" -Value $out

        $rows = (
          [regex]::Matches($out, '\((\d+) rows? affected\)') |
          ForEach-Object { [int]$_.Groups[1].Value } |
          Measure-Object -Sum
        ).Sum

        $msg = ''

        if ($code -ne 0) {
          $msg = 'SQL error (see log)'
        }
        elseif ($DbRowsMeanFailure -and $rows -gt 0) {
          $msg = "$rows row(s) returned (violations)"
        }

        $t = [math]::Round($sw.Elapsed.TotalSeconds, 2)

        if ($msg) {
          $failures++

          $cases += "<testcase classname=`"db`" name=`"$($_.BaseName)`" time=`"$t`"><failure message=`"$([Security.SecurityElement]::Escape($msg))`"/></testcase>"

          Write-Host "FAIL $($_.Name): $msg" -ForegroundColor Red
        }
        else {
          $cases += "<testcase classname=`"db`" name=`"$($_.BaseName)`" time=`"$t`"/>"

          Write-Host "PASS $($_.Name)" -ForegroundColor Green
        }
      }

      $xml = "<?xml version=`"1.0`" encoding=`"UTF-8`"?><testsuites><testsuite name=`"db`" tests=`"$($cases.Count)`" failures=`"$failures`">$($cases -join '')</testsuite></testsuites>"

      Set-Content -Path 'results/db/junit.xml' -Value $xml -Encoding UTF8

      $global:LASTEXITCODE = $(if ($failures -gt 0) { 1 } else { 0 })
    }
  }

  # MOBILE TESTS
  if ($Layers -contains 'mobile') {
    Run-Layer 'mobile' $r {
      npm run test:mobile:cucumber
    }
  }

  # SECURITY TESTS
  if ($Layers -contains 'zap') {
    Run-Layer 'zap' $r {
      docker run --rm -v "${AppDir}\results\zap:/zap/wrk:rw" ghcr.io/zaproxy/zaproxy:stable `
        zap-baseline.py -t http://host.docker.internal:3000 -r zap-report.html -I
    }
  }
}

# ALLURE REPORT
if (Test-Path 'allure-results') {
  Write-Host "`nGenerating Allure report..." -ForegroundColor Yellow

  npx allure-commandline generate allure-results -o results/allure-report --clean
}

# QA METRICS
node scripts/qa-metrics.mjs

# SUMMARY
$script:summary | Format-Table -AutoSize

$script:summary |
  Export-Csv -NoTypeInformation -Path (Join-Path $results 'summary.csv')

Write-Host "Results folder: $results"

Write-Host "Open: playwright-report\index.html, results\ui\cucumber-report.html, results\allure-report\index.html, results\zap\zap-report.html"

if ($script:summary | Where-Object { $_.Result -eq 'FAIL' }) {
  exit 1
}
