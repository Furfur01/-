import bpy, json, hashlib
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree

folder=Path(__file__).parent
reports={}
for name in ['Light_Fighter','Cruiser']:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(folder/(name+'.glb')))
    parts=[]
    for obj in bpy.context.scene.objects:
        if obj.type!='MESH':continue
        # Weld only coincident positions; hard normals and material seams are not gaps.
        vertices=[];lookup={};indices=[]
        for v in obj.data.vertices:
            p=obj.matrix_world@v.co;key=tuple(round(x,5) for x in p)
            if key not in lookup:lookup[key]=len(vertices);vertices.append(p)
            indices.append(lookup[key])
        parent=list(range(len(vertices)))
        def root(i):
            while parent[i]!=i:parent[i]=parent[parent[i]];i=parent[i]
            return i
        faces=[]
        for poly in obj.data.polygons:
            f=[indices[i] for i in poly.vertices];faces.append(f)
            for j in f[1:]:parent[root(j)]=root(f[0])
        buckets={}
        for f in faces:buckets.setdefault(root(f[0]),[]).append(f)
        for fs in buckets.values():
            used=sorted(set(i for f in fs for i in f));remap={j:i for i,j in enumerate(used)}
            vs=[vertices[j] for j in used];tris=[[remap[j] for j in f] for f in fs]
            lo=Vector(tuple(min(p[a] for p in vs) for a in range(3)));hi=Vector(tuple(max(p[a] for p in vs) for a in range(3)))
            parts.append(dict(name=obj.name,vs=vs,bvh=BVHTree.FromPolygons(vs,tris,all_triangles=True,epsilon=1e-5),lo=lo,hi=hi))
    parents=list(range(len(parts)))
    def root(i):
        while parents[i]!=i:parents[i]=parents[parents[i]];i=parents[i]
        return i
    def inside(point,bvh):
        direction=Vector((1,.137,.071)).normalized();p=point.copy();hits=0
        for _ in range(100):
            pos,_,_,_=bvh.ray_cast(p,direction,100)
            if pos is None:return hits%2==1
            hits+=1;p=pos+direction*.0001
        raise RuntimeError('Unbounded ray')
    for i,a in enumerate(parts):
        for j in range(i):
            b=parts[j]
            if root(i)==root(j):continue
            if any(a['hi'][k]<b['lo'][k]-1e-5 or b['hi'][k]<a['lo'][k]-1e-5 for k in range(3)):continue
            if a['bvh'].overlap(b['bvh']) or inside(a['vs'][0],b['bvh']) or inside(b['vs'][0],a['bvh']):parents[root(i)]=root(j)
    groups={}
    for i,p in enumerate(parts):groups.setdefault(root(i),[]).append(p)
    clusters=sorted(groups.values(),key=lambda g:sum(len(p['vs']) for p in g),reverse=True)
    def summary(g):
        lo=[min(p['lo'][k] for p in g) for k in range(3)];hi=[max(p['hi'][k] for p in g) for k in range(3)]
        # glTF import is Blender Z-up, front -Y; report back in Three X,Y,Z coordinates.
        return dict(parts=len(g),labels=sorted(set(p['name'] for p in g)),center=[round((lo[0]+hi[0])/2,3),round((lo[2]+hi[2])/2,3),round(-(lo[1]+hi[1])/2,3)],size=[round(hi[0]-lo[0],3),round(hi[2]-lo[2],3),round(hi[1]-lo[1],3)])
    reports[name]=dict(sha256=hashlib.sha256((folder/(name+'.glb')).read_bytes()).hexdigest(),primitiveComponents=len(parts),connectedClusters=len(clusters),detached=[summary(g) for g in clusters[1:]])
    print(name,len(parts),'components,',len(clusters),'clusters')
(folder/'connections.json').write_text(json.dumps(reports,indent=2),encoding='utf-8')
assert all(r['connectedClusters']==1 for r in reports.values()), 'Detached geometry: inspect connections.json'
