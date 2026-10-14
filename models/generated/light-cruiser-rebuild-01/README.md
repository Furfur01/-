# 轻型战斗机 / 巡洋舰 · 三视图重建 01

2026-10-13。按用户最新范围，仅启用 Light_Fighter 和 Cruiser；其他 19 艘未修改。原模型保留于 `models/archive/remaining-before-rebuild-20261013/models/`，更早的页面保留版本也未覆盖。

这两艘从空白程序几何制作，参考 `models/recovered/remaining-tripo-20261013/` 中找回的 Tripo 模型及其正交三视图，并核对各自 APK 图标。模型不直接加载或修改旧网格。采用异形装甲层叠、低矮炮座；没有新增同轴大炮，也没有变更舰船数值、克制规则或武器结算。

- 轻型战斗机：下垂长机鼻、两侧武器吊舱、发动机及三片厚翼，翼根有实体铰座。
- 巡洋舰：修长舰首、分层舰桥、镂空肩架、横向翼、两对下垂结构和低矮双联炮座。

## 检查

`manifest.json` 记录尺寸、三角面数和 GLB 往返读取结果。`connections.json` 对应其中 GLB 的 SHA-256：将所有网格按位置焊接并拆出几何连通分量，以三角面相交及实体包含建立接触关系；两舰均只有一个连通群组，未检出悬空独立配件。容差为 0.00001 展示单位。此项是游戏模型的接触检查，不代表制造用布尔并集或力学验证。

`check-connections.py` 可在 Blender 后台重跑；若存在悬空群组则断言失败。示例：

```powershell
node scripts/export-refined-fleet.mjs --light-cruiser
& 'D:/SteamLibrary/steamapps/common/Blender/blender.exe' --background --disable-autoexec --python-exit-code 1 --python models/generated/light-cruiser-rebuild-01/check-connections.py
```

118 项测试通过；包含其余 19 艘几何、法线、颜色与变换的 SHA-256 回归检查。构建通过。

`*-comparison.png` 上排为原始 Tripo，下排为新模型；相机采用相同正交尺度。`silhouette-check.json` 是投影轮廓的像素交并比，仅供找差异，不是整体三维形状相似度。90% 形状相似目标仍待视觉验收，不宣称已达到。

源码快照随 GLB 保存；运行页面使用 `opendesign/mockups/galactic-command/fleet-rebuild-combat.js` 和 `fleet-rebuild-kit.js`。
