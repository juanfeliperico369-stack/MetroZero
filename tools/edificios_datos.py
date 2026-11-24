#!/usr/bin/env python3
"""Casas y edificios reales del Valle de Aburrá -> src/data/edificios.js

Cada casa y cada edificio con su huella real (posición, forma y orientación), sus pisos y su uso.

Fuentes (se citan en docs/FUENTES.md):
- Huellas: Overture Maps Foundation, tema buildings (release 2026-10-21.0), que reúne OpenStreetMap (ODbL),
  Microsoft ML Buildings (ODbL) y Google Open Buildings (CC BY 4.0 / ODbL). Son polígonos abiertos, no imágenes.
- Pisos: los oficiales de la capa 3DConstruccciones de la Subsecretaría de Catastro de Medellín (Popular, El Poblado
  y Robledo); los de OpenStreetMap (building:levels o height) donde existen; en el resto, estimados por zona y tamaño
  con las distribuciones medidas en esas tres comunas.
- Usos del suelo (campus, industria, hospitales, canchas, piscinas, pistas): Overture base/land_use y base/water (OSM, ODbL).

Uso:
  python3 tools/edificios_datos.py --descargar CARPETA   # baja las capas (duckdb; S3 público de Overture y ArcGIS)
  python3 tools/edificios_datos.py CARPETA --saneadas RUTA/motor-valle/salida/sanear [--corredores tools/cache/corredores.json]
        # (desde el Motor del Valle 1.3) las huellas saneadas, con la guarda contra el recorte del juego: edificios.js v2
  python3 tools/edificios_datos.py CARPETA               # (la forma antigua) las huellas crudas de Overture: edificios.js v1
Para que DuckDB lea el bucket público detrás de un proxy: env -u AWS_ACCESS_KEY_ID -u AWS_SECRET_ACCESS_KEY ...

Formato de src/data/edificios.js (una sola cadena base64 de deflate-raw):
  por región de 640 m (fila por fila), en el índice: número de edificios, bytes de posiciones y bytes de polígonos (varint);
  luego, por flujos: posiciones (centro en medios metros, deltas zigzag-varint en orden de Hilbert), medidas (medio frente
  y medio fondo en medios metros, uint8), ángulo (128 pasos en 180°, delta mod 128), pisos (uint8), uso (uint8: 4 bits de
  tipo, bit 16 polígono, bit 32 pisos oficiales, bit 64 pisos de OSM, bit 128 recortada por el saneamiento) y polígonos (n vértices
  y deltas zigzag-varint). v2 (Motor del Valle 1.3) suma al final el flujo zb (un byte por edificio: el zócalo) y «len» trae 8 largos;
  el lector de 11-edificios.js solo usa los seis primeros para ubicar los flujos y no lee los nuevos.
"""
import base64, json, math, os, re, sys, time, zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REL = 's3://overturemaps-us-west-2/release/2026-10-21.0'
ARCGIS = 'https://services1.arcgis.com/FZVaYraI7sEGQ6rF/arcgis/rest/services/3DConstruccciones/FeatureServer/0'
R = 640.0            # región del motor de ciudad (VC.R)
Q = 2.0              # medios metros
KINDS = ['casa', 'edificio', 'torre', 'nave', 'educativo', 'salud', 'iglesia', 'civico', 'comercio', 'deporte', 'techo', 'invernadero', 'tanque', 'transporte', 'parqueadero', 'rural']
K = {k: i for i, k in enumerate(KINDS)}


def meta():
    s = open(os.path.join(ROOT, 'src/data/valle.js'), encoding='utf8').read()
    i = s.index('VALLE_META'); j = s.index('{', i); d = 0
    for k in range(j, len(s)):
        d += s[k] == '{'; d -= s[k] == '}'
        if d == 0: break
    M = json.loads(s[j:k + 1])
    b = re.search(r'VALLE_BIN\s*=\s*"([^"]+)"', s) or re.search(r"VALLE_BIN\s*=\s*'([^']+)'", s)
    raw = zlib.decompress(base64.b64decode(b.group(1)), -15)
    nT, nE, nM = M['W'] * M['H'], M['eW'] * M['eH'], M['mW'] * M['mH']
    M['_mu'] = raw[nT + nE * 2: nT + nE * 2 + nM]; M['_co'] = raw[nT + nE * 2 + nM: nT + nE * 2 + nM * 2]
    return M


def descargar(C):
    import duckdb, subprocess
    os.makedirs(C, exist_ok=True)
    M = meta(); TM = M['tile']
    BB = (M['lon0'], M['lon0'] + M['W'] / M['kx'], M['latN'] - M['H'] / M['ky'], M['latN'])
    c = duckdb.connect(); c.execute('INSTALL httpfs; LOAD httpfs; INSTALL spatial; LOAD spatial;')
    px = os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy')
    if px: c.execute(f"SET http_proxy='{re.sub(r'^https?://', '', px).rstrip('/')}'")
    if os.path.exists('/root/.ccr/ca-bundle.crt'): c.execute("SET ca_cert_file='/root/.ccr/ca-bundle.crt'")
    c.execute("SET s3_region='us-west-2'; SET http_timeout=120000; CREATE SECRET anon (TYPE s3, KEY_ID '', SECRET '', REGION 'us-west-2')")
    dentro = f'bbox.xmax > {BB[0]} AND bbox.xmin < {BB[1]} AND bbox.ymax > {BB[2]} AND bbox.ymin < {BB[3]}'
    pedidos = {
        'edificios': f"SELECT id, sources[1].dataset AS src, subtype, class, height, num_floors, names.primary AS name, ST_AsWKB(geometry) AS wkb FROM read_parquet('{REL}/theme=buildings/type=building/*', hive_partitioning=1) WHERE {dentro}",
        'uso': f"SELECT id, subtype, class, names.primary AS name, ST_AsWKB(geometry) AS wkb FROM read_parquet('{REL}/theme=base/type=land_use/*', hive_partitioning=1) WHERE {dentro}",
        'agua': f"SELECT id, subtype, class, names.primary AS name, ST_AsWKB(geometry) AS wkb FROM read_parquet('{REL}/theme=base/type=water/*', hive_partitioning=1) WHERE {dentro} AND class IN ('swimming_pool', 'reflecting_pool', 'fountain')",
    }
    for nom, sql in pedidos.items():
        f = os.path.join(C, nom + '.parquet')
        if os.path.exists(f): print('ya está', nom); continue
        t = time.time(); c.execute(f"COPY ({sql}) TO '{f}' (FORMAT PARQUET)")
        print(nom, c.execute(f"select count(*) from '{f}'").fetchone()[0], round(time.time() - t), 's', flush=True)
    f = os.path.join(C, 'construcciones3d.json')
    if not os.path.exists(f):
        subprocess.run([sys.executable, '-c', ARC_PY, ARCGIS, 'numero_pis,altura,nombre_com', f], check=True)


ARC_PY = r'''
import json, sys, time, urllib.request, urllib.parse
url, campos, dst = sys.argv[1:4]; UA = {'User-Agent': 'ElMetro-datos/1.2 (juego educativo offline)'}
def get(u):
    for k in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=180) as r: return json.loads(r.read())
        except Exception as e: print('  reintento', k + 1, e); time.sleep(4 * (k + 1))
    raise SystemExit('falló ' + u)
feats, o = [], 0
while True:
    q = {'where': '1=1', 'outFields': campos, 'returnGeometry': 'true', 'outSR': '4326', 'resultOffset': o, 'resultRecordCount': 2000, 'f': 'geojson', 'geometryPrecision': '7'}
    d = get(url + '/query?' + urllib.parse.urlencode(q)); fs = d.get('features', []); feats += fs
    if not fs or (not (d.get('exceededTransferLimit') or (d.get('properties') or {}).get('exceededTransferLimit')) and len(fs) < 2000): break
    o += len(fs); time.sleep(.4)
json.dump({'fuente': url, 'features': feats}, open(dst, 'w')); print('construcciones oficiales', len(feats))
'''

