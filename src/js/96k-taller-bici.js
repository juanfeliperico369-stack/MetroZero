/* =====================================================================
   TALLER DE LA BICI EN LA CALLE (3.9, Claude) · de Motor City 5.3 (G5-04: minijuegos táctiles de familia, llanta y cadena), hecho
   aquí con sus mismas reglas: 16 s, salida inmediata (✕ de 48 px o Escape), el dedo con captura y teclado de respaldo.
   En Ciudad Libre, en bici:
   - un golpe fuerte (pasar de rodar a frenar en seco) puede pinchar la llanta (rueda a media velocidad) o soltar la cadena
     (casi no tracciona); muy de vez en cuando también se pincha sola, como en la calle;
   - aparece «🔧 arreglar» en la columna. Nada se bloquea: sigues a pie, cambias de vehículo o la arreglas cuando quieras;
   - llanta: arrastra el mango de la bomba hacia abajo y sostén 50–62 PSI un momento (si pasas de 76, se sale el aire);
   - cadena: arrastra la punta de la cadena por los tres dientes del piñón, en orden;
   - arreglarla da 10 🎫 y un dato: lo que todos saben y lo que pocos saben.
   Si te bajas, la bici se queda con su daño y la siguiente sale buena (las de EnCicla se revisan en el anclaje).
   ===================================================================== */
