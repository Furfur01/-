$ErrorActionPreference = 'Stop'
$previewPidFile = Join-Path $PSScriptRoot 'preview-server.pid'
if (-not (Test-Path -LiteralPath $previewPidFile)) { Write-Output 'No P1 preview PID file.'; exit 0 }
$previewPid = [int](Get-Content -LiteralPath $previewPidFile -Raw).Trim()
$previewProcess = Get-CimInstance Win32_Process -Filter "ProcessId=$previewPid" -ErrorAction SilentlyContinue
if (-not $previewProcess) { Write-Output 'P1 preview already stopped.'; exit 0 }
$previewServer = Join-Path $PSScriptRoot 'serve.mjs'
if ($previewProcess.Name -ne 'node.exe' -or -not $previewProcess.CommandLine.Contains($previewServer)) { throw 'PID belongs to another process. No process was stopped.' }
Stop-Process -Id $previewPid
Write-Output 'P1 preview stopped.'
