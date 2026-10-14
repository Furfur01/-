# 死星飞行验证场景

本场景独立于月球改造、正式派遣、存档和服务器战斗。`death-star-design.md` 中的战略规则仍是后续设计；现有死星档案模型和编队试验单位继续保留。

## 入口与操作

运行 `npm run build:command`，再运行 `node scripts/serve-colony-review.mjs`，打开：

http://127.0.0.1:8289/opendesign/mockups/galactic-command/hangar.html?map=death-star

- 默认轻型战机，停在壕沟入口。W / S 调整油门，右键拖动转向，Space 开火，V 切换舰桥和追踪视角，Shift 加速。
- 底部提供整体观察、表面飞行、壕沟入口、主炮近景和重置演练。整体观察中拖动旋转、滚轮缩放。
- 半径 10,000，壕沟宽 120、深 100；轻型战机长度为 1。距离和速度使用内部单位。2,100 单位的航道对应满油门、不加速约 60 秒；沿球面飞行需要逐渐调整俯仰。
- 六座固定炮台分三组布置，具有视线和射程限制。击毁后保留残骸；重置才恢复。撞击实体或舰体归零会结束演练。

## 实现与资源边界

- `game/death-star-terrain.mjs` 是独立于渲染的几何、定位、简化碰撞和最近命中顺序。球壳减去赤道壕沟和抛物面炮口，碰撞不依赖当前 LOD；高速飞船用扫掠球检测。
- `scripts/hangar-source/death-star-renderer.mjs` 使用原生 WebGL，与驾驶共用一个上下文。整体轮廓批量绘制，近处球面块按屏幕误差提高精度，裙边封闭接缝。细节任务一次最多排队两个，GPU 块缓存最多 40 个；局部机械结构采用倒角原型实例化，缺少实例化扩展时使用有界合并网格。
- 机械面板与灯光由局部程序纹理生成，主炮保留八组发射器与凹面结构。地形和舰船采用相机相对坐标；远近地形使用独立投影与分离深度区间。大型机械结构和发射器具有独立碰撞包围体。
- `scripts/upgrade-death-star.mjs` 与 `scripts/hangar-source/death-star-flight.js` 接入现有构建和驾驶行为。普通靶场之间切换保留原行为；进入死星或离开死星时重新配置演练。所有状态只存在当前页面内。

## 验证

```powershell
npm run build:command
node --test tests/death-star-terrain.test.mjs tests/death-star-reference.test.mjs tests/flight-scenes.test.mjs tests/pilot-point-defense.test.mjs tests/ship-missiles.test.mjs tests/ship-turrets.test.mjs
node tests/death-star-flight-browser.cjs --performance
node tests/battlefield-flow-selfcheck.mjs
npm test
```

浏览器脚本通过独立静态服务器运行，不读取或改写世界存档。报告与截图位于 `output/playwright/death-star-terrain/`。覆盖四个入口、武器伤害、遮挡、残骸保持、高速撞击、十次场景切换的 GPU 资源计数、普通靶场状态、移动端布局、无实例化扩展回退和原死星档案。

性能模式在 1920×1080 下分别采样整体观察、实际表面飞行、壕沟飞行开火各 30 秒，记录 FPS、p95 帧时、GPU 信息和资源计数。目标为平均 60 FPS、p95 不超过 25 ms；实测只适用于报告中的电脑和浏览器。

2026-10-15 验证结果：Windows Chrome / ANGLE D3D11 / NVIDIA RTX 4080，三个场景分别为 99.97、99.95、99.97 FPS，p95 均为 10.1 ms。十次退出场景后，缓冲区、程序和纹理数量均回到同一基线。浏览器功能检查、无实例化扩展回退及正式战场流程通过；完整测试 306/306 通过，随后补充的两项接触距离与大型结构碰撞测试也通过。原 Three.js 档案页面仍会输出已有的着色器精度警告，死星飞行场景没有 WebGL 错误或警告。
