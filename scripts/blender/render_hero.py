#!/usr/bin/env python3
"""SAMA Energia — etusivun herotausta polunseurannalla (Blender Cycles).

Sama näyttämö kuin three.js-renderissä (scripts/stills/hero3d.js ?look=tausta): rajaus, kaapit, kaapelit, muuntamo ja valot
tulevat vientitiedostoista (scripts/blender/export-scene.mjs). Cycles laskee valon fysikaalisesti (pehmeät varjot,
kaapeleiden ja avoimen oven heijastuva valo, todellinen peittoalueiden tummuminen); sävykäyrä on sama ACES-filmikäyrä,
valotus ja hehku kuin three.js-renderissä, joten hyväksytty sävymaailma säilyy. Maan häivytys taustaväriin tehdään
AOV-maskilla vasta sävytyksen jälkeen, joten kuvan reuna on täsmälleen sama väri kuin ennen.

Ajo (Blender moduulina, ei repoon):
  uv venv -p 3.11 /tmp/bpy && uv pip install --python /tmp/bpy/bin/python bpy OpenEXR pillow
  /tmp/bpy/bin/python scripts/blender/render_hero.py --scene <vienti>/bg.glb --meta <vienti>/bg.json --out <kansio> [--samples 160] [--scale 1]
  --post-only: käyttää aiemmin renderöityä <out>/<shot>.exr:ää (sävytys, hehku ja häivytys uudelleen).
Tuotos: <out>/<shot>.png (sRGB 8 bit, täysi koko). WebP-koot: scripts/blender/encode_hero.py.
"""
import argparse
import json
import math
import os
import sys
import time

import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('--scene', required=True)
ap.add_argument('--meta', required=True)
ap.add_argument('--out', required=True)
ap.add_argument('--samples', type=int, default=160)
ap.add_argument('--scale', type=float, default=1.0)
ap.add_argument('--post-only', action='store_true')
ap.add_argument('--world', type=float, default=1.0, help='ympäristövalon kerroin (RoomEnvironment + hemisfääri)')
ap.add_argument('--sun', type=float, default=1.0)
ap.add_argument('--points', type=float, default=1.0)
ap.add_argument('--emit', type=float, default=1.0, help='kaapeleiden ja ikkunoiden emission kerroin')
ap.add_argument('--exposure', type=float, default=None)
ap.add_argument('--soft', type=float, default=0.35, help='pistevalojen säde (m): pehmeät varjot ja heijastukset')
ap.add_argument('--bloom', type=float, default=1.0, help='hehkun leveyskerroin')
ap.add_argument('--border', default='', help='x0,y0,x1,y1 (0–1, vasen ylä = 0,0): vain osa kuvasta (tarkistus)')
args = ap.parse_args()

META = json.load(open(args.meta))
SHOT = META['shot']
W, H = int(round(META['W'] * args.scale)), int(round(META['H'] * args.scale))
os.makedirs(args.out, exist_ok=True)
EXR = os.path.join(args.out, f'{SHOT}.exr')


def srgb_to_lin(c):
    c = np.asarray(c, dtype=np.float64)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def lin_to_srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055)


def hexrgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)])


def t2b(v):
    """three.js (Y ylös) → Blender (Z ylös)."""
    return (v[0], -v[2], v[1])


