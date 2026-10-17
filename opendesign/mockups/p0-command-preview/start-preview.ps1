$ErrorActionPreference = 'Stop'
$previewFolder = $PSScriptRoot
$previewNode = (Get-Command node -ErrorAction Stop).Source
$previewServer = Join-Path $previewFolder 'serve.mjs'
$previewUrl = 'http://127.0.0.1:8390/opendesign/mockups/p0-command-preview/index.html'
try {
  $previewResponse = Invoke-WebRequest -UseBasicParsing -Uri $previewUrl -TimeoutSec 2
  if ($previewResponse.StatusCode -eq 200 -and $previewResponse.Content -match 'preview\.js') {
    Write-Output ('Preview already available: ' + $previewUrl)
    exit 0
  }
} catch {}
if (Get-NetTCPConnection -LocalPort 8390 -State Listen -ErrorAction SilentlyContinue) {
  throw 'Port 8390 is occupied. The preview launcher will not stop another service.'
}
$previewProcess = Start-Process -FilePath $previewNode -ArgumentList ('"' + $previewServer + '"') -WorkingDirectory $previewFolder -WindowStyle Hidden -RedirectStandardOutput (Join-Path $previewFolder 'preview-server.log') -RedirectStandardError (Join-Path $previewFolder 'preview-server-error.log') -PassThru
Start-Sleep -Milliseconds 500
$previewProcess.Refresh()
if ($previewProcess.HasExited) { throw 'Independent preview did not start. See preview-server-error.log.' }
$previewProcess.Id | Set-Content -LiteralPath (Join-Path $previewFolder 'preview-server.pid')
Write-Output ('Preview PID: ' + $previewProcess.Id)
Write-Output $previewUrl
