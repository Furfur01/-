"""Build a name/index reference from the already extracted APK UI and Lua data.

Reads output/apk-icons; writes a separate review artifact. Original art is copied
unchanged. The generated sheets are labelled data tables, not redrawn artwork.
"""
import csv
import hashlib
import html
import json
import math
import shutil
import struct
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'output/apk-icons'
OUT = ROOT / 'models/reference/original-atlas-v1'
OUT.mkdir(parents=True, exist_ok=True)
(OUT / 'icons').mkdir(exist_ok=True)

def read_json(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))

def language(group, suffix):
    data = (SRC / 'original-assets/data2/text' / f'{group}.{suffix}').read_bytes()
    count = struct.unpack_from('<H', data)[0]
    pos, result = 2, []
    for _ in range(count):
        size = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        result.append(data[pos:pos + size].decode('utf-8'))
        pos += size
    assert pos == len(data)
    return result

texts = {}
for group in ('menu', 'building'):
    keys, cn, en = language(group, 'idx'), language(group, 'cn'), language(group, 'en')
    assert len(keys) == len(cn) == len(en)
    texts[group] = dict(zip(keys, zip(cn, en)))

def enum_assignments(filename, prefix):
    proto = read_json(SRC / 'lua-analysis' / filename)
    constants, result = proto['const'], {}
    # This client's Lua opcode 10 stores RK key/value pairs in a table.
    # Keep the raw instruction and PC alongside each extracted assignment.
    for pc, instruction in enumerate(proto['code']):
        op = instruction & 63
        b, c = (instruction >> 23) & 511, (instruction >> 14) & 511
        if op == 10 and b >= 256 and c >= 256:
            key, value = constants[b - 256], constants[c - 256]
            if isinstance(key, str) and key.startswith(prefix):
                assert isinstance(value, (float, int)) and int(value) == value
                result[int(value)] = {'constant': key, 'pc': pc, 'instruction': instruction}
    return result

fleets = enum_assignments('GameFleetDefine.json', 'FT_')
techs = enum_assignments('GameResearchDefine.json', 'RT_')
assert set(fleets) == set(range(1, 30))
assert fleets[4]['constant'] == 'FT_BATTLESHIP'
assert fleets[5]['constant'] == 'FT_BATTLEECRUISER'

