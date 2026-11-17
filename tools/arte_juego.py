#!/usr/bin/env python3
"""ARTE DEL JUEGO · prepara el arte recibido (arte/entregas/) y genera src/data/arte.js.

  python3 tools/arte_juego.py        (requiere Pillow con WebP y numpy)

- Láminas (encargos G-): JPEG con fondo magenta → recorte, fondo transparente, WebP pequeño.
- Vectorial (encargos C-): SVG → se minifican y se embeben como texto (nítidos en cualquier pantalla).
- El juego usa ARTE[id] solo si existe: siempre hay respaldo procedural (Atlas en src/js/19-atlas.js).
- Las cajas de recorte se midieron con una segmentación del fondo magenta (ver arte/entregas/INVENTARIO.md).
"""
import base64, io, json, os, re, sys
from collections import deque
import numpy as np
from PIL import Image

R = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
G = os.path.join(R, 'arte/entregas/laminas')
C = os.path.join(R, 'arte/entregas/vectorial/svg')

ROS, NIE, EFR, MWA = 'G-01-03_rosalba.jpg', 'G-04_nieta.jpg', 'G-05_don-efrain.jpg', 'G-06-08_marleny-wilmar-agente.jpg'
FIE, VAR, LAD = 'G-80-81_silleteros-y-alumbrados.jpg', 'G-82-86_velitas-tango-comuna13-arvi-aguacero.jpg', 'G-40-55_ladera-y-variantes.jpg'
# (id, archivo, tipo, caja, ancho final, calidad, encargo, uso)
RASTER = [
    ('ret_rosalba_neutra', ROS, 'retrato', (38, 508, 254, 726), 144, 80, 'G-02', 'Diálogos de la historia'),
    ('ret_rosalba_alegre', ROS, 'retrato', (270, 508, 486, 726), 144, 80, 'G-02', 'Diálogos (frases alegres)'),
    ('ret_rosalba_triste', ROS, 'retrato', (502, 508, 718, 726), 144, 80, 'G-02', 'Diálogos (despedida)'),
    ('ret_nieta_neutra', NIE, 'retrato', (40, 524, 242, 726), 144, 80, 'G-04', 'Diálogos: la nieta (tú)'),
    ('ret_nieta_alegre', NIE, 'retrato', (252, 524, 454, 726), 144, 80, 'G-04', 'Diálogos: la nieta'),
    ('ret_nieta_triste', NIE, 'retrato', (464, 524, 666, 726), 144, 80, 'G-04', 'Diálogos: la nieta'),
    ('ret_efrain_neutra', EFR, 'retrato', (40, 518, 236, 726), 144, 80, 'G-05', 'Diálogos: Don Efraín'),
    ('ret_efrain_alegre', EFR, 'retrato', (252, 518, 454, 726), 144, 80, 'G-05', 'Diálogos: Don Efraín'),
    ('ret_efrain_triste', EFR, 'retrato', (470, 518, 666, 726), 144, 80, 'G-05', 'Diálogos: Don Efraín'),
    ('ret_marleny', MWA, 'busto', (276, 266, 454, 474), 144, 80, 'G-06', 'Diálogos: Doña Marleny'),
    ('ret_wilmar', MWA, 'busto', (700, 266, 878, 474), 144, 80, 'G-07', 'Diálogos: Wílmar'),
    ('ret_agente', MWA, 'busto', (1146, 266, 1326, 474), 144, 80, 'G-08', 'Diálogos: agente de tránsito'),
    ('ret_pasajero', 'G-09_pasajeros.jpg', 'busto', (198, 36, 342, 196), 144, 80, 'G-09', 'Preguntas de pasajeros'),
    ('esc_noche', 'G-70-73_panorama-noche.jpg', 'magenta', None, 720, 58, 'G-70..73', 'Cap. 1 · Niquía, 4:30 a. m.'),
    ('esc_dia', 'G-70-73_panorama-dia.jpg', 'magenta', None, 720, 58, 'G-70..73', 'Cap. 6 · La hora pico'),
    ('esc_ladera_atardecer', LAD, 'magenta', (458, 0, 918, 382), 460, 66, 'G-51', 'Cap. 2 · Santo Domingo (cielo propio detrás)'),
    ('esc_aguacero', VAR, 'escena', (3, 77, 274, 692), 271, 62, 'G-86', 'Cap. 3 · alimentadores'),
    ('esc_tango', VAR, 'escena', (277, 77, 549, 692), 272, 62, 'G-83', 'Cap. 4 · El articulado (Gardel)'),
    ('esc_velitas', VAR, 'escena', (1102, 77, 1374, 692), 272, 62, 'G-82', 'Fiesta: Noche de las Velitas'),
    ('esc_comuna13', VAR, 'escena', (551, 77, 824, 692), 273, 62, 'G-84', 'Postal: Comuna 13'),
    ('esc_arvi', VAR, 'escena', (827, 77, 1099, 692), 272, 62, 'G-85', 'Postal: Parque Arví (cable L)'),
    ('esc_silleteros', FIE, 'escena', (0, 0, 686, 768), 400, 60, 'G-80', 'Fiesta: Feria de las Flores'),
    ('esc_alumbrados', FIE, 'escena', (691, 0, 1376, 768), 400, 60, 'G-81', 'Fiesta: Alumbrados'),
    ('iso_centro', 'G-90_isometrico-centro.jpg', 'magenta', (24, 114, 1000, 920), 560, 66, 'G-90', 'Cap. 5 · Ayacucho y la Maqueta 2:1'),
]
# En la lámina G-82..86 el orden real es: velitas, tango, comuna 13, Arví, aguacero (de izquierda a derecha)
RASTER = [r if r[0] not in ('esc_aguacero', 'esc_velitas') else
          (r[0], r[1], r[2], (1102, 77, 1374, 692) if r[0] == 'esc_aguacero' else (3, 77, 274, 692)) + r[4:] for r in RASTER]

