from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import json, shutil

folder = Path(__file__).parent
assets = folder.parents[2] / 'opendesign/mockups/galactic-command/assets/three-view-rebuild'
assets.mkdir(parents=True, exist_ok=True)
font_path = 'C:/Windows/Fonts/msyh.ttc'
font = ImageFont.truetype(font_path, 23)
small = ImageFont.truetype(font_path, 17)
titles = {'Destroyer': '驱逐舰', 'Iron_Behemoth': '深空吞噬者'}
metrics = {}
for name, title in titles.items():
    canvas = Image.new('RGB', (1530, 1120), '#12202b')
    draw = ImageDraw.Draw(canvas)
    draw.text((30, 20), title + ' · 原模型 / 全新重建 · 同尺度三视图', font=font, fill='#e8f1f4')
    scores = {}
    for i, (view, label) in enumerate([('front', '正视'), ('side', '侧视'), ('top', '俯视')]):
        masks = []
        for j, (version, caption) in enumerate([('reference', '原始 Tripo'), ('rebuilt', '全新重建')]):
            image = Image.open(folder / f'{name}-{version}-{view}.png').convert('RGBA')
            assert image.size == (850, 850)
            masks.append(np.array(image)[:, :, 3] > 127)
            image = image.resize((500, 500), Image.Resampling.LANCZOS)
            canvas.paste(image, (i * 510 + 5, j * 520 + 78), image)
            draw.text((i * 510 + 20, j * 520 + 65), caption + ' / ' + label, font=small, fill='#a9c4d0')
        a, b = masks
        scores[view] = round(float((a & b).sum() / (a | b).sum()), 4)
    draw.text((25, 1090), '正交投影 · 统一舰长 14 展示单位 · 上：原模型 / 下：新模型（含新增武器）', font=small, fill='#a9c4d0')
    canvas.save(folder / f'{name}-comparison.png')
    shutil.copy2(folder / f'{name}-comparison.png', assets)
    metrics[name] = scores
(folder / 'silhouette-check.json').write_text(json.dumps({
    'method': 'Pixel intersection / union, alpha > 127; equal orthographic scale and canonical alignment; includes added weapons.',
    'limitation': 'Silhouette overlap only, not overall 3D similarity or visual-quality acceptance.',
    'scores': metrics
}, indent=2), encoding='utf-8')
print(json.dumps(metrics, indent=2))
