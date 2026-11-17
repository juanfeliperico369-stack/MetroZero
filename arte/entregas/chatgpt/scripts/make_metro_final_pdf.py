from pathlib import Path
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader, simpleSplit
ROOT=Path('/mnt/data/EL_METRO_ARTE_FINAL_v052');D=ROOT/'documentacion';OUT=Path('/mnt/data/EL_METRO_GUIA_VISUAL_COMPLETA.pdf')
pdfmetrics.registerFont(TTFont('R','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('B','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
W,H=A4;c=canvas.Canvas(str(OUT),pagesize=A4); page_number=0
paper=HexColor('#FAF6EC');deep=HexColor('#0F2A45');blue=HexColor('#154A80');cream=HexColor('#F1ECE0');muted=HexColor('#68717C');ink=HexColor('#141414')
def page(section,heading):
 global page_number
 if page_number:c.showPage()
 page_number+=1
 c.setFillColor(paper);c.rect(0,0,W,H,stroke=0,fill=1)
 c.setFillColor(deep);c.rect(0,H-99,W,99,stroke=0,fill=1)
 c.setFont('B',10);c.setFillColor(HexColor('#9BC5D7'));c.drawString(37,H-30,section.upper())
 c.setFont('B',22);c.setFillColor(HexColor('#FFFFFF'));c.drawString(37,H-68,heading)
 c.setFillColor(muted);c.setFont('R',8);c.drawString(37,28,'EL METRO · Arte de ChatGPT A2-1.0 · Juego de base v0.5.0')
 c.drawRightString(W-37,28,str(page_number).zfill(2))
def text(t,x,y,width=510,size=10,leading=16,color=ink,bold=False):
 c.setFillColor(color);c.setFont('B' if bold else 'R',size)
 for line in simpleSplit(t,'B' if bold else 'R',size,width):
  c.drawString(x,y,line);y-=leading
 return y
def fit_image(p,x,y,maxw,maxh):
 im=Image.open(ROOT/p).convert('RGBA');iw,ih=im.size;ratio=min(maxw/iw,maxh/ih)
 ww,hh=iw*ratio,ih*ratio
 c.setFillColor(cream);c.roundRect(x,y,maxw,maxh,9,stroke=0,fill=1)
 c.drawImage(ImageReader(im),x+(maxw-ww)/2,y+(maxh-hh)/2,width=ww,height=hh,mask='auto')
def line_(y):c.setStrokeColor(HexColor('#DAD6CE'));c.line(37,y,W-37,y)
def label(s,x,y,size=11):c.setFont('B',size);c.setFillColor(deep);c.drawString(x,y,s)
page('Presentación','EL METRO · Arte completo')
label('Medellín de verdad, dibujada con cariño',39,695,15)
text('Biblioteca gráfica original para la versión v0.5.0 del videojuego: sprites cenitales, íconos, logros, vehículos, cabinas, señalética, portada, decoraciones y texturas.',39,664,500,11,18)
fit_image('portadas/clave_compartir.png',38,258,520,344)
for i,(num,title) in enumerate([('13','Encargos C-'),('124','Recursos'),('473','Comprobaciones')]):
 xx=40+i*174
 c.setFillColor(HexColor('#E5EFF1'));c.roundRect(xx,154,159,85,10,fill=1,stroke=0)
 c.setFillColor(blue);c.setFont('B',30);c.drawString(xx+14,190,num)
 c.setFillColor(deep);c.setFont('B',10);c.drawString(xx+14,174,title)
text('Esta guía contiene la vista resumida. El documento maestro único HTML adjunto reproduce también las 9.914 líneas de la fuente original y la galería completa.',38,112,520,9,14)

page('Marco de referencia','Reglas y alcance')
y=705
for title,desc in [
 ('Misión','Ayudar a conocer Medellín, su sistema de transporte y la Cultura Metro mediante un juego familiar, acogedor y accesible.'),
 ('Rol','ChatGPT es Artista 2: encargos C-. Gemini es Artista 1: encargos G-. El ancla G-00 sigue pendiente de aprobación.'),
 ('Dirección','Pixel art limpio, formas geométricas legibles, contorno #141414; luz superior izquierda, sin sombras proyectadas, sin logos ni marcas.'),
 ('Movilidad','Los vehículos cenitales miran a la derecha. Escala de referencia 1 metro = 8 píxeles. Las cabinas llevan parabrisas #FF00FF.'),
 ('Código y pruebas','No se modificaron los archivos del repositorio ni la APK. Integración posterior requiere compilar con node tools/build.mjs y probar con node tools/test.mjs 100.'),
 ('Estado de entrega','El arte está producido y pasó 473 controles estáticos. La aprobación artística con G-00, la prueba de jugabilidad real y la publicación no se han realizado.')]:
 label(title,40,y,13);y=text(desc,40,y-24,515,10,17,color=muted)-37

page('Sprites · C-01 C-02 C-03','Vehículos y puertas')
label('C-01 · Transporte integrado',39,700,14)
fit_image('previews/spr_vehiculos_sistema_sobre_papel.png',38,430,520,250)
text('14 diseños: 3 coches de metro, tranvía, Metroplús, alimentador, buseta, chiva y seis cabinas de Metrocable.',39,415,515,9,14)
label('C-02 · Calle · 13 vehículos',39,360,14)
fit_image('previews/spr_vehiculos_calle_sobre_papel.png',38,126,520,216)
text('C-03: tres cuadros del articulado con las puertas izquierdas cerradas, entreabiertas y abiertas. Los PNG de la carpeta vehículos son los sprites de escala real.',39,104,510,9,15)

page('Símbolos · C-10 C-11','Modos y acciones')
label('C-10 · Nueve modos',39,697,14)
fit_image('iconos/ico_modos.png',39,377,250,260)
label('C-11 · Doce acciones',306,697,14)
fit_image('iconos/ico_acciones.png',306,377,250,260)
text('Cada ícono individual mide 128 x 128 px, con PNG transparente y SVG editable. Se respeta el significado del encargo original, incluido el control de vigilancia y la tarjeta genérica.',39,330,510,11,19)
label('C-12 · Veinte insignias de logros',39,225,14)
fit_image('iconos/ico_logros.png',170,55,270,160)

page('Interiores · C-20 C-21','Cabinas del transporte')
label('Consola de Metro · horizontal',38,701,12)
fit_image('cabinas/cab_consola_horizontal.png',38,389,520,295)
label('Tablero del autobús · Metroplús',38,366,12)
fit_image('cabinas/cab_bus.png',38,63,520,287)
text('Las ventanas magenta son superficies de composición del videojuego, no un error de exportación. Los instrumentos fueron diseñados para una experiencia de ficción.',39,48,510,8,12)

page('Arte de portada · C-40 C-41','La última vuelta')
label('Portada con y sin título (1536 x 1024)',38,698,12)
fit_image('portadas/clave_compartir.png',38,379,314,304)
fit_image('portadas/clave_portada.png',362,379,196,304)
label('Rosalba mirando la ciudad · carga vertical',38,354,12)
fit_image('portadas/clave_carga.png',38,76,180,258)
text('Estética de ilustración en capas con paleta limitada. Viaducto, río, casas de ladera, cable y tren; sin logos reales. El arte es interpretativo y no pretende ser un mapa geográfico exacto.',237,282,321,10,18)

page('Señalética y fiestas · C-30 C-50','Componentes de ciudad')
label('C-30 · Señalética sin letras',39,696,13)
fit_image('senalizacion/ui_letreros.png',39,377,280,300)
text('16 señales, 11 placas de colores de línea y cinco símbolos. Los nombres y mensajes deben renderizarse con texto real del motor.',338,619,218,10,18)
label('C-50 · Motivos de calendario',39,352,13)
fit_image('fiestas/fiesta_sprites.png',39,78,520,254)
text('21 elementos transparentes: 8 pétalos, silleta, faroles, velita, guirnaldas, luces, banderines y dos motivos de fiesta complementarios.',39,63,510,8,12)

page('Materiales · C-60','Texturas y repetición')
label('Diez materiales base, 1024 x 1024 px, repetibles',39,697,12)
fit_image('previews/texturas_mosaico.png',39,339,520,330)
y=304
for k,v in [('01','Ladrillo naranja · teja'),('02','Asfalto · andén'),('03','Concreto · balasto'),('04','Pasto · río'),('05','Eternit · adoquín')]:
 label(k,40,y,11);text(v,86,y,471,10,17);y-=33
text('QA: los bordes opuestos de cada textura se verificaron pixel a pixel. El ajuste de su frecuencia visual y relación con el tamaño de los edificios queda para la prueba en juego.',39,109,510,9,16)

page('Integración y entrega','Qué hacer con este arte')
y=694
for idx,step in enumerate([
 'Abrir el documento maestro HTML (autocontenido). Consultar el contexto completo y la galería de los 124 recursos.',
 'Aprobar el ancla de estilo G-00 con Gemini. Comparar proporciones, color y contornos antes de elegir los archivos definitivos.',
 'Utilizar PNG individuales y el manifiesto de atlas. Los PNG ampliados en previews/ solo sirven para ver detalles.',
 'Aplicar chroma key al magenta de las cabinas. Dibujar texto dinámico en las señales y controlarlo desde el juego.',
 'Integrar a una rama de desarrollo y actualizar docs/BITACORA.md. No sustituir recursos en la web sin pruebas.',
 'Ejecutar node tools/build.mjs y node tools/test.mjs 100, probar el juego en móvil y escritorio, sin conexión.',
 'Con la aprobación del autor, generar la nueva distribución PWA/APK y actualizar el documento del juego mediante node tools/todo.mjs.'
]):
 label(f'{idx+1:02d}',39,y,12);y=text(step,79,y,468,10,17)-34
line_(y-6)
y-=34
label('Un único documento para todo',39,y,14)
text('EL_METRO_DOCUMENTO_MAESTRO_COMPLETO.html: incorpora instrucciones, contexto y la totalidad del archivo de origen EL-METRO-TODO.md, además de la producción de ChatGPT y scripts de arte. El ZIP contiene los SVG, PNG y manifiestos para integrar.',39,y-24,515,10,17)

c.save();
import shutil
shutil.copy2(OUT,D/OUT.name)
print('PDF',OUT,'pages',page_number,'size',OUT.stat().st_size)
