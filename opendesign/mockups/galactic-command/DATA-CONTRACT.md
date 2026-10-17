# Galactic Command 数据接入

这是现有 Godot 项目的浏览器客户端，复用 `server.mjs`、`game/engine.mjs` 和 `data/universe.json`。不另建一套经济规则，不复制玩家存档给前端。

## 现有玩家

2026-10-10 检查：`godot/scripts/api.gd` 从 `res://data/session.json` 读取 Cookie，向 `http://127.0.0.1:8289` 发请求。对应原有玩家「指挥官」，主星「新地球」[1:16:7]，殖民地「霜原」[1:16:10]，月球「静海」[1:16:10]；有 7 份报告。新地球的金属矿 13 级、飞船基地 9 级、研究实验室 9 级。两个人类玩家同名，故不能按名字选择账号。

`POST /api/session/godot` 优先衔接有效 Godot 会话，缺失时使用现有浏览器会话，再缺失才建新玩家。仅接受本机环回连接、本机 Host/端口、严格同源 Origin、`X-Empire-Client: galactic-command`，浏览器带 Fetch Metadata 时要求 `same-origin`。响应只有 `{source:"godot"|"browser"|"new",name}`；凭据只通过 HttpOnly / SameSite=Strict Cookie 设置，不在衔接响应里返回。沿用已有 API 的玩家身份字段，不改变旧 Godot/React 的身份比较逻辑。本地开发服务仍只监听 `127.0.0.1`。

## 浏览器接口

先加载普通脚本 `api.js`，再使用 `window.EmpireAPI`：

```js
const api = window.EmpireAPI;
const unsubscribe = api.subscribe(api => render(api));
await api.init();
api.setPlanet(api.state.player.home);
await api.action({type: 'build', id: 'Metal_Mine'});
await api.refresh([1, 16]);
const replay = await api.replay(reportId);
```

| 成员 | 约定 |
| --- | --- |
| `init()` | 衔接会话→读取 catalog→读取 snapshot；启动 3 秒轮询。成功返回 snapshot，失败 null，可重试。 |
| `refresh([galaxy, system]?)` | 读取真实星系；省略坐标沿用最近选择。坐标分别限制 1–9、1–499。 |
| `action(payload)` | POST 真实操作；默认补当前 `planet`；显式 `payload.planet` 可覆盖。成功返回 snapshot，失败 null。正在操作时第二次调用返回 null。 |
| `replay(id)` | GET 战报，返回 `{version:3,report}` 或 null；不启动外部窗口，不重新结算。 |
| `subscribe(fn)` | 立即以及每次状态变化调用 `fn(api)`，返回取消订阅函数。 |
| `setPlanet(id)` | 选择自有星球，保存到既有 `galaxy.planet` localStorage；成功 true，否则 false。 |
| `state`, `catalog`, `planet` | 当前真实 snapshot、规则目录、选中自有星球；初始化前 null。 |
| `now` | 毫秒服务器时间（浏览器本地时钟加最近同步偏差）。 |
| `loading`, `busy`, `connected`, `error`, `sessionSource` | 首次加载、操作等待、连接、最近错误文字、会话来源。 |

页面隐藏时暂停轮询，恢复可见立即刷新。请求超时 30 秒。较旧轮询不会覆盖后发操作的结果；所有网络错误转成状态，不产生未处理 Promise 拒绝。界面应在 `busy` 时禁用提交，成功操作后用返回快照更新。计时显示用 `api.now`，不凭客户端倒计时直接发放产物。

## Catalog 与快照

`GET /api/catalog` 与检查时的 `godot/data/catalog.json` 完全一致：20 建筑、16 科技、25 单位。目录字段：`buildings`, `tech`, `units`, `missionNames`, `rules`。

条目使用稳定 `id`；显示名用 `name`。`cost` 顺序始终是 `[金属,晶体,气体]`；`req` 是 `[[建筑或科技ID,所需等级],...]`。建筑/研究升级实际价格和时间以 snapshot 中的 `buildOptions[id]` / `researchOptions[id]` 为准；不要只显示基础价格。研究条件的当前等级读 `state.player.tech`，建筑条件读选中星球的 `buildings`。

