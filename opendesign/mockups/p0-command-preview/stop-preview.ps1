$ErrorActionPreference = 'Stop'
$previewPidFile = Join-Path $PSScriptRoot 'preview-server.pid'
if (-not (Test-Path -LiteralPath $previewPidFile)) { Write-Output 'No independent preview PID file.'; exit 0 }
$previewPid = [int](Get-Content -LiteralPath $previewPidFile -Raw).Trim()
$previewProcess = Get-CimInstance Win32_Process -Filter "ProcessId=$previewPid" -ErrorAction SilentlyContinue
$previewServer = Join-Path $PSScriptRoot 'serve.mjs'
if (-not $previewProcess) { Write-Output 'Independent preview is already stopped.'; exit 0 }
if ($previewProcess.Name -ne 'node.exe' -or -not $previewProcess.CommandLine.Contains($previewServer)) {
  throw 'PID no longer belongs to this independent preview. No process was stopped.'
}
Stop-Process -Id $previewPid
Write-Output 'Independent preview stopped.'