# SVG: (id, ruta dentro de svg/, encargo, uso)
SVG = [('portada', 'portadas/clave_portada.svg', 'C-40', 'Portada del menú y epílogo'),
       ('carga', 'portadas/clave_carga.svg', 'C-41', 'Pantalla de carga y cap. 7 · La última vuelta')]
for i, (k, f) in enumerate([('libre', 'ciudad_libre'), ('bus', 'bus'), ('conduce', 'metro'), ('cableviaje', 'metrocable'), ('historia', 'historia'),
                            ('guia', 'guia'), ('red', 'red'), ('multi', 'juntos'), ('arcade', 'arcade')]):
    SVG.append((f'ico_modo_{k}', f'iconos/c10_modos/{i + 1:02d}_{f}.svg', 'C-10', 'Tarjeta del modo en el menú'))
for f in ['01_llave', '02_sentido', '03_vigilante', '04_megafono', '05_puerta_izquierda', '06_puerta_derecha', '07_pito', '08_foto', '09_lupa', '10_correr', '11_adelantar', '12_tarjeta']:
    SVG.append(('ico_' + f[3:], f'iconos/c11_acciones/{f}.svg', 'C-11', 'Botón de la cabina o de Ciudad Libre'))
LOG = ['primer', 'perfecto', 'diez', 'lineaA', 'despacho100', 'mp50', 'cables6', 'tres10', 'flota', 'historia', 'datos25', 'noche', 'madrugada', 'duelo', 'red', 'racha3', 'mil', 'tinto', 'flores', 'alumbrados']
for i, f in enumerate(sorted(os.listdir(os.path.join(C, 'iconos/c12_logros')))):
    SVG.append(('logro_' + LOG[i], 'iconos/c12_logros/' + f, 'C-12', 'Medalla en la libreta de logros'))
for f in ['guirnalda_curva', 'banderines_feria', 'petalo_01', 'petalo_02', 'petalo_03', 'petalo_05', 'velita', 'farol_rojo', 'farol_amarillo', 'luz_estrella', 'luz_flor']:
    SVG.append(('fie_' + f, f'fiestas/{f}.svg', 'C-50', 'Decoración de fiestas en el menú'))


def magenta(a, tol=1.0):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    lo = np.minimum(r, b)
    return (lo - g > 70 * tol) & (r > 100) & (b > 90) & (np.abs(r - b) < 85)


