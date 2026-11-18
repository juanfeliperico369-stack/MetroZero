#!/usr/bin/env python3
"""Corredores de Metroplús Líneas 1 y 2 desde sus relaciones de ruta de OpenStreetMap -> src/data/metroplus.js

Las vías de la relación (en su orden) se unen en un solo trazado, se pasan a metros del mapa del valle, se simplifican
(0,5 m) y se redondean las esquinas (radio ~8 m) para que el articulado gire sin quiebres. Los andenes (miembros
`platform`) van con su nombre. La Línea O (en tráfico mixto) conserva su corredor anterior; el juego la rehace por las
calles (src/data/rutas_calles.js).

Relaciones: Línea 1 5458501 (y 5393696 del otro sentido); Línea 2 5401998 (y 5401999). Donde un andén queda lejos del
sentido base (calles de un solo sentido), se empalma el tramo del otro sentido que pasa por él.
Uso: python3 tools/metroplus_osm.py CARPETA_CACHE   © colaboradores de OpenStreetMap (ODbL).
"""
import json, math, os, sys, time, urllib.request
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = {'User-Agent': 'ElMetro-datos/1.3 (juego educativo offline)'}
REL = {'MP1': (5458501, 5393696), 'MP2': (5401998, 5401999)}   # (base, el otro sentido para empalmar donde la base no pasa por un andén)


def meta():
    s = open(os.path.join(ROOT, 'src/data/valle.js'), encoding='utf8').read(); i = s.index('VALLE_META'); j = s.index('{', i); d = 0
    for k in range(j, len(s)):
        d += s[k] == '{'; d -= s[k] == '}'
        if d == 0: break
    return json.loads(s[j:k + 1])


def rdp(P, eps):
    if len(P) < 3: return P
    a, b = P[0], P[-1]; dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1e-9; mi, md = 0, -1
    for i in range(1, len(P) - 1):
        d = abs((P[i][0] - a[0]) * dy - (P[i][1] - a[1]) * dx) / L
        if d > md: mi, md = i, d
    if md <= eps: return [a, b]
    return rdp(P[:mi + 1], eps)[:-1] + rdp(P[mi:], eps)


def redondea(Q):
    out = [Q[0]]
    for i in range(1, len(Q) - 1):
        (ax, ay), (bx, by), (cx, cy) = Q[i - 1], Q[i], Q[i + 1]; L1, L2 = math.hypot(bx - ax, by - ay), math.hypot(cx - bx, cy - by)
        d = abs(math.atan2(cy - by, cx - bx) - math.atan2(by - ay, bx - ax)); d = 2 * math.pi - d if d > math.pi else d
        if d < .26 or L1 < 1 or L2 < 1: out.append(Q[i]); continue
        r = min(8, L1 * .45, L2 * .45); p0 = (bx - (bx - ax) / L1 * r, by - (by - ay) / L1 * r); p2 = (bx + (cx - bx) / L2 * r, by + (cy - by) / L2 * r)
        for t in [0, .2, .4, .6, .8, 1]: u = 1 - t; out.append((u * u * p0[0] + 2 * u * t * bx + t * t * p2[0], u * u * p0[1] + 2 * u * t * by + t * t * p2[1]))
    out.append(Q[-1]); return out


