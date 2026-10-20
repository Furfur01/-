# Three.js 正式战场与原版归档

自 2026-10-15 起，Three.js 是正式战场、驾驶、回放和独立靶场的默认版本；原生 WebGL 版冻结归档，保留显式对照入口。舰体、炮口与喷口、武器配置、服务端模拟和回放协议沿用现有实现。Three.js 中的死星仅保留基础舰体；专用地表与壕沟演练继续使用归档版。

## 使用

从正式游戏的战场、战报或舰船档案进入。开发构建执行 `npm run build:command`。

- `battlefield-three.html?battle=ID`：正式战斗，支持观战与接管。
- `battlefield-three.html?replay=ID`：只读回放，支持暂停、倍速、跳转。
- `hangar-three.html?ship=Dreadnought`：玩家驾驶靶场。
- `legacy-webgl/hangar.html?map=death-star`：尚未迁移的死星专用场景。

各入口位于 `/opendesign/mockups/galactic-command/`。编队测试接口、独立预览服务及对照基准已从开发入口移除；旧存档已有演练战斗仍能结算和回放。新版需要 WebGL2，加载失败时显示错误。

### 战斗自由视角

在实时战斗或主界面打开的空间战报中，摄像头下拉选择 **自由视角 · F**，或按 **F** 从跟舰/驾驶舱中脱离：

- 左键拖动环绕，右键或 Shift 拖动平移，滚轮缩放。
- **WASD** 前后左右移动，**Q / E** 下降 / 上升，按住 **Shift** 加速。
- 再按 **F** 恢复跟舰，**V** 进入驾驶舱，**Esc** 结束观察。

进入自由视角时交还驾驶权给 AI，移动镜头不会控制舰船。暂停或拖动回放进度后仍可自由观察；主界面的空间战报使用同一个三维视口，不另开 iframe。

### 靶场瞄准与试射

按 **T** 选敌、**X** 辅助瞄准、**Space** 发射主炮。选中目标不等于炮线已经对准；仪表会分别显示“炮线未对准”“蓄能中”“冷却”和“就绪”。具备导弹的舰型选敌后完成锁定，再按 **R** 发射。

准心按真实炮口射线投影，随舰桥、追踪、环视和俯仰变化，不再固定在屏幕中央。固定主炮的各炮口汇聚到同一瞄准点；X 对准包含炮口偏移与炮弹飞行提前量，激光不加提前量。锁定模式下，蓄能完成但炮线尚未对准时会保持满蓄能，重新对准后释放；目标失效则取消蓄能。取消 X 后仍可自由试射。

靶舰的绘制、瞄准中心和碰撞使用相同姿态；弹丸按与移动目标的相对轨迹判定，并只结算最先接触的目标。

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

## 开发检查

仅运行 `npm test` 中的 P0 与必要 P1 检查，范围见 `tests/README.md`。不再维护独立战场验收、千舰基准、自动录像或预览服务。历史测量保留在本机 `output/`，不代表当前版本已经完成同一性能验收。
