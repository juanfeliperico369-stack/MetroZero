/* OpenAI GPT-6 · Eón · CX-36-2
   Fantasma diario con muestreo interpolado cada 0,1 s, por modo y recorrido.
   Usa Save.d.best (ya existente) para preservar elmetro.v1; no añade nuevas claves raíz.
   QR comparte el tiempo y el nivel, no el trazado del fantasma.
   3.9 (Claude): los recorridos ya no van dentro de la partida. Ciudad Libre la guarda cada 5 s y con hasta 6 fantasmas de 36 000
   puntos cada guardado escribía megas. Ahora viven en su propia clave (elmetro.v1.fantasmas), en deltas de decímetros en base 36
   (unas 3 veces más chicos), se leen una sola vez y se descomprimen con caché. Si no caben, se suelta el más viejo. Los de la
   3.8.0 se mudan solos. */
(() => {
  const DAY = () => { const d = new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); };
  const modes = ['conduce', 'bus', 'carrera'];
  const point = (id, st, M) => {
    if (!st) return null;
    if (id === 'carrera') { const p = M.pos(st, st.s, st.cx); return p && { x: p.x, y: p.y }; }
    if (id === 'conduce') { const l = NET.byId[st.line]; if (!l) return null; const p = NET.at(l.P, st.s); return p && { x: p.x, y: p.y }; }
    return Number.isFinite(st.x) && Number.isFinite(st.y) ? { x: st.x, y: st.y } : null;
  };
  const key = (id, lv) => DAY() + '|' + id + '|' + lv;
  const LS = 'elmetro.v1.fantasmas', cache = new Map(); let mem = null;
  const cod = F => { let px = 0, py = 0; const o = []; for (const f of F) { o.push((f[0] - px).toString(36), (f[1] - py).toString(36)); px = f[0]; py = f[1]; } return o.join(','); };
  const dec = d => { const n = String(d || '').split(','), F = []; let x = 0, y = 0; for (let i = 0; i + 1 < n.length; i += 2) { x += parseInt(n[i], 36) || 0; y += parseInt(n[i + 1], 36) || 0; F.push([x, y]); } return F; };
  const guardar = () => {
    if (EM.headless || typeof localStorage === 'undefined' || !mem) return;
    for (let i = 0; i < 8; i++) { try { localStorage.setItem(LS, JSON.stringify(mem)); return; } catch (e) { const ks = Object.keys(mem).sort(); if (!ks.length) return; delete mem[ks[0]]; } }
  };
  const store = () => {
    if (mem) return mem; mem = {};
    try { const t = typeof localStorage !== 'undefined' && !EM.headless ? localStorage.getItem(LS) : null, o = t ? JSON.parse(t) : null; if (o && typeof o === 'object' && !Array.isArray(o)) for (const k in o) { const r = o[k]; if (r && typeof r.d === 'string' && isFinite(r.t)) mem[k] = { v: 2, t: +r.t, score: r.score | 0, d: r.d }; } } catch (e) { mem = {}; }
    const viejo = Save.d && Save.d.best && Save.d.best._retoFantasma;   // 3.8.0: estaban dentro de la partida
    if (viejo && typeof viejo === 'object') { for (const k in viejo) { const r = viejo[k]; if (r && Array.isArray(r.frames) && r.frames.length > 1 && !mem[k]) mem[k] = { v: 2, t: +r.t || 0, score: r.score | 0, d: cod(r.frames) }; } delete Save.d.best._retoFantasma; guardar(); if (Save.write) Save.write(); }
    return mem;
  };
  const get = (id, lv) => {
    const k = key(id, lv), r = store()[k]; if (!r) return null;
    let c = cache.get(k); if (!c || c.d !== r.d) cache.set(k, c = { d: r.d, rec: { v: 2, t: r.t, score: r.score, frames: dec(r.d) } });
    return c.rec;
  };
  const at = (rec, t) => {
    if (!rec || !Array.isArray(rec.frames) || !rec.frames.length) return null;
    const f = Math.min(rec.frames.length - 1, Math.max(0, t / .1)), i = Math.floor(f), j = Math.min(rec.frames.length - 1, i + 1), a = rec.frames[i], b = rec.frames[j], p = f - i;
    return { x: (a[0] * (1-p) + b[0] * p) / 10, y: (a[1] * (1-p) + b[1] * p) / 10 };
  };
  const share = (id, st) => {
    if (typeof QR === 'undefined' || typeof UI === 'undefined' || !st || !st._ghostTrial) return;
    const r = get(id, st._ghostTrial.lv); if (!r) { UI.toast('Todavía no hay mejor marca de hoy para este trayecto'); return; }
    const data = ['EM-RETO-1', DAY(), id, st._ghostTrial.lv, r.t.toFixed(1)].join('|');
    UI.modal('<div class="pag">👻 Reto del día</div><h2>Comparte tu tiempo</h2><div id="ghostQr" style="text-align:center"></div><p class="m">El QR comparte tu marca y recorrido; no la posición completa del fantasma.</p>');
    const n = document.getElementById('ghostQr'); if (n) { const cv = QR.canvas(data, 4, 4, '#154a80', '#f1ece0'); cv.style.maxWidth = 'min(75vw,260px)'; cv.style.height = 'auto'; n.appendChild(cv); }
  };
  const record = (id, st, result) => {
    const g = st && st._ghostTrial; if (!g || g.saved || !result.done) return;
    g.saved = true;
    if (!result.win || g.overflow || g.frames.length < 2) return;
    const all = store();
    const k = key(id, g.lv), prev = all[k];
    if (prev && prev.t <= g.t) return;
    all[k] = { v: 2, t: Math.round(g.t * 10) / 10, score: result.score | 0, d: cod(g.frames) };
    const old = Object.keys(all).sort(); while (old.length > 6) delete all[old.shift()];
    guardar();
  };
  EM.reto = Object.assign(EM.reto || {}, { fantasma: { get, at, point, key, share, dia: DAY, todos: store, cod, dec } });
  for (const id of modes) {
    const M = EM.modes[id]; if (!M || !M.create || !M.step || !M.result || !M.draw) continue;
    const create0 = M.create, step0 = M.step, result0 = M.result, draw0 = M.draw, mount0 = M.mount;
    M.create = function (lv, opts = {}) {
      const st = create0.apply(this, arguments);
      if (!st || opts.auto || EM.headless) return st;
      const p = point(id, st, this);
      if (p) st._ghostTrial = { lv, t: 0, next: .1, frames: [[Math.round(p.x*10), Math.round(p.y*10)]], overflow: false, saved: false };
      return st;
    };
    M.step = function (st, dt) {
      const g = st && st._ghostTrial, before = g && !g.overflow ? point(id, st, this) : null;
      const r = step0.apply(this, arguments);
      if (!g || g.saved || g.overflow || !before || !(dt > 0)) return r;
      const after = point(id, st, this); if (!after) return r;
      const t0 = g.t; g.t += dt;
      while (g.next <= g.t + 1e-8) {
        const f = clamp((g.next-t0)/dt,0,1), x=before.x+(after.x-before.x)*f, y=before.y+(after.y-before.y)*f;
        g.frames.push([Math.round(x*10),Math.round(y*10)]);g.next=Math.round((g.next+.1)*1000)/1000;
        if (g.frames.length >= 36000) { g.overflow=true; break; }
      }
      return r;
    };
    M.result = function(st) {const r=result0.apply(this,arguments);record(id,st,r);return r;};
    M.draw = function(g, st, vp) {
      const r = draw0.apply(this, arguments), trial = st && st._ghostTrial, best = trial && get(id, trial.lv), ghost = best && at(best, trial.t);
      if (!ghost || !g || !vp) return r;
      const pos = point(id, st, this); if (!pos) return r;
      const gap = Math.hypot(pos.x-ghost.x,pos.y-ghost.y);
      /* 3.9 (Claude): la diferencia en TIEMPO, como en las carreras: ¿cuándo pasó el fantasma por donde vas ahora? (el punto suyo
         más cercano, buscado ±60 s alrededor de este instante). Si te sales de su recorrido, la distancia. Va en el borde izquierdo
         a media altura: abajo a la derecha quedaba detrás de la palanca del metro y de los botones del corredor */
      const F = best.frames, i0 = Math.min(F.length - 1, Math.round(trial.t / .1)), qx = pos.x * 10, qy = pos.y * 10; let kb = i0, db = Infinity;
      for (let k = Math.max(0, i0 - 600), k1 = Math.min(F.length - 1, i0 + 600); k <= k1; k++) { const ex = F[k][0] - qx, ey = F[k][1] - qy, d = ex * ex + ey * ey; if (d < db) { db = d; kb = k; } }
      const lejos = db > 250000, dif = trial.t - kb * .1, s1 = Math.abs(dif).toFixed(1).replace('.', ',');
      const txt = lejos ? '👻 a ' + Math.round(gap) + ' m' : Math.abs(dif) < .15 ? '👻 a la par' : dif > 0 ? '👻 te lleva ' + s1 + ' s' : '👻 le llevas ' + s1 + ' s';
      g.save(); g.font = '700 13px Cuerpo, system-ui, sans-serif'; const bx = 8, by = Math.round(vp.h * .4), bw = Math.ceil(g.measureText(txt).width) + 20;
      g.globalAlpha = .84; g.fillStyle = lejos || Math.abs(dif) < .15 ? '#154a80' : dif > 0 ? '#8a2a2e' : '#2f6b3c'; g.beginPath(); if (g.roundRect) g.roundRect(bx, by, bw, 26, 13); else g.rect(bx, by, bw, 26); g.fill();
      g.globalAlpha = 1; g.fillStyle = '#f1ece0'; g.textAlign = 'left'; g.fillText(txt, bx + 10, by + 18);
      if(typeof G3!=='undefined'&&G3.cv&&G3.cv.style.display!=='none'&&G3.toScreen&&G3.vw&&G3.vh){
        const z=MAP.elevM(ghost.x,ghost.y)+2, p=G3.toScreen(ghost.x,z,ghost.y,G3.vw,G3.vh);
        if(p&&p.x>=0&&p.y>=0&&p.x<G3.vw&&p.y<G3.vh){
          g.globalAlpha=.38;g.fillStyle='#59AB42';g.beginPath();g.arc(p.x*vp.w/G3.vw,p.y*vp.h/G3.vh,13,0,TAU);g.fill();
        }
      }
      g.restore();return r;
    };
  }
  /* 3.9 (Claude): el QR de la marca va en la pantalla final (antes era un botón fijo encima del título de la partida) */
  if (typeof Game !== 'undefined' && Game.end) {
    const end0 = Game.end;
    Game.end = function (r1) {
      const st = this.st, id = this.mode && this.mode.id, r = end0.apply(this, arguments);
      try {
        const tr = st && st._ghostTrial, rec = tr && modes.includes(id) && get(id, tr.lv), fila = !EM.headless && document.querySelector('#mBody #rsX');
        if (rec && fila && !document.getElementById('rsGh')) {
          const nueva = tr.saved && Math.abs(rec.t - Math.round(tr.t * 10) / 10) < .05 && r1 && r1.win;
          const p = document.createElement('p'); p.className = 'm'; p.textContent = (nueva ? '👻 ¡Nuevo récord del día! ' : '👻 Récord del día: ') + rec.t.toFixed(1).replace('.', ',') + ' s. Mañana empieza otro.'; fila.parentNode.before(p);
          const b = document.createElement('button'); b.id = 'rsGh'; b.className = 'btn sm'; b.textContent = '👻 QR de la marca'; b.onclick = () => share(id, st); fila.before(b);
        }
      } catch (e) { EM.errors.push('fantasma: ' + e.message); }
      return r;
    };
  }
})();