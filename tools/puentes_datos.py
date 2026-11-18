#!/usr/bin/env python3
"""Puentes reales del Valle de Aburrá -> src/data/puentes.js

Puentes vehiculares y peatonales con su nivel (OpenStreetMap vía Overture Maps, tema transportation/segment: la bandera
`is_bridge` de `road_flags` y el nivel de `level_rules`), enlazados con las calles del juego (src/data/vias.js) para que
la calle no se dibuje dos veces: abajo, a ras de piso, solo queda lo que de verdad va por el piso.

Uso:
  python3 tools/puentes_datos.py --descargar CARPETA   # baja los segmentos con banderas o nivel (duckdb, S3 público de Overture)
  python3 tools/puentes_datos.py CARPETA               # genera src/data/puentes.js (shapely, pyarrow, numpy)

Formato de PUENTES:
  B: por puente, [tipo (0 vehicular, 1 peatonal), nivel, ancho (m), alto del tablero (m), x0, y0, x1, y1, …] en metros del mapa (0,1 m);
  S: tramos de las calles del juego que quedan sobre un puente, [vía, tramo, desde, hasta, puente] (desde/hasta: fracción del tramo).
"""
import base64, json, math, os, re, sys, time, zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REL = 's3://overturemaps-us-west-2/release/2026-10-21.0'
ANCHO = {'motorway': 12, 'trunk': 11, 'primary': 10, 'secondary': 9, 'tertiary': 8, 'residential': 7, 'unclassified': 7, 'living_street': 6, 'service': 5,
         'footway': 3.2, 'path': 3, 'pedestrian': 4, 'steps': 3, 'cycleway': 3, 'bridleway': 3, 'track': 4, 'unknown': 6}
PEATONAL = {'footway', 'path', 'pedestrian', 'steps', 'cycleway', 'bridleway'}


def meta():
    s = open(os.path.join(ROOT, 'src/data/valle.js'), encoding='utf8').read()
    i = s.index('VALLE_META'); j = s.index('{', i); d = 0
    for k in range(j, len(s)):
        d += s[k] == '{'; d -= s[k] == '}'
        if d == 0: break
    return json.loads(s[j:k + 1])


def vias():
    s = open(os.path.join(ROOT, 'src/data/vias.js'), encoding='utf8').read()
    i = s.index('const VIAS = ') + len('const VIAS = '); d = 0
    for k in range(i, len(s)):
        d += s[k] == '{'; d -= s[k] == '}'
        if d == 0: break
    V = json.loads(s[i:k + 1])
    b = zlib.decompress(base64.b64decode(V['d']), -15); o = 0; px = py = 0; U = V['u']; out = []
    def rv():
        nonlocal o
        v = sh = 0
        while True:
            c = b[o]; o += 1; v += (c & 127) << sh; sh += 7
            if not c & 128: return v
    uz = lambda v: -(v + 1) // 2 if v % 2 else v // 2
    for _ in range(V['n']):
        k, nm, w2, n = rv(), rv(), rv(), rv(); P = []
        for _ in range(n): px += uz(rv()); py += uz(rv()); P.append((px * U, py * U))
        out.append((k, w2 / 2, P))
    return out


def descargar(C):
    import duckdb
    os.makedirs(C, exist_ok=True); M = meta()
    BB = (M['lon0'], M['lon0'] + M['W'] / M['kx'], M['latN'] - M['H'] / M['ky'], M['latN'])
    c = duckdb.connect(); c.execute('INSTALL httpfs; LOAD httpfs; INSTALL spatial; LOAD spatial;')
    px = os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy')
    if px: c.execute(f"SET http_proxy='{re.sub(r'^https?://', '', px).rstrip('/')}'")
    if os.path.exists('/root/.ccr/ca-bundle.crt'): c.execute("SET ca_cert_file='/root/.ccr/ca-bundle.crt'")
    c.execute("SET s3_region='us-west-2'; SET s3_url_style='path'; SET http_timeout=120000; CREATE SECRET anon (TYPE s3, KEY_ID '', SECRET '', REGION 'us-west-2')")
    dentro = f'bbox.xmax > {BB[0]} AND bbox.xmin < {BB[1]} AND bbox.ymax > {BB[2]} AND bbox.ymin < {BB[3]}'
    f = os.path.join(C, 'segmentos_nivel.parquet')
    c.execute(f"""COPY (SELECT id, subtype, class, subclass, names.primary AS name, road_flags, rail_flags, level_rules, ST_AsWKB(geometry) AS wkb
      FROM read_parquet('{REL}/theme=transportation/type=segment/*', hive_partitioning=1)
      WHERE {dentro} AND (road_flags IS NOT NULL OR rail_flags IS NOT NULL OR level_rules IS NOT NULL)) TO '{f}' (FORMAT PARQUET)""")
    print('segmentos con banderas o nivel:', c.execute(f"select count(*) from '{f}'").fetchone()[0])


