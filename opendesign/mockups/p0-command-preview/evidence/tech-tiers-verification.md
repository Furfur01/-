# 科技前置层级验收

地址：http://127.0.0.1:8390/opendesign/mockups/p0-command-preview/index.html#research

通过。仅验收本轮分层与视觉，未复测研究或生产业务逻辑，未修改源码。

- 原四类筛选按钮已移除；原四个主题列已替换为 0、1、2、3 级科技。
- 从 catalog 独立计算全部 16 项科技的真实科技前置深度，再与浏览器节点 aria-label 和横坐标逐项对照：全部一致。
- 0 级 6 项位于最左侧：能源科技、间谍科技、计算机科技、武器科技、强度科技、引力子科技。研究实验室和能源产量要求没有计入科技层级。
- 层级项数为 6 / 4 / 3 / 3。15 条科技前置边均从较低层指向较高层。完整图截图中跨层连线从卡片上方绕行，没有看见线穿过卡片内容。
- 1440×900、1280×720、390×844 均无页面水平溢出，研究操作区可见或可通过正常页面滚动抵达。默认视图保持可读字号并从最左的 0 级开始；较低位置和右侧节点需要平移或主动点击全树适配，这与本轮设计约定一致。
- 默认、全树适配、移动视图已分别截图并独立检查。列标题表示依赖层级，节点 Lv 表示已研究等级，两者已有文字区分。
- 浏览器控制台错误 0；没有请求游戏 API，没有外部请求。测试使用独立无头 Chrome context，并在 finally 中关闭。

截图：
- research-prerequisite-tiers-1440.png
- research-tiers-overview-1440.png
- research-prerequisite-tiers-1280.png
- research-tiers-mobile-390.png

最新船坞 APK 原色截图：ship-apk-original-colors-Cruiser-1440.png。已确认左侧 APK 原色和当前巡洋舰模型仍正确显示。

机器结果：tech-tiers-browser-report.json。
