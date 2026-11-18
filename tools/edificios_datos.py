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
  python3 tools/edificios_datos.py CARPETA               # genera src/data/edificios.js (shapely, pyarrow, numpy)
Para que DuckDB lea el bucket público detrás de un proxy: env -u AWS_ACCESS_KEY_ID -u AWS_SECRET_ACCESS_KEY ...

Formato de src/data/edificios.js (una sola cadena base64 de deflate-raw):
  por región de 640 m (fila por fila), en el índice: número de edificios, bytes de posiciones y bytes de polígonos (varint);
  luego, por flujos: posiciones (centro en medios metros, deltas zigzag-varint en orden de Hilbert), medidas (medio frente
  y medio fondo en medios metros, uint8), ángulo (128 pasos en 180°, delta mod 128), pisos (uint8), uso (uint8: 4 bits de
  tipo, bit 16 polígono, bit 32 pisos oficiales, bit 64 pisos de OSM) y polígonos (n vértices y deltas zigzag-varint).
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


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == '--descargar': descargar(sys.argv[2])
    elif len(sys.argv) > 1: generar(sys.argv[1])
    else: print(__doc__)
