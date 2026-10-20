# SR—07 回收船

游戏中的 `Recycler` 使用用户提供的 `SR07_salvage_threejs.html` 内嵌模型。`SR07-original.glb` 保留原始几何、材质和机械臂层级，共 25,948 个三角面、63 个网格材质分组。

配色在 `opendesign/mockups/galactic-command/recycler-sr07.js` 的 `sr07Palette` 中调整：灰白船体、石墨骨架、低饱和安全橙；不改变原始 GLB。模型由原始的 −X 船首转换为游戏共用的 −Z 船首，保留旧回收船 14.107 的显示长度。该长度是游戏显示单位，不是物理米数。

重新生成嵌入式数据模块：

```powershell
node scripts/import-sr07-salvage.mjs
```

重新导入用户 HTML 时，将文件路径作为上述命令的唯一参数。导入器只读取 `model-data`，不运行 HTML 中的脚本。常规 `npm run build:command` 会更新舰船工厂消费者、GLB 和战场资源。远景保留贯通底盘、甲板、纵梁、船壳、推进器和双机械臂表面，共 2,204 个三角面。
