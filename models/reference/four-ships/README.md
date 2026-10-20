# 小运 / 大运 · 用户四舰模型

游戏中的 `Cargo_Ship` 使用 T02，`Large_Cargo_Ship` 使用 T03。保留原 HTML 的几何与配色；导弹舰与殖民船不在本次替换范围内。

- 来源：`Four_Ships_ThreeJS_Offline.html`，用户于 2026-10-19 提供。
- 原始模型提取：`node scripts/import-four-ships-transports.mjs`。
- 游戏适配：`opendesign/mockups/galactic-command/cargo-reference.js`；按材质合批，居中并保持替换前的舰长，使用四个实际喷口。
- 重建游戏：`npm run build:command`。机库、造船、战斗和星图共用模型入口。
- 验证：`node --test tests/cargo-reference.test.mjs`；`node tests/cargo-reference-browser.mjs` 使用临时存档、独立会话和随机端口。

小运为 10,748 三角面，大运为 10,976 三角面，各合批为 10 个网格。远景直接选取原模型主要结构，分别为 1,444 / 1,392 三角面。
