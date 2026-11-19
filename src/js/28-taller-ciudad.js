/* Taller de arte procedural (entrega de ChatGPT/Codex para el Plan único, M1–M6): mallas en metros para el motor G3 y respaldo en Canvas 2D. */
// Este módulo requiere 28-taller-00.js.
(() => {
 const T=EM.taller;
 T.lugar=(tipo,{l=7,w=5,h=5,noche=false,lluvia=false,lejos=false}={})=>{
   const m=new T.Malla(), caja=(...a)=>m.caja(...a), hoja='#2f6b35', losa='#9e9a92';
   function arbol(x,z,palma){
     m.barra([x,0,z],[x,3.8,z],.18,'#9a4630');
     if(palma){for(let i=0;i<6;i++){const a=i*Math.PI/3;m.cara([[x,4.4,z],[x+Math.cos(a+.5),4.1,z+Math.sin(a+.5)],[x+2.1*Math.cos(a),3.4,z+2.1*Math.sin(a)]].reverse(),hoja);}}
     else {m.barra([x,2.4,z],[x,4.4,z],1.55,hoja,7);m.barra([x,4.4,z],[x,5,z],1,'#4f8a3c',7);}
   }
   function banca(x,z){caja(x,.44,z,1.8,.12,.45,'#9a4630');for(const s of [-.65,.65])caja(x+s,0,z,.12,.45,.4,losa);}
   if(['casa','terraza','torre'].includes(tipo)){
     const alto=tipo==='torre'?h*.7:h;caja(0,0,0,l,alto,w,'#b4583a');
     if(tipo==='casa'){
       const a=l/2+.2,b=w/2+.18,cresta=h+w*.24;
       for(const s of [-1,1]){const panel=[[-a,h,s*b],[-a,cresta,0],[a,cresta,0],[a,h,s*b]];
         m.cara(s<0?panel:panel.reverse(),s<0?'#a8452f':'#9a4630');}
       for(const s of [-1,1]){const p=[[s*a,h,-b],[s*a,cresta,0],[s*a,h,b]];m.cara(s>0?p:p.reverse(),'#b4583a');}
     }else if(tipo==='torre'){caja(0,alto,0,l*.82,h*.2,w*.82,'#9a4630');caja(0,h*.9,0,l*.62,h*.1,w*.62,losa);}
     else {caja(0,h,0,l+.16,.16,w+.16,'#8f9497');if(!lejos)m.barra([l*.27,h+.16,0],[l*.27,h+1.2,0],.55,'#1d1f24',8);}
     if(!lejos)for(let i=0;i<3;i++)caja((i-1)*l*.27,h*.36,w/2+.02,.8,1,.04,noche&&i!==1?'#ffd27a':'#9fd3e6',noche&&i!==1);
   }else if(tipo==='quebrada'){
     caja(0,-.55,0,12,.12,2.4,'#5f7f73');
     for(const s of [-1,1]){caja(0,-.6,s*1.55,12,.65,.7,losa);caja(0,.05,s*2.25,12,.12,.7,hoja);}
   }else if(tipo==='tunel'){
     for(const s of [-1,1])caja(0,0,s*3.25,4,4.2,.5,'#a9a59b');
     caja(0,4.2,0,4,.65,7,'#a9a59b');caja(0,-.08,0,4,.08,6,'#3b3f45');
     for(const s of [-1,1])caja(-1,2.6,s*2.98,.55,.16,.08,'#ffd27a',true);
   }else if(tipo==='parque'||tipo==='separador'){
     caja(0,0,0,10,.18,tipo==='parque'?8:2,'#4f8a3c');
     arbol(-2,0,tipo==='separador');arbol(2,0,tipo==='separador');
     if(tipo==='parque'){caja(0,.18,2.2,10,.03,1.6,'#c9c1ad');banca(1,3.4);}
   }else if(tipo==='anden'){
     caja(0,-.1,0,10,.18,3,'#c9c1ad');banca(0,0);
     for(const x of [-1.35,1.35])caja(x,0,-.42,.1,2.5,.1,losa);
     caja(0,2.5,0,3.2,.14,1.4,'#0E6F76');caja(3,0,.42,.14,4,.14,losa);
     caja(3,4,.42,.7,.12,.35,noche?'#ffd27a':'#f1ece0',noche);
     if(lluvia)caja(2,.09,.6,1.1,.012,.25,'#9fd3e6');
   }else throw Error('Pieza de ciudad desconocida: '+tipo);
   return m;
 };
 // Corona del Coltejer sobre su contorno y eje reales, también en la silueta lejana.
 T.aguja=H=>{
   const m=new T.Malla(),p=[];
   for(let i=0;i<H.P[0].length;i+=2)p.push([H.P[0][i]-H.cx,H.P[0][i+1]-H.cy]);
   if(p.reduce((a,[x,z],i)=>{const q=p[(i+1)%p.length];return a+x*q[1]-z*q[0];},0)<0)p.reverse();
   const cima=[0,H.h+(H.o.corona||25),0];
   for(let i=0;i<p.length;i++){const [x,z]=p[i],[u,v]=p[(i+1)%p.length];
     if(x===u&&z===v)continue;
     m.cara([[x,0,z],[x,H.h,z],[u,H.h,v],[u,0,v]],'#a9a59b');
     m.cara([[x,H.h,z],cima,[u,H.h,v]],'#9fd3e6');}
   return m;
 };
 // LOD para huellas reales: pared por arista y cubierta siguiendo la misma planta.
 // La cubierta usa los índices triangulados de la huella (incluidos patios, si los hay).
 T.huella=(aro,triangulos,h,material='#b4583a')=>{
   const m=new T.Malla();
   for(let i=0;i<aro.length;i++){const [x,z]=aro[i],[u,v]=aro[(i+1)%aro.length];
     m.cara([[x,0,z],[x,h,z],[u,h,v],[u,0,v]],material);}
   for(const indices of triangulos){const p=indices.map(i=>[aro[i][0],h,aro[i][1]]);
     if((p[1][2]-p[0][2])*(p[2][0]-p[0][0])<(p[1][0]-p[0][0])*(p[2][2]-p[0][2]))p.reverse();
     m.cara(p,'#9e9a92');}
   return m;
 };
})();
