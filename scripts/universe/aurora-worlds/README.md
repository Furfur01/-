# AURORA Worlds 正式接入

来源：用户提交的 `C:/Users/Administrator/Downloads/AURORA_Worlds (1).html`。原件保存在 `D:/Desktop/data/银河帝国/opendesign/tools/aurora-world-import/reference.html`，可在预览中直接对照。

## 入口与边界

- 正式入口 `scripts/universe/planet-surface.js` 返回 `aurora-world-surface.js` 的场景组，继续由 `WorldRuntime` 的唯一 renderer、scene、camera 渲染。没有嵌入原演示页面，也没有引入第二份 Three。
- `field.js` 与 `source.js` 是从附件提取的确定性地形、建筑工厂、自然选址和基脚适配。不要直接修改生成文件；需要调整提取接口时修改 `scripts/import-aurora-worlds.mjs`。
- 原比例为星球半径 100、建筑统一比例 1.4；整体按游戏星球半径等比缩放，不分别压缩模型的三个轴。地形种子采用稳定的星球 key，气态星外观也由种子确定。
- 正式行星保留 14 个设施 ID；月球按玩法实际允许的 9 个 ID 布置。月球独立仓库复用原附件的仓储子模型，不改变矿区合并仓储的行星规则。
- 模型的 1/2/3 阶段只控制外观，等级 4 及以上使用完整型。真实等级、资源、队列、升级费用、科技和存档均继续使用现有数据。
- 近景最多缓存 4 个精细设施。远景由相同模型烘焙为单次绘制，保留轮廓与配套，不替换成统一方块。源工厂共享的 CPU 几何模板与各缓存项的 GPU 几何分开管理。
- Worker 和 CPU 调用同一纯生成器；画质切换不重排设施。离开场景或覆盖质量请求时取消旧任务。
- 气态星的雾层和星环适配游戏的对数深度、浮动原点和星球自转。建筑拾取统一返回所属设施 ID。舰船展示点位于轨道建筑包围球外，避免新船坞遮挡舰船。

### 恒星系进入与气态星远近一致性

恒星系总览只生成低模；行星投影半径超过 40 像素，或明确选择设施时，才计算本方基地布局和建筑。岩质低模保留索引，每个共享顶点只采样一次。

`gas-proxy.js` 复用附件近景的云层采样器、分类配色、倾斜轴和星环范围。木星、土星、天王星、海王星外观在远近视图使用同一星球种子；近景补充云层细节，不再更换分类。气态星近景纹理每 8 行让出主线程，云层网格逐层生成；离开时取消未完成的纹理计算。

## 构建与检查

在 `D:/Desktop/data/银河帝国` 执行：

```powershell
# 只有附件更新或提取接口改动时才需要重提取
node scripts/import-aurora-worlds.mjs "C:/Users/Administrator/Downloads/AURORA_Worlds (1).html"
node scripts/build-world.mjs
npm test
```

独立预览与浏览器测试已清理；原件仅作为导入源保留。当前检查限于 P0 与少量 P1，见 `tests/README.md`。需要实际查看地貌时使用正式界面和隔离临时存档，不在 8289 操作。

本次恢复点位于 `D:/Desktop/data/银河帝国/output/aurora-world-import/recovery/`，包含改动前的正式入口、WorldRuntime 与正式 bundle。恢复时只恢复这些具体文件并重建，不重置工作树或存档。

旧 CONTINUUM 地形和园区源文件仍作为历史资源保留；不再保留对应独立测试。
