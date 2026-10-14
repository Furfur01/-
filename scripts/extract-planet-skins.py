"""Export every original SolarSystem planet skin by its TFS frame label."""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageDraw, ImageFont
from apk_swf import parse, ROOT

DEST = Path(__file__).resolve().parents[1] / 'opendesign/mockups/galaxy-empire/assets/original/scenes'
OUT = ROOT / 'planet-skin-audit'
OUT.mkdir(exist_ok=True)
exports, shapes, sprites = parse('SolarSystem_new.tfs')
skin_sprite = next(s for s in sprites.values() if 'planet_Icon_34' in s['labels'].values())
rows = []
for frame, label in skin_sprite['labels'].items():
    skin_id = int(label.rsplit('_', 1)[1])
    if skin_id < 17:
        continue
    placed = skin_sprite['placements'][frame]
    assert len(placed) == 1 and placed[0] in shapes, (label, placed)
    shape_id = placed[0]
    shape = shapes[shape_id]
    atlas_name = exports[shape['bitmap']]
    atlas = Image.open(ROOT / 'atlases' / atlas_name).convert('RGBA')
    box = shape['box']
    assert 0 <= box[0] < box[2] <= atlas.width and 0 <= box[1] < box[3] <= atlas.height
    image = atlas.crop(box)
    asset = f'npc-planet-{skin_id}.png'
    target = DEST / asset
    image.save(target)
    rows.append({'skin_id': skin_id, 'asset': asset, 'source_ui': 'SolarSystem_new.tfs', 'source_atlas': atlas_name, 'label': label, 'frame': frame, 'shape_id': shape_id, 'crop_box': box, 'size': list(image.size), 'alpha_range': list(image.getchannel('A').getextrema()), 'sha256': hashlib.sha256(target.read_bytes()).hexdigest()})
assert [r['skin_id'] for r in rows] == list(range(17, 35))
manifest = {
    'note': 'All 18 original planet_Icon_17–34 labels, not 18 confirmed NPC categories. GameUISolar.GetSinglePlanetIcon uses planet_position > 16 as the default skin ID; a nonzero server planet_icon overrides it. getPiratesPlanetSpriteByIndex returns the ID unchanged. Other UI also uses planet_icon for player skins. Do not infer NPC type or level from these labels. 24 and 29 share one original shape.',
    'source_logic': {
        'GameUISolar.GetSinglePlanetIcon': {'source_lines': [558, 582], 'npc_default': 'planet_position when > 16', 'override': 'nonzero planet_icon from the server, returned unchanged'},
        'GameUISolar.getPiratesPlanetSpriteByIndex': {'source_lines': [595, 597], 'logic': 'return id'},
        'GameUISolar.RefreshSystem': {'source_lines': [599, 665], 'name': 'server planet_name', 'level': 'pirate_level is displayed as LV; it does not choose the skin'},
        'GameUICityUIUp.UpdateSkyfall': {'source_lines': [801, 827], 'logic': 'also uses planet_icon for player planet appearance'},
    },
    'classification': 'No client-side table associates these IDs with NPC faction, NPC level, or official category names. IDs 17–21 can reproduce ordinary NPC positions 17–21; any assignment to this project\'s simulated NPC templates is project-specific.',
    'same_shape_labels': [[24, 29]],
    'overlapping_atlas_regions': [[20, 32]],
    'crosscheck': 'SolarSystem_new and CityUI_UP, each in default/4x3/16x9 variants, resolve all 18 labels to byte-identical RGBA crops. No planet_Icon_35+ found in the extracted TFS inventory.',
    'other_npcs': 'GalaxyChallenge activity NPC images are server-provided image URLs; starfortress resources are a separate UI family, not part of this planet_Icon label table.',
    'images': rows,
}
(DEST / 'npc-planets-source.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
sheet = Image.new('RGB', (1200, 810), '#14202e')
draw = ImageDraw.Draw(sheet)
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 18)
for i, row in enumerate(rows):
    x, y = i % 6 * 200, i // 6 * 270
    icon = Image.open(DEST / row['asset'])
    icon.thumbnail((184, 222), Image.Resampling.LANCZOS)
    sheet.paste(icon, (x + (200-icon.width)//2, y + (230-icon.height)//2), icon)
    draw.text((x+12, y+233), row['label'], font=font, fill='#e9f3ff')
    draw.text((x+12, y+254), f"{row['size'][0]} x {row['size'][1]}", font=font, fill='#a8bacc')
sheet.save(OUT / 'planet-icons-17-34.png')
print(json.dumps({'count': len(rows), 'unique_shapes': len({r['shape_id'] for r in rows}), 'output': str(OUT / 'planet-icons-17-34.png')}, ensure_ascii=False))
