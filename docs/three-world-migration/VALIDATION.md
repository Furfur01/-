# 验收记录

本文保留 2026-10-17 迁移时的测量和问题记录。文中的独立测试脚本及 `test:world` 等命令已于 2026-10-20 清理，不再作为当前入口；当前检查范围与发行证据见 `tests/README.md`、`docs/releases/PREPARATION.md`。

日期：2026-10-17。所有浏览器与接口测试都使用独立随机端口、临时存档、临时会话与明确测试账号；退出在 finally 清理。正式 8289 服务、正式存档和 8390 预览端口均未用于测试。

## 渲染与地形

- `output/playwright/unified-world/current/verification.json`：银河、恒星系、星球、矿场、电梯、轨道站、舰船查看和返回，30 轮使用相同 renderer/canvas/scene/camera；全局一个 canvas、零 iframe。
- 20 个建筑 ID 均可定位并读取测试殖民地的真实等级、状态。月球仓储单独覆盖。自转 240 秒后设施位置误差约 `2.33e-10` 世界单位。
- 建筑飞镜可以被滚轮中断；相机保持在共享地形高度之上。浏览无主星球不改变经营殖民地。
- 地形 Worker 返回数组；全球细分与局部地块共用单 Worker，有界队列和取消逻辑得到检查。精细地块、设施模型与表面缓存有容量限制。30 轮预热后保持 99 个几何、2 张纹理、21 个程序，没有持续增长。
- `tests/universe-environment-browser.mjs` 在真实 Chrome 编译了恒星、日冕、黑洞、星云、野怪、物流、小行星、彗星材质，并验证恒星前后物体的像素遮挡。
- 五类野怪原始顶点、法线、颜色、发光数据逐项保持一致；CPU 回归检查实际二进制资产。
- `output/playwright/unified-operations/verification.json`：真实点击建设、研究、生产和舰船档案，检查拖动、缩放、返回、重复进入与打断飞镜；全部身份检查均复用主世界，没有额外三维画布或 iframe。额外验证着色器准备期间实际点击战报菜单仍可响应。操作面板已取消遮住世界的背景模糊。

## 性能基线

普通视角使用同一机器、Chrome、1440×900、DPR 1；每视角采样 90 帧，统计丢弃开始 5 帧后的值。世界首次准备完成后才开始导航采样，首次准备耗时另行记录。

| 视角 | 旧版 p95 | 最终统一版 p95 |
| --- | ---: | ---: |
| 银河 | 7.4 ms | 7.4 ms |
| 恒星系 | 7.6 ms | 7.4 ms |
| 星球 | 7.4 ms | 7.3 ms |
| 工业近景 | 7.5 ms | 7.3 ms |

新地形与工业近景有新增内容，以上是整条操作路径的实际测量；不是对每个像素相同画面的保证。

合并后复验曾发现恒星系短窗口 p95 为 13.8ms，保存在 `output/playwright/unified-world/current/verification.final-first.json`。分段 profiling 查明首次环境/地表程序编译造成最长 1239.5ms 的绘制阻塞；首次透明地块程序也阻塞 1218.2ms。没有用延长预热的方式忽略问题：改为在首轮进入空间前异步预编译稳定材质模板，并保持程序缓存；全球地形使用低细节即时网格与单 Worker 升级队列。

修复前后的详细记录分别为 `output/playwright/unified-world/performance-current/verification.before-prewarm.json` 和同目录的 `verification.json`。修复后准备耗时约 1.423 秒，期间记录 151 次 rAF 回调；首次恒星系绘制峰值降到 5.6ms、整帧峰值 10ms，首次工业近景绘制峰值降到 1.9ms、整帧峰值 3.7ms。四个视角的导航预热期间都没有长任务。每视角预热 5 秒后重复 3 次、每次至少 3 秒的稳态采样，p95 中位数分别为银河 7.3ms、恒星系 7.4ms、星球 7.3ms、工业近景 7.4ms。

实时千舰测试记录在 `output/playwright/unified-combat/`：确认 1000 艘舰船、进入/退出驾驶舱、一个 WebGL 上下文、共享世界身份、零浏览器错误。实时采样的战斗 tick 不一致，不能凭该数据单独判定严格 10% 性能门槛。

固定帧首次对照记录为 `output/playwright/unified-fixed-combat/result.json`，最终合并构建复验为 `output/playwright/unified-fixed-combat/final-result.json`。旧版本由 HEAD 与任务前补丁在测试浏览器内恢复，没有覆盖工作区；报告记录恢复依据与文件 hash。使用相同 tick 240、相同 1000 舰快照字节 hash、相同战列舰和相机模式、1280×800、DPR 1；后台模拟服务在采样前关闭；每模式热身 5 秒、采样 8 秒，旧新交错各 3 轮；最终版用相同冻结快照再采样 3 轮。

