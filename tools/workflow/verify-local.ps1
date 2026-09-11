[CmdletBinding()]
param(
    [string]$BaseUrl = 'http://127.0.0.1:3127',
    [ValidateSet('fina-calle', 'colattao', 'laspalmas', 'ajgators', 'stadium')][string]$Skin = 'laspalmas',
    [string]$OutputRoot = 'C:\Dev\amma\evidence\workflow-efficiency',
    [switch]$RequireNoindex,
    [switch]$SelfTest
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Assert-LocalOrigin([string]$Value) {
    $uri = $null
    if (-not [Uri]::TryCreate($Value, [UriKind]::Absolute, [ref]$uri) -or
        $uri.Scheme -notin @('http', 'https') -or $uri.Host -notin @('127.0.0.1', 'localhost', '[::1]') -or
        $uri.UserInfo -or $uri.AbsolutePath -ne '/' -or $uri.Query -or $uri.Fragment) {
        throw 'BaseUrl must be a loopback HTTP(S) origin with no credentials, path, query or fragment.'
    }
    return $uri
}
function Assert-PageChecks($Checks) {
    foreach ($property in $Checks.PSObject.Properties) {
        if ($property.Value -isnot [bool] -or -not $property.Value) { throw "Browser check failed: $($property.Name)" }
    }
    if (@($Checks.PSObject.Properties).Count -eq 0) { throw 'Empty browser checks.' }
}
if ($SelfTest) {
    foreach ($valid in @('http://127.0.0.1:3127', 'http://localhost:3000', 'http://[::1]:3000')) { $null = Assert-LocalOrigin $valid }
    foreach ($invalid in @('https://finacalleos.com', 'http://127.0.0.1.evil.test', 'file:///C:/a', 'http://user:pass@localhost', 'http://localhost/path', 'http://localhost/?url=x', 'http://localhost/#x')) {
        $rejected = $false
        try { $null = Assert-LocalOrigin $invalid } catch { $rejected = $true }
        if (-not $rejected) { throw "Unsafe origin accepted: $invalid" }
    }
    Assert-PageChecks ([pscustomobject]@{ visible = $true })
    foreach ($bad in @([pscustomobject]@{}, [pscustomobject]@{ overflow = $false }, [pscustomobject]@{ result = 'true' })) {
        $rejected = $false
        try { Assert-PageChecks $bad } catch { $rejected = $true }
        if (-not $rejected) { throw 'Failed/empty checks accepted.' }
    }
    Write-Output 'PASS: 14 local-origin and fail-closed assertion cases.'
    return
}
$origin = Assert-LocalOrigin $BaseUrl
$browser = (Get-Command agent-browser.cmd -ErrorAction Stop).Source
$runId = (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [guid]::NewGuid().ToString('N').Substring(0, 6)
$session = "amma-smoke-$runId"
$dir = Join-Path ([IO.Path]::GetFullPath($OutputRoot)) "browser-$runId"
New-Item -ItemType Directory -Path $dir -ErrorAction Stop | Out-Null
$result = [ordered]@{ status = 'running'; origin = $origin.GetLeftPart([UriPartial]::Authority); skin = $Skin; checks = @();
    requireNoindex = [bool]$RequireNoindex;
    coverage = 'Local loopback-only smoke: all three keeper selectors, two mobile viewports, canvas, DOM images, overflow and page errors; noindex only when explicitly required. Does not certify gameplay, asset textures, auth, billing or production.' }
function Invoke-Browser([string[]]$Arguments) {
    Write-Verbose "Browser step: $($Arguments[0])"
    $raw = & $browser --session $session --allowed-domains $origin.Host --json @Arguments
    $commandExit = $LASTEXITCODE
    if (-not $raw) { throw "Browser command returned no result: $($Arguments[0])" }
    $reply = ($raw -join "`n") | ConvertFrom-Json
    if ($commandExit -ne 0 -or -not $reply.success) { throw "Browser command failed: $($Arguments[0]); $($reply.error)" }
    return $reply.data
}
function Invoke-PageScript([string]$Script) {
    $encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($Script))
    return (Invoke-Browser @('eval', '-b', $encoded)).result
}
$pageChecks = @'
(() => ({
  sameOrigin: location.origin === EXPECTED_ORIGIN,
  noOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
  noBrokenDomImages: [...document.images].every(i => i.complete && i.naturalWidth > 0),
  indexingExpectation: !REQUIRE_NOINDEX || [...document.querySelectorAll('meta[name="robots"]')].some(m => /noindex/i.test(m.content)),
  noErrorOverlay: !document.querySelector('nextjs-portal')
}))()
'@
$pageChecks = $pageChecks.Replace('EXPECTED_ORIGIN', ($result.origin | ConvertTo-Json -Compress))
$pageChecks = $pageChecks.Replace('REQUIRE_NOINDEX', ([bool]$RequireNoindex | ConvertTo-Json -Compress))
try {
    # On Windows the new daemon can inherit stdout. Bootstrap without a captured
    # pipeline; capture JSON only from subsequent commands on the warm session.
    & $browser --session $session --allowed-domains $origin.Host open "$($result.origin)/penalty-shootout?skin=$Skin"
    if ($LASTEXITCODE -ne 0) { throw 'Browser bootstrap failed.' }
    $version = & $browser --version
    $result['browser'] = $version
    foreach ($size in @(@(320, 740), @(390, 844))) {
        $null = Invoke-Browser @('set', 'viewport', [string]$size[0], [string]$size[1])
        foreach ($level in 1..3) {
            $null = Invoke-Browser @('errors', '--clear')
            $null = Invoke-Browser @('open', "$($result.origin)/penalty-shootout?skin=$Skin")
            $null = Invoke-Browser @('wait', '--text', 'Pick your keeper')
            $snapshot = Invoke-Browser @('snapshot', '-i')
            $matches = @($snapshot.refs.PSObject.Properties | Where-Object {
                $_.Value.role -eq 'button' -and $_.Value.name -match "^KEEPER $level\b"
            })
            if ($matches.Count -ne 1) { throw "Expected exactly one Keeper $level button." }
            $null = Invoke-Browser @('click', "@$($matches[0].Name)")
            $ready = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('document.querySelectorAll("canvas").length === 1 && document.querySelector("canvas").width > 0'))
            $null = Invoke-Browser @('wait', '--fn', "eval(atob('$ready'))")
            $null = Invoke-Browser @('wait', '--load', 'networkidle')
            # Let the first rendered frames complete without arbitrary sleep.
            $null = Invoke-PageScript 'new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(true))))'
            $checks = Invoke-PageScript $pageChecks
            Assert-PageChecks $checks
            $canvas = Invoke-PageScript '(() => { const c = document.querySelector("canvas"); const r = c.getBoundingClientRect(); return {oneCanvas: document.querySelectorAll("canvas").length === 1, visibleCanvas: r.width > 0 && r.height > 0 && r.left >= -1 && r.right <= innerWidth + 1}; })()'
            Assert-PageChecks $canvas
            $errors = Invoke-Browser @('errors')
            if (@($errors.errors).Count -ne 0) { throw 'Runtime page errors detected.' }
            $screenshot = Join-Path $dir "$Skin-$($size[0])-keeper-$level.png"
            $null = Invoke-Browser @('screenshot', $screenshot)
            $robots = Invoke-PageScript '[...document.querySelectorAll("meta[name=robots]")].map(m => m.content).join(",")'
            $result.checks += [ordered]@{ width = $size[0]; height = $size[1]; level = $level; passed = $true; page = $checks; canvas = $canvas; robots = $robots; screenshot = $screenshot }
            Write-Host "PASS: $Skin $($size[0])px keeper $level"
        }
    }
    $result.status = 'passed-smoke'
} catch {
    $result.status = 'failed'
    $result['error'] = $_.Exception.Message
    throw
} finally {
    try { $null = Invoke-Browser @('close') } catch { Write-Warning 'Could not close this smoke-test session.' }
    $result | ConvertTo-Json -Depth 9 | Set-Content -LiteralPath (Join-Path $dir 'results.json') -Encoding utf8
    Write-Host "Evidence: $dir"
}
