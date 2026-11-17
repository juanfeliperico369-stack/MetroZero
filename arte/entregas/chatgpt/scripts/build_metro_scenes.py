from pathlib import Path
import math, random, cairosvg, json
from PIL import Image, ImageDraw, ImageFont
ROOT=Path('/mnt/data/EL_METRO_ARTE_FINAL_v052')
for fold in ['cabinas','portadas','fiestas','previews','documentacion']:(ROOT/fold).mkdir(exist_ok=True)
COL={'ink':'#141414','paper':'#F1ECE0','cream':'#FAF6EC','metro':'#1C5C9C','blue':'#12446C','teal':'#0E6F76','green':'#59AB42','brick':'#B4583A','hills':'#5F8F86','gold':'#F6C538','purple':'#8E5B7A','night':'#0F2A45','river':'#5F7F73'}
def svg(width,height,body,defs=''):
 return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}"><defs>{defs}</defs>{body}</svg>'''
def rect(x,y,w,h,fill,stroke='none',sw=1,rx=0):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def circ(x,y,r,fill,stroke='none',sw=1):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def path(d,fill='none',stroke='none',sw=1):return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>'
def line(x1,y1,x2,y2,col,sw=1):return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{col}" stroke-width="{sw}"/>'
def save_art(folder,name,s,width=None,height=None):
 p=ROOT/folder/name;p.with_suffix('.svg').write_text(s,encoding='utf-8');cairosvg.svg2png(bytestring=s.encode(),write_to=str(p.with_suffix('.png')),output_width=width,output_height=height);return p.with_suffix('.png')