def main(C):
    os.makedirs(C, exist_ok=True); M = meta(); TM = M['tile']
    geo = lambda la, lo: ((lo - M['lon0']) * M['kx'] * TM, (M['latN'] - la) * M['ky'] * TM)
    s = open(os.path.join(ROOT, 'src/data/metroplus.js'), encoding='utf8').read(); OUT = json.loads(s[s.index('{'):s.rindex('}') + 1]); info = {}
    def trazado(rid):
        f = os.path.join(C, f'rel-{rid}.osm')
        if not os.path.exists(f):
            open(f, 'wb').write(urllib.request.urlopen(urllib.request.Request(f'https://api.openstreetmap.org/api/0.6/relation/{rid}/full', headers=UA), timeout=180).read()); time.sleep(1.2)
        root = ET.parse(f).getroot(); N = {n.get('id'): (float(n.get('lat')), float(n.get('lon'))) for n in root.iter('node')}
        W = {w.get('id'): ([nd.get('ref') for nd in w.iter('nd')], {g.get('k'): g.get('v') for g in w.iter('tag')}) for w in root.iter('way')}
        rel = next(r for r in root.iter('relation') if r.get('id') == str(rid))
        vias = [m.get('ref') for m in rel.iter('member') if m.get('type') == 'way' and not (m.get('role') or '').startswith('platform') and m.get('ref') in W]
        andenes = [m.get('ref') for m in rel.iter('member') if m.get('type') == 'way' and (m.get('role') or '').startswith('platform') and m.get('ref') in W]
        tr = []
        for w in vias:   # cada vía se pega por la punta que coincide con el final del trazado (o se invierte)
            nds = [n for n in W[w][0] if n in N]
            if not nds: continue
            if not tr: tr = list(nds); continue
            if nds[0] == tr[-1]: tr += nds[1:]
            elif nds[-1] == tr[-1]: tr += nds[::-1][1:]
            elif nds[0] == tr[0] or nds[-1] == tr[0]: tr = tr[::-1]; tr += nds[1:] if nds[0] == tr[-1] else nds[::-1][1:]
            else:
                a, b, c = geo(*N[tr[-1]]), geo(*N[nds[0]]), geo(*N[nds[-1]])
                tr += nds if math.hypot(a[0] - b[0], a[1] - b[1]) <= math.hypot(a[0] - c[0], a[1] - c[1]) else nds[::-1]
        P = [geo(*N[n]) for n in tr]; P = [p for i, p in enumerate(P) if i == 0 or math.hypot(p[0] - P[i - 1][0], p[1] - P[i - 1][1]) > .3]
        st = []
        for w in andenes:
            nds = [N[n] for n in W[w][0] if n in N]
            if nds: x, y = geo(sum(p[0] for p in nds) / len(nds), sum(p[1] for p in nds) / len(nds)); st.append([W[w][1].get('name', ''), round(x, 1), round(y, 1)])
        return P, st
    def proy(P, q):   # distancia de q al trazado e índice del segmento más cercano
        bd, bi = 1e18, 0
        for i in range(1, len(P)):
            ax, ay = P[i - 1]; dx, dy = P[i][0] - ax, P[i][1] - ay; L2 = dx * dx + dy * dy or 1e-9; t = max(0, min(1, ((q[0] - ax) * dx + (q[1] - ay) * dy) / L2))
            d = math.hypot(ax + dx * t - q[0], ay + dy * t - q[1])
            if d < bd: bd, bi = d, i
        return bd, bi
    s0 = open(os.path.join(ROOT, 'src/data/metroplus_andenes.js'), encoding='utf8').read(); AND = json.loads(s0[s0.index('{'):s0.rindex('}') + 1])
    s1 = open(os.path.join(ROOT, 'src/data/red.js'), encoding='utf8').read(); i1 = s1.index('const RED = ') + 12; d1 = 0
    for k1 in range(i1, len(s1)):
        d1 += s1[k1] == '{'; d1 -= s1[k1] == '}'
        if d1 == 0: break
    RED = json.loads(s1[i1:k1 + 1]); EST = {}
    for L0 in RED['lines']:
        if L0.get('kind') == 'brt': EST[L0['id']] = {n: tuple(AND.get(L0['id'], {}).get(n) or geo(la, lo)) for n, la, lo in L0['stations']}
    for lid, (rid, rid2) in REL.items():
        P, st = trazado(rid); Q, _ = trazado(rid2); emp = 0
        for n, (x, y) in EST.get(lid, {}).items():
            d, _i = proy(P, (x, y)); d2, j = proy(Q, (x, y))
            if d < 30 or d2 > 15: continue
            # en el otro sentido: hacia atrás y hacia adelante del andén, hasta donde vuelve a ir junto a la base (a menos de 6 m)
            a = j - 1
            while a > 0 and proy(P, Q[a])[0] > 6: a -= 1
            b = j
            while b < len(Q) - 1 and proy(P, Q[b])[0] > 6: b += 1
            ia, ib = proy(P, Q[a])[1], proy(P, Q[b])[1]
            tramo = Q[a:b + 1]
            if ia > ib: ia, ib = ib, ia; tramo = tramo[::-1]   # el otro sentido va al revés
            largo = sum(math.hypot(tramo[i][0] - tramo[i - 1][0], tramo[i][1] - tramo[i - 1][1]) for i in range(1, len(tramo)))
            if ia >= ib or largo > 350: print("  sin empalme (el otro sentido va por otra calle %d m):" % largo, lid, n, file=sys.stderr); continue
            # el tramo del otro sentido va al revés: se invierte si su comienzo queda más cerca del final del hueco
            if math.hypot(tramo[0][0] - P[ib][0], tramo[0][1] - P[ib][1]) < math.hypot(tramo[0][0] - P[ia - 1][0], tramo[0][1] - P[ia - 1][1]): tramo = tramo[::-1]
            P = P[:ia] + tramo + P[ib:]; emp += 1
        P = redondea(rdp(P, .5)); L = sum(math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]) for i in range(1, len(P)))
        OUT[lid] = {'p': [round(v, 1) for p in P for v in p], 'st': st}; info[lid] = {'km': round(L / 1000, 2), 'puntos': len(P), 'andenes': len(st), 'empalmes': emp}
    txt = ('/* Corredores de Metroplús: Líneas 1 y 2 desde sus relaciones de ruta de OpenStreetMap (5458501 y 5401999), Línea O de Juega EnCicla;\n'
           '   © colaboradores de OpenStreetMap (ODbL), en metros del mapa del valle, con las esquinas redondeadas. Generado por tools/metroplus_osm.py (no editar a mano). */\n'
           f'const METROPLUS = {json.dumps(OUT, ensure_ascii=False, separators=(",", ":"))};\n')
    open(os.path.join(ROOT, 'src/data/metroplus.js'), 'w', encoding='utf8').write(txt); print(json.dumps(info))


if __name__ == '__main__':
    if len(sys.argv) < 2: print(__doc__)
    else: main(sys.argv[1])
