# Three.js 正式战场与原版归档

自 2026-10-15 起，Three.js 是正式战场、驾驶、回放和独立靶场的默认版本；原生 WebGL 版冻结归档，保留显式对照入口。舰体、炮口与喷口、武器配置、服务端模拟和回放协议沿用现有实现。Three.js 中的死星仅保留基础舰体；专用地表与壕沟演练继续使用归档版。

## 使用

```powershell
npm run build:command
npm run preview:three
```

启动器建立独立的双方各 500 艘测试存档，打印服务器地址、新旧战场与靶场链接，并将进程 PID 保存到 links.json。新旧战场链接先自动建立该隔离服务的本地会话，因此首次打开也能进入同一场千舰战斗。正式存档不参与此演练。主界面战场列表中的“战场版本”默认选择“Three.js（正式版）”；可显式选择“原版 WebGL（已归档，仅供对照）”，对下一次进入战场或回放生效。

- `battlefield-three.html?battle=ID`：正式战斗或隔离演练，支持观战与接管。
- `battlefield-three.html?replay=ID`：只读回放，支持暂停、倍速、跳转。
- `hangar-three.html?ship=Dreadnought`：独立靶场，不请求战斗 API。
- `legacy-webgl/battlefield.html`、`legacy-webgl/hangar.html`：冻结的原版战场、回放和靶场入口。
- `legacy-webgl/hangar.html?map=death-star`：未迁移的死星专用场景。

各入口均位于 `/opendesign/mockups/galactic-command/`。新版需要 WebGL2；初始化或绘制失败会显示原因及原版链接，不会在背景中悄悄更换渲染器。

该目录下旧的 `battlefield.html` 和 `hangar.html` 现在是兼容入口，分别转向 `battlefield-three.html` 和 `hangar-three.html`，原样保留查询参数和 URL 片段，包括 `battle`、`replay`、`ship`。若查询参数为 `map=death-star`，则转向对应的 `legacy-webgl/` 页面。已保存的旧链接仍可使用；要固定使用原版，应保存显式归档地址。

## 源码组织与资源边界

新版源码位于 `scripts/three-flight/`，以静态 ES 模块构建。`page.html` 是独立页面模板，`entry.js` 加载资源并启动运行时。新构建仅替换模板的模式、标题与资源版本标记，不从旧 HTML 中抽取或改写执行代码。

`runtime.js` 负责共享 UI、输入、镜头和练习模拟；`controller.js` 接入真实快照、SSE、驾驶控制和历史回放；`presentation.js` 管理事件产生的视觉表现。`lifecycle.js` 管理页面所属的事件监听、计时器与动画回调，`timeline.js` 管理事件序号与回放定位。

`renderer.js` 保留原来的场景、舰体、关节、护盾、驾驶舱和特效计算。`backend.js` 通过 Three.js 管理着色材质、共享几何、实例批次、动态特效缓冲、屏幕投影和 GPU 提交，不使用原生 WebGL 绘制调用。完整模型只用于近景及驾驶舰，中远景沿用原有预算进行实例化；实例批次保存舰船 ID 与槽位的双向映射。

模型生成仍以既有 `createShipModel()` 为唯一源。构建时输出现有 13 浮点顶点布局与关节/喷口配置，转换方向一次；新版 `three-flight-assets/` 保存本次构建自己的模型资产。图鉴通过 `shared-models.js` 缓存原始模型几何，实例独立持有可变材质。武器样式与图鉴演示移到 `shared-weapon-preview.js`，原文件保留稳定的转导出入口；同一武器配置进入战场构建，材质和几何辅助在 `shared-resources.js` 共用。

渲染器以 `begin()` → 场景绘制 → `endFrame()` 提交一帧，并提供 `resize()`、`project()`、`ray()`、`getStats()`、`dispose()`。控制器不向渲染器授予伤害结算权限。页面退出或失败时释放当前接管，关闭 SSE 和输入定时器、清理监听和 RAF，并释放渲染资源。

## 原版冻结

`scripts/freeze-webgl-baseline.mjs` 首次冻结当前原版脚本、页面、二进制模型及星空。仅为独立目录调整资源路径和返回图鉴链接；清单同时记录原文件和冻结文件哈希。之后所有构建验证冻结文件，不自动更新基线。冻结目录为 `opendesign/mockups/galactic-command/legacy-webgl/`，清单为该目录的 `manifest.json`，版本号为 `webgl-before-three-20261015`。本次默认入口切换不改变冻结版本或清单中的资源哈希。

`npm run build:command` 最终调用 `scripts/build-three-flight.mjs` 生成正式页面和旧 URL 的兼容转向页。构建中保留的原生资源生成步骤服务于既有资源与工具；根目录旧 URL 不再作为原生战场入口，新版也不加载这些原生脚本。修改新版无需修改原版 HTML 拼接脚本。模型或规则变动后的性能比较，应明确说明是否仍与旧模型版本具有可比性，不能覆盖冻结清单来掩盖差异。归档用途及恢复显式入口见 [原版 WebGL 归档说明](legacy-webgl-archive.md)。

## 验收

```powershell
npm run test:three
npm run test:three:browser
npm run bench:three
node tests/three-battle-comparison.mjs --quick
node tests/three-battle-comparison.mjs --with-stress
```

固定回放使用现有每方 500 艘预设和种子 42。两个渲染器顺序运行，四种视角各预热 10 秒、采样 30 秒、三轮交替顺序，1080p、DPR 1。样本、事件随机种子和镜头路径相同；固定画质对比禁用自动降级，并附加自动画质体验记录。原始指标、截图和性能判定保存在 `output/playwright/three-battle-comparison/`。

