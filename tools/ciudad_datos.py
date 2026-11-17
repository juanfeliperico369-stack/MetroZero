#!/usr/bin/env python3
"""MEDELLÍN RECONOCIBLE · corrige el mapa base y genera src/data/ciudad.js con datos oficiales abiertos.

  python3 tools/ciudad_descarga.py CACHE      # una vez: baja las capas (ver ese archivo)
  python3 tools/ciudad_datos.py CACHE         # corrige src/data/valle.js y escribe src/data/ciudad.js

Qué hace:
0. No modifica src/data/valle.js: las correcciones van como parche en ciudad.js y se aplican al cargar (MAP.load).\n1. Medellín (manzanas oficiales):
   - una casilla "andén" que cae DENTRO de una manzana catastral es un lote construido: pasa a casa (ladrillo)
     o a edificio, según el tamaño de sus lotes;
   - en parques, plazas y zonas verdes del inventario de espacio público, el andén o el lote vacío pasa a plaza o pasto.
   No toca vías, estaciones, agua ni puentes: las rutas de bus y el juego siguen igual.
2. Fuera de Medellín (sin manzanas abiertas): la misma corrección con una regla aprendida en Medellín
   (vecinos construidos y sin calle al lado); se imprime su precisión medida.
3. Barrios: Medellín (límite catastral oficial), Itagüí, Envigado y Sabaneta → grilla de 80 m + nombres.
4. Calles: nomenclatura oficial de la malla vial de Medellín (Calle, Carrera, Diagonal…) y nombres de la jerarquía vial.
5. Lotes: cuántos lotes caen en cada casilla construida de Medellín (para dividir las casas como son).
6. Lugares: parques, plazas, plazoletas y ecoparques con nombre.
"""
import base64, json, math, os, re, sys, zlib
from collections import Counter, defaultdict

C = sys.argv[1] if len(sys.argv) > 1 else '.cache/ciudad'
R = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
TT = dict(GRASS=0, MOUNT=1, BRICK=2, BLDG=3, ROAD=4, AVE=5, WALK=6, CICLO=7, WATER=8, CANAL=9, PLAZA=10, BRIDGE=11, STATION=12, LAND=13, AUTO=14, DEPOT=15, STEPS=16)
ROADS = {TT['ROAD'], TT['AVE'], TT['AUTO'], TT['BRIDGE']}; BUILT = {TT['BRICK'], TT['BLDG']}

# ---------- mapa base ----------
vpath = os.path.join(R, 'src/data/valle.js'); src = open(vpath, encoding='utf-8').read()
meta = json.loads(re.search(r'const VALLE_META = (\{.*?\});\n', src, re.S).group(1))
b64 = re.search(r"const VALLE_BIN = '([^']*)'", src).group(1)
raw = zlib.decompress(base64.b64decode(b64), -15)
MW, MH = meta['W'], meta['H']; tiles = bytearray(raw[:MW * MH]); orig = bytes(tiles)
TX = lambda lon: (lon - meta['lon0']) * meta['kx']; TY = lambda lat: (meta['latN'] - lat) * meta['ky']
T = lambda x, y: tiles[y * MW + x] if 0 <= x < MW and 0 <= y < MH else TT['MOUNT']
load = lambda n: json.load(open(os.path.join(C, n + '.json')))['features']

def rings(geom):
    if not geom: return []
    if geom['type'] == 'Polygon': return [[(TX(a), TY(b)) for a, b in r] for r in geom['coordinates']]
    if geom['type'] == 'MultiPolygon': return [[(TX(a), TY(b)) for a, b in r] for p in geom['coordinates'] for r in p]
    return []

def fill(rs, cb, k=1.0):
    """Llama cb(i, j) por cada celda de lado k (en casillas) cuyo centro cae dentro (regla par-impar entre anillos)."""
    if not rs: return
    ys = [p[1] for r in rs for p in r]; y0, y1 = int(math.floor(min(ys) / k)), int(math.ceil(max(ys) / k))
    for j in range(max(0, y0), y1 + 1):
        yc = (j + .5) * k; xs = []
        for r in rs:
            for (ax, ay), (bx, by) in zip(r, r[1:] + r[:1]):
                if (ay > yc) != (by > yc): xs.append(ax + (yc - ay) * (bx - ax) / (by - ay))
        xs.sort()
        for a, b in zip(xs[0::2], xs[1::2]):
            for i in range(max(0, int(math.ceil(a / k - .5))), int(math.floor(b / k - .5)) + 1): cb(i, j)

