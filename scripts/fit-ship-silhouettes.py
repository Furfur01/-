"""Derive non-destructive camera-plane cage fits from APK alpha contours.

Fits only the supplied reference projection. Hidden surfaces remain an
interpretation; no claim of 90% similarity across arbitrary 3D viewpoints.
"""
import json, math
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter1d

ROOT=Path(__file__).resolve().parents[1]
src=json.loads((ROOT/'output/playwright/ship-archive/projected-source.json').read_text())
fits={}
def profile(mask, points):
    center=points.mean(axis=0)
    cov=np.cov((points-center).T)
    _,vectors=np.linalg.eigh(cov)
    axis=vectors[:,-1]
    if axis[0]<0:axis=-axis
    angle=math.atan2(axis[1],axis[0])
    perp=np.array([-axis[1],axis[0]])
    along=points@axis; across=points@perp
    lo,hi=along.min(),along.max();span=hi-lo
    bins=np.minimum(255,np.floor((along-lo)/span*256).astype(int))
    lower=np.full(256,np.nan);upper=lower.copy()
    for i in range(256):
        p=across[bins==i]
        if len(p):lower[i]=p.min();upper[i]=p.max()
    for a in [lower,upper]:
        valid=np.isfinite(a);a[:]=np.interp(np.arange(256),np.where(valid)[0],a[valid])
    return dict(angle=angle,minimum=lo,maximum=hi,lower=gaussian_filter1d(lower,.65),upper=gaussian_filter1d(upper,.65),span=span)

for item in src:
    tris=np.asarray(item['triangles']);lo=tris.reshape(-1,2).min(axis=0);hi=tris.reshape(-1,2).max(axis=0);scale=700/max(hi-lo)
    canvas=Image.new('L',(int((hi[0]-lo[0])*scale)+4,int((hi[1]-lo[1])*scale)+4));draw=ImageDraw.Draw(canvas)
    for tri in tris:draw.polygon([tuple((p-lo)*scale+2) for p in tri],fill=255)
    yy,xx=np.where(np.asarray(canvas)>0);points=np.column_stack(((xx-2)/scale+lo[0],(yy-2)/scale+lo[1]));a=profile(canvas,points)
    image=Image.open(ROOT/'models/reference/original-atlas-v1'/item['reference']).convert('RGBA')
    alpha=np.asarray(image)[:,:,3]>48;yy,xx=np.where(alpha);points=np.column_stack((xx-image.width/2,image.height/2-yy));b=profile(alpha,points)
    fits[item['id']]={'sourceAngle':a['angle'],'sourceMin':a['minimum'],'sourceMax':a['maximum'],'sourceLower':a['lower'].tolist(),'sourceUpper':a['upper'].tolist(),'targetAngle':b['angle'],'targetLower':(b['lower']/b['span']).tolist(),'targetUpper':(b['upper']/b['span']).tolist(),'source':'APK alpha silhouette; reference projection only','verified':False}
(ROOT/'opendesign/mockups/galactic-command/ship-shape-fits.json').write_text(json.dumps(fits,separators=(',',':')),encoding='utf-8')
assert len(fits)==19
print('19 camera-plane cage fits written; measured verification still required.')
