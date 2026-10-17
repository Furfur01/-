# 战斗机 HUD

`fighter-hud.js` 负责抬头准星、航向、速度和编队标记；`fighter-hud-art.js` 保留 VALIANT / TALON 的准星和文字风格。旧的二维座舱蒙版、底部悬浮面板及三块占位屏幕已移除。

`fighter-console.js` 定义五块真实模型屏幕：索敌、武器、雷达、飞行参数、系统状态。`renderer.js` 生成带边框与支架的座舱几何，`cabins.js` 和独立播放器共用同一套动态纹理。屏幕位置、绘制范围和点击射线使用同一组模型坐标；环视时屏幕自然改变透视，不是跟随视口的 HTML 面板。

- 星图现场：`opendesign/mockups/galactic-command/map-combat.js` 提供实时舰船、预测姿态、投影位置和驾驶命令。
- 独立战场与历史播放器：`runtime.js` 对接 `controller.js`。正式战场链接通常自动回到星图现场。
- 靶场沿用同一套座舱屏幕和抬头显示，数据来自当前演练；退出按钮返回舰船档案。
- 射程、遮挡、对准和冷却来自共享的 `pilotWeaponStatus`；雷达和编队链路来自当前存活舰船。没有虚构导弹数量、僚机指令或能源分配。
- 方向键上下 / Q、E 俯仰；左右键偏航；A、D 滚转；W、S 油门；右键拖动瞄准；T 切换敌方目标；X 锁定；Space 主武器；R 已装备的导弹；G 交还 AI；V 镜头；Esc 退出观察。
- “相对高度”使用战场坐标的 Y 值；垂直速度为当前速度与俯仰角计算所得。
- 模型屏幕可直接点击选敌、锁定、开火和调整油门，点击屏幕不会同时触发座舱左键射击。低头查看控制台时收起遮挡仪表的抬头标记；中键环视，C 回正。
- 抬头准星下缘和目标提示按模型屏幕的投影位置避让，防止不同窗口比例下盖住雷达标题。
- 战斗机使用这一套仪表；切换到战列舰或大型旗舰时使用 `BRIDGE-HUD.md` 中的模型舰桥仪表。

构建星图入口：使用 esbuild 将 `planet.js` 打包为同目录的 `planet.bundle.js`（bundle、iife、minify），再执行 `node scripts/build-colony-review.mjs` 更新模型与星图接口。独立播放器执行 `node scripts/build-three-flight.mjs`。

验收：`node tests/pilot-experience-browser.mjs`、`node tests/cockpit-classes-browser.mjs`、`node --test tests/pilot-classes.test.mjs`。包括真实模型屏幕点击、左右环视、俯视、1280×720 / 1920×1080 截图、实战与靶场、舰种切换。浏览器验收使用随机独立端口、临时存档与测试会话，finally 中关闭服务并清理临时目录。
