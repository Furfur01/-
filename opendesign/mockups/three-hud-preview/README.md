# 三舰桥 HUD 交互预览

入口：<http://127.0.0.1:8390/opendesign/mockups/three-hud-preview/index.html>

- `#fighter`：战斗机，保留参考样板的座舱、飞行、雷达点选、屏外索敌、伴飞编队；增加楔形、纵列、护航屏障快捷入口。
- `#battleship`：精简战列舰，常驻火控、舰船状态、目标和小雷达，战术态势可展开。
- `#flagship`：深空吞噬者，无主炮的旗舰指挥布局；两组各四架演示无人机支持出动、护卫、拦截、攻击指定目标和逐架返航。支持编队、能源分配、分区护盾及指挥记录。

顶部按钮或 1 / 2 / 3 切换舰桥。V 切换座舱/外部视角，T 或雷达选择目标，W/S 控制油门，右键操纵，中键环绕，空格主武器，R 导弹，G 自动驾驶，P/Esc 暂停，H 操作说明。旗舰 F4 出动当前小队，F1 指定攻击，F5 紧急护盾。

## 范围

浏览器本地演练，无账号、游戏 API 或正式存档访问。只有选中的 HUD 模式存入独立 localStorage 键 `empire-three-hud-preview-mode`。目标会重生，弹药会自动补充；无人机为可回收的有限演示单位，未实现正式损失结算、补充费用或母舰被毁规则。

参考 HTML 的自包含 WebGL 渲染、战机座舱及交互被拆分保存在 `assets/reference-*`。此次是 HUD 预览，不替换正式 Three.js 战场。旗舰几何由项目现有 `createShipModel('Iron_Behemoth')` 导出，来源和参考文件 SHA256 记录在 `asset-sources.json`。

React 界面位于 `src/app.jsx`，演练适配及无人机状态位于 `src/bridge.js`，布局位于 `preview.css`。

## 构建与启动

从项目根目录运行：

```powershell
node opendesign/mockups/three-hud-preview/build.mjs
powershell -ExecutionPolicy Bypass -File opendesign/mockups/three-hud-preview/start-preview.ps1
```

构建使用用户提供的 `C:/Users/Administrator/Downloads/VALIANT_TALON_Dual_GUI.html`，也可将其他来源路径作为 build.mjs 的首个参数。只生成本预览目录内的文件；不运行正式游戏构建。

服务仅绑定本机 8390，提供本预览与已有 P0 静态资源；账号、存档、项目源码和目录穿越请求均不可访问。关闭预览服务使用本目录 `stop-preview.ps1`。

## 验收记录

2026-10-16 独立浏览器检查通过：三模式切换、战机编队及点选锁定、战列舰炮塔射击和导弹冷却、战术地图展开关闭、ALPHA/BETA 分别出动/攻击/召回至待命、暂停与帮助。复核 1280×720 战机底部仪表完整可见；旗舰在 1280×720 与 1920×1080 下主体位于战术图上方。浏览器 error/warn 为空。静态服务不开放存档、项目源码与目录穿越路径。
