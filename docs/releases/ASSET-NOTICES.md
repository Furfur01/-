# 素材来源与分发准备

此文件随本地候选包保存来源线索。公开发行前，需要把使用权限记录补齐，或替换无法确认权限的素材。

## 已带入的依赖许可证

`licenses/` 包含 React、React DOM、Scheduler、Three.js、Lucide React 及连续星球模块的许可证文本。打包时从当前依赖和模块原文件复制，保留原版权声明。

## 国家纹章

国家纹章图集 `opendesign/mockups/galactic-command/assets/heraldry/nations-atlas.png` 于 2026-10-22 使用 OpenAI 图像生成工具按各势力主题生成，共十五枚透明剪影。参考截图仅用于地图排版方向，未提取其中的纹章；游戏运行时统一着色并另行绘制国名。

## 尚需核对的素材

恒星武库采用用户提供的 `stellar_arsenal.html` 与 `stellar_arsenal (3).html` 中的程序化几何和特效。导入入口 `scripts/import-stellar-arsenal.mjs` 仅提取模型工厂，运行模块使用项目现有 Three.js。发射舰来自（3）版；小导弹、棱镜阵列、加速环和命中碎片以无后缀版为基础，经舰尾装填、真实星图目标、毁伤材质及镜头适配。原始HTML、参考演示、导入脚本和验收输出不进入发行包；公开分发前仍需核对附件的使用与修改授权。

自动化控制与生态工程科技图标于 2026-10-22 使用内置 OpenAI 图像生成工具生成，分别表现无人机械臂装配和封闭生态舱。原图及完整提示词保存在 `assets/technology-generated/`；运行副本位于 `opendesign/mockups/galactic-command/assets/p0/tech/` 和旧界面的 `technologies-v2/`，随运行素材打包。两项技术档案为项目原创；题词分别摘自《荀子·劝学》和《道德经》第十六章，游戏内提供所核对的原文链接。

恒星巨构机械来自用户提供的 `helios-megastructures.html`，源码保留于 `models/reference/`，运行时仅采用提取后的几何工厂。船坞中央的深空吞噬者来自仓库早期 Tripo 模型，经过保留材质的减面并新增舰首三角发光结构；运行时仅包含近景和中景 GLB，处理记录见 `models/generated/megastructure-devourer/README.md`。原始高模、参考 HTML、处理脚本及验收渲染不进入发行包。

小行星工业带于 2026-10-22 改用用户附件 `helios-megastructures (1).html` 中的巡航采矿机，参考保留为 `models/reference/helios-asteroid-miner.html`。提取入口为 `scripts/import-helios-megastructures.mjs --industry`；只替换采矿设施，保留牵引、涡轮分选、两侧排废及转运站动画。运行适配位于 `scripts/universe/asteroid-industry.js`，沿用原有工程、资源和账号规则。

- **APK 恢复资源**：图标、建筑图、音频及部分文本。来源索引在 `opendesign/mockups/galactic-command/assets/p0/sources.json`、`opendesign/mockups/galaxy-empire/assets/original/` 和源码仓库的 `research/apk/README.md`。来源记录不能替代再分发授权记录。
- **用户提供与参考导入模型**：AURORA Worlds、舰船和其他三维参考。源码的 `scripts/universe/aurora-worlds/README.md`、`models/reference/` 记录了部分来源；需要逐类确认附件和模型的使用、修改、分发条件。
- **贴图、背景及生成素材**：保留现有素材索引。当前没有覆盖全部运行资产的统一许可清单。

候选 ZIP 是发布前验证产物。目前不建议公开上传完整素材包或将整个项目标注为统一开源许可证。发布负责人应先确认上述素材的分发范围；小范围分发同样需要对应权限。