| snapshot 字段 | 内容 |
| --- | --- |
| `now` | 服务器当前毫秒时间 |
| `player` | `id,name,home,tech,researchQueue,alliance,darkMatter,parts` |
| `planets` | 仅自己的星球完整数据；含月球 |
| `map` | 已访问星系的公共星球资料：`id,name,position,biome,owner,ownerName,moon,parent,npc,npcSkin,commander,debris`。每系补齐 15 个轨道；未殖民行星为 `id:null, unoccupied:true`，按坐标派遣。野怪以 `npc:true` 判断，不依赖 `owner`；`npcSkin` 为其持久化的数字皮肤编号。普通星球与月球为 null，未殖民记录可省略。不含敌方舰队/资源。 |
| `missions` | 自己的舰队任务和指向自己的来袭警报；来袭条目含 `inbound:true` |
| `reports` | 已保存的战斗/侦察/探索/舰队报告；`id,type,at,read,title` 及类型专属字段 |
| `alliances,chat,rankings,factions` | 现有联盟、聊天、排名、阵营数据 |

星球含 `id,name,position:[银河,星系,轨道],moon,parent,temperature,diameter,fields,usedFields,resources,buildings,ships,defense,layout,buildQueue,shipQueue,economy,buildOptions,researchOptions`。

`economy`：`supply,demand,ratio,rate:[每小时产量],capacity:[储量上限]`；能源余额为 `supply-demand`。`fields` 是已含改造器/月球基地增益的总方圆。`layout` 是旧 1600×1120 平面坐标，可映射成 Three.js 建筑位置；建模风格无需沿用旧图块。

`catalog.planetTypes` 定义四类地形与矿产倍率。普通行星 `biome` 由持久化宇宙种子和坐标分配，回访、读档和殖民不会重抽；既有存档类型保留。客户端只能从星图进入所选自有星球，不能提交 `planetType` 改写类型。

野怪模型与普通四类地形分开。五种类型以 `npcType` 固定映射：outpost→18、garrison→20、charon→19、cargo→28、fracture→34（苍穹裂隙）。公共资料增加 `npcLevel,npcThreat,npcColor,npcSymbol,npcPatrols`，不泄露当前舰队或资源。`npcSystems` 版本 2 仅为旧系追加第五类，已有资源、战损、坐标与任务保持不变。`/api/star-map` 与正式初始化共用位置规划器，目录读取不产生写入。未归类的旧特殊 NPC 仍保留合法旧皮肤编号。巡逻只是视觉装饰，不是任务或战斗单位。详见 `game/npc-planets.md`。

`buildOptions[id]`：`cost,seconds,downgradeCost,downgradeSeconds,energy`。`researchOptions[id]`：`cost,seconds,energy`。建筑/研究队列为 `{id,level,start,end,planet,cost}`；拆除含 `mode:'downgrade'`。造舰队列为 `{id,count,remaining,each,start,end}`，其中 `end` 是下一艘完成时间，`each` 单位秒，全部完成时间为 `end+(remaining-1)*each*1000`。造舰基础单艘时间沿用 engine：

```js
Math.max(2, Math.ceil((unit.cost[0] + unit.cost[1]) * 1.44 /
  (((planet.buildings.Shipyard || 0) + 1) *
   2 ** (planet.buildings.Nanite_Factory || 0) * catalog.rules.constructionSpeed)))
```

## 操作 payload

以下都使用 `POST /api/action`。`planet` 由适配器默认补齐；服务端负责资源、归属、前置条件、队列和数量校验。

| 类型 | 额外字段 | 约束 |
| --- | --- | --- |
| `build`, `downgrade` | `id` 建筑 ID | 一个星球只有一条建筑任务；降级也扣资源 |
| `research` | `id` 科技 ID | 整个玩家只能有一项研究，月球不能研究 |
| `cancel` | `kind:'build'|'research'` | 在任务所在星球取消并退资源；造舰不能取消 |
| `ship` | `id`, `count` | 整数 1–10000；舰船/防御共用船坞队列，最多 8 项 |
| `dispatch` | `ships:{单位ID:数量}`, `position:[g,s,slot]`, `task`, `target?`, `speed`, `cargo:[m,c,g]`, `holdHours?` | 单次总舰数≤20000；速度 10/25/50/75/100；目标 ID 必须与坐标一致 |
| `recall` | `id` 任务 ID | 可召回 outbound/holding；返航不能再次召回 |
| `read` | `id` 报告 ID | 标记已读 |
| `readAll` | 无 | 标记全部已读 |
| `renamePlanet` | `name` | 1–12 字符 |
| `rename` | `name` | 玩家名 1–16 字符 |
| `place` | `id,x,y` | 原布局坐标；资源设施和航空港固定，其他位置需合法 |
| `scan` | `target` 星球 ID | 月球雷达≥3；消耗气体 50000 |
| `jump` | `target`, `ships`, `cargo?` | 自有两端月球虫洞；不能携带资源；冷却 1 小时 |
| `missile` | `target,count,priority?` | 消耗已有星际导弹，目标/射程/防御优先 ID 受校验 |
| `alliance` | `mode:'join'|'leave'|'create'`, `id?`, `name?` | join 需要联盟 ID，create 需要名字 |
| `chat` | `text,channel` | ≤160 字；`channel:'alliance'` 要求已有联盟 |
| `purchase` | `resource:0|1|2,size:1|10|100,quantity:1..100` | 消耗已有暗物质；本地无充值 |

