#!/usr/bin/env python3
"""Andenes reales de las estaciones de Metroplús -> src/data/metroplus_andenes.js

Por cada estación de Metroplús de src/data/red.js se buscan, en OpenStreetMap (API 0.6, un cuadro de ~500 m), sus
andenes (`public_transport=platform` o `highway=platform`/`bus_stop` con el nombre de la estación o de Metroplús) y se
toma el centro del andén más cercano con el mismo nombre. Así la estación queda donde de verdad para el bus, y no donde
apuntaba la parada de la relación (en Industriales, por ejemplo, apuntaba a la del metro).

Uso: python3 tools/metroplus_andenes.py CARPETA_CACHE   (descarga una vez por estación, con pausa) → src/data/metroplus_andenes.js
© colaboradores de OpenStreetMap (ODbL).
"""
import json, math, os, re, sys, time, unicodedata, urllib.request
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = {'User-Agent': 'ElMetro-datos/1.3 (juego educativo offline)'}


def meta():
    s = open(os.path.join(ROOT, 'src/data/valle.js'), encoding='utf8').read(); i = s.index('VALLE_META'); j = s.index('{', i); d = 0
    for k in range(j, len(s)):
        d += s[k] == '{'; d -= s[k] == '}'
        if d == 0: break
    return json.loads(s[j:k + 1])


def red():
    s = open(os.path.join(ROOT, 'src/data/red.js'), encoding='utf8').read(); i = s.index('const RED = ') + len('const RED = '); d = 0
    for k in range(i, len(s)):
        d += s[k] == '{'; d -= s[k] == '}'
        if d == 0: break
    return json.loads(s[i:k + 1])


def norm(t):
    t = unicodedata.normalize('NFD', t or '').encode('ascii', 'ignore').decode().lower()
    t = re.sub(r'\b(estacion|metroplus|parada|plataforma|anden|linea|l[12o]|av\.?|avenida)\b', ' ', t)
    return re.sub(r'[^a-z0-9]+', ' ', t).strip()


def main(C):
    os.makedirs(C, exist_ok=True); M = meta(); TM = M['tile']
    geo = lambda la, lo: ((lo - M['lon0']) * M['kx'] * TM, (M['latN'] - la) * M['ky'] * TM)
    R = red(); out, info = {}, []
    for L in R['lines']:
        if L.get('kind') != 'brt': continue
        res = {}
        for n, la, lo in L['stations']:
            f = os.path.join(C, re.sub(r'[^a-z0-9]+', '_', norm(n) or 'x') + f'_{la:.4f}_{lo:.4f}.osm')
            if not os.path.exists(f):
                r = .0024; url = f'https://api.openstreetmap.org/api/0.6/map?bbox={lo - r},{la - r},{lo + r},{la + r}'
                for k in range(4):
                    try: open(f, 'wb').write(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read()); break
                    except Exception as e: print('  reintento', n, e, file=sys.stderr); time.sleep(5 * (k + 1))
                time.sleep(1.2)
            try: root = ET.parse(f).getroot()
            except Exception: continue
            N = {x.get('id'): (float(x.get('lat')), float(x.get('lon'))) for x in root.iter('node')}
            cand = []
            def agrega(tags, pts):
                pt = tags.get('public_transport'); hw = tags.get('highway')
                if not (pt == 'platform' or hw in ('platform', 'bus_stop')): return
                nm = tags.get('name', ''); bus = tags.get('bus') == 'yes' or 'metropl' in (nm + tags.get('network', '') + tags.get('operator', '')).lower()
                if not pts: return
                la2 = sum(p[0] for p in pts) / len(pts); lo2 = sum(p[1] for p in pts) / len(pts)
                cand.append((norm(nm), bus, geo(la2, lo2), nm))
            for x in root.iter('node'): agrega({g.get('k'): g.get('v') for g in x.iter('tag')}, [N[x.get('id')]])
            for w in root.iter('way'): agrega({g.get('k'): g.get('v') for g in w.iter('tag')}, [N[nd.get('ref')] for nd in w.iter('nd') if nd.get('ref') in N])
            o = geo(la, lo); objetivo = norm(n); mejor = None
            for nm, bus, p, raw in cand:
                d = math.hypot(p[0] - o[0], p[1] - o[1]); igual = nm and (nm == objetivo or nm in objetivo or objetivo in nm)
                if not igual or d > 260: continue
                score = d - (60 if bus else 0)
                if mejor is None or score < mejor[0]: mejor = (score, p, d, raw)
            if mejor: res[n] = [round(mejor[1][0], 1), round(mejor[1][1], 1)]; info.append((L['id'], n, round(mejor[2]), mejor[3]))
        out[L['id']] = res
    txt = ('/* Andenes reales de las estaciones de Metroplús (© colaboradores de OpenStreetMap, ODbL), en metros del mapa del valle.\n'
           '   Generado por tools/metroplus_andenes.py (no editar a mano). */\n'
           f'const MP_ANDENES = {json.dumps(out, ensure_ascii=False, separators=(",", ":"))};\n')
    open(os.path.join(ROOT, 'src/data/metroplus_andenes.js'), 'w', encoding='utf8').write(txt)
    mov = [i for i in info if i[2] > 15]
    print(f'andenes encontrados: {len(info)} · corridos más de 15 m: {len(mov)}')
    for i in mov: print('  ', i)


if __name__ == '__main__':
    if len(sys.argv) < 2: print(__doc__)
    else: main(sys.argv[1])
