# P1 独立浏览器验收

日期：2026-10-17；Chrome / Playwright 独立非持久会话 `p1-verifier`。

仅访问 `http://127.0.0.1:8390/opendesign/mockups/p1-command-preview/index.html` 及其静态资源。使用独立 localStorage 示例，未读取或修改正式存档，未创建游戏账号，未连接 8289，未停止交付服务。第一轮结束后已清空本次独立会话 localStorage 并关闭验收浏览器；额外回退上下文在 finally 中关闭。

## 第一轮结论

四个页面的显示、滚动、模型与主要操作已完成验收。发现移动触摸目标与 WebGL 上下文清理两项待修复细节；正式结论以末尾复验为准。

| 检查 | 结果 |
| --- | --- |
| 1440×900、1280×720、390×844 × 四页面 | 12 组合均无页面横向溢出，`scrollWidth === clientWidth`；未见空白页或关键操作遮挡 |
| 桌面内部滚动 | 建设目录、前置条件、王庭表格和模板面板均实测滚轮滚动，底部控件可达 |
| 窄屏滚动 | 页面纵向滚动；王庭表格内部横滚；计划弹窗内容可达 |
| 资源 | 第一轮 138 次浏览器请求均 200；所有检查页面无损坏图片 |
| 建筑/防御模型 | Metal_Mine、Plasma_Cannon、大小护盾 GLB 实际加载；建筑和等离子炮三维画面已目视检查 |
| WebGL 不可用 | 另建上下文，仅阻断 WebGL context 创建；建筑与等离子炮回退图片可见、naturalWidth 大于 0；两条预期的初始化 error，无应用崩溃 |
| 普通控制台 | 0 error；一条 Three.js 着色器数值精度 warning；多次切页后出现 WebGL context 数量 warning（待修） |

## 已完成操作

34 项实际交互断言全部通过，脚本与截图保存在同目录。

- 建设：开始升级、出现当前施工、取消施工、全额退款；霜庭资源不足拦截；纳米工厂前置条件拦截；固定建设区 14 个槽位和点击切换设施。
- 计划：启用、暂停、上下排序、增加目标；两颗殖民地批量预览与应用；不提前扣费；殖民地搜索和从行跳转建设页。
- 防务：两座等离子炮入队；60× 推进、完成生产、部署数量增加；已有小型护盾不可重复生产。
- 舰队：三步选择目标、运输舰数量、物资、速度并派遣；驻港舰船扣除；任务详情、召回、返航筛选、召回完成；来袭筛选和详情；运输抵达卸货、清空货舱、自动返航并恢复驻港数量。
- 示例控制：重置、暂停、60×；暂停后状态保持不变。

## 第一轮问题

1. 390×844 下部分交互目标小于 OpenDesign 要求的 44×44：殖民地下拉 61×16，王庭选择框 16×16，暂停按钮 26×44，分类按钮宽 34，任务按钮高 42。截图 `construction-390.png`、`court-390.png`；完整实测见 `browser-layout-before-fix.json`。建议扩大窄屏点击区域，复选框可保留小图形并以 label 扩大热区。
2. 反复切页/殖民地后出现 `Too many active WebGL contexts`。建议 Stage 卸载时除 dispose 之外主动释放 context，随后用多次导航验证。
3. README“大型货船”与 UI“重型运输舰”称呼不一致，可顺手对齐。

## 证据索引

- `{construction,defense,fleet,court}-{1440,1280,390}.png`：12 个完整页面截图。
- `construction-active.png`、`construction-blocked.png`、`construction-map.png`：施工、条件与槽位。
- `plan-desktop.png`、`plan-mobile.png`、`plan-mobile-scrolled.png`、`template-preview.png`：计划与批量预览。
- `defense-production.png`、`fleet-confirm.png`、`fleet-recalled.png`、`fleet-incoming-mobile.png`：生产和舰队。
- `construction-fallback.png`、`defense-fallback.png`：模拟 WebGL 不可用后的图片回退。

## 范围与限制

本次只验收静态示例界面，没有连接正式接口；攻击、侦察、殖民等战斗/奖励结算不在原型本次范围。仅 Chrome 桌面与窄屏视口，未使用真机 Safari。截图为各流程节点，瞬时 toast 和页面入场动画不作为持久布局缺陷。

## 修复后复验

待实现者修复后更新。
