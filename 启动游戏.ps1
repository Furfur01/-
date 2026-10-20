param([switch]$SmokeTest, [switch]$LifecycleTest, [switch]$RestartTest, [int]$TestPort = 0, [string]$TestSaveFile = '', [string]$TestScreenshot = '')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Net.Http
[System.Windows.Forms.Application]::EnableVisualStyles()
$gameRoot = $PSScriptRoot
$port = 8289
if ($TestPort -or $LifecycleTest -or $RestartTest) {
    if ($TestPort -le 0 -or $TestPort -in @(8289,8390) -or -not $TestSaveFile -or [IO.Path]::GetFullPath($TestSaveFile) -eq (Join-Path $gameRoot 'data\universe.json')) { throw '测试必须使用独立端口和独立存档' }
    $port = $TestPort
}
if ($RestartTest -and -not $LifecycleTest) { throw 'RestartTest 必须与 LifecycleTest 一起使用' }
if ($LifecycleTest -or $SmokeTest) { [Console]::OutputEncoding = New-Object Text.UTF8Encoding($false) }
$gameUrl = 'http://127.0.0.1:' + $port + '/'
$handler = New-Object System.Net.Http.HttpClientHandler
$handler.UseProxy = $false
$client = New-Object System.Net.Http.HttpClient($handler)
$client.Timeout = [TimeSpan]::FromSeconds(3)
$client.DefaultRequestHeaders.Add('Origin',$gameUrl.TrimEnd('/'))
$client.DefaultRequestHeaders.Add('X-Empire-Client','galactic-command')
$script:pollTask = $null
$script:pollKind = 'health'
$script:nextPoll = [DateTime]::MinValue
$script:serverProcess = $null
$script:startingAt = $null
$script:readySeen = $false
$script:accountSignature = ''
$script:currentAccount = ''
$script:lastState = 'checking'
$script:failure = ''
$script:restartPhase = ''
$script:restartAt = $null
$script:restartProcess = $null
$script:restartSucceeded = $false
$script:serverStatus = $null

$form = New-Object System.Windows.Forms.Form
$form.Text = '银河帝国 · 后台监控'
$form.ClientSize = New-Object System.Drawing.Size(780,680)
$form.StartPosition = 'CenterScreen'
$form.FormBorderStyle = 'FixedSingle'
$form.MaximizeBox = $false
$form.BackColor = [System.Drawing.Color]::FromArgb(16,24,38)
$form.ForeColor = [System.Drawing.Color]::FromArgb(230,237,247)
$form.Font = New-Object System.Drawing.Font('Microsoft YaHei UI',10)
function Add-Label($text,$x,$y,$width,$height,$size) {
    $label = New-Object System.Windows.Forms.Label
    $label.Text = $text
    $label.SetBounds($x,$y,$width,$height)
    $label.Font = New-Object System.Drawing.Font('Microsoft YaHei UI',$size)
    $form.Controls.Add($label)
    return $label
}
function Add-Button($text,$x,$y,$width) {
    $button = New-Object System.Windows.Forms.Button
    $button.Text = $text
    $button.SetBounds($x,$y,$width,42)
    $button.FlatStyle = 'Flat'
    $button.BackColor = [System.Drawing.Color]::FromArgb(32,47,67)
    $button.Cursor = [System.Windows.Forms.Cursors]::Hand
    $form.Controls.Add($button)
    return $button
}
$null = Add-Label '银河帝国 / 后台监控' 28 20 720 44 23
$null = Add-Label '独立监控窗口 · 关闭窗口后，后台继续运行' 30 68 720 28 10
$statusLabel = Add-Label '●  正在检查后台…' 30 112 720 34 16
$detailLabel = Add-Label $gameUrl 30 153 720 68 10
$startButton = Add-Button '启动后台' 30 230 120
$restartButton = Add-Button '重启后台' 162 230 120
$stopButton = Add-Button '保存并关闭后台' 294 230 168
$enterButton = Add-Button '进入游戏' 474 230 120
$logButton = Add-Button '打开日志文件' 606 230 144
$startButton.Enabled = $false
$restartButton.Enabled = $false
$stopButton.Enabled = $false
$null = Add-Label '游戏账号' 30 292 110 28 11
$accountBox = New-Object System.Windows.Forms.ComboBox
$accountBox.SetBounds(142,288,410,32)
$accountBox.DropDownStyle = 'DropDownList'
$accountBox.DisplayMember = 'Label'
$form.Controls.Add($accountBox)
$switchButton = Add-Button '切换账号' 572 283 178
$accountLabel = Add-Label '正在读取账号…' 30 334 720 28 10
$null = Add-Label '后台日志 · 自动刷新' 30 375 720 26 11
$logBox = New-Object System.Windows.Forms.TextBox
$logBox.SetBounds(30,408,720,210)
$logBox.Multiline = $true
$logBox.ReadOnly = $true
$logBox.ScrollBars = 'Vertical'
$logBox.BackColor = [System.Drawing.Color]::FromArgb(10,17,28)
$logBox.ForeColor = [System.Drawing.Color]::FromArgb(190,208,224)
$logBox.Font = New-Object System.Drawing.Font('Microsoft YaHei UI',9)
$form.Controls.Add($logBox)
$noticeLabel = Add-Label '每秒刷新；重启会先保存进度，关闭窗口不影响后台运行。' 30 636 720 26 9
$script:logFile = Join-Path $gameRoot 'output\galactic-command\server.log'
if ($TestSaveFile) { $script:logFile = $TestSaveFile + '.log' }

