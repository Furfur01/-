# 巡洋舰精修样舰 01

APK 身份：type_3 / FT_CRUISER。形状参考原始 fleet_03_Cruiser.png；细节参考 imagegen 概念稿及用户指定的两艘现有模型。

- Cruiser.glb：可导入三维软件的独立模型，包含 9 个命名组件组、57 个材质网格、33,548 个三角面，无外部贴图依赖。
- cruiser-sample.js：本次建模源文件快照。活动源位于 opendesign/mockups/galactic-command/cruiser-sample.js。
- preview.png / rear.png：浏览器实际渲染截图。
- checks.json：GLB 导出重新导入后的几何、包围盒和元数据检查结果；104 项项目测试通过。

预览：http://127.0.0.1:8291/mockups/galactic-command/ships.html?ship=Cruiser&sample=1

支持拖动旋转、滚轮缩放、正面/侧面/俯视、线框，以及切换现有模型。已有模型和旧源文件均保留；本次更改前的源文件保存在 models/archive/cruiser-before-sample-20261012。

这是第一艘供评价的样舰，90% 轮廓相似度尚未量化验收。未扩展重建其他舰船，也未修改战斗结算。间谍探测器后续按三支绕中心轴相隔 120° 建模，要求见 models/reference/ship-review-notes.md。
