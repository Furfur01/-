# 战列舰与深空吞噬者舰桥

`bridge-console.js` 将作战、目标链路和航行仪表绘制到三块真实模型屏幕上，并在控制室中央生成全息雷达台。屏幕、支架、投影网格、敌我标记都属于座舱场景，随环视与行走改变透视。`game/bridge-layout.mjs` 共用屏幕位置和行走障碍定义；舰长椅碰撞位于 `game/bridge-obstacles.mjs`。

- 战列舰左屏显示主武器、辅助武器、射程与火控状态；中屏显示速度、航向、舰体、护盾、油门和驾驶接管；右屏负责选敌与舰艏对准。
- 深空吞噬者左屏改为真实无人僚机指挥：突击 / 护卫，楔形 / 屏障 / 环绕，集火目标、冷却、在役数量、容量和自动补充倒计时。阵型控制本舰僚机，集火联动附近友舰，攻击加成作用于全军。生成与指挥规则仍由 `game/devourer-command.mjs` 决定。
- 全息雷达以本舰为中心，来自实际存活舰船的位置：敌方红色、友方青色、本舰无人僚机金色，选中目标高亮。可以直接点选红色全息标记，目标链路与集火共享选择。
- 星图现场由 `map-combat.js` 向共享渲染器提供快照与预测数据；独立战场、回放和靶场由 `runtime.js` 提供。命令走已有 `carrier-order` 接口，服务端校验归属、目标、距离及冷却。回放只读；没有真实战场的靶场只显示无人僚机控制的禁用状态。
- `bridge-hud.js` 只保留身份、当前模式、操作提示与视角按钮。旧的悬浮舰桥仪表、独立蜂群 HTML 面板、近处旧桌面和装饰全息球已替换；远端工作站仍显示真实遥测数据。
- 模型屏幕和全息标记使用实际空间射线拾取，点击仪表不会同时开火。中键环视，C 回正，G 交还 AI；大厅舰桥交还 AI 后可用 W/A/S/D 行走。

几何源来自 `scripts/cockpit-source`，`scripts/build-cockpit-models.mjs` 在生成时移除旧控制台与装饰雷达。不要只修改生成的 `cockpit-models.js`。

构建：执行 `node scripts/build-cockpit-models.mjs`、`node scripts/build-three-flight.mjs`、`node scripts/build-colony-review.mjs`，并用 esbuild 将 `opendesign/mockups/galactic-command/planet.js` 打包为同目录 `planet.bundle.js`（bundle、iife、minify）。

验收：`tests/bridge-console-browser.mjs` 覆盖实战火控、无人僚机指令、雷达点选、环视、行走、1280×720 / 1920×1080、独立战场、回放只读和靶场；`tests/devourer-browser.mjs` 验证真实蜂群与回放；`tests/cockpit-classes-browser.mjs` 和 `tests/pilot-experience-browser.mjs` 回归舰种切换与战斗机；`tests/pilot-classes.test.mjs` 检查模型碰撞。测试均使用隔离端口与临时存档，结束后清理自己的服务和数据。