# cockpit: bright magenta window as chroma-key, exactly pixel-accurate, no artifacts beyond panel.
def cabina(w,h,bus=False):
 # Panel has compositional scale based on output: windshield section top half in magenta with no drawn overlays
 s=f'""' if False else ''
 bg=f'''<linearGradient id="metal" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#5B6770"/><stop offset="1" stop-color="#202932"/></linearGradient>
 <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#283540"/><stop offset="1" stop-color="#121B23"/></linearGradient>'''
 x=.065*w;y=.075*h;ww=.87*w;wh=.52*h
 # draw pure magenta rectangle first then opaque interior framing, no in-window glare
 s+=rect(0,0,w,h,'#101820')
 s+=rect(20,28,w-40,h-40,'url(#metal)',rx=38)
 s+=rect(x,y,ww,wh,'#FF00FF')
 # window dark frame, at edge only, pure magenta inside
 s+=f'<rect x="{x}" y="{y}" width="{ww}" height="{wh}" rx="4" fill="none" stroke="#11171D" stroke-width="{max(14,w*.02)}"/>'
 s+=line(w*.5,y,w*.5,y+wh,'#18242D',max(7,w*.008))
 s+=line(x,y+wh,x+ww,y+wh,'#10171E',max(16,w*.025))
 s+=rect(w*.025,h*.625,w*.95,h*.34,'url(#panel)',stroke='#6F7B80',sw=5,rx=24)
 s+=rect(w*.07,h*.653,w*.86,h*.25,'#2B3942',stroke='#10171E',sw=6,rx=16)
 # display, unlabelled
 s+=rect(w*.37,h*.686,w*.26,h*.095,'#0D1B25',stroke='#71818A',sw=5,rx=12)
 s+=rect(w*.395,h*.704,w*.21,h*.05,'#252F31',rx=5)
 for k in range(8):
  s+=rect(w*(.407+.023*k),h*.736,w*.014,h*.008,'#D49D3A',rx=2)
 # analog instrument radial graduations no text
 cx,cy=w*.27,h*.765;r=min(w*.10,h*.11)
 s+=circ(cx,cy,r,'#121C24',stroke='#78858E',sw=7)
 s+=circ(cx,cy,r*.77,'#E6DCC7',stroke='#0E171D',sw=4)
 for a in range(215,510,30):
  xx=cx+math.cos(math.radians(a))*r*.68; yy=cy+math.sin(math.radians(a))*r*.68
  xxx=cx+math.cos(math.radians(a))*r*.47; yyy=cy+math.sin(math.radians(a))*r*.47
  s+=line(xx,yy,xxx,yyy,'#252F3B',3)
 s+=line(cx,cy,cx-r*.4,cy+r*.22,COL['metro'],5)+circ(cx,cy,6,COL['ink'])
 # dashboard buttons
 for j,cc in enumerate([COL['metro'],'#E1B855','#59AB42','#DF8F50']):
  s+=circ(w*(.4+.07*j),h*.83,min(w*.014,h*.013),cc,'#12151D',4)
 for j in range(4):s+=rect(w*(.39+.075*j),h*.86,w*.045,h*.027,'#8B969A',stroke='#182028',sw=3,rx=6)
 # combined lever or bus steering
 if bus:
  # steering wheel foreground on left
  px,py=w*.25,h*.865;rad=min(w*.13,h*.125)
  s+=circ(px,py,rad,'none',stroke='#14191D',sw=max(20,w*.015))
  s+=circ(px,py,rad*.73,'none',stroke='#76838B',sw=7)
  for aa in [15,155,265]:s+=line(px,py,px+rad*.88*math.cos(math.radians(aa)),py+rad*.88*math.sin(math.radians(aa)),'#29363F',18)
  s+=circ(px,py,rad*.22,'#273740',stroke='#181D23',sw=6)
  # card validator at right
  s+=rect(w*.80,h*.735,w*.105,h*.14,'#1D2D38',stroke='#8FA3A5',sw=5,rx=10)
  s+=rect(w*.815,h*.75,w*.076,h*.072,COL['metro'],rx=5)
  for xx in range(3):s+=path(f'M {w*(.835+xx*.011)} {h*.845} q {w*.02} {-h*.015} 0 {-h*.03}',stroke='#CCD8D3',sw=2)
 else:
  # knob on right side. Clean functional proportions.
  s+=path(f'M {w*.79} {h*.89} L {w*.81} {h*.775}',stroke='#12191F',sw=24)
  s+=path(f'M {w*.79} {h*.89} L {w*.81} {h*.775}',stroke='#89959B',sw=16)
  s+=rect(w*.775,h*.745,w*.075,h*.038,'#252E36',stroke='#93A1A6',sw=4,rx=10)
  s+=circ(w*.83,h*.83,min(w*.019,h*.017),'#5E6F78','#11181E',4)
 # side controls tiny
 s+=rect(w*.075,h*.92,w*.85,h*.018,'#384A58',rx=5)
 for k in range(5):s+=rect(w*(.12+k*.06),h*.899,w*.035,h*.018,'#657782',rx=3)
 return svg(w,h,s,bg)
for kind,w,h,fn in [('metro',1024,1536,'cab_consola_vertical'),('metro',1536,1024,'cab_consola_horizontal'),('bus',1536,1024,'cab_bus')]:
 ss=cabina(w,h,bus=kind=='bus');save_art('cabinas',fn,ss)

# Key visual scene drawn using scalable shapes; it references geography generically without copying photographs.
def mountains(w,h,seed=18):
 rand=random.Random(seed)
 parts=''
 parts+=path(f'M0 {h*.37} Q{w*.12} {h*.22} {w*.24} {h*.31} T {w*.52} {h*.24} T {w*.78} {h*.37} T {w} {h*.23} L{w} {h*.7} L0 {h*.7} Z','#7888A0')
 parts+=path(f'M0 {h*.46} Q{w*.14} {h*.38} {w*.22} {h*.43} T {w*.42} {h*.36} T {w*.63} {h*.46} T {w} {h*.38} L{w} {h*.79} L0 {h*.79} Z','#587B70')
 parts+=path(f'M0 {h*.59} Q{w*.18} {h*.48} {w*.38} {h*.57} T {w*.78} {h*.50} T {w} {h*.52} L{w} {h*.79} L0 {h*.79} Z','#3F6B59')
 # hillside Medellín houses on far slope across valley
 for k in range(245):
  x=rand.randrange(0,w); yy=rand.randint(int(h*.39),int(h*.70)); ww=rand.randint(7,22);hh=rand.randint(8,29)
  if yy < h*(.39 + .09*math.sin(x/w*math.pi*1.9)):continue
  c=rand.choice(['#A8593D','#B96743','#9A4630','#D18A5C','#BF7451'])
  parts+=rect(x,yy,ww,hh,c)
  parts+=rect(x,yy,ww,3,'#8F4936')
  if ww>10:parts+=rect(x+3,yy+6,3,4,'#6D594C')
 return parts