def inunda(bg):
    """Fondo = píxeles de color fondo conectados con el borde (no borra rosados del interior)."""
    H, W = bg.shape
    out = np.zeros_like(bg); q = deque()
    for x in range(W):
        for y in (0, H - 1):
            if bg[y, x] and not out[y, x]: out[y, x] = True; q.append((y, x))
    for y in range(H):
        for x in (0, W - 1):
            if bg[y, x] and not out[y, x]: out[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < H and 0 <= nx < W and bg[ny, nx] and not out[ny, nx]:
                out[ny, nx] = True; q.append((ny, nx))
    return out


def sin_fondo(im):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    bg = inunda(magenta(a))
    # crece 1 px hacia los bordes con tinte magenta (compresión JPEG) y quita el tinte de los vecinos
    near = np.zeros_like(bg)
    near[1:, :] |= bg[:-1, :]; near[:-1, :] |= bg[1:, :]; near[:, 1:] |= bg[:, :-1]; near[:, :-1] |= bg[:, 1:]
    near &= ~bg
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    spill = np.clip(np.minimum(r, b) - g - 8, 0, 255)
    alpha = np.where(bg, 0, 255).astype(np.float32)
    alpha = np.where(near, 255 - np.clip(spill * 1.6, 0, 200), alpha)
    k = np.where(near | (spill > 40), spill * .85, 0)
    a[..., 0] = r - k; a[..., 2] = b - k
    rgba = np.dstack([np.clip(a, 0, 255), alpha]).astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA')


def marco_interior(im):
    """En los retratos con marco oscuro, se queda con lo de adentro del marco."""
    a = np.asarray(im.convert('RGB')).astype(int); H, W = a.shape[:2]
    dark = a.sum(-1) < 170
    top = next((y for y in range(H // 4) if dark[y].mean() < .5 and y > 0 and dark[y - 1].mean() >= .5), 0)
    lt = next((x for x in range(W // 4) if dark[:, x].mean() < .5 and x > 0 and dark[:, x - 1].mean() >= .5), 0)
    bt = next((y for y in range(H - 1, H * 3 // 4, -1) if dark[y].mean() < .5 and y < H - 1 and dark[y + 1].mean() >= .5), H - 1)
    rt = next((x for x in range(W - 1, W * 3 // 4, -1) if dark[:, x].mean() < .5 and x < W - 1 and dark[:, x + 1].mean() >= .5), W - 1)
    m = 2
    return im.crop((lt + m, top + m, rt - m + 1, bt - m + 1))


def cuadrado_abajo(im):
    w, h = im.size; s = max(w, h)
    out = Image.new('RGBA', (s, s), (0, 0, 0, 0)); out.paste(im, ((s - w) // 2, s - h)); return out


def webp(im, q, alpha):
    buf = io.BytesIO()
    if alpha: im.save(buf, 'WEBP', quality=q, method=6, alpha_quality=90)
    else: im.convert('RGB').save(buf, 'WEBP', quality=q, method=6)
    return buf.getvalue()


def svg_min(s):
    s = re.sub(r'<\?xml[^>]*>', '', s); s = re.sub(r'<title>.*?</title>', '', s, flags=re.S)
    s = re.sub(r'>\s+<', '><', s); s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r'(\d+\.\d{2})\d+', r'\1', s)   # 2 decimales bastan
    return s


def main():
    arte, filas, total = {}, [], 0
    for (id_, f, tipo, caja, w, q, enc, uso) in RASTER:
        im = Image.open(os.path.join(G, f)).convert('RGB')
        if caja: im = im.crop(caja)
        alpha = tipo in ('retrato', 'busto', 'magenta')
        if tipo == 'retrato': im = sin_fondo(marco_interior(im))
        elif tipo in ('busto', 'magenta'): im = sin_fondo(im)
        if tipo == 'busto': im = cuadrado_abajo(im)
        if tipo == 'retrato': im = cuadrado_abajo(im)
        h = round(im.size[1] * w / im.size[0])
        if im.size[0] != w: im = im.resize((w, h), Image.LANCZOS)
        data = webp(im, q, alpha)
        arte[id_] = 'data:image/webp;base64,' + base64.b64encode(data).decode()
        filas.append((id_, enc, f, uso, f'{w}×{h}', len(data))); total += len(arte[id_])
    for (id_, f, enc, uso) in SVG:
        s = svg_min(open(os.path.join(C, f), encoding='utf-8').read())
        arte[id_] = s; filas.append((id_, enc, 'vectorial/svg/' + f, uso, 'SVG', len(s.encode()))); total += len(s.encode())
    js = ('/* ARTE DEL JUEGO · generado por tools/arte_juego.py desde arte/entregas/. No editar a mano.\n'
          '   Uso: Atlas.img(id) / Atlas.url(id) en src/js/19-atlas.js; si falta un id, el juego dibuja su respaldo procedural. */\n'
          'const ARTE = ' + json.dumps(arte, ensure_ascii=False, separators=(',', ':')).replace('","', '",\n"') + ';\n')
    open(os.path.join(R, 'src/data/arte.js'), 'w', encoding='utf-8').write(js)
    md = ['# Arte integrado al juego', '', 'Generado por `python3 tools/arte_juego.py` (no editar a mano). Cada recurso tiene respaldo procedural en el juego.', '',
          f'**{len(filas)} recursos · {total // 1024} KB dentro del HTML** (WebP en base64 y SVG minificado).', '',
          '| id | encargo | fuente | uso en el juego | tamaño | bytes |', '|---|---|---|---|---|---:|']
    md += [f'| `{a}` | {b} | `{c}` | {d} | {e} | {n:,} |'.replace(',', '.') for a, b, c, d, e, n in filas]
    open(os.path.join(R, 'arte/entregas/USO-EN-EL-JUEGO.md'), 'w', encoding='utf-8').write('\n'.join(md) + '\n')
    print(f'{len(filas)} recursos · src/data/arte.js {len(js) // 1024} KB')
    if '--ver' in sys.argv:
        for fl in filas: print('  ', fl[0], fl[4], fl[5])


if __name__ == '__main__':
    main()
