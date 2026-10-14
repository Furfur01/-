import bpy, math, numpy as np
from pathlib import Path
from mathutils import Matrix, Vector

folder = Path(__file__).parent
refs = folder.parents[1] / 'recovered/tripo-originals-20261013'
for name in ['Destroyer', 'Iron_Behemoth']:
    for version in ['reference', 'rebuilt']:
        bpy.ops.wm.read_factory_settings(use_empty=True)
        bpy.ops.import_scene.gltf(filepath=str((refs if version == 'reference' else folder) / (name + '.glb')))
        roots = [o for o in bpy.context.scene.objects if o.parent is None]
        angle = (-math.pi / 2 if name == 'Destroyer' else 0) if version == 'reference' else math.pi
        rotation = Matrix.Rotation(angle, 4, 'Z')
        for o in roots: o.matrix_world = rotation @ o.matrix_world
        bpy.context.view_layer.update()
        if version == 'reference':
            arrays = []
            for o in bpy.context.scene.objects:
                if o.type != 'MESH': continue
                a = np.empty(len(o.data.vertices) * 3)
                o.data.vertices.foreach_get('co', a)
                mat = np.array(o.matrix_world)
                arrays.append(a.reshape(-1, 3) @ mat[:3, :3].T + mat[:3, 3])
            p = np.concatenate(arrays)
            lo, hi = p.min(axis=0), p.max(axis=0)
            transform = Matrix.Scale(14 / (hi[1] - lo[1]), 4) @ Matrix.Translation(Vector(-(lo + hi) / 2))
        else:
            transform = Matrix.Scale(1 / (2.8 if name == 'Iron_Behemoth' else 1), 4)
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
        scene.display.shading.background_type = 'WORLD'
        scene.world = bpy.data.worlds.new('Comparison backdrop')
        scene.world.color = (.018, .024, .032)
        scene.render.resolution_x = 850
        scene.render.resolution_y = 850
        scene.render.resolution_percentage = 100
        scene.render.image_settings.file_format = 'PNG'
        scene.render.film_transparent = True
        for view, direction in [('front', (0, -1, 0)), ('side', (1, 0, 0)), ('top', (0, 0, 1))]:
            camera.location = Vector(direction) * 35
            camera.rotation_euler = (-camera.location).to_track_quat('-Z', 'Y').to_euler()
            scene.render.filepath = str(folder / (name + '-' + version + '-' + view + '.png'))
            bpy.ops.render.render(write_still=True)