def cover(w=1536,h=1024):
 defs='''<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#3D2E5F"/><stop offset=".5" stop-color="#C97B78"/><stop offset="1" stop-color="#F4D9A8"/></linearGradient><linearGradient id="river" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#5F7F73"/><stop offset="1" stop-color="#334D51"/></linearGradient><linearGradient id="bridge" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#C9C9C2"/><stop offset="1" stop-color="#59616B"/></linearGradient>'''
 s=rect(0,0,w,h,'url(#sky)')
 s+=circ(1125,244,104,'#F9CF98')
 for k in range(5):s+=path(f'M {100+210*k} {138+12*k} q 40 -20 80 0 q 50 -14 95 3',stroke='#E4BFA9',sw=3)
 s+=mountains(w,h)
 # foreground river
 s+=path('M-30 915 C300 860 675 982 1560 785 L1560 1050 L0 1050Z','url(#river)')
 for k in range(20):
  y=862+random.Random(k).randint(0,110);x=random.Random(k+80).randint(40,1400)
  s+=line(x,y,x+random.Random(k+90).randint(18,75),y,'#A7B09C',3)
 # cable line above hillside
 s+=path('M860 230 L1536 392',stroke='#182831',sw=8)
 s+=path('M860 242 L1536 402',stroke='#59605D',sw=3)
 for x,y in [(1040,280),(1304,343)]:
  s+=line(x,y,x,y+56,'#28363A',5)+rect(x-25,y+48,50,39,'#E2E5E0',stroke='#253239',sw=6,rx=10)
  s+=rect(x-16,y+53,32,20,'#688A94',rx=5)
  s+=rect(x-18,y+77,36,5,COL['metro'])
 # viaduct with dark underside + pillars
 s+=path('M-20 775 L1558 515 L1558 633 L-20 895 Z','url(#bridge)')
 s+=path('M-20 778 L1558 515 L1558 545 L-20 806 Z','#DADED8')
 s+=path('M-20 861 L1558 603 L1558 632 L-20 896 Z','#4E5961')
 for x,top,bottom in [(175,804,1030),(667,722,1050),(1260,623,1040)]:
  s+=path(f'M{x} {top} l65 -12 l0 {bottom-top+20} l-65 12 Z','#828B8D')
  s+=rect(x+15,top+30,19,bottom-top,'#A6ABAA')
 # top rail and mast
 s+=path('M-20 782 L1560 522',stroke='#39494F',sw=10)
 for x,y in [(430,701),(865,629),(1250,564)]:
  s+=line(x,y-170,x,y+9,'#566268',7)+line(x-28,y-150,x+55,y-148,'#596366',7)
 s+=path('M0 489 Q850 400 1536 338',stroke='#4A5058',sw=3)
 # train body spans 3 coupled modules, fixed side profile at visual scale
 x0=365; y0=579; x1=1440
 s+=path(f'M{x0} 648 L{x1} 469 L{x1+20} 503 L{x0} 690 Z','#141C23')
 for i in range(3):
  xa=x0+i*335;xb=xa+330;yta=585-i*53;ybot=688-i*53
  s+=path(f'M{xa} {yta} L{xb} {yta-53} L{xb} {ybot-53} L{xa} {ybot} Z','#ECF0EC',stroke='#26343E',sw=5)
  s+=path(f'M{xa} {yta+68} L{xb} {yta+15} L{xb} {yta+28} L{xa} {yta+81} Z',COL['metro'])
  # panoramic windows evenly spaced following line slope
  for k in range(6):
   xx=xa+26+k*46; yy=yta-xx/6+xa/6+20
   s+=path(f'M {xx} {yy} l33 -5 l0 28 l-33 5 Z','#58758A',stroke='#29363C',sw=2)
  for dx in (16,324):s+=line(xa+dx,yta+8,yta if False else xa+dx,yta+70,'#8DA0AA',2)
 # cab front, skylight and cheerful grandmother behind glass
 s+=path('M1400 418 Q1441 411 1452 456 L1459 509 L1400 517 Z','#D9E2E0',stroke='#1F313A',sw=5)
 s+=path('M1410 432 Q1441 427 1441 462 L1444 477 L1408 481 Z','#507281',stroke='#27343B',sw=4)
 # Rosalba tiny portrait in cab
 s+=circ(1426,453,9,'#F1C9A5')+path('M1416 451 Q1424 434 1434 449',stroke='#DCD8D0',sw=6)
 s+=rect(1418,460,18,12,'#12446C',rx=3)
 s+=rect(1407,493,43,8,COL['metro'],rx=2)
 # shrubbery, but no shadow cast
 for k in range(16):
  x=30+k*92;yy=895+random.Random(k+29).randint(10,100)
  s+=circ(x,yy,random.Random(k+4).randint(16,33),random.Random(k+10).choice(['#2F6B35','#4F8A3C','#457747']))
 # birds warm silhouettes
 for xx,yy in [(620,214),(688,257),(790,222)]:s+=path(f'M{xx-18} {yy} q11 -10 18 0 q9 -10 21 0',stroke='#3D4052',sw=3)
 return svg(w,h,s,defs)