# ============================== Cycles-renderi ==============================
if not args.post_only:
    import bpy
    from mathutils import Quaternion, Vector

    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    bpy.ops.import_scene.gltf(filepath=args.scene, import_shading='NORMALS')

    # ---------- kamera: sama ortografinen rajaus ----------
    cd = META['camera']
    cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'
    vw, vh = cd['right'] - cd['left'], cd['top'] - cd['bottom']
    cam.ortho_scale = max(vw, vh); cam.sensor_fit = 'AUTO'
    cam.shift_x = ((cd['right'] + cd['left']) / 2) / cam.ortho_scale
    cam.shift_y = ((cd['top'] + cd['bottom']) / 2) / cam.ortho_scale
    cam.clip_start, cam.clip_end = 1, 1200
    co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co)
    co.location = t2b(cd['position'])
    qx, qy, qz, qw = cd['quaternion']
    co.rotation_mode = 'QUATERNION'
    co.rotation_quaternion = Quaternion((1, 0, 0), math.radians(90)) @ Quaternion((qw, qx, qy, qz))
    sc.camera = co

    # ---------- valot ----------
    def aim(obj, direction):
        obj.rotation_mode = 'QUATERNION'
        obj.rotation_quaternion = Vector(direction).to_track_quat('-Z', 'Y')

    hemi = None
    for i, L in enumerate(META['lights']):
        col = tuple(L['color'])
        if L['type'] == 'HemisphereLight':
            hemi = L
            continue
        if L['type'] == 'DirectionalLight':
            ld = bpy.data.lights.new(f'sun{i}', 'SUN'); ld.color = col
            ld.energy = L['intensity'] * args.sun          # three: irradianssi = intensity → Blender W/m²
            ld.angle = math.radians(2.0)
            o = bpy.data.objects.new(f'sun{i}', ld); sc.collection.objects.link(o)
            p, t = np.array(t2b(L['position'])), np.array(t2b(L['target']))
            o.location = tuple(p); aim(o, tuple(t - p))
        elif L['type'] == 'PointLight':
            ld = bpy.data.lights.new(f'pt{i}', 'POINT'); ld.color = col
            ld.energy = 4 * math.pi * L['intensity'] * args.points   # three: kandela → Blender W (E = I / d²)
            ld.shadow_soft_size = args.soft
            o = bpy.data.objects.new(f'pt{i}', ld); sc.collection.objects.link(o)
            o.location = t2b(L['position'])
            o.visible_glossy = False                     # ei pyöreitä heijastuksia ikkunoihin (three.js: pistemäinen kiilto)

    # ---------- maailma: hämärä taivas ja maa (hemisfääri + ympäristö) ----------
    world = bpy.data.worlds.new('w'); sc.world = world
    world.use_nodes = True
    nt = world.node_tree; nt.nodes.clear()
    tc = nt.nodes.new('ShaderNodeTexCoord'); sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    nt.links.new(tc.outputs['Generated'], sep.inputs[0])
    mr = nt.nodes.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = -1; mr.inputs['From Max'].default_value = 1
    nt.links.new(sep.outputs['Z'], mr.inputs['Value'])
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'
    sky = np.array(hemi['color']) if hemi else srgb_to_lin(hexrgb('#4a505a'))
    gnd = np.array(hemi['groundColor']) if hemi else srgb_to_lin(hexrgb('#26211b'))
    hk = (hemi['intensity'] if hemi else 1.0) / math.pi
    # RoomEnvironment (three) ≈ neutraali harmaa ympäristö, keskimääräinen radianssi ~1.6 × environmentIntensity
    envk = 1.6 * META['envIntensity']
    mix.inputs['A'].default_value = tuple(list(gnd * hk + envk * 0.55) + [1])
    mix.inputs['B'].default_value = tuple(list(sky * hk + envk) + [1])
    nt.links.new(mr.outputs['Result'], mix.inputs['Factor'])
    bgL = nt.nodes.new('ShaderNodeBackground'); nt.links.new(mix.outputs['Result'], bgL.inputs['Color'])
    bgL.inputs['Strength'].default_value = args.world
    bgC = nt.nodes.new('ShaderNodeBackground')
    bgC.inputs['Color'].default_value = tuple(list(srgb_to_lin(hexrgb(META['bg']))) + [1])
    lp = nt.nodes.new('ShaderNodeLightPath'); ms = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(lp.outputs['Is Camera Ray'], ms.inputs['Fac'])
    nt.links.new(bgL.outputs['Background'], ms.inputs[1]); nt.links.new(bgC.outputs['Background'], ms.inputs[2])
    wo = nt.nodes.new('ShaderNodeOutputWorld'); nt.links.new(ms.outputs['Shader'], wo.inputs['Surface'])

    # ---------- materiaalit: emission kerroin, maan häivytyksen AOV ----------
    vl = sc.view_layers[0]
    aov = vl.aovs.add(); aov.name = 'fade'; aov.type = 'VALUE'
    sx, sz = META['site']
    for mat in bpy.data.materials:
        if not mat.use_nodes:
            continue
        nt = mat.node_tree
        for n in nt.nodes:
            if n.type == 'BSDF_PRINCIPLED' and args.emit != 1.0:
                n.inputs['Emission Strength'].default_value *= args.emit
        if mat.name in META['fades']:
            r0, r1 = META['fades'][mat.name]
            geo = nt.nodes.new('ShaderNodeNewGeometry'); s3 = nt.nodes.new('ShaderNodeSeparateXYZ')
            nt.links.new(geo.outputs['Position'], s3.inputs[0])
            dx = nt.nodes.new('ShaderNodeMath'); dx.operation = 'SUBTRACT'; dx.inputs[1].default_value = sx
            nt.links.new(s3.outputs['X'], dx.inputs[0])
            # three z = -Blender y → (z - sz) * 1.25 = (-y - sz) * 1.25
            dz = nt.nodes.new('ShaderNodeMath'); dz.operation = 'MULTIPLY_ADD'
            dz.inputs[1].default_value = -1.25; dz.inputs[2].default_value = -1.25 * sz
            nt.links.new(s3.outputs['Y'], dz.inputs[0])
            cx = nt.nodes.new('ShaderNodeCombineXYZ')
            nt.links.new(dx.outputs[0], cx.inputs['X']); nt.links.new(dz.outputs[0], cx.inputs['Y'])
            ln = nt.nodes.new('ShaderNodeVectorMath'); ln.operation = 'LENGTH'
            nt.links.new(cx.outputs[0], ln.inputs[0])
            mr2 = nt.nodes.new('ShaderNodeMapRange'); mr2.interpolation_type = 'SMOOTHSTEP'
            mr2.inputs['From Min'].default_value = r0; mr2.inputs['From Max'].default_value = r1
            nt.links.new(ln.outputs['Value'], mr2.inputs['Value'])
            ao = nt.nodes.new('ShaderNodeOutputAOV'); ao.aov_name = 'fade'
            nt.links.new(mr2.outputs['Result'], ao.inputs['Value'])

    # ---------- Cycles ----------
    sc.render.engine = 'CYCLES'
    cy = sc.cycles
    cy.device = 'CPU'
    cy.samples = args.samples; cy.use_adaptive_sampling = True; cy.adaptive_threshold = 0.012
    cy.use_denoising = True; cy.denoiser = 'OPENIMAGEDENOISE'
    cy.max_bounces = 6; cy.diffuse_bounces = 3; cy.glossy_bounces = 3; cy.transmission_bounces = 2; cy.transparent_max_bounces = 4
    cy.caustics_reflective = False; cy.caustics_refractive = False
    cy.sample_clamp_indirect = 6.0
    cy.filter_width = 1.5
    sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = W, H, 100
    if args.border:
        x0, y0, x1, y1 = [float(v) for v in args.border.split(',')]
        sc.render.use_border = True; sc.render.use_crop_to_border = True
        sc.render.border_min_x, sc.render.border_max_x = x0, x1
        sc.render.border_min_y, sc.render.border_max_y = 1 - y1, 1 - y0
    sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'; sc.view_settings.exposure = 0
    ims = sc.render.image_settings
    if hasattr(ims, 'media_type'):                  # Blender 5: monikerroksinen EXR = media_type
        ims.media_type = 'MULTI_LAYER_IMAGE'
        ims.file_format = 'OPEN_EXR_MULTILAYER'
    else:
        ims.file_format = 'OPEN_EXR_MULTILAYER'
    sc.render.image_settings.color_depth = '32'
    sc.render.image_settings.exr_codec = 'ZIP'
    sc.render.filepath = EXR
    t0 = time.time()
    bpy.ops.render.render(write_still=True)
    print(f'cycles {W}×{H} {args.samples} spp: {time.time() - t0:.0f} s → {EXR}', flush=True)

    # ---------- häivytysmaski toisena, kevyenä ajona (Blender 5 tallentaa EXR:ään vain Combined-kerroksen) ----------
    for mat in bpy.data.materials:
        if not mat.use_nodes:
            continue
        nt = mat.node_tree
        out = next((n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL'), None) or nt.nodes.new('ShaderNodeOutputMaterial')
        em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Strength'].default_value = 1.0
        aovn = next((n for n in nt.nodes if n.type == 'OUTPUT_AOV'), None)
        if aovn is not None and aovn.inputs['Value'].is_linked:
            nt.links.new(aovn.inputs['Value'].links[0].from_socket, em.inputs['Color'])
        else:
            em.inputs['Color'].default_value = (0, 0, 0, 1)
        nt.links.new(em.outputs['Emission'], out.inputs['Surface'])
    for o in sc.objects:
        if o.type == 'LIGHT':
            o.data.energy = 0
    for n in world.node_tree.nodes:
        if n.type == 'BACKGROUND':
            n.inputs['Strength'].default_value = 0
    cy.samples = 16; cy.use_adaptive_sampling = False; cy.use_denoising = False
    cy.max_bounces = 0
    if hasattr(ims, 'media_type'):
        ims.media_type = 'IMAGE'
    ims.file_format = 'OPEN_EXR'; ims.color_depth = '32'; ims.color_mode = 'RGB'
    sc.render.filepath = os.path.join(args.out, f'{SHOT}-fade.exr')
    t1 = time.time()
    bpy.ops.render.render(write_still=True)
    print(f'häivytysmaski {time.time() - t1:.0f} s', flush=True)

# ============================== sävytys kuten three.js ==============================
import OpenEXR
from PIL import Image

with OpenEXR.File(EXR) as f:
    ch = f.channels()
    names = list(ch.keys())
    def get(*cands):
        for c in cands:
            for n in names:
                if n == c or n.endswith('.' + c) or n.endswith(c):
                    return np.asarray(ch[n].pixels, dtype=np.float32)
        raise KeyError(f'{cands} not in {names}')
    def rgb():
        for pref in ('ViewLayer.Combined.', 'Combined.', ''):
            if all((pref + c) in ch for c in 'RGB'):
                return np.dstack([np.asarray(ch[pref + c].pixels, dtype=np.float32) for c in 'RGB'])
        rgba = [n for n in names if 'Combined' in n]
        if rgba:
            px = np.asarray(ch[rgba[0]].pixels, dtype=np.float32)
            if px.ndim == 3:
                return px[..., :3]
        raise KeyError(names)
    img = rgb().astype(np.float64)
with OpenEXR.File(os.path.join(args.out, f'{SHOT}-fade.exr')) as f:
    chf = f.channels()
    k = next(iter(chf))
    fade = np.asarray(chf[k].pixels, dtype=np.float64)
    if fade.ndim == 3:
        fade = fade[..., 0]
    fade = np.clip(fade, 0, 1)
Hh, Ww = img.shape[:2]

expo = META['exposure'] if args.exposure is None else args.exposure


# hehku: postprocessing BloomEffect (kynnys, pehmennys, mip-sumennus, voimakkuus) lineaarisessa tilassa
def gblur(a, sigma):
    if sigma < 0.5:
        return a
    r = int(math.ceil(sigma * 3))
    x = np.arange(-r, r + 1)
    k = np.exp(-x * x / (2 * sigma * sigma)); k /= k.sum()
    out = np.apply_along_axis(lambda v: np.convolve(v, k, mode='same'), 0, a)
    return np.apply_along_axis(lambda v: np.convolve(v, k, mode='same'), 1, out)


def downs(a, f):
    h, w = a.shape[0] // f * f, a.shape[1] // f * f
    return a[:h, :w].reshape(h // f, f, w // f, f, -1).mean(axis=(1, 3))


def ups(a, shape):
    im = [Image.fromarray(a[..., c].astype(np.float32), mode='F').resize((shape[1], shape[0]), Image.BILINEAR) for c in range(a.shape[2])]
    return np.dstack([np.asarray(x, dtype=np.float64) for x in im])


th, sm = META['bloom']['threshold'], 0.2
luma = img @ np.array([0.2126, 0.7152, 0.0722])
mask = np.clip((luma - th) / sm, 0, 1); mask = mask * mask * (3 - 2 * mask)
bright = img * mask[..., None]
scale_ref = Ww / 1350.0                      # three.js-renderin mip-ketju on suhteessa kuvan kokoon
bl = np.zeros_like(img)
for lvl, wgt in [(2, 0.22), (4, 0.24), (8, 0.22), (16, 0.18), (32, 0.14)]:
    d = downs(bright, max(1, int(round(lvl * scale_ref))) if scale_ref >= 1 else lvl)
    d = np.dstack([gblur(d[..., c], 1.4 * args.bloom) for c in range(3)])
    bl += wgt * ups(d, img.shape[:2])
img = img + META['bloom']['intensity'] * bl

# ACES-filmikäyrä (three.js ACESFilmicToneMapping, sama valotus)
Min = np.array([[0.59719, 0.35458, 0.04823], [0.07600, 0.90834, 0.01566], [0.02840, 0.13383, 0.83777]])
Mout = np.array([[1.60475, -0.53108, -0.07367], [-0.10208, 1.10813, -0.00605], [-0.00327, -0.07276, 1.07602]])
c = img * (expo / 0.6)
c = c @ Min.T
c = (c * (c + 0.0245786) - 0.000090537) / (c * (0.983729 * c + 0.4329510) + 0.238081)
c = np.clip(c @ Mout.T, 0, 1)
out = lin_to_srgb(c)

# maan häivytys taustaväriin sävytyksen jälkeen: sama reunaväri kuin three.js-kuvassa
bg_lin = srgb_to_lin(hexrgb(META['bg']))
bgc = bg_lin * (expo / 0.6) @ Min.T
bgc = (bgc * (bgc + 0.0245786) - 0.000090537) / (bgc * (0.983729 * bgc + 0.4329510) + 0.238081)
bg_disp = lin_to_srgb(np.clip(bgc @ Mout.T, 0, 1))
out = out * (1 - fade[..., None]) + bg_disp * fade[..., None]

png = os.path.join(args.out, f'{SHOT}.png')
Image.fromarray(np.clip(out * 255 + 0.5, 0, 255).astype(np.uint8), 'RGB').save(png)
print(f'sävytys → {png}  reunaväri {np.round(bg_disp * 255).astype(int).tolist()}', flush=True)
