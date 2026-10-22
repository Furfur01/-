"""Detail-preserving shipyard LODs from the retained Tripo original.

Run with Blender --background --factory-startup --disable-autoexec --python.
The original GLB is read only. All scene changes occur in this process.
"""
import bpy
import json
import math
import shutil
import struct
import numpy as np
from pathlib import Path
from mathutils import Vector, Matrix

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SOURCE = ROOT / 'models/recovered/tripo-originals-20261013/Iron_Behemoth.glb'
RUNTIME = ROOT / 'opendesign/mockups/galactic-command/assets/megastructures'
LENGTH = 14.0


def bounds(objects):
    pts = [o.matrix_world @ Vector(v) for o in objects for v in o.bound_box]
    lo = Vector([min(p[i] for p in pts) for i in range(3)])
    hi = Vector([max(p[i] for p in pts) for i in range(3)])
    return lo, hi


def material(name, color, metallic=0, roughness=.4, emission=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = metallic
    p.inputs['Roughness'].default_value = roughness
    p.inputs['Emission Color'].default_value = (*color, 1)
    p.inputs['Emission Strength'].default_value = emission
    return m


def strip(name, a, b, width, depth, mat):
    a, b = Vector(a), Vector(b)
    direction = b-a
    bpy.ops.mesh.primitive_cube_add(size=1, location=(a+b)/2)
    obj = bpy.context.object
    obj.name = name
    # Beam runs along its local Z, broad dimension along the front face.
    normal=Vector((0,-1,-.41048)).normalized()
    tangent=direction.normalized()
    side=normal.cross(tangent).normalized()
    normal=tangent.cross(side).normalized()
    obj.rotation_euler=Matrix((side,normal,tangent)).transposed().to_euler()
    obj.dimensions = (width, depth, direction.length)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    bevel = obj.modifiers.new('Machined emitter edges', 'BEVEL')
    bevel.width = min(width,depth)*.18
    bevel.segments = 2
    bpy.ops.object.modifier_apply(modifier=bevel.name)
    return obj


def triangle_emitters():
    # Ship's broad prow is Blender -Y (glTF +Z). The aperture sits above
    # the two lower prongs. These are separate geometry, not painted glow.
    casing = material('Devourer_Triangle_Frame', (.025,.045,.055), .8, .32)
    glow = material('Devourer_Triangle_Emission', (.015,.78,1), .25, .22, 5)
    tip = (0,-6.91,2.77)
    left = (-1.85,-5.97,.48)
    right = (1.85,-5.97,.48)
    nodes=[tip,left,right]
    objects=[]
    for i in range(3):
        a,b=nodes[i],nodes[(i+1)%3]
        objects.append(strip(f'Prow_Triangle_Frame_{i+1}',a,b,.28,.22,casing))
        outward=Vector((0,-1,-.41048)).normalized()*.16
        a=Vector(a)+outward;b=Vector(b)+outward
        side=[]
        for part in range(3):
            va,vb=Vector(a),Vector(b)
            start=va+(vb-va)*(part/3+.012)
            end=va+(vb-va)*((part+1)/3-.012)
            side.append(strip(f'Prow_Triangle_Emission_{i+1}_{part}',start,end,.11,.10,glow))
        bpy.ops.object.select_all(action='DESELECT')
        for o in side:o.select_set(True)
        bpy.context.view_layer.objects.active=side[0]
        bpy.ops.object.join()
        side[0].name=f'Prow_Triangle_Emission_{i+1}'
        objects.append(side[0])
    # The central inset is a real armored triangular cover, not an empty neon hoop.
    center=sum((Vector(v) for v in nodes),Vector())/3
    inner=[center+(Vector(v)-center)*.69+Vector((0,.07,0)) for v in nodes]
    back=[v+Vector((0,.18,0)) for v in inner]
    mesh=bpy.data.meshes.new('Prow triangular armor geometry')
    mesh.from_pydata([tuple(v) for v in inner+back],[],[(0,2,1),(3,4,5),(0,1,4,3),(1,2,5,4),(2,0,3,5)])
    panel=bpy.data.objects.new('Prow_Triangle_Armored_Inset',mesh)
    bpy.context.collection.objects.link(panel)
    panel.data.materials.append(material('Devourer_Prow_Armor',(.06,.09,.12),.75,.57))
    bevel=panel.modifiers.new('Armor chamfer','BEVEL');bevel.width=.065;bevel.segments=2
    bpy.context.view_layer.objects.active=panel
    bpy.ops.object.modifier_apply(modifier=bevel.name)
    objects.append(panel)
    return objects


def setup_render(objects, name):
    scene=bpy.context.scene
    scene.render.engine='CYCLES'
    scene.cycles.samples=24
    scene.cycles.use_denoising=True
    scene.render.resolution_x=1200
    scene.render.resolution_y=850
    scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG'
    scene.world=bpy.data.worlds.new('Shipyard inspection world')
    scene.world.use_nodes=True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.035,.05,.08,1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value=.5
    scene.view_settings.view_transform='AgX'
    lo,hi=bounds(objects);center=(lo+hi)/2
    for label,loc,energy,size,color in [
        ('Key',(-8,-9,14),2300,10,(.75,.86,1)),
        ('Fill',(10,-1,8),1800,8,(.5,.7,1)),
        ('Rim',(-3,9,8),2600,8,(.7,.85,1)),
    ]:
        bpy.ops.object.light_add(type='AREA', location=loc)
        light=bpy.context.object;light.name=label;light.data.energy=energy
        light.data.shape='DISK';light.data.size=size;light.data.color=color
        light.rotation_euler=(center-light.location).to_track_quat('-Z','Y').to_euler()
    bpy.ops.object.camera_add()
    camera=bpy.context.object;camera.data.type='ORTHO';camera.data.ortho_scale=17
    scene.camera=camera
    for view,position in [('quarter',(13,-20,14)),('front',(0,-24,2)),('top',(0,-1,25))]:
        camera.location=Vector(position)
        aim=center if view!='front' else Vector((0,0,0))
        camera.rotation_euler=(aim-camera.location).to_track_quat('-Z','Y').to_euler()
        if view=='front':camera.data.ortho_scale=10
        else:camera.data.ortho_scale=17
        scene.render.filepath=str(HERE/f'{name}-{view}.png')
        bpy.ops.render.render(write_still=True)


def build(label, target, texture_size):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(SOURCE))
    hull=[o for o in bpy.context.scene.objects if o.type=='MESH']
    lo,hi=bounds(hull);center=(lo+hi)/2;scale=LENGTH/(hi.y-lo.y)
    for o in hull:
        o.matrix_world.translation-=center
        o.matrix_world.translation*=scale
        o.scale*=scale
    bpy.context.view_layer.update()
    total=sum(len(o.data.polygons) for o in hull)
    original_vertices=sum(len(o.data.vertices) for o in hull)
    for o in hull:
        bpy.context.view_layer.objects.active=o
        o.select_set(True)
        bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
        o.name='Devourer_Hull_'+label
        dec=o.modifiers.new('Adaptive hard-surface LOD', 'DECIMATE')
        dec.decimate_type='COLLAPSE'
        dec.ratio=min(1,target/total)
        dec.use_collapse_triangulate=True
        bpy.ops.object.modifier_apply(modifier=dec.name)
        o.select_set(False)
    # Retain the original color, metallic/roughness and normal maps with UVs.
    # 2K / 1K texture LODs avoid retaining original 4K maps in distant views.
    texture_info=[]
    for image in bpy.data.images:
        if image.type!='IMAGE' or not image.size[0]:continue
        old=list(image.size)
        if max(old)>texture_size:
            factor=texture_size/max(old)
            image.scale(round(old[0]*factor),round(old[1]*factor))
        if 'ORM' in image.name:
            pixels=np.empty(len(image.pixels),dtype=np.float32)
            image.pixels.foreach_get(pixels)
            pixels[1::4]=.45+.5*pixels[1::4]
            image.pixels.foreach_set(pixels)
            image.update()
        # Save resampled pixels rather than carrying an old packed image blob.
        texdir=HERE/'textures'/label;texdir.mkdir(parents=True,exist_ok=True)
        image.file_format='JPEG' if 'Normal' not in image.name else 'PNG'
        image.filepath_raw=str(texdir/(image.name+('.jpg' if image.file_format=='JPEG' else '.png')))
        image.save()
        if image.packed_file:image.unpack(method='REMOVE')
        image.reload()
        image.pack()
        texture_info.append({'name':image.name,'sourceSize':old,'size':list(image.size)})
    for mat in bpy.data.materials:
        if not mat.use_nodes:continue
        p=mat.node_tree.nodes.get('Principled BSDF')
        if not p:continue
        # The recovered roughness map is extremely glossy. Keep its panel variation
        # but give the armor the current game's satin, dark-metal finish.
        rough=p.inputs['Roughness']
        if not rough.links:rough.default_value=.6
        for node in mat.node_tree.nodes:
            if node.type=='NORMAL_MAP':node.inputs['Strength'].default_value=.4
    lights=triangle_emitters()
    objects=hull+lights
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    output=HERE/f'devourer-{label}.glb'
    bpy.ops.export_scene.gltf(filepath=str(output),export_format='GLB',use_selection=True,
        export_yup=True,export_apply=True,export_image_format='AUTO',export_materials='EXPORT',
        export_extras=True,export_image_quality=90)
    shutil.copy2(output,RUNTIME/output.name)
    vertices=sum(len(o.data.vertices) for o in objects)
    triangles=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in objects)
    lo,hi=bounds(objects)
    blob=output.read_bytes()
    gltf=json.loads(blob[20:20+struct.unpack_from('<I',blob,12)[0]])
    primitives=[p for m in gltf['meshes'] for p in m['primitives']]
    result={'file':output.name,'bytes':output.stat().st_size,'vertices':vertices,'triangles':triangles,
            'renderVertices':sum(gltf['accessors'][p['attributes']['POSITION']]['count'] for p in primitives),
            'drawCalls':len(primitives),
            'sourceVertices':original_vertices,'sourceTriangles':total,'textures':texture_info,
            'blenderBounds':[list(lo),list(hi)],'gltfAxes':{'up':'+Y','forward':'+Z','lengthAxis':'Z'},
            'length':LENGTH,'emissiveMeshes':[o.name for o in lights if 'Emission' in o.name]}
    (HERE/f'{label}-geometry.json').write_text(json.dumps(result,indent=2),encoding='utf8')
    setup_render(objects,label)
    return result


if __name__=='__main__':
    RUNTIME.mkdir(parents=True,exist_ok=True)
    results=[build('near',120000,2048),build('mid',24000,1024)]
    (HERE/'manifest.json').write_text(json.dumps({'source':str(SOURCE.relative_to(ROOT)),
        'method':'Adaptive collapse topology reduction preserving original UV, PBR and normal maps; independent emissive prow geometry.',
        'runtimeBase':'/assets/megastructures/','lods':results},ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps({'finished':True,'lods':results},ensure_ascii=False))
