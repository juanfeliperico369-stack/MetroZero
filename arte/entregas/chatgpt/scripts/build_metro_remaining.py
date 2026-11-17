from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import random, math, json, shutil, hashlib, io
import cairosvg
BASE=Path('/mnt/data/EL_METRO_ARTE_MAESTRO_v051')
OUT=Path('/mnt/data/EL_METRO_ARTE_FINAL_v052')
if not OUT.exists(): shutil.copytree(BASE,OUT)
for folder in ['vehiculos','cabinas','portadas','fiestas','previews','documentacion']:(OUT/folder).mkdir(parents=True,exist_ok=True)
COL={'outline':'#141414','paper':'#F1ECE0','cream':'#FAF6EC','white':'#FDFBF5','metro':'#1C5C9C','metro2':'#154A80','tranvia':'#59AB42','plus':'#0E6F76','plus2':'#65A9AC','gold':'#F6C538','red':'#C8201F','yellow':'#F2C400','brick':'#B4583A','brick2':'#9A4630','gray':'#9AA1A8','roof':'#C7CED1','rooflite':'#E5E8E7','glass':'#749EAF','glasslite':'#9FD3E6','green':'#4F8A3C','darkgreen':'#2F6B35','cablej':'#F6C538','cablek':'#B8CF40','cablel':'#8E612A','cableh':'#EB318E','cablem':'#743D90','cablep':'#EC343A','asphalt':'#3B3F45'}
O=COL['outline']; PAPER=COL['paper']; WHITE=COL['white']
def img(w,h):return Image.new('RGBA',(w,h),(0,0,0,0))
def rr(d,rect,r,fill,outline=O,width=1):d.rounded_rectangle(rect,radius=r,fill=fill,outline=outline,width=width)
def line(d,coords,fill=O,width=1):d.line(coords,fill=fill,width=width)
def train(kind='cab_frente'):
    w,h=176,24;i=img(w,h);d=ImageDraw.Draw(i)
    rr(d,(2,2,173,21),5,COL['roof'],width=1)
    d.polygon([(166,3),(173,7),(173,16),(165,21)],fill=COL['rooflite'])
    d.line([(5,4),(163,4)],fill=COL['white'],width=1)
    d.line([(4,18),(170,18)],fill=COL['metro'],width=2)
    for k in range(4):rr(d,(35+k*22,7,50+k*22,16),2,'#A6B4BC',outline='#52636C')
    for k in range(2):rr(d,(81+k*43,5,105+k*43,8),1,'#5D696E',width=1)
    for x in (56,66):line(d,(x,6,x,15),fill='#8E979A')
    if kind!='medio':
        nose_right=(kind=='cab_frente');p=(166,6,171,17) if nose_right else (5,6,10,17)
        rr(d,p,2,'#384A5B',width=1)
        d.rectangle((169 if nose_right else 5,10,172 if nose_right else 8,13),fill=COL['metro'])
    else:rr(d,(9,8,18,16),1,'#839399');rr(d,(158,8,166,16),1,'#839399')
    # small simple pantograph silhouette, perpendicular to rightward vehicle direction
    line(d,(114,3,118,1,122,3),width=1)
    return i

