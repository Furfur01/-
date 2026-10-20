# 四境 · Four Worlds

一个独立的 Three.js r184 连续星球观察样例。三颗固态星使用球面分块地形、统一程序化地貌场与自动距离细分；气态巨星使用三维密度场的视线积分。页面只有一个主视口，星球资产与相机、界面、渲染器、动画循环分开。

本项目使用场景单位。`radius: 175` 表示基准半径为 175 个场景单位，没有规定它对应多少米或千米。山脉、晶脊、裂谷、大气厚度与云墙进行了科幻美术夸张；这些生成规则用于视觉演示。

实际截图、动态演示、浏览器环境、帧耗时和资源测量见 [验证记录](verification/REPORT.md)。纯数据与网格检查的输出见 [fields.json](verification/fields.json)。本 README 不预设任何硬件的帧率结果。

## 1. 启动

### 直接运行随附的构建版本

交付目录包含 `dist/` 时，只需要本地 Node.js：

```bash
node scripts/serve-built.mjs
```

浏览器打开 [http://localhost:8390](http://localhost:8390)。这个入口使用 Node.js 内置的 HTTP（Hypertext Transfer Protocol，超文本传输协议）服务，不需要安装 npm 依赖，也不访问内容分发网络。

应通过服务地址访问页面。ES modules（ECMAScript modules，ECMAScript 模块）与 module Workers（模块工作线程）需要正确的模块地址及响应类型，直接双击 `index.html` 不适用于本项目。

### 开发与修改源码

建议 Node.js 20.19 或更高版本。依赖版本在 `package-lock.json` 中锁定。

```bash
npm ci
npm run dev
```

首次安装依赖需要能够访问 npm 仓库；完成安装后，运行与构建使用本地依赖。开发地址同样为 [http://localhost:8390](http://localhost:8390)。

### 构建与预览

```bash
npm run build
npm run preview
```

`npm run build` 生成包含本地 JavaScript、样式、中文字体和 Worker 文件的 `dist/`。也可以把整个 `dist/` 放到支持静态文件的 HTTP 服务中。`npm run serve` 与 `node scripts/serve-built.mjs` 使用同一个构建版入口。

开发、预览及内置构建服务都使用 **8390**，且不会自动切换端口。8390 被占用时，启动会报错退出，保留原有服务。项目没有使用 8289。

## 2. 观察操作

| 操作 | 作用 |
| --- | --- |
| 顶部四个星球按钮 | 独立选中星球，保留各自的观察位置与目标高度 |
| 左键拖动 / 单指拖动 | 围绕同一颗星球改变观察方向，近地时自动降低移动幅度 |
| 滚轮 / 双指缩放 | 连续改变离地高度；缩放使用指数插值 |
| 右键拖动 | 改变水平看向与俯仰，可近地抬头观察地平线 |
| `W A S D` / 方向键 | 沿星球切平面前后、左右移动 |
| `Q` / `E` | 下降 / 上升，受地表、液面及当前可见网格安全高度约束 |
| `Shift` | 加快平移与升降 |
| 奇观定位 | 连续移向固定地标；从低处前往相距较远的地标时会先抬高目标高度 |
| 返回全貌 | 返回当前星球第一个主地标的全貌镜头 |
| `H` | 隐藏 / 显示界面，便于纯画面观察 |
| `Escape` | 停止巡航并显示界面 |

靠近地面时，相机的默认俯视角逐渐过渡到接近地平线的角度。右键可以继续调整看向。所有预设只改变相机目标，不替换星球或局部场景。

金属岩星的主地标位于火山口环脊内侧，地面默认向下看约 18°，把内壁与熔岩池纳入视野；其他固态星近地默认约 5°。这些只是连续相机的观察角度，右键可自由抬头或转向。

### 相机预设

`R` 为基准半径；固态星的 `h` 从采样地表或更高的液面起算。气态星以 `1.025R` 的名义云顶为导航基准。

| 预设 | 固态目标 `h / R` | 气态目标 `h / R` |
| --- | ---: | ---: |
| 远景 | 3 | 3 |
| 轨道 | 0.22 | 0.22 |
| 低空 | 0.024 | 0.024 |
| 地面 / 云顶 | 0.0006 | 0.016，即相机半径约 `1.041R` |

固态星最低安全余量为 `0.00012R`。气态“云顶”预设位于约 `1.041R`，默认向下看约 6°，以近处云墙和云顶曲率作为观察内容；继续滚轮或按 `Q` 可下降至约 `0.995R`，进入上层云雾，此时 `h / R` 可为负值。页面的相对高度读数反映当前实际相机位置。新细块尚在准备时，保守避障可能暂时把相机留在更高的位置。

### 观察设置

右上角可展开画质、自转、天气、光照、种子与巡航控制。默认 **标准画质、自转暂停、天气运行**，便于跟踪同一地标。自转暂停不影响相机移动。天气时间单独累计，暂停天气会固定云带、风暴和闪电的动画状态；海水与熔岩的材质动画使用普通场景时间。

画质改变细分、缓存与实例的预算上限。自动距离细分一直运行。改变种子会重新生成当前星球的空间布局、地形与材料区域，并回到其默认全貌；其他星球的种子保留。

## 3. 四颗固定样例

| 类型 | 固定种子 | `R` | 主奇观与可定位区域 |
| --- | ---: | ---: | --- |
| `terrestrial` 类地星 | 17 | 175 | 天穹山系、曲岸群岛、北极冰冠 |
| `mercury` 金属岩星 | 31 | 140 | 狱门破火山口、熔铁裂带、黑曜台地 |
| `mars` 火星岩星 | 73 | 154 | 苍棱晶谷、赤沙风海、赤壁阶地 |
| `gas` 气态巨星 | 206 | 224 | 巨眼风暴、风暴眼墙、极地蓝涡、剪切云带 |

### 类地星

大陆由主大陆、离散次大陆与群岛区域叠加构成。多尺度噪声形成海湾、半岛和浅海变化；横贯主大陆的曲折山系叠加山脊、侵蚀细节与连续谷地。极区与海拔共同决定积雪，极地冰棚具有实际高度。

山体、河谷、岛屿和海岸高差来自 `fields.js` 的同一个高度函数。海床在海面下连续存在，海水另有独立几何与材质。近处使用地表颜色、微小几何及碎石补足尺度。植被以区域材质表现，没有森林实例。类地云系是球面平流云遮罩；近地天空另有视线积分大气。

### 金属岩星

阶梯台地、玄武岩和金属裸岩构成基底。带宽变化的主裂带及分支切入地表，并连接低洼熔岩区域。主破火山口包含真实坑壁、环脊、中央峰，其他撞击结构使用独立固定随机序列布置。

熔岩是单独的液面网格，名义高度为 `-0.016R`。液面材质表现流动热区、凝固表壳与局部发光；大部分玄武岩保持低亮度。液面流动使用程序化材质动画，没有流体动力学求解。

### 火星岩星

多级台地与长距离分支峡谷共存。连续沙丘场以固定风向坐标产生真实高度波形，局部砂纹补充细节。晶体密度由峡谷、断层及矿脉场共同决定。

主要晶脊沿实际矿脉向两侧追踪，使用封闭的六面晶体几何组成；近处的小晶簇与碎石采用实例化绘制。矿物区域只带少量颜色变化，晶体体积由几何提供。

### 气态巨星

独立的 `gas.js` 不创建固态地形。纬向云带的宽度与速度不同，主风暴包含下陷的眼区、隆起眼墙与螺旋臂，另有四处次级风暴 / 极区结构。

包围球用于计算视线的进入与离开位置。可见云来自三维密度积分：远景的积分包络约为 `0.925R–1.053R`，接近时上边界平滑扩至 `1.073R`，解析突出的云团和近处圆隆云墙。实际积分区间还会根据局部天气和相机位置收紧。这些边界是计算范围，`1.025R` 的名义云顶用于导航，并不表示一张实体表面。

云团具有连续深度、层间暗部和近处遮挡。相机接近时增加积分采样，按云密度与剩余路径调整步长；不透明区域可以提前结束积分。透明的外层大气先绘制，体积云随后合成，云积分在首次达到有效散射的位置写入深度。天气随独立时间移动，地标中心由种子固定，便于远近追踪。稀疏闪电由天气时间控制。

## 4. 源码结构

| 文件 | 职责 |
| --- | --- |
| `src/demo/main.js` | 唯一渲染器、场景、相机、动画循环、选择状态、灯光输入、界面与录制 |
| `src/demo/PlanetCamera.js` | 局部球面导航、连续缩放、近地看向、切向移动及安全高度 |
| `src/demo/tour.js` | 可复现相机目标路径；由主循环调用，不创建第二个循环 |
| `src/demo/style.css` | 单页面观察界面 |
| `src/planet/createPlanetAsset.js` | 统一资产入口、分组、采样接口、更新与资源生命周期 |
| `src/planet/fields.js` | 三类固态星的纯高度、颜色、液面、地貌权重与地标定义 |
| `src/planet/noise.js` | 固定种子随机序列与三维噪声 |
| `src/planet/cube.js` | 六面球面方向映射、反向定位、块边界与表面法线 |
| `src/planet/TerrainLOD.js` | 四叉树、屏幕误差、裁剪、层级过渡、块缓存和可见网格导航高度 |
| `src/planet/tile-builder.js` | Worker 与主线程回退共用的逐行网格生成器 |
| `src/planet/WorkerPool.js` | 有并发与排队限制的生成任务、暂停、失败回退、销毁 |
| `src/planet/terrain.worker.js` | 模块工作线程入口 |
| `src/planet/materials.js` | 固态地表、水面和熔岩着色器 |
| `src/planet/Decorations.js` | 稳定锚点的晶脊、晶簇与近地碎石实例 |
| `src/planet/Atmosphere.js` | 固态星大气及类地云层 |
| `src/planet/gas.js` | 气态云带、风暴、体积积分与大气 |
| `scripts/serve-built.mjs` | 不需 npm 安装的构建版静态服务 |
| `scripts/verify-fields.mjs` | 可独立运行的纯场、网格、接缝与相机验证 |
| `scripts/verify-tiles.mjs` | 全部立方体边方向、粗细过渡及真实四叉树调度、预算与回收检查 |
| `scripts/verify-browser.mjs` | 实际浏览器截图、交互、帧耗时、资源计数与连续录制 |
| `scripts/generate-report.mjs` | 从五份最终 JSON 生成中文验证报告、离线实拍画廊和证据摘要 |
| `scripts/capture-gallery.mjs` | 把离线画廊中的 16 张实际 PNG 排成一张对照索引图 |
| `scripts/assemble-video.py` | 用 FFmpeg 连接原始运行录像，保留帧间隔并添加章节，不插帧或加速 |
| `scripts/package-delivery.py` | 检查交付文件、生成 SHA-256 清单并打包完整目录 |
| `public/fonts/OrbitalSansSC-Regular.woff` | 随包提供的中文界面字体子集 |
| `public/fonts/OrbitalReportSC-Regular.woff` | 离线实拍画廊的完整文字子集，使用同一原始字体与授权 |
| `vendor/licenses/` | 第三方原始许可证及其附带声明 |

资产模块不创建 renderer、camera、canvas、DOM（Document Object Model，文档对象模型）、RAF（requestAnimationFrame，请求动画帧）或全局输入监听。

## 5. 接入接口与坐标约定

```js
import * as THREE from 'three';
import { createPlanetAsset } from './src/planet/createPlanetAsset.js';

const planet = createPlanetAsset({
  THREE,
  type: 'terrestrial',
  seed: 17,
  radius: 175,
  quality: 'standard',
});

scene.add(planet.root);
planet.root.position.set(300, 20, -100);
planet.root.rotation.y = 0.3;
planet.root.scale.setScalar(2);
```

`planet.root` 的原点是球心，局部 `+Y` 是自转轴。几何、地貌、天气、实例与查询使用同一套星球局部坐标。宿主可以平移、旋转、均匀缩放整个 Group。非均匀缩放会把星球变成椭球；精确球形导航、大气光程和世界空间速度建议使用均匀缩放，非均匀拉伸下的物理表现需要宿主校准。

`planet.landmarks` 提供固定种子对应的 `{ id, name, description, direction, heading? }`。`direction` 是局部单位方向数组；可选 `heading` 是供观察控制器使用的切平面朝向，单位为弧度。Demo 以局部 `+Y` 在切平面上的投影作为北向，正角度朝其右侧旋转；在极点附近使用稳定备用方向。主地标带有适合近处观察的朝向，例如金属岩星的定位点位于火山口边缘，朝向坑内。宿主可使用这些朝向，也可以自定镜头。

### 宿主每帧更新

```js
const inversePlanet = new THREE.Matrix4();
const eyeLocal = new THREE.Vector3();
const viewDirectionLocal = new THREE.Vector3();
const sunDirectionLocal = new THREE.Vector3();

// 在宿主已有的唯一动画循环中调用。
function updatePlanet(dt, time, weatherTime, sunDirectionWorld) {
  planet.root.updateWorldMatrix(true, false);
  inversePlanet.copy(planet.root.matrixWorld).invert();

  camera.getWorldPosition(eyeLocal).applyMatrix4(inversePlanet);
  camera.getWorldDirection(viewDirectionLocal).transformDirection(inversePlanet);
  sunDirectionLocal.copy(sunDirectionWorld).transformDirection(inversePlanet);

  planet.setLighting({ directionLocal: sunDirectionLocal });
  planet.update({
    dt,                    // 秒；用于过渡与分帧工作
    time,                  // 普通场景时间，秒
    weatherTime,           // 独立天气时间，秒；暂停时保持数值不变
    eyeLocal,
    viewDirectionLocal,    // 可选；提供后用于生成任务的视野裁剪
    aspectRatio: camera.aspect,
    verticalFovRadians: THREE.MathUtils.degToRad(camera.fov),
    viewportHeightPixels: renderer.domElement.height,
    visible: true,
  });
}
```

光照方向表示 **从星球指向光源** 的局部单位向量。传入世界坐标时应先做以上转换。`eyeLocal` 是实际相机位置，不是归一化方向。

`ready` Promise 表示六个基础面已生成；气态星可立即就绪。固态任务由 `update()` 推进，宿主需要先开始正常更新，再等待 `planet.ready`。不要用“等待 ready 完成后才开始调用 update”的顺序。

### 固态高度、法线与液面

```js
const directionLocal = new THREE.Vector3(1, 0.2, 0.3).normalize();
const sample = planet.sampleSurface(directionLocal);

if (sample) {
  // sample.height：相对基准球面的场景单位高度
  // sample.normal：局部单位法线
  // sample.liquidHeight：独立的名义液面高度，无液面时为 null
  // sample.biomeWeights：各区域地貌的权重；权重允许重叠
  // sample.navigationHeight：当前可见网格提供的保守避障高度

  const positionLocal = directionLocal.clone()
    .multiplyScalar(planet.radius + sample.height);
  const positionWorld = positionLocal.clone()
    .applyMatrix4(planet.root.matrixWorld);
  const normalWorld = sample.normal.clone().applyNormalMatrix(
    new THREE.Matrix3().getNormalMatrix(planet.root.matrixWorld)
  );
}
```

`height` 来自固定程序化场，画质或 LOD（Level of Detail，细节层级）不会重写它。`navigationHeight` 把当前网格单元、过渡中粗细网格的高度计入安全判断，用于防止快速下降穿过尚未细化的三角形。设施等长期坐标应使用 `height`，不要把临时 `navigationHeight` 当成真实地貌。

查询返回的 `normal` 使用固定采样间距求地形梯度，在同一方向上保持稳定，不随画质和当前网格改变。渲染使用与每层网格间距相应的梯度采样范围，对粗层尚不能解析的高频坡度进行过滤；父层与细层分别采用各自的范围。这个处理只影响着色法线，几何高度与地标仍来自同一程序化场。需要稳定设施朝向时使用查询法线；粗层画面上的光照法线可能更平滑。

相机使用 `max(height, navigationHeight, liquidHeight)` 作为固态安全参考。水面与熔岩渲染有约 `0.000002R` 的微小径向偏移，避免共面闪烁；接口返回其名义液面高度。

气态星的 `sampleSurface()` 明确返回 `null`。其统计中 `nominalCloudTop` 为 `1.025R`；资产统计 `relativeAltitude` 以基准半径 `R` 计算，Demo 的 `hOverR` 则以名义云顶计算。

### 分组与生命周期

所有类型都暴露以下 Group：

```js
planet.groups.surface;      // 固态网格，气态为空
planet.groups.liquid;       // 海水 / 熔岩，火星与气态为空
planet.groups.decorations;  // 晶体与近地碎石
planet.groups.clouds;       // 云系 / 气态体积云
planet.groups.atmosphere;   // 大气

planet.groups.clouds.visible = false; // 单独隐藏或替换一组
planet.setQuality('high');
planet.setVisible(false);             // 停止新增任务，并释放固态细块
const stats = planet.getStats();
planet.dispose();                     // 幂等清理
```

直接隐藏某个分组只影响该组绘制。整颗星球退出视野后应调用 `setVisible(false)` 或传入 `visible: false`。当前实现暂停并终止对应工作线程、清空排队任务，固态星仅保留六个基础面，恢复可见时再按距离细化。Demo 会保存观察状态并惰性创建四个资产。

`dispose()` 清理几何、材质、实例缓冲、Worker、生成队列和自建缓存，并把 `root` 从父节点移除。宿主添加的自定义资源仍由宿主负责管理。

自定义着色器使用 Three.js 的对数深度、色调映射及色彩空间片段。Demo 开启 logarithmic depth buffer（对数深度缓冲），输出 sRGB（standard Red Green Blue，标准红绿蓝色彩空间），使用 ACES（Academy Color Encoding System，学院色彩编码系统）电影色调映射。宿主应统一管理曝光与输出色彩，避免再对已输出的颜色重复执行 gamma 转换。

## 6. 自动细分与预算

固态星从六个 cube-sphere（立方体映射球面）基础面开始。每块使用 `24 × 24` 网格单元。屏幕误差估计结合块内采样跨度、地表曲率、相机局部高度、投影焦距及横向距离；优先队列每次选取当前误差最大的可细分块，把有限预算分给最需要细节的区域。

调度器先规划覆盖完整球面的叶块集合，再平衡相邻层级。细分某块前，会补齐所需的较粗邻居；块数达到上限时停止新增细分。地平线与视野锥判断影响细分优先级，并在完整拓扑确定后筛选实际绘制块，隐藏面仍保留连续的父块覆盖。地平线判断留有高山轮廓余量，视野锥裁剪用于较细层级。距离与投影误差自动决定细节，手动画质只改变预算。所有层级在一致的球面方向上调用同一个高度函数。

| 固态预算 | 低 | 标准 | 高 |
| --- | ---: | ---: | ---: |
| 每块网格单元 | 24 × 24 | 24 × 24 | 24 × 24 |
| 最高四叉树层级 | 12 | 14 | 15 |
| 屏幕误差阈值，像素 | 3.6 | 2.5 | 1.6 |
| 完整球面叶块上限 | 180 | 320 | 480 |
| 已提交地形块缓存上限 | 290 | 510 | 760 |
| 初始化 Worker 数 | 2 | 2 | 3 |
| 每帧提交的新块上限 | 2 | 3 | 4 |
| 碎石与晶体实例预算 | 420 | 1000 | 1800 |

并发工作线程数按资产初始化时的画质建立，运行中切换画质不会重建线程池。排队、正在执行及已完成待提交的任务合计最多 48 个。生成只请求当前推进所需的下一层，先补齐同组子块及邻居；转向后会取消已经失去用途的排队任务，正在执行的任务可完成并进入有上限的缓存。Worker 失败后，保留已有可见网格，切换到同一个生成器的逐行回退；每帧主线程回退目标预算为 1.6 毫秒。单行执行具有不可拆分成本，实际耗时仍由机器决定。

四个子块全部准备完成后才替换父块，未准备好的子块不会隐藏已就绪的父块。新增细节约用 0.32 秒从粗层网格变形至细层；收缩约用 0.26 秒回到粗层。相邻层级保持最多一级差，细块公共边贴合邻居的粗层边；同级邻居仍在过渡时，公共边也同步使用相应过渡量，位置与法线共同变化。父层和细层的着色法线分别经过网格尺度过滤，在顶点阶段保持线性插值，在片元阶段统一归一化，以维持过渡边界的光照连续。雪坡根据坡度混入裸岩，并使用少量近地天空补光增强岩壁可读性。

微小裙边封闭浮点缝隙。拓扑变化或预算降低后，还会检查完整叶块集合，必要时回退至已就绪祖先，以保持覆盖、层级差与数量上限。

缓存保护完整叶块集合、其祖先链与六个基础面，其余块按最近使用时间淘汰。提交导致缓存超限时，在同一次 `update()` 内回收至上限；平时每 30 帧清理一次，并移除无用的空节点元数据。离采样地形的径向高度超过 `0.15R` 后，会把回收目标进一步降为 `min(画质缓存上限, max(90, 完整叶块数 × 2 + 24))`，在保留必要父链的前提下释放近地细节。缓存块统计包括父级回退网格，不只包括当前正在绘制的叶块。活动块 `activeBlocks` 是经过裁剪的绘制子集，`globalFrontier` 是完整球面叶块数。

近处装饰使用固定的七级球面格网锚点，每格最多 256 个候选点，缓存目标为 42 格；分帧生成目标预算约 0.95 毫秒。稳定种子、格子编号和候选序号决定位置，画质更改不移动既有锚点。

气态星单独使用距离驱动的体积采样预算：

| 气态预算 | 低 | 标准 | 高 |
| --- | ---: | ---: | ---: |
| 远景积分步数 | 4 | 6 | 10 |
| 近云积分步数上限 | 22 | 36 | 48 |

远景与近云之间的采样预算随距离连续变化。云密度高时提前终止积分，靠近时优先解析近处云体；空区使用更长步长，沿光源方向采用短程有限采样近似云内阴影。近处提高三维云团的密度细节与积分包络上限，高成本计算集中在相机视线穿过的云段。气态星没有固态地形四叉树或岩石地面。

Demo 同时按画质设置绘图区像素比：低档最高为设备像素比 1 的 0.8 倍；标准最高为 1.5；高档最高为 2。`config.js` 中的像素比字段是资产预算参考，实际绘图区由 Demo / 宿主统一决定。

## 7. 验证与复现

### 不依赖浏览器的检查

```bash
npm run verify:fields
npm run verify:fields -- --output verification/fields.json
node scripts/verify-tiles.mjs --frontier --output verification/tile-edge-tests.json
```

脚本对每类固态星检查 2054 个方向，包括极点。内容包括相同种子的几何与材料复现、换种子的结构变化、法线与局部真实几何的一致性、液面和矿物区域、每类 308 对跨面边界、实际网格顶点、粗细层共边，以及相机在六个不同区域的横向移动与快速缩放。

相机检查使用真实地貌函数，并人为加入逐渐消退的粗层安全余量，验证穿地保护。另检查根节点平移、旋转、2.3 倍缩放及气态云顶导航。它们不能替代浏览器中的着色器、交互、动态细分与资源稳定性检查。

`verify-tiles.mjs` 进一步覆盖十二条立方体边的不同朝向、多组相邻层级、几何与法线过渡、液面共边和导航高度缓冲，并运行真实四叉树调度器，检查完整叶块集合、层级平衡、生成队列、缓存上限、转向及缩远后的回收。Node.js 环境通过实际逐行生成器的主线程回退路径执行这些调度检查。

### 实际浏览器验证脚本

先在一个终端启动 `npm run serve` 或 `npm run dev`，保持 8390 服务运行。在另一个终端执行：

```bash
# 已执行 npm ci 后，安装测试所用的 Chromium；此步骤需要下载浏览器。
npm exec -- playwright install chromium

# 默认执行四类对照截图与交互检查。
npm run verify:browser

# 也可分别执行，或用 --all 执行全部任务。
npm run verify:browser -- --screenshots
npm run verify:browser -- --interaction
npm run verify:browser -- --record
npm run verify:browser -- --all
```

已有可用 Chrome / Chromium 时，可用 `BROWSER_EXECUTABLE` 指定可执行文件，省去浏览器下载。浏览器与 Playwright 驱动用于验证；打开构建版页面不需要它们。

| 环境变量 | 默认值 | 用途 |
| --- | --- | --- |
| `BROWSER_EXECUTABLE` | Playwright 管理的 Chromium | 指定已有浏览器可执行文件 |
| `TYPES` | `terrestrial,mercury,mars,gas` | 选择截图、相应区域检查及连续缩放录制的星球 |
| `WIDTH` / `HEIGHT` | `1440` / `900` | 截图与交互测试的页面视口尺寸 |
| `QUALITY` | `standard` | 截图与交互测试画质 |
| `MEASURE_FRAMES` | `32` | 固态机位的正常动画帧采样数；气态取该值与 8 的较小值 |
| `TOUR_SECONDS` | `64` | 自动录制时每颗星球的实际时间路径长度，秒 |
| `OUTPUT` | `verification` | 截图、元数据、视频及 JSON 报告的输出目录 |

例如，在类 Unix 终端延长某颗星球的录制路径：

```bash
TYPES=gas TOUR_SECONDS=96 npm run verify:browser -- --record
```

截图模式对每颗星球的同一主地标依次记录远景、轨道、低空、地面 / 云顶，PNG 旁的 JSON 记录种子、半径、画质、局部与世界相机坐标及资源统计。交互模式检查六个固态区域的实际键盘横移和右键观察、极点与立方体接缝、暗面熔岩、云层内外、快速缩放、根节点变换、连续切换、换种子与画质，以及反复释放和重建。

**截图准备与性能测量分开执行。** 截图准备先冻结天气和相机目标，使用正常资产接口与异步生成任务推进细节，在准备过程中不逐帧绘制，最后提交完整一帧。准备耗时保存在单独字段中。帧耗时测量随后恢复正常 RAF、动画更新与实际绘制，默认固态采集 32 个真实帧，气态采用 8 帧短采样；结果写入 `benchmark`。冻结准备的耗时、手动更新次数及截图完成等待都不计为实时帧率。气态短采样只反映这段实际运行，不能据此推定长时间稳定帧率，样本数与环境需一起阅读。

自动录制模式单独使用 `960 × 600` 的页面视口和低画质，请求每秒 24 帧、4 Mbps 编码，每颗路径默认 64 秒，再录制约 24 秒的气态天气运动。低画质绘图区像素比为 0.8，因此设备像素比为 1 时，实际 canvas 绘图区为 `768 × 480`。录制结果保存实际绘图区尺寸，以及约每 0.5 秒采样的高度、目标高度、LOD、块数、绘制调用与巡航进度；判断是否到达近地位置应查看实际高度轨迹。视频帧数取决于运行时绘制和编码速度，不能由请求的捕获频率推定。

脚本把浏览器版本、可取得的图形后端与硬件字段、控制台错误、外部运行请求和测试结果写入 `browser-screenshots.json`、`browser-interaction.json`、`browser-recording.json` 或组合任务的 `browser-verification.json`。完整实际结果、图像与视频索引见 [verification/REPORT.md](verification/REPORT.md)。

### 控制台接口

浏览器控制台可通过 `window.__planetDemo` 获得复现数据：

```js
const demo = window.__planetDemo;
demo.selectPlanet('mars');
demo.gotoLandmark('crystal', { immediate: true });
demo.setPreset('ground', { immediate: true });
demo.freezeAnimation(true);  // 冻结天气、场景时间与巡航，LOD 准备仍继续
demo.setWeatherTime(12);

console.log(demo.getSnapshot());
console.log(demo.getHardwareInfo());
```

`getSnapshot()` 包含种子、半径、画质、实际相对高度、局部及世界相机位置、看向、俯仰、地标、天气时间、像素尺寸、资产统计、绘制调用、三角形及近期帧耗时。`getHardwareInfo()` 返回浏览器、WebGL（Web Graphics Library，网页图形库）版本与可取得的硬件字段；浏览器可能隐藏具体硬件信息。

精确设置局部观察点：

```js
demo.setExactCamera({
  directionLocal: demo.currentAsset.landmarks[0].direction,
  heightRatio: 0.0006,
  heading: 0,
  lookPitchOffset: 0,
});

demo.controller.moveTangent(0.05, 0.1, { immediate: true });
demo.setUIVisible(false);
```

待目标细节稳定后，可固定一帧截图：

```js
demo.pauseRendering(true);
demo.renderOnce({ finish: true }); // 显式等待本帧图形命令完成
const metadata = demo.getSnapshot();
// 由浏览器截图或自动化工具保存实际视口与 metadata。
demo.pauseRendering(false);
```

`pauseRendering` 跳过主循环中的更新与绘制，保留最后的画面；唯一 RAF 仍在。`renderOnce()` 只提交一帧，不启动额外循环。Demo 开启 `preserveDrawingBuffer`，便于暂停后的捕获；这项配置也属于实际性能测试环境。常规 `freezeAnimation()` 不停止地形准备与过渡。

### 实时连续缩放与录屏

界面的“连续巡航”默认用每颗 32 秒的实际经过时间，围绕第一个主地标完成接近与返回；首次基础网格就绪前的等待单独处理。主循环把未经钳制的 `rawDt` 传给巡航，地形过渡仍使用受限时间步长。相机目标路径如下；高度按对数插值，再经过相机自身的平滑与安全约束。渲染速度很低或新地形尚未完成时，实际相机高度可能滞后于目标路径，应延长巡航并查看高度轨迹。

| 归一化时间 | 目标 `h / R` |
| --- | ---: |
| 0.00–0.07 | 3 |
| 0.28 | 0.22 |
| 0.44 | 0.024 |
| 0.63–0.73 | 固态 0.0006 / 气态 0.016 |
| 0.94–1.00 | 3 |

完整定义位于 `src/demo/tour.js` 的 `TOUR_KEYFRAMES`。以下控制台入口与界面默认均为 32 秒；浏览器验证脚本为了给异步细分更多时间，默认录制每颗 64 秒，可用 `TOUR_SECONDS` 修改。

```js
demo.freezeAnimation(false);
demo.pauseRendering(false);
demo.tour.start({
  types: ['terrestrial', 'mercury', 'mars', 'gas'],
  durationPerPlanet: 32,
});
```

界面的“录制一轮”通过 `canvas.captureStream()` 与 `MediaRecorder` 记录实际运行视口，巡航结束后下载 WebM。可以用同一入口录制四颗星球：

```js
demo.recordTour({
  types: ['terrestrial', 'mercury', 'mars', 'gas'],
  durationPerPlanet: 32,
  filename: 'four-worlds-continuous-tour.webm',
});
```

录制只包含三维 canvas，不包含外层界面。默认申请 30 帧/秒的捕获频率，实际视频的有效帧数由当时渲染速度和浏览器编码器决定。没有使用截图序列伪造运行录像。浏览器缺少 MediaRecorder 或 WebM 编码能力时会明确提示；此时仍可直接运行上述相机路径。

### 如何理解统计

界面“帧耗时”使用最近 240 帧的实际 RAF 间隔，显示平均值和 P95（95th percentile，第 95 百分位数）。“主线程提交”记录更新与提交图形命令的 JavaScript 时间，不能直接当成 GPU（Graphics Processing Unit，图形处理器）的独立执行时间。

`renderer.info.memory` 是 Three.js 资源对象数，不是显存字节数。`geometryBytes` 是资产持有的网格数组字节统计，也不能等同于 GPU 显存。截图时的单次 `gl.finish()` 用于完成捕获，不参与正常帧循环的统计方法。具体测量、连续切换与释放资源后的观察结果均在验证记录中报告。

## 8. 已知限制与后续接入

- 地形来自解析场和多尺度噪声，没有板块运动、侵蚀、水文或完整大气动力学求解。细分误差为工程估计，没有对任意位置给出解析误差证明；极陡的局部区域仍需要结合目标硬件调节预算。场景单位没有物理长度换算，山体、晶体、大气及云厚采用可读性优先的视觉尺度。
- 近地细节受异步生成速度约束。快速跨越很远的地理区域时会先显示较粗的父网格，之后逐渐补充细节；安全相机可能暂时高于设定的离地目标。 标准预算下，远处陡峭山脊仍可见三角面轮廓，当前画面未达到所有近地机位都精细平滑的程度。
- 岩土材质、海水高光、熔岩流动、大气散射和云内阴影都采用实时近似。没有完整的地形投影阴影、光线追踪反射、海浪流体模拟或云的多次散射。 碎石与近景晶体采用有规律的屏门抖动淡入，原始画面可能看见点阵；没有时间抗锯齿或装饰物接触阴影，局部贴地感仍有不足。
- 类地云层是球面云遮罩；气态巨星的近云效果使用真正三维密度积分。当前版本未实现类地体积云或森林实例。
- 相机检测地形及液面，不检测碎石、晶体实例的实体碰撞。近处可穿过晶体，后续游戏接入需要另加装饰物碰撞或选择路径。
- 气态云采用有限步数的三维积分，近云上限为低 / 标准 / 高档的 22 / 36 / 48 步。本次实拍中可见明显积分颗粒、条带和斜向采样痕迹；快速运动、薄云边缘或较长斜视光程还可能出现密度变化和软化的遮挡边缘；高画质会增加成本，不能替代无限采样。云内阴影是短程近似，没有云的多次散射或完整流体模拟。
- 气态深部以连续光学厚尾项处理。当前导航只开放上层云区；没有模拟巨星深内部。近处积分上边界随距离扩展，属于视觉与预算近似；名义云顶只是稳定的导航参考。
- 体积云没有读取宿主场景的深度纹理。后续把舰船等外部对象放入云体时，建议把宿主深度接入积分截断，并验证对象与云雾的混合。
- 非均匀缩放会改变球体形状。宿主如采用椭球尺度，需要自行校准世界空间高度、速度、法线与物理光程。
- 本次交付集中在独立视觉样例，没有游戏后端、建筑落点、经济、战斗或存档迁移。后续接入者可以复用资产模块，并替换 Demo 外壳。
- 浏览器性能与图形后端关系很大。软件渲染、受限虚拟环境、移动设备和高像素密度屏幕均可能低于交互目标；实际环境和测量结果以验证记录为准。

## 9. 依赖与授权

| 项目 | 版本 / 用途 | 授权 |
| --- | --- | --- |
| Three.js | `0.184.0`，场景图、几何、材质、WebGL 渲染 | MIT |
| Vite | `7.1.12`，仅用于开发服务与本地构建 | MIT |
| Playwright / Playwright Core | `1.51.1`，仅用于浏览器验证和实际录屏 | Apache-2.0 |
| Noto Sans CJK SC Regular | 原字体 `2.004` 的本地界面字符子集，WOFF（Web Open Font Format，网页开放字体格式） | SIL Open Font License 1.1 |
| 本项目原创源码、地形、材质、晶体与天气实现 | 本地源码与程序生成 | MIT，见 [LICENSE](LICENSE) |

运行时使用 Three.js、本地源码和随包字体，不依赖第三方模型、贴图、内容分发网络或在线账户。字体文件位于 `public/fonts/OrbitalSansSC-Regular.woff`；它经过字符子集化与 WOFF 格式转换，内部字体名称仍为 Noto Sans CJK SC。扩充界面文案时，未包含字符会使用系统后备字体，也可重新生成更完整的合法子集。

npm 的完整依赖树与校验信息保存在锁文件中。第三方版权、字体修改说明、Playwright 附带声明和原始许可证索引见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。再分发时保留该文件与 `vendor/licenses/`；字体继续适用其原始字体许可证，第三方依赖继续适用各自许可证。
