"""Read bundled Galaxy Empire textures without installing/running the APK."""
from pathlib import Path
import io
import json
import struct
import sys
import zipfile
import zlib

ROOT = Path(__file__).resolve().parents[1] / 'output/apk-icons'
sys.path.insert(0, str(ROOT / '_tools'))
import texture2ddecoder
from PIL import Image, ImageDraw, ImageFont

ARCHIVE = Path(__file__).resolve().parents[1] / 'research/apk/tap4fun.zip'
PREFIX = 'tap4fun/galaxy_empire/AppOriginalData/Android/'

def open_asset_archive(source=ARCHIVE):
    """Accept the preserved resource ZIP or an explicitly supplied original APK."""
    archive = zipfile.ZipFile(source)
    if 'assets/tap4fun.zip' in archive.namelist():
        payload = archive.read('assets/tap4fun.zip')
        archive.close()
        return zipfile.ZipFile(io.BytesIO(payload))
    if any(name.startswith(PREFIX) for name in archive.namelist()):
        return archive
    archive.close()
    raise ValueError('Expected tap4fun.zip or an APK containing assets/tap4fun.zip')

def decode(data):
    if data[44:48] == b'PVR!':
        header, height, width, mips, flags, length, bpp = struct.unpack_from('<7I', data)
        assert (flags & 255) == 0x36, hex(flags)
        assert header == 52 and length >= width * height // 2
        pixels = texture2ddecoder.decode_etc1(data[header:header + width * height // 2], width, height)
        return Image.frombytes('RGBA', (width, height), pixels, 'raw', 'BGRA')
    return Image.open(io.BytesIO(data)).convert('RGBA')

def main(source=ARCHIVE):
    archive = open_asset_archive(source)
    original = ROOT / 'original'
    atlases = ROOT / 'atlases'
    original.mkdir(parents=True, exist_ok=True)
    atlases.mkdir(parents=True, exist_ok=True)
    metadata = []
    for entry in archive.infolist():
        name = Path(entry.filename).name
        if not entry.filename.startswith(PREFIX + 'data2/'):
            continue
        if name.endswith('.png'):
            data = archive.read(entry)
            img = decode(data)
            alpha_name = entry.filename[:-4] + '_alpha.pak'
            if alpha_name in archive.namelist():
                alpha_pak = archive.read(alpha_name)
                offset, size = struct.unpack_from('<2I', alpha_pak, 16)
                payload = alpha_pak[offset:offset + size]
                expected, = struct.unpack_from('<I', payload)
                alpha_bytes = zlib.decompress(payload[4:])
                assert len(alpha_bytes) == expected
                alpha = decode(alpha_bytes)
                assert alpha.size == img.size
                img.putalpha(alpha.getchannel('R'))
            img.save(atlases / name)
            metadata.append({'source': entry.filename, 'file': 'atlases/' + name, 'width': img.width, 'height': img.height, 'encoding': 'PVR v2 ETC1' if data[44:48] == b'PVR!' else 'PNG', 'separate_alpha': alpha_name in archive.namelist()})
        if name in ['ShipCityTech_1.png', 'ShipCityTech_3.png', 'ShipCityTech_1_alpha.pak', 'ShipCityTech_3_alpha.pak', 'ResearchLad.tfs', 'Fleets.tfs', 'TechTree.tfs', 'FleetsTechnology.tfs'] or entry.filename.endswith(('/building.cn', '/building.idx', '/menu.cn', '/menu.idx')):
            (original / name).write_bytes(archive.read(entry))
    (ROOT / 'textures.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding='utf-8')
    archive.close()
    print('Decoded textures:', len(metadata))
    for row in metadata:
        if any(w in row['file'].lower() for w in ['ship', 'tech', 'dispatch']):
            print(row)

if __name__ == '__main__':
    import argparse
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('source', nargs='?', type=Path, default=ARCHIVE)
    main(cli.parse_args().source)
