# 银河帝国 · P0 独立界面示意

本目录包含 **轨道船坞、科技树** 的独立可交互示意，以及两张先行生成的 Imagegen 概念图。未接入正式游戏，不调用游戏 API，不读取账号或宇宙存档。

## 入口

- `index.html#research`：科技树，默认入口。
- `index.html#shipyard`：轨道船坞。
- `index.html#concepts`：两张原始 Imagegen 概念图，可以切换和查看原图。
- 浏览器预览：`http://127.0.0.1:8390/opendesign/mockups/p0-command-preview/index.html`。

需通过本地 HTTP 访问，GLB 模型不能依赖直接双击 file:// 加载。页面资源全部在本目录，没有 CDN 依赖。

双击本目录 `打开独立示意页.cmd` 可启动并打开预览；也可单独运行 `start-preview.ps1`。`serve.mjs` 只绑定本机地址，只开放此示意页及其素材；不启动游戏后端。停止独立预览可运行 `stop-preview.ps1`。独立预览使用 8390 端口，正式游戏使用 8289 端口，两者可以同时运行。

## 可操作内容

科技树按真实科技前置自动分层：无科技前置的为 0 级，放在最左列；其他科技的层级为最高前置层级加 1。去掉人为主题分类和筛选，列数随前置关系计算，建筑与能源条件不参与科技分层，仍显示在详情面板。节点上的 Lv 是已研究等级，与列级含义不同。

支持拖动平移、滚轮及按钮缩放、全树适配、定位选中节点、按科技或舰型搜索、前置路径高亮、研究目标标记、开始研究、取消并返还示例资源。跨层前置连线从节点上方绕行，避免穿过中间科技卡片。等级提升后会更新资源、能力与可用条件。

轨道船坞支持战斗／民用分类、搜索舰型、GLB 模型旋转与缩放、性能对照、数量调整、费用预览、前置检查、加入生产队列、逐艘完成、取消剩余批次并返还示例资源。左侧列表、队列和性能对照统一使用 APK 原图；三维区使用项目当前已校正舰型映射的重建模型，保留原有材质颜色、发光和顶点色，默认从舰首斜上方展示。三维模型是项目已有重建成果，并非从 APK 提取的原生三维资产；隐藏面和厚度仍有重建解释。

页脚可以切换暂停、1×、20×、60×演示速度，也可以重置示例。状态仅存于浏览器键 `galaxy-empire-p0-independent-v1`，与正式游戏无关联。

## 素材与规则

- 14 张科技图标从 `output/apk-icons/technology/` 原样复制，以 `GameResearchDefine.json` 枚举核对 ID，未重绘原始图标。
- `Intergalactic_Network` 与 `Graviton_Tech` 没有匹配到本次原始 APK 图标枚举，使用项目 `technologies-v2/` 中的补充图。详细来源在 `asset-sources.json`。
- 13 种舰船缩略图从 `output/apk-icons/fleet/fleet_XX.png` 原样复制，按 `ships-data.json` 的 APK 编号和原图 SHA256 双重校验，详细来源保存在 `asset-sources.json`。
- 三维模型在构建时调用当前舰船查看器共用的 `ship-models.js#createShipModel(id)`，导出为本目录独立 GLB 快照，不再使用旧版 `preserved-ships/` 文件。模型 ID、APK 编号、版本与文件 SHA256 记录在 `asset-sources.json`；浏览器运行时只加载本目录资产。
- 静态科技和舰船目录来自 `game/catalog.mjs`，在构建时快照到 `catalog.json`。浏览器运行时不导入游戏代码。
- 演示等级、余额、库存与初始队列为示例，不反映真实存档。研究／造舰成本和前置以静态目录推导；当前实验室等级设为 9、船坞等级设为 9。
- Imagegen 图用于布局与视觉方向探索。生成图中的数值、文字和连线不作为游戏规则依据。独立 HTML 中已按目录数据重新组织科技依赖。

## Imagegen

采用内置 `image_gen` 工具，各生成一张 16:9 设计示意。完整提示词保存在 `imagegen-prompts.json`。

- `assets/concepts/shipyard.png`：轨道船坞概念图。
- `assets/concepts/research.png`：科技树概念图。

## 开发

在项目根目录执行：

```powershell
node opendesign/mockups/p0-command-preview/build.mjs
```

使用本项目已有 React、Three.js、lucide-react 和 esbuild；未新增依赖。源码在 `src/`，样式在 `preview.css`，模型快照导出在 `export-models.mjs`。此构建只复制独立页所需素材、导出本页模型快照、生成静态目录并打包独立页脚本，不修改正式游戏构建产物。
