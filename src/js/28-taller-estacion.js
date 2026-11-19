/* Taller de arte procedural (entrega de ChatGPT/Codex para el Plan único, M1–M6): mallas en metros para el motor G3 y respaldo en Canvas 2D. */
(() => {
 const T=EM.taller;
 T.estacion=(linea='#1C5C9C')=>{
   const m=new T.Malla(), b=(...a)=>m.caja(...a);
   b(0,-.35,0,24,.35,5,'#c9c1ad'); b(0,.012,2.12,24,.025,.24,'#F6C538');
   for(const x of [-9,-3,3,9]){
     b(x,0,-1.9,.32,3.6,.32,'#a9a59b');
     b(x,3.38,0,.18,.12,4.4,'#9aa1a8');
     b(x,3.42,.2,.9,.04,.12,'#fbe7b0',true);
   }
   b(0,3.63,0,24,.16,5.2,'#8f9497');
   for(const x of [-8,-6.8]){
     b(x,0,-.2,.38,.96,1.25,'#9e9a92');b(x,.96,.18,.29,.08,.37,linea);
     b(x,.99,.19,.14,.06,.22,'#9fd3e6');
     for(let i=0;i<3;i++){const a=i*2*Math.PI/3;
       m.barra([x+.2,.7,0],[x+.65,.7+.3*Math.sin(a),.3*Math.cos(a)],.035,'#a9a59b');}
   }
   for(let i=0;i<8;i++)b(5+i*.3,0,-.6,.3,(i+1)*.17,1.35,'#9e9a92');
   m.barra([5,1.05,-1.33],[7.1,2.24,-1.33],.045,linea);
   for(const z of [3.6,5.05]) b(0,-.92,z,25,.12,.1,'#3b3f45');
   return m;
 };
 const claves={
   conduce:['Metro','#1C5C9C','riel'],volante:['Al volante','#0E6F76','via'],
   bus:['Bus','#65A9AC','via'],libre:['Ciudad Libre','#2f6b35','barrio'],
   maqueta:['Maqueta','#9a4630','barrio'],red:['La Red','#154a80','nodo'],
   cableviaje:['Viaje en cable','#8E612A','cable'],cable:['Metrocable','#743D90','cable'],
   despacho:['Despacho','#1C5C9C','aguja'],alim:['Alimentadores','#59AB42','via'],
   metroplus:['Metroplús','#0E6F76','cruce'],album:['Álbum','#9a4630','postal'],
   historia:['La última vuelta','#743D90','postal'],carrera:['Carrera sin fin','#0E6F76','riel']
 };
 T.modos=Object.keys(claves);
 T.tarjeta=(g,id,fin,valor,w=320)=>{
   const [titulo,tinta,figura]=claves[id]; g.save();
   g.fillStyle='#f1ece0';g.fillRect(0,0,w,112);g.fillStyle=tinta;g.fillRect(0,0,7,112);
   // Viñeta de 84 × 80 con motivo específico.
   g.save();g.translate(16,13);g.strokeStyle=tinta;g.fillStyle=tinta;g.lineWidth=4;
   const trazo=(...pts)=>{g.beginPath();g.moveTo(...pts[0]);pts.slice(1).forEach(p=>g.lineTo(...p));g.stroke();};
   const punto=(x,y,r)=>{g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();};
   if(figura==='riel'||figura==='via'){trazo([3,77],[38,20]);trazo([76,77],[47,20]);
     if(figura==='riel')for(let k=0;k<4;k++)trazo([13+k*6,65-k*10],[66-k*5,65-k*10]);
     else {g.fillRect(26,34,30,26);g.fillStyle='#f1ece0';g.fillRect(30,37,22,8);}}
   if(figura==='barrio'){for(let i=0;i<3;i++){const x=7+21*i,y=46-7*i;g.fillRect(x,y,17,24);trazo([x-2,y],[x+8,y-8],[x+19,y]);}}
   if(figura==='nodo'||figura==='aguja'){trazo([5,67],[38,48],[74,20]);trazo([38,48],[72,65]);for(const p of [[5,67],[74,20],[72,65]])punto(...p,6);}
   if(figura==='cable'){trazo([2,40],[77,14]);trazo([41,28],[41,40]);g.fillRect(25,41,33,23);g.fillStyle='#9fd3e6';g.fillRect(29,44,25,9);}
   if(figura==='cruce'){trazo([5,48],[73,48]);trazo([37,14],[37,79]);g.fillRect(49,19,14,20);g.fillStyle='#fbe7b0';punto(56,25,3);}
   if(figura==='postal'){g.strokeRect(8,22,62,44);trazo([8,62],[30,42],[45,53],[60,37]);}
   if(fin){g.fillStyle='#fbe7b0';punto(65,68,13);g.strokeStyle='#154a80';trazo([58,68],[63,73],[73,61]);}
   g.restore();g.fillStyle='#154a80';g.textAlign='left';
   g.font='bold 22px Titulos,sans-serif';g.fillText(titulo,109,47,w-117);
   g.font='16px Cuerpo,sans-serif';g.fillText(String(valor || (fin?'Recorrido completo':'Comenzar')),109,77,w-117);g.restore();
 };
})();
