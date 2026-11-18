#!/usr/bin/env python3
"""Arquitectura icónica de Medellín con su huella real -> src/data/hitos.js

Fuente: huellas de edificios de OpenStreetMap (© colaboradores de OpenStreetMap, ODbL), por la API 0.6
(map por cuadro pequeño alrededor de cada hito y relation/{id}/full para las multipolígono).

Uso:
  python3 tools/hitos_datos.py --descargar CARPETA   # baja los datos de OSM a CARPETA (una vez)
  python3 tools/hitos_datos.py CARPETA               # genera src/data/hitos.js

Cada hito: id, nombre, estilo de dibujo, altura aproximada (m) y su(s) polígono(s) en metros del mapa del valle.
Las alturas son aproximadas (pisos conocidos o proporción con la ciudad); la forma en planta es la de OSM.
"""
import json, math, os, re, sys, time, urllib.request
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = {'User-Agent': 'juego-offline-mapa/1.0'}
CUADROS = {'centro': (6.2505, -75.5690, .004), 'catedral': (6.2541, -75.5636, .0025), 'estadio': (6.2566, -75.5903, .004),
           'bibespana': (6.2944, -75.5435, .0025), 'alpujarra': (6.2450, -75.5750, .004), 'explora': (6.2702, -75.5662, .003),
           'memoria': (6.2466, -75.5576, .0025), 'mamm': (6.2232, -75.5735, .0025), 'sanantonio': (6.2457, -75.5700, .0025)}
RELACIONES = [7460245, 10597561, 6160599]

# (id, nombre, estilo, altura en m, fuentes [('w', way) | ('r', relación) | ('dentro', way del parque)], extras)
HITOS = [
    ('coltejer', 'Edificio Coltejer', 'aguja', 150, [('w', 31973359)], {'corona': 25}),
    ('catedral', 'Basílica Metropolitana', 'basilica', 30, [('w', 366050226)], {'torres': 2, 'cupula': 1}),
    ('palacio', 'Palacio de la Cultura Rafael Uribe Uribe', 'palacio', 24, [('r', 7460245)], {}),
    ('museo', 'Museo de Antioquia', 'republicano', 20, [('w', 28770080)], {'col': '#c9a46a'}),
    ('botero', 'Plaza Botero', 'botero', 0, [('r', 10597561)], {}),
    ('candelaria', 'Iglesia de La Candelaria', 'iglesia', 16, [('w', 129724092)], {'torres': 1}),
    ('veracruz', 'Iglesia de la Veracruz', 'iglesia', 15, [('w', 128815232)], {'torres': 1}),
    ('sanjose', 'Iglesia de San José', 'iglesia', 16, [('w', 124826817)], {'torres': 1}),
    ('sanantonio', 'Iglesia de San Antonio', 'iglesia', 20, [('w', 551093008)], {'torres': 2, 'cupula': 1}),
    ('estadio', 'Estadio Atanasio Girardot', 'estadio', 22, [('w', 28669265)], {'cancha': 28669268}),
    ('bibespana', 'Parque Biblioteca España', 'rocas', 20, [('r', 6160599)], {}),
    ('epm', 'Edificio EPM', 'vidrio', 85, [('w', 28669194)], {}),
    ('teatro', 'Teatro Metropolitano', 'ladrillo', 24, [('w', 32473064)], {}),
    ('pies', 'Parque de los Pies Descalzos', 'pies', 0, [('w', 32473520)], {}),
    ('luces', 'Parque de las Luces', 'luces', 0, [('w', 32474547)], {}),
    ('vasquez', 'Edificio Vásquez', 'republicano', 16, [('w', 32474590)], {'col': '#e8d9b5'}),
    ('carre', 'Edificio Carré', 'republicano', 16, [('w', 32474597)], {'col': '#e9c9a0'}),
    ('bibepm', 'Biblioteca EPM', 'ladrillo', 22, [('w', 32474558)], {}),
    ('ferrocarril', 'Estación del Ferrocarril de Antioquia', 'republicano', 12, [('w', 32470267)], {'col': '#e3c99a'}),
    ('alcaldia', 'Alcaldía de Medellín', 'moderno', 48, [('w', 32469824)], {}),
    ('gobernacion', 'Gobernación de Antioquia', 'moderno', 48, [('w', 32469791)], {}),
    ('concejo', 'Concejo de Medellín', 'moderno', 18, [('w', 230296296)], {}),
    ('justicia', 'Palacio de Justicia', 'moderno', 32, [('w', 32470439)], {}),
    ('nacional', 'Palacio Nacional', 'republicano', 24, [('w', 31973366)], {'col': '#d8c8a8'}),
    ('banrep', 'Banco de la República', 'republicano', 20, [('w', 129724091)], {'col': '#d9d4c8'}),
    ('planetario', 'Planetario de Medellín', 'cupula', 10, [('w', 93329440)], {}),
    ('explora', 'Parque Explora', 'cubos', 16, [('dentro', 141166140)], {}),
    ('pablotobon', 'Teatro Pablo Tobón Uribe', 'republicano', 14, [('w', 109028606)], {'col': '#d8b48a'}),
    ('memoria', 'Museo Casa de la Memoria', 'moderno', 12, [('w', 262219971)], {}),
    ('mamm', 'Museo de Arte Moderno de Medellín', 'ladrillo', 18, [('w', 191782365)], {}),
]