cover_svg=cover()
png_clean=save_art('portadas','clave_portada',cover_svg)
# Do not use an actual Metro logo. Title is plain typographic, safely composited after rasterized art.
im=Image.open(png_clean).convert('RGBA')
back=Image.new('RGBA',im.size,(0,0,0,0));dr=ImageDraw.Draw(back)
dr.rounded_rectangle((62,65,660,285),radius=24,fill=(15,42,69,208))
im=Image.alpha_composite(im,back)
font_path='/usr/share/fonts/truetype/roboto/unhinted/RobotoCondensed-Bold.ttf'
f1=ImageFont.truetype(font_path,116);f2=ImageFont.truetype(font_path,51)
dr=ImageDraw.Draw(im)
dr.text((90,77),'EL METRO',font=f1,fill='#FAF6EC',stroke_fill='#141414',stroke_width=3)
dr.text((96,203),'LA ÚLTIMA VUELTA',font=f2,fill='#FBE7B0')
im.save(ROOT/'portadas'/'clave_compartir.png')
# Vertical waiting-scene; Rosalba seen from behind, train/viaduct behind, original vector artwork, no text.
def loading(w=1024,h=1536):
 defs='''<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#3D2E5F"/><stop offset=".60" stop-color="#EAA373"/><stop offset="1" stop-color="#F4D9A8"/></linearGradient><linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#B7B7AF"/><stop offset="1" stop-color="#6D7678"/></linearGradient>'''
 s=rect(0,0,w,h,'url(#sky)')
 s+=circ(770,368,145,'#FFD4A1')
 s+=mountains(w,h,seed=53)
 s+=path('M-40 1040 L1100 842 L1100 1030 L-40 1230 Z','#ADB4AF')
 for x in [180,790]:
  s+=rect(x,1070,47,410,'#6D797F')
 s+=path('M-40 1120 L1100 920',stroke='#2C4149',sw=16)
 # distant cable above mountains
 s+=path('M260 342 L1040 458',stroke='#21353D',sw=6)
 for x,y in [(510,379),(850,430)]:
  s+=line(x,y,x,y+71,'#23333D',6)+rect(x-28,y+68,58,50,'#DCE4DD',stroke='#26343B',sw=6,rx=12)+rect(x-19,y+76,40,27,'#71909B')
 # platform foreground
 s+=path('M-30 1180 L1054 1010 L1054 1560 L-30 1560 Z','url(#floor)')
 s+=path('M0 1310 L1024 1140',stroke='#F6C538',sw=24)
 for k in range(12):
  yy=1220+k*40;s+=line(0,yy,1024,yy-180,'#87908C',2)
 # body of Rosalba from behind
 s+=path('M315 1495 L340 1270 Q374 1177 483 1180 L563 1190 Q670 1220 682 1305 L710 1537 Z','#12446C',stroke='#141414',sw=12)
 s+=path('M455 1200 Q451 1120 490 1108 Q554 1095 575 1165 L558 1208 Z','#F1C9A5',stroke='#141414',sw=7)
 s+=path('M456 1152 Q452 1089 511 1070 Q561 1070 577 1140 L552 1170 L468 1168 Z','#DCD8D0',stroke='#141414',sw=9)
 s+=path('M495 1105 C512 1050 546 1056 565 1103',stroke='#9AA1A8',sw=13)
 s+=path('M343 1290 L258 1510',stroke='#12446C',sw=61)+path('M665 1290 L742 1505',stroke='#12446C',sw=61)
 s+=path('M437 1216 Q518 1233 583 1202',stroke=COL['metro'],sw=15)
 # collar and small tinto tumbler in right hand
 s+=rect(712,1456,35,70,'#3F4444',rx=9)+rect(714,1457,30,8,'#D9B6A5',rx=3)
 return svg(w,h,s,defs)
