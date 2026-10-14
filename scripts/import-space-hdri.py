"""Build browser textures from the selected original Radiance HDR (no preview upscaling)."""
from pathlib import Path
import hashlib, json, math
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parent.parent
source = root / 'models/reference/space-spheremaps/HDR_multi_nebulae_2.hdr'
out = root / 'opendesign/shared/assets'
out.mkdir(parents=True, exist_ok=True)
with source.open('rb') as f:
    assert f.readline().startswith(b'#?')
    while f.readline().strip():
        pass
    orientation, height, horizontal, width = f.readline().decode().split()
    assert (orientation, horizontal) == ('-Y', '+X')
    width, height = int(width), int(height)
    w, h = 4096, 2048
    xx = np.linspace(0, width - 1, w)
    yy = np.linspace(0, height - 1, h)
    lower = np.floor(yy).astype(int)
    upper = np.minimum(lower + 1, height - 1)
    wanted = set(lower) | set(upper)
    rows = {}
    for y in range(height):
        header = f.read(4)
        assert header[:2] == b'\x02\x02' and int.from_bytes(header[2:], 'big') == width
        scan = np.empty((4, width), dtype=np.uint8)
        for channel in range(4):
            x = 0
            while x < width:
                count = f.read(1)[0]
                assert count
                if count > 128:
                    count -= 128
                    scan[channel, x:x+count] = f.read(1)[0]
                else:
                    scan[channel, x:x+count] = np.frombuffer(f.read(count), dtype=np.uint8)
                x += count
            assert x == width
        if y in wanted:
            scale = np.exp2(scan[3].astype(np.float32) - 136)
            rows[y] = np.stack([np.interp(xx, np.arange(width), scan[c]*scale) for c in range(3)], axis=-1).astype(np.float32)
    linear = np.stack([rows[a]*(1-t)+rows[b]*t for a,b,t in zip(lower,upper,yy-lower)])

# RGBM retains bright HDR stars while keeping GPU storage and loading compact.
# Exposure is baked into RGBM once; scene-specific brightness remains in the renderer.
exposure = 12.0
linear *= exposure
print('HDR percentiles:', np.percentile(linear, [50,90,99,99.9,100]).tolist(), flush=True)
rgb_range = 16.0
multiplier = np.clip(np.ceil(np.max(linear,axis=-1)/rgb_range*255)/255, 1/255, 1)
rgb = np.clip(linear/(multiplier[...,None]*rgb_range),0,1)
packed = np.concatenate((rgb, multiplier[...,None]),axis=-1)
Image.fromarray(np.round(packed*255).astype(np.uint8)).save(out/'multi-nebulae-2-rgbm.png',optimize=True)
# Non-WebGL/CSS fallback and Three.js model viewer use the same HDR-derived panorama.
def tonemap(x):
    return np.clip((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0,1)**(1/2.2)
Image.fromarray(np.round(tonemap(linear)*255).astype(np.uint8)).save(out/'multi-nebulae-2.webp',quality=94)
metadata = dict(name='HDR Multi Nebulae 2',author='TonyS / Space Spheremaps',source='https://www.spacespheremaps.com/multi-nebulae-spheremaps/',license='https://www.spacespheremaps.com/about/#licensing',original=[width,height],runtime=[w,h],encoding='RGBM16',exposure=exposure,sha256=hashlib.sha256(source.read_bytes()).hexdigest())
(out/'multi-nebulae-2.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(metadata,ensure_ascii=False))
