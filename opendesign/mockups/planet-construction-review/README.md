# AURORA 行星建造与地貌

正式游戏：`http://127.0.0.1:8289/`  
独立样板：`http://127.0.0.1:8389/opendesign/mockups/planet-construction-review/`（`npm run preview:review`，与正式游戏分开端口）
四类行星图录：`../galactic-command/colony-atlas.html`

## 正式接入

普通行星使用共享的原生 WebGL AURORA 画面；月球保留原来的 Three.js 场景。三类矿场各与对应仓储合为一个升级入口，沿用矿场标识，全球共14个功能槽位。地面可见的仓储附属结构仍是综合体的一部分。旧等级、资源和已付费队列按 `game/resource-complex-migration.md` 兼容。

飞船基地表现为太空电梯和轨道船坞。真实造舰队列驱动装配进度；队列为空时，船坞空置。原导弹设施改为行星保障中心外观；内部旧标识和已有功能保留，以兼容现有战争与存档规则。

正式界面提供全球、地貌、三个采储区、太空电梯和轨道船坞快捷操作。父页面把真实建筑等级、生产效率、仓满状态和队列传入渲染器；渲染器自身不提交经济操作。关闭或隐藏视图不停止服务端生产。

## 四种环境

- 类地：用户原始 AURORA 画风，四片连续大陆、海洋、森林和贴地矿区。
- 金属：17片近黑玄武岩板块，深熔岩河、破口火山、沿山体分叉的熔流与扩散烟羽。
- 火星：赤红厚高原、贯通深谷、青蓝与紫色晶体林。
- 气态：木星云带、三层差速大气、旋转风暴；建筑和运输路线共用浮空平台。

金属与火星按 `reference/metal-volcano-user.png`、`reference/mars-rift-user.png` 建模。图片只作为造型参考，不作为规则或数据来源。

## 独立审阅

`index.html?biome=terrestrial|mercury|mars|gas` 可预览对应环境。独立样板仍提供未建、施工、生产、升级、缺电、仓满与停产状态切换，以及暂停、慢放和矿区动画。这里的演示等级与生产频率不写入正式游戏。

`data-review.html` 的179项待补建议仍需逐项批准；标记、备注和导出不会自动修改正式数值。`evidence.html` 保留类地星多角度截图、三类采集和电梯录像；`colony-v1.html` / `evidence-v1.html` 为早期样板存档。

`aurora-slot-map.json` 是早期17个视觉组件的对照资料；正式14槽位及版本以 `game/surface-layout.mjs` 为准。

## 构建与验证

`node scripts/build-colony-review.mjs` 组合 runtime、biomes、volcanoes、bridges、terrain、elevator、geology、game-bridge，并通过 shell 生成共享入口。`npm run build:command` 同时构建正式游戏适配层。不需要外部模型或联网素材。

`npm test` 运行游戏与渲染几何回归。`tests/aurora-game-integration.mjs` 验证真实队列与界面接入；`tests/aurora-environment-ui-selfcheck.mjs` 验证地貌镜头、GPU缓冲和移动端控件。这两项浏览器测试只对8292隔离验收存档执行。图像验收记录位于 `output/playwright/aurora-plateau-review/`。

当前已接入普通行星建造视图；银河—星系—地表单一连续视口仍是后续导航工作，不能把矿区镜头测试当作该项完成证明。
