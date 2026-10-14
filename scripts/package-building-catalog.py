"""Package the current building catalog and additional recovered APK variants."""
from pathlib import Path
import csv
import html
import io
import json
import shutil
import subprocess
import zipfile
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/建筑清单与缩略图-分类版'
ASSETS = ROOT / 'opendesign/mockups/galaxy-empire/assets'
catalog = json.loads(subprocess.check_output(
    ['node', '--input-type=module', '-e',
     "import {buildings} from './game/catalog.mjs'; console.log(JSON.stringify(Object.values(buildings)))"],
    cwd=ROOT, encoding='utf-8'))
art = json.loads((ROOT / 'game/original-assets.json').read_text(encoding='utf-8'))
archive = [a for a in art['archive'] if a['category'] == 'building']
by_id = {a['gameId']: a for a in archive if a.get('gameId')}
extra_descriptions = {17: 'APK 中的月球飞船基地图片变体。', 18: 'APK 中的月球机器人工厂图片变体。',
                      20: '研究和装备氪晶体，为所在星球提供装备槽。', 21: '建造与研究旗舰的月球设施。'}
groups = ('普通建筑', '月球建筑')
for group in groups:
    for folder in ('缩略图', '原尺寸图片'):
        (OUT / group / folder).mkdir(parents=True, exist_ok=True)
rows = []
for b in catalog:
    original = by_id.get(b['id'])
    rows.append(dict(id=b['id'], name=b['name'], alias=original['name'] if original else '',
                     description=b['description'], status='当前游戏建筑',
                     group='月球建筑' if b.get('moon') else '普通建筑',
                     source='APK 原图' if original else '项目重制图',
                     asset=art['buildings'].get(b['id'], f"buildings-v2/{b['id']}.png")))
for a in archive:
    if not a.get('gameId'):
        rows.append(dict(id=f"APK_building_{a['id']:02}", name=a['name'], alias='',
                         description=extra_descriptions[a['id']], status='APK 额外建筑 / 变体',
                         source='APK 原图', asset=a['asset'],
                         group='月球建筑' if a['id'] in (17, 18, 21) else '普通建筑'))
assert len(catalog) == 20 and len(archive) == 21 and len(rows) == 24
assert len({r['id'] for r in rows}) == len(rows)
rows.sort(key=lambda r: groups.index(r['group']))
assert {r['id'] for r in rows if r['group'] == '月球建筑'} == {
    'Moon_Base', 'Wormhole_Generator', 'The_EU_X_Radar',
    'APK_building_17', 'APK_building_18', 'APK_building_21'}