# ---------- 1 · Medellín: manzanas, espacio público y lotes ----------
mde = bytearray(MW * MH); mz = bytearray(MW * MH); ep = bytearray(MW * MH)
BARR = load('barrios_mde')
for f in BARR:
    fill(rings(f['geometry']), lambda i, j: mde.__setitem__(j * MW + i, 1) if i < MW and j < MH else None)
for f in load('manzanas_mde'):
    fill(rings(f['geometry']), lambda i, j: mz.__setitem__(j * MW + i, 1) if i < MW and j < MH else None)
EPC = {'Plaza': 2, 'Plazoleta': 2, 'Plazuela': 2, 'Parque Cívico': 2, 'Parque Recreativo': 1, 'Zona Verde Recreacional': 1, 'Ecoparque': 1, 'Mirador Panoramico': 1}
EPF = load('espacio_publico_mde')
for f in EPF:
    c = EPC.get((f['properties'] or {}).get('categoria'), 0)
    if c: fill(rings(f['geometry']), lambda i, j, c=c: ep.__setitem__(j * MW + i, c) if i < MW and j < MH else None)
lotN = Counter(); lotA = defaultdict(float)
for f in load('lotes_mde'):
    a = f['attributes']
    if a.get('longitud') is None or a.get('latitud') is None: continue
    x, y = int(TX(a['longitud'])), int(TY(a['latitud']))
    lotN[(x, y)] += 1; lotA[(x, y)] += a.get('area_lote') or 0