save_art('portadas','clave_carga',loading())

# User-facing preview collage with legitimate art, not generated interface mockups.
preview=Image.new('RGB',(1600,900),'#F1ECE0')
from PIL import ImageOps
p1=Image.open(ROOT/'portadas'/'clave_portada.png').convert('RGB');p1=ImageOps.fit(p1,(960,640))
p2=Image.open(ROOT/'portadas'/'clave_carga.png').convert('RGB');p2=ImageOps.fit(p2,(480,800))
preview.paste(p1,(30,140));preview.paste(p2,(1040,40))
d=ImageDraw.Draw(preview);f=ImageFont.truetype(font_path,56);d.text((40,38),'EL METRO · PORTADA Y CARGA',font=f,fill='#154A80')
preview.save(ROOT/'previews'/'clave_art_preview.png')

# C-50 festival top-down icon resources; designed using a single geometric system and transparent backgrounds.
svgs=[]
def sprite(name,svg_body,color,note=''):
 s=svg(128,128,svg_body)
 p=save_art('fiestas',name,s)
 svgs.append({'nombre':name,'png':str(p.relative_to(ROOT)),'svg':str(p.with_suffix('.svg').relative_to(ROOT)),'color':color,'nota':note})
 return p
fest=[COL['green'],'#9B3FAF','#F7C325','#D7263D','#F28C28','#3A7D44','#E83E8C','#2EC4F1']
for k,color in enumerate(fest):
 x,y=64,64; ang=k*math.pi/4
 body=path('M64 32 C87 51 80 77 64 97 C47 77 41 51 64 32Z',color,stroke='#141414',sw=4)
 body+=path('M64 39L64 92',stroke='#F1ECE0',sw=3)
 sprite(f'petalo_{k+1:02d}',body,color,'Pétalo cenital, variedad cromática')
# circle flowers in silleta viewed above, simple wooden circular frame
body=circ(64,64,48,'#8E612A','#141414',6)+circ(64,64,40,'#B4583A','#F1ECE0',3)
for j in range(13):
 a=j*2*math.pi/13;x=64+30*math.cos(a);y=64+30*math.sin(a)
 for p in range(5):
  aa=p*2*math.pi/5
  body+=circ(round(x+7*math.cos(aa),1),round(y+7*math.sin(aa),1),5,['#F7C325','#D7263D','#9B3FAF','#F28C28'][j%4])
 body+=circ(x,y,3,'#F1ECE0')
