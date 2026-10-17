$ErrorActionPreference = 'Stop'
$serverScript = Join-Path $PSScriptRoot 'serve.mjs'
$previewUrl = 'http://127.0.0.1:8390/opendesign/mockups/three-hud-preview/index.html'
function Get-PreviewListeners {
    netstat -ano -p tcp | ForEach-Object {
        if ($_ -match '^\s*TCP\s+(\S+:8390)\s+\S+\s+LISTENING\s+(\d+)\s*$') {
            [pscustomobject]@{ Address = $Matches[1]; Owner = [int]$Matches[2] }
        }
    }
}
function Get-PreviewIdentity {
    $request = [System.Net.HttpWebRequest]::Create('http://127.0.0.1:8390/')
    $request.Method = 'HEAD'
    $request.Timeout = 2000
    $request.AllowAutoRedirect = $false
    $response = $null
    try {
        try { $response = $request.GetResponse() }
        catch [System.Net.WebException] { $response = $_.Exception.Response }
        if ($response) {
            [pscustomobject]@{ App = $response.Headers['X-Preview-App']; Owner = $response.Headers['X-Preview-Pid'] }
        }
    } finally { if ($response) { $response.Close() } }
}
$listeners = @(Get-PreviewListeners)

if ($listeners.Count -gt 0) {
    $owners = @($listeners.Owner | Select-Object -Unique)
    $identity = Get-PreviewIdentity
    foreach ($owner in $owners) {
        if (-not $identity -or $identity.App -ne 'galactic-three-hud-preview' -or $identity.Owner -ne [string]$owner) {
            throw 'Port 8390 is already in use by another service. No process was stopped.'
        }
    }
    Write-Output "Three HUD preview already running: $previewUrl (PID $($owners -join ', '))"
    exit 0
}

$nodeCommand = Get-Command node -CommandType Application -ErrorAction Stop | Select-Object -First 1
$serverProcess = Start-Process -FilePath $nodeCommand.Source -ArgumentList @('"' + $serverScript + '"') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -PassThru
$ready = $false
try {
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        Start-Sleep -Milliseconds 250
        $serverProcess.Refresh()
        if ($serverProcess.HasExited) { throw 'The preview server exited before binding port 8390.' }
        $listener = Get-PreviewListeners | Where-Object { $_.Owner -eq $serverProcess.Id -and $_.Address -eq '127.0.0.1:8390' }
        if ($listener) { $ready = $true; break }
    }
    if (-not $ready) { throw 'The preview server did not bind 127.0.0.1:8390.' }
    Write-Output "Three HUD preview running: $previewUrl (PID $($serverProcess.Id))"
} finally {
    if (-not $ready -and -not $serverProcess.HasExited) { Stop-Process -Id $serverProcess.Id -ErrorAction SilentlyContinue }
}
