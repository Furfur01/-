"""Read the selected image into a deterministic 3D star catalogue; never edit it.

Requires Pillow, numpy and scipy. Rebuild only when the chosen image changes.
The historical server coordinates remain untouched; this is a display catalogue.
"""
import hashlib
import json
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, maximum_filter
from scipy.optimize import linear_sum_assignment

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'opendesign/mockups/planet-construction-review'
SOURCE = DEST / 'assets/galaxy-barred-b.png'
SPAN = 64000
rng = np.random.default_rng(20261016)
pixels = np.asarray(Image.open(SOURCE).convert('RGB'), dtype=np.float64).mean(axis=2) / 255
height, width = pixels.shape
background = gaussian_filter(pixels, 3)
contrast = pixels - background
peaks = (pixels == maximum_filter(pixels, size=5)) & (contrast > .065) & (pixels > .18)
py, px = np.nonzero(peaks)
# Suppress duplicate maxima within a single resolved star, preserving brighter ones.
order = np.argsort(-pixels[py, px], kind='stable')
accepted = []
occupied = set()
for k in order:
    x, y = int(px[k]), int(py[k])
    if any((x + dx, y + dy) in occupied for dx in range(-3, 4) for dy in range(-3, 4)):
        continue
    occupied.add((x, y))
    accepted.append((x, y))
xy = np.asarray(accepted)
strength = pixels[xy[:, 1], xy[:, 0]]
sizes = .9 + 3.7 * strength ** 1.8
positions = np.column_stack(((xy[:, 0] + .5) / width - .5,
                            np.zeros(len(xy)), (xy[:, 1] + .5) / height - .5)) * SPAN
# A thin disc, with identical xyz for decorative stars and real system anchors.
positions[:, 1] = rng.normal(0, 260, len(xy))
bright = np.flatnonzero((strength > .4) & (background[xy[:, 1], xy[:, 0]] > .035)
                        & (np.linalg.norm(positions[:, [0, 2]], axis=1) > 1700))
# Widely separated real systems avoid overlapping planetary neighbourhoods.
candidates = []
for k in bright:
    if not candidates or np.min(np.linalg.norm(positions[candidates][:, [0, 2]] - positions[k, [0, 2]], axis=1)) > 650:
        candidates.append(k)
if len(candidates) < 499:
    raise RuntimeError(f'Only {len(candidates)} separated bright stars; need 499')
historical = json.loads(subprocess.check_output(
    ['node', '--input-type=module', '-e', "import {systemCoordinates} from './game/star-positions.mjs'; console.log(JSON.stringify(systemCoordinates()))"],
    cwd=ROOT, text=True))
old = np.asarray([s['position'] for s in historical])[:, [0, 2]] * 1.8
candidate_positions = positions[candidates][:, [0, 2]]
cost = np.sum((old[:, None, :] - candidate_positions[None, :, :]) ** 2, axis=2)
rows, columns = linear_sum_assignment(cost)
assigned = {int(row): candidates[int(col)] for row, col in zip(rows, columns)}
systems = []
for i in range(499):
    k = assigned[i]
    systems.append({'id': i + 1, 'position': positions[k].round(5).tolist(),
                    'pixel': xy[k].tolist(), 'size': round(float(sizes[k]), 4),
                    'brightness': round(float(.55 + strength[k] * .45), 4)})
# Reconstruct the faint stellar clouds by sampling image luminance, not a spiral formula.
count = 70000
weights = np.maximum(0, background - .008) ** 1.15
weights[:35] = weights[-35:] = 0
weights[:, :35] = weights[:, -35:] = 0
samples = rng.choice(width * height, count, p=(weights / weights.sum()).ravel())
sy, sx = np.divmod(samples, width)
cloud = np.column_stack((((sx + rng.random(count)) / width - .5) * SPAN,
                         rng.normal(0, 190, count),
                         ((sy + rng.random(count)) / height - .5) * SPAN,
                         rng.uniform(.65, 1.5, count),
                         rng.uniform(.11, .38, count)))
resolved = np.column_stack((positions, sizes, .55 + strength * .45))
# The 499 catalogue stars render separately, so their near models never have a duplicate dot.
mask = np.ones(len(resolved), dtype=bool)
mask[list(assigned.values())] = False
points = np.concatenate((cloud, resolved[mask])).astype('<f4')
binary = DEST / 'assets/galaxy-barred-b.points.bin'
binary.write_bytes(points.tobytes())
layout = {'version': 'barred-b-1', 'source': 'assets/galaxy-barred-b.png',
          'sourceSha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
          'span': SPAN, 'width': width, 'height': height,
          'points': 'assets/galaxy-barred-b.points.bin', 'stride': 5,
          'pointCount': len(points), 'resolvedCount': len(resolved), 'systems': systems}
(DEST / 'galaxy-layout.json').write_text(json.dumps(layout, separators=(',', ':')), encoding='utf-8')
print(json.dumps({'points': len(points), 'resolved': len(resolved), 'candidates': len(candidates),
                  'systems': len(systems), 'sizeRange': [float(sizes.min()), float(sizes.max())]}))
