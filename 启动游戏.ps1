$ErrorActionPreference = 'Stop'
$gameRoot = $PSScriptRoot
$gameUrl = 'http://127.0.0.1:8289/'
Set-Location -LiteralPath $gameRoot

function Test-GameServer {
    try {
        $catalog = Invoke-RestMethod -Uri ($gameUrl + 'api/catalog') -TimeoutSec 2
        return ($null -ne $catalog.units.Death_Star -and $null -ne $catalog.buildings.Command_Center)
    } catch {
        return $false
    }
}

if (-not (Test-GameServer)) {
    if (Get-NetTCPConnection -LocalPort 8289 -State Listen -ErrorAction SilentlyContinue) {
        throw '8289 端口正被其他程序占用。'
    }
    $node = (Get-Command node -ErrorAction Stop).Source
    if (-not (Test-Path -LiteralPath (Join-Path $gameRoot 'node_modules/esbuild'))) {
        throw '请先在项目目录运行 npm install。'
    }
    & $node 'scripts/build-command.mjs'
    if ($LASTEXITCODE -ne 0) { throw '构建失败。' }
    $dataPath = Join-Path $gameRoot 'data'
    New-Item -ItemType Directory -Force -Path $dataPath | Out-Null
    Start-Process -FilePath $node -ArgumentList 'server.mjs' -WorkingDirectory $gameRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $dataPath 'server.log') -RedirectStandardError (Join-Path $dataPath 'server-error.log')
    for ($attempt = 0; $attempt -lt 15; $attempt++) {
        if (Test-GameServer) { break }
        Start-Sleep -Milliseconds 500
    }
    if (-not (Test-GameServer)) { throw '服务未能启动，请查看 data/server-error.log。' }
}

Start-Process $gameUrl
