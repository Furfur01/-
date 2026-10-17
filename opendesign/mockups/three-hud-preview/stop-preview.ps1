$ErrorActionPreference = 'Stop'
$listeners = @(netstat -ano -p tcp | ForEach-Object {
    if ($_ -match '^\s*TCP\s+(\S+:8390)\s+\S+\s+LISTENING\s+(\d+)\s*$') {
        [pscustomobject]@{ Address = $Matches[1]; Owner = [int]$Matches[2] }
    }
})
if ($listeners.Count -eq 0) {
    Write-Output 'No preview server is listening on port 8390.'
    exit 0
}
$request = [System.Net.HttpWebRequest]::Create('http://127.0.0.1:8390/')
$request.Method = 'HEAD'
$request.Timeout = 2000
$request.AllowAutoRedirect = $false
$response = $null
$app = ''
$serverOwner = ''
try {
    try { $response = $request.GetResponse() }
    catch [System.Net.WebException] { $response = $_.Exception.Response }
    if ($response) { $app = $response.Headers['X-Preview-App']; $serverOwner = $response.Headers['X-Preview-Pid'] }
} finally { if ($response) { $response.Close() } }
$owners = @($listeners.Owner | Select-Object -Unique)
foreach ($owner in $owners) {
    $processInfo = Get-Process -Id $owner -ErrorAction Stop
    if ($app -ne 'galactic-three-hud-preview' -or $serverOwner -ne [string]$owner -or $processInfo.ProcessName -ne 'node') {
        throw 'Port 8390 belongs to another service. No process was stopped.'
    }
}
foreach ($owner in $owners) { Stop-Process -Id $owner -ErrorAction Stop }
Write-Output "Stopped the three HUD preview server (PID $($owners -join ', '))."
