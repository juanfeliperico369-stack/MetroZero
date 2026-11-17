from PIL import Image
from pathlib import Path
R=Path('/mnt/data/EL_METRO_ARTE_FINAL_v052')
for name in ['cabinas/cab_consola_vertical.png','cabinas/cab_consola_horizontal.png','cabinas/cab_bus.png','portadas/clave_portada.png','portadas/clave_compartir.png','portadas/clave_carga.png']:
 p=R/name;im=Image.open(p).convert('RGB');pixels=im.load()
 mask=Image.new('1',im.size,0);mp=mask.load()
 if name.startswith('cabinas/'):
  for y in range(im.height):
   for x in range(im.width):
    if pixels[x,y] == (255,0,255):mp[x,y]=1
 # 31 colors plus reserved magenta
 out=im.quantize(colors=31,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE).convert('RGB')
 if name.startswith('cabinas/'):
  out.paste((255,0,255),mask=mask)
 out.save(p,optimize=True)
 colors=out.getcolors(out.width*out.height)
 print(name,'distinct',len(colors),'pure magenta',sum(1 for n,c in colors if c==(255,0,255)))
