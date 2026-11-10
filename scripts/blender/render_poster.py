#!/usr/bin/env python3
"""SAMA Energia — energiavarastosivun kaappikuva (assets/3d/kaappi-poster.webp) samasta mallista kuin 3D/AR-näkymä.

Cycles, läpinäkyvä tausta (sivun tumma kehys näkyy läpi), Khronos PBR Neutral -sävytys kuten model-viewerissä
(tone-mapping="neutral"), joten kuva ja pyöritettävä malli ovat samanvärisiä. Kulma kuten valmistajan tuotekuvassa.

Ajo: /tmp/bpy/bin/python scripts/blender/render_poster.py assets/3d/kaappi.glb assets/3d/kaappi-poster.webp [--samples 96]
"""
import argparse
import math
import os
import tempfile

import bpy
from mathutils import Vector

ap = argparse.ArgumentParser()
ap.add_argument('glb'); ap.add_argument('out')
ap.add_argument('--samples', type=int, default=96)
ap.add_argument('--w', type=int, default=800); ap.add_argument('--h', type=int, default=1000)
ap.add_argument('--max-bytes', type=int, default=70000)
a = ap.parse_args()

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=a.glb)
for m in bpy.data.materials:                       # tilavalo näkyväksi kuten sivuston kuvissa
    if m.node_tree and m.name.startswith('led'):
        for n in m.node_tree.nodes:
            if n.type == 'BSDF_PRINCIPLED':
                n.inputs['Emission Strength'].default_value = 6.0


def look_at(obj, target):
    d = Vector(target) - obj.location
    obj.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


# kamera: edestä vasemmalta, hieman silmien korkeuden yläpuolelta (kaappi 1,35 × 1,01 × 2,45 m; etu = Blender -Y)
cam = bpy.data.cameras.new('cam'); cam.lens = 70; cam.sensor_width = 36
co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
az, el, dist = math.radians(-34), math.radians(11), 7.4
tgt = (0.0, 0.0, 1.2)
co.location = (tgt[0] + dist * math.sin(az) * math.cos(el), tgt[1] - dist * math.cos(az) * math.cos(el), tgt[2] + dist * math.sin(el))
look_at(co, tgt)


def area(name, loc, size, energy, color, target=(0, 0, 1.2)):
    ld = bpy.data.lights.new(name, 'AREA'); ld.shape = 'RECTANGLE'; ld.size = size[0]; ld.size_y = size[1]
    ld.energy = energy; ld.color = color
    o = bpy.data.objects.new(name, ld); sc.collection.objects.link(o); o.location = loc; look_at(o, target)


area('key', (3.6, -3.2, 3.6), (2.2, 1.8), 520, (1.0, 0.97, 0.93))        # pääve edestä oikealta: etupinta valoisin
area('fill', (-4.2, -2.4, 1.7), (2.4, 2.4), 70, (0.86, 0.9, 1.0))         # vasen sivu tummempi → muoto näkyy
area('rim', (-1.1, 3.8, 3.3), (0.8, 2.4), 420, (1.0, 0.8, 0.48))           # kultainen reunavalo takaa: ääriviiva, ei sivupintaa
area('rim2', (2.2, 3.4, 2.4), (0.8, 2.0), 220, (1.0, 0.86, 0.62))
area('top', (0.4, -0.6, 5.6), (2.0, 2.0), 160, (1.0, 0.98, 0.95), target=(0, 0, 2.45))
w = bpy.data.worlds.new('w'); sc.world = w
bgn = w.node_tree.nodes.get('Background') if w.node_tree else None
if bgn is None:
    w.use_nodes = True; bgn = w.node_tree.nodes['Background']
bgn.inputs['Color'].default_value = (0.03, 0.028, 0.025, 1); bgn.inputs['Strength'].default_value = 1.0

sc.render.engine = 'CYCLES'; cy = sc.cycles
cy.device = 'CPU'; cy.samples = a.samples; cy.use_adaptive_sampling = True; cy.use_denoising = True
cy.max_bounces = 6
sc.render.film_transparent = True
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = a.w, a.h, 100
try:
    sc.view_settings.view_transform = 'Khronos PBR Neutral'
except TypeError:
    sc.view_settings.view_transform = 'AgX'
ims = sc.render.image_settings
if hasattr(ims, 'media_type'):
    ims.media_type = 'IMAGE'
ims.file_format = 'PNG'; ims.color_mode = 'RGBA'; ims.color_depth = '16'
tmp = os.path.join(tempfile.mkdtemp(), 'poster.png')
sc.render.filepath = tmp
bpy.ops.render.render(write_still=True)

from PIL import Image
im = Image.open(tmp).convert('RGBA')
for q in range(90, 49, -2):
    im.save(a.out, 'WEBP', quality=q, method=6, alpha_quality=90)
    if os.path.getsize(a.out) <= a.max_bytes:
        break
print(f'{a.out}: {os.path.getsize(a.out)} t, q{q}')