function Set-Unavailable($state,$message) {
    $script:lastState = $state
    $startButton.Enabled = $state -eq 'stopped' -and -not $script:startingAt -and -not $script:restartPhase
    $restartButton.Enabled = $false
    $stopButton.Enabled = $false
    $enterButton.Enabled = $state -eq 'legacy'
    $switchButton.Enabled = $false
    $accountBox.Enabled = $false
    $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(255,200,110)
    $statusLabel.Text = if ($script:restartPhase -eq 'stopping') { '●  正在重启：已保存，等待后台退出…' } elseif ($script:startingAt) { '●  正在启动后台…' } else { $message }
    $detailLabel.Text = $gameUrl + "`r`n" + $(if ($script:failure) { $script:failure } else { '监控窗口会继续检查后台状态。' })
    $accountLabel.Text = '后台就绪后可查看和切换账号。'
}
function Apply-Status($data) {
    $script:serverStatus = $data
    # A queued response from the old process must not re-enable the controls.
    if ($script:restartPhase -eq 'stopping' -or $data.status -ne 'running') {
        Set-Unavailable 'stopping' '●  已保存，正在关闭后台…'
        return
    }
    if ($script:restartPhase -eq 'starting') {
        if ($data.pid -ne $script:serverProcess.Id) {
            End-Restart '重启未完成：端口已由另一后台接管，请检查日志。'
        } else {
            $script:restartSucceeded = $true
            End-Restart
            $noticeLabel.Text = '后台已重启，刷新游戏页面即可载入更新。'
        }
    }
    $script:lastState = $data.status
    $script:readySeen = $true
    $script:startingAt = $null
    $script:failure = ''
    $statusLabel.Text = '●  后台正在运行'
    $statusLabel.ForeColor = [System.Drawing.Color]::LightGreen
    $mode = if ($data.managed) { '旧版绑定模式' } else { '独立运行' }
    $saved = if ($data.lastSavedAt) { ([DateTime]::Parse($data.lastSavedAt)).ToLocalTime().ToString('HH:mm:ss') } else { '等待首次保存' }
    $detailLabel.Text = ('PID {0}   |   运行 {1}   |   {2}   |   最近保存 {3}' -f $data.pid,[TimeSpan]::FromSeconds($data.uptime),$mode,$saved) + "`r`n" + $gameUrl + "`r`n存档：" + $data.saveFile
    $startButton.Enabled = $false
    $stopButton.Enabled = $true
    $restartButton.Enabled = $true
    $enterButton.Enabled = $true
    $accountBox.Enabled = @($data.accounts).Count -gt 0
    $script:logFile = $data.logFile
    $signature = ConvertTo-Json -InputObject @($data.accounts) -Compress
    if ($signature -ne $script:accountSignature -or $script:currentAccount -ne $data.currentAccount) {
        $selectedKey = if ($accountBox.SelectedItem) { $accountBox.SelectedItem.Key } else { '' }
        if ($script:currentAccount -ne $data.currentAccount) { $selectedKey = $data.currentAccount }
        $accountBox.Items.Clear()
        foreach ($account in $data.accounts) {
            $item = [PSCustomObject]@{ Key=$account.key; Label=($account.name + ' · ' + $account.key.Substring(0,8)) }
            $index = $accountBox.Items.Add($item)
            if ($account.key -eq $selectedKey) { $accountBox.SelectedIndex = $index }
        }
        if ($accountBox.SelectedIndex -lt 0 -and $accountBox.Items.Count -gt 0) { $accountBox.SelectedIndex = 0 }
        $script:accountSignature = $signature
        $script:currentAccount = $data.currentAccount
    }
    $current = @($data.accounts | Where-Object { $_.key -eq $data.currentAccount })
    $accountLabel.Text = if ($current.Count) { '当前账号：' + $current[0].name + '。切换后游戏页面会自动同步。' } else { '尚未选择账号；可选择已有账号，或进入游戏创建首个账号。' }
    $switchButton.Enabled = $null -ne $accountBox.SelectedItem -and $accountBox.SelectedItem.Key -ne $script:currentAccount
    $logs = ([string]$data.log).Replace("`r`n","`n").Replace("`n","`r`n")
    if ($logBox.Text -ne $logs) { $logBox.Text = $logs; $logBox.SelectionStart = $logBox.TextLength; $logBox.ScrollToCaret() }
}
function Poll-Status {
    # HttpClient buffers responses off the UI thread; the timer only consumes completed tasks.
    if ($script:pollTask) {
        if (-not $script:pollTask.IsCompleted) { return }
        $completedTask = $script:pollTask
        $response = $null
        try {
            $response = $script:pollTask.GetAwaiter().GetResult()
            if ($script:pollKind -eq 'health' -and -not $response.IsSuccessStatusCode) {
                $script:failure = '端口 ' + $port + ' 上的服务不是游戏后台。请关闭占用它的服务；独立界面预览应使用 8390 端口。'
                Set-Unavailable 'conflict' '●  游戏端口被其他服务占用'
                return
            }
            if (-not $response.IsSuccessStatusCode) { throw '后台监控接口不可用' }
            try { $data = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult() | ConvertFrom-Json }
            catch {
                if ($script:pollKind -ne 'health') { throw }
                $script:failure = '端口 ' + $port + ' 未返回游戏状态，请检查占用该端口的服务。'
                Set-Unavailable 'conflict' '●  游戏端口被其他服务占用'
                return
            }
            if ($data.service -ne 'galaxy-empire') { Set-Unavailable 'conflict' '●  端口被其他服务占用'; return }
            if ($script:pollKind -eq 'health') {
                if (-not $data.monitorVersion) { Set-Unavailable 'legacy' '●  旧版后台运行中，请关闭旧启动器后启动新版'; return }
                $script:pollKind = 'status'
                $script:pollTask = $client.GetAsync($gameUrl + 'api/launcher/status')
                return
            }
            Apply-Status $data
        } catch {
            $cause = $_.Exception
            while ($cause.InnerException) { $cause = $cause.InnerException }
            if ($cause -is [System.Net.Sockets.SocketException] -and $cause.SocketErrorCode -eq [System.Net.Sockets.SocketError]::ConnectionRefused) {
                Set-Unavailable 'stopped' '●  后台未运行'
            } else { Set-Unavailable 'unavailable' '●  后台无响应或接口不可用' }
        } finally {
            if ($response) { $response.Dispose() }
            if ([object]::ReferenceEquals($script:pollTask,$completedTask)) {
                $script:pollTask = $null
                $script:pollKind = 'health'
                $script:nextPoll = [DateTime]::UtcNow.AddSeconds(1)
            }
        }
    }
    if ($script:startingAt -and ([DateTime]::UtcNow - $script:startingAt).TotalSeconds -gt 15) {
        $script:startingAt = $null
        $script:failure = '启动未完成，请查看日志。'
        $noticeLabel.Text = $script:failure
        if ($script:restartPhase) { End-Restart '重启后启动未完成，请查看日志；确认后台已停止后可点击“启动后台”重试。' }
    }
    if (-not $script:pollTask -and [DateTime]::UtcNow -ge $script:nextPoll) {
        $script:pollKind = 'health'
        $script:pollTask = $client.GetAsync($gameUrl + 'api/health')
    }
}
function Start-GameServer {
    if ($script:lastState -ne 'stopped' -or $script:startingAt) { return }
    try {
        $info = New-Object System.Diagnostics.ProcessStartInfo
        $info.FileName = (Get-Command node -ErrorAction Stop).Source
        $info.Arguments = '"' + (Join-Path $gameRoot 'server.mjs') + '"'
        $info.WorkingDirectory = $gameRoot
        $info.UseShellExecute = $false
        $info.CreateNoWindow = $true
        foreach ($key in @('EMPIRE_SAVE_FILE','EMPIRE_SESSION_FILE','EMPIRE_BATTLE_TRIAL','EMPIRE_MANAGED_STDIN')) { $info.EnvironmentVariables.Remove($key) }
        $info.EnvironmentVariables['PORT'] = [string]$port
        $info.EnvironmentVariables['EMPIRE_SERVER_LOG'] = $script:logFile
        if ($TestSaveFile) {
            $info.EnvironmentVariables['EMPIRE_SAVE_FILE'] = $TestSaveFile
            $info.EnvironmentVariables['EMPIRE_SESSION_FILE'] = $TestSaveFile + '.session'
        }
        if ($script:serverProcess) { $script:serverProcess.Dispose() }
        $script:serverProcess = [System.Diagnostics.Process]::Start($info)
        $script:startingAt = [DateTime]::UtcNow
        $script:failure = ''
        $startButton.Enabled = $false
        $statusLabel.Text = '●  正在启动后台…'
        $noticeLabel.Text = '正在启动独立后台，关闭监控窗口不会中断它。'
        $script:nextPoll = [DateTime]::MinValue
    } catch {
        $noticeLabel.Text = '启动失败：' + $_.Exception.Message
        if ($script:restartPhase) { End-Restart ('重启后' + $noticeLabel.Text + '；可点击“启动后台”重试。') }
    }
}
function End-Restart([string]$message = '') {
    $script:restartPhase = ''
    $script:restartAt = $null
    if ($script:restartProcess) { $script:restartProcess.Dispose(); $script:restartProcess = $null }
    if ($message) { $script:failure = $message; $noticeLabel.Text = $message }
}
function Restart-GameServer {
    if ($script:lastState -ne 'running' -or $script:restartPhase -or $script:startingAt) { return }
    # Reuse the Start button's settings, without replacing a custom universe.
    $expectedSave = if ($TestSaveFile) { $TestSaveFile } else { Join-Path $gameRoot 'data\universe.json' }
    if ([IO.Path]::GetFullPath($script:serverStatus.saveFile) -ne [IO.Path]::GetFullPath($expectedSave)) {
        $noticeLabel.Text = '此后台使用自定义存档，请保存关闭后按原启动方式重启。'
        return
    }
    try {
        $script:restartProcess = [System.Diagnostics.Process]::GetProcessById($script:serverStatus.pid)
        $null = $script:restartProcess.Handle # Keep the original process identity until it exits.
    }
    catch { $noticeLabel.Text = '后台进程已变化，请等待状态刷新后重试。'; return }
    $script:restartSucceeded = $false
    $script:restartPhase = 'stopping'
    $script:restartAt = [DateTime]::UtcNow
    Set-Unavailable 'stopping' '●  正在保存并重启后台…'
    $statusLabel.Text = '●  正在保存并重启后台…'
    if (-not (Invoke-Control 'api/launcher/stop' '{}')) {
        End-Restart ('重启未完成：' + $noticeLabel.Text + '；未启动新后台。')
        return
    }
    $noticeLabel.Text = '进度已保存；等待原后台完全退出后自动启动，请稍候。'
}
function Continue-Restart {
    if ($script:restartPhase -ne 'stopping') { return }
    if ($script:lastState -eq 'stopped' -and $script:restartProcess.HasExited) {
        $script:restartPhase = 'starting'
        Start-GameServer
    } elseif (([DateTime]::UtcNow - $script:restartAt).TotalSeconds -gt 15) {
        End-Restart '重启未完成：原后台尚未退出或端口不可用；未强制终止进程，请查看日志后重试。'
    }
}
function Invoke-Control($route,$body) {
    $content = New-Object System.Net.Http.StringContent($body,[Text.Encoding]::UTF8,'application/json')
    $response = $null
    try {
        $response = $client.PostAsync($gameUrl + $route,$content).GetAwaiter().GetResult()
        $result = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult() | ConvertFrom-Json
        if (-not $response.IsSuccessStatusCode) { throw $result.error }
        $script:nextPoll = [DateTime]::MinValue
        return $true
    } catch { $noticeLabel.Text = '操作未完成：' + $_.Exception.Message; return $false }
    finally { $content.Dispose(); if ($response) { $response.Dispose() } }
}
$startButton.Add_Click({ Start-GameServer })
$restartButton.Add_Click({ Restart-GameServer })
$stopButton.Add_Click({
    if (Invoke-Control 'api/launcher/stop' '{}') {
        $script:startingAt = $null
        $script:failure = ''
        Set-Unavailable 'stopping' '●  已保存，正在关闭后台…'
        $noticeLabel.Text = '进度已保存，监控窗口将保持打开。'
    }
})
$enterButton.Add_Click({ Start-Process $gameUrl })
$accountBox.Add_SelectedIndexChanged({ $switchButton.Enabled = $script:lastState -eq 'running' -and $null -ne $accountBox.SelectedItem -and $accountBox.SelectedItem.Key -ne $script:currentAccount })
$switchButton.Add_Click({
    if ($accountBox.SelectedItem -and (Invoke-Control 'api/launcher/account' (ConvertTo-Json @{key=$accountBox.SelectedItem.Key} -Compress))) { $noticeLabel.Text = '账号已切换，游戏页面将在下一次刷新时同步。' }
})
$logButton.Add_Click({
    if (Test-Path -LiteralPath $script:logFile) { Start-Process notepad.exe -ArgumentList ('"' + $script:logFile + '"') }
    else { $noticeLabel.Text = '暂无后台日志。首次启动后会自动生成。' }
})
$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 200
$timer.Add_Tick({
    Poll-Status
    Continue-Restart
    if ($LifecycleTest) {
        if ($script:lastState -eq 'stopped' -and -not $script:readySeen -and -not $script:startingAt) { Start-GameServer }
        if ($RestartTest -and $script:readySeen -and -not $script:testRestartSent) {
            $script:testRestartSent = $true
            $restartButton.PerformClick()
            if ($script:restartPhase) {
                $restartButton.PerformClick() # Disabled: no duplicate stop request.
                $form.Close() # Must not cancel the pending startup.
            }
        }
        $done = if ($RestartTest) { $script:testRestartSent -and -not $script:restartPhase } else { $script:readySeen }
        if ($done -or ([DateTime]::UtcNow - $script:testStarted).TotalSeconds -gt 40) {
            if ($TestScreenshot) {
                $bitmap = New-Object System.Drawing.Bitmap($form.Width,$form.Height)
                try { $form.DrawToBitmap($bitmap,(New-Object Drawing.Rectangle(0,0,$form.Width,$form.Height))); $bitmap.Save($TestScreenshot) } finally { $bitmap.Dispose() }
            }
            $script:testResult = $noticeLabel.Text
            End-Restart
            $form.Close()
        }
    }
})
$form.Add_Shown({
    $script:testStarted = [DateTime]::UtcNow

    Poll-Status
    $timer.Start()
})
$form.Add_FormClosing({
    if ($script:restartPhase) { $_.Cancel = $true; $noticeLabel.Text = '正在重启后台，请完成后再关闭监控窗口。' }
})
$form.Add_FormClosed({ $timer.Stop(); $timer.Dispose(); $client.Dispose(); if ($script:serverProcess) { $script:serverProcess.Dispose() }; End-Restart })
if ($SmokeTest) { Write-Output 'Monitor UI OK'; $form.Dispose(); $client.Dispose(); exit 0 }
$mutex = New-Object System.Threading.Mutex($false,('Local\GalaxyEmpireLauncher-' + $port))
$ownsMutex = $false
try {
    try { $ownsMutex = $mutex.WaitOne(0) } catch [System.Threading.AbandonedMutexException] { $ownsMutex = $true }
    if (-not $ownsMutex) {
        $shell = New-Object -ComObject WScript.Shell
        $null = $shell.AppActivate('银河帝国 · 后台监控')
        exit 0
    }
    [System.Windows.Forms.Application]::Run($form)
    if ($LifecycleTest) {
        if (-not $script:readySeen) { throw '独立监控启动测试失败' }
        if ($RestartTest -and -not $script:restartSucceeded) { throw ('重启测试未完成：' + $script:testResult) }
        if ($RestartTest) { Write-Output 'Restart OK: saved, old process exited, replacement ready; repeated click and close guarded' }
        Write-Output 'Lifecycle OK: monitor closed; independent server remains running'
    }
} finally {
    if ($ownsMutex) { $mutex.ReleaseMutex() }
    $mutex.Dispose()
}
