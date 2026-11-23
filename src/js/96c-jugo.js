/* =====================================================================
   JUGO (3.4 «Jugo y ciclovías», Claude, 23‑nov‑2026) · que cada acierto se sienta
   La auditoría de la 3.2 encontró que casi todo se comunicaba con texto. La investigación sobre sensación de juego («juice»)
   pide retroalimentación generosa a cada acción, pero la sacudida solo en lo que importa: si todo sacude, es ruido.
   - En todos los modos: cuando el puntaje sube de golpe (frenar en la marca, llegar puntual, una entrega, un truco), el número
     salta y sube con un destello suave y una vibración corta; si baja de golpe (un choque, un semáforo en rojo), destello rojo,
     vibración más larga y una sacudida breve de la vista desde arriba.
   - Los modos pueden pedir su propio aviso con EM.jugo.pop(st, texto, color) y EM.jugo.golpe(st) (la carrera por ciclovías
     lo usa para trucos, grind, rampas y caídas).
   - Nada en el bot, en las pruebas sin pantalla ni en el duelo de mesa (dos jugadores en la misma pantalla).
   ===================================================================== */
(function () {
  if (typeof Game === 'undefined') return;
  const COL = { g: '#9be15d', y: '#F6C538', r: '#ff6b5a', b: '#8fd3ff' };
  const J = EM.jugo = {
    pops: [], flashT: 0, flashD: 1, flashC: '', shakeT: 0,
    activo(st) { return !EM.headless && !(st && st.auto) && !Game.duel && Game.st === st; },
    pop(st, txt, c = 'g') {
      if (!this.activo(st)) return; this.pops.push({ txt: String(txt), c: COL[c] || c, t0: now(), dx: (Math.random() - .5) * 46 }); if (this.pops.length > 4) this.pops.shift();
      if (c === 'g') { this.flash('rgba(155,225,93,.13)', .18); this.vib(12); } else if (c === 'y') { this.flash('rgba(246,197,56,.16)', .22); this.vib(18); }
    },
    golpe(st, leve) { if (!this.activo(st)) return; this.shakeT = leve ? .14 : .26; this.flash('rgba(255,90,70,.26)', .28); this.vib(leve ? 30 : 70); },
    flash(c, d) { this.flashC = c; this.flashT = now(); this.flashD = d; },
    vib(ms) { try { if (typeof vib === 'function') vib(ms); } catch (e) { /* sin vibración */ } },
    /* encima del dibujo del modo: los números que suben y el destello */
    draw(g, W, H) {
      const t = now(), d = W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W);
      if (this.flashC && t - this.flashT < this.flashD) { g.save(); g.globalAlpha = 1 - (t - this.flashT) / this.flashD; g.fillStyle = this.flashC; g.fillRect(0, 0, W, H); g.restore(); }
      if (!this.pops.length) return; g.save(); g.textAlign = 'center'; g.textBaseline = 'middle';
      this.pops = this.pops.filter(p => t - p.t0 < 1.15);
      this.pops.forEach((p, i) => {
        const a = (t - p.t0) / 1.15, esc = a < .12 ? .6 + a / .12 * .55 : 1.15 - Math.min(.15, (a - .12) * .4), y = H * .36 - a * 70 * d - i * 6 * d;
        g.globalAlpha = a > .7 ? 1 - (a - .7) / .3 : 1; g.font = '900 ' + Math.round(22 * d * esc) + 'px Cuerpo, sans-serif';
        g.lineWidth = 5 * d; g.strokeStyle = 'rgba(15,34,56,.9)'; g.strokeText(p.txt, W / 2 + p.dx * d, y); g.fillStyle = p.c; g.fillText(p.txt, W / 2 + p.dx * d, y);
      });
      g.restore();
    }
  };
  const marca = st => st ? (typeof st.score === 'number' ? st.score : typeof st.pts === 'number' ? st.pts : null) : null;
  for (const id in EM.modes) {
    const M = EM.modes[id]; if (!M || M._jugo) continue; M._jugo = true;
    const step0 = M.step, draw0 = M.draw;
    if (typeof step0 === 'function' && id !== 'carrera') M.step = function (st, dt) {   // la carrera tiene sus propios avisos
      const a = marca(st), r = step0.apply(this, arguments);
      if (a != null && J.activo(st)) { const b = marca(st), d = Math.round(b - a); if (d >= 100) J.pop(st, '+' + d, d >= 400 ? 'y' : 'g'); else if (d <= -100) { J.pop(st, String(d), 'r'); J.golpe(st, d > -150); } }
      return r;
    };
    if (typeof draw0 === 'function') M.draw = function (g, st, vp) {
      const sh = J.shakeT > 0 && J.activo(st) && !(this.gl && this.gl(st)); let ox = 0, oy = 0;
      if (sh) { const k = J.shakeT * 26; ox = (Math.random() - .5) * k; oy = (Math.random() - .5) * k; g.save(); g.translate(ox, oy); }
      const r = draw0.apply(this, arguments); if (sh) g.restore();
      if (J.activo(st)) J.draw(g, vp.w, vp.h);
      return r;
    };
  }
  /* la sacudida se apaga con el tiempo real (una vez por cuadro) */
  const frame0 = Game.frame; let tUlt = now();
  Game.frame = function () { const t = now(); if (J.shakeT > 0) J.shakeT = Math.max(0, J.shakeT - (t - tUlt)); tUlt = t; return frame0.apply(this, arguments); };
})();
