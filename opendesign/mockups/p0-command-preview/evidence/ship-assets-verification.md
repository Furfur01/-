# 船坞 APK 图与当前模型验收

验收地址：http://127.0.0.1:8390/opendesign/mockups/p0-command-preview/index.html#shipyard

## 结论

通过本次映射与显示验收。没有修改页面源码。

- 13 张 `assets/ships/*.png` 与 `asset-sources.json` 对应的 APK 解包源文件 SHA256 全部一致；使用 APK ID 1–7、9–14，没有把缺失的 ID 8 错补到后续舰型。
- 逐一点击 13 个舰型，左侧选中名称、图像路径和中央标题一致；每个模型均实际渲染，未进入图片回退，页面始终只有一个预览 canvas，无缺图。
- 独立检查了 13 张桌面截图。巡洋舰的尖首和侧翼、无畏舰的双长前叉、驱逐舰的长方中央舰体和两侧模块均随对应舰型切换，不再显示旧 preserved GLB 的同类粗简外形。
- 模型保留深色结构、灰白装甲和局部红／青色细节；太阳能卫星的蓝色面板也正常。材质颜色和顶点色确实存在，未被统一钢灰覆盖。
- 快速切换“巡洋舰 → 无畏舰 → 驱逐舰 → 轻型战机 → 巡洋舰 → 驱逐舰”后，最终驱逐舰画布截图与单独选中驱逐舰的画布 SHA256 完全相同，未见旧模型残留。
- 1440×900 桌面和 390×844 手机宽度均检查。手机页面无横向溢出，巡洋舰和驱逐舰模型完整可见，左右选择关系正确。
- 控制台错误 0；没有 API 请求、没有外部请求，也没有调用正式游戏服务。测试浏览器使用独立空白 context，并在 finally 中关闭。

## 准确限制

中央模型是项目现有重建几何的快照，不是 APK 自带的 3D 模型。APK 图标的细密蓝色纹理、反射和部分外形细节并没有被逐像素或逐面复原；只能确认本轮舰型映射正确，不能宣称外形或材质与 APK 原画完全一致。

## 主要证据

- `ship-assets-Cruiser-1440.png`
- `ship-assets-Dreadnought-1440.png`
- `ship-assets-Destroyer-1440.png`
- `ship-assets-Destroyer-rapid-switch-1440.png`
- `ship-assets-Cruiser-390.png`
- `ship-assets-Destroyer-390.png`
- `ship-assets-browser-report.json`：13 艘逐项结果、请求记录、快速切换画布哈希。
- `verify-ship-assets.mjs`：仅访问上述隔离静态预览的验收脚本。

此前 `verification.md` 中关于旧 preserved GLB、无贴图单一钢灰模型的结论已由本报告替代。其余研究和生产逻辑不在本次复测范围内。

## APK 原色更新后的补充截图

已在最新构建补存并检查 ship-apk-original-colors-Cruiser-1440.png。左侧图已移除 brightness 和 screen 混色，保持 APK 原色；巡洋舰标题、选中图和模型对应正常。此前13舰型交互结果仍适用。
