# 用户指定模型对应关系

| 原始 HTML | 游戏模型 |
| --- | --- |
| titanium-guardian.html | Devourer_Interceptor / 噬能截击者 |
| spacecraft-threejs.html | Bomber / 导弹舰（目录名：行星轰炸机） |
| colony_ship.html | Colony_Ship / 殖民船 |

第一份文件内部标题虽为“钛能守卫者”，但按用户的明确指定接入噬能截击者；`Titanenergetic_Frigate` 保持原模型。

## 更新方法

在项目根目录运行：

```powershell
node scripts/import-october-reference-ships.mjs
node scripts/build-october-reference-ships.mjs
node --test tests/october-reference.test.mjs tests/fleet-scale-weapons.test.mjs tests/ship-weapons-preview.test.mjs tests/cargo-reference.test.mjs
node tests/october-reference-browser.mjs
```

导入器仅提取几何构造函数，不执行 HTML 的运行时和界面脚本。生成模块由 `october-reference.js` 统一转成游戏的 -Z 舰首、+Y 舰顶坐标，保留各舰原有显示尺寸；原始材质与全部三角面保留，按材质批处理并标记远景船体部分。

噬能截击者沿用原模型六座炮塔（四近防、两副炮），双主炮孔嵌在舰首中间空位，四个导弹挂点对应侧面原有发射单元。导弹舰保留八口齐射，发射口位于原腹部设备舱底部，另有两近防和两副炮。新挂点以模型 `userData.weaponLayout` 为准，构建时同步到演练资源和 `game/ship-flight-hardpoints.json`；不改变资源、舰队数量或战斗伤害数值。

浏览器验收使用临时存档、独立会话及独立端口，结束自动清理。正式服务运行期间可刷新查看模型；服务端的新战斗挂点在下一次后台启动时加载。
