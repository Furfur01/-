# 巨构船坞 · 深空吞噬者轻量模型

保留早期 Tripo 高模的舰体轮廓、装甲分层、前部支脚与后部横翼，采用自适应折叠减面重建运行时拓扑，保留原 UV、颜色、金属粗糙度和法线贴图。前部新增独立的分段青蓝三角发光结构与内嵌装甲。原高模不改写。

| 模型 | 三角面 | GLB 渲染顶点 | 纹理 | 文件大小 |
|---|---:|---:|---|---:|
| 原高模 | 1,943,586 | 1,017,302 | 4K | 66,946,936 字节 |
| `devourer-near.glb` | 121,376 | 90,814 | 2K | 8,112,944 字节 |
| `devourer-mid.glb` | 25,376 | 23,571 | 1K | 2,160,368 字节 |

每级均为 8 个渲染 primitive。近景三角面比原模型减少 93.8%，中远景减少 98.7%。`*-quarter.png`、`*-front.png`、`*-top.png` 为实际材质渲染，已核对外形与三角灯可见性。

## 接入

- 运行时文件已复制到 `opendesign/mockups/galactic-command/assets/megastructures/`，只需打包两个 GLB。
- glTF 坐标：Y 向上、舰首 +Z；原舰体长度归一到 14，含新增灯框整体长度约 14.11，宽约 8.28、高约 6.69。
- 发光网格为 `Prow_Triangle_Emission_1`、`Prow_Triangle_Emission_2`、`Prow_Triangle_Emission_3`；材质 `Devourer_Triangle_Emission`，青蓝色，`KHR_materials_emissive_strength = 5`。
- 船坞投影半径超过 270 像素时使用近景，否则使用中景；银河远景隐藏舰体。只加载需要的级别，不常驻原高模。
- 已接入正式船坞中央泊位；空闲或停电时停止焊接、吊运。吊板抬高并缩短行程，避免穿过舰体上层装甲。机械动画使用真实帧间隔。
- 细部来源是已恢复的原模型，未替换全游戏其他舰船的模型或材质。

## 重新生成

从项目根目录运行：

```powershell
& 'D:/SteamLibrary/steamapps/common/Blender/blender.exe' --background --factory-startup --disable-autoexec --python-exit-code 1 --python models/generated/megastructure-devourer/build-devourer.py
```

脚本在独立 Blender 后台进程内处理模型、输出两级 GLB、复制运行时资产并渲染三视图。`manifest.json` 包含几何、纹理和材质接入信息。源图、渲染与处理脚本留在本地生成目录，不复制进发行资产目录。
