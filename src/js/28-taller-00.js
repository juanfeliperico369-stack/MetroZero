/* Taller de arte procedural (entrega de ChatGPT/Codex para el Plan único, M1–M6): mallas en metros para el motor G3 y respaldo en Canvas 2D. */
(() => {
  const T = EM.taller = {};
  T.rotulo = (g, texto, x, y, ancho, alto, ocupados) => {
    g.save();
    g.font = 'bold 13px Cuerpo, sans-serif';
    const w = Math.ceil(g.measureText(texto).width) + 12, h = 22;
    for (const [dx, dy] of [[14,-h-6],[-w-14,-h-6],[14,8],[-w-14,8]]) {
      const l = x + dx, t = y + dy, r = l + w, b = t + h;
      if (l < 0 || t < 0 || r > ancho || b > alto ||
          ocupados.some(q => q[0] < r && q[2] > l && q[1] < b && q[3] > t)) continue;
      g.fillStyle = '#f1ece0'; g.fillRect(l,t,w,h);
      g.fillStyle = '#154a80'; g.textAlign = 'left'; g.textBaseline = 'middle';
      g.fillText(texto,l+6,t+h/2); ocupados.push([l,t,r,b]); g.restore(); return true;
    }
    g.restore(); return false;
  };
  T.controles = (vista) => {
    for (const [id,titulo,nombre] of [['lbVista','Cámara','Acercar o alejar la cámara. Ahora: '+vista],
      ['lbFoto','Foto','Tomar una foto'],['lbCam','Mirar','Mover la cámara libre']]) {
      const b=document.getElementById(id); if (!b) continue;
      let etiqueta=b.querySelector('.taller-etiqueta');
      if (!etiqueta) {
        etiqueta=document.createElement('span'); etiqueta.className='taller-etiqueta';
        etiqueta.style.cssText='display:block;font:700 11px/13px Cuerpo,sans-serif';
        b.append(etiqueta);
      }
      const original=b.querySelector('small'); if (original) original.hidden=true;
      etiqueta.textContent=titulo; b.setAttribute('aria-label',nombre);
    }
  };

  // Malla local en metros. X apunta al frente, Y hacia arriba, Z al costado.
  const tonos = new Map();
  function color(hex) {
    if (!tonos.has(hex)) tonos.set(hex,[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255));
    return tonos.get(hex);
  }
  const resta=(a,b)=>a.map((n,i)=>n-b[i]);
  const cruz=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const unidad=v=>{const l=Math.hypot(...v);return v.map(n=>n/(l||1));};
  class Malla {
    constructor(){this.caras=[];}
    cara(p,c,luz=false){this.caras.push({p,c,luz,n:unidad(cruz(resta(p[1],p[0]),resta(p[2],p[0])))});}
    // Secciones convexas, recorridas en sentido antihorario en XY.
    perfil(xy,z0,z1,c,luz=false){
      const a=xy.map(([x,y])=>[x,y,z0]), b=xy.map(([x,y])=>[x,y,z1]);
      this.cara([...a].reverse(),c,luz); this.cara(b,c,luz);
      a.forEach((v,i)=>{const j=(i+1)%a.length;this.cara([v,a[j],b[j],b[i]],c,luz);});
    }
    caja(x,y,z,l,h,w,c,luz=false){
      this.perfil([[x-l/2,y],[x+l/2,y],[x+l/2,y+h],[x-l/2,y+h]],z-w/2,z+w/2,c,luz);
    }
    barra(a,b,r,c,lados=6){
      const eje=unidad(resta(b,a)), u=unidad(cruz(eje,Math.abs(eje[1])<.9?[0,1,0]:[1,0,0])), v=cruz(eje,u);
      const aro=p=>Array.from({length:lados},(_,i)=>p.map((q,k)=>q+r*(u[k]*Math.cos(2*Math.PI*i/lados)+v[k]*Math.sin(2*Math.PI*i/lados))));
      const ini=aro(a),fin=aro(b);this.cara([...ini].reverse(),c);this.cara(fin,c);
      ini.forEach((p,i)=>{const j=(i+1)%lados;this.cara([p,ini[j],fin[j],fin[i]],c);});
    }
    datos(){
      const datos=[];
      for (const {p,c,luz,n} of this.caras) for(let j=1;j+1<p.length;j++)
        for(const v of [p[0],p[j],p[j+1]]) datos.push(...v,...n,...color(c),luz?4:0);
      return new Float32Array(datos);
    }
  }
  T.Malla=Malla;
  // Respaldo Canvas: el llamador coloca el origen al pie del modelo.
  // yaw=0, alzado=0: perfil mirando a la derecha. PI/2 de alzado: planta.
  T.lienzo=(g,m,px,yaw=0,alzado=0,noche=false)=>{
    const ca=Math.cos(yaw),sa=Math.sin(yaw),ce=Math.cos(alzado),se=Math.sin(alzado);
    const proyecta=([x,y,z])=>{const d=x*sa+z*ca;return [(x*ca-z*sa)*px,(d*se-y*ce)*px,d*ce+y*se];};
    // Caché del último sprite por modelo. Volver a usar la misma instancia al animar.
    const clave=[px,yaw,alzado,noche].join('/');
    if(m.sprite?.clave===clave){const {cv,x,y,w,h}=m.sprite;g.drawImage(cv,x,y,w,h);return;}
    const caras=[];let xmin=Infinity,xmax=-Infinity,ymin=Infinity,ymax=-Infinity;
    for(const f of m.caras){
      if((f.n[0]*sa+f.n[2]*ca)*ce+f.n[1]*se<.001) continue;
      const p=f.p.map(proyecta), luz=f.luz?1:(noche?.44:.82)+.16*f.n[1]-.09*f.n[0];
      for(const [x,y] of p){xmin=Math.min(xmin,x);xmax=Math.max(xmax,x);ymin=Math.min(ymin,y);ymax=Math.max(ymax,y);}
      caras.push([p,color(f.c).map(c=>Math.round(255*c*luz))]);
    }
    if(!caras.length)return;
    const x=Math.floor(xmin)-1,y=Math.floor(ymin)-1,w=Math.ceil(xmax)-x+1,h=Math.ceil(ymax)-y+1;
    const escala=Math.min(1,512/Math.max(w,h)),cv=document.createElement('canvas');
    cv.width=Math.ceil(w*escala);cv.height=Math.ceil(h*escala);
    const ctx=cv.getContext('2d'),im=ctx.createImageData(cv.width,cv.height);
    const zbuf=new Float32Array(cv.width*cv.height).fill(-Infinity);
    for(const [p,c] of caras){
      const q=p.map(([u,v,d])=>[(u-x)*escala,(v-y)*escala,d]);
      for(let j=1;j+1<q.length;j++){
        const [a,b,e]=[q[0],q[j],q[j+1]],bx=b[0]-a[0],by=b[1]-a[1],ex=e[0]-a[0],ey=e[1]-a[1];
        const det=bx*ey-by*ex;if(Math.abs(det)<1e-9)continue;
        const iz=Math.max(0,Math.floor(Math.min(a[0],b[0],e[0]))),der=Math.min(cv.width-1,Math.ceil(Math.max(a[0],b[0],e[0])));
        const sup=Math.max(0,Math.floor(Math.min(a[1],b[1],e[1]))),inf=Math.min(cv.height-1,Math.ceil(Math.max(a[1],b[1],e[1])));
        for(let v=sup;v<=inf;v++)for(let u=iz;u<=der;u++){
          const dx=u+.5-a[0],dy=v+.5-a[1],s=(dx*ey-dy*ex)/det,t=(bx*dy-by*dx)/det;
          if(s<0||t<0||s+t>1)continue;
          const d=a[2]+s*(b[2]-a[2])+t*(e[2]-a[2]),i=v*cv.width+u;
          if(d<zbuf[i])continue;zbuf[i]=d;
          im.data[4*i]=c[0];im.data[4*i+1]=c[1];im.data[4*i+2]=c[2];im.data[4*i+3]=255;
        }
      }
    }
    ctx.putImageData(im,0,0);m.sprite={clave,cv,x,y,w,h};g.drawImage(cv,x,y,w,h);
  };
  // Caché de mallas ya subidas al contexto de G3 (se vacía si el contexto cambia); null si no hay WebGL o la pieza falla.
  T.malla=(clave,hacer)=>{const g3=EM.g3;if(!g3||!g3.gl)return null;if(T._gl!==g3.gl){T._gl=g3.gl;T._buf={};}
    if(!(clave in T._buf)){try{T._buf[clave]=T.subir(hacer());}catch(e){T._buf[clave]=null;EM.errors.push('taller: '+e.message);}}return T._buf[clave];};
  // Una subida por modelo/contexto. Dibujar en el pase de objetos, después de G3.draw().
  T.subir=(m,g3=EM.g3)=>g3.buf(m.datos());
  T.mundo=(buffer,x,altura,z,rumbo,g3=EM.g3)=>{
    const gl=g3.gl,u=g3.P.u;
    gl.uniformMatrix4fv(u.M,false,M4.trs(x,altura,z,-rumbo,1,1,1));
    try {g3._run(buffer);} finally {gl.uniformMatrix4fv(u.M,false,g3._I);}
  };
})();
