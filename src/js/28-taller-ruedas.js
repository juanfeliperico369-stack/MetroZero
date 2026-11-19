/* Taller de arte procedural (entrega de ChatGPT/Codex para el Plan único, M1–M6): mallas en metros para el motor G3 y respaldo en Canvas 2D. */
(() => {
 const T=EM.taller, goma='#1d1f24',metal='#a9a59b',piel='#b07a52',verde='#59AB42';
 const ligeros=['bici','scooter','electrico','skate','patines','moto'];
 const flota={
   carro:[4.2,1.8,1.45,'#b4583a'],taxi:[4.2,1.8,1.45,'#f2c400'],camioneta:[4.6,1.8,1.7,'#1C5C9C'],
   bus:[9,2.5,3,'#b4583a'],alimentador:[10,2.5,3,'#59AB42'],articulado:[18,2.5,3.2,'#0E6F76'],
   tranvia:[9,2.4,3.1,'#59AB42'],metro:[22,3,3.4,'#1C5C9C']
 };
 T.vehiculos=[...ligeros,...Object.keys(flota)];
 function rueda(m,x,y,z,r,ancho,abierta){
   if(!abierta){m.barra([x,y,z-ancho/2],[x,y,z+ancho/2],r,goma,10);return;}
   const punto=a=>[x+r*Math.cos(a),y+r*Math.sin(a),z];
   for(let i=0;i<12;i++){const p=punto(i*Math.PI/6);m.barra(p,punto((i+1)*Math.PI/6),.025,goma,4);
     if(i%3===0)m.barra([x,y,z],p,.012,metal,3);}
 }
 T.vehiculo=(id,{noche=false,persona=true}={})=>{
   const m=new T.Malla(),b=(...a)=>m.caja(...a),bar=(...a)=>m.barra(...a);
   const blanco=noche?'#ffd27a':'#f1ece0';
   if(flota[id]){
     const [l,w,h,c]=flota[id],bus=l>5;const base=.33;
     b(0,base,0,l,bus?h*.84:h*.42,w,bus?'#f1ece0':c);
     b(0,bus?h*.43:.52,0,l*.99,bus?.29:.12,w+.018,c);
     if(bus){
       for(let i=0,n=Math.floor(l/1.55);i<n;i++)for(const s of [-1,1])
         b((i+.5)*l/n-l/2,h*.54,s*w*.5,l/n-.16,h*.29,.025,'#154a80');
       b(l/2,h*.46,0,.03,h*.36,w*.86,'#9fd3e6');
       b(0,h*.84+base,0,l*.72,.13,w*.58,'#9e9a92');
       if(id==='articulado')for(let i=-2;i<=2;i++)b(i*.14,.4,0,.08,h*.85,w+.07,goma);
       if(id==='metro'||id==='tranvia')b(0,h*.84+base+.13,0,l*.23,.19,.28,metal);
     }else{
       const cab=id==='camioneta'?.55:0,cap=id==='camioneta'?1.55:2.25;
       m.perfil([[cab-cap*.65,.9],[cab+cap*.65,.9],[cab+cap*.35,h],[cab-cap*.4,h]],-w*.43,w*.43,'#154a80');
       b(cab,h,0,cap*.76,.06,w*.86,c);
       if(id==='taxi')b(0,h+.06,0,.4,.17,.25,blanco,noche);
       if(id==='camioneta')b(-1.2,.99,0,1.45,.07,1.45,goma);
     }
     for(const s of [-1,1]){
       for(const ax of [-.32,.32])rueda(m,l*ax,bus?.43:.32,s*w*.48,bus?.43:.32,.15,false);
       b(l/2,.56,s*w*.34,.055,.14,.28,blanco,noche);
       b(-l/2,.57,s*w*.34,.055,.12,.22,'#EC343A',noche);
     }
    return m;
   }
   if(!ligeros.includes(id))throw Error('Vehículo desconocido: '+id);
   let manos=.9,frente=.32,sillin=.91;
   if(id==='bici'||id==='moto'){
     const moto=id==='moto',r=moto?.31:.32,dx=moto?.66:.55,al=moto?.8:.91;
     for(const x of [-dx,dx])rueda(m,x,r,0,r,moto?.19:.05,!moto);
     const A=[-dx,r,0],B=[-.16,al,0],C=[0,.34,0],D=[.37,.86,0],E=[dx,r,0];
     for(const [a,c] of [[A,B],[A,C],[B,C],[C,D],[B,D],[D,E]])bar(a,c,moto?.07:.034,moto?'#9a4630':verde);
     b(-.18,al,0,.32,.07,.19,goma);bar(D,[.40,1.04,0],.035,metal);
     bar([.4,1.04,-.30],[.4,1.04,.30],.03,goma);
     if(moto)b(.11,.68,0,.56,.2,.36,'#EC343A');
     else {b(.54,.87,0,.29,.055,.34,verde);for(const z of [-.16,.16])b(.54,.91,z,.29,.13,.025,verde);}
     manos=1.04;frente=.4;sillin=al;
   }else if(id==='patines'){
     for(const s of [-1,1]){const x=.11*s,z=.16*s;
       for(let i=0;i<4;i++)rueda(m,x+(i-1.5)*.07,.04,z,.04,.045,false);
       b(x,.08,z,.29,.11,.115,'#154a80');b(x-.07,.18,z,.14,.08,.11,'#fbe7b0');}
   }else{
     const skate=id==='skate',elec=id==='electrico',l=skate?.78:elec?1.16:.94,r=skate?.044:elec?.105:.072;
     b(0,2*r,0,l*.8,elec?.105:.045,skate?.22:.16,skate?'#c3952f':elec?goma:'#0E6F76');
     for(const s of [-1,1])for(const z of skate?[-.09,.09]:[0])rueda(m,s*(l/2-r),r,z,r,.055,false);
     if(!skate){bar([l*.38,r,0],[.33,.98,0],elec?.043:.028,metal);bar([.33,.98,-.23],[.33,.98,.23],.026,goma);
       b(-l*.38,r*2,0,.045,.04,.09,'#EC343A',noche);manos=.98;frente=.33;}
   }
   if(persona){
     const sentado=id==='bici'||id==='moto',libres=id==='skate'||id==='patines';
     const cadera=sentado?sillin+.1:1, pecho=cadera+.42,ante=sentado?.15:.03;
     for(const s of [-1,1]){
       const pie=[sentado?.06*s:.14*s,sentado?.42+.10*s:.20,s*.15];
       const rodilla=[sentado?.22:.12*s,.68+.06*s,s*.14];
       bar([-.12,cadera,s*.11],rodilla,.082,'#154a80');bar(rodilla,pie,.065,'#154a80');
       bar([ante,pecho,s*.16],[ante+.1,pecho-.18,s*.26],.058,'#0E6F76');
       bar([ante+.1,pecho-.18,s*.26],[libres?-.1:frente,libres?pecho-.16:manos,s*(libres?.48:.23)],.048,piel);
     }
     bar([-.12,cadera,0],[ante,pecho,0],.17,'#0E6F76');bar([ante,pecho+.04,0],[ante,pecho+.23,0],.12,piel);
     bar([ante,pecho+.20,0],[ante,pecho+.30,0],.14,'#fbe7b0');
   }
   if(!['skate','patines'].includes(id))b(frente+.05,manos-.055,0,.08,.06,.12,blanco,noche);
   return m;
 };
 // HUD en primera persona; el corredor, los carriles y el cielo quedan detrás.
 T.primera=(g,id,w,h,inclinacion=0)=>{
   const mano=(x,y)=>{g.fillStyle=piel;g.beginPath();g.ellipse(x,y,11,8,-.25,0,Math.PI*2);g.fill();};
   g.save();g.translate(w/2,h);const k=Math.min(w/320,h/260);g.scale(k,k);g.rotate(inclinacion);
   if(flota[id]){
     g.fillStyle='#0f2a45';g.fillRect(-w/k/2,-34,w/k,36);g.strokeStyle=metal;g.lineWidth=6;
     g.beginPath();g.arc(-44,1,32,Math.PI,2*Math.PI);g.stroke();
     g.fillStyle='#9fd3e6';g.fillRect(17,-23,43,11);mano(-70,-17);mano(-18,-17);
   }else if(id==='skate'||id==='patines'){
     g.fillStyle=id==='skate'?'#c3952f':'#154a80';
     if(id==='skate')g.fillRect(-14,-65,28,65);
     for(const s of [-1,1]){g.fillStyle=goma;g.fillRect(s*(id==='skate'?6:20)-7,-28+s*12,14,27);mano(s*112,-60+s*8);}
   }else{
     g.strokeStyle=goma;g.lineWidth=7;g.lineJoin='round';g.beginPath();g.moveTo(-82,-50);
     g.lineTo(-43,-57);g.lineTo(0,-45);g.lineTo(43,-57);g.lineTo(82,-50);g.stroke();
     g.fillStyle=id==='bici'?verde:metal;g.fillRect(-4,-45,8,46);
     if(id==='bici'){g.strokeStyle=verde;g.lineWidth=3;g.strokeRect(-31,-82,62,22);for(let x=-20;x<=20;x+=10)g.strokeRect(x,-82,1,22);}
     if(id==='electrico'){g.fillStyle='#9fd3e6';g.fillRect(-9,-55,18,11);}
     mano(-75,-50);mano(75,-50);
   }
   g.restore();
 };
 T.sombra=(g,l,w,px)=>{g.save();g.scale(px,px);g.fillStyle='rgba(20,20,20,.19)';
   for(const s of [1,.8]){g.beginPath();g.ellipse(0,0,l*.52*s,w*.64*s,0,0,Math.PI*2);g.fill();}g.restore();};
})();