# Chinese labels retain the project's familiar wording, with original APK
# description/localization keys recorded independently as supporting evidence.
NAMES = {
    1: ('轻型战机', 'Light Fighter', 'Light_Fighter', 'menu.light_fighter_description'),
    2: ('重型战机', 'Heavy Fighter', 'Heavy_Fighter', 'menu.heavy_fighter_description'),
    3: ('巡洋舰', 'Cruiser', 'Cruiser', 'menu.cruiser_description'),
    4: ('战列舰', 'Battleship', 'Battleship', 'menu.battleship_description'),
    5: ('无畏舰', 'Dreadnought / Battlecruiser', 'Dreadnought', 'menu.battlecruiser_description'),
    6: ('行星轰炸机 / 导弹舰', 'Bomber', 'Bomber', 'menu.bomber_description'),
    7: ('驱逐舰', 'Destroyer', 'Destroyer', 'menu.destroyer_description'),
    9: ('轻型运输舰', 'Small Cargo', 'Cargo_Ship', 'menu.small_cargo_description'),
    10: ('重型运输舰', 'Large Cargo', 'Large_Cargo_Ship', 'menu.large_cargo_description'),
    11: ('殖民舰 / 开拓船', 'Colony Ship', 'Colony_Ship', 'menu.colony_ship_description'),
    12: ('回收舰', 'Recycler', 'Recycler', 'menu.recycler_description'),
    13: ('间谍探测器', 'Espionage Probe', 'Probe', 'menu.espionage_probe_description'),
    14: ('太阳能卫星', 'Solar Satellite', 'Solar_Satellite', 'menu.solar_satellite_description'),
    15: ('导弹发射装置', 'Rocket Launcher', 'Rocket_Launcher', 'menu.rocket_launcher_description'),
    16: ('轻型激光炮', 'Light Laser', 'Light_Laser', 'menu.light_laser_description'),
    17: ('重型激光炮', 'Heavy Laser', 'Heavy_Laser', 'menu.heavy_laser_description'),
    18: ('MK2炮 / 磁轨炮', 'MK2 Cannon', 'MK2_Cannon', ''),
    19: ('中子炮', 'Ion Cannon', 'Ion_Cannon', 'menu.ion_canon_description'),
    20: ('等离子炮', 'Plasma Cannon', 'Plasma_Cannon', 'menu.plasma_canon_description'),
    21: ('小型防护盾', 'Small Shield Dome', 'Small_Shield_Dome', 'menu.small_shield_dome_description'),
    22: ('大型防护盾', 'Large Shield Dome', 'Large_Shield_Dome', 'menu.big_shield_dome_description'),
    23: ('裂变者', 'Interceptor', 'Interceptor', 'menu.interceptor_description'),
    24: ('深空吞噬者', 'Iron Behemoth', 'Iron_Behemoth', 'menu.desc_behemoth'),
    25: ('噬能截击者', 'Devourer Interceptor', 'Devourer_Interceptor', 'menu.GC_fleet_type_25_description'),
    26: ('钛能守卫者', 'Titanenergetic Frigate', 'Titanenergetic_Frigate', 'menu.GC_fleet_type_26_description'),
    27: ('质子炮', 'Proton Cannon', 'Proton_Cannon', 'menu.GC_proton_description'),
    28: ('湮灭之星', 'Annihilator', 'Annihilator', 'menu.GC_bomb_description'),
    29: ('Reaper（收割者·暂译）', 'Reaper', 'Reaper', 'menu.GC_reaper_description'),
}
TECH_NAMES = {
    4: ('超空间科技', 'Hyperspace Tech', 'Hyperspace_Tech'),
    7: ('脉冲引擎', 'Impulse Drive', 'Impulse_Drive'),
    10: ('计算机科技', 'Computer Tech', 'Computer_Tech'),
}
manifest = read_json(SRC / 'icons.json')
uploaded = Image.open(OUT / 'ships-and-defense-atlas.png').convert('RGBA')
original = Image.open(SRC / 'atlases/ShipCityTech_1.png').convert('RGBA')
upload_pixels, original_pixels = np.asarray(uploaded), np.asarray(original)
assert np.array_equal(upload_pixels[:, :, 3], original_pixels[:, :, 3]), 'Atlas alpha geometry differs'
opaque = original_pixels[:, :, 3] == 255
assert np.array_equal(upload_pixels[opaque], original_pixels[opaque]), 'Opaque sprite pixels differ'
# Clipboard round-tripping changed hidden RGB values in transparent pixels.
# Match unchanged alpha geometry and fully opaque art, then use APK originals.
rows = []
for icon in manifest['icons']:
    number, category = icon['id'], icon['category']
    if category == 'technology' and icon['source_atlas'] != 'ShipCityTech_1.png':
        continue
    if category == 'technology':
        zh, en, unit_id = TECH_NAMES[number]
        evidence, key = techs[number], ''
    else:
        zh, en, unit_id, key = NAMES[number]
        evidence = fleets[number]
    source = SRC / icon['file']
    bitmap = Image.open(SRC / 'atlases' / icon['source_atlas']).convert('RGBA')
    assert np.array_equal(np.asarray(bitmap.crop(icon['crop_box'])), np.asarray(Image.open(source).convert('RGBA')))
    local_file = f'icons/{category}_{number:02d}_{unit_id}.png'
    shutil.copy2(source, OUT / local_file)
    row = {**icon, 'file': local_file, 'name_zh': zh, 'name_en': en, 'project_or_reference_id': unit_id,
           'enum_evidence': evidence, 'localization_key': key, 'in_uploaded_atlas': icon['source_atlas'] == 'ShipCityTech_1.png',
           'sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
           'name_note': 'Chinese name is a working translation; APK description supplies English Reaper.' if number == 29 and category == 'fleet' else ''}
    if key:
        group, loc_key = key.split('.', 1)
        row['localization_cn'], row['localization_en'] = texts[group][loc_key]
    rows.append(row)

