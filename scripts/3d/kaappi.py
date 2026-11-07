#!/usr/bin/env python3
"""SAMA Energia — akkukaapin tarkka 3D-malli (build123d → GLB).

Lähteet (mitat ja ulkonäkö):
  - Ralos, asiakkaan infopaketti (26.8.2026): ulkomitat 1 350 × 1 010 × 2 450 mm, 2 600 kg, IP54.
  - Ralos, "Perusteellinen asennus- ja käyttöohje BEAST125HD v2.1" 6.2: verkkoliitäntä kaapin takana
    (kaapelin läpivientilevy takasivun alaosassa).
  - Ralosin tuotekuvat (assets/valikoima/ralos-kaapit.webp, ralos-kaappi-auki.webp): kapea sähkötilan ovi
    (merkkivalo, kolme merkkilamppua, näytön kansi, avainkytkin, korkea säleikkö) ja leveä akkutilan ovi, jossa
    jäähdytysyksikön verkkosäleikkö ja puhallinkotelo; kahvat keskellä; pohjakehys trukkitaskuin; kattolevy.
  Mitat, joita lähteissä ei ole (ovien jako, varusteiden koot ja korkeudet), on mitoitettu tuotekuvasta
  perspektiivi huomioiden; kokonaismitat ovat tarkat. Ei logoja, ei tekstejä.

Tuotos: GLB (metrit, Y ylös, etupuoli +Z, origo pohjan keskellä), yksi mesh materiaalia kohden,
nodejen nimet `kaappi_<materiaali>` — scripts/stills/hero3d.js liittää nimillä omat materiaalinsa.

Ajo (riippuvuudet eivät tule repoon):
  uv venv -p 3.12 /tmp/cad && uv pip install --python /tmp/cad/bin/python build123d trimesh
  /tmp/cad/bin/python scripts/3d/kaappi.py /tmp/kaappi-raw.glb
  npx @gltf-transform/cli weld /tmp/kaappi-raw.glb /tmp/k1.glb && npx @gltf-transform/cli quantize /tmp/k1.glb assets/3d/kaappi.glb
"""
import json
import sys

import numpy as np
import trimesh
from build123d import Axis, Box, Cylinder, Pos, Rot, chamfer, fillet

W, D, H = 1350.0, 1010.0, 2450.0          # ulkomitat, mm (Ralos)
BASE_H, ROOF_H = 110.0, 45.0              # pohjakehys ja kattolevy
Z0, Z1 = BASE_H, H - ROOF_H               # runko
FY = -D / 2                               # etupinta (CAD: etu = -Y)
BY = D / 2                                # takapinta
DOOR_X = -225.0                           # ovien jako: sähkötila 440 mm | akkutila 890 mm
LX = (-665.0 + DOOR_X) / 2                # vasemman oven keskilinja
RX = 250.0                                # oikean oven varustelinja

PARTS = {k: [] for k in ('paint', 'paint2', 'roof', 'base', 'dark', 'grille', 'mesh', 'metal', 'led', 'seam')}
MATS = {  # glTF PBR (AR ja oletus); hero3d.js korvaa nimen perusteella
    'paint':  dict(c='#D6D3CC', r=0.45, m=0.10),
    'paint2': dict(c='#CDC9C1', r=0.50, m=0.10),
    'roof':   dict(c='#C6C2BA', r=0.50, m=0.12),
    'base':   dict(c='#B9B5AD', r=0.60, m=0.15),
    'dark':   dict(c='#2A2B2E', r=0.55, m=0.20),
    'grille': dict(c='#1C1D1F', r=0.85, m=0.10),
    'mesh':   dict(c='#2B2C2F', r=0.80, m=0.30),
    'metal':  dict(c='#9AA0A6', r=0.35, m=0.85),
    'led':    dict(c='#1A140A', r=0.40, m=0.00, e='#F2CF7E'),
    'seam':   dict(c='#55565A', r=0.60, m=0.10),
}


def box(cx, cy, cz, sx, sy, sz):
    return Pos(cx, cy, cz) * Box(sx, sy, sz)


def cyl_y(cx, cy, cz, r, h):
    """Sylinteri Y-akselin suuntaan (etupinnasta ulos), keskipiste (cx, cy, cz)."""
    return Pos(cx, cy, cz) * Rot(90, 0, 0) * Cylinder(r, h)


def front_cyl(cx, cz, r, h, base_y=FY, overlap=1.0):
    """Etupinnasta ulkoneva sylinteri: alkaa base_y:stä (1 mm limitys) ja ulkonee h mm."""
    return cyl_y(cx, base_y - h / 2 + overlap, cz, r, h + overlap)


def front_box(cx, cz, sx, sz, h, base_y=FY, overlap=1.0):
    return box(cx, base_y - h / 2 + overlap / 2, cz, sx, h + overlap, sz)


