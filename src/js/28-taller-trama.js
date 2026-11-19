/* Taller de arte procedural (entrega de ChatGPT/Codex para el Plan único, M1–M6): mallas en metros para el motor G3 y respaldo en Canvas 2D. */
(() => {
 const T=EM.taller;
 T.marca=(g,x,y,s,abierto=false)=>{
   g.save();g.translate(x,y);g.scale(s/24,s/24);
   g.fillStyle=abierto?'#fbe7b0':'#f1ece0';g.strokeStyle='#154a80';g.lineWidth=2;
   g.beginPath();g.moveTo(-11,-8);g.lineTo(5,-8);g.lineTo(11,-2);g.lineTo(11,8);g.lineTo(-11,8);
   g.lineTo(-11,3);g.lineTo(-8,0);g.lineTo(-11,-3);g.closePath();g.fill();g.stroke();
   g.beginPath();g.moveTo(5,-8);g.lineTo(5,-2);g.lineTo(11,-2);g.stroke();
   if(abierto){g.beginPath();g.arc(-1,1,4,0,Math.PI*2);g.moveTo(-1,-3);g.lineTo(-1,5);g.stroke();}
   g.restore();
 };
 // Preparar el retrato una vez al abrir conversación o cargar el reparto.
 T.retrato=async personaje=>{
   const im=new Image();im.src=EM.perfil.retrato(EM.perfil.ped(personaje.look),96);
   await im.decode();return im;
 };
 T.escena=(g,w,h,t,retrato)=>{
   const n=t<3?0:t<5?1:2;
   if(n===0){
     T.horizonte(g,w,h,17,0,0);g.save();g.translate(w*.5,h*.75);g.scale(w/380,w/380);
     g.fillStyle='#9e9a92';g.fillRect(-220,-5,440,18);g.fillStyle='#F6C538';g.fillRect(-220,-3,440,3);
     g.translate(-260+200*(1-(1-Math.max(0,t)/3)**2),-5);
     T.lienzo(g,T.trenEscena||(T.trenEscena=T.vehiculo('metro')),9);g.restore();
   }else{
     g.fillStyle=n===1?'#154a80':'#f1ece0';g.fillRect(0,0,w,h);
     if(retrato)g.drawImage(retrato,w*.10,h*.12,h*.58,h*.58);
     g.save();g.translate(w*.67,h*.53);
     if(n===1){g.fillStyle='#b07a52';for(const s of [-1,1]){g.beginPath();g.ellipse(s*25,11,18,8,s*.35,0,Math.PI*2);g.fill();}}
     T.marca(g,0,0,n===1?14+17*(t-3):64,n===2);g.restore();
   }
 };
})();
