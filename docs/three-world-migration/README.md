# Three.js 连续世界迁移

正式入口仍是 `/` → `opendesign/mockups/galactic-command/index.html`。主星图直接挂载；建设、研究、生产、舰船档案改变主空间镜头并显示操作面板。历史回放与独立靶场继续作为工具保留。

## 实现归属

| 内容 | 正式实现 | 生命周期 |
| --- | --- | --- |
| 唯一画布、渲染器、世界、主相机、帧循环 | `scripts/universe/world.js` | 主界面创建一次，导航不重建 |
| 银河星点、星云、恒星、黑洞、轨道、疆域、野怪、物流 | `scripts/universe/environment*.js` | 向世界贡献 Group 与更新函数 |
| 融合行星材质、全球地形、局部地形 | `planet-surface.js`、`terrain.js`、`terrain-worker.js` | Worker 仅返回数组；主线程建立 Three 资源 |
| 工业状态、设施锚点、过渡模型、电梯 | `industrial-models.js` | 读取既有建筑 ID、等级、队列、电力、库存；不修改经营数据 |
| 显示尺度、战斗世界映射 | `spatial.js` | CPU 双精度位置；GPU 使用浮动原点附近的局部坐标 |
| 战斗、舰船航行、曲速 | `combat.js`、`scripts/three-flight/map-renderer.js` | managed 模式使用宿主 renderer、camera、scene |
| 驾驶与 HUD | `map-combat.js`、`scripts/three-flight/*hud*` | 更新订阅主帧循环；HUD 使用 DOM/SVG |
| 驾驶舱外景屏 | `scripts/three-flight/keel/exterior-feed.js` | 同一渲染器与世界生成 HDR RenderTarget；无截图拼接 |
| 舰船档案、研究、生产预览 | `ship-catalog.js`、`client/command-p0/world-host.mjs` | 操作共享世界；无独立模型视口 |

`PlanetScene` 是现有主界面的适配器，继续提供原来的选星、选建筑、查看舰队等调用。服务端玩法坐标、航程、燃料、资源、舰船与碰撞规则没有因显示尺度而改变。

## 深度、色彩与尺度

- 星球、轨道、恒星系布局统一乘以 100；普通工业构件不一起放大。类地星半径 175，普通模型单位仍为 `1.75 / 16 = 0.109375`。比例证据由 `scaleEvidence()` 提供，测试比较旧、新星球与同等场地的比值。
- 主渲染器启用对数深度。Three 内建材质、融合行星 shader、恒星/黑洞射线深度、舰船与特效使用同一 clip W 约定。当前 Three r184 手写深度分支使用 `USE_LOGARITHMIC_DEPTH_BUFFER`。
- 世界使用线性着色、统一 ACES 与 sRGB 输出。托管舰船 shader 移除旧的重复曝光/Gamma/ACES；独立靶场保持自己的显示设置。
- 战斗映射严格使用 `planet.radius / environment.radius`，环境中心映射到同一真实星球中心。所有舰船、炮火、相机和屏幕拾取共用这一变换。
- 北极近地交战区域保持服务端球面基准，工业整地不能覆盖该区域。地表细节暂不增加战斗碰撞规则。

## 连续操作与缓存

建筑飞镜先沿安全高度绕至目标面，再下降到局部观察点。鼠标、滚轮可打断；镜头随星球自转，地形高度限制阻止穿地。浏览外星不会调用切换经营殖民地接口。

舰船档案与造舰界面把模型放在当前殖民地轨道站，使用相同的安全镜头路径；研究定位科研设施。设施与轨道模型跟随同一星球局部坐标。

运行时最多保留 16 个星球表面对象；每个表面最多 4 个精细地形块、6 个设施模型；环境缓存限制为恒星 40、恒星系装饰 8、野怪 24、物流中心 12。设施按投影大小、视锥、地平线裁剪，隐藏后停止机械动画和精细拾取。电梯港区、缆索、轨道站独立裁剪。

首轮进入世界时，主运行时通过 `WebGLRenderer.compileAsync` 预编译实际环境、地表、透明地块和设施材质变体；准备期间操作面板继续响应。预编译只使用对象组和原来的世界，材料保留到运行时销毁，避免离开缓存后再次编译导致镜头停顿。全球网格先显示同高度函数的低细节版本，再由共享 CPU Worker 升级；Worker 不生成 GPU 资源。

## 美术状态

融合程序化行星体系、共享地形高度、工业状态和接入接口已落地。当前工业模型用于验证尺度、状态、拾取和经营操作，**最终工业美术尚未完成**。

外部制作方不访问项目，只独立制作模型、材质、动画与预览。发送 `docs/three-world-art/00-统一美术与交付总纲.md` 及对应模块提示词即可；每份模块提示词也可独立转发，不需要发送内部尺度证据、源码或账号。返回的文件先保留原件，再由项目方提取对象生成代码、映射建筑 ID 和真实经营状态，并核对占地、锚点、包围盒、固定种子、LOD、update/dispose。独立预览可以拥有 renderer、RAF 和模拟状态，但提取后的正式资产模块不能携带预览运行时或演示数据。

## 构建与验收

```text
npm run build:command
npm test
```

`build:command` 运行 CPU 舰船资源导出、Three 工具构建、管理 UI 与正式世界构建，不再构建旧 AURORA 绘制链。旧构建脚本原件保存为 `archive/build-command.before.mjs.txt`，不作为可执行入口。

正式世界继续使用共享渲染器和主帧循环，不重新引入地图 iframe 或模块私有渲染器。2026-10-20 已清理独立架构、浏览器和性能测试；`npm test` 仅保留 P0 与少量 P1，范围见 `tests/README.md`。

必要的实际操作检查使用独立端口、临时存档与会话、明确测试名称，始终在 finally 清理。禁止使用 8289，不读取或写入正式账号进度进行验收。

任务开始时的修改清单、补丁与源文件哈希保存在 `output/three-world-migration/baseline/`。这些用于保留已有驾驶舱工作和对比，不把任务前修改误算作本次新增。

迁移时的历史验收结果见同目录的 `VALIDATION.md`；当前发行候选的证据见 `docs/releases/PREPARATION.md`。
