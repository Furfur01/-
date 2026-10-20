# 独立视觉验收

日期：2026-10-18。验收者：独立 `p1_verifier`，未参与页面实现，未修改页面源码。

## 结论

本轮管理 UI 的布局、可读性与滚动验收通过，未发现剩余的布局阻断问题。防御移动目录裁切、动态背景影响公共资源栏/导航对比度，以及首次进入建设页的建筑定位竞态，均已在最新构建中定向目视复验通过。

最终建筑聚焦截图中，金属矿的露天采矿漏斗及工业区、太空电梯的塔架均清晰可见。防御页仍是设施 PNG 叠在共享世界画面上，不是独立炮台 GLB 展示；这是当前正式实现的展示方式。

## 检查范围与方法

- 独立目视检查原路由证据 43 张：14 个管理路由在 1440×900、1280×720、390×844 的初始状态，另含月球切换画面。
- 使用 `tests/command-ui-harness.mjs` 的 `withCommandTest('independent-visual', ...)`，重新加载最新构建，建立独立浏览器上下文、随机端口和临时测试存档/会话。
- 实际等待 `CommandApp.scene.renderer.prepared && !document.querySelector('.universe-loading')`，再捕获稳定建筑、防御画面。
- 新增并逐张检查 23 张截图：两张稳定桌面场景、一张移动防御修复、14 个移动路由滚动到底部的画面，以及建设、防御、舰队、通讯、兑换、设置六页的 1280×720 底部画面。
- 目视检查主业务流程的七张成功证据：取消建设确认、计划编辑、模板预览、防御入队、派遣、派遣失败保留输入、召回。未把这些截图当作独立的业务功能断言；完整功能结果由对应测试负责。
- 最后独立目视检查 `building-focus/metal-focused-1440.png` 与 `shipyard-focused-1440.png` 两张修复后截图。该定向测试由主实现者运行，并检查 `prepared`、`selectedBuilding`、`!buildingFlight` 及 `surfaceFollow`；验收者未重复运行它，单独复核了实际画面。

14 路由：`buildings`、`defense`、`fleet`、`empire`、`logistics`、`reports`、`more`、`rankings`、`alliance`、`chat`、`shop`、`moon`、`missiles`、`settings`。

## 目视结果

- 深石墨底色、薄荷主操作与琥珀警示保持一致；导航、状态、资源和操作区域层次清楚，图像与舰队航线图避免了整页纯文字堆积。
- 三档视口未发现空白页面或页面级横向溢出。窄屏表格采用局部横向滚动，未扩大正文宽度。
- 所检查底部操作可通过实际 `.ui-body` 滚动到达；顶部标题栏和底部导航没有永久遮挡按钮。建设升级、加入计划、防御生产、消息发送、兑换、月球传送及导弹发射区均可见。
- 防御 390 宽卡片实际高度为 112 px，已部署数量完整显示，底部“战略导弹控制”与卡片无重叠。
- 公共顶栏及底栏实际背景为 `rgba(16, 25, 28, 0.96)`，稳定场景经过时资源数字和导航标签仍清晰。
- 对话框的标题、资源摘要和确认操作排列完整，主流程截图没有明显文字裁切或操作重叠。
- 场景准备完成后没有残留加载遮罩。初次只等准备完成及 1.5 秒的截图仍处于建筑定位过程，且暴露了地图尚未就绪时 `selectBuilding` 返回失败却被标为连接成功的竞态。实现者现已检查返回值并在地图就绪后重试；最终等待镜头飞行结束的两张截图可辨识实际金属矿和太空电梯，复验通过。
- 防御表现为 PNG 与共享世界背景组合，未将其描述为独立炮台 GLB 展示。

## 证据

独立脚本：[independent-visual-review.mjs](../../output/playwright/command-ui/independent-visual-review.mjs)。

独立结果：[verification.json](../../output/playwright/command-ui/independent-visual/verification.json)：`passed: true`，`errors: []`，`assetFailures: []`，`temporaryRemoved: true`；浏览过程未发送玩法操作请求。

关键截图：

- [移动防御修复](../../output/playwright/command-ui/independent-visual/defense-mobile-fixed.png)
- [稳定建筑画面](../../output/playwright/command-ui/independent-visual/buildings-stable-1440.png)
- [稳定防御画面](../../output/playwright/command-ui/independent-visual/defense-stable-1440.png)
- [移动建设底部](../../output/playwright/command-ui/independent-visual/buildings-mobile-bottom.png)
- [移动防御底部](../../output/playwright/command-ui/independent-visual/defense-mobile-bottom.png)
- [720 高舰队底部](../../output/playwright/command-ui/independent-visual/fleet-1280-bottom.png)
- [720 高通讯底部](../../output/playwright/command-ui/independent-visual/chat-1280-bottom.png)
- [最终金属矿聚焦](../../output/playwright/command-ui/building-focus/metal-focused-1440.png)
- [最终太空电梯聚焦](../../output/playwright/command-ui/building-focus/shipyard-focused-1440.png)

## 安全与环境

本次仅使用测试 harness 管理的临时存档/会话和随机端口。未连接 8289，未读取或修改正式 `data/universe.json`、`data/session.json`。浏览器、测试服务和临时目录均由 `finally` 清理。

P1 静态原型的旧 8390 地址现返回 404，属于预览服务环境变化，未停止或替换该服务。P1 两项定向复验已改用自身随机端口静态服务完成并关闭，结果见 `opendesign/mockups/p1-command-preview/evidence/browser-verification.md` 与 `verification.md`。
