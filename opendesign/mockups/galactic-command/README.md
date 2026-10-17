# 银河帝国 · HTML 指挥界面

双击项目根目录 `启动HTML版.cmd`，或运行 `npm start` 后打开 http://127.0.0.1:8289/ 。页面需要本地服务；不要直接双击 HTML。AURORA 原生 WebGL 星球、Three.js 月球和全部模型已打包到本地，不依赖 CDN、Godot 或 Blender。

## 操作

- 主星：点击星球或「靠近殖民地」进入地表。拖动环绕、滚轮缩放，点击实体建筑查看等级和升级操作。「返回轨道」拉远镜头。
- 星图与星球：开场从银河视角定位母星所在星系。银河、499 个恒星系、全部行星与月球使用同一视口连续缩放，可任意停留、反向滚动和环绕；右键拖动平移、双击靠近。所有天体可查看高模地貌，本方显示基地，非本方不显示建筑，未建建筑不显示蓝色线框。只开放第 1 银河，原有其他银河数据保留。
- 采储综合体：金属、晶体、气体各只有一个建造与升级入口，开采端与仓储端使用同一等级。旧仓库等级作为容量保底，不抬高生产等级或升级费用。单矿星仍可升级非本地资源的仓储部分，但不产矿、不消耗开采电力。月球继续使用独立仓库。
- 星球布局：14个固定功能分布在全球，沿球面法线站立，升级保留原址。类地星为连续大陆、森林和三类矿区；金属星的大陆由熔岩分割并分布活火山；火星高原由长满晶体的裂谷切分；木星式气态巨星具有多层云带和旋转风暴，建筑设在浮空平台。导弹露天阵地换为行星保障中心的封闭后勤楼。
- 太空电梯：地面货运终端、双舱缆索和开放式轨道船坞。只有当前造舰队列生产舰船时，轨道工位才出现船体拼装与焊接。仓满、缺电、施工状态同步到采集演出；经济仍由服务端结算。
- 建设：在星球旁的侧栏管理当前殖民地的设施。研究与造舰打开完整工作区，切换殖民地时保留当前页面，并更新真实资源、设施条件与队列。船坞包括战斗舰船、民用舰船与行星防御。
- 舰队：选择驻港舰船、坐标、任务和装载资源；「飞行中」查看状态或召回。任务会改变真实存档。
- 舰船档案：保留观察、驾驶与试射交互，显示真实库存和目录参数；“进入靶场”默认打开 Three.js 独立靶场。
- 战场：正式战斗、驾驶和空间战报回放默认使用 Three.js。战场列表的“战场版本”可显式选择已归档的原版 WebGL，供同场对照；独立演练不消耗正式存档资源。
- 指挥：排名、联盟、通讯、资源兑换、月球雷达、虫洞与设置；星际导弹入口位于舰队页。

## 数据与维护

科技树与船坞源码位于 `client/command-p0/`，使用现有 `EmpireAPI`，没有演示存档或本地模拟。科技按真实前置深度从 0 级向右排列；建筑和能源门槛单独显示。研究可取消并返还资源，造舰投产后不可取消。共享仓库、研究网络、护盾唯一性和导弹储位均沿用服务端规则。

`node scripts/build-command-p0.mjs` 重建 `operations.bundle.js`、`operations.css` 和 `assets/p0/`，已接入 `npm run build:command`。舰船列表使用原始 APK 图片，三维预览由当前 `createShipModel()` 导出并保留原材质；资源来源记录在 `assets/p0/sources.json`。`node --test tests/command-p0.test.mjs tests/galactic-command-api.test.mjs` 检查适配与接口，`node tests/command-p0-browser.mjs` 使用随机端口和临时存档验证真实操作；浏览器证据位于 `output/command-p0-verification/`。

行星防御预览复用 `scripts/three-flight/defense-models.js#createDefenseModel()`：6 种炮台使用已导入的 Foundry 模型，大小防护盾使用现有护盾模型，均可旋转、缩放和复位。导出时保留炮台的材质发光信息。拦截导弹和星际导弹尚无专用模型，继续显示原有图片；不会将通用炮台冒充导弹模型。

沿用 `data/universe.json`，通过本机同源接口 `/api/session/local` 读取 `data/session.json` 中的账号。资源、殖民地、建筑布局与等级、舰队、科技和战报不另建演示存档。会话文件及原始宇宙文件均不能从静态 HTTP 路径读取。历史迁移存档备份在 `data/backups/`。

