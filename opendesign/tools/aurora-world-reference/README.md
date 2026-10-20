# AURORA 星球整合参考包

## 先看什么
1. 打开 `index.html`，查看四类星球、月球补充和同类多地形对照。
2. 把 `给GPT6Pro-星球整合提示词.md`、本包图片和已完成模型一起交给 GPT‑6 Pro。
3. 需要继续出图，使用 `图片提示词.md` 中的共同段和对应星球段。

## 方向
保留旧 AURORA 设计语言与原始配色。先生成连续星球，再按地貌安排已有模型；不生成建筑群圆形地台。每个类型具有独立地貌机制，同类型每颗星球也独立生成。

## 采用的图片
- 类地星：`images/01-terrestrial.png`
- 金属岩星：`images/02-mercury-v2.png`
- 火星岩星：`images/03-mars-v2.png`
- 气态巨星：`images/04-gas.png`
- 月球 · 补充：`images/05-moon-v2.png`
- 同类，也不是同一颗：`images/06-terrestrial-seeds.png`

`references/aurora-original-global.png` 是早期 AURORA 的画风和体量参考，不继承旧圆形地台。
`references/Flagship_Center-shape-reference.png` 用于锁定旗舰中心及半成品舰体。

## 使用边界
这是内置 image_gen 生成的概念图与交接提示词，不是已接入游戏的渲染结果。建筑形状与玩法数量由现有模型和逻辑目录决定；整球图不用于重建模型。六张采用图与说明、原始提示词已打包；本次未修改正式游戏或存档。

旧版美术来源：项目中的 `opendesign/mockups/planet-construction-review/reference/aurora-original.html`。