# ---------- pisos estimados: cuantiles por zona y tamaño de la huella (m²) ----------
# Popular, El Poblado y Robledo: medidos uniendo las huellas con la capa oficial (ver --medir); el resto, por fotos y OSM.
BINS = [60, 120, 250, 500, 1000, 1e12]
QS = [0, .25, .5, .75, .9, .97, 1]
TIPO = {   # cuantiles de pisos en QS, por rango de área
    'ladera':  [[1, 2, 2, 3, 3, 4, 5], [1, 2, 2, 3, 3, 4, 5], [1, 2, 3, 3, 4, 4, 5], [1, 2, 3, 4, 4, 5, 6], [2, 3, 3, 4, 4, 5, 6], [1, 2, 3, 4, 5, 6, 8]],
    'mixto':   [[1, 2, 2, 3, 4, 5, 6], [1, 2, 2, 4, 5, 6, 8], [1, 2, 2, 4, 6, 9, 12], [1, 2, 4, 5, 10, 16, 20], [1, 2, 4, 5, 7, 12, 16], [1, 3, 4, 8, 12, 16, 20]],
    'poblado': [[1, 1, 2, 2, 4, 7, 10], [1, 2, 3, 4, 5, 7, 10], [1, 2, 3, 4, 6, 12, 18], [1, 2, 2, 7, 13, 22, 28], [1, 2, 5, 13, 22, 28, 32], [1, 2, 3, 8, 16, 24, 30]],
    'laureles': [[1, 2, 2, 3, 3, 4, 5], [1, 2, 2, 3, 4, 5, 6], [2, 2, 3, 4, 6, 8, 10], [2, 3, 4, 6, 9, 12, 16], [2, 4, 6, 8, 12, 16, 20], [2, 3, 5, 8, 12, 18, 24]],
    'centro':  [[1, 2, 2, 3, 4, 5, 6], [2, 2, 3, 4, 5, 7, 9], [2, 3, 4, 5, 8, 11, 15], [2, 3, 5, 7, 10, 15, 22], [2, 4, 6, 9, 14, 20, 30], [2, 3, 5, 8, 14, 22, 36]],
    'pueblo':  [[1, 1, 1, 2, 2, 3, 3], [1, 1, 2, 2, 3, 3, 4], [1, 1, 2, 2, 3, 4, 5], [1, 2, 2, 3, 4, 5, 8], [1, 2, 2, 3, 4, 6, 10], [1, 1, 2, 3, 4, 6, 10]],
}
# comuna o municipio -> tipo de zona (lo que muestran las fotos aéreas)
ZONA_COMUNA = {1: 'ladera', 2: 'ladera', 3: 'ladera', 4: 'mixto', 5: 'mixto', 6: 'ladera', 7: 'mixto', 8: 'ladera', 9: 'ladera', 10: 'centro', 11: 'laureles', 12: 'laureles',
               13: 'ladera', 14: 'poblado', 15: 'mixto', 16: 'laureles', 17: 'pueblo', 18: 'mixto', 19: 'pueblo', 20: 'pueblo', 21: 'pueblo'}
ZONA_MUNI = {'Medellín': 'mixto', 'Bello': 'mixto', 'Itagüí': 'mixto', 'Envigado': 'poblado', 'Sabaneta': 'poblado', 'La Estrella': 'mixto', 'Caldas': 'pueblo',
             'Copacabana': 'mixto', 'Girardota': 'pueblo', 'Barbosa': 'pueblo'}


def h01(x, y, s):
    v = (int(x * 7.3) * 73856093 ^ int(y * 5.9) * 19349663 ^ s * 83492791) & 0xffffffff
    v = (v ^ (v >> 13)) * 1274126177 & 0xffffffff
    return ((v ^ (v >> 16)) & 0xffffff) / 0x1000000


def cuantil(tabla, u):
    for i in range(1, len(QS)):
        if u <= QS[i]:
            a, b = tabla[i - 1], tabla[i]; t = (u - QS[i - 1]) / (QS[i] - QS[i - 1]); return a + (b - a) * t
    return tabla[-1]


def hilbert(x, y, n=2048):
    d, s = 0, n // 2
    while s > 0:
        rx = 1 if (x & s) else 0; ry = 1 if (y & s) else 0; d += s * s * ((3 * rx) ^ ry)
        if ry == 0:
            if rx == 1: x, y = s - 1 - x, s - 1 - y
            x, y = y, x
        s //= 2
    return d


def varint(v, out):
    v = ((v << 1) ^ (v >> 63)) & ((1 << 64) - 1)   # zigzag
    while True:
        b = v & 127; v >>= 7
        if v: out.append(b | 128)
        else: out.append(b); return


def uvarint(v, out):
    while True:
        b = v & 127; v >>= 7
        if v: out.append(b | 128)
        else: out.append(b); return