ALTOS = re.compile(r'Candelaria|Poblado|Laureles|América')
def comuna(x, y):
    i = min(meta['mH'] - 1, y // 8) * meta['mW'] + min(meta['mW'] - 1, x // 8); v = raw[MW * MH + meta['eW'] * meta['eH'] * 2 + meta['mW'] * meta['mH'] + i]
    return meta['comunas'][v - 1] if v else ''
def construido(x, y):
    n = lotN.get((x, y), 0)
    if n: return TT['BRICK'] if lotA[(x, y)] / n <= 350 else TT['BLDG']
    v = Counter(T(x + dx, y + dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1) if T(x + dx, y + dy) in BUILT)
    if v: return v.most_common(1)[0][0]
    return TT['BLDG'] if ALTOS.search(comuna(x, y)) else TT['BRICK']

# regla para fuera de Medellín, medida en Medellín: un andén con vecinos construidos y sin calle al lado está en una manzana
def rasgos(x, y, t):
    nb = sum(t[(y + dy) * MW + x + dx] in BUILT for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= x + dx < MW and 0 <= y + dy < MH)
    nr = sum(t[(y + dy) * MW + x + dx] in ROADS for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= x + dx < MW and 0 <= y + dy < MH)
    return nb, nr
tab = defaultdict(lambda: [0, 0])
for y in range(MH):
    for x in range(MW):
        i = y * MW + x
        if mde[i] and orig[i] == TT['WALK']:
            nb, nr = rasgos(x, y, orig); tab[(min(nb, 3), min(nr, 2))][0 if mz[i] else 1] += 1
REGLA = {k for k, (a, b) in tab.items() if a + b >= 200 and a / (a + b) >= .85}
print('andenes en Medellín: P(dentro de manzana | vecinos construidos, vecinos calle)')
for k in sorted(tab): a, b = tab[k]; print(f'   {k}: {a / (a + b):5.1%} de {a + b:6d}{"  ← regla" if k in REGLA else ""}')

# protección: andenes a 3 casillas o menos de una estación, y los lugares emblemáticos (src/data/lugares.js), se respetan
prot = bytearray(MW * MH)
for y in range(MH):
    for x in range(MW):
        if orig[y * MW + x] == TT['STATION']:
            for dy in range(-3, 4):
                for dx in range(-3, 4):
                    if 0 <= x + dx < MW and 0 <= y + dy < MH: prot[(y + dy) * MW + x + dx] = 1
# y las estaciones de la red (posición real de src/data/red.js): su plaza no se vuelve casa
for m in re.finditer(r'\["[^"]+",(-?\d+\.\d+),(-?\d+\.\d+)\]', open(os.path.join(R, 'src/data/red.js'), encoding='utf-8').read()):
    cx, cy = int(TX(float(m.group(2)))), int(TY(float(m.group(1))))
    for y in range(cy - 3, cy + 4):
        for x in range(cx - 3, cx + 4):
            if 0 <= x < MW and 0 <= y < MH: prot[y * MW + x] = 1
for m in re.finditer(r"\['\w+', '[^']*', '[^']*', (-?[\d.]+), (-?[\d.]+), (\d+), (\d+)", open(os.path.join(R, 'src/data/lugares.js'), encoding='utf-8').read()):
    la, lo, w, h = float(m.group(1)), float(m.group(2)), int(m.group(3)), int(m.group(4)); cx, cy = int(TX(lo)), int(TY(la))
    for y in range(cy - h // 2, cy + h // 2 + 1):
        for x in range(cx - w // 2, cx + w // 2 + 1):
            if 0 <= x < MW and 0 <= y < MH: prot[y * MW + x] = 1
cambios = Counter()
for y in range(MH):
    for x in range(MW):
        i = y * MW + x; v = orig[i]
        if mde[i]:
            if ep[i] and v in (TT['WALK'], TT['LAND']): nv = TT['PLAZA'] if ep[i] == 2 else TT['GRASS']
            elif ep[i] == 2 and v == TT['GRASS']: nv = TT['PLAZA']
            elif mz[i] and v == TT['WALK'] and not prot[i]: nv = construido(x, y)
            else: continue
        elif v == TT['WALK'] and not prot[i]:
            nb, nr = rasgos(x, y, orig)
            if (min(nb, 3), min(nr, 2)) not in REGLA: continue
            nv = construido(x, y)
        else: continue
        if nv != v: tiles[i] = nv; cambios[(v, nv)] += 1
NOM = {v: k for k, v in TT.items()}
print('casillas corregidas:', sum(cambios.values()), {f'{NOM[a]}→{NOM[b]}': n for (a, b), n in cambios.most_common(8)})

# ---------- 3 · barrios (grilla de 4×4 casillas = 80 m) ----------
K = 4; GW, GH = (MW + K - 1) // K, (MH + K - 1) // K; bg = [0] * (GW * GH); barrios = []
def campo(p, *pat):
    for k, v in p.items():
        if isinstance(v, str) and v.strip() and any(re.search(q, k, re.I) for q in pat): return v.strip()
    return ''
def titulo(s):
    s = re.sub(r'\s+', ' ', s.strip()); peq = {'de', 'del', 'la', 'las', 'los', 'el', 'y', 'en'}
    return ' '.join(w if (i and w.lower() in peq) else (w[:1].upper() + w[1:].lower() if w.isupper() or w.islower() else w) for i, w in enumerate(s.split(' ')))
FUENTES_B = [('barrios_mde', 'Medellín', lambda p: p.get('nombre_bar') or '', lambda p: titulo(p.get('nombre_com') or ''), lambda p: p.get('indicador_') != 'R')]
for nm, muni in [('barrios_itagui', 'Itagüí'), ('barrios_envigado', 'Envigado'), ('barrios_sabaneta', 'Sabaneta')]:
    if os.path.exists(os.path.join(C, nm + '.json')):
        FUENTES_B.append((nm, muni, lambda p: campo(p, r'^nom.*bar|^barrio$|^nombre$|^name$|nombre'), lambda p: '', lambda p: True))
for nm, muni, fn, fc, urb in FUENTES_B:
    for f in load(nm):
        p = f['properties'] or {}; name = titulo(fn(p))
        if not name or not f.get('geometry'): continue
        idx = len(barrios) + 1; cells = []
        fill(rings(f['geometry']), lambda i, j: cells.append((i, j)) if i < GW and j < GH else None, K)
        if not cells: continue
        for i, j in cells:
            if not bg[j * GW + i] or muni != 'Medellín': bg[j * GW + i] = idx
        mx = sum(i for i, j in cells) / len(cells); my = sum(j for i, j in cells) / len(cells)
        lx, ly = min(cells, key=lambda c: (c[0] - mx) ** 2 + (c[1] - my) ** 2)
        barrios.append([name, fc(p), muni, (lx * K + K // 2) * 4, (ly * K + K // 2) * 4, len(cells), 1 if urb(p) else 0])
print('barrios:', len(barrios), Counter(b[2] for b in barrios))

# ---------- 4 · calles ----------
PRE = {'CL': 'Calle', 'CR': 'Carrera', 'DG': 'Diagonal', 'TV': 'Transversal', 'CQ': 'Circular', 'AV': 'Avenida', 'VIA': 'Vía', 'SERV': 'Vía de servicio'}
def nombre_via(s):
    s = (s or '').strip()
    if not s or s.upper() in ('NULL', 'VIA', 'SERV'): return ''
    m = re.match(r'^([A-Z]+)\s*(.*)$', s)
    if not m or m.group(1) not in PRE: return ''
    resto = re.sub(r'\s*\+\s*$', '', m.group(2)).strip()
    resto = re.sub(r'(\d+)\s+([A-Z]{1,3})\b(?! ?SUR\b)', r'\1\2', resto)   # "1 B" → "1B"
    resto = re.sub(r'\bSUR\b', 'Sur', re.sub(r'\bESTE\b', 'Este', resto))
    return PRE[m.group(1)] + (' ' + resto if resto else '')
def dp(pts, tol):
    if len(pts) < 3: return pts
    (ax, ay), (bx, by) = pts[0], pts[-1]; L = math.hypot(bx - ax, by - ay) or 1e-9; im, dm = 0, -1
    for i in range(1, len(pts) - 1):
        px, py = pts[i]; d = abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / L
        if d > dm: im, dm = i, d
    return dp(pts[:im + 1], tol)[:-1] + dp(pts[im:], tol) if dm > tol else [pts[0], pts[-1]]
calles = defaultdict(list)
for f in load('malla_vial_mde'):
    g = f.get('geometry'); n = nombre_via((f['properties'] or {}).get('via_gen'))
    if not g or not n: continue
    for line in ([g['coordinates']] if g['type'] == 'LineString' else g['coordinates']):
        calles[n].append(dp([(TX(a), TY(b)) for a, b in line], .22))
ARTER = defaultdict(list)
for f in load('jerarquia_vial_mde'):
    g = f.get('geometry'); p = f['properties'] or {}; n = titulo(p.get('label') or p.get('nombre') or '')
    if not g or not n or re.match(r'^(Calle|Carrera|Diagonal|Transversal|Circular)\s+\d', n): continue
    for line in ([g['coordinates']] if g['type'] == 'LineString' else g['coordinates']):
        ARTER[n].append(dp([(TX(a), TY(b)) for a, b in line], .3))
# nombre por casilla de vía: se recorre cada tramo cada 1/4 de casilla y vota en la casilla de vía que toca (o la vecina)
nombres = [['', 0]]; nid = {}
def idn(n, clase):
    if (n, clase) not in nid: nid[(n, clase)] = len(nombres); nombres.append([n, clase])
    return nid[(n, clase)]
votos = [defaultdict(Counter), defaultdict(Counter)]   # 0: nomenclatura (o vía principal fuera de Medellín), 1: nombre popular
def votar(capa, pts, k):
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        L = math.hypot(bx - ax, by - ay); m = max(1, int(L * 4))
        for t in range(m + 1):
            x, y = ax + (bx - ax) * t / m, ay + (by - ay) * t / m; ix, iy = int(x), int(y)
            if T(ix, iy) in ROADS: votos[capa][iy * MW + ix][k] += 1
            else:
                c = [(ix + dx, iy + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if T(ix + dx, iy + dy) in ROADS]
                if c: jx, jy = min(c, key=lambda q: (q[0] + .5 - x) ** 2 + (q[1] + .5 - y) ** 2); votos[capa][jy * MW + jx][k] += 1
for n, partes in calles.items():
    k = idn(n, 0)
    for pts in partes: votar(0, pts, k)
for n, partes in ARTER.items():
    k = idn(n, 1)
    for pts in partes: votar(1, pts, k)
# fuera de Medellín: vías principales con nombre que ya trae el mapa (VALLE_META.lanes, en cuartos de casilla)
ok = tot = 0
for ln in meta.get('lanes', []):
    n = (ln.get('n') or '').strip(); p = ln.get('p') or []
    pts = [(p[i] / 4, p[i + 1] / 4) for i in range(0, len(p) - 1, 2)]
    tot += len(pts); ok += sum(T(int(x), int(y)) in ROADS for x, y in pts)
    if not n or not pts: continue
    if all(mde[int(y) * MW + int(x)] for x, y in pts[:: max(1, len(pts) // 5)] if 0 <= int(x) < MW and 0 <= int(y) < MH): continue   # en Medellín manda la malla oficial
    k = idn(n, 2); votar(0, pts, k)
print(f'vías principales del mapa base: {ok / max(1, tot):.0%} de sus puntos caen en casillas de vía (comprobación de unidades)')
road_idx = [i for i in range(MW * MH) if orig[i] in ROADS]
s0 = [votos[0][i].most_common(1)[0][0] if i in votos[0] else 0 for i in road_idx]
s1 = [votos[1][i].most_common(1)[0][0] if i in votos[1] else 0 for i in road_idx]
def predictor(vals):
    """Por cada casilla de vía en orden: 0 = igual a la izquierda, 1 = arriba, 4 = arriba-izquierda, 5 = arriba-derecha, 2 = sin nombre, 3 + varint = nombre nuevo."""
    g = {}; out = bytearray()
    for i, v in zip(road_idx, vals): g[i] = v
    for i, v in zip(road_idx, vals):
        x = i % MW
        if v == 0: out.append(2); continue
        if x > 0 and g.get(i - 1) == v: out.append(0); continue
        if g.get(i - MW) == v: out.append(1); continue
        if x > 0 and g.get(i - MW - 1) == v: out.append(4); continue
        if x < MW - 1 and g.get(i - MW + 1) == v: out.append(5); continue
        out.append(3); u = v
        while u >= 128: out.append((u & 127) | 128); u >>= 7
        out.append(u)
    return bytes(out)
p0, p1 = predictor(s0), predictor(s1)
callesB = p0 + p1
print('calles:', len(calles), 'nombres oficiales ·', len(ARTER), 'nombres populares · casillas de vía con nombre:', sum(1 for v in s0 if v), 'de', len(road_idx), '· con nombre popular:', sum(1 for v in s1 if v))

# ---------- 5 · lotes por casilla construida (Medellín), 2 bits: 0 sin dato, 1 un lote, 2 dos o tres, 3 cuatro o más ----------
xs = [x for (x, y) in lotN]; ys = [y for (x, y) in lotN]; LX0, LX1, LY0, LY1 = min(xs), max(xs), min(ys), max(ys)
bits = []
for y in range(LY0, LY1 + 1):
    for x in range(LX0, LX1 + 1):
        if tiles[y * MW + x] in BUILT:
            n = lotN.get((x, y), 0); bits.append(0 if n == 0 else 1 if n == 1 else 2 if n <= 3 else 3)
lotB = bytearray((len(bits) + 3) // 4)
for k, b in enumerate(bits): lotB[k >> 2] |= b << ((k & 3) * 2)

# ---------- 6 · lugares con nombre ----------
lugares = []; GEN = re.compile(r'^(zona verde|parque recreativo|plazoleta|plazuela|ecoparque)\b.*$', re.I)
CAT = {'Plaza': 'plaza', 'Plazoleta': 'plazoleta', 'Plazuela': 'plazoleta', 'Parque Cívico': 'parque', 'Parque Recreativo': 'parque', 'Ecoparque': 'ecoparque', 'Mirador Panoramico': 'mirador', 'Zona Verde Recreacional': 'verde'}
for f in EPF:
    p = f['properties'] or {}; n = (p.get('nombre') or '').strip(); cat = CAT.get(p.get('categoria'))
    if not n or not cat or GEN.match(n) and len(n) < 26 or n.lower() == (p.get('categoria') or '').lower(): continue
    rs = rings(f['geometry'])
    if not rs: continue
    r0 = rs[0]; A = sum(ax * by - bx * ay for (ax, ay), (bx, by) in zip(r0, r0[1:] + r0[:1])) / 2
    if cat == 'verde' and abs(A) < 4: continue
    cx = sum(x for x, y in r0) / len(r0); cy = sum(y for x, y in r0) / len(r0)
    lugares.append([titulo(n) if n.isupper() else n, cat, round(cx * 4), round(cy * 4), round(abs(A), 1)])
print('lugares con nombre:', len(lugares), Counter(l[1] for l in lugares))

# ---------- salida ----------
# parche: (salto desde el cambio anterior en varint, valor nuevo) en orden de casillas; se aplica al cargar el mapa
# parche compacto: 2 bits por cada casilla 'andén' del mapa base (0 queda, 1 casa, 2 edificio, 3 pasto o plaza según el
# inventario) + lista explícita (salto varint, valor) para los demás cambios (lote vacío o pasto que pasan a plaza o pasto)
CODE = {TT['BRICK']: 1, TT['BLDG']: 2, TT['GRASS']: 3, TT['PLAZA']: 3}
walk_bits = []; extra = bytearray(); last = 0; npch = 0; plaza_walk = bytearray()
for i in range(MW * MH):
    if orig[i] == TT['WALK']:
        c = CODE.get(tiles[i], 0) if tiles[i] != orig[i] else 0; walk_bits.append(c)
        if c == 3: plaza_walk.append(1 if tiles[i] == TT['PLAZA'] else 0)
        if c: npch += 1
    elif tiles[i] != orig[i]:
        d = i - last; last = i; npch += 1
        while d >= 128: extra.append((d & 127) | 128); d >>= 7
        extra.append(d); extra.append(tiles[i])
wb = bytearray((len(walk_bits) + 3) // 4)
for k, c in enumerate(walk_bits): wb[k >> 2] |= c << ((k & 3) * 2)
pz = bytearray((len(plaza_walk) + 7) // 8)
for k, c in enumerate(plaza_walk): pz[k >> 3] |= c << (k & 7)
pb = bytes(wb) + bytes(pz) + bytes(extra)
z = lambda b: base64.b64encode((lambda c: c.compress(b) + c.flush())(zlib.compressobj(9, zlib.DEFLATED, -15))).decode()
bgB = b''.join(v.to_bytes(2, 'little') for v in bg)
out = {'v': 1, 'parche': {'n': npch, 'bytes': len(pb), 'nw': len(wb), 'np': len(pz), 'data': z(bytes(pb))}, 'K': K, 'GW': GW, 'GH': GH, 'barrios': barrios, 'bgrid': z(bgB), 'bgridN': len(bgB),
       'calles': nombres, 'cdata': z(callesB), 'cdataN': len(callesB), 'cdataN0': len(p0), 'nvias': len(road_idx), 'lotes': {'x0': LX0, 'y0': LY0, 'x1': LX1, 'y1': LY1, 'data': z(bytes(lotB)), 'n': len(lotB)}, 'lugares': lugares}
js = ('/* MEDELLÍN RECONOCIBLE · generado por tools/ciudad_datos.py (no editar a mano).\n'
      '   Datos abiertos: Alcaldía de Medellín (barrios, manzanas, malla vial, jerarquía vial, espacio público y lotes catastrales),\n'
      '   alcaldías de Itagüí, Envigado y Sabaneta (barrios). Coordenadas en cuartos de casilla (5 m). Ver docs/FUENTES.md. */\n'
      'const CIUDAD = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
open(os.path.join(R, 'src/data/ciudad.js'), 'w', encoding='utf-8').write(js)
print(f'src/data/ciudad.js {len(js) // 1024} KB · parche de {npch} casillas · el mapa base (valle.js) no se modifica')
