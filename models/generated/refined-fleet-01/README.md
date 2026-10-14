# 全舰队精修 01

2026-10-12。按用户确认的巡洋舰样舰精度完成全舰队建模。

## 内容

- 21 个 GLB：19 款精修（含此前确认的巡洋舰）以及保留的重型战机、无畏舰两个基准模型。
- 21 张对应舰船 PNG 预览，另有 `Probe-front.png` 展示探测器三支结构。
- `manifest.json` 记录中文名称、APK 编号、面数、网格数、尺寸及验证状态。
- 间谍探测器为三组完整传感分支，绕中心轴均布 120°；探测器与太阳能卫星无武器。

查看器：http://127.0.0.1:8291/mockups/galactic-command/ships.html?ship=Probe

查看器可切换全部舰船、原模型、正侧俯视和线框，并对照 APK 原图及现有属性。该地址依赖本机预览服务器。

## 可编辑源文件

项目内 `opendesign/mockups/galactic-command/`：

- `fleet-refined.js`：本轮新增的 18 款模型。
- `cruiser-sample.js`：已确认的巡洋舰样舰。
- `ship-detail-kit.js`：装甲、舰体、炮塔与引擎几何。
- `ship-models.js`：全舰队入口及保留模型接入。

旧源码快照在 `models/archive/fleet-before-refinement-20261012/`；旧 GLB 在 `opendesign/mockups/galactic-command/assets/preserved-ships/`。既有模型未删除。

## 验证与边界

- `npm test`：108 项通过，包括 90 个截图基础属性字段、舰船身份、几何有效性、探测器实际旋转关系和太阳能阵列检查。
- `node scripts/export-refined-fleet.mjs`：21 个 GLB 导出后重新读取，面数、网格数及包围盒与源模型一致。
- `node scripts/check-cruiser-sample.mjs`：巡洋舰保留样舰的面数与尺寸基准。
- 已逐艘进行浏览器视觉检查；未做大量舰船同时显示的性能压测。
- 90% 外形相似仍待视觉验收，未宣称已量化达标；背面和厚度包含合理补建。
- 死星缺对应 APK 原图，旧版守护者 APK 身份未确认；两者沿用旧概念轮廓精修。
- 部分特殊舰船的服务器属性仍未取得；现有基础属性来自此前用户截图。克制与伤害方案保留待确认，未启用到战斗结算。
