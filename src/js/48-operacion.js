/* CX-36-3 · «Un día de operación» — OpenAI GPT-6 / Eón.
   Juego roguelite autónomo sin internet sobre las estaciones reales.
   No cambia la estructura de elmetro.v1. */
(() => {
  EM.modes.operacion = {
    id: 'operacion', name: 'Un día de operación', sub: 'La red de 4:30 a. m. a 11:00 p. m.', music: 'puzzle', fullCanvas: true, substeps: true,
    tip: 'Toca una estación para enviar un refuerzo (3 fichas). Tras cada jornada elige una mejora. Pierdes si una estación se satura.',
    levels() { return [{id:'op:red',name:'Turno del Valle',sub:'Gestiona la demanda del metro, tranvía, bus y cable'}]; },
    create(_lv, opts = {}) {
      const wish=['Niquía','Acevedo','Universidad','Hospital','San Antonio','Exposiciones','Industriales','Poblado','Itagüí','La Estrella','Estadio','San Javier','Santo Domingo Savio'];
      const hubs=(NET.stations||[]).filter(h=>h&&Number.isFinite(h.x)&&Number.isFinite(h.y));
      const chosen=wish.map(n=>hubs.find(h=>h.name===n)).filter((h,i,a)=>h&&a.indexOf(h)===i);
      for(const h of hubs) if(chosen.length<11&&!chosen.includes(h)) chosen.push(h);
      if(!chosen.length) throw new Error('Operación: la red de estaciones no está cargada');
      const minx=Math.min(...chosen.map(h=>h.x)), maxx=Math.max(...chosen.map(h=>h.x));
      const miny=Math.min(...chosen.map(h=>h.y)), maxy=Math.max(...chosen.map(h=>h.y));
      const stations=chosen.map((h,i)=>({id:h.name,x:.07+.86*(h.x-minx)/Math.max(1,maxx-minx),y:.07+.78*(h.y-miny)/Math.max(1,maxy-miny),q:8+(i%5)*2,fleet:0,boost:0,cap:120}));
      const lookup=new Map(stations.map((s,i)=>[s.id,i])),links=[],seen=new Set();
      for(const l of NET.lines) {
        if(!['metro','tram','cable','brt','feeder'].includes(l.kind))continue;
        let last=-1;
        for(const t of l.st||[]){
          const idx=lookup.get(t.name)??lookup.get(t.hub&&t.hub.name)??-1;
          if(idx<0)continue;
          if(last>=0&&idx!==last){const a=Math.min(idx,last),b=Math.max(idx,last),k=a+':'+b;if(!seen.has(k)){seen.add(k);links.push([a,b]);}}
          last=idx;
        }
      }
      return {lv:'op:red',seed:opts.seed|0,stations,links,t:270,acc:0,day:1,credits:6,score:0,served:0,saturated:-1,done:false,win:false,upgrade:null,demand:1,auto:!!opts.auto,ticks:0};
    },
    peak(h){return 1+1.9*Math.exp(-Math.pow((h-7.6)/1.05,2))+1.8*Math.exp(-Math.pow((h-17.6)/1.2,2));},
    tick(st){
      const peak=this.peak(st.t/60);
      for(let i=0;i<st.stations.length;i++){
        const s=st.stations[i],rand=h2(i,st.t|0,st.seed),hub=i===4?1.35:1;
        const arrivals=(4+5.2*peak*st.demand*hub)*(.85+rand*.3),throughput=9+s.fleet*3.5+(s.boost>0?12:0);
        s.q=Math.max(0,s.q+arrivals-throughput);
        if(s.boost>0)s.boost--;
        st.served+=Math.max(0,Math.min(throughput,arrivals+s.q));
        if(s.q>=s.cap){st.saturated=i;st.done=true;st.win=false;return;}
      }
      st.credits=Math.min(12,st.credits+1);st.score+=Math.round(peak*10);st.ticks++;
    },
    step(st,dt){
      if(st.done||st.upgrade)return;
      st.acc+=Math.max(0,dt)*18;
      let n=0;
      while(st.acc>=10&&n++<10&&!st.done){
        st.acc-=10;st.t+=10;
        if(st.t>=1380){if(st.day>=7){st.done=true;st.win=true;st.score+=5000;break;}st.upgrade=true;st.t=1380;break;}
        this.tick(st);
      }
    },
    act(st,a){
      if(!a||st.done)return;
      if(a.k==='refuerzo'&&!st.upgrade&&st.credits>=3&&st.stations[a.i]){
        st.credits-=3;st.stations[a.i].boost+=4;st.score+=5;
      }else if(a.k==='mejora'&&st.upgrade&&a.i>=0&&a.i<3){
        if(a.i===0)for(const s of st.stations)s.fleet++;
        if(a.i===1)for(const s of st.stations)s.cap+=30;
        if(a.i===2)st.demand*=.91;
        st.day++;st.t=270;st.acc=0;st.credits=Math.max(st.credits,6);st.upgrade=null;st.score+=450;
      }
    },
    ai(st){
      if(st.upgrade)return {k:'mejora',i:st.day%3};
      if(st.credits>=3){let i=0;for(let j=1;j<st.stations.length;j++)if(st.stations[j].q>st.stations[i].q)i=j;return {k:'refuerzo',i};}
      return null;
    },
    key(st,k,down){
      if(!down)return;
      if(st.upgrade&&/^[123]$/.test(k))this.act(st,{k:'mejora',i:+k-1});
      else if(/^[1-9]$/.test(k))this.act(st,{k:'refuerzo',i:+k-1});
    },
    pointer(st,type,x,y,vp){
      if(type!=='down')return null;
      const w=vp.w,h=vp.h;
      if(st.upgrade)return y>h*.78?{k:'mejora',i:clamp(Math.floor(x/(w/3)),0,2)}:null;
      let best=-1,dd=Infinity;
      for(let i=0;i<st.stations.length;i++){const s=st.stations[i],dx=x-(24+s.x*(w-48)),dy=y-(96+s.y*(h-200)),d=dx*dx+dy*dy;if(d<dd){dd=d;best=i;}}
      return dd<2704?{k:'refuerzo',i:best}:null;
    },
    draw(g,st,vp){
      const w=vp.w,h=vp.h;
      g.fillStyle='#0f2a45';g.fillRect(0,0,w,h);
      g.fillStyle='#f1ece0';g.font='bold 21px system-ui';g.fillText('Un día de operación · jornada '+st.day,18,36);
      g.font='15px system-ui';g.fillText('Hora '+pad2(Math.floor(st.t/60))+':'+pad2(st.t%60)+' · Fichas '+st.credits+' · '+Math.round(st.score)+' pts',18,62);
      g.strokeStyle='#4d7eaa';g.lineWidth=5;
      const p=s=>[24+s.x*(w-48),96+s.y*(h-200)];
      for(const [a,b] of st.links){const A=p(st.stations[a]),B=p(st.stations[b]);g.beginPath();g.moveTo(A[0],A[1]);g.lineTo(B[0],B[1]);g.stroke();}
      for(const s of st.stations){
        const [x,y]=p(s),q=s.q/s.cap;g.beginPath();g.fillStyle=q>.7?'#EC343A':q>.4?'#E38835':'#59AB42';
        g.arc(x,y,16+q*8,0,TAU);g.fill();g.strokeStyle='#f1ece0';g.lineWidth=2;g.stroke();
        g.fillStyle='#f1ece0';g.textAlign='center';g.font='11px system-ui';g.fillText(s.id,x,y-26);g.fillText(Math.round(q*100)+'%',x,y+4);
      }
      g.textAlign='start';g.fillStyle='#f1ece0';g.font='13px system-ui';g.fillText('Toca una estación: refuerzo por 3 fichas',18,h-35);
      if(st.upgrade){
        g.fillStyle='rgba(15,42,69,.96)';g.fillRect(0,h*.68,w,h*.32);g.fillStyle='#F6C538';g.font='bold 19px system-ui';g.fillText('Turno completo: elige una mejora',12,h*.73);
        ['Más trenes','Más capacidad','Información'].forEach((txt,i)=>{g.fillStyle=['#1C5C9C','#59AB42','#E38835'][i];g.fillRect(i*w/3+4,h*.79,w/3-8,h*.12);g.fillStyle='#f1ece0';g.font='bold 13px system-ui';g.fillText(txt,i*w/3+9,h*.85);});
      }
    },
    hud(st){return [['Día',st.day],['Viajes',Math.round(st.served)],['Fichas',st.credits]];},
    result(st){return {done:!!st.done,win:!!st.win,stars:st.win?3:st.day>=4?2:st.day>=2?1:0,score:st.score|0,lines:[['Jornadas',st.day],['Viajes atendidos',Math.round(st.served)],['Estado',st.win?'Red a salvo':st.saturated>=0?'Saturación: '+st.stations[st.saturated].id:'En servicio']]};}
  };
})();