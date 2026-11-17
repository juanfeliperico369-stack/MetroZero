from pathlib import Path
from PIL import Image
import json,re,hashlib
R=Path('/mnt/data/EL_METRO_ARTE_FINAL_v052');D=R/'documentacion'
M=json.loads((D/'manifest_maestro.json').read_text())
a=M['recursos'];errors=[];checks=[]
def ck(test,label):
 if not test:errors.append(label)
 else:checks.append(label)
ck(len(a)==124,'124 recursos')
expect={'C-01':14,'C-02':13,'C-03':3,'C-10':9,'C-11':12,'C-12':20,'C-20':2,'C-21':1,'C-30':16,'C-40':2,'C-41':1,'C-50':21,'C-60':10}
for k,v in expect.items():ck(len([z for z in a if z['codigo']==k])==v,'conteo '+k)
for z in a:
 p=R/z['archivo'];im=Image.open(p)
 ck(im.size==tuple(z['dimensiones']),'dim '+z['archivo'])
 ck(im.getbbox() is not None,'no vacío '+z['archivo'])
 ck(hashlib.sha256(p.read_bytes()).hexdigest()==z['sha256'],'SHA '+z['archivo'])
for k,shape in {'metro_coche_cabina_delantera.png':(176,24),'metro_coche_intermedio.png':(176,24),'metro_coche_cabina_trasera.png':(176,24),'metroplus_articulado.png':(144,20),'alimentador.png':(96,20),'buseta.png':(64,20),'chiva.png':(64,20),'taxi.png':(36,16)}.items():
 ck(Image.open(R/'vehiculos'/k).size==shape,'sprite escala '+k)
for p in (R/'vehiculos').glob('metrocable_cabina_*.png'):
 ck(Image.open(p).size==(24,24),'cabina cable '+p.name)
for p in (R/'vehiculos').glob('bus_puertas_izquierda_*.png'):
 ck(Image.open(p).size==(144,20),'bus puertas '+p.name)
for p in ['vehiculos/spr_vehiculos_sistema.png','vehiculos/spr_vehiculos_calle.png']:
 im=Image.open(R/p);ck(im.size==(1536,1024) and im.mode=='RGBA','atlas nativo '+p)
for p in ['cabinas/cab_consola_horizontal.png','cabinas/cab_bus.png','portadas/clave_portada.png','portadas/clave_compartir.png']:
 ck(Image.open(R/p).size==(1536,1024),'formato '+p)
for p in ['cabinas/cab_consola_vertical.png','portadas/clave_carga.png']:
 ck(Image.open(R/p).size==(1024,1536),'formato '+p)
for p in list((R/'cabinas').glob('*.png'))+list((R/'portadas').glob('*.png')):
 im=Image.open(p).convert('RGB');cs=im.getcolors(40_000_000)
 ck(cs is not None and len(cs)<=32,'colores <=32 '+p.name)
 if p.parent.name=='cabinas':
  ck(im.getpixel((im.width//4,im.height//3))==(255,0,255),'croma puro '+p.name)
for p in (R/'texturas').glob('tex_*.png'):
 if '_base256' in p.stem:continue
 im=Image.open(p).convert('RGB');w,h=im.size
 ck((w,h)==(1024,1024),'textura 1024 '+p.name)
 ck([im.getpixel((i,0)) for i in range(w)]==[im.getpixel((i,h-1)) for i in range(w)],'vertical seam '+p.name)
 ck([im.getpixel((0,i)) for i in range(h)]==[im.getpixel((w-1,i)) for i in range(h)],'horizontal seam '+p.name)
for p in (R/'fiestas').glob('*.svg'):
 ck(not re.search(r'<text\b|<image\b',p.read_text()),'sin texto '+p.name)
ck(Image.open(R/'fiestas'/'fiesta_sprites.png').size==(640,512),'atlas fiestas')
ck(Path('/mnt/data/EL_METRO_DOCUMENTO_MAESTRO_COMPLETO.html').stat().st_size>1_000_000,'documento HTML completo')
res={'version':'A2-1.0','total_checks_passed':len(checks),'errors':errors,'groups':expect,'source_original_lines':len(Path('/mnt/data/EL-METRO-TODO.md').read_text().splitlines()),'notes':['Pruebas de sintaxis no equivalen a jugabilidad.','No se ha integrado el arte en la PWA o APK.','Estilo final pendiente de aprobación G-00.']}
(D/'qa_final.json').write_text(json.dumps(res,indent=2,ensure_ascii=False))
print(json.dumps({'passed':len(checks),'errors':len(errors),'error_examples':errors[:15],'lines':res['source_original_lines']},ensure_ascii=False,indent=2))
if errors:exit(1)