def descargar(carpeta):
    os.makedirs(carpeta, exist_ok=True)
    for k, (la, lo, r) in CUADROS.items():
        url = f'https://api.openstreetmap.org/api/0.6/map?bbox={lo - r},{la - r},{lo + r},{la + r}'
        open(os.path.join(carpeta, f'map-{k}.osm'), 'wb').write(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read())
        print('ok', k, file=sys.stderr); time.sleep(1.2)
    for rid in RELACIONES:
        url = f'https://api.openstreetmap.org/api/0.6/relation/{rid}/full'
        open(os.path.join(carpeta, f'rel-{rid}.osm'), 'wb').write(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read())
        print('ok relación', rid, file=sys.stderr); time.sleep(1.2)


def leer(carpeta):
    nodos, vias, rels = {}, {}, {}
    for f in sorted(os.listdir(carpeta)):
        if not f.endswith('.osm'):
            continue
        root = ET.parse(os.path.join(carpeta, f)).getroot()
        for n in root.iter('node'):
            nodos[n.get('id')] = (float(n.get('lat')), float(n.get('lon')))
        for w in root.iter('way'):
            vias[w.get('id')] = ({g.get('k'): g.get('v') for g in w.iter('tag')}, [nd.get('ref') for nd in w.iter('nd')])
        for r in root.iter('relation'):
            rels[r.get('id')] = [m.get('ref') for m in r.iter('member') if m.get('type') == 'way' and m.get('role') in ('outer', '')]
    return nodos, vias, rels


def main():
    if sys.argv[1:2] == ['--descargar']:
        return descargar(sys.argv[2])
    carpeta = sys.argv[1]
    vm = json.loads(re.search(r'const VALLE_META = (\{.*?\});\n', open(os.path.join(ROOT, 'src/data/valle.js'), encoding='utf8').read(), re.S).group(1))
    TM = vm['tile']
    geo = lambda la, lo: ((lo - vm['lon0']) * vm['kx'] * TM, (vm['latN'] - la) * vm['ky'] * TM)
    nodos, vias, rels = leer(carpeta)

    def poli(wid):
        t, refs = vias[str(wid)]
        P = [geo(*nodos[r]) for r in refs if r in nodos]
        if len(P) > 2 and P[0] == P[-1]:
            P = P[:-1]
        return P

    def dentro(P, x, y):
        c = False
        for i in range(len(P)):
            (ax, ay), (bx, by) = P[i], P[i - 1]
            if (ay > y) != (by > y) and x < (bx - ax) * (y - ay) / (by - ay) + ax:
                c = not c
        return c

    def rdp(P, eps):
        if len(P) < 4:
            return P
        keep = [False] * len(P); keep[0] = keep[-1] = True; st = [(0, len(P) - 1)]
        while st:
            a, b = st.pop(); (ax, ay), (bx, by) = P[a], P[b]; L = math.hypot(bx - ax, by - ay) or 1; md, mi = -1, -1
            for i in range(a + 1, b):
                d = abs((bx - ax) * (ay - P[i][1]) - (ax - P[i][0]) * (by - ay)) / L
                if d > md:
                    md, mi = d, i
            if md > eps:
                keep[mi] = True; st += [(a, mi), (mi, b)]
        return [p for p, k in zip(P, keep) if k]

    out, falta = [], []
    for hid, nombre, estilo, h, fuentes, extra in HITOS:
        polis = []
        for tipo, ref in fuentes:
            if tipo == 'w' and str(ref) in vias:
                polis.append(poli(ref))
            elif tipo == 'r' and str(ref) in rels:
                polis += [poli(w) for w in rels[str(ref)] if w in vias]
            elif tipo == 'dentro' and str(ref) in vias:
                parque = poli(ref)
                for wid, (t, refs) in vias.items():
                    if 'building' not in t or wid == str(ref):
                        continue
                    P = poli(wid)
                    if len(P) > 2 and dentro(parque, sum(p[0] for p in P) / len(P), sum(p[1] for p in P) / len(P)):
                        polis.append(P)
        polis = [rdp(P, .3) for P in polis if len(P) > 2]
        if not polis:
            falta.append(hid); continue
        o = {'id': hid, 'n': nombre, 'k': estilo, 'h': h, 'P': [[round(v, 1) for p in P for v in p] for P in polis]}
        for k, v in extra.items():
            o[k] = [round(v2, 1) for p in poli(v) for v2 in p] if k == 'cancha' else v
        out.append(o)
    txt = ('/* Arquitectura icónica de Medellín con su huella real (© colaboradores de OpenStreetMap, ODbL), en metros del mapa del valle.\n'
           '   Alturas aproximadas. Generado por tools/hitos_datos.py (no editar a mano). */\n'
           'const HITOS = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
    open(os.path.join(ROOT, 'src/data/hitos.js'), 'w', encoding='utf8').write(txt)
    print(len(out), 'hitos', 'faltan:', falta, '·', round(len(txt) / 1024), 'KB')


if __name__ == '__main__':
    main()