任务名从 `catalog.missionNames` 获取：`attack,spy,recycle,transport,deploy,colonize,explore,mine,destroyMoon`。探索/采矿沿用轨道 16 接口；银心黑洞探索抵达后固定停留 `rules.explorationSeconds=1800` 秒，往返另算，忽略客户端 `holdHours`。采矿停留 1..4 游戏小时，每游戏小时对应 60 秒。探索需要天体物理 1 级，名额 `floor(sqrt(等级))` 含返航任务；发现量独立抽取，装载量取发现量与舰队总仓容量的较小值，资源及暗物质均返航入账。探索报告含 `discovered:{resource,amount}`（无发现为 null）、`capacity`、`cargo`、`darkMatter`；资源索引 0/1/2 对应金属/晶体/气体，暗物质为 `darkMatter`。侦察需 Probe，回收/采矿需 Recycler，殖民需 Colony_Ship。运输/驻扎/殖民之外任务的 cargo 必须全零。任务时间/燃料计算由服务端确认；不可用前端展示替代服务端结算。完整规则见 [银心黑洞探险](../../../game/black-hole-exploration.md)。

## 单位显示映射

| ID | 名称 | 类别 |
| --- | --- | --- |
| Light_Fighter | 轻型战机 | combat |
| Heavy_Fighter | 重型战机 | combat |
| Cruiser | 巡洋舰 | combat |
| Battleship | 战列舰 | combat |
| Dreadnought | 无畏舰 | combat |
| Bomber | 行星轰炸机 | combat |
| Destroyer | 驱逐舰 | combat |
| Death_Star | 死星 | combat |
| Guardian | 守护者 | combat |
| Cargo_Ship | 轻型运输舰 | civilian |
| Large_Cargo_Ship | 重型运输舰 | civilian |
| Colony_Ship | 殖民舰 | civilian |
| Recycler | 回收舰 | civilian |
| Probe | 探测器 | civilian |
| Solar_Satellite | 太阳能卫星 | civilian（不可派遣） |
| Rocket_Launcher | 火箭发射器 | defense |
| Light_Laser / Heavy_Laser | 轻型 / 重型激光炮 | defense |
| MK2_Cannon | 磁轨炮 | defense |
| Ion_Cannon | 中子炮 | defense |
| Plasma_Cannon | 等离子炮塔 | defense |
| Small_Shield_Dome / Large_Shield_Dome | 小型 / 大型防护盾 | defense（每种最多一座） |
| Interceptor_Missile / Interplanetary_Missile | 拦截 / 星际导弹 | defense（missile:true） |

建模替换只改变外观，必须保持这些 ID、实际性能、造价和前置条件。

## 服务与验证

`node server.mjs` 默认监听 127.0.0.1:8289，根路由 `/` 指向此目录的 `index.html`；原 `/opendesign/` 及旧客户端路径继续可用。会话文件和 universe 文件不在静态文件白名单内。

正式战斗现在由 `game/node-combat.mjs` 在 Node 内结算，记录 `simulation.implementation:'node-v1'`；新浏览器使用 GET 回放已有战报，无需启动 Godot。旧 POST 回放接口也返回同样的浏览器回放数据。账号已迁至 `data/session.json`，历史迁移存档备份位于非公开的 `data/backups/`。

`node --test tests/galactic-command-api.test.mjs tests/system-npcs-api.test.mjs tests/sandbox-api.test.mjs` 验证：Godot 旧存档衔接、防跨站请求、浏览器/新玩家回退、不增加已有账号、旧操作/报告 API 保持兼容、陈旧轮询保护、重复提交阻止、断线重试。测试使用临时宇宙与临时会话，不对真实存档下发操作。

`node tests/galactic-command-ui-selfcheck.mjs` 使用本机已安装 Playwright 与 Chrome，在 8291 临时启动独立宇宙和会话，通过实际界面验证资源增长后按钮恢复、建筑和研究的开始/取消、造舰、运输/召回、来袭警报、侦察与奖励/战损报告、回放及首次舰型预览。测试结束自动停服并删除临时宇宙；截图与断言结果保存在 `output/galactic-command-verification/`。真实 8289 仅浏览验收，没有测试操作。
