# ASTRAL 星图接入

`astral.html` 保留用户提供的 `C:/Users/Administrator/Downloads/ASTRAL_深空航图.html` 的原生 WebGL 2 渲染、内嵌星球纹理和界面视觉。原文件未修改，SHA-256：`51C98C8C97DDC7B1ED6BC96125BF6B549D826AF191556074CB5FFAE802C51E1C`。

运行文件为 `astral.html`、`astral.js` 和 `astral-bridge.js`；必须一起提供。页面本身不请求游戏 API，不持有会话令牌，也不会直接派遣舰队。星球、轨道半径和银河空间位置采用展示比例；名称、归属、坐标、本方资源来自父页面的实际 snapshot。

## 父子页面协议

所有消息使用相同 `location.origin`；接收端同时验证 `event.origin` 和 `event.source`。ASTRAL 只接受自身父页面发送的消息。

| 方向 | 消息 | 行为 |
| --- | --- | --- |
| 子→父 | `{type:'astral-ready'}` | WebGL、星球纹理和事件绑定完成，请父页发送当前快照及可见状态。 |
| 父→子 | `{type:'empire-state',state,planet,catalog}` | `state` 是 `EmpireAPI.state`，`planet` 是当前本方星球对象，`catalog` 为现有目录。行星依据存档 `biome` 显示 `terrestrial/mercury/mars/gas`，类型名称与矿产分工来自 `catalog.planetTypes`；月球由 `moon` 标识。首次初始化或本方选中星球改变时进入其实际坐标。后续轮询保留用户当前航图选择。 |
| 父→子 | `{type:'empire-visibility',active:boolean}` | `false` 停止 WebGL 绘制、轨道更新和 CSS 动画；`true` 恢复。浏览器标签页隐藏时也停止绘制。 |
| 子→父 | `{type:'astral-system',coordinates:[g,s]}` | 进入某恒星系，请父页调用 `api.refresh([g,s])`，并回传更新后的 `empire-state`。g=1..9，s=1..499。 |
| 子→父 | `{type:'astral-home',planetId}` | 进入真实本方星球/月球建筑视图，父页 `api.setPlanet(planetId)` 并进入主星菜单。 |
| 子→父 | `{type:'astral-task',target,task}` | 打开对应舰队准备页，填入真实目标和任务；不能直接执行 `/api/action`。 |

舰队 `task` 为现有 ID：`attack`、`spy`、`colonize`、`mine`、`explore`。`target` 的三种形式：

- 已占据星球或月球：来自 `state.map` 的真实对象，包含 `id/name/position/owner/biome/npc/npcSkin`，本方条目可合并自己的完整星球资料。`npc:true` 的野怪即使 `owner:null` 仍是敌对据点，`npcSkin` 为数字 APK 皮肤编号。
- 已同步星系的未殖民行星：来自 `state.map`，含 `id:null/name/position/biome/unoccupied:true`，使用后端返回的固定类型，不在浏览器伪造行星类型或 ID。
- 小行星带：`{name:'小行星带',position:[g,s,16],kind:'belt'}`，不含目标星球 ID。

父页派遣须以 `position` 为准，仅当实际对象有 `id` 时填 `target` ID；`ship/task` 条件仍由现有舰队表单及后端核验。没有回传当前星系资料前，空轨道显示“未探明天体”，不能准备殖民。敌方舰队、资源和防御不从外观推测，显示“未侦察”。

## 缩放修复

原稿在动画进行中收到下一次滚轮，会把目标相机改成当前插值位置（仍在恒星系附近）；银河分支又无条件用距离判定切回恒星系，因此连续滚轮反复在两个层级间跳转。

修复保留动画目的地作为下一次滚轮的起点，只有向内缩放才能进入下层、向外缩放才能退出上层。滚轮、缩放按钮、双指缩放共用同一逻辑。恒星系与银河缩放边界按窗口宽高比调整，手机纵向视图不会在初始化距离之外错误截断。旋转拖拽仍能中止飞行；面包屑和 Esc 始终可返回上级。

主星按 `state.player.home` 识别，不再固定第 8 轨道。各恒星系按坐标稳定随机分布类地星、金属岩星、晶体岩星和气态巨星，分别使用 `biome` 值 `terrestrial/mercury/mars/gas`；月球由 `moon` 标识。名称、环境描述与资源规则来自 `catalog.planetTypes`。类型随行星固定，殖民继承该行星原有类型，基地 HUD 只读显示；从星图进入不同本方行星时加载各自的基地与资源。

野怪由 `npc:true` 识别，桥接使用公共记录中数字 `npcSkin` 显示对应 APK 星球图片；其余行星按真实 `biome` 选择四种皮肤。新野怪及旧存档无明确编号的野怪仅从常规池 17–21 分配，同系四张不同、跨系覆盖五张。有效既存 `npcSkin` 或旧 `planet_icon` 的 17–34 编号优先保留；其中特殊图标 22–34 不用于普通野怪随机生成。皮肤首次分配后持久化，战损、回访和读档都不改外观。宇宙种子与坐标的固定轮换是本项目规则；APK 只确认了图标映射，不能据此推断原版服务器分配算法或从皮肤推断野怪等级。

银河切换保留 499 个索引并映射到新银河；点击恒星自动居中，滚轮朝选中目标缩放，不再提供“将选中星居中”按钮。月球显示真实名称和归属，可直接进入本方月球或准备实际侦察。

## 验证

`node tests/astral-selfcheck.mjs` 启动临时静态 HTTP 服务，使用本地 Chrome/Playwright 与虚构的内存 fixture，通过真实 iframe、点击、滚轮和触屏输入检查完整协议。测试完全不调用游戏 API、不给真实存档发操作。

覆盖：真实第 7 轨道、星球→恒星系→银河连续往返、面包屑、任意银河坐标、未知星系禁用殖民、敌方 HTML 名称转义、未侦察信息、殖民地/攻击/侦察/探索/采矿导航消息、同源与父窗口验证、离页停绘制、390px 布局及双指缩放。结果与截图位于 `output/astral-verification/`。

原稿缺陷复现日志在 `output/astral-inspection/original-wheel-bug.json`；其中连续向外滚动曾在 `system/galaxy` 间反复切层。修复测试保留 `wheelTrace` 作为对照。

开发检查可沿用原稿的只读接口 `window.ASTRAL.state.level`、`getCamera()`、`getGoal()`、`getRenderTime()` 和 `isReady()`；`window.AstralEmpire.galaxy` 表示当前银河。正式页面不展示这些实现细节。