def normal_bus(w=96,h=20,color=None,art=False,feeder=False,chiva=False,buseta=False):
    color=color or COL['plus'];i=img(w,h);d=ImageDraw.Draw(i)
    rr(d,(1,2,w-2,h-3),3,O,width=1)
    rr(d,(3,3,w-4,h-4),3,COL['rooflite'],outline=color,width=1)
    d.line((5,h-5,w-5,h-5),fill=color,width=2)
    # roof area
    for x in range(10,w-15,18):
        rr(d,(x,5,min(x+11,w-12),h-8),2,'#B8C4C9',outline='#808D93',width=1)
    if art:
        for xx in [w//2-4,w//2+1]:d.line((xx,3,xx,h-4),fill=O,width=2)
        for xx in [w//2-3,w//2+3]:d.line((xx,4,xx+2,h-5),fill='#647073',width=1)
    rr(d,(w-13,5,w-5,h-7),1,'#355B65',width=1)
    d.rectangle((2,h//2-4,6,h//2+3),fill='#C2E1E3')
    if feeder: d.line((9,h-7,w-12,h-7),fill=COL['metro'],width=2)
    if buseta:
        for x in (7,12,17):d.rectangle((x,2,x+2,3),fill=COL['gold'])
    if chiva:
        for x in range(7,w-10,8):d.line((x,5,x+4,h-6),fill=COL['gold'],width=2)
        for x in range(11,w-10,14):d.line((x,2,x+4,2),fill=COL['red'],width=2)
    return i

def tram():
    w,h=160,24;i=img(w,h);d=ImageDraw.Draw(i)
    for k,(l,r) in enumerate([(2,53),(56,105),(108,157)]):
        rr(d,(l,3,r,20),4,COL['rooflite'],outline=O)
        d.line((l+3,18,r-4,18),fill=COL['tranvia'],width=2)
        for q in range(l+9,r-7,12):rr(d,(q,7,q+9,14),1,'#96AAA8',outline='#53756A')
    for x in (54,106):rr(d,(x,7,x+2,17),1,'#4C5454',width=1)
    rr(d,(150,6,157,16),2,'#477969');return i

def cabina(c):
    i=img(24,24);d=ImageDraw.Draw(i)
    rr(d,(4,2,19,21),5,O);rr(d,(5,3,18,20),5,c,outline=O)
    rr(d,(7,7,16,15),2,'#A7C8C8');d.line((11,6,11,17),fill=O)
    d.line((11,1,11,5),fill=O,width=2);return i

def car(c='#B4583A',kind='car'):
    i=img(36,16);d=ImageDraw.Draw(i)
    rr(d,(1,2,34,13),4,O);rr(d,(3,3,33,12),3,c,outline=O)
    rr(d,(9,4,23,11),3,'#708F9C',outline=O)
    d.line((13,4,13,11),fill=O);d.rectangle((32,6,35,9),fill=COL['rooflite'])
    return i

def other_vehicle(kind):
    dims={'camioneta':(42,18),'moto':(16,8),'bici':(14,6),'carrito':(24,16),'ambulancia':(48,18),'camion':(52,20)}
    w,h=dims[kind];i=img(w,h);d=ImageDraw.Draw(i)
    if kind=='camioneta':
        rr(d,(1,2,w-2,h-3),3,COL['metro']);rr(d,(5,4,23,13),2,'#7595A1');d.rectangle((25,4,38,13),fill='#637986');d.line((26,5,26,13),fill=O)
    elif kind=='moto':
        d.ellipse((1,1,5,6),fill=O);d.ellipse((11,1,15,6),fill=O);d.line((3,4,13,4),fill=COL['metro'],width=2);d.ellipse((6,2,10,5),fill=COL['red'])
    elif kind=='bici':
        d.ellipse((1,0,5,5),outline=O);d.ellipse((9,0,13,5),outline=O);d.line((3,2,7,3,11,2),fill=COL['green']);d.ellipse((5,1,8,4),fill=COL['blue'] if 'blue' in COL else COL['metro'])
    elif kind=='carrito':
        rr(d,(3,3,21,13),2,COL['brick']);rr(d,(6,5,18,10),1,COL['gold']);d.ellipse((1,12,5,15),fill=O);d.ellipse((18,12,22,15),fill=O)
    elif kind=='ambulancia':
        rr(d,(1,1,w-2,h-2),4,COL['white']);rr(d,(25,3,42,14),3,'#7294A2');d.rectangle((13,4,18,13),fill=COL['red']);d.rectangle((9,8,22,10),fill=COL['red']);d.rectangle((3,4,6,7),fill=COL['metro'])
    else:
        rr(d,(1,2,w-2,h-3),3,COL['roof']);rr(d,(25,4,46,15),1,'#B2B9B7');rr(d,(4,4,21,15),1,'#67808F')
    return i

assets=[]
def save(asset,name,code,meta=None):
    p=OUT/'vehiculos'/name;asset.save(p)
    assets.append(dict(encargo=code,archivo=str(p.relative_to(OUT)),nombre=name,tamano=list(asset.size),estado='sprite_prototipo_tecnico',**(meta or {})))
    return p
# C-01
c1=[('metro_coche_cabina_delantera.png',train('cab_frente'),22),('metro_coche_intermedio.png',train('medio'),22),('metro_coche_cabina_trasera.png',train('cab_trasera'),22),('tranvia_3_modulos.png',tram(),20),('metroplus_articulado.png',normal_bus(144,20,art=True),18),('alimentador.png',normal_bus(96,20,COL['white'],feeder=True),12),('buseta.png',normal_bus(64,20,'#E38835',buseta=True),8),('chiva.png',normal_bus(64,20,COL['brick'],chiva=True),8)]
for c,col in [('k',COL['cablek']),('j',COL['cablej']),('l',COL['cablel']),('h',COL['cableh']),('m',COL['cablem']),('p',COL['cablep'])]: c1.append((f'metrocable_cabina_{c}.png',cabina(col),3))
for fname,im,meters in c1:save(im,fname,'C-01',{'escala_px_por_m':8,'metros_representados':meters})
# C-02
c2=[('taxi.png',car(COL['yellow']),4.5)]
for color,cc in [('rojo',COL['red']),('azul',COL['metro']),('blanco',COL['white']),('gris','#7C8489'),('negro','#373B41'),('verde','#4F8A3C')]:c2.append((f'carro_{color}.png',car(cc),4.5))
for typ in ['camioneta','moto','bici','carrito','ambulancia','camion']:c2.append((f'{typ}.png',other_vehicle(typ),None))
for fname,im,meters in c2:save(im,fname,'C-02',{'escala_px_por_m':8,'metros_representados':meters})
# C-03 door frames - top edge is the left-hand side as vehicle travels right
frames=[]
for k,name in enumerate(['cerradas','entreabiertas','abiertas']):
    im=normal_bus(144,20,art=True);d=ImageDraw.Draw(im)
    for x in (24,107):
        d.rectangle((x,2,x+13,4),fill='#11181B')
        if k==0:d.line((x+6,1,x+6,5),fill='#B0C6CC',width=1)
        elif k==1:
            d.polygon([(x,2),(x+5,0),(x+7,4),(x+2,6)],fill=COL['roof'])
            d.polygon([(x+8,4),(x+12,0),(x+15,3),(x+10,7)],fill=COL['roof'])
        else:
            d.line((x,1,x-2,8),fill=COL['rooflite'],width=2)
            d.line((x+13,1,x+15,8),fill=COL['rooflite'],width=2)
    frames.append(im);save(im,f'bus_puertas_izquierda_{name}.png','C-03',{'frame':k})
sh=img(144*3,20)
for k,im in enumerate(frames):sh.alpha_composite(im,(144*k,0))
save(sh,'spr_puertas_bus.png','C-03',{'frames':3,'frame_width':144})

# A spacious reference sheet with every vehicle at native sprite dimensions, plus x5 visualization
sheet=img(1536,1024)
layout=[]
row1=[c1[0],c1[1],c1[2]];row2=[c1[3],c1[4]];row3=[c1[5],c1[6],c1[7]];row4=c1[8:]
for row,yy in zip([row1,row2,row3,row4],[110,320,525,735]):
    xx=115
    for name,im,meters in row:
        # 2x presentation in large sheet, still a precise 8 px/m sprite delivered separately
        enlarged=im.resize((im.width*2,im.height*2),Image.Resampling.NEAREST)
        sheet.alpha_composite(enlarged,(xx,yy));layout.append({'sprite':name,'x':xx,'y':yy,'w':enlarged.width,'h':enlarged.height,'previsualizacion':2});xx+=enlarged.width+48
sheet.save(OUT/'vehiculos'/'spr_vehiculos_sistema.png')
street=img(1536,1024);xx=120;yy=130;layoutstreet=[]
for name,im,meters in c2:
    enlarged=im.resize((im.width*4,im.height*4),Image.Resampling.NEAREST)
    if xx+enlarged.width>1500:xx=120;yy+=175
    street.alpha_composite(enlarged,(xx,yy));layoutstreet.append({'sprite':name,'x':xx,'y':yy,'w':enlarged.width,'h':enlarged.height,'previsualizacion':4});xx+=enlarged.width+45
street.save(OUT/'vehiculos'/'spr_vehiculos_calle.png')
(OUT/'vehiculos'/'atlas_layout.json').write_text(json.dumps({'C-01':layout,'C-02':layoutstreet,'nota':'Hojas son presentaciones a 2x/4x. Sprites individuales mantienen escala 8px/metro. Usa archivos individuales para fisica.'},ensure_ascii=False,indent=2))

def preview_image(source,filename,factor=2):
    im=Image.open(source); scale=min(factor,4)
    im=im.resize((im.width*scale,im.height*scale),Image.Resampling.NEAREST)
    bg=Image.new('RGBA',im.size,(241,236,224,255))
    bg.alpha_composite(im);bg.convert('RGB').save(OUT/'previews'/filename)
preview_image(OUT/'vehiculos'/'spr_vehiculos_sistema.png','vehiculos_sistema.png',1)
preview_image(OUT/'vehiculos'/'spr_vehiculos_calle.png','vehiculos_calle.png',1)
# Technical conformity
qa={'total_vehiculos_unicos':len(c1)+len(c2),'frames_puertas':len(frames),'errores':[]}
for a in assets:
    pic=Image.open(OUT/a['archivo']);
    if pic.mode!='RGBA':qa['errores'].append('no_RGBA_'+a['archivo'])
    if 'metros_representados' in a and a['metros_representados'] is not None:
        if pic.width!=a['metros_representados']*8:qa['errores'].append('escala_'+a['archivo'])
    if not pic.getbbox():qa['errores'].append('vacio_'+a['archivo'])
qa.update({'layout':len(layout),'layout_calle':len(layoutstreet)})
(OUT/'documentacion'/'qa_vehiculos.json').write_text(json.dumps(qa,ensure_ascii=False,indent=2))
(OUT/'documentacion'/'manifest_vehiculos.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2))
print('Vehicles:',len(c1),len(c2),qa)
