# 原版 WebGL 归档说明

归档日期：2026-10-15。Three.js 已成为正式战场、驾驶、空间战报回放和独立靶场的默认版本。原生 WebGL 版保留用于历史画面对照、性能回归比较，以及未迁移的死星专用地表与壕沟演练。

## 冻结内容

归档位于 `opendesign/mockups/galactic-command/legacy-webgl/`，资源清单为该目录的 `manifest.json`，版本为 `webgl-before-three-20261015`。清单记录页面、脚本、模型和星空等资源的大小与 SHA-256，并保留源文件哈希。本次归档及默认入口切换不改变这个版本、冻结资源或清单中的哈希。

`scripts/freeze-webgl-baseline.mjs` 在后续构建中校验归档，不自动重新冻结。不要直接修改归档文件或更新清单来绕过校验；新版代码和资源维护在 `scripts/three-flight/` 及对应构建流程中。`output/` 下已有验收与视频报告保留原测量版本和结论，不随默认入口变更而改写。

## 显式使用原版

启动本地游戏服务后，在 `/opendesign/mockups/galactic-command/` 下打开以下路径，即可恢复使用对应原版页面，无需覆盖正式版文件：

- `legacy-webgl/battlefield.html?battle=ID`：原版真实战斗与驾驶。
- `legacy-webgl/battlefield.html?replay=ID`：原版只读战报回放。
- `legacy-webgl/hangar.html?ship=Dreadnought`：原版独立靶场。
- `legacy-webgl/hangar.html?map=death-star`：保留的死星专用场景。

战场列表的“战场版本”也可选择“原版 WebGL（已归档，仅供对照）”。同场比较应使用相同的战斗或回放 ID；冻结的是显示资源，真实战斗仍连接当前服务端，不能将它视为冻结的服务端模拟或存档。

## 旧链接兼容

原目录下的 `battlefield.html` 和 `hangar.html` 已改为兼容转向页，默认分别进入 `battlefield-three.html` 和 `hangar-three.html`。转向原样保留查询参数及 URL 片段，包括 `battle`、`replay`、`ship`；已有书签和外部链接无需丢弃。

当查询参数为 `map=death-star` 时，旧 URL 转向对应的 `legacy-webgl/` 页面，继续保留死星专用功能。显式 `legacy-webgl/` 链接始终打开归档版，不会自动转回正式版。要长期固定原版入口，请保存显式归档地址。

构建、千舰对照和视频复跑方法见 [Three.js 战场说明](three-battle.md)。