| 千舰固定帧 | 旧版 p95 中位数 | 统一版 p95 中位数 | 变化 |
| --- | ---: | ---: | ---: |
| 第三人称 | 14.2 ms | 14.2 ms | 0% |
| 驾驶舱 | 83.3 ms | 69.7 ms | −16.3% |

两项通过 10% 门槛。这是稳定千舰场景的对照：一次性弹丸事件在热身中会结束，持续炮火压力由实时测试覆盖，但不把两次不同战斗 tick 的实时数字当成严格性能对照。

最终战斗报告还覆盖 30 次跟随 → 驾驶舱 → 返回，始终一个 canvas、一个 WebGL 上下文、零 iframe、相同 renderer/scene/camera；缓存预热后的几何数固定为 4233、纹理数为 16。双战斗复用相同舰船 ID 时分别映射到对应星球，坐标误差不超过 `2.33e-10`；删除副战斗后主战斗继续显示。没有浏览器或 WebGL 错误。该次战斗验收的 `planet.bundle.js` SHA256 为 `ebbfd238473579e95f0b8cc94caf9fcacdc37f46bd15d012ebad5e7572454358`，与该报告中的构建记录一致。

## 连续飞行实录

`scripts/record-world-tour.mjs` 使用真实导航 API 与鼠标拖动，录制银河 → 恒星系 → 星球晨昏线与向阳面 → 金属矿场 → 电梯地面港 → 轨道站 → 返回星球。录像前修复低空切换设施时直接跳至安全高度、极区姿态翻转，以及返回轨道被地表钳制覆盖目标的问题。导航回归 6 项、`npm run test:world` 52 项全部通过，`npm run build:world` 成功。

录像及逐阶段截图位于 `output/playwright/world-tour/2026-10-17T13-54-34-403Z/`，成片 `continuous-world-tour.mp4` 为 1920×1080、25 fps、71.36 秒，过程没有剪切；只移除开始准备与末尾同步标记。`recording.json` 记录每段时间、构建 hash、共享世界身份及清理结果：全程同一 renderer/scene/camera，一个 canvas、零 iframe、零浏览器/WebGL 错误。临时服务、存档和会话已清理。此次仅复验导航与录制路径，没有重新执行千舰性能对照；工业模型仍为过渡资产。

## 测试范围与既有失败

最终全套 CPU 运行日志：`output/three-world-migration/unit-tests-final.txt`。该次运行共 582 项，575 通过，7 失败。其中 `pilot-experience` 的点击开火测试桩缺少新驾驶生命周期要求的 `scene.active` 和当前战斗镜头；已补全测试上下文，未放宽产品中的控制权限检查。随后该文件与驾驶生命周期回归合计 13 项全部通过，记录为 `output/three-world-migration/pilot-regression-final.txt`，剩余 6 项为下述任务前已有失败。

统一世界定向回归 `npm run test:world` 共 49 项全部通过，包含正式依赖图、深度约定、五类野怪模型、百倍尺度、地形与设施定位、共享 Worker 取消、材质预热与销毁、舰队共享渲染和驾驶状态隔离。日志为 `output/three-world-migration/world-tests-final.txt`。

这 6 项失败已按任务前源码审计，详情为 `output/three-world-migration/preexisting-failures-audit.json`：

1. `gargantua.test.mjs` 三项：旧靶场期望距离 112，现有实现为 440；测试 VM 缺少 performance。
2. `light-cruiser-rebuild.test.mjs` 一项：Probe 几何历史 hash 与已有模型不一致。
3. `spatial-superweapon.test.mjs` 一项：旧试验阵容期望与已有允许列表不一致。
4. `three-battle-harness.test.mjs` 一项：被比较的记录含随机生成的 planetId，导致所谓确定性 hash 不同。

审计沿受测模块的 67 个本地依赖检查：64 个与 HEAD 相同且任务前没有修改，3 个旧 AURORA 文件与任务前捕获的 SHA256 相同。没有修改无关玩法规则或更新历史预期来掩盖这些失败。

## 尚待交付

完整外部工业美术尚未返回。当前模型是接入和经营状态验证用的过渡资产；不得把它标记为最终矿业园区、炼化综合体和太空电梯美术完成。提示词与交付规范见 `../three-world-art/`。
