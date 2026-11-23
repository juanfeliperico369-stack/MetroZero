/* Taller de arte procedural (entrega de ChatGPT/Codex para el Plan único, M1–M6): mallas en metros para el motor G3 y respaldo en Canvas 2D. */
(() => {
 const T=EM.taller;
 T.obstaculos=['hueco','cono','moto','perro','chaza','charco','rampa','baranda','arco','pasaje','dato'];
 T.pista=id=>{
   if(id==='moto')return T.vehiculo('moto');
   const m=new T.Malla(),b=(...a)=>m.caja(...a), tubo=(...a)=>m.barra(...a);
   if(id==='hueco'||id==='charco'){
     const r=id==='hueco'?.48:.75;
     m.cara([[-r,.015,-.21],[-r*.7,.015,.26],[.18,.015,.36],[r,.015,.07],[r*.61,.015,-.28]],id==='hueco'?'#1d1f24':'#5f7f73');
     b(.07,.018,.07,.38,.01,.045,id==='hueco'?'#9e9a92':'#9fd3e6');
   }else if(id==='cono'){
     b(0,0,0,.38,.055,.38,'#3b3f45');
     for(const [y,r,h,c] of [[.05,.16,.18,'#E38835'],[.23,.115,.11,'#f1ece0'],[.34,.075,.16,'#E38835']])
       tubo([0,y,0],[0,y+h,0],r,c);
   }else if(id==='chaza'){
     b(0,.38,0,1.45,.48,.84,'#9a4630');b(0,.87,0,1.55,.09,.96,'#fbe7b0');
     for(const x of [-.64,.64])tubo([x,.93,0],[x,1.85,0],.036,'#a9a59b');
     for(let i=0;i<5;i++)b(i*.34-.68,1.85,0,.34,.09,1.2,i%2?'#fbe7b0':'#0E6F76');
     for(const z of [-.38,.38])tubo([0,.23,z-.04],[0,.23,z+.04],.23,'#1d1f24',10);
   }else if(id==='perro'){
     b(0,.29,0,.57,.28,.23,'#9a4630');b(.29,.49,0,.23,.21,.19,'#b4583a');b(.43,.49,0,.15,.09,.15,'#3b3f45');
     for(const s of [-1,1]){tubo([.28,.66,s*.07],[.22,.77,s*.11],.047,'#9a4630');
       for(const x of [-.21,.22])tubo([x,.34,s*.08],[x+s*.04,.02,s*.10],.042,'#9a4630');}
     tubo([-.26,.48,0],[-.47,.63,0],.038,'#b4583a');
   }else if(id==='rampa'){
     m.perfil([[-1.6,0],[1.6,0],[1.6,.72]],-.9,.9,'#8e9aa6');
     b(1.52,.66,0,.16,.12,1.82,'#F6C538');
     b(0,.04,0,3.2,.08,1.82,'#3b4754');
   }else if(id==='baranda'){
     for(const x of [-1.7,0,1.7])tubo([x,0,0],[x,.58,0],.05,'#3b4754');
     tubo([-1.9,.58,0],[1.9,.58,0],.065,'#F6C538');
     for(const x of [-1.7,1.7])b(x,.03,0,.36,.06,.36,'#243039');
   }else if(id==='arco'){
     for(const z of [-.95,.95])b(0,0,z,.24,1.95,.24,'#1C5C9C');
     b(0,1.15,0,.32,.46,2.14,'#E38835');
     b(0,1.15,0,.34,.14,2.16,'#F6C538');
   }else if(id==='pasaje'||id==='dato'){
     m.perfil([[-.24,.45],[.24,.45],[.24,.74],[.12,.85],[-.24,.85]],-.035,.035,id==='dato'?'#9fd3e6':'#fbe7b0');
     for(const z of [-.039,.039]){b(-.12,.49,z,.028,.31,.01,'#154a80');b(.05,.59,z,.14,.035,.01,'#154a80');
       if(id==='dato')b(.05,.67,z,.14,.035,.01,'#154a80');}
   }else throw Error('Objeto desconocido: '+id);
   return m;
 };
 // Perfil normalizado de la cordillera. El integrador puede pasar tres series
 // de muestras normalizadas del relieve real en el rumbo de la cámara.
 T.horizonte=(g,w,h,hora,t,velocidad,lluvia=false,perfiles)=>{
   const alturas=perfiles||[[.2,.36,.58,.44,.65,.57,.47,.61,.48,.55,.38],
     [.1,.21,.39,.31,.52,.36,.30,.49,.28,.24,.33],[.16,.1,.25,.22,.13,.29,.18,.22,.11,.25,.19]];
   const noche=hora<5||hora>=19,oro=hora<7||hora>=17;
   const p=noche?['#08122a','#1a2b4f','#32455d','#24364d','#18293c']:
     oro?['#3d2e5f','#f4d9a8','#8e5b7a','#875766','#543e55']:['#3f8bd0','#d6ecf3','#7f9fbf','#5f8f86','#3f7f4a'];
   g.save();const cielo=g.createLinearGradient(0,0,0,h);cielo.addColorStop(0,p[0]);cielo.addColorStop(.72,p[1]);
   g.fillStyle=cielo;g.fillRect(0,0,w,h);
   alturas.forEach((serie,j)=>{g.fillStyle=p[j+2];g.beginPath();g.moveTo(0,h);
     serie.forEach((v,i)=>g.lineTo(i*w/(serie.length-1),h*(.88-.63*v)));g.lineTo(w,h);g.closePath();g.fill();});
   if(lluvia){g.strokeStyle='rgba(159,211,230,.45)';for(let i=0;i<20;i++){const x=(i*71+t*23)%w,y=(i*43+t*180)%h;
     g.beginPath();g.moveTo(x,y);g.lineTo(x-3,y+9);g.stroke();}}
   if(velocidad>.65){g.strokeStyle='rgba(241,236,224,.46)';for(const s of [-1,1])for(let i=0;i<3;i++){
     const x=w*(s<0?.1:.9),y=h*(.68+i*.095);g.beginPath();g.moveTo(x,y);g.lineTo(x+s*velocidad*18,y+6);g.stroke();}}
   g.restore();
 };
})();
