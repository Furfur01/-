# 银河帝国 · HTML 项目

双击桌面 **银河帝国启动器** 或项目内 **`银河帝国.cmd`**（旧入口 `启动HTML版.cmd` 也可用）。启动器是独立的后台监控窗口：打开后自动连接已有后台；未运行时点击“启动后台”，点击“进入游戏”打开浏览器。**关闭监控窗口不会停止后台**，需要停服时点击“保存并关闭后台”。窗口每秒刷新进程、运行时长、存档路径、最近保存时间、当前账号和日志，提供已有账号切换；切换后游戏页面会在下一次刷新时同步。账号列表只包含当前宇宙中的玩家，不包含机器人；首次进入游戏才会创建账号。一个端口只打开一个监控窗口。

游戏地址：http://127.0.0.1:8289/ 。需要本地 Node.js 服务，不能直接双击 HTML 文件。AURORA 原生 WebGL 星球、Three.js 月球及素材均保存在本地。命令行打开启动器：`node scripts/launch-html.mjs`；只读检查状态：`node scripts/launch-html.mjs --status`；只读检查页面和接口：`node scripts/launch-html.mjs --check`。`/api/health` 提供不创建账号、不推进游戏的健康检查。开发时 `npm start` 启动的后台同样可以被监控窗口连接和关闭。旧版后台需先通过旧启动器保存退出，再启动新版。正式后台日志位于 `output/galactic-command/server.log`；使用独立存档的测试后台默认写入该存档旁的 `.log` 文件。

2026-10-12 已清理 Godot 工程、原生启动入口、旧 Blender / Tripo 建模文件及相关缓存。当前 HTML 运行、构建和战斗结算不依赖 Godot 或 Blender。

2026-10-15：战场、驾驶、回放与靶场默认使用 Three.js；原生 WebGL 已冻结归档，仍可显式打开对照。见 [Three.js 说明](game/three-battle.md) 和 [原版归档](game/legacy-webgl-archive.md)。仓库的大型模型通过 Git LFS 提供，首次克隆后先运行 `git lfs pull`；上传与大文件规则见 [GitHub 版本管理](game/github.md)。`output/` 中的录像、测试结果和本地建模恢复备份保留在本机，不随仓库上传。

2026-10-16：历史战报在独立的只读回放页播放，默认展示双方舰队全景，支持暂停、倍速、拖动进度和播放结束后重新播放。正在交战的舰队继续使用实时星图。回放入口与记录一致性检查：`node tests/replay-player-browser.mjs`（使用隔离测试存档）。

## 保留内容

- `opendesign/mockups/galactic-command/`：当前 HTML 界面、三维星球、建筑工坊、ASTRAL 星图与舰船机库。
- `opendesign/mockups/galaxy-empire/`、`client/`：旧网页源码及当前仍共用的图片、原版音频和图鉴资源。
- `game/`、`server.mjs`：游戏数值、经济规则、Node 战斗结算与本地 API。
- `data/universe.json`：原宇宙进度；`data/session.json`：原账号；其他存档备份也保留。请勿公开分享 `data/`。
- `scripts/`、`tests/`：HTML 构建、解包工具及验证；舰船可编辑源文件在 `scripts/hangar-source/`。
- `research/apk/`、`output/apk-icons/`、`output/apk-inspection/`：APK 原始解包包体、图集、TFS、Lua 字节码、文本与恢复索引。
- `research/`：HTML 数值依据、素材来源及参考资料。
- `models/generated/apk-buildings-v1/` 和同名 ZIP：本轮制作的 12 个建筑模型及预览图。
- `output/`：保留下来的 HTML 检查、截图、运行日志和本次清理清单。

## 开发与检查

2026-10-16 账号隔离：普通 API 请求不再自动创建账号。只有首次进入空白宇宙才创建账号；会话丢失时恢复唯一已有账号，有多个账号则在启动器中选择。测试必须使用独立端口和 `EMPIRE_SAVE_FILE`；未指定 `EMPIRE_SESSION_FILE` 时，测试会话默认保存为 `<测试存档>.session`，禁止共用 `data/session.json`。测试结束后清理临时存档和账号，浏览器验收不得连接个人游戏服务。

2026-10-15 单机经济调整：三种资源生产提高到此前的5倍；矿场升到11级起，以原10级费用为基准，每级增长25%。已有存档、等级和进行中的队列保留。见 [单机经济说明](game/single-player-economy.md)。

后续玩法设定：[死星由月球改造，作为可部署的防守地形](game/death-star-design.md)（仅记录，暂不实现）。

```powershell
npm install
npm run build
npm test
node scripts/launch-html.mjs --check
```

只重建当前界面可执行 `npm run build:command`。`npm run build` 也重建保留的旧网页。

普通攻击与毁月前置战斗使用实时空间战场；靶场保持独立练习。真实舰队自动交战，也可接管自己的正式战斗舰。入口、操控、存档备份和隔离验收方法见 [真实战场说明](game/spatial-battles.md)。更新后需要重新启动 Node 服务。

各恒星系随机分布四类行星：类地星拥有三类矿产，金属岩星金属 ×3，火星岩星晶体 ×3，气态巨星浮空基地气体 ×3。类型随星球固定，从星图进入本方星球自己的基地；无人星球殖民后继承原有类型，基地内不提供手动变更。野怪星球固定使用五款已确认的三维模型，按 Lv 1–5 分为遗落货仓、废弃前哨、赤铁守备站、卡戎舰队、苍穹裂隙；周围有装饰巡逻舰。见 [野怪星球说明](game/npc-planets.md)。三类资源均可运输与仓储，月球规则不变。原账号通过本机同源接口 `/api/session/local` 恢复，不会公开返回凭据。存档与会话文件不能通过静态 HTTP 下载。

[HTML 操作说明](opendesign/mockups/galactic-command/README.md) · [APK 恢复说明](research/apk/README.md)

2026-10-14：AURORA 样板已接入正式星球视图，普通行星采用14个球面固定建筑功能。三种采储综合体各自统一升级；原仓库等级保留容量保底。太空电梯连接轨道船坞，造舰演出跟随真实队列。金属星为熔岩大陆和活火山，火星为晶体裂谷，气态巨星为多层木星云带、风暴与浮空平台。建设、研究和造舰通过侧栏操作。迁移细节见 [采储合并说明](game/resource-complex-migration.md)。

银河、恒星系、行星和月球现已共用一个持久 AURORA 视口。开场从银河视角定位本方母星所在星系；滚轮可在任意距离停住，拖动环绕，右键平移，双击平滑靠近。四类行星及月球均提供高精度地貌，本方显示基地，其他天体不展示建筑。未建建筑不再绘制蓝色线框。

只开放第 1 银河的 499 个恒星系，其他银河原存档保留。星系与 7,485 个行星有固定编号和目录名称：[名称表](output/star-map/names.csv)。重构说明、只读星图接口及隔离验收方法见 [连续星图说明](game/universe-navigation.md)。

2026-10-15：母星主基地现作为「帝国王庭」进入帝国总览，支持跨星球建设计划与批量发展模板预览、应用。建设计划逐项扣费、自动接续并支持离线推进；旧存档默认不启用。更新后需重启启动器载入服务。见 [王庭与建设计划说明](game/imperial-court.md)。
