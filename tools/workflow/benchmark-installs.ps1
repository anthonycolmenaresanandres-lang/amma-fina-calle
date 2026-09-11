[CmdletBinding()]
param(
    [string]$AppPath = (Join-Path $PSScriptRoot '../../APP/web'),
    [string]$OutputRoot = 'C:\Dev\amma\evidence\workflow-efficiency',
    [ValidateRange(1, 5)][int]$Runs = 2,
    [switch]$RunPilot
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if (-not $RunPilot) {
    Write-Output 'Preflight only: no installations performed. Use -RunPilot in an idle workstation window; do not run browser QA or another install concurrently. npm remains the application default.'
    return
}
$app = (Resolve-Path -LiteralPath $AppPath).Path
$destination = [IO.Path]::GetFullPath($OutputRoot)
if (-not $destination.StartsWith('C:\Dev\amma\evidence\', [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Benchmark output must stay under C:\Dev\amma\evidence.'
}
foreach ($name in @('package.json', 'package-lock.json')) {
    if (-not (Test-Path -LiteralPath (Join-Path $app $name) -PathType Leaf)) { throw "Missing $name" }
}
if ((Get-PSDrive C).Free -lt 10GB) { throw 'Need at least 10 GiB free before this isolated install comparison.' }
$npm = (Get-Command npm.cmd -ErrorAction Stop).Source
$pnpm = (Get-Command pnpm.cmd -ErrorAction Stop).Source
$runRoot = Join-Path $destination ('installs-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [guid]::NewGuid().ToString('N').Substring(0, 6))
New-Item -ItemType Directory -Path $runRoot -ErrorAction Stop | Out-Null
$sourceHashes = @{}
foreach ($name in @('package.json', 'package-lock.json')) {
    $sourceHashes[$name] = (Get-FileHash -LiteralPath (Join-Path $app $name) -Algorithm SHA256).Hash
}
$result = [ordered]@{
    source = $app; startedUtc = [DateTime]::UtcNow.ToString('o'); output = $runRoot
    node = (& node --version); npm = (& $npm --version); pnpm = (& $pnpm --version)
    sourceHashes = $sourceHashes; runs = @(); status = 'running'
    limits = 'Install-only pilot. Lifecycle scripts disabled for both tools; new project directory per sample; dedicated per-manager cache; run 1 cold, later runs warm. No app/CI migration or full-build compatibility claim.'
}
function Save-Result {
    $result | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $runRoot 'results.json') -Encoding utf8
}
function Invoke-TimedInstall([string]$Manager, [string]$Directory, [string]$Executable, [string[]]$Arguments, [int]$Run) {
    Push-Location -LiteralPath $Directory
    $timer = [Diagnostics.Stopwatch]::StartNew()
    try {
        & $Executable @Arguments *> (Join-Path $Directory 'install.log')
        $exitCode = $LASTEXITCODE
    } finally { $timer.Stop(); Pop-Location }
    $result.runs += [ordered]@{ manager = $Manager; run = $Run; cache = $(if ($Run -eq 1) { 'cold' } else { 'warm' });
        seconds = [math]::Round($timer.Elapsed.TotalSeconds, 2); exitCode = $exitCode; directory = $Directory }
    Save-Result
    Write-Host "$Manager run $Run`: $([math]::Round($timer.Elapsed.TotalSeconds, 2)) seconds, exit $exitCode"
    if ($exitCode -ne 0) { throw "$Manager failed; inspect task-local install.log." }
}
try {
    Save-Result
    # Sequential samples avoid competing install workloads contaminating timings.
    foreach ($manager in @('npm', 'pnpm')) {
        for ($run = 1; $run -le $Runs; $run++) {
            if ((Get-PSDrive C).Free -lt 4GB) { throw 'Disk safety threshold reached; retained partial evidence, stopped installing.' }
            $dir = Join-Path $runRoot "$manager-$run"
            New-Item -ItemType Directory -Path $dir | Out-Null
            foreach ($name in @('package.json', 'package-lock.json')) {
                Copy-Item -LiteralPath (Join-Path $app $name) -Destination (Join-Path $dir $name) -ErrorAction Stop
            }
            if ($manager -eq 'npm') {
                Invoke-TimedInstall $manager $dir $npm @('ci', '--ignore-scripts', '--no-audit', '--no-fund', '--cache', (Join-Path $runRoot 'npm-cache')) $run
            } else {
                if ($run -eq 1) {
                    Push-Location -LiteralPath $dir
                    $importTimer = [Diagnostics.Stopwatch]::StartNew()
                    try {
                        & $pnpm import *> (Join-Path $dir 'import.log')
                        $importExit = $LASTEXITCODE
                    } finally { $importTimer.Stop(); Pop-Location }
                    $result['pnpmImportSeconds'] = [math]::Round($importTimer.Elapsed.TotalSeconds, 2)
                    if ($importExit -ne 0) { throw 'pnpm lockfile import failed; no migration performed.' }
                } else {
                    Copy-Item -LiteralPath (Join-Path $runRoot 'pnpm-1/pnpm-lock.yaml') -Destination $dir
                }
                Invoke-TimedInstall $manager $dir $pnpm @('install', '--frozen-lockfile', '--ignore-scripts', '--ignore-workspace', '--reporter=append-only', '--store-dir', (Join-Path $runRoot 'pnpm-store')) $run
            }
        }
    }
    foreach ($name in @('package.json', 'package-lock.json')) {
        if ((Get-FileHash -LiteralPath (Join-Path $app $name) -Algorithm SHA256).Hash -ne $sourceHashes[$name]) {
            throw "Source $name changed during benchmark; discard comparison."
        }
    }
    $result.status = 'passed-install-only'
} catch {
    $result.status = 'failed'
    $result['error'] = $_.Exception.Message
    throw
} finally {
    $result['finishedUtc'] = [DateTime]::UtcNow.ToString('o')
    Save-Result
    Write-Host "Evidence: $runRoot"
}