主入口 `index.html`，界面 `command.js` / `command.css`，网络层 `api.js`，AURORA 接入器 `planet.js`、月球 `planet-moon.js`、共享渲染源码 `../planet-construction-review/aurora-*.js`，真实战场入口由 `live-battle.js` 管理。`npm run build:command` 重建星球脚本、舰船档案及 Three.js 战场；`npm run build` 同时重建旧网页。旧网页及共用素材保留在 `/opendesign/mockups/galaxy-empire/`；Godot 工程与旧建模链路已于 2026-10-12 清理。

Three.js 战场源码位于 `scripts/three-flight/`，由 `scripts/build-three-flight.mjs` 生成 `battlefield-three.html`、`hangar-three.html`、`three-flight.bundle.js` 和 `three-flight-assets/`，沿用现有 `createShipModel()` 模型资源。`scripts/build-command.mjs` 的旧资源生成步骤仍保留，但正式战场逻辑应维护在共享 ES 模块中；不要直接修改构建产物。

2026-10-15：Three.js 设为正式默认，原生 WebGL 版归档至本目录的 `legacy-webgl/`。`legacy-webgl/manifest.json` 固定版本 `webgl-before-three-20261015` 及各资源哈希，构建只校验，不刷新归档。需要原版时显式打开 `legacy-webgl/battlefield.html?battle=ID`、`legacy-webgl/battlefield.html?replay=ID` 或 `legacy-webgl/hangar.html?ship=Dreadnought`。

本目录的旧 `battlefield.html`、`hangar.html` 是兼容转向页，构建时重新生成，保留全部查询参数及 URL 片段并进入对应的 Three.js 页面。`map=death-star` 例外，仍进入对应归档页面；死星专用地表和壕沟演练未迁移。不要将兼容页改回旧渲染实现，也不要修改冻结清单以绕过校验。详见 [Three.js 使用与复跑说明](../../../game/three-battle.md) 和 [原版归档说明](../../../game/legacy-webgl-archive.md)。

2026-10-13：舰船档案中的驱逐舰、深空吞噬者改用 `ships-three-view.js` 从空白几何重建，参照找回的原始 Tripo 正、侧、俯三视图。旧舰体保留；新版 GLB、同尺度对照图与检查记录在 `models/generated/three-view-rebuild-01/`。深空吞噬者的三角形是舰首截面，不能再按尖三角俯视轮廓建造。查看器正面、侧面按钮使用正交轴向视角，模型说明中提供三视图对照链接。

## 早期原型记录

以下边界及测试材料对应早期 HTML 原型，不代表当前 Three.js 正式战场的模型数量或空间模拟方式。当前版本范围、独立存档测试和性能证据见上文 Three.js 说明；历史报告保留当时版本及结论。

正式结算已迁至 `game/node-combat.mjs`，继续使用原目录数值、科技倍率、护盾、速射和回合时序。它不重现 Godot 的逐舰空间导航、瞄准及碰撞；大舰队按舰型聚合，超长速射链使用有上限的近似。真实战报胜负、损失、掠夺与幸存舰船以保存的结算为准，三维轨迹是演出。缺少时间的旧战报按每回合 6 秒展示，并在画面标识。

舰船档案有 5 个详细模型，新增两型根据图片手工构建；两万舰战场使用 4 类简化模型和实例化渲染。没有逐一重建所有旧 Godot 舰型、音效和动画；这版侧重当前参考图风格与核心经营、派遣和战斗闭环。无 WebGL 实例化支持的设备限制为 1,000 艘，低端显卡帧率尚未实测。

检查：`npm test`；`node opendesign/mockups/galactic-command/mass-battle-selfcheck.mjs`；`node tests/galactic-command-ui-selfcheck.mjs`（隔离存档，涵盖星图进入四类基地、非己方权限、仓储和主要经营操作）。浏览器实测材料在 `output/galactic-command-verification/`。

迁移说明：[采储合并与固定球面槽位](../../../game/resource-complex-migration.md)。本轮未将待补数据审阅表的其他建议写入正式规则。



### 2026-10-16 界面收减

- 星图默认仅显示当前位置、主要导航和工具入口。殖民地、轨道、视角与天体档案互斥展开；单击天体显示档案，单击空白或 Esc 收起。滚轮和自动镜头过渡不会弹出档案。
- 缩放、平移、复位、势力边界和操作帮助集中在“视角”；造舰、研究、战场与王庭仍可从“更多”进入。
- 玩家舰船档案为 ships.html，仅使用当前结算目录中的数值与速射。缺少可用配置的舰种显示“暂未开放”，不以推测参数替代。
- 模型版本、线框、GLB 导出、原图与实现说明、拟定克制方案集中在独立的 ships-review.html。两页共用查看器与构建产物。
- 回放仍读取保存的战报；这次调整仅清理界面，未改动战斗结算或经济规则。
