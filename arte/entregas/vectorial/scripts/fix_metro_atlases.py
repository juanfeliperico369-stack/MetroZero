from PIL import Image
from pathlib import Path
import json
R=Path('/mnt/data/EL_METRO_ARTE_FINAL_v052'); V=R/'vehiculos'; D=R/'documentacion'
layout=json.loads((V/'atlas_layout.json').read_text())
for code,fn in [('C-01','spr_vehiculos_sistema.png'),('C-02','spr_vehiculos_calle.png')]:
    entries=layout[code]
    # Maintain original 1536x1024 sheet with all sprites exactly at natural 8 px/m scale.
    native=Image.new('RGBA',(1536,1024),(0,0,0,0))
    places=[]
    for item in entries:
        sprite=Image.open(V/item['sprite']).convert('RGBA')
        # use stored presentational layout divided by scale to fit in compact top portion
        orig_scale=item['previsualizacion']; x=item['x'];y=item['y']
        native.alpha_composite(sprite,(x,y))
        places.append({'sprite':item['sprite'],'x':x,'y':y,'w':sprite.width,'h':sprite.height,'factor':1})
    native.save(V/fn)
    layout[code+'_native']=places
    # separate enlarged view is NOT to be ingested at native scale
    show=Image.new('RGBA',(1536,1024),(0,0,0,0))
    for item in entries:
        im=Image.open(V/item['sprite']).convert('RGBA');scale=item['previsualizacion'];im=im.resize((im.width*scale,im.height*scale),Image.Resampling.NEAREST)
        show.alpha_composite(im,(item['x'],item['y']))
    show.save(R/'previews'/fn.replace('.png','_ampliado.png'))
    bg=Image.new('RGBA',show.size,'#F1ECE0'); bg.alpha_composite(show)
    bg.convert('RGB').save(R/'previews'/fn.replace('.png','_sobre_papel.png'))
(V/'atlas_layout.json').write_text(json.dumps(layout,indent=2,ensure_ascii=False))
print('native atlases fixed')