def atributos(C, M, TM, proj, rd, G, A, ct, cls, nfl, hgt):
    """hitos (lo que va debajo se quita), pisos (oficial > OSM > estimado), uso del suelo, zona y tipo de cada edificio"""
    import numpy as np, shapely
    from shapely import STRtree
    # hitos: sus edificios los dibuja el motor de arquitectura icónica
    s = open(os.path.join(ROOT, 'src/data/hitos.js'), encoding='utf8').read(); HT = json.loads(s[s.index('['):s.rindex(']') + 1])
    hp = [shapely.Polygon(np.array(P).reshape(-1, 2)) for h in HT for P in h['P'] if len(P) >= 6]
    hp = [shapely.make_valid(p) for p in hp]; tr = STRtree(hp)
    bi, hi = tr.query(G.astype(object), predicate='intersects'); quita = np.zeros(len(G), bool)
    if len(bi):
        inter = shapely.area(shapely.intersection(G[bi].astype(object), np.array(hp, dtype=object)[hi]))
        np.logical_or.at(quita, bi, inter >= .3 * A[bi])
    print('bajo los hitos (se quitan):', int(quita.sum()))

    # pisos oficiales (Popular, El Poblado, Robledo)
    pis_of = np.zeros(len(G))
    fo = os.path.join(C, 'construcciones3d.json')
    if os.path.exists(fo):
        F = json.load(open(fo))['features']
        OG = shapely.make_valid(shapely.transform(np.array([shapely.geometry.shape(f['geometry']) if f['geometry'] else shapely.Point(0, 0) for f in F], dtype=object), proj))
        OP = np.array([f['properties'].get('numero_pis') or 0 for f in F], float)
        ib, io = STRtree(OG).query(G.astype(object), predicate='intersects')
        inter = shapely.area(shapely.intersection(G[ib].astype(object), OG[io])); oa = shapely.area(OG); cov = np.zeros(len(G))
        okp = (inter >= .2 * A[ib]) | (inter >= .6 * oa[io]); np.maximum.at(pis_of, ib[okp], OP[io[okp]]); np.add.at(cov, ib, inter)
        pis_of[cov < .3 * A] = 0
        print('con pisos oficiales:', int((pis_of > 0).sum()))

    # usos del suelo que contienen cada edificio
    U = rd('uso.parquet', ['subtype', 'class', 'name', 'wkb'])
    UG = shapely.make_valid(shapely.transform(shapely.from_wkb(U['wkb']), proj))
    usok = {'industrial': 'nave', 'works': 'nave', 'school': 'educativo', 'college': 'educativo', 'university': 'educativo', 'kindergarten': 'educativo',
            'hospital': 'salud', 'clinic': 'salud', 'religious': 'iglesia', 'retail': 'comercio', 'commercial': 'comercio', 'stadium': 'deporte', 'military': 'civico',
            'farmland': 'rural', 'farmyard': 'rural', 'meadow': 'rural', 'orchard': 'rural', 'greenhouse_horticulture': 'invernadero'}
    ui = [i for i, c in enumerate(U['class']) if c in usok and UG[i].geom_type in ('Polygon', 'MultiPolygon')]
    uso = np.array([''] * len(G), dtype=object)
    if ui:
        UGs = UG[ui]; ib, io = STRtree(UGs).query(shapely.points(ct), predicate='within')
        for b, o in zip(ib, io): uso[b] = usok[U['class'][ui[o]]]

    # zona de cada edificio (comuna o municipio) por la grilla de 160 m del mapa
    CL = 8 * TM; mx = np.clip((ct[:, 0] // CL).astype(int), 0, M['mW'] - 1); my = np.clip((ct[:, 1] // CL).astype(int), 0, M['mH'] - 1)
    co = np.frombuffer(M['_co'], np.uint8)[my * M['mW'] + mx]; mu = np.frombuffer(M['_mu'], np.uint8)[my * M['mW'] + mx]
    munis = M['munis']
    zona = np.array([ZONA_COMUNA.get(int(c), 'mixto') if c else ZONA_MUNI.get(munis[m - 1] if m else '', 'pueblo') for c, m in zip(co, mu)], dtype=object)

    # pisos: oficial > OSM > estimado
    pis = np.where(pis_of > 0, pis_of, np.where(nfl > 0, nfl, np.where(hgt > 0, np.round(hgt / 3), 0)))
    fuente = np.where(pis_of > 0, 32, np.where((nfl > 0) | (hgt > 0), 64, 0))
    ab = np.searchsorted(BINS, A, side='right'); ab = np.minimum(ab, len(BINS) - 1)
    for i in np.nonzero(pis <= 0)[0]:
        z = zona[i]; c = cls[i]
        if z == 'ladera' and A[i] > 1500: z = 'mixto'
        tab = TIPO[z][ab[i]]; u = h01(ct[i, 0], ct[i, 1], 7); p = cuantil(tab, u)
        if uso[i] in ('nave', 'invernadero') or c in ('industrial', 'warehouse', 'greenhouse', 'shed', 'roof', 'shelter', 'carport', 'garage', 'garages', 'hangar'): p = min(p, 2 if A[i] < 4000 else 3)
        elif uso[i] == 'rural' or c in ('farm', 'farm_auxiliary', 'barn', 'stable', 'cabin', 'hut'): p = min(p, 2)
        elif c in ('church', 'chapel', 'cathedral', 'temple', 'religious'): p = 3 if A[i] < 400 else 5
        elif uso[i] in ('educativo', 'salud') and A[i] > 300: p = max(2, min(p, 6))
        elif c in ('house', 'detached', 'semidetached_house', 'terrace', 'bungalow'): p = min(p, 3)
        pis[i] = max(1, round(p))
    pis = np.clip(pis, 1, 60).astype(int)

    # uso del edificio
    CK = {'house': 'casa', 'detached': 'casa', 'semidetached_house': 'casa', 'terrace': 'casa', 'bungalow': 'casa', 'residential': None, 'apartments': None,
          'commercial': 'comercio', 'retail': 'comercio', 'office': 'comercio', 'supermarket': 'comercio', 'hotel': 'comercio', 'kiosk': 'comercio',
          'industrial': 'nave', 'warehouse': 'nave', 'manufacture': 'nave', 'factory': 'nave', 'hangar': 'nave',
          'school': 'educativo', 'university': 'educativo', 'college': 'educativo', 'kindergarten': 'educativo', 'library': 'educativo',
          'hospital': 'salud', 'clinic': 'salud', 'church': 'iglesia', 'chapel': 'iglesia', 'cathedral': 'iglesia', 'temple': 'iglesia', 'religious': 'iglesia', 'mosque': 'iglesia', 'monastery': 'iglesia',
          'civic': 'civico', 'public': 'civico', 'government': 'civico', 'fire_station': 'civico', 'police': 'civico', 'military': 'civico', 'prison': 'civico', 'townhall': 'civico',
          'stadium': 'deporte', 'grandstand': 'deporte', 'sports_hall': 'deporte', 'sports_centre': 'deporte', 'pavilion': 'deporte',
          'roof': 'techo', 'shelter': 'techo', 'carport': 'techo', 'canopy': 'techo', 'greenhouse': 'invernadero', 'storage_tank': 'tanque', 'silo': 'tanque',
          'train_station': 'transporte', 'transportation': 'transporte', 'garage': 'parqueadero', 'garages': 'parqueadero', 'parking': 'parqueadero',
          'farm': 'rural', 'farm_auxiliary': 'rural', 'barn': 'rural', 'stable': 'rural', 'shed': 'rural', 'cabin': 'rural', 'hut': 'rural', 'cowshed': 'rural'}
    kind = np.zeros(len(G), np.uint8)
    for i in range(len(G)):
        k = CK.get(cls[i])
        if not k and uso[i] and uso[i] != 'rural': k = uso[i] if (uso[i] != 'nave' or A[i] >= 250 or pis[i] <= 2) and (uso[i] != 'comercio' or A[i] >= 400) else None
        if k == 'nave' and pis[i] >= 5: k = 'edificio'
        if not k: k = 'torre' if pis[i] >= 10 else 'edificio' if pis[i] >= 4 else ('nave' if A[i] >= 2500 and pis[i] <= 3 else 'rural' if uso[i] == 'rural' and A[i] < 600 else 'casa')
        if k == 'casa' and pis[i] >= 4: k = 'edificio'
        if k == 'edificio' and pis[i] >= 10: k = 'torre'
        kind[i] = K[k]
    return quita, pis, fuente, kind, uso, zona, U, UG


def generar(C):
    import numpy as np, pyarrow.parquet as pq, shapely
    from shapely import STRtree
    t0 = time.time(); M = meta(); TM = M['tile']; W, H = M['W'] * TM, M['H'] * TM
    proj = lambda c: np.column_stack([(c[:, 0] - M['lon0']) * M['kx'] * TM, (M['latN'] - c[:, 1]) * M['ky'] * TM])
    rd = lambda f, cols: pq.read_table(os.path.join(C, f), columns=cols).to_pydict()
    T = rd('edificios.parquet', ['src', 'class', 'num_floors', 'height', 'wkb'])
    G = shapely.make_valid(shapely.transform(shapely.from_wkb(T['wkb']), proj))
    # un multipolígono de make_valid se queda con su parte mayor
    def mayor(g):
        if g.geom_type == 'Polygon': return g
        ps = [p for p in getattr(g, 'geoms', []) if p.geom_type == 'Polygon']
        return max(ps, key=lambda p: p.area) if ps else None
    G = np.array([mayor(g) for g in G], dtype=object); ok = np.array([g is not None for g in G])
    A = np.zeros(len(G)); A[ok] = shapely.area(G[ok].astype(object))
    ct = np.zeros((len(G), 2)); ct[ok] = shapely.get_coordinates(shapely.centroid(G[ok].astype(object)))
    ok &= (A >= 12) & (ct[:, 0] > 0) & (ct[:, 1] > 0) & (ct[:, 0] < W) & (ct[:, 1] < H)
    idx = np.nonzero(ok)[0]; G = G[idx]; A = A[idx]; ct = ct[idx]
    cls = np.array([T['class'][i] or '' for i in idx]); src = np.array([T['src'][i] or '' for i in idx])
    nfl = np.array([T['num_floors'][i] if T['num_floors'][i] is not None else -1 for i in idx], float)
    hgt = np.array([T['height'][i] if T['height'][i] is not None else -1 for i in idx], float)
    print('huellas en el mapa (>= 12 m²):', len(G), round(time.time() - t0, 1), 's', flush=True)

    quita, pis, fuente, kind, uso, zona, U, UG = atributos(C, M, TM, proj, rd, G, A, ct, cls, nfl, hgt)

    # geometría: rectángulo orientado si la forma es casi rectangular; si no, polígono simplificado
    O = shapely.oriented_envelope(G.astype(object)); rect = A / np.maximum(shapely.area(O), 1e-6)
    co4 = shapely.get_coordinates(O).reshape(-1, 5, 2)[:, :4]; e1 = co4[:, 1] - co4[:, 0]; e2 = co4[:, 2] - co4[:, 1]
    L1 = np.hypot(e1[:, 0], e1[:, 1]); L2 = np.hypot(e2[:, 0], e2[:, 1]); larga = L1 >= L2
    ang = np.where(larga, np.arctan2(e1[:, 1], e1[:, 0]), np.arctan2(e2[:, 1], e2[:, 0])) % math.pi
    LW = np.maximum(L1, L2); LD = np.minimum(L1, L2); oc = co4.mean(1)
    esPol = ((rect < .78) & (A >= 90)) | (LW / 2 * Q > 255) | (LD / 2 * Q > 255)
    keep = ~quita
    print('polígonos:', int((esPol & keep).sum()), '· rectángulos:', int((~esPol & keep).sum()), flush=True)

    # codificación por regiones de 640 m
    nx, ny = int(math.ceil(W / R)), int(math.ceil(H / R))
    cx = np.where(esPol, ct[:, 0], oc[:, 0]); cy = np.where(esPol, ct[:, 1], oc[:, 1])
    rx = np.clip((cx // R).astype(int), 0, nx - 1); ry = np.clip((cy // R).astype(int), 0, ny - 1)
    X = np.clip(np.round((cx - rx * R) * Q).astype(int), 0, 2047); Y = np.clip(np.round((cy - ry * R) * Q).astype(int), 0, 2047)
    hk = np.array([hilbert(int(x), int(y)) for x, y in zip(X, Y)])
    reg = ry * nx + rx; orden = np.lexsort((hk, reg)); orden = orden[keep[orden]]
    pos, dim, an, pi_, ki, pol = bytearray(), bytearray(), bytearray(), bytearray(), bytearray(), bytearray()
    cnt = np.zeros(nx * ny, int); pb = np.zeros(nx * ny, int); qb = np.zeros(nx * ny, int)
    last = -1; px = py = pa = 0; npol = 0
    for i in orden:
        r = reg[i]
        if r != last: last = r; px = py = pa = 0
        p0, q0 = len(pos), len(pol)
        varint(int(X[i]) - px, pos); varint(int(Y[i]) - py, pos); px, py = int(X[i]), int(Y[i])
        dim.append(min(255, int(math.ceil(LW[i] / 2 * Q)))); dim.append(min(255, int(math.ceil(LD[i] / 2 * Q))))
        a = int(ang[i] / math.pi * 128) % 128; an.append((a - pa) % 128); pa = a
        pi_.append(int(pis[i])); fl = int(kind[i]) | int(fuente[i])
        if esPol[i]:
            g = G[i].simplify(1.0, preserve_topology=True)
            if g.geom_type != 'Polygon' or g.is_empty: g = G[i]
            ex = np.asarray(g.exterior.coords)[:-1]
            if len(ex) > 32: ex = np.asarray(G[i].simplify(2.0, preserve_topology=True).exterior.coords)[:-1]
            if 3 <= len(ex) <= 120:
                fl |= 16; npol += 1; uvarint(len(ex), pol); qx, qy = px, py
                for vx, vy in ex:
                    jx = int(round((vx - rx[i] * R) * Q)); jy = int(round((vy - ry[i] * R) * Q)); varint(jx - qx, pol); varint(jy - qy, pol); qx, qy = jx, jy
        ki.append(fl)
        cnt[r] += 1; pb[r] += len(pos) - p0; qb[r] += len(pol) - q0
    idxb = bytearray()
    for r in range(nx * ny): uvarint(int(cnt[r]), idxb); uvarint(int(pb[r]), idxb); uvarint(int(qb[r]), idxb)
    flujos = [idxb, pos, dim, an, pi_, ki, pol]; todo = b''.join(bytes(f) for f in flujos)
    z = zlib.compressobj(9, zlib.DEFLATED, -15); comp = z.compress(todo) + z.flush()
    n = int(cnt.sum())

    # suelos: canchas, pistas, piscinas y campus (nombre y polígono simplificado para el rótulo y el prado)
    suelos = {'cancha': [], 'pista': [], 'piscina': [], 'campus': []}
    def obb(g):
        o = shapely.oriented_envelope(g); c4 = np.asarray(o.exterior.coords)[:4]; a1 = c4[1] - c4[0]; a2 = c4[2] - c4[1]; l1, l2 = math.hypot(*a1), math.hypot(*a2)
        if l1 < l2: a1, l1, l2 = a2, l2, l1
        c = c4.mean(0); return [round(c[0], 1), round(c[1], 1), round(l1 / 2, 1), round(l2 / 2, 1), round(math.atan2(a1[1], a1[0]) % math.pi, 3)]
    for i, c in enumerate(U['class']):
        g = mayor(UG[i]) if UG[i].geom_type != 'Polygon' else UG[i]
        if g is None or g.is_empty: continue
        x, y = g.centroid.x, g.centroid.y
        if not (0 < x < W and 0 < y < H): continue
        if c == 'pitch' and g.area >= 80: suelos['cancha'].append(obb(g) + [round(g.area / max(1, shapely.oriented_envelope(g).area), 2)])
        elif c == 'track' and g.area >= 400: suelos['pista'].append(obb(g))
        elif c in ('university', 'college') and g.area >= 4000 and U['name'][i]:
            gs = g.simplify(3); ex = np.asarray(gs.exterior.coords)[:-1].round(1).ravel().tolist()
            suelos['campus'].append({'n': U['name'][i], 'x': round(x, 1), 'y': round(y, 1), 'P': ex})
    Wd = rd('agua.parquet', ['class', 'wkb'])
    for c, w in zip(Wd['class'], Wd['wkb']):
        if c != 'swimming_pool': continue
        g = mayor(shapely.make_valid(shapely.transform(shapely.from_wkb(w), proj)))
        if g is None or g.area < 12: continue
        x, y = g.centroid.x, g.centroid.y
        if 0 < x < W and 0 < y < H: suelos['piscina'].append(obb(g))
    stats = {'edificios': n, 'poligonos': npol, 'oficiales': int(((fuente == 32) & keep).sum()), 'osm': int(((fuente == 64) & keep).sum()),
             'por_uso': {KINDS[k]: int(((kind == k) & keep).sum()) for k in range(len(KINDS))},
             'por_fuente': {s_: int(((src == s_) & keep).sum()) for s_ in sorted(set(src))},
             'pisos_medios_por_zona': {z_: round(float(pis[(zona == z_) & keep].mean()), 2) for z_ in TIPO if ((zona == z_) & keep).any()},
             'suelos': {k: len(v) for k, v in suelos.items()}, 'bytes': {'crudo': len(todo), 'deflate': len(comp)}}
    txt = ('/* Casas y edificios reales del Valle de Aburrá: huella (posición, forma y orientación), pisos y uso. Generado por tools/edificios_datos.py (no editar a mano).\n'
           '   Huellas: Overture Maps Foundation (OpenStreetMap, ODbL; Microsoft ML Buildings, ODbL; Google Open Buildings, CC BY 4.0 / ODbL).\n'
           '   Pisos: Subsecretaría de Catastro de Medellín, capa 3DConstruccciones (Popular, El Poblado y Robledo; www.medellin.gov.co/geomedellin);\n'
           '   OpenStreetMap donde existen; en el resto, estimados por zona y tamaño. Usos del suelo, canchas y piscinas: Overture (OpenStreetMap, ODbL). */\n'
           f'const EDIFICIOS = {json.dumps({"v": 1, "R": R, "nx": nx, "ny": ny, "n": n, "Q": Q, "kinds": KINDS, "len": [len(f) for f in flujos], "raw": len(todo)})};\n'
           f'EDIFICIOS.data = "{base64.b64encode(comp).decode()}";\n'
           f'const SUELOS = {json.dumps(suelos, ensure_ascii=False, separators=(",", ":"))};\n')
    open(os.path.join(ROOT, 'src/data/edificios.js'), 'w', encoding='utf8').write(txt)
    json.dump(stats, open(os.path.join(ROOT, 'docs/auditorias/edificios.json'), 'w'), ensure_ascii=False, indent=1)
    print(json.dumps(stats, ensure_ascii=False)); print('src/data/edificios.js', round(len(txt) / 1e6, 2), 'MB ·', round(time.time() - t0), 's')


try:
    import zopfli.zopfli as _zopfli
    COMPRESOR = 'zopfli (deflate estándar)'
except ImportError:
    _zopfli = None; COMPRESOR = 'zlib 9'
def desinflar(b):
    """deflate crudo (el que leen DecompressionStream('deflate-raw') e inflateRaw): con zopfli si está instalado (pip install zopfli),
       que da el mismo formato unos 4 % más chico; si no, con zlib"""
    if _zopfli is not None:
        z = _zopfli.compress(bytes(b), gzip_mode=0, numiterations=15)[2:-4]
        assert zlib.decompress(z, -15) == bytes(b); return z
    c = zlib.compressobj(9, zlib.DEFLATED, -15); return c.compress(bytes(b)) + c.flush()


# ======================================================================================================================
# Motor del Valle 1.3 · huellas SANEADAS (ley de soberanía vial, motor-valle/geo/sanear.py) y guarda contra el recorte del juego
# ======================================================================================================================
F_EXT = 1 / math.cos(1.5 * math.pi / 32)   # el búfer de shapely (8 segmentos por cuarto; GEOS redondea los de cada arco, hasta 1,5 veces más abiertos) queda por fuera del círculo de verdad
TOL_POL = .55                        # el juego mira medio metro alrededor de un polígono (11-edificios.js · enPol(..., .5)); 5 cm más


def vias_juego():
    """las vías de src/data/vias.js tal como las lee el juego (11-ciudad2.js · init): [(k, ancho, puntos en metros)]"""
    import numpy as np
    s = open(os.path.join(ROOT, 'src/data/vias.js'), encoding='utf8').read(); V = json.loads(re.search(r'const VIAS = (\{.*\});', s, re.S).group(1))
    b = zlib.decompress(base64.b64decode(V['d']), -15); o = 0; px = py = 0; U = V['u']; out = []; DEFW = {1: 7, 2: 15, 3: 12, 4: 10, 5: 2.5, 6: 5, 7: 3}
    def rv():
        nonlocal o
        v = sh = 0
        while True:
            c = b[o]; o += 1; v += (c & 127) << sh; sh += 7
            if not c & 128: return v
    for _ in range(V['n']):
        k = rv(); nm = rv(); w2 = rv(); n = rv(); P = np.zeros((n, 2))
        for j in range(n):
            d = rv(); px += -(d + 1) // 2 if d % 2 else d // 2; d = rv(); py += -(d + 1) // 2 if d % 2 else d // 2; P[j] = (px * U, py * U)
        out.append((k, w2 / 2 or DEFW.get(k, 6), P))
    return out


def generar_saneadas(C, SAN, COR):
    """edificios.js v2 desde las huellas saneadas del Motor del Valle (motor-valle/salida/sanear/huellas.parquet):
       · cada edificio con su forma limpia (rectángulo o polígono) y sus atributos de siempre (pisos, uso, zona);
       · guarda: ya redondeado como lo lee el juego, ninguno pisa los corredores que el juego despeja (segsCelda: vías,
         Metroplús y tranvía; con medio metro alrededor de los polígonos), ni las ciclorrutas (regla A del autor), ni el agua;
         y ninguno tiene el centro en la calle o en un hito. Si alguno no pasa, se recorta exacto (y se marca con el bit 128);
       · flujos nuevos AL FINAL del binario (el lector de hoy solo usa los seis primeros de «len»): zócalo (zb).
       El lector de 11-edificios.js no cambia: usa los bits 1 a 64 del byte de uso; el 128 marca «recortado»."""
    import numpy as np, pyarrow.parquet as pq, shapely
    from shapely import STRtree
    t0 = time.time(); M = meta(); TM = M['tile']; W, H = M['W'] * TM, M['H'] * TM
    proj = lambda c: np.column_stack([(c[:, 0] - M['lon0']) * M['kx'] * TM, (M['latN'] - c[:, 1]) * M['ky'] * TM])
    rd = lambda f, cols: pq.read_table(os.path.join(C, f), columns=cols).to_pydict()
    T = pq.read_table(os.path.join(SAN, 'huellas.parquet')).to_pydict()
    G = np.array(shapely.from_wkb(T['wkb']), dtype=object); A = shapely.area(G); ct = np.column_stack([T['ax'], T['ay']])
    ok = (ct[:, 0] > 0) & (ct[:, 1] > 0) & (ct[:, 0] < W) & (ct[:, 1] < H) & (A >= 12)
    idx = np.nonzero(ok)[0]; G = G[idx]; A = A[idx]; ct = ct[idx]; N = len(G)
    col = lambda k, d: np.array([T[k][i] if T[k][i] is not None else d for i in idx])
    cls = np.array([T['class'][i] or '' for i in idx]); src = np.array([T['src'][i] or '' for i in idx])
    nfl = col('num_floors', -1).astype(float); hgt = col('height', -1).astype(float); nfl[np.isnan(nfl)] = -1; hgt[np.isnan(hgt)] = -1
    forma = col('forma', 0).astype(int); RX = np.column_stack([col(c, np.nan).astype(float) for c in ('rx', 'ry', 'rl', 'rw', 'ra')])
    recort = col('recortado', False).astype(bool); marc = col('marcado', False).astype(bool); area0 = col('area0', 0).astype(float)
    print('huellas saneadas en el mapa:', N, '· recortadas en el Motor del Valle:', int(recort.sum()), '· casas confiables marcadas:', int(marc.sum()), round(time.time() - t0, 1), 's', flush=True)
    quita, pis, fuente, kind, uso, zona, U, UG = atributos(C, M, TM, proj, rd, G, A, ct, cls, nfl, hgt)

    # ---------- los corredores que El Metro despeja (y los que añade la regla A: ciclorrutas; y el agua) ----------
    cor = json.load(open(COR, encoding='utf8'))
    pz0, pz5, pzk = [], [], []          # búfer exacto (r) y con la tolerancia de los polígonos (r + 0,55) · tipo (1-7, 20 metroplús, 21 tranvía, 30 agua)
    def trozos(P, paso=40.0):
        L = shapely.LineString(P); n = max(1, int(math.ceil(L.length / paso)))
        return [L] if n == 1 else [shapely.ops.substring(L, L.length * i / n, L.length * (i + 1) / n) for i in range(n)]
    import shapely.ops
    for k, w, P in vias_juego():
        if len(P) < 2 or not 1 <= k <= 7: continue
        r = max(1, w / 2 + (1.3 if k <= 4 else .3))
        for t in trozos(P): pz0.append(t.buffer(r * F_EXT, quad_segs=8)); pz5.append(t.buffer((r + TOL_POL) * F_EXT, quad_segs=8) if k != 5 else None); pzk.append(k)
    for l in cor['lineas']:
        P = np.array(l['pts'], float)
        if len(P) < 2: continue
        for t in trozos(P): pz0.append(t.buffer(l['r'] * F_EXT, quad_segs=8)); pz5.append(t.buffer((l['r'] + TOL_POL) * F_EXT, quad_segs=8)); pzk.append(20 if l['kind'] == 'brt' else 21)
    for w in pq.read_table(os.path.join(SAN, 'agua.parquet')).to_pydict()['wkb']: pz0.append(shapely.from_wkb(w)); pz5.append(None); pzk.append(30)
    pz0 = np.array(pz0, dtype=object); pzk = np.array(pzk); pz5 = np.array([q if q is not None else p for p, q in zip(pz0, pz5)], dtype=object)
    juego = (pzk <= 4) | (pzk == 6) | (pzk == 7) | (pzk == 20) | (pzk == 21)   # lo que mira el juego (segsCelda)
    T0, T5 = STRtree(pz0), STRtree(pz5)
    HT = [shapely.make_valid(shapely.Polygon(np.array(Q).reshape(-1, 2))) for h in cor['hitos'] for Q in h['P'] if len(Q) >= 6]; THT = STRtree(HT) if HT else None
    print('corredores de la guarda:', int(juego.sum()), 'trozos del juego ·', int((pzk == 5).sum()), 'de ciclorruta ·', int((pzk == 30).sum()), 'de agua ·', len(HT), 'huellas de hitos', round(time.time() - t0, 1), 's', flush=True)

    # ---------- forma de cada edificio (como hoy: rectángulo si es casi rectangular; las recortadas, lo que dijo el Motor del Valle) ----------
    O = shapely.oriented_envelope(G); rect = A / np.maximum(shapely.area(O), 1e-6)
    co4 = shapely.get_coordinates(O).reshape(-1, 5, 2)[:, :4]; e1 = co4[:, 1] - co4[:, 0]; e2 = co4[:, 2] - co4[:, 1]
    L1 = np.hypot(e1[:, 0], e1[:, 1]); L2 = np.hypot(e2[:, 0], e2[:, 1]); larga = L1 >= L2
    ang = np.where(larga, np.arctan2(e1[:, 1], e1[:, 0]), np.arctan2(e2[:, 1], e2[:, 0])) % math.pi
    LW = np.maximum(L1, L2); LD = np.minimum(L1, L2); oc = co4.mean(1)
    esPol = ((rect < .78) & (A >= 90)) | (LW / 2 * Q > 255) | (LD / 2 * Q > 255)
    esR = forma == 1
    esPol[esR] = False; oc[esR] = RX[esR, :2]; LW[esR] = 2 * RX[esR, 2]; LD[esR] = 2 * RX[esR, 3]; ang[esR] = RX[esR, 4]
    # lo recortado que no volvió a ser rectángulo (IoU >= 0,92 en el saneamiento) va como rectángulo si la huella limpia ocupa al
    # menos el 78 % de su rectángulo mínimo (la misma tolerancia que el juego usa desde la 1.2.0 para todas sus casas); si no, polígono
    rp = recort & ~esR
    esPol[rp] = ~((rect[rp] >= .78) & (LW[rp] / 2 * Q <= 255) & (LD[rp] / 2 * Q <= 255))
    nx, ny = int(math.ceil(W / R)), int(math.ceil(H / R))

    # ---------- cuantizar y decodificar exactamente como 11-edificios.js · edifDe ----------
    def region(x, y): return np.clip((x // R).astype(int), 0, nx - 1), np.clip((y // R).astype(int), 0, ny - 1)
    def rect_dec(rx, ry, X, Y, dA, dB, a):
        x = rx * R + X / Q; y = ry * R + Y / Q; hw = max(.5, dA / Q); hd = max(.5, dB / Q); an = (a + .5) * math.pi / 128; ux, uy = math.cos(an), math.sin(an)
        return shapely.Polygon([(x - ux * hw + uy * hd, y - uy * hw - ux * hd), (x + ux * hw + uy * hd, y + uy * hw - ux * hd), (x + ux * hw - uy * hd, y + uy * hw + ux * hd), (x - ux * hw - uy * hd, y - uy * hw + ux * hd)]), (x, y)
    def cuant_rect(cx, cy, hl, hw, an, modo):
        rx, ry = region(np.array([cx]), np.array([cy])); rx, ry = int(rx[0]), int(ry[0])
        X = int(min(2047, max(0, round((cx - rx * R) * Q)))); Y = int(min(2047, max(0, round((cy - ry * R) * Q))))
        f = math.ceil if modo == 'ceil' else math.floor if modo == 'floor' else round
        dA = int(min(255, max(1, f(hl * Q - 1e-9) if modo == 'ceil' else f(hl * Q)))); dB = int(min(255, max(1, f(hw * Q - 1e-9) if modo == 'ceil' else f(hw * Q))))
        a = int(an / math.pi * 128) % 128
        g, c = rect_dec(rx, ry, X, Y, dA, dB, a); return {'t': 'r', 'rx': rx, 'ry': ry, 'X': X, 'Y': Y, 'dA': dA, 'dB': dB, 'a': a, 'g': g, 'c': c}
    def cuant_pol(g, anc, hl, hw, an):
        ex = np.asarray(g.exterior.coords)[:-1]
        if len(ex) > 32: ex = np.asarray(g.simplify(1.0, preserve_topology=True).exterior.coords)[:-1]
        if not 3 <= len(ex) <= 120: return None
        rx, ry = region(np.array([anc[0]]), np.array([anc[1]])); rx, ry = int(rx[0]), int(ry[0])
        X = int(min(2047, max(0, round((anc[0] - rx * R) * Q)))); Y = int(min(2047, max(0, round((anc[1] - ry * R) * Q))))
        J = np.round((ex - [rx * R, ry * R]) * Q).astype(int); keep = np.ones(len(J), bool); keep[1:] = np.any(np.diff(J, axis=0) != 0, axis=1); J = J[keep]
        if len(J) >= 2 and (J[0] == J[-1]).all(): J = J[:-1]
        if len(J) < 3: return None
        P = shapely.make_valid(shapely.Polygon(J / Q + [rx * R, ry * R]))
        if P.geom_type != 'Polygon' or P.area < 1: return None
        return {'t': 'p', 'rx': rx, 'ry': ry, 'X': X, 'Y': Y, 'dA': int(min(255, math.ceil(hl * Q))), 'dB': int(min(255, math.ceil(hw * Q))), 'a': int(an / math.pi * 128) % 128,
                'J': J, 'g': P, 'c': (rx * R + X / Q, ry * R + Y / Q)}
    def libre(q):
        """¿el juego no lo tocaría? (y tampoco pisa ciclorrutas ni agua)"""
        g = q['g']; cxy = shapely.Point(q['c'])
        for j in T0.query(cxy):   # centro en la calle (11-edificios.js · libre): el juego lo quita
            if juego[j] and pz0[j].contains(cxy): return False
        if THT is not None and any(HT[j].contains(cxy) for j in THT.query(cxy)): return False
        if q['t'] == 'r':
            return not any(pz0[j].intersects(g) for j in T0.query(g))
        for j in T5.query(g):
            if (pz5[j] if juego[j] else pz0[j]).intersects(g): return False
        return True
    def anclar(g):
        c = g.centroid
        return (c.x, c.y) if g.contains(c) else tuple(g.point_on_surface().coords[0])

    # ---------- la guarda ----------
    Qs = [None] * N; malos = []
    for i in range(N):
        if quita[i]: continue
        if esPol[i]:
            q = cuant_pol(G[i], ct[i] if G[i].contains(shapely.Point(ct[i])) else anclar(G[i]), LW[i] / 2, LD[i] / 2, ang[i])
            if q is None: q = cuant_rect(oc[i, 0], oc[i, 1], LW[i] / 2, LD[i] / 2, ang[i], 'round')
        else: q = cuant_rect(oc[i, 0], oc[i, 1], LW[i] / 2, LD[i] / 2, ang[i], 'round' if esR[i] else 'ceil')
        Qs[i] = q
        if not libre(q): malos.append(i)
        if i % 100000 == 0: print('  guarda', i, 'de', N, '· no pasan', len(malos), round(time.time() - t0, 1), 's', flush=True)
    print('no pasan la guarda en el primer intento:', len(malos), '(confiables marcadas:', int(marc[malos].sum()) if malos else 0, ')', flush=True)
    fix = np.zeros(N, bool); fuera = 0; quitadas = []
    def encoger(cx, cy, hl, hw, an, Mg):
        ux, uy = math.cos(an), math.sin(an); a0, a1, d0, d1 = -hl, hl, -hw, hw
        for _ in range(12):
            mx, my = cx + ux * (a0 + a1) / 2 - uy * (d0 + d1) / 2, cy + uy * (a0 + a1) / 2 + ux * (d0 + d1) / 2
            hl2, hw2 = (a1 - a0) / 2, (d1 - d0) / 2
            Rg = shapely.Polygon([(mx - ux * hl2 + uy * hw2, my - uy * hl2 - ux * hw2), (mx + ux * hl2 + uy * hw2, my + uy * hl2 - ux * hw2), (mx + ux * hl2 - uy * hw2, my + uy * hl2 + ux * hw2), (mx - ux * hl2 - uy * hw2, my - uy * hl2 + ux * hw2)])
            I = Rg.intersection(Mg)
            if I.area < 1e-6: return mx, my, hl2, hw2
            qc = shapely.get_coordinates(I); dx = qc[:, 0] - cx; dy = qc[:, 1] - cy; a = dx * ux + dy * uy; d = -dx * uy + dy * ux
            op = [(a.max() + .02, a1, d0, d1), (a0, a.min() - .02, d0, d1), (a0, a1, d.max() + .02, d1), (a0, a1, d0, d.min() - .02)]
            op = [o for o in op if o[1] - o[0] >= 1.5 and o[3] - o[2] >= 1.5]
            if not op: return None
            a0, a1, d0, d1 = max(op, key=lambda o: (o[1] - o[0]) * (o[3] - o[2]))
        return None
    for i in malos:
        q = Qs[i]; base = q['g'] if q['t'] == 'p' else (G[i] if esPol[i] else q['g']); hecho = None
        amin = min(16, .9 * A[i]) if A[i] >= 12 else 12   # como en el saneamiento: ni restos de menos de 16 m² ni casas chicas apenas rozadas
        for intento in range(5):
            marg = .1 + .25 * intento
            near0 = T0.query(base.buffer(2 + marg)); M0 = shapely.union_all([pz0[j] for j in near0]) if len(near0) else shapely.Polygon()
            # rectángulo: el más grande con el eje de la casa que no toca nada (con un margen que crece por el redondeo);
            # sirve si se parece a la huella (IoU >= 0,8): un rectángulo no necesita el medio metro que el juego mira alrededor de un polígono
            r = encoger(oc[i, 0], oc[i, 1], LW[i] / 2, LD[i] / 2, ang[i], M0.buffer(marg) if marg > 0 else M0)
            if r is not None:
                q2 = cuant_rect(r[0], r[1], r[2], r[3], ang[i], 'floor'); gi = q2['g'].intersection(G[i]).area; iou = gi / max(q2['g'].area + A[i] - gi, 1e-9)
                if q2['g'].area >= amin and (not esPol[i] or iou >= .8) and libre(q2): hecho = q2; break
            # polígono: la huella menos los corredores (con la tolerancia del juego) y el redondeo de medio metro
            near5 = T5.query(base.buffer(3 + marg))
            Mp = shapely.union_all([pz5[j] if juego[j] else pz0[j] for j in near5]) if len(near5) else shapely.Polygon()
            g2 = shapely.difference(G[i] if esPol[i] else base, Mp.buffer(.36 + marg))
            ps = [p for p in (g2.geoms if hasattr(g2, 'geoms') else [g2]) if p.geom_type == 'Polygon' and p.area >= amin]
            if not ps: break
            p = max(ps, key=lambda p: p.area).simplify(.3, preserve_topology=True)
            if p.is_empty or p.geom_type != 'Polygon': break
            o = shapely.oriented_envelope(p); c4 = np.asarray(o.exterior.coords)[:4]; ea, eb = c4[1] - c4[0], c4[2] - c4[1]; la, lb = math.hypot(*ea), math.hypot(*eb)
            if la < lb: ea, la, lb = eb, lb, la
            q2 = cuant_pol(p, anclar(p), la / 2, lb / 2, math.atan2(ea[1], ea[0]) % math.pi)
            if q2 is not None and libre(q2): hecho = q2; break
        if hecho is None: quita[i] = True; fuera += 1; quitadas.append((A[i], bool(marc[i]), bool(recort[i]), src[i])); continue
        Qs[i] = hecho; fix[i] = True
    # una recortada que, ya redondeada como la lee el juego, queda de menos de 12 m² es un resto (el mínimo de El Metro): se prueba con
    # las medidas redondeadas al medio metro más cercano (no hacia abajo) y, si tampoco alcanza o ya no pasa la guarda, se quita
    chicos = 0
    for i in range(N):
        if quita[i] or not (recort[i] or fix[i]) or Qs[i]['g'].area >= 12: continue
        q = Qs[i]
        if q['t'] == 'r':
            g0 = q['g']; o = shapely.oriented_envelope(g0); c4 = np.asarray(o.exterior.coords)[:4]; ea, eb = c4[1] - c4[0], c4[2] - c4[1]; la, lb = math.hypot(*ea), math.hypot(*eb)
            if la < lb: ea, la, lb = eb, lb, la
            q2 = cuant_rect(g0.centroid.x, g0.centroid.y, la / 2 + .2, lb / 2 + .2, (q['a'] + .5) * math.pi / 128, 'round')
            if q2['g'].area >= 12 and libre(q2): Qs[i] = q2; continue
        quita[i] = True; chicos += 1; fuera += 1; quitadas.append((A[i], bool(marc[i]), bool(recort[i]), src[i]))
    print('arregladas por la guarda:', int(fix.sum()), '(confiables marcadas:', int((fix & marc).sum()), ') · quitadas:', fuera, '(de ellas, restos de menos de 12 m² al redondear:', chicos, ')', round(time.time() - t0, 1), 's', flush=True)

    # ---------- zócalo: desnivel del suelo bajo la casa (el relieve de 80 m de El Metro, con los ajustes del río) ----------
    s_ = open(os.path.join(ROOT, 'src/data/valle.js'), encoding='utf8').read(); b = re.search(r"VALLE_BIN\s*=\s*'([^']+)'", s_) or re.search(r'VALLE_BIN\s*=\s*"([^"]+)"', s_)
    raw = zlib.decompress(base64.b64decode(b.group(1)), -15); nT, nE = M['W'] * M['H'], M['eW'] * M['eH']
    E = np.frombuffer(raw[nT:nT + nE * 2], np.int16).astype(np.int64).reshape(M['eH'], M['eW']).cumsum(1).astype(float).ravel()
    sa = open(os.path.join(ROOT, 'src/data/ajustes.js'), encoding='utf8').read(); mrel = re.search(r'"relieve"\s*:\s*\[([^\]]*)\]', sa)
    if mrel:
        rel = [int(v) for v in mrel.group(1).split(',') if v.strip()]
        for k in range(0, len(rel) - 1, 2): E[rel[k]] = rel[k + 1]
    E = E.reshape(M['eH'], M['eW']); GE = TM * M['es']
    def elev(x, y):
        gx = np.clip(x / GE, 0, M['eW'] - 1.001); gy = np.clip(y / GE, 0, M['eH'] - 1.001); i = gx.astype(int); j = gy.astype(int); fx = gx - i; fy = gy - j
        return (E[j, i] * (1 - fx) + E[j, i + 1] * fx) * (1 - fy) + (E[j + 1, i] * (1 - fx) + E[j + 1, i + 1] * fx) * fy
    vivos = [i for i in range(N) if not quita[i]]
    geos = np.array([Qs[i]['g'] for i in vivos], dtype=object); cz, iz = shapely.get_coordinates(geos, return_index=True); ez = elev(cz[:, 0], cz[:, 1])
    zmin = np.full(len(vivos), np.inf); zmax = np.full(len(vivos), -np.inf); np.minimum.at(zmin, iz, ez); np.maximum.at(zmax, iz, ez)
    cc = np.array([Qs[i]['c'] for i in vivos]); ecent = elev(cc[:, 0], cc[:, 1])
    # zócalo: el juego puede medir el suelo bajo cada esquina con su relieve (elevM); el zócalo por defecto (6 m bajo el suelo del
    # centro) basta casi siempre. El flujo zb lleva solo los edificios donde no basta (bajan más de ZB_DEF - 2 m desde el centro)
    ZB_DEF = 6.0; baja = np.zeros(N); sube = np.zeros(N); baja[vivos] = ecent - zmin; sube[vivos] = zmax - ecent

    # ---------- codificación (la misma de siempre) con los flujos nuevos al final ----------
    keep = ~quita; X = np.array([Qs[i]['X'] if keep[i] else 0 for i in range(N)]); Y = np.array([Qs[i]['Y'] if keep[i] else 0 for i in range(N)])
    rxa = np.array([Qs[i]['rx'] if keep[i] else 0 for i in range(N)]); rya = np.array([Qs[i]['ry'] if keep[i] else 0 for i in range(N)])
    hk = np.array([hilbert(int(x), int(y)) for x, y in zip(X, Y)])
    reg = rya * nx + rxa; orden = np.lexsort((hk, reg)); orden = orden[keep[orden]]
    pos, dim, an, pi_, ki, pol, zb = bytearray(), bytearray(), bytearray(), bytearray(), bytearray(), bytearray(), bytearray()
    cnt = np.zeros(nx * ny, int); pb = np.zeros(nx * ny, int); qb = np.zeros(nx * ny, int)
    last = -1; px = py = pa = 0; npol = 0; n128 = 0; zbl = []; nz = 0
    for i in orden:
        q = Qs[i]; r = reg[i]
        if r != last: last = r; px = py = pa = 0
        p0, q0 = len(pos), len(pol)
        varint(int(q['X']) - px, pos); varint(int(q['Y']) - py, pos); px, py = int(q['X']), int(q['Y'])
        dim.append(int(q['dA'])); dim.append(int(q['dB'])); an.append((int(q['a']) - pa) % 128); pa = int(q['a'])
        pi_.append(int(pis[i])); fl = int(kind[i]) | int(fuente[i])
        if recort[i] or fix[i]: fl |= 128; n128 += 1
        if q['t'] == 'p':
            fl |= 16; npol += 1; uvarint(len(q['J']), pol); qx, qy = px, py
            for jx, jy in q['J']: varint(int(jx) - qx, pol); varint(int(jy) - qy, pol); qx, qy = int(jx), int(jy)
        ki.append(fl)
        if baja[i] > ZB_DEF - 2: zbl.append((nz, int(min(255, math.ceil(baja[i] / .5))), int(min(255, math.ceil(max(0, sube[i]) / .5)))))
        nz += 1
        cnt[r] += 1; pb[r] += len(pos) - p0; qb[r] += len(pol) - q0
    idxb = bytearray()
    for r in range(nx * ny): uvarint(int(cnt[r]), idxb); uvarint(int(pb[r]), idxb); uvarint(int(qb[r]), idxb)
    # zb: uvarint cuántos · por cada uno: uvarint salto de índice (en el orden del binario), u8 cuánto baja el suelo desde el centro y
    # u8 cuánto sube (medios metros). zBase = suelo del centro - max(6 m, lo que baja) - el resto de la casa se mide con elevM
    uvarint(len(zbl), zb); pi0 = 0
    for k_, b1, b2 in zbl: uvarint(k_ - pi0, zb); pi0 = k_; zb.append(b1); zb.append(b2)
    flujos = [idxb, pos, dim, an, pi_, ki, pol, zb]; todo = b''.join(bytes(f) for f in flujos)
    comp = desinflar(todo)
    n = int(cnt.sum())
    suelos = suelos_de(U, UG, rd, proj, W, H)
    a_fin = float(sum(Qs[i]['g'].area for i in orden))
    stats = {'v': 2, 'edificios': n, 'poligonos': npol, 'recortados_bit128': n128, 'oficiales': int(((fuente == 32) & keep).sum()), 'osm': int(((fuente == 64) & keep).sum()),
             'motor_del_valle': {'recortadas': int((recort & keep).sum()), 'confiables_marcadas': int(marc.sum()), 'rectangulos_de_recortadas': int((esR & keep).sum())},
             'guarda': {'no_pasaban': len(malos), 'arregladas': int(fix.sum()), 'confiables_recortadas_para_el_juego': int((fix & marc).sum()), 'quitadas': fuera,
                        'quitadas_detalle': {'confiables_marcadas': sum(1 for q in quitadas if q[1]), 'ya_recortadas': sum(1 for q in quitadas if q[2]),
                                             'area_p10_p50_p90_m2': [round(float(np.percentile([q[0] for q in quitadas], v)), 1) for v in (10, 50, 90)] if quitadas else []}},
             'area_m2': {'huellas_originales': round(float(area0.sum())), 'saneadas': round(float(A.sum())), 'exportadas_como_las_lee_el_juego': round(a_fin)},
             'por_uso': {KINDS[k]: int(((kind == k) & keep).sum()) for k in range(len(KINDS))},
             'por_fuente': {s2: int(((src == s2) & keep).sum()) for s2 in sorted(set(src))},
             'pisos_medios_por_zona': {z_: round(float(pis[(zona == z_) & keep].mean()), 2) for z_ in TIPO if ((zona == z_) & keep).any()},
             'zocalo': {'en_el_flujo_zb': len(zbl), 'desnivel_bajo_la_casa_p50_m': round(float(np.median(baja[vivos] + sube[vivos])), 2), 'desnivel_p99_m': round(float(np.percentile(baja[vivos] + sube[vivos], 99)), 2),
                        'nota': 'zBase = suelo del centro - max(6 m, lo que baja el suelo bajo la casa); zb lleva solo los edificios donde el suelo baja más de 4 m desde el centro'},
             'suelos': {k: len(v) for k, v in suelos.items()}, 'bytes': {'crudo': len(todo), 'deflate': len(comp), 'zb_crudo': len(zb), 'compresor': COMPRESOR}}
    escribir(n, nx, ny, flujos, todo, comp, suelos, stats, t0, v=2, extra='\n   Desde el Motor del Valle 1.3: huellas saneadas (ninguna pisa la calle ni el agua; motor-valle/geo/sanear.py); bit 128 del uso = recortada; flujo zb (zócalo) al final.')


def suelos_de(U, UG, rd, proj, W, H):
    """canchas, pistas, piscinas y campus (nombre y polígono simplificado para el rótulo y el prado)"""
    import numpy as np, shapely
    def mayor(g):
        if g.geom_type == 'Polygon': return g
        ps = [p for p in getattr(g, 'geoms', []) if p.geom_type == 'Polygon']
        return max(ps, key=lambda p: p.area) if ps else None
    suelos = {'cancha': [], 'pista': [], 'piscina': [], 'campus': []}
    def obb(g):
        o = shapely.oriented_envelope(g); c4 = np.asarray(o.exterior.coords)[:4]; a1 = c4[1] - c4[0]; a2 = c4[2] - c4[1]; l1, l2 = math.hypot(*a1), math.hypot(*a2)
        if l1 < l2: a1, l1, l2 = a2, l2, l1
        c = c4.mean(0); return [round(c[0], 1), round(c[1], 1), round(l1 / 2, 1), round(l2 / 2, 1), round(math.atan2(a1[1], a1[0]) % math.pi, 3)]
    for i, c in enumerate(U['class']):
        g = mayor(UG[i]) if UG[i].geom_type != 'Polygon' else UG[i]
        if g is None or g.is_empty: continue
        x, y = g.centroid.x, g.centroid.y
        if not (0 < x < W and 0 < y < H): continue
        if c == 'pitch' and g.area >= 80: suelos['cancha'].append(obb(g) + [round(g.area / max(1, shapely.oriented_envelope(g).area), 2)])
        elif c == 'track' and g.area >= 400: suelos['pista'].append(obb(g))
        elif c in ('university', 'college') and g.area >= 4000 and U['name'][i]:
            gs = g.simplify(3); ex = np.asarray(gs.exterior.coords)[:-1].round(1).ravel().tolist()
            suelos['campus'].append({'n': U['name'][i], 'x': round(x, 1), 'y': round(y, 1), 'P': ex})
    Wd = rd('agua.parquet', ['class', 'wkb'])
    for c, w in zip(Wd['class'], Wd['wkb']):
        if c != 'swimming_pool': continue
        g = mayor(shapely.make_valid(shapely.transform(shapely.from_wkb(w), proj)))
        if g is None or g.area < 12: continue
        x, y = g.centroid.x, g.centroid.y
        if 0 < x < W and 0 < y < H: suelos['piscina'].append(obb(g))
    return suelos


def escribir(n, nx, ny, flujos, todo, comp, suelos, stats, t0, v=1, extra=''):
    txt = ('/* Casas y edificios reales del Valle de Aburrá: huella (posición, forma y orientación), pisos y uso. Generado por tools/edificios_datos.py (no editar a mano).\n'
           '   Huellas: Overture Maps Foundation (OpenStreetMap, ODbL; Microsoft ML Buildings, ODbL; Google Open Buildings, CC BY 4.0 / ODbL).\n'
           '   Pisos: Subsecretaría de Catastro de Medellín, capa 3DConstruccciones (Popular, El Poblado y Robledo; www.medellin.gov.co/geomedellin);\n'
           '   OpenStreetMap donde existen; en el resto, estimados por zona y tamaño. Usos del suelo, canchas y piscinas: Overture (OpenStreetMap, ODbL).' + extra + ' */\n'
           f'const EDIFICIOS = {json.dumps({"v": v, "R": R, "nx": nx, "ny": ny, "n": n, "Q": Q, "kinds": KINDS, "len": [len(f) for f in flujos], "raw": len(todo)})};\n'
           f'EDIFICIOS.data = "{base64.b64encode(comp).decode()}";\n'
           f'const SUELOS = {json.dumps(suelos, ensure_ascii=False, separators=(",", ":"))};\n')
    open(os.path.join(ROOT, 'src/data/edificios.js'), 'w', encoding='utf8').write(txt)
    json.dump(stats, open(os.path.join(ROOT, 'docs/auditorias/edificios.json'), 'w'), ensure_ascii=False, indent=1)
    print(json.dumps(stats, ensure_ascii=False)); print('src/data/edificios.js', round(len(txt) / 1e6, 3), 'MB ·', len(txt), 'bytes ·', round(time.time() - t0), 's')


if __name__ == '__main__':
    a = sys.argv[1:]
    if len(a) > 1 and a[0] == '--descargar': descargar(a[1])
    elif '--saneadas' in a:
        san = a[a.index('--saneadas') + 1]; cor = a[a.index('--corredores') + 1] if '--corredores' in a else os.path.join(ROOT, 'tools', 'cache', 'corredores.json')
        generar_saneadas(a[0], san, cor)
    elif a: generar(a[0])
    else: print(__doc__)
