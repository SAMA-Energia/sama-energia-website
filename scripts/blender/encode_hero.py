#!/usr/bin/env python3
"""SAMA Energia — Cycles-herotaustan WebP-koot samoilla nimillä, mitoilla ja tiedostobudjeteilla kuin render-stills.mjs --tausta.

Ajo: python3 scripts/blender/encode_hero.py <render-kansio>   (bg.png 2400×1600 ja bgm.png 1170×878, render_hero.py)
Kirjoittaa assets/k-tausta-{2400,1800,1200}.webp ja assets/k-tausta-m{1170,780}.webp. Laatu haetaan 92 → 50, kunnes koko mahtuu.
"""
import io
import os
import sys

from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
SRC = sys.argv[1]
OUTS = {
    'bg.png': [('2400', 2400, 1600, 150000), ('1800', 1800, 1200, 92000), ('1200', 1200, 800, 48000)],
    'bgm.png': [('m1170', 1170, 878, 58000), ('m780', 780, 585, 30000)],
}
for src, outs in OUTS.items():
    im = Image.open(os.path.join(SRC, src)).convert('RGB')
    for suf, w, h, cap in outs:
        r = im if im.size == (w, h) else im.resize((w, h), Image.LANCZOS)
        best = None
        for q in range(92, 49, -2):
            b = io.BytesIO(); r.save(b, 'WEBP', quality=q, method=6)
            if b.tell() <= cap:
                best = (q, b.getvalue()); break
        if not best:
            raise SystemExit(f'k-tausta-{suf}: ei mahdu budjettiin {cap} t')
        p = os.path.join(ROOT, 'assets', f'k-tausta-{suf}.webp')
        open(p, 'wb').write(best[1])
        print(f'assets/k-tausta-{suf}.webp  q{best[0]}  {len(best[1]) / 1024:.1f} kt')
