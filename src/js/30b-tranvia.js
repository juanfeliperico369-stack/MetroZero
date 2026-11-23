/* =====================================================================
   TRANVÍA DE AYACUCHO (3.1) · el modo propio que pidió el autor («falta el minijuego o manejo del Tranvía»)
   Se apoya en el modo Metro (30-conduce.js: palanca, puertas, crucero, vistas de cabina, de lado y en 3D) y le suma lo que es
   del tranvía, que va por la calle:
   - solo sus tramos (San Antonio – Oriente, y de vuelta);
   - la campana 🔔 en vez del pito;
   - cruces con peatones entre estación y estación: si hay gente cruzando, toca la campana (se apuran) y llega despacio
     (≤ 10 km/h). Si llegas rápido con gente en el cruce, frenada de emergencia y una estrella menos.
   Lo que pocos saben: el de Ayacucho es un Translohr, con llantas de caucho guiadas por un riel central; por eso sube la loma.
   ===================================================================== */
(() => {
  const C = EM.modes.conduce; if (!C) return;
  const T = EM.modes.tranvia = Object.create(C);
  Object.assign(T, {
    id: 'tranvia', name: 'Tranvía de Ayacucho', sub: 'Por la calle, de San Antonio a Oriente', substeps: true,
    tip: 'Sube la palanca (o toca ▲ / ⏫ Crucero) para avanzar y baja para frenar. Si ves gente cruzando, toca la campana 🔔 y pasa despacio (10 km/h o menos). En cada estación abre puertas.',
    levels() { return C.levels().filter(l => l.line === 'T'); },
    create(lv, opts) {
      const st = C.create.call(this, lv, opts), line = NET.byId.T, rng = new RNG(((opts && opts.seed) | 0) + 31), s0 = st.s, s1 = st.tgt && st.tgt.length ? st.tgt[st.tgt.length - 1] : (st.dir > 0 ? line.P.len : 0);
      st.cruces = []; st.crOk = 0; st.emerg = 0; st.campana = -9;
      const a = Math.min(s0, s1), b = Math.max(s0, s1), lejos = s => line.st.every(e => Math.abs(e.s - s) > 45);
      for (let s = a + 120; s < b - 60; s += 190 + rng.f() * 90) if (lejos(s)) st.cruces.push({ s, p: rng.f(), dur: 5 + rng.f() * 3, on: false, hecho: false });
      return st;
    },
    step(st, dt) {
      C.step.call(this, st, dt); if (!st.cruces || st.done) return;
      for (const c of st.cruces) {
        if (c.hecho) continue; const d = (c.s - st.s) * st.dir;
        if (d < -10) { c.hecho = true; continue; }
        if (!c.on && !c.visto && d < 140) { c.visto = true; if (c.p < .7) { c.on = true; c.t0 = st.t; this.msg(st, '🚶 Gente cruzando a ' + Math.round(d) + ' m: toca la campana 🔔 y llega despacio', 'y'); } }
        if (c.on) {
          if (st.campana > c.t0) c.dur = Math.min(c.dur, st.campana - c.t0 + 1.5);   // con la campana se apuran
          if (st.t - c.t0 > c.dur) { c.on = false; c.libre = true; }
          if (st.auto && d < 90) { if (st.campana < c.t0) st.campana = st.t; if (st.v > 2.5) st.v = Math.max(2.5, st.v - 4 * dt); }   // el piloto también: campana y despacio
        }
        if (d < 6 && d > -2 && !c.hecho) {
          if (c.on && st.v > 3) { st.v = Math.min(st.v, .4); st.emerg++; c.on = false; c.hecho = true; this.msg(st, '¡Frenada de emergencia! Había gente en el cruce', 'r'); if (!EM.headless) { Snd.play('crash'); vib(80); } }
          else { c.hecho = true; if (c.visto && c.p < .7) { st.crOk++; this.msg(st, '✔ Cruce seguro', 'g'); } }
        }
      }
    },
    mount(st, el) {
      C.mount.call(this, st, el); const h = $('#cHorn');
      if (h) { h.innerHTML = '<b>🔔</b>CAMPANA'; h.onclick = () => { st.campana = st.t; Snd.play('bell'); vib(20); }; }
    },
    key(st, k, down) { if (down && (k === 'b' || k === 'c')) { st.campana = st.t; Snd.play('bell'); return; } return C.key.call(this, st, k, down); },
    draw(g, st, vp) {
      C.draw.call(this, g, st, vp); if (!st.cruces) return;
      const c = st.cruces.find(q => q.on && !q.hecho && (q.s - st.s) * st.dir < 160); if (!c) return;
      const W = vp.w, d = W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W), dist = Math.max(0, Math.round((c.s - st.s) * st.dir)), txt = '🚶 Gente en el cruce · ' + dist + ' m' + (st.campana > c.t0 ? ' · 🔔' : ' · toca 🔔');
      g.save(); g.font = '800 ' + Math.round(14 * d) + 'px Cuerpo, sans-serif'; const w = g.measureText(txt).width + 24 * d, x = W / 2 - w / 2, y = 196 * d;
      g.fillStyle = 'rgba(15,34,56,.9)'; g.fillRect(x, y, w, 30 * d); g.fillStyle = dist < 40 && st.v > 3 ? '#ff6b5a' : '#F6C538'; g.fillRect(x, y, 6 * d, 30 * d); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, W / 2 + 3 * d, y + 15 * d); g.restore();
    },
    result(st) {
      const r = C.result.call(this, st); if (!st.cruces) return r;
      r.lines = (r.lines || []).concat([['Cruces seguros', st.crOk], ['Frenadas de emergencia', st.emerg]]); if (st.emerg) r.stars = Math.max(0, (r.stars | 0) - Math.min(2, st.emerg));
      if (!r.fact) r.fact = 'El tranvía de Ayacucho es un Translohr: llantas de caucho guiadas por un riel central, por eso sube la loma hasta Oriente.';
      return r;
    }
  });
})();
