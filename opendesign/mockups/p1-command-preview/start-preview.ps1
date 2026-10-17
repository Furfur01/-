$ErrorActionPreference = 'Stop'
$previewFolder = $PSScriptRoot
$previewUrl = 'http://127.0.0.1:8390/opendesign/mockups/p1-command-preview/index.html'
try {
  $previewHealth = Invoke-RestMethod -Uri 'http://127.0.0.1:8390/preview-health' -TimeoutSec 2
  if ($previewHealth.service -eq 'p1-independent-preview') { Write-Output $previewUrl; exit 0 }
} catch {}
if (Get-NetTCPConnection -LocalPort 8390 -State Listen -ErrorAction SilentlyContinue) { throw '8390 is occupied. No existing process was stopped. Stop its preview service before starting P1.' }
$previewNode = (Get-Command node -ErrorAction Stop).Source
$previewServer = Join-Path $previewFolder 'serve.mjs'
$previewProcess = Start-Process -FilePath $previewNode -ArgumentList ('"' + $previewServer + '"') -WorkingDirectory $previewFolder -WindowStyle Hidden -RedirectStandardOutput (Join-Path $previewFolder 'preview-server.log') -RedirectStandardError (Join-Path $previewFolder 'preview-server-error.log') -PassThru
Start-Sleep -Milliseconds 500
$previewProcess.Refresh()
if ($previewProcess.HasExited) { throw 'Preview did not start. See preview-server-error.log.' }
$previewProcess.Id | Set-Content -LiteralPath (Join-Path $previewFolder 'preview-server.pid')
Write-Output $previewUrl