main_rows = [r for r in rows if r['in_uploaded_atlas']]
assert len(main_rows) == 29
assert sum(r['category'] == 'fleet' for r in main_rows) == 17
assert sum(r['category'] == 'defense' for r in main_rows) == 9
assert sum(r['category'] == 'technology' for r in main_rows) == 3
assert len(rows) == 31
report = {'source': 'yinhediguo.apk -> assets/tap4fun.zip -> AppOriginalData/Android',
          'uploaded_atlas_alpha_and_opaque_pixels_match_apk': True, 'uploaded_atlas_counts': {'fleet_and_satellite': 17, 'defense': 9, 'technology': 3},
          'all_extracted_fleet_icons': 19, 'missing_ui_icon': {'id': 8, **fleets[8], 'note': 'Constant exists; the extracted Fleets.tfs icon list contains no type_8. Do not substitute another ship.'},
          'guardian_note': 'No FT_GUARDIAN constant in this client table. FT_FLEETTYPE_26 is specifically named Titanenergetic Frigate / 钛能守卫者 in localization.',
          'rows': rows}
(OUT / 'name-map.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
with (OUT / 'name-map.csv').open('w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f)
    w.writerow(['类别', '内部编号', '中文名称', '英文名称', '代码常量', '原图集', '原图坐标', '图标文件', '名称说明'])
    for r in sorted(rows, key=lambda x: (x['category'], x['id'])):
        w.writerow([r['category'], r['label'], r['name_zh'], r['name_en'], r['enum_evidence']['constant'], r['source_atlas'], r['crop_box'], r['file'], r['name_note']])

# Render a labelled reference table using original, unmodified PNG icons.
font_path = 'C:/Windows/Fonts/msyh.ttc'
def sheet(items, title, subtitle, filename, columns=4):
    cw, ch, margin, header = 330, 268, 28, 110
    canvas = Image.new('RGB', (columns*cw + 2*margin, math.ceil(len(items)/columns)*ch + header + margin), '#101a27')
    draw = ImageDraw.Draw(canvas)
    title_font, body_font, small = [ImageFont.truetype(font_path, n) for n in (30, 22, 15)]
    draw.text((margin, 18), title, font=title_font, fill='#edf4fc')
    draw.text((margin, 65), subtitle, font=small, fill='#9db2ca')
    for i, row in enumerate(items):
        x, y = margin + (i % columns)*cw, header + (i // columns)*ch
        highlight = row['category'] == 'fleet' and row['id'] == 4
        draw.rounded_rectangle((x+2, y+2, x+cw-10, y+ch-10), 8, fill='#1b2b40', outline='#55c9e8' if highlight else '#293c50', width=2 if highlight else 1)
        bitmap = Image.open(OUT / row['file']).convert('RGBA')
        bitmap.thumbnail((cw-30, 174), Image.Resampling.LANCZOS)
        canvas.paste(bitmap, (x+(cw-8-bitmap.width)//2, y+8+(174-bitmap.height)//2), bitmap)
        draw.text((x+14, y+185), f"{row['id']:02d}  {row['name_zh']}", font=body_font, fill='#f0f5fa')
        draw.text((x+14, y+218), row['name_en'], font=small, fill='#b6cce2')
        suffix = ' · 独立图集' if not row['in_uploaded_atlas'] else ''
        draw.text((x+14, y+240), row['label'] + suffix, font=small, fill='#6fbad3')
    canvas.save(OUT / filename)

ship_rows = sorted([r for r in rows if r['category'] == 'fleet'], key=lambda r: r['id'])
defense_rows = sorted([r for r in rows if r['category'] == 'defense'], key=lambda r: r['id'])
sheet(ship_rows, '银河帝国 / 舰船名称与原始图标对照', '来自 APK 的内部编号、舰种常量和本地文案；17 枚在你提供的图中，另 2 枚来自独立图集。', 'fleet-names.png')
sheet(defense_rows, '银河帝国 / 防御设施名称对照', '全部来自你提供的原图；编号与舰船共用 Fleets.tfs 的 type 序列。', 'defense-names.png', 3)

def card(row):
    return f'''<article class="card" data-kind="{row['category']}" data-id="{row['id']}">
      <img src="{row['file']}" alt="{html.escape(row['name_zh'])}">
      <strong>{row['id']:02d} · {html.escape(row['name_zh'])}</strong><p>{html.escape(row['name_en'])}</p>
      <code>{row['enum_evidence']['constant']}</code><small>{row['source_atlas']} · {row['label']}</small></article>'''

cards = '\n'.join(card(r) for r in sorted(rows, key=lambda r: ({'fleet':0,'defense':1,'technology':2}[r['category']],r['id'])))
overlays = '\n'.join(f'<button class="tag" style="left:{r["crop_box"][0]/10.24}%;top:{r["crop_box"][1]/10.24}%" title="{html.escape(r["name_zh"])}" data-id="{r["id"]}" data-kind="{r["category"]}">{"T" if r["category"]=="technology" else ""}{r["id"]:02d}</button>' for r in main_rows)
page = '''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>银河帝国 · 原始图标名称核对</title><style>
*{box-sizing:border-box}body{margin:0;background:#101a27;color:#eef4fc;font:16px/1.6 "Microsoft YaHei",sans-serif}main{max-width:1480px;margin:auto;padding:30px}h1{margin:0}p{color:#aec1d6}a{color:#77d5ef}nav{display:flex;gap:8px;flex-wrap:wrap;margin:20px 0}button{cursor:pointer;background:#23384d;color:white;border:1px solid #52728c;padding:8px 18px;border-radius:5px}button.active{background:#145573;border-color:#65d5ef}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px}.card{display:flex;flex-direction:column;padding:16px;background:#1b2b40;border:1px solid #30485e;border-radius:8px}.card img{width:100%;height:188px;object-fit:contain}.card strong{font-size:21px}.card p{margin:2px 0}code,small{font-size:12px;color:#7fadc8}.selected{outline:3px solid #6bdcf4}.atlas{position:relative;max-width:1024px;margin:24px auto;background:#070e18}.atlas img{display:block;width:100%}.tag{position:absolute;padding:1px 5px;font:700 12px monospace;background:#0b263bdc;color:#bdf4ff;border:1px solid #71cee4}.note{padding:16px 20px;background:#1b2b40;border-left:3px solid #74c8df}details{margin:24px 0}summary{cursor:pointer;font-size:20px}</style>
<main><h1>原始图标 ↔ 舰种名称</h1><p>直接读取 APK 解包数据：UI 图标帧 → 内部编号 → 舰种常量 → 中英文文案。保留原始像素，不用新绘制图代替。</p>
<div class="note">你的图集中有 <b>17 个飞船／卫星、9 个防御设施、3 个科技图标</b>。另找到 2 艘独立图集飞船，共 19 个已提取舰船图标。<br>战列舰是 <b>type_4</b>；无畏舰是 <b>type_5</b>；殖民舰是 <b>type_11</b>。<br>type_8 的死星常量存在，但本次 UI 图标表没有对应图标。Reaper 的中文名称标为暂译。</div>
<p><a href="name-map.csv">下载 CSV</a>　<a href="name-map.json">来源与编号 JSON</a>　<a href="fleet-names.png">舰船对照图</a>　<a href="defense-names.png">防御对照图</a></p>
<details><summary>查看原图编号定位（点击编号定位到条目）</summary><div class="atlas"><img src="ships-and-defense-atlas.png" alt="用户提供的原始图集">OVERLAYS</div></details>
<nav><button class="active" data-filter="fleet">舰船 19</button><button data-filter="defense">防御 9</button><button data-filter="technology">原图内科技 3</button><button data-filter="all">全部</button></nav><section class="grid">CARDS</section>
<p>说明：中文标签部分采用项目习惯称呼，具体绑定依据为 APK 内部常量；特殊舰的中文名称来自本地文案。原代码 FT_BATTLEECRUISER 的拼写原样保留。当前核对页不会改动游戏素材。</p></main>
<script>function filter(kind){document.querySelectorAll('.card').forEach(c=>c.hidden=kind!=='all'&&c.dataset.kind!==kind);document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter===kind))}document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>filter(b.dataset.filter));document.querySelectorAll('.tag').forEach(b=>b.onclick=()=>{filter(b.dataset.kind);document.querySelectorAll('.card').forEach(c=>c.classList.remove('selected'));const c=document.querySelector(`.card[data-kind="${b.dataset.kind}"][data-id="${b.dataset.id}"]`);c.classList.add('selected');c.scrollIntoView({behavior:'smooth',block:'center'})});filter('fleet');</script><style>[hidden]{display:none!important}</style></html>'''
(OUT / 'index.html').write_text(page.replace('OVERLAYS', overlays).replace('CARDS', cards), encoding='utf-8')
print('APK_ICON_NAMES_OK: 29 uploaded-atlas icons + 2 independent ships; raw pixels and type constants verified.')
print('Battleship = type_4; Dreadnought = type_5; Colony Ship = type_11.')
