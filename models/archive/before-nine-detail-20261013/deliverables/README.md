# 剩余舰队重建 · 11 艘

2026-10-13。新模型从空白程序几何制作，使用异形装甲块、低矮炮座及实体连接。旧模型均保留。预览：`http://127.0.0.1:8291/mockups/galactic-command/remaining-review.html`。

包含轰炸机、轻型运输舰、重型运输舰、殖民舰、回收舰、太阳能卫星、死星、裂变者、噬能截击者、钛能守卫者和旧守护者。探测器、战列舰、收割者、湮灭之星已按用户要求恢复本轮修改前最新版；轻战、巡洋舰、重战、无畏舰、驱逐舰与深空吞噬者也保持原样。十舰回归哈希一致。

## 身份与来源

殖民舰与噬能截击者的旧三视图标签反了，参考清单及联系图已纠正。原 GLB 文件名保留不覆盖：`Colony_Ship.glb` 实为噬能截击者，`Devourer_Interceptor.glb` 实为殖民舰；以 `models/recovered/remaining-tripo-20261013/manifest.json` 的 id/file 映射为准。这里导出的新 GLB 文件名则对应正确舰种。

九艘有找回的 Tripo 三视图（其中死星为概念参考）；太阳能卫星按 APK 单视角补建厚度和背面；旧守护者沿用概念方向。死星与旧守护者没有对应 APK 原图，不作原图相似度声明。

## 验证与文件

- `manifest.json`：正确舰种身份、尺寸、面数、导出文件及 GLB 往返验证。
- `connections.json`：当前 GLB 的 SHA-256 与接触图。每舰一个连通群组、未检出独立悬空配件。位置焊接容差 0.00001；按三角面相交及实体包含判定接触，不等同制造用布尔并集。
- `*-comparison.png`：同尺度三视图对照；缺少三视图的模型显示来源限制。`silhouette-check.json` 记录像素投影交并比，仅用于找差异，不能作为整体三维相似度或视觉验收。90% 目标仍待验收。
- `*.png` 与 `fleet-overview.jpg`：模型着色预览；`*-browser.png`：真实页面截图。
- 121 项测试通过，构建通过，11 艘新舰与四艘保留舰页面逐一打开，无浏览器错误。舰船数值、克制方案、战斗结算没有变更；只重新贴合裂变者、噬能截击者和钛能守卫者的武器安装位置。

原模型：`models/archive/remaining-before-rebuild-20261013/models/`。中途取消的草稿：`models/archive/remaining-resume-20261013/deferred-three-ships/` 与 `deferred-probe/`。本目录 source 保存当前源码快照；运行源码在 `opendesign/mockups/galactic-command/`。

复现顺序：`node scripts/seat-remaining-weapons.mjs`，`node scripts/export-refined-fleet.mjs --remaining`，使用 Blender 后台运行本目录 `check-connections.py` 与 `render-comparison.py`，最后 Python 运行 `compose-comparison.py`。
