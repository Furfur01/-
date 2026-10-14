# APK 解包档案与 HTML 资产

原始安装包是用户提供的 `C:/Users/Administrator/Downloads/yinhediguo.apk`（46,951,570 字节）。原 APK 仍保留在 Downloads，项目清理不会删除、移动、安装或运行它。

原 APK SHA-256：`d3bc4bc005a0a2798f833deedfd9014421401c5176a1cf254187d90ee2d35412`。

## 保留位置

| 内容 | 路径 |
| --- | --- |
| APK 内完整原始资源包 | `research/apk/tap4fun.zip` |
| 资源包展开结果，包含原始格式、TFS、语言包、声音与着色器 | `output/apk-icons/original-assets/` |
| 280 张解码纹理与图集 | `output/apk-icons/atlases/` |
| 裁切后的建筑、舰船、科技、防御图像 | `output/apk-icons/building/`、`fleet/`、`technology/`、`defense/` |
| 169 个 Lua 字节码块及静态结构分析 | `output/apk-icons/lua-bytecode/`、`lua-analysis/` |
| 安装包、DEX、原生字符串及 SQLite 检查结果 | `output/apk-inspection/` |
| HTML 使用的原版图像、场景、33 段声音及清单 | `opendesign/mockups/galaxy-empire/assets/original/` |
| 原图舰种名称与编号核对 | `models/reference/original-atlas-v1/` |
| 历史客户端独有的解包转换成果 | `research/apk/native-preserved/` |

`native-preserved/` 保留了旧 Godot 目录中在其他保留区找不到相同 SHA-256 的 121 个文件：`library.json`、`ui/literal-translations.json`、`ui/movies/` 下 119 个 JSON。它们是原图与界面的转换档案，不是运行时 Godot 工程。逐文件校验记录见 `native-preserved-manifest.json`；853 个同内容文件已在其他保留区存在，Godot 专用 `.import`/`.uid` 缓存不归档。

## 重建解包结果与网页资产

使用包含 Pillow 的 Python，并安装 `texture2ddecoder==1.0.6`。本机解码依赖副本位于 `output/apk-icons/_tools/`。从项目根目录执行：

```powershell
python scripts/recover-apk.py
python scripts/import-apk-assets.py
python scripts/export-apk-ui.py
python scripts/map-apk-fleet-icons.py
npm run build
```

`recover-apk.py` 默认只读 `research/apk/tap4fun.zip`。也可显式传入原 APK 路径，脚本会在内存中读取其 `assets/tap4fun.zip`；不会执行 APK 或字节码。独立纹理解码同样支持 `python scripts/apk_extract.py [资源 ZIP 或 APK]`。

`import-apk-assets.py` 只输出 HTML 原版素材与 `game/original-*.json`，保持现有玩法和玩家存档。它不再创建 Godot 目录。`export-apk-ui.py` 将新生成的界面 JSON 写入 `research/apk/ui/movies/`，旧转换档案仍单独保留，不被重建覆盖。

## 来源与边界

`ui-index.json`、`ui-structure.json` 记录纹理引用、裁切、组件和动画结构；`lua-index.json`、`enum-definitions.json` 是静态读取的脚本索引与枚举，不能当成原始 Lua 源码。`zh-CN.json` 保存安装包中文文本。`recovery.json` 记录最近一次恢复的输入文件及其 SHA-256；使用资源 ZIP 重建时，该校验值对应 ZIP，不对应整个 APK。

原图映射来自 TFS 帧名、GameFleetDefine/GameResearchDefine 枚举及本地化文本。尚未确认原图对应的建筑或科技不伪称已恢复。当前 12 种三维建筑是参考解包原图重新制作的程序化模型，源文件为 `opendesign/mockups/galactic-command/planet-buildings.js`，导出成果在 `models/generated/apk-buildings-v1/`。

客户端资源并不包含完整的服务器结算、活动配置或原运营账号数据；当前 HTML 玩法仍使用项目保留的规则与存档。解包脚本不会连接原游戏服务器。
