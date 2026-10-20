# 战列舰与深空吞噬者舰桥

`bridge-console.js` 组合 `instruments/fusion-displays.js` 与 `fusion-radar.js`。左右防御/火控绘制和透明材质直接来自原融合版，原融合预览也引用同一份 `fusion-screens.js` / `fusion-glass.js`。仪表绑定现有游戏数据，不建立平行战斗模拟。全息雷达嵌入 KEEL 模型原桌台。屏幕与标记属于座舱场景，随环视与行走改变透视。`game/bridge-layout.mjs` 定义四型布局；大厅行走由 `keel/walking.js` 按实际模型几何处理。

- 左侧为半透明防御全息，右侧为火控全息；航行控制位于左屏上方，武器状态位于右屏上方。游戏当前只有整体护盾容量，因此显示共用护盾遥测，不伪造四向独立数值。防御舰船简图从21种实际舰船模型的俯视轮廓生成，脚本为 `scripts/build-ship-schematics.mjs`。
- 深空吞噬者在左侧增加真实无人僚机指挥屏，保留防御屏：突击 / 护卫，楔形 / 屏障 / 环绕，集火目标、冷却、在役数量、容量和自动补充倒计时。阵型控制本舰僚机，集火联动附近友舰，攻击加成作用于全军。生成与指挥规则仍由 `game/devourer-command.mjs` 决定。
- 全息雷达以本舰为中心，来自实际存活舰船的位置：敌方红色、友方青色、本舰无人僚机金色，选中目标高亮。可以直接点选红色全息标记，目标链路与集火共享选择。
- 星图现场由 `map-combat.js` 向共享渲染器提供快照与预测数据；独立战场、回放和靶场由 `runtime.js` 提供。命令走已有 `carrier-order` 接口，服务端校验归属、目标、距离及冷却。回放只读；没有真实战场的靶场只显示无人僚机控制的禁用状态。
- `bridge-hud.js` 共用融合版准心与索敌框，保留通讯记录和视角按钮；武器、目标和蜂群操作位于舱内屏幕。`keel/status-display.js` 为三种舰桥提供顶部实时外景与警告条，当前外景是内饰绘制前采集的前向画面。远端模型设备保留装饰材质。受击抖动、护盾蓝闪、舱灯警报与火花由 `keel/feedback.js` 从实际损伤驱动；战斗/回放 epoch 改变时重置。
- 模型屏幕和全息标记使用实际空间射线拾取，点击仪表不会同时开火。中键环视，C 回正，G 交还 AI；大厅舰桥交还 AI 后可用 W/A/S/D 行走。

驾驶舱几何源现位于 `scripts/three-flight/keel/`，四型由 `room.js` 与 `cabins.js` 统一接入。战斗机使用独立 `fighter-hud.js` 和 `keel/fighter-instruments.js`。原 `scripts/cockpit-source` 与 `cockpit-models.js` 为旧模型，修改它们不会改变当前 KEEL 内饰。

构建：`npm run build:command` 更新正式星图与播放器。

2026-10-20 已清理上述功能的独立测试与预览工具；当前统一检查范围见 `tests/README.md`。
