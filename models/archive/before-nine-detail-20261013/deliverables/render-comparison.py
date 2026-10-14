import bpy, math, json, numpy as np
from pathlib import Path
from mathutils import Matrix, Vector

folder = Path(__file__).parent
refs = folder.parents[1] / 'recovered/remaining-tripo-20261013'
sources = {r['id']: r for r in json.loads((refs / 'manifest.json').read_text(encoding='utf-8'))}
for row in json.loads((folder / 'manifest.json').read_text(encoding='utf-8')):
    name = row['id']
    for version in (['reference', 'rebuilt'] if name in sources else ['rebuilt']):
        bpy.ops.wm.read_factory_settings(use_empty=True)
        source = sources.get(name)
        path = refs / source['file'] if version == 'reference' else folder / row['file']
        bpy.ops.import_scene.gltf(filepath=str(path))
        roots = [o for o in bpy.context.scene.objects if o.parent is None]
        angle = math.radians(source['rotationZ']) if version == 'reference' else math.pi
        for o in roots: o.matrix_world = Matrix.Rotation(angle, 4, 'Z') @ o.matrix_world
        bpy.context.view_layer.update()
        arrays = []
        for o in bpy.context.scene.objects:
            if o.type != 'MESH': continue
            a = np.empty(len(o.data.vertices) * 3)
            o.data.vertices.foreach_get('co', a)
            mat = np.array(o.matrix_world)
            arrays.append(a.reshape(-1, 3) @ mat[:3, :3].T + mat[:3, 3])
        p = np.concatenate(arrays)
        lo, hi = p.min(axis=0), p.max(axis=0)
        assert np.isfinite(p).all()
        scale = 14 / (hi[1] - lo[1]) if version == 'reference' else (2.5 if name == 'Titanenergetic_Frigate' else 1)
        transform = Matrix.Scale(scale, 4) @ Matrix.Translation(Vector(-(lo + hi) / 2)) if version == 'reference' else Matrix.Scale(scale, 4)
        for o in roots: o.matrix_world = transform @ o.matrix_world
        bpy.context.view_layer.update()
        bpy.ops.object.camera_add()
        camera = bpy.context.object
        camera.data.type = 'ORTHO'
        camera.data.ortho_scale = 17
        scene = bpy.context.scene
        scene.camera = camera
        scene.render.engine = 'BLENDER_WORKBENCH'
        scene.display.shading.light = 'STUDIO'
        scene.display.shading.color_type = 'SINGLE'
        scene.display.shading.single_color = (.6, .65, .7)
        scene.display.shading.show_cavity = True
        scene.display.shading.cavity_type = 'BOTH'
        scene.display.shading.background_type = 'WORLD'
        scene.world = bpy.data.worlds.new('Review backdrop')
        scene.world.color = (.018, .024, .032)
        scene.render.resolution_x = 850
        scene.render.resolution_y = 850
        scene.render.resolution_percentage = 100
        scene.render.image_settings.file_format = 'PNG'
        scene.render.film_transparent = True
        for view, direction in [('front', (0, -1, 0)), ('side', (1, 0, 0)), ('top', (0, 0, 1))]:
            camera.location = Vector(direction) * 35
            camera.rotation_euler = (-camera.location).to_track_quat('-Z', 'Y').to_euler()
            scene.render.filepath = str(folder / f'{name}-{version}-{view}.png')
            bpy.ops.render.render(write_still=True)
        if version == 'rebuilt':
            scene.display.shading.color_type = 'MATERIAL'
            for material in bpy.data.materials:
                if material.node_tree:
                    for node in material.node_tree.nodes:
                        if node.type == 'BSDF_PRINCIPLED': material.diffuse_color = node.inputs['Base Color'].default_value
            camera.location = Vector((22, -30, 24))
            camera.rotation_euler = (-camera.location).to_track_quat('-Z', 'Y').to_euler()
            camera.data.ortho_scale = 19
            scene.render.resolution_x = 1200
            scene.render.resolution_y = 900
            scene.render.filepath = str(folder / f'{name}.png')
            bpy.ops.render.render(write_still=True)