验收要求所有三轮完成、新版平均 FPS 中位数不低于原版 95%、P95 帧时不超过原版 110%、最低一秒 FPS 不低于 30，并保持全部存活舰船的显示身份。快速测试仅用于排错，不作为性能通过依据。回归测试单独验证真实接管、武器输入、重连、隐藏页面释放、只读回放和反复退出的资源清理。

## 完整战斗与视频复跑

`scripts/build-three-battle-video-fixture.mjs` 使用原服务端规则，将种子 42 的千舰样本推进到正式终局并结算。它验证前 80 秒与性能验收样本完全连续，不修改正式存档。`scripts/build-three-battle-special-fixture.mjs` 另存 10 舰特殊武器样本，不能计入千舰性能结果。

```powershell
node --max-old-space-size=4096 scripts/build-three-battle-video-fixture.mjs
node scripts/build-three-battle-special-fixture.mjs
$videoFfmpeg = 'output/playwright/three-battle-video-tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
node scripts/record-three-battle.mjs --engine three --view overview --fixture output/playwright/three-battle-video/fixture-complete.json --full --warm 0 --ffmpeg $videoFfmpeg --out output/playwright/video-rerun/full
node scripts/record-three-battle-suite.mjs --out output/playwright/video-rerun --ffmpeg $videoFfmpeg
node scripts/record-three-practice.mjs --engine both --view follow --duration 10 --warm 2 --fire-at 1 --ffmpeg $videoFfmpeg --out output/playwright/video-rerun/practice
```

每次使用新的输出目录，脚本拒绝覆盖已有录像清单。完整 FFmpeg 用于解码同步标记和输出 H.264，不能使用只支持 Playwright 录屏编码的裁剪版替代；也可以通过 `--ffmpeg` 指定其他完整安装。以上命令依次执行，录制时不并行运行另一份基准或转码。

录像包含可见 FPS 面板，实际编码为 25 fps，面板显示的是游戏渲染帧率。每份 manifest 保存逐帧渲染指标、每秒 CPU/内存/GPU 采样、浏览器错误和绿色/紫色同步标记。录屏会增加负载，因此录屏结果与前面的无录屏验收分开。CPU 是本次浏览器进程组（不含外部编码器）；工作集可能重复计算共享页；GPU 利用率和显存是整卡数据，包含其他应用。

`scripts/assemble-three-battle-videos.mjs` 可接收多个 `--manifest`，输出独立 1920×1080 MP4 和原版在左、新版在右的 3840×1080 对照。只接受实际解码确认的同步时间，不缩放、不改变速度；靶场保留各自的原模拟帧间隔，并单独报告发射阶段的时间偏移。`scripts/report-three-battle-videos.mjs` 汇总 `--assembly` 清单，生成播放器页面、指标和报告。用 `npm run preview:three:videos` 打开支持视频拖动定位的本地页面。

`npm run preview:three` 的正式版与归档版试玩入口共用当前隔离战斗；若上一场已结束，入口会按同一预设自动创建新的千舰试玩。正式默认入口为 Three.js，原版对照始终使用显式 `legacy-webgl/` 地址。

录制完成后，可按以下方式编码并生成可播放报告（继续使用上文的新目录）：

```powershell
node scripts/assemble-three-battle-videos.mjs --manifest output/playwright/video-rerun/full/recording-manifest.json --single --ffmpeg $videoFfmpeg --out output/playwright/video-rerun/deliverables/full
$pairArgs = @('scripts/assemble-three-battle-videos.mjs', '--pairs-only', '--ffmpeg', $videoFfmpeg, '--out', 'output/playwright/video-rerun/deliverables/comparisons')
foreach ($clip in @('views','shells','reaper','missiles','annihilator','special-reaper')) { $pairArgs += @('--manifest', "output/playwright/video-rerun/$clip/recording-manifest.json") }
$pairArgs += @('--manifest', 'output/playwright/video-rerun/practice/practice-recording-manifest.json')
node @pairArgs
node scripts/report-three-battle-videos.mjs --assembly output/playwright/video-rerun/deliverables/full/assembly-manifest.json --assembly output/playwright/video-rerun/deliverables/comparisons/assembly-manifest.json --out output/playwright/video-rerun/deliverables
node scripts/preview-three-battle-videos.mjs --root output/playwright/video-rerun/deliverables --port 8292
node tests/three-battle-video-playback.mjs --url http://127.0.0.1:8292/ --out output/playwright/video-rerun/playback
```

重新生成的报告默认将画面核验标为待审核；只有实际检查截图后，才通过 `--visual-qa` 传入新的核验记录。`scripts/extract-three-battle-video-frames.mjs --assembly 清单路径 --out 新截图目录` 可从交付 MP4 提取带哈希的检查帧。同期视频只对齐录制起点，不保证中间每帧的粒子年龄严格相同；湮灭之星等快速变化效果应另用固定年龄截图核验。

`node scripts/verify-three-special-fixed-age.mjs` 可复跑湮灭之星的五组固定年龄、相机和着色时间对照，默认输出到新的时间戳目录。像素比较需要 Python 的 Pillow 和 NumPy；可用 `--python` 指定已有运行环境。

本次交付位于 `output/playwright/three-battle-video/deliverables/`，包含 600 秒完整战斗、10 段并排对照、`report.md`、`metrics.json` 和 `evidence/`。完整验收与最终 HUD 补丁的版本边界见 `output/playwright/three-battle-acceptance.md`。
