#!/usr/bin/env python3
"""Descarga (una vez) las capas abiertas oficiales que usa tools/ciudad_datos.py.

  python3 tools/ciudad_descarga.py CARPETA_CACHE

Fuentes (datos abiertos en ArcGIS Online; se citan en docs/FUENTES.md):
- Alcaldía de Medellín: límite barrio-vereda catastral, manzanas, malla vial 2026 (nomenclatura y ancho),
  jerarquía vial, inventario de espacio público y lotes catastrales (solo centroide y área, sin geometría).
- Itagüí, Envigado y Sabaneta: capas de barrios publicadas por sus oficinas.
Pagina de a 2000 registros con una pausa corta entre consultas. No vuelve a bajar lo que ya está en la caché.
"""
import json, os, sys, time, urllib.request, urllib.parse

C = sys.argv[1] if len(sys.argv) > 1 else '.cache/ciudad'
os.makedirs(C, exist_ok=True)
UA = {'User-Agent': 'ElMetro-datos/0.7 (juego educativo offline)'}
MDE = 'https://services1.arcgis.com/FZVaYraI7sEGQ6rF/arcgis/rest/services'
CAPAS = {
    'barrios_mde': (MDE + '/shp_limite_barrio_vereda_cata/FeatureServer/0', 'nombre_bar,nombre_com,codigo,indicador_', True, '0.00003'),
    'manzanas_mde': (MDE + '/Manzanas/FeatureServer/0', 'BARRIOVERE,CODIGO_COM', True, '0.00002'),
    'espacio_publico_mde': (MDE + '/InventarioEspacioPublicoMDE/FeatureServer/0', 'nombre,categoria,subcategor', True, '0.00002'),
    'malla_vial_mde': (MDE + '/Malla_Vial_2026/FeatureServer/0', 'via_gen,via_pot,Ancho,calzada_ve,Barrio,Comuna', True, '0.00002'),
    'jerarquia_vial_mde': (MDE + '/Jerarquia_Vial/FeatureServer/0', 'nombre,label,jerarquiza', True, '0.00003'),
    'lotes_mde': (MDE + '/Lotes_Febrero_2026/FeatureServer/0', 'longitud,latitud,area_lote,numero_edi,tipo_lote', False, None),
    'barrios_itagui': ('https://services6.arcgis.com/OgaxSIAS6LfBrEiE/arcgis/rest/services/Infraestructura_Deportiva_y_Recreativa_de_Itag%C3%BC%C3%AD_WFL1/FeatureServer/11', '*', True, '0.00003'),
    'barrios_envigado': ('https://services7.arcgis.com/vAISUooSGCM0wKQp/arcgis/rest/services/Mapa_Base_Observatorio_Inmobiliario_WFL1/FeatureServer/3', '*', True, '0.00003'),
    'barrios_sabaneta': ('https://services7.arcgis.com/OsNfmcCXlLRPMVA8/arcgis/rest/services/Barrios/FeatureServer/0', '*', True, '0.00003'),
}

def get(url):
    for k in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r: return json.loads(r.read())
        except Exception as e:
            print('  reintento', k + 1, e); time.sleep(3 * (k + 1))
    raise SystemExit('no se pudo descargar: ' + url)

for nombre, (url, campos, geo, off) in CAPAS.items():
    dst = os.path.join(C, nombre + '.json')
    if os.path.exists(dst): print('ya está', nombre); continue
    feats, o = [], 0
    while True:
        q = {'where': '1=1', 'outFields': campos, 'returnGeometry': 'true' if geo else 'false', 'outSR': '4326', 'resultOffset': o, 'resultRecordCount': 2000, 'f': 'geojson' if geo else 'json'}
        if geo: q.update(geometryPrecision='6', maxAllowableOffset=off)
        d = get(url + '/query?' + urllib.parse.urlencode(q))
        fs = d.get('features', []); feats += fs
        print(f'  {nombre}: {len(feats)}')
        if not fs or not (d.get('exceededTransferLimit') or (d.get('properties') or {}).get('exceededTransferLimit')) and len(fs) < 2000: break
        o += len(fs); time.sleep(.4)
    json.dump({'fuente': url, 'features': feats}, open(dst, 'w'))
    print('listo', nombre, len(feats))