(function () {
  const L = EM.modes.libre; if (!L || typeof VEH === 'undefined' || !VEH.bici) return;
  const DUR = 16, PREMIO = 10;
  const DATOS = {
    llanta: ['Lo que todos saben: con la llanta baja la bici pesa más y se pincha más fácil.', 'Lo que pocos saben: el aire se escapa solo, poquito a poco, a través del mismo caucho; por eso la presión se revisa cada semana aunque no haya hueco.'],
    cadena: ['Lo que todos saben: la cadena se cuida con aceite.', 'Lo que pocos saben: con el uso la cadena se «estira» (se gastan sus pasadores) y entonces se come los piñones; se mide con una regla o un calibrador antes de que sea tarde.']
  };
  const deriv = new WeakMap();
  const TB = EM.tallerBici = {
    DUR, PREMIO,
    esBici(st) { return !!(st && st.mode === 'veh' && st.veh && st.veh.kind === 'bici'); },
    fallar(st, tipo) {
      if (!this.esBici(st) || st._falla) return false; st._falla = tipo === 'cadena' ? 'cadena' : 'llanta';
      if (!EM.headless && !st.auto && L.msg) L.msg(st, st._falla === 'llanta' ? '🛞 ¡Pinchazo! La bici rueda a media velocidad: toca 🔧 «arreglar»' : '⛓️ ¡Se salió la cadena! Casi no tracciona: toca 🔧 «arreglar»', 'y');
      if (typeof Snd !== 'undefined' && !st.auto) Snd.play('lose');
      return true;
    },
    reparar(st, premio) {
      if (!st || !st._falla) return; const t = st._falla; st._falla = null;
      if (premio) { Save.d.wallet = (Save.d.wallet | 0) + PREMIO; Save.write(); if (EM.jugo) EM.jugo.pop(st, (t === 'llanta' ? '🛞' : '⛓️') + ' +' + PREMIO + ' 🎫', 'g'); }
    },
    /* el minijuego en una ventana: un lienzo de 360 × 240 con su propio ciclo mientras esté abierto */
    abrir(st) {
      const tipo = st && st._falla; if (!tipo || EM.headless) return;
      const llanta = tipo === 'llanta';
      UI.modal(`<div class="pag">🔧 Taller en la calle</div><h2>${llanta ? '🛞 Infla la llanta' : '⛓️ Encarrila la cadena'}</h2>
        <p class="m" id="tbSub" style="margin:4px 0">${llanta ? 'Arrastra el mango de la bomba hacia abajo y sostén la aguja en la franja verde (50–62 PSI).' : 'Arrastra la punta de la cadena por los tres dientes del piñón, en orden.'}</p>
        <canvas id="tbCv" width="360" height="240" style="width:100%;max-width:360px;aspect-ratio:3/2;touch-action:none;border-radius:12px;background:#0f2a45;display:block;margin:6px auto"></canvas>
        <div class="row"><button class="btn sm gh" id="tbX" style="min-width:48px;min-height:48px">✕ Salir</button></div>`);
      const cv = document.getElementById('tbCv'); if (!cv) return; const g = cv.getContext('2d');
      const J = llanta ? { psi: 22, est: 0, meta: 1.3, mango: 70, drag: false, uy: 0, aire: 0 } : { cx: 210, cy: 118, r: 62, pts: [-.78, -.15, .52].map(a => ({ x: 210 + Math.cos(a * Math.PI) * 62, y: 118 + Math.sin(a * Math.PI) * 62, ok: false })), paso: 0, gx: 56, gy: 200, drag: false, ruta: [[56, 200]] };
      let t = 0, fin = null, ult = performance.now(), vivo = true; TB.ultimo = J;
      const pt = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; };
      const cerrar = () => { vivo = false; window.removeEventListener('keydown', tecla); };
      const ganar = () => {
        if (fin) return; fin = 'bien'; TB.reparar(st, true); if (typeof Snd !== 'undefined') Snd.play('win');
        const d = DATOS[tipo], s = document.getElementById('tbSub'); if (s) s.innerHTML = `<b>${llanta ? '🚲 ¡Llanta al pelo!' : '🚲 ¡Cadena en su sitio!'} +${PREMIO} 🎫</b><br><small>${esc(d[0])}</small><br><small><b>${esc(d[1])}</b></small>`;
        const x = document.getElementById('tbX'); if (x) x.textContent = 'A rodar';
      };
      const perder = () => {
        if (fin) return; fin = 'tiempo'; const s = document.getElementById('tbSub'); if (s) s.innerHTML = '<b>Casi… se acabó el tiempo.</b> La bici sigue dañada: inténtalo otra vez cuando quieras.';
        const fila = document.querySelector('#mBody .row'); if (fila && !document.getElementById('tbOtra')) { const b = document.createElement('button'); b.className = 'btn sm'; b.id = 'tbOtra'; b.textContent = '↻ Otra vez'; b.onclick = () => { cerrar(); TB.abrir(st); }; fila.prepend(b); }
      };
      const tecla = e => {
        if (!vivo || fin) return;
        if (e.key === 'Escape') { cerrar(); UI.close(); return; }
        if (llanta && (e.key === ' ' || e.key === 'ArrowDown')) { e.preventDefault(); J.psi = Math.min(82, J.psi + 4); if (J.psi > 76) { J.psi = 30; J.est = 0; J.aire = .6; } }
        if (!llanta && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); const p = J.pts[J.paso]; if (p) { p.ok = true; J.ruta.push([p.x, p.y]); J.gx = p.x; J.gy = p.y; J.paso++; if (J.paso >= 3) ganar(); } }
      };
      window.addEventListener('keydown', tecla);
      cv.onpointerdown = e => { if (fin) return; const p = pt(e); try { cv.setPointerCapture(e.pointerId); } catch (er) { /* sin captura */ } if (llanta) { J.drag = true; J.uy = p.y; } else if (Math.hypot(p.x - J.gx, p.y - J.gy) < 44) J.drag = true; };
      cv.onpointermove = e => {
        if (!J.drag || fin) return; const p = pt(e);
        if (llanta) { const dy = p.y - J.uy; J.uy = p.y; J.mango = clamp(p.y, 44, 196); if (dy > 2 && J.aire <= 0) { J.psi = Math.min(82, J.psi + dy * .16); if (J.psi > 76) { J.psi = 30; J.est = 0; J.aire = .6; if (typeof Snd !== 'undefined') Snd.play('lose'); } } return; }
        J.gx = clamp(p.x, 14, 346); J.gy = clamp(p.y, 14, 226); const q = J.pts[J.paso];
        if (q && Math.hypot(J.gx - q.x, J.gy - q.y) < 28) { q.ok = true; J.ruta.push([q.x, q.y]); J.paso++; if (typeof Snd !== 'undefined') Snd.play('coin'); if (J.paso >= 3) ganar(); }
      };
      cv.onpointerup = cv.onpointercancel = () => { J.drag = false; };
      const x = document.getElementById('tbX'); if (x) x.onclick = () => { cerrar(); UI.close(); };
      const F = 'px Cuerpo, system-ui, sans-serif';
      const dibuja = () => {
        g.fillStyle = '#0f2a45'; g.fillRect(0, 0, 360, 240);
        g.fillStyle = 'rgba(241,236,224,.18)'; g.fillRect(12, 10, 336, 6); g.fillStyle = t > DUR - 4 ? '#EC343A' : '#F6C538'; g.fillRect(12, 10, 336 * Math.max(0, 1 - t / DUR), 6);
        if (llanta) {
          /* bomba: cuerpo, vástago y mango; manguera a la llanta; manómetro con la franja verde */
          g.fillStyle = '#9aa3ad'; g.fillRect(40, 96, 34, 120); g.fillStyle = '#5f6a75'; g.fillRect(54, J.mango, 6, 210 - J.mango); g.fillStyle = '#1C5C9C'; g.fillRect(28, J.mango - 10, 58, 14);
          g.strokeStyle = '#1d1f24'; g.lineWidth = 5; g.beginPath(); g.moveTo(57, 214); g.bezierCurveTo(120, 236, 170, 200, 200, 170); g.stroke();
          const cx = 262, cy = 150, R = 58 + (J.psi - 22) * .12; g.strokeStyle = '#1d1f24'; g.lineWidth = 16; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.stroke(); g.strokeStyle = '#59AB42'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R - 12, 0, TAU); g.stroke();
          for (let i = 0; i < 8; i++) { const a = i * TAU / 8; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * (R - 12), cy + Math.sin(a) * (R - 12)); g.strokeStyle = 'rgba(241,236,224,.5)'; g.lineWidth = 1; g.stroke(); }
          const mx = 262, my = 62, mr = 40, ang = p => Math.PI + Math.PI * clamp(p / 80, 0, 1);
          g.lineWidth = 10; g.strokeStyle = 'rgba(241,236,224,.25)'; g.beginPath(); g.arc(mx, my, mr, Math.PI, TAU); g.stroke();
          g.strokeStyle = '#59AB42'; g.beginPath(); g.arc(mx, my, mr, ang(50), ang(62)); g.stroke(); g.strokeStyle = '#EC343A'; g.beginPath(); g.arc(mx, my, mr, ang(76), ang(80)); g.stroke();
          g.strokeStyle = '#f1ece0'; g.lineWidth = 3; g.beginPath(); g.moveTo(mx, my); g.lineTo(mx + Math.cos(ang(J.psi)) * (mr - 4), my + Math.sin(ang(J.psi)) * (mr - 4)); g.stroke();
          g.fillStyle = '#f1ece0'; g.font = '700 15' + F; g.textAlign = 'center'; g.fillText(Math.round(J.psi) + ' PSI', mx, my + 22);
          g.fillStyle = 'rgba(241,236,224,.18)'; g.fillRect(110, 26, 100, 8); g.fillStyle = '#59AB42'; g.fillRect(110, 26, 100 * clamp(J.est / J.meta, 0, 1), 8);
          g.font = '11' + F; g.fillStyle = 'rgba(241,236,224,.8)'; g.fillText(J.aire > 0 ? '¡Se salió el aire! Más suave' : 'sostén en verde', 160, 48);
        } else {
          /* piñón con dientes, los tres puntos en orden y la cadena que ya pasó */
          g.fillStyle = '#9aa3ad'; g.beginPath(); for (let i = 0; i < 36; i++) { const a = i * TAU / 36, rr = J.r + (i % 2 ? 8 : 0); g.lineTo(J.cx + Math.cos(a) * rr, J.cy + Math.sin(a) * rr); } g.closePath(); g.fill();
          g.fillStyle = '#0f2a45'; g.beginPath(); g.arc(J.cx, J.cy, J.r * .45, 0, TAU); g.fill();
          g.strokeStyle = '#1d1f24'; g.lineWidth = 7; g.setLineDash([6, 4]); g.beginPath(); J.ruta.forEach(([a, b], i) => i ? g.lineTo(a, b) : g.moveTo(a, b)); g.lineTo(J.gx, J.gy); g.stroke(); g.setLineDash([]);
          const pul = .5 + .5 * Math.sin(t * 8);
          J.pts.forEach((q, i) => { g.beginPath(); g.arc(q.x, q.y, q.ok ? 9 : i === J.paso ? 12 + pul * 4 : 9, 0, TAU); g.fillStyle = q.ok ? '#59AB42' : i === J.paso ? '#F6C538' : 'rgba(241,236,224,.35)'; g.fill(); g.fillStyle = '#0f2a45'; g.font = '700 11' + F; g.textAlign = 'center'; g.fillText(i + 1, q.x, q.y + 4); });
          g.beginPath(); g.arc(J.gx, J.gy, 13, 0, TAU); g.fillStyle = '#E38835'; g.fill(); g.strokeStyle = '#f1ece0'; g.lineWidth = 2; g.stroke();
        }
        g.textAlign = 'left';
      };
      const ciclo = ahora => {
        if (!vivo || !document.getElementById('tbCv')) { cerrar(); return; }
        const dt = Math.min(.1, (ahora - ult) / 1000); ult = ahora;
        if (!fin) {
          t += dt; if (t >= DUR) perder();
          if (llanta) { J.aire = Math.max(0, J.aire - dt); J.psi = Math.max(18, J.psi - dt * 1.6); if (J.psi >= 50 && J.psi <= 62) { J.est += dt; if (J.est >= J.meta) ganar(); } else J.est = Math.max(0, J.est - dt * 1.5); if (!J.drag) J.mango += (70 - J.mango) * Math.min(1, dt * 6); }
        }
        dibuja(); requestAnimationFrame(ciclo);
      };
      requestAnimationFrame(ciclo);
    }
  };
  /* la física: con la falla, la bici rinde menos (hereda todo lo demás, así sigue la pintura y cualquier ajuste) */
  const V0 = L.V;
  L.V = function (st) {
    const V = V0.apply(this, arguments); if (!V || !st || !st._falla || !st.veh || st.veh.kind !== 'bici') return V;
    let m = deriv.get(V); if (!m) deriv.set(V, m = {});
    return m[st._falla] || (m[st._falla] = Object.assign(Object.create(V), st._falla === 'llanta' ? { vmax: V.vmax * .5, acc: V.acc * .7 } : { vmax: V.vmax * .6, acc: V.acc * .18 }));
  };
  /* golpes fuertes y pinchazos de la calle; el botón 🔧 solo cuando hace falta */
  const mount0 = L.mount, step0 = L.step;
  L.mount = function (st, el) {
    const r = mount0.apply(this, arguments), col = document.getElementById('lbView');
    if (col && !document.getElementById('lbBici')) { const b = document.createElement('button'); b.id = 'lbBici'; b.title = 'Arreglar la bici'; b.innerHTML = '🔧<small>arreglar</small>'; b.style.display = 'none'; b.onclick = () => TB.abrir(Game.st || st); col.prepend(b); }
    return r;
  };
  L.step = function (st, dt) {
    const antes = TB.esBici(st) ? Math.abs(st.vf || 0) : 0, r = step0.apply(this, arguments);
    if (st.auto || !(dt > 0)) return r;
    if (!TB.esBici(st)) { if (st._falla) { st._falla = null; if (!EM.headless) L.msg(st, '🚲 Dejaste la bici con su daño: la siguiente sale buena', 'b'); } }
    else if (!st._falla) {
      const v = Math.abs(st.vf || 0);
      if (antes > 5.5 && v < antes * .35 && Math.random() < .4) TB.fallar(st, Math.random() < .55 ? 'llanta' : 'cadena');
      st._bm = (st._bm || 0) + v * dt; if (st._bm > 4000) { st._bm = 0; if (Math.random() < .2) TB.fallar(st, 'llanta'); }
    }
    if (!EM.headless && Game.st === st && (st._tbT = (st._tbT || 0) - dt) <= 0) { st._tbT = .3; const b = document.getElementById('lbBici'), on = !!st._falla; if (b && (b.style.display === 'none') === on) b.style.display = on ? '' : 'none'; }
    return r;
  };
})();