sprite('silleta_cenital',body,'#9B3FAF','Flores y aro de madera; no confundir con símbolo corporativo')
for name,color in [('farol_rojo','#D62828'),('farol_verde','#2A9D8F'),('farol_amarillo','#F4D35E')]:
 body=path('M45 29H83L95 49V95L64 109L33 95V49Z',color,stroke='#141414',sw=5)
 body+=rect(48,45,32,49,'#FFF1C1',stroke='#141414',sw=3,rx=4)
 body+=path('M64 14V30M54 14H74',stroke='#141414',sw=4)
 sprite(name,body,color,'Farol de papel visto de arriba')
body=circ(64,64,25,'#FFB347',stroke='#D62828',sw=3)+circ(64,64,9,'#FFF1C1')+path('M64 58Q80 40 65 22Q51 42 64 58Z','#FFD169')
sprite('velita',body,'#FFB347','Vela top-down; llama estilizada')
for name,iscurve in [('guirnalda_recta',False),('guirnalda_curva',True)]:
 body=path('M12 65 Q65 12 116 65' if iscurve else 'M12 64H116',stroke='#2F6B35',sw=5)
 for j in range(7):
  x=19+j*15;y=(64-28*math.sin(j*math.pi/6) if iscurve else 64)
  body+=circ(x,y,6,['#FFF1C1','#FFC23D','#E83E8C','#2EC4F1'][j%4],stroke='#141414',sw=2)
 sprite(name,body,'#2EC4F1','Guirnalda para componer en el mapa')
# shapes for Christmas lights
body=path('M64 20L76 53L111 53L83 74L93 107L64 89L35 107L45 74L17 53L52 53Z','#FFC23D',stroke='#141414',sw=5)
sprite('luz_estrella',body,'#FFC23D','Figura de luz sin texto')
body=''
for k in range(8):
 a=2*math.pi*k/8;body+=circ(64+30*math.cos(a),64+30*math.sin(a),16,'#E83E8C','#141414',3)
body+=circ(64,64,19,'#FFF1C1','#141414',4)
sprite('luz_flor',body,'#E83E8C','Flor luminosa')
body=path('M31 91V61L64 35L97 61V91Z','#FFF1C1','#141414',5)+path('M58 91V71H72V91',COL['brick'],stroke='#141414',sw=4)+path('M26 60L64 27L102 60',stroke='#FFC23D',sw=6)
sprite('luz_pesebre_sencillo',body,'#FFF1C1','Ilustración abstracta de portal; sin figuras humanas')
body=path('M15 37L113 37',stroke='#141414',sw=5)
for k in range(6):
 x=18+k*17;co=['#9B3FAF','#F7C325','#D7263D','#F28C28','#3A7D44'][k%5]
 body+=path(f'M{x} 37l15 0l-7 42Z',co,stroke='#141414',sw=2)
sprite('banderines_feria',body,'#9B3FAF','Banderines top-down')
# supplementary original fiesta motifs
body=path('M38 104L64 28L90 104Z','#3A7D44',stroke='#141414',sw=4)
for k in range(3):body+=circ(52+k*12,50+k*16,7,['#F7C325','#9B3FAF','#D7263D'][k],stroke='#141414',sw=2)
sprite('ramillete_flores',body,'#F7C325','Ramillete para escenas de Feria')
body=rect(23,44,82,49,'#FFF1C1',stroke='#141414',sw=5,rx=12)+path('M31 66H96',stroke='#2EC4F1',sw=5)+circ(40,66,6,'#E83E8C')+circ(86,66,6,'#FFC23D')
sprite('figura_luz_guirnalda',body,'#FFF1C1','Módulo de alumbrado')
# sheet grid 5x4 128 each
imgs=[Image.open(ROOT/z['png']).convert('RGBA') for z in svgs]
sh=Image.new('RGBA',(128*5,128*4),(0,0,0,0))
for i,im in enumerate(imgs):sh.alpha_composite(im,(i%5*128,i//5*128))
sh.save(ROOT/'fiestas'/'fiesta_sprites.png')
( ROOT/'documentacion'/'manifest_fiestas.json').write_text(json.dumps(svgs,ensure_ascii=False,indent=2))
print('Scenes completed: 3 cockpits, 3 cover/carga,',len(svgs),'party icons')
