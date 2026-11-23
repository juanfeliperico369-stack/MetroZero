/* OpenAI GPT-6 · Eón · CX-36-2
   Fantasma diario con muestreo interpolado cada 0,1 s, por modo y recorrido.
   Usa Save.d.best (ya existente) para preservar elmetro.v1; no añade nuevas claves raíz.
   QR comparte el tiempo y el nivel, no el trazado del fantasma. */
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
  const store = () => {
    if (!Save.d || !Save.d.best) return null;
    if (!Save.d.best._retoFantasma || typeof Save.d.best._retoFantasma !== 'object') Save.d.best._retoFantasma = {};
    return Save.d.best._retoFantasma;
  };
  const get = (id, lv) => { const o = store(); return o ? o[key(id, lv)] || null : null; };
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
    const all = store(); if (!all) return;
    const k = key(id, g.lv), prev = all[k];
    if (prev && prev.t <= g.t) return;
    all[k] = { v: 1, t: Math.round(g.t * 10) / 10, frames: g.frames, score: result.score | 0 };
    const old = Object.keys(all).sort(); while (old.length > 6) delete all[old.shift()];
    Save.write();
  };
  EM.reto = Object.assign(EM.reto || {}, { fantasma: { get, at, point, key, share, dia: DAY } });
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
      g.save(); g.globalAlpha=.68; g.fillStyle='#154a80';g.fillRect(Math.max(0,vp.w-148),Math.max(4,vp.h-57),145,29);
      g.fillStyle='#f1ece0';g.font='bold 12px system-ui';g.fillText('👻 '+Math.round(gap)+' m',Math.max(4,vp.w-139),Math.max(15,vp.h-38));
      if(typeof G3!=='undefined'&&G3.cv&&G3.cv.style.display!=='none'&&G3.toScreen&&G3.vw&&G3.vh){
        const z=MAP.elevM(ghost.x,ghost.y)+2, p=G3.toScreen(ghost.x,z,ghost.y,G3.vw,G3.vh);
        if(p&&p.x>=0&&p.y>=0&&p.x<G3.vw&&p.y<G3.vh){
          g.globalAlpha=.38;g.fillStyle='#59AB42';g.beginPath();g.arc(p.x*vp.w/G3.vw,p.y*vp.h/G3.vh,13,0,TAU);g.fill();
        }
      }
      g.restore();return r;
    };
    if(mount0) M.mount = function(st,el){const r=mount0.apply(this,arguments);if(!EM.headless&&el&&el.appendChild){const b=document.createElement('button');b.className='btn sm gh';b.textContent='👻 QR récord';b.onclick=()=>share(id,st);el.appendChild(b);}return r;};
  }
})();