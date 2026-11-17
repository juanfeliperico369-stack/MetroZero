#!/usr/bin/env python3
"""Verificación del mapa contra OpenStreetMap (2/2): compara las casillas del juego con las vías de OSM.
Uso: python3 -I tools/osm_comparar.py ventanas.json DIR_CON_zonaN.osm DIR_SALIDA   (zonaN.osm = api.openstreetmap.org/api/0.6/map?bbox=...)"""
import sys, json, math, os
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw

V = json.load(open(sys.argv[1])); DOSM, OUT = sys.argv[2], sys.argv[3]
ROAD = {4, 5, 14, 11}; BLD = {2, 3}
CARRO = {'motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'unclassified', 'residential', 'living_street', 'service', 'road',
         'motorway_link', 'trunk_link', 'primary_link', 'secondary_link', 'tertiary_link'}
ARTER = {'motorway', 'trunk', 'primary', 'secondary', 'motorway_link', 'trunk_link', 'primary_link', 'secondary_link'}
PIE = {'footway', 'path', 'steps', 'pedestrian', 'cycleway', 'track'}
COL = {0: (111, 154, 74), 1: (61, 104, 56), 2: (180, 88, 58), 3: (141, 151, 164), 4: (75, 80, 89), 5: (63, 68, 77), 6: (189, 182, 165), 7: (63, 154, 80),
       8: (58, 135, 168), 9: (75, 127, 140), 10: (217, 205, 174), 11: (109, 111, 117), 12: (244, 236, 208), 13: (169, 154, 122), 14: (52, 56, 63), 15: (90, 176, 208), 16: (163, 152, 130)}
res = []
for zi, z in enumerate(V):
    m = z['meta']; n = z['n']; tx0, ty0 = z['tx0'], z['ty0']; t = z['t']
    tile = lambda x, y: t[(y - ty0) * n + (x - tx0)] if 0 <= x - tx0 < n and 0 <= y - ty0 < n else None
    TX = lambda lon: (lon - m['lon0']) * m['kx']; TY = lambda lat: (m['latN'] - lat) * m['ky']
    root = ET.parse(os.path.join(DOSM, f'zona{zi}.osm')).getroot()
    nodes = {nd.get('id'): (float(nd.get('lat')), float(nd.get('lon'))) for nd in root.iter('node')}
    ways = []
    for w in root.iter('way'):
        tags = {tg.get('k'): tg.get('v') for tg in w.iter('tag')}
        pts = [nodes[r.get('ref')] for r in w.iter('nd') if r.get('ref') in nodes]
        if len(pts) >= 2: ways.append((tags, pts))
    def muestras(pts, paso=0.2):   # en casillas (0.2 = 4 m)
        out = []
        for (la1, lo1), (la2, lo2) in zip(pts, pts[1:]):
            x1, y1, x2, y2 = TX(lo1), TY(la1), TX(lo2), TY(la2); L = math.hypot(x2 - x1, y2 - y1); k = max(1, int(L / paso))
            for i in range(k + 1): out.append((x1 + (x2 - x1) * i / k, y1 + (y2 - y1) * i / k))
        return out
    cerca = lambda x, y, S: any(tile(x + dx, y + dy) in S for dx in (-1, 0, 1) for dy in (-1, 0, 1))
    osm_c, osm_a, osm_p, osm_b, calles = set(), set(), set(), set(), []
    for tags, pts in ways:
        hw = tags.get('highway')
        if hw in CARRO:
            ss = [(int(math.floor(x)), int(math.floor(y))) for x, y in muestras(pts)]
            ss = [s for s in ss if tile(*s) is not None]
            for s in ss: osm_c.add(s); (osm_a.add(s) if hw in ARTER else None)
            if len(ss) >= 8 and tags.get('name'): calles.append((tags.get('name'), hw, sum(cerca(x, y, ROAD) for x, y in ss) / len(ss)))
        elif hw in PIE:
            for x, y in muestras(pts):
                s = (int(math.floor(x)), int(math.floor(y)))
                if tile(*s) is not None: osm_p.add(s)
        elif 'building' in tags and tags['building'] != 'no':
            xs = [TX(lo) for la, lo in pts]; ys = [TY(la) for la, lo in pts]
            for x in range(int(min(xs)), int(max(xs)) + 1):
                for y in range(int(min(ys)), int(max(ys)) + 1):
                    if tile(x, y) is not None: osm_b.add((x, y))
    nuestras = {(x, y) for y in range(ty0, ty0 + n) for x in range(tx0, tx0 + n) if tile(x, y) in ROAD}
    nb = {(x, y) for y in range(ty0, ty0 + n) for x in range(tx0, tx0 + n) if tile(x, y) in BLD}
    def cerca_set(s, S, r=1): return any((s[0] + dx, s[1] + dy) in S for dx in range(-r, r + 1) for dy in range(-r, r + 1))
    r_exact = sum(tile(*s) in ROAD for s in osm_c) / max(1, len(osm_c))
    r_near = sum(cerca(*s, ROAD) for s in osm_c) / max(1, len(osm_c))
    r_art = sum(cerca(*s, ROAD) for s in osm_a) / max(1, len(osm_a))
    prec = sum(cerca_set(s, osm_c) for s in nuestras) / max(1, len(nuestras))
    prec_any = sum(cerca_set(s, osm_c | osm_p) for s in nuestras) / max(1, len(nuestras))
    b_rec = sum(tile(*s) in BLD for s in osm_b) / max(1, len(osm_b)) if osm_b else None
    completas = sum(1 for c in calles if c[2] >= .8)
    res.append(dict(zona=z['nm'], casillas_via_osm=len(osm_c), casillas_via_juego=len(nuestras), recall_exacto=round(r_exact, 3), recall_20m=round(r_near, 3),
                    recall_arterias_20m=round(r_art, 3), precision_20m=round(prec, 3), precision_20m_incl_peatonal=round(prec_any, 3),
                    edificios_osm_casillas=len(osm_b), edificios_osm_en_juego=None if b_rec is None else round(b_rec, 3),
                    calles_con_nombre=len(calles), calles_80pct=completas, peores=sorted(calles, key=lambda c: c[2])[:5]))
    # imagen: el juego (colores planos) con las vías de OSM encima
    E = 8; im = Image.new('RGB', (n * E, n * E)); d = ImageDraw.Draw(im)
    for y in range(n):
        for x in range(n):
            c = COL.get(t[y * n + x], (0, 0, 0)); c = tuple(int(v * .55 + 255 * .45) for v in c)   # mapa del juego, lavado
            d.rectangle([x * E, y * E, x * E + E - 1, y * E + E - 1], fill=c)
    for tags, pts in ways:
        hw = tags.get('highway')
        if hw in CARRO or hw in PIE:
            xy = [((TX(lo) - tx0) * E, (TY(la) - ty0) * E) for la, lo in pts]
            d.line(xy, fill=(220, 30, 40) if hw in CARRO else (30, 90, 220), width=3 if hw in ARTER else 2 if hw in CARRO else 1)
        elif tags.get('waterway') in ('river', 'stream', 'canal'):
            d.line([((TX(lo) - tx0) * E, (TY(la) - ty0) * E) for la, lo in pts], fill=(0, 200, 230), width=3)
    im.save(os.path.join(OUT, f'osm-{zi}.png'))
print(json.dumps(res, ensure_ascii=False, indent=1))