for i, row in enumerate(rows, 1):
    row['number'] = i
    filename = f"{i:02}_{row['name']}_{row['id']}.png"
    row['thumbnail'] = row['group'] + '/缩略图/' + filename
    row['image'] = row['group'] + '/原尺寸图片/' + filename
    source = ASSETS / row['asset']
    shutil.copy2(source, OUT / row['image'])
    with Image.open(source) as im:
        im.load()
        fitted = ImageOps.contain(im.convert('RGBA'), (280, 220), Image.Resampling.LANCZOS)
        thumb = Image.new('RGBA', (320, 256))
        thumb.alpha_composite(fitted, ((320-fitted.width)//2, (256-fitted.height)//2))
        thumb.save(OUT / row['thumbnail'])

font_path = 'C:/Windows/Fonts/msyh.ttc'
font = ImageFont.truetype(font_path, 22)
small = ImageFont.truetype(font_path, 15)
title = ImageFont.truetype('C:/Windows/Fonts/msyhbd.ttc', 36)
for group in groups:
    members = [r for r in rows if r['group'] == group]
    sheet = Image.new('RGB', (1440, 154 + ((len(members)+3)//4)*338), '#101d2c')
    draw = ImageDraw.Draw(sheet)
    draw.text((36, 25), '银河帝国 · ' + group, font=title, fill='#f4f7fc')
    draw.text((38, 79), f'共 {len(members)} 项 · 保留图片来源与当前游戏 / APK 额外状态', font=font, fill='#a5bbd4')
    for i, row in enumerate(members):
        x, y = 24+(i%4)*354, 136+(i//4)*338
        draw.rounded_rectangle((x, y, x+338, y+320), radius=12, fill='#1c2e43')
        with Image.open(OUT / row['thumbnail']) as thumb:
            sheet.paste(thumb, (x+9, y+2), thumb)
        draw.text((x+16, y+249), f"{row['number']:02}  {row['name']}", font=font, fill='#f4f7fc')
        draw.text((x+16, y+287), row['source'] + (' · 额外 / 变体' if row['status'].startswith('APK') else ' · 当前游戏'), font=small, fill='#a5bbd4')
    sheet.save(OUT / group / (group + '总览.png'))
cards = []
for r in rows:
    if r['number'] == 1 or rows[r['number']-2]['group'] != r['group']:
        if cards:
            cards.append('</div>')
        cards.append(f'<h2>{r["group"]} · {sum(x["group"] == r["group"] for x in rows)} 项</h2><div class="grid">')
    e = {k: html.escape(str(v), quote=True) for k, v in r.items()}
    cards.append(f'<article><a href="{e["image"]}"><img src="{e["thumbnail"]}" alt="{e["name"]}"></a>'
                 f'<h2>{r["number"]:02} · {e["name"]}</h2><code>{e["id"]}</code>'
                 f'<p>{e["description"]}</p><p class="meta">{e["status"]} · {e["source"]}</p>'
                 f'<p class="meta">原版名称：{e["alias"] or "—"}</p></article>')
(OUT / '建筑图鉴.html').write_text('''<!doctype html><html lang="zh-CN"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>银河帝国 · 建筑图鉴</title>
<style>body{margin:0;padding:32px;background:#101d2c;color:#f4f7fc;font:16px/1.6 "Microsoft YaHei",sans-serif}main{max-width:1440px;margin:auto}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}article{background:#1c2e43;border-radius:12px;padding:20px}img{width:100%;height:230px;object-fit:contain}h2{font-size:21px;margin:8px 0}code{font-size:13px;overflow-wrap:anywhere;color:#b2d8eb}.meta{font-size:13px;color:#a5bbd4}a{color:#a5dafa}</style>
<main><h1>银河帝国 · 建筑图鉴</h1><p>普通建筑 18 项，月球建筑 6 项，共 24 项。点击缩略图查看原尺寸图片。</p>
<p>按建筑类型与图片变体归类：月球专属建筑和月球图片变体归入月球建筑；通用建筑保留在普通建筑，不代表只能在行星建造。</p>
<p>名称和用途按当前项目整理，保留 APK 原名供对照。主基地、地形改造器、导弹发射井使用项目重制图。</p>'''
    + ''.join(cards) + '</div></main></html>', encoding='utf-8')
fields = {'number':'序号', 'group':'建筑分类', 'name':'建筑名称', 'id':'建筑ID', 'alias':'APK原名', 'description':'用途',
          'status':'目录状态', 'source':'图片来源', 'thumbnail':'缩略图', 'image':'原尺寸图片', 'asset':'项目源图片'}
for group in (None, *groups):
    members = rows if group is None else [r for r in rows if r['group'] == group]
    destination = OUT / '建筑清单.csv' if group is None else OUT / group / (group + '清单.csv')
    with destination.open('w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(fields.values())
        writer.writerows([r[k] for k in fields] for r in members)
(OUT / '建筑清单.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
(OUT / '说明.txt').write_text('银河帝国建筑清单与缩略图（分类版）\n\n普通建筑18项，月球建筑6项，共24项。\n'
    '月球建筑：月球基地、虫洞发生器、月球雷达、月球飞船基地、月球机器人工厂、旗舰中心。\n'
    '按类型和图片变体分类；通用建筑归入普通建筑，不代表只能在行星建造。氪晶研究中心归入普通建筑。\n'
    '两类分别存放独立清单、总览图、缩略图和原尺寸图片。\n'
    '解压后打开“建筑图鉴.html”查看分组图文清单；各类总览PNG可直接查看或分享；CSV可用Excel打开。\n'
    '缩略图为320×256 PNG；原尺寸图片保留现有资源。缩略图保持比例，不裁掉建筑。\n'
    '来源：game/catalog.mjs、game/original-assets.json 及对应本地图片。\n'
    '主基地、地形改造器、导弹发射井为项目重制图；其余来自已提取的APK资源。\n'
    '额外4项为月球飞船基地、月球机器人工厂、氪晶研究中心、旗舰中心；不表示当前游戏已实现其玩法。\n'
    '未包含3D模型、动画、舰船或防御单位。范围为本项目已定义或已提取的建筑。\n', encoding='utf-8')
archive_path = OUT.with_suffix('.zip')
with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for file in sorted(OUT.rglob('*')):
        if file.is_file():
            z.write(file, file.relative_to(OUT))
with zipfile.ZipFile(archive_path) as z:
    assert z.testzip() is None
    for r in rows:
        with Image.open(io.BytesIO(z.read(r['thumbnail']))) as im:
            im.load()
            assert im.size == (320, 256)
        assert z.read(r['image']) == (ASSETS / r['asset']).read_bytes()
    assert len(list(csv.reader(io.StringIO(z.read('建筑清单.csv').decode('utf-8-sig'))))) == 25
    for group, count in zip(groups, (18, 6)):
        assert len([r for r in rows if r['group'] == group]) == count
        assert len(list(csv.reader(io.StringIO(z.read(f'{group}/{group}清单.csv').decode('utf-8-sig'))))) == count + 1
        assert len([name for name in z.namelist() if name.startswith(f'{group}/缩略图/')]) == count
print(json.dumps({'count':len(rows), 'zip':str(archive_path), 'bytes':archive_path.stat().st_size}, ensure_ascii=False))