# ---------- runko: pystyreunat pyöristetty, ovien urat, säleikön ja verkkosäleikön syvennykset ----------
body = box(0, 0, (Z0 + Z1) / 2, W, D, Z1 - Z0)
body = fillet(body.edges().filter_by(Axis.Z), 10)
GW, GD = 5.0, 3.0                                           # uran leveys ja syvyys
DZ0, DZ1, DX0, DX1 = 150.0, 2365.0, -665.0, 665.0           # ovien ulkoreunat
grooves = [
    box(0, FY, DZ0, DX1 - DX0 + GW, 2 * GD, GW), box(0, FY, DZ1, DX1 - DX0 + GW, 2 * GD, GW),
    box(DX0, FY, (DZ0 + DZ1) / 2, GW, 2 * GD, DZ1 - DZ0), box(DX1, FY, (DZ0 + DZ1) / 2, GW, 2 * GD, DZ1 - DZ0),
    box(DOOR_X, FY, (DZ0 + DZ1) / 2, GW, 2 * GD, DZ1 - DZ0),
]
for g in grooves:
    body -= g
# urien pohjalle tumma sauma (näkyy myös pienessä kuvassa)
for x0, x1, z0, z1 in [(DX0, DX1, DZ0, DZ0), (DX0, DX1, DZ1, DZ1), (DX0, DX0, DZ0, DZ1), (DX1, DX1, DZ0, DZ1), (DOOR_X, DOOR_X, DZ0, DZ1)]:
    sx = (x1 - x0) + GW if x1 != x0 else GW - 1
    sz = (z1 - z0) + GW if z1 != z0 else GW - 1
    PARTS['seam'].append(box((x0 + x1) / 2, FY + GD - 0.6, (z0 + z1) / 2, sx, 1.0, sz))

# sähkötilan ovi: korkea säleikkö alhaalla (Ralosin kuva: sälerivi oven alaosassa)
LV = dict(x=LX, z0=330.0, z1=1410.0, w=250.0, d=14.0)
body -= box(LV['x'], FY + (LV['d'] - 5) / 2, (LV['z0'] + LV['z1']) / 2, LV['w'], LV['d'] + 5, LV['z1'] - LV['z0'])
PARTS['grille'].append(box(LV['x'], FY + LV['d'] - 1.0, (LV['z0'] + LV['z1']) / 2, LV['w'], 2.0, LV['z1'] - LV['z0']))
pitch, z = 32.0, LV['z0'] + 18.0
while z < LV['z1'] - 14.0:
    PARTS['paint2'].append(Pos(LV['x'], FY + 6.0, z) * Rot(-35, 0, 0) * Box(LV['w'] - 6, 3.0, 28.0))
    z += pitch

# akkutilan ovi: jäähdytysyksikön verkkosäleikkö (imu)
MV = dict(x=RX, z0=1470.0, z1=2230.0, w=330.0, d=12.0)
body -= box(MV['x'], FY + (MV['d'] - 5) / 2, (MV['z0'] + MV['z1']) / 2, MV['w'], MV['d'] + 5, MV['z1'] - MV['z0'])
PARTS['mesh'].append(box(MV['x'], FY + MV['d'] - 1.0, (MV['z0'] + MV['z1']) / 2, MV['w'], 2.0, MV['z1'] - MV['z0']))
for i in range(1, 15):                                       # verkon pystylangat
    PARTS['paint2'].append(box(MV['x'] - MV['w'] / 2 + i * MV['w'] / 15, FY + 4.0, (MV['z0'] + MV['z1']) / 2, 2.5, 2.0, MV['z1'] - MV['z0']))
zz = MV['z0'] + 22.0
while zz < MV['z1'] - 10:                                    # verkon vaakalangat
    PARTS['paint2'].append(box(MV['x'], FY + 4.0, zz, MV['w'], 2.0, 2.5))
    zz += 22.0
PARTS['paint'].append(body)

# ---------- pohjakehys trukkitaskuin (edessä/takana ja sivuilla) ----------
base = box(0, 0, BASE_H / 2, W - 20, D - 20, BASE_H)
PK = dict(w=240.0, h=60.0, depth=130.0, z=BASE_H / 2)
for sx in (-340.0, 340.0):
    for sgn in (-1, 1):
        face = sgn * (D - 20) / 2
        base -= box(sx, face - sgn * (PK['depth'] / 2 - 5), PK['z'], PK['w'], PK['depth'] + 10, PK['h'])
        PARTS['dark'].append(box(sx, face - sgn * (PK['depth'] - 1), PK['z'], PK['w'], 2.0, PK['h']))
for sy in (-250.0, 250.0):
    for sgn in (-1, 1):
        face = sgn * (W - 20) / 2
        base -= box(face - sgn * (PK['depth'] / 2 - 5), sy, PK['z'], PK['depth'] + 10, PK['w'], PK['h'])
        PARTS['dark'].append(box(face - sgn * (PK['depth'] - 1), sy, PK['z'], 2.0, PK['w'], PK['h']))
PARTS['base'].append(base)

