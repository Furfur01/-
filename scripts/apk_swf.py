"""Use bitmap matrices and labelled frames in the APK's SWF/TFS UI files.

No guessed atlas coordinates or guessed Chinese unit names are used.
"""
from pathlib import Path
import json
import math
import struct
import zipfile
import zlib
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1] / 'output/apk-icons'

class Bits:
    def __init__(self, data, offset=0):
        self.data, self.pos = data, offset * 8

    def u(self, count):
        value = 0
        for _ in range(count):
            value = (value << 1) | ((self.data[self.pos // 8] >> (7 - self.pos % 8)) & 1)
            self.pos += 1
        return value

    def s(self, count):
        value = self.u(count)
        return value - (1 << count) if count and value & (1 << (count - 1)) else value

    def align(self):
        self.pos = (self.pos + 7) // 8 * 8

    def rect(self):
        count = self.u(5)
        values = [self.s(count) for _ in range(4)]
        self.align()
        return values

    def matrix(self):
        a = d = 1
        b = c = 0
        if self.u(1):
            count = self.u(5)
            a, d = self.s(count) / 65536, self.s(count) / 65536
        if self.u(1):
            count = self.u(5)
            b, c = self.s(count) / 65536, self.s(count) / 65536
        count = self.u(5)
        tx, ty = self.s(count), self.s(count)
        self.align()
        return a, b, c, d, tx, ty

def tags(data, pos=0):
    while pos + 2 <= len(data):
        header, = struct.unpack_from('<H', data, pos)
        pos += 2
        tag, length = header >> 6, header & 63
        if length == 63:
            length, = struct.unpack_from('<I', data, pos)
            pos += 4
        assert pos + length <= len(data)
        yield tag, data[pos:pos + length]
        pos += length

def parse(name):
    source = ROOT / 'original' / name
    if not source.exists():
        source = ROOT / 'original-assets/data2' / name
    raw = source.read_bytes()
    data = zlib.decompress(raw[8:])
    reader = Bits(data)
    reader.rect()
    exports, shapes, sprites = {}, {}, {}
    for tag, body in tags(data, reader.pos // 8 + 4):
        if tag == 56:
            count, = struct.unpack_from('<H', body)
            pos = 2
            for _ in range(count):
                character, = struct.unpack_from('<H', body, pos)
                pos += 2
                end = body.index(0, pos)
                exports[character] = body[pos:end].decode()
                pos = end + 1
        elif tag in [2, 22, 32]:
            character, = struct.unpack_from('<H', body)
            reader = Bits(body, 2)
            rect = reader.rect()
            pos = reader.pos // 8
            if body[pos] != 1 or body[pos + 1] not in [0x40, 0x41, 0x42, 0x43]:
                continue
            bitmap, = struct.unpack_from('<H', body, pos + 2)
            a, b, c, d, tx, ty = Bits(body, pos + 4).matrix()
            if b or c or not a or not d:
                continue
            x0, x1, y0, y1 = rect
            box = [(x0 - tx) / a, (y0 - ty) / d, (x1 - tx) / a, (y1 - ty) / d]
            shapes[character] = {'bitmap': bitmap, 'box': [round(v) for v in box]}
        elif tag == 39:
            character, frame_count = struct.unpack_from('<HH', body)
            frame, labels, placements = 1, {}, {}
            for child_tag, child in tags(body, 4):
                if child_tag == 1:
                    frame += 1
                elif child_tag == 43:
                    labels[frame] = child.rstrip(b'\0').decode()
                elif child_tag == 26 and child[0] & 2:
                    placed, = struct.unpack_from('<H', child, 3)
                    placements.setdefault(frame, []).append(placed)
            sprites[character] = {'labels': labels, 'placements': placements, 'frames': frame_count}
    return exports, shapes, sprites

def make_icons(source, category, allowed):
    exports, shapes, sprites = parse(source)
    prefix = 'building_' if category == 'building' else 'type_'
    choices = [s for s in sprites.values() if len(s['labels']) > 15 and all(v.startswith(prefix) for v in s['labels'].values())]
    assert len(choices) == 1

    def descendants(character, seen=None):
        seen = set() if seen is None else seen
        if character in seen:
            return []
        seen.add(character)
        if character in shapes and exports.get(shapes[character]['bitmap']) in allowed:
            return [character]
        if character not in sprites:
            return []
        return [s for c in sprites[character]['placements'].get(1, []) for s in descendants(c, seen)]

    output = []
    for frame, label in choices[0]['labels'].items():
        found = [s for c in choices[0]['placements'].get(frame, []) for s in descendants(c)]
        overlay_shapes = []
        if category == 'building' and len(found) > 1:
            # These two buildings have a separate animated overlay. Keep the
            # complete static base, preserving overlay IDs in the manifest.
            found.sort(key=lambda s: (shapes[s]['box'][2] - shapes[s]['box'][0]) * (shapes[s]['box'][3] - shapes[s]['box'][1]), reverse=True)
            overlay_shapes = found[1:]
            found = found[:1]
        assert len(found) == 1, (category, label, found)
        shape = shapes[found[0]]
        atlas_name = exports[shape['bitmap']]
        atlas = Image.open(ROOT / 'atlases' / atlas_name).convert('RGBA')
        x0, y0, x1, y1 = shape['box']
        assert 0 <= x0 < x1 <= atlas.width and 0 <= y0 < y1 <= atlas.height, (label, shape)
        icon = atlas.crop((x0, y0, x1, y1))
        number = int(label.split('_')[1])
        group = 'defense' if category == 'fleet' and number in [15, 16, 17, 18, 19, 20, 21, 22, 27] else category
        path = Path(group) / f'{category}_{number:02d}.png'
        (ROOT / path).parent.mkdir(exist_ok=True)
        icon.save(ROOT / path)
        output.append({'category': group, 'id': number, 'label': label, 'file': path.as_posix(), 'source_ui': source, 'source_atlas': atlas_name, 'crop_box': shape['box'], 'shape_id': found[0], 'size': list(icon.size), 'animated_overlays': overlay_shapes})
    return sorted(output, key=lambda r: r['id'])

def preview(rows, title, filename, cols, cell_width, cell_height):
    margin, header = 24, 90
    width = cols * cell_width + margin * 2
    height = math.ceil(len(rows) / cols) * cell_height + header + margin
    sheet = Image.new('RGB', (width, height), '#101a29')
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 18)
    heading = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', 30)
    draw.text((margin, 14), title, font=heading, fill='#e7f2ff')
    draw.text((margin, 53), '直接提取自 APK · 标签为游戏内部编号 · 单张 PNG 保留透明通道', font=font, fill='#9fb5cf')
    for i, row in enumerate(rows):
        x = margin + i % cols * cell_width
        y = header + i // cols * cell_height
        draw.rounded_rectangle((x + 3, y + 3, x + cell_width - 8, y + cell_height - 8), 9, fill='#1a2b41')
        icon = Image.open(ROOT / row['file']).convert('RGBA')
        icon.thumbnail((cell_width - 24, cell_height - 43), Image.Resampling.LANCZOS)
        sheet.paste(icon, (x + (cell_width - icon.width) // 2 - 2, y + (cell_height - 39 - icon.height) // 2 + 5), icon)
        label = f"{row['label']}   {row['size'][0]}×{row['size'][1]}"
        draw.text((x + 12, y + cell_height - 34), label, font=font, fill='#c5d6e9')
    sheet.save(ROOT / filename)

def main():
    tech = make_icons('ResearchLad.tfs', 'technology', {'ShipCityTech_1.png', 'ShipCityTech_3.png'})
    fleets = make_icons('Fleets.tfs', 'fleet', {'ShipCityTech_1.png', 'ship_Overlord.png', 'ship_destruction_star.png'})
    ships = [r for r in fleets if r['category'] == 'fleet']
    defense = [r for r in fleets if r['category'] == 'defense']
    manifest = {'apk': 'yinhediguo.apk', 'technology_count': len(tech), 'fleet_count': len(ships), 'defense_count': len(defense), 'note': 'Names are original UI type IDs, not guessed display names. Fleet folder includes civilian spacecraft and a satellite. These are static atlas images; animated effects and runtime composition are not rendered.', 'icons': tech + fleets}
    (ROOT / 'icons.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    preview(tech, f'银河帝国 · 科技图标（{len(tech)} 枚）', '科技图标预览.png', 5, 190, 175)
    preview(ships, f'银河帝国 · 战舰与飞船（{len(ships)} 枚）', '战舰图标预览.png', 4, 275, 240)
    preview(defense, f'银河帝国 · 防御设施（{len(defense)} 枚）', '防御设施预览.png', 3, 280, 235)
    print(json.dumps({k:v for k,v in manifest.items() if k != 'icons'}, ensure_ascii=False))

if __name__ == '__main__':
    main()