def generar(C):
    import numpy as np, pyarrow.parquet as pq, shapely
    from shapely.ops import substring, linemerge
    t0 = time.time(); M = meta(); TM = M['tile']; W, H = M['W'] * TM, M['H'] * TM
    proj = lambda c: np.column_stack([(c[:, 0] - M['lon0']) * M['kx'] * TM, (M['latN'] - c[:, 1]) * M['ky'] * TM])
    T = pq.read_table(os.path.join(C, 'segmentos_nivel.parquet'), columns=['subtype', 'class', 'road_flags', 'level_rules', 'wkb']).to_pydict()
    piezas = []
    for st, cl, rf, lr, w in zip(T['subtype'], T['class'], T['road_flags'], T['level_rules'], T['wkb']):
        if st != 'road' or not rf: continue
        g = shapely.transform(shapely.from_wkb(w), proj)
        if g.geom_type != 'LineString' or g.length < 4: continue
        for f in rf:
            if 'is_bridge' not in (f['values'] or []): continue
            a, b = (f['between'] or [0, 1])
            seg = substring(g, a, b, normalized=True)
            if seg.geom_type != 'LineString' or seg.length < 4: continue
            nivel = 0
            for r in lr or []:
                ra, rb = (r['between'] or [0, 1])
                if ra < b and rb > a and r['value'] and r['value'] > 0: nivel = max(nivel, int(r['value']))
            nivel = nivel or 1
            piezas.append({'c': cl or 'unknown', 'z': min(3, nivel), 'g': seg})
    print('tramos de puente:', len(piezas))
    # se unen los tramos seguidos del mismo nivel y del mismo tipo (vehicular o peatonal): un puente partido en varias vías de OSM no lleva rampas en la mitad
    grupos = {}
    for p in piezas: grupos.setdefault((p['z'], p['c'] in PEATONAL), []).append(p)
    puentes = []
    for (z, pe), L in grupos.items():
        merged = linemerge(shapely.MultiLineString([p['g'] for p in L]))
        geoms = list(merged.geoms) if merged.geom_type == 'MultiLineString' else [merged]
        clases = shapely.STRtree([p['g'] for p in L])
        for g in geoms:
            if g.length < 6: continue
            idx = clases.query(g.centroid, predicate='dwithin', distance=6) if hasattr(clases, 'query') else []
            cl = L[idx[0]]['c'] if len(idx) else L[0]['c']
            gs = g.simplify(.6)
            puentes.append({'z': z, 'pe': pe, 'c': cl, 'g': gs})
    print('puentes unidos:', len(puentes))
    # calles del juego: ancho del puente, y qué tramo de cada calle queda sobre él
    V = vias(); segs = []
    for vi, (k, w, P) in enumerate(V):
        for i in range(1, len(P)): segs.append((vi, i, k, w, P[i - 1], P[i]))
    SG = shapely.STRtree([shapely.LineString([s[4], s[5]]) for s in segs])
    B, S = [], []
    for bi, p in enumerate(puentes):
        g = p['g']; ba = np.asarray(g.coords)
        dirB = lambda q: (lambda d: math.atan2(d[1], d[0]))(np.asarray(g.interpolate(min(g.length, g.project(shapely.Point(q)) + 2)).coords[0]) - np.asarray(g.interpolate(max(0, g.project(shapely.Point(q)) - 2)).coords[0]))
        ancho = ANCHO.get(p['c'], 6); cand = SG.query(g.buffer(ancho / 2 + 3))
        mejor = None
        for ci in cand:
            vi, i, k, w, A, Bp = segs[ci]
            if p['pe'] != (k in (5, 6, 7)): continue
            L2 = math.hypot(Bp[0] - A[0], Bp[1] - A[1])
            if L2 < .5: continue
            ang = math.atan2(Bp[1] - A[1], Bp[0] - A[0]); n = max(2, int(L2 / 2)); dentro = []
            for t in range(n + 1):
                f = t / n; q = (A[0] + (Bp[0] - A[0]) * f, A[1] + (Bp[1] - A[1]) * f); pt = shapely.Point(q)
                if g.distance(pt) > max(2.5, ancho / 2): continue
                da = abs((ang - dirB(q) + math.pi) % (2 * math.pi) - math.pi); da = min(da, math.pi - da)
                if da < .45: dentro.append(f)
            if len(dentro) >= 2 or (len(dentro) == 1 and n <= 3):
                ta, tb = min(dentro), max(dentro)
                # el tramo del puente se alarga a los bordes del tramo si le falta menos de 2 m
                if ta * L2 < 2: ta = 0
                if (1 - tb) * L2 < 2: tb = 1
                S.append([vi, i, round(ta, 3), round(tb, 3), bi]); mejor = w if mejor is None else max(mejor, w)
        if mejor: ancho = max(ancho * .8, mejor)
        # alto del tablero: sobre otra vía o el río, 6 m por nivel; puentes cortos sobre quebradas, 3 m
        alto = (6.0 * p['z']) if g.length > 24 or p['pe'] else 3.0
        B.append([1 if p['pe'] else 0, p['z'], round(ancho, 1), round(alto, 1)] + [round(v, 1) for xy in ba for v in xy])
    txt = ('/* Puentes vehiculares y peatonales del valle con su nivel (© colaboradores de OpenStreetMap, ODbL, vía Overture Maps: is_bridge y level),\n'
           '   enlazados con las calles del juego. Generado por tools/puentes_datos.py (no editar a mano). */\n'
           f'const PUENTES = {json.dumps({"v": 1, "B": B, "S": S}, separators=(",", ":"))};\n')
    open(os.path.join(ROOT, 'src/data/puentes.js'), 'w', encoding='utf8').write(txt)
    nv = sum(1 for b in B if b[0] == 0); npe = len(B) - nv
    print(f'puentes: {len(B)} ({nv} vehiculares, {npe} peatonales) · tramos de calle sobre puente: {len(S)} · {len(txt) // 1024} KB · {round(time.time() - t0)} s')


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == '--descargar': descargar(sys.argv[2])
    elif len(sys.argv) > 1: generar(sys.argv[1])
    else: print(__doc__)
