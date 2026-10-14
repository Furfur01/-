from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import json, shutil, html

folder = Path(__file__).parent
root = folder.parents[2]
web = root / 'opendesign/mockups/galactic-command'
assets = web / 'assets/remaining-fleet-rebuild'
assets.mkdir(parents=True, exist_ok=True)
refs = root / 'models/recovered/remaining-tripo-20261013'
sources = {r['id']: r for r in json.loads((refs / 'manifest.json').read_text(encoding='utf-8'))}
rows = json.loads((folder / 'manifest.json').read_text(encoding='utf-8'))
font = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 23)
small = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 17)
metrics = {}
cards = []
gallery = Image.new('RGB', (1600, 1080), '#101c26')
gd = ImageDraw.Draw(gallery)
gd.text((28, 17), '其余 11 艘 · 异形装甲重建 / 探测器保留', font=font, fill='#e8f1f4')
for index, row in enumerate(rows):
    name, title = row['id'], row['name']
    reference = name in sources
    canvas = Image.new('RGB', (1530, 1120), '#12202b')
    draw = ImageDraw.Draw(canvas)
    draw.text((25, 15), title + ' · ' + name, font=font, fill='#e8f1f4')
    scores = {}
    for i, (view, label) in enumerate([('front', '正视'), ('side', '侧视'), ('top', '俯视')]):
        masks = []
        for j, version in enumerate(['reference', 'rebuilt']):
            if version == 'reference' and not reference: continue
            im = Image.open(folder / f'{name}-{version}-{view}.png').convert('RGBA')
            assert im.size == (850, 850)
            masks.append(np.array(im)[:, :, 3] > 127)
            im = im.resize((500, 500), Image.Resampling.LANCZOS)
            canvas.paste(im, (i * 510 + 5, j * 520 + 78), im)
            caption = ('原概念模型' if name == 'Death_Star' else '原始 Tripo') if version == 'reference' else '全新重建'
            draw.text((i * 510 + 20, j * 520 + 65), caption + ' / ' + label, font=small, fill='#a9c4d0')
        if reference:
            a, b = masks
            scores[view] = round(float((a & b).sum() / (a | b).sum()), 4)
    if not reference:
        sprites = list((web / 'assets/ship-references').glob('*_' + name + '.png'))
        if sprites:
            im = Image.open(sprites[0]).convert('RGBA')
            im.thumbnail((470, 470), Image.Resampling.LANCZOS)
            canvas.paste(im, ((1530-im.width)//2, 90), im)
        draw.text((25, 70), 'APK 单视角；侧背与厚度为补建' if sprites else '保留旧概念方向重建；无对应 APK 原图', font=font, fill='#a9c4d0')
    draw.text((25, 1090), '同尺度正交投影 · 舰长 14 展示单位（钛能放大展示） · 轮廓与细节待验收', font=small, fill='#a9c4d0')
    canvas.save(folder / f'{name}-comparison.png')
    for filename in [f'{name}-comparison.png', f'{name}.png']: shutil.copy2(folder / filename, assets)
    if reference: metrics[name] = scores
    hero = Image.open(folder / f'{name}.png').convert('RGBA').resize((400, 300), Image.Resampling.LANCZOS)
    x, y = (index % 4)*400, 60 + (index // 4)*340
    gallery.paste(hero, (x, y), hero)
    gd.text((x+18, y+287), title.split(' / ')[0], font=small, fill='#e8f1f4')
    caption = '概念模型 / 无 APK 对照' if name in ['Death_Star','Guardian'] else '找回的三视图' if reference else 'APK 原图 / 隐藏面补建'
    cards.append(f'<article><a href="ships.html?ship={name}"><img src="assets/remaining-fleet-rebuild/{name}.png" alt="{html.escape(title)}新模型" loading="lazy"><h2>{html.escape(title)}</h2></a><p>{name} · {caption}</p><a href="assets/remaining-fleet-rebuild/{name}-comparison.png">查看对照图 ↗</a></article>')
gallery.save(folder / 'fleet-overview.jpg', quality=95)
shutil.copy2(folder / 'fleet-overview.jpg', assets)
(folder / 'silhouette-check.json').write_text(json.dumps({'method':'Equal orthographic projection alpha intersection / union; includes new weapons.','limitation':'Diagnostic projection overlap only; not overall 3D similarity or acceptance.','scores':metrics},indent=2),encoding='utf-8')
(web / 'remaining-review.html').write_text('''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>舰队重建 · 11 艘验收</title><style>*{box-sizing:border-box}body{margin:0;background:#101c26;color:#e8f1f4;font:16px/1.6 system-ui,"Microsoft Yahei",sans-serif}main{max-width:1500px;margin:auto;padding:32px}h1{margin:0;font-size:28px}header p{color:#a9c4d0;max-width:1000px}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:16px}article{background:#172733;border:1px solid #2d4556;padding:14px}img{width:100%;aspect-ratio:4/3;object-fit:contain}h2{font-size:18px;margin:0}a{color:#bde8fa;text-decoration:none}a:hover{text-decoration:underline}a:focus-visible{outline:2px solid #bde8fa}article p{color:#a9c4d0;font-size:12px;margin:5px 0 14px}header>a{display:inline-block;margin-bottom:24px}</style><main><header><h1>舰队重建 · 11 艘验收</h1><p>殖民舰与噬能截击者的参考身份已纠正。保留各自轮廓，采用异形装甲与低矮炮座，所有部件有实体连接。探测器、战列舰、收割者、湮灭之星，以及轻战、巡洋舰、重战、无畏舰、驱逐舰与深空吞噬者保持本轮修改前的最新版。</p><p>点击舰船进入可旋转的模型页面。三视图相似度待验收；缺少三视图的舰船明确标记补建来源。</p><a href="ships.html?ship=Devourer_Interceptor">打开噬能截击者 ↗</a></header><section>''' + ''.join(cards) + '</section></main></html>',encoding='utf-8')
# Repair the historical contact sheets from the corrected identity manifest.
items = list(sources)
for start in range(0, len(items), 4):
    board = Image.new('RGB', (960, 1400), '#080c10')
    bd = ImageDraw.Draw(board)
    for j, name in enumerate(items[start:start+4]):
        bd.rectangle((0,j*350,960,j*350+30),fill='#1b2a38')
        bd.text((8,j*350+2),name,font=small,fill='white')
        for i, view in enumerate(['front','side','top']):
            im=Image.open(refs/'orthographic'/f'{name}-{view}.png').convert('RGBA')
            im.thumbnail((320,320),Image.Resampling.LANCZOS)
            board.paste(im,(i*320+(320-im.width)//2,j*350+30),im)
    board.save(refs/'orthographic'/f'sheet-{start//4}.jpg',quality=95)
assert len(rows)==11 and all((assets/(r['id']+'-comparison.png')).exists() for r in rows)
print(json.dumps(metrics,indent=2))