# ---------- kattolevy ----------
roof = box(0, 0, H - ROOF_H / 2, W + 30, D + 30, ROOF_H)
roof = chamfer(roof.edges().group_by(Axis.Z)[-1], 6)
PARTS['roof'].append(roof)

# ---------- sähkötilan ovi: merkkivalo, merkkilamput, näytön kansi, avainkytkin, kahva ----------
PARTS['dark'].append(front_cyl(LX, 2250.0, 46.0, 24.0))                       # merkkivalon kehä
PARTS['led'].append(front_cyl(LX, 2250.0, 28.0, 4.0, base_y=FY - 24.0))         # tilavalo (kulta)
for dx in (-48.0, 0.0, 48.0):
    PARTS['dark'].append(front_cyl(LX + dx, 2140.0, 12.0, 12.0))               # merkkilamput
hmi = front_box(LX, 1830.0, 330.0, 270.0, 36.0)
hmi = fillet(hmi.edges().filter_by(Axis.Y), 8)
PARTS['paint2'].append(hmi)
PARTS['dark'].append(front_cyl(LX + 140.0, 1830.0, 10.0, 8.0, base_y=FY - 36.0))   # kannen lukko
PARTS['dark'].append(front_cyl(LX, 1650.0, 16.0, 14.0))                        # avainkytkin


def handle(x):
    PARTS['dark'].append(front_box(x, 1250.0, 36.0, 210.0, 6.0))
    g = front_box(x, 1250.0, 24.0, 160.0, 26.0, base_y=FY - 6.0)
    PARTS['metal'].append(fillet(g.edges().filter_by(Axis.Z), 5))


handle(DOOR_X - 50.0)
handle(DOOR_X + 50.0)

# ---------- akkutilan ovi: puhallinkotelo pyöreällä suojaritilällä ----------
fan = front_box(RX, 1235.0, 330.0, 300.0, 60.0)
fan = fillet(fan.edges().filter_by(Axis.Y), 8)
fan -= cyl_y(RX, FY - 60.0 + 8.0, 1235.0, 110.0, 20.0)
PARTS['paint2'].append(fan)
PARTS['mesh'].append(cyl_y(RX, FY - 60.0 + 17.0, 1235.0, 110.0, 2.0))
PARTS['dark'].append(cyl_y(RX, FY - 60.0 + 10.0, 1235.0, 30.0, 12.0))
for ang in (0, 45, 90, 135):
    PARTS['paint2'].append(Pos(RX, FY - 60.0 + 8.0, 1235.0) * Rot(0, ang, 0) * Box(218.0, 3.0, 5.0))
for rr in (40.0, 75.0):                                      # suojaritilän kehät
    ring = cyl_y(RX, FY - 60.0 + 8.0, 1235.0, rr + 2.5, 3.0) - cyl_y(RX, FY - 60.0 + 8.0, 1235.0, rr - 2.5, 4.0)
    PARTS['paint2'].append(ring)

# ---------- takasivu: verkkoliitännän läpivientilevy (Ralos v2.1 6.2) ----------
PARTS['dark'].append(box(0, BY + 2.0, 270.0, 620.0, 6.0, 220.0))


# ---------- tessellointi → GLB ----------
def hexrgb(h):
    h = h.lstrip('#')
    return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]


def srgb_to_lin(c):
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]


scene = trimesh.Scene()
stats = {}
for key, shapes in PARTS.items():
    if not shapes:
        continue
    meshes = []
    for s in shapes:
        verts, tris = s.tessellate(0.4, 0.15)
        v = np.array([[p.X, p.Y, p.Z] for p in verts], dtype=np.float64)
        v = np.column_stack([v[:, 0], v[:, 2], -v[:, 1]]) / 1000.0     # CAD Z-ylös mm → glTF Y-ylös m, etu +Z
        meshes.append(trimesh.Trimesh(vertices=v, faces=np.array(tris, dtype=np.int64), process=False))
    m = trimesh.util.concatenate(meshes)
    spec = MATS[key]
    mat = trimesh.visual.material.PBRMaterial(
        name=key, baseColorFactor=srgb_to_lin(hexrgb(spec['c'])) + [1.0],
        metallicFactor=spec['m'], roughnessFactor=spec['r'],
        emissiveFactor=srgb_to_lin(hexrgb(spec['e'])) if 'e' in spec else None)
    m.visual = trimesh.visual.TextureVisuals(material=mat)
    _ = m.vertex_normals
    scene.add_geometry(m, node_name='kaappi_' + key, geom_name='kaappi_' + key)
    stats[key] = int(len(m.faces))

lo, hi = scene.bounds
out = sys.argv[1] if len(sys.argv) > 1 else 'kaappi-raw.glb'
scene.export(out, file_type='glb')
print(json.dumps({'out': out, 'triangles': stats, 'total': sum(stats.values()),
                  'bounds_m': [[round(x, 4) for x in lo], [round(x, 4) for x in hi]]}))
