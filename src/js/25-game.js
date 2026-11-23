/* =====================================================================
   MOTOR DE PARTIDA: bucle, vistas (1 o 2 jugadores en pantalla), pausa y resultados
   Un modo implementa: create(lv, opts) → estado (JSON), step(st, dt), draw(g, st, vp),
   pointer(st, tipo, x, y, vp) → acción | null, act(st, acción), result(st), ai(st) → acción | null,
   levels() → [{id, name, sub}], y opcional mount(st, el) / key(st, k, down) / hud(st).
   ===================================================================== */
const Game = EM.game = {
  mode: null, st: null, st2: null, lv: null, opts: null, raf: 0, last: 0, paused: false, vps: [], duel: false, ended: false, net: null, hudT: 0,
  start(modeId, lv, opts = {}) {
    const M = EM.modes[modeId]; if (!M) return;
    this.stop(); this.mode = M; this.lv = lv; this.opts = opts; this.duel = !!opts.duel; this.ended = false; this.paused = false;
    const seed = opts.seed != null ? opts.seed : (Date.now() & 0x7fffffff);
    this.st = M.create(lv, Object.assign({ seed }, opts)); this.st2 = this.duel ? M.create(lv, Object.assign({ seed }, opts, { p2: true })) : null;
    if (EM.headless) return;
    UI.show('game'); $('#gctl').innerHTML = ''; $('#gmsg').innerHTML = '';
    const L = (M.levels().find(l => l.id === lv) || {}); $('#gTitle').textContent = M.name + (L.name ? ' · ' + L.name : ''); $('#gSub').textContent = this.duel ? 'Duelo de mesa · 2 jugadores' : (L.sub || M.sub || '');
    if (M.mount && !this.duel) M.mount(this.st, $('#gctl'));
    if (M.camara && !this.duel && EM.camui) EM.camui.mount(this.st);   // pellizco, arrastre y ángulo en las vistas desde arriba
    Music.play(M.music || 'puzzle');
    this.last = now(); const loop = () => { this.raf = requestAnimationFrame(loop); this.frame(); }; this._loop = loop; this.raf = requestAnimationFrame(loop);
  },
  /* congela el bucle (capturas y pruebas) */
  freeze(on) { if (on) { cancelAnimationFrame(this.raf); this.raf = 0; } else if (!this.raf && this._loop && this.mode) { this.last = now(); this.raf = requestAnimationFrame(this._loop); } },
  stop() { cancelAnimationFrame(this.raf); this.raf = 0; this._loop = null; if (EM.camui) EM.camui.unmount(); if (this.mode && this.mode.unmount) this.mode.unmount(this.st); if (EM.g3 && EM.g3.cv) EM.g3.show(false); },
  frame() {
    // tiempo real aunque el celular dé pocos cuadros: los modos con pasos cortos (substeps) avanzan lo que de verdad pasó, en pasos
    // de 1/30 s, y con su ritmo (escala: ×1, ×2, ×3); los demás, como siempre, con un tope de 50 ms por cuadro
    const t = now(), raw = Math.max(0, t - this.last), M = this.mode; this.last = t; let dt = M.substeps ? Math.min(.12, raw) : Math.min(.05, raw); if (this.paused) dt = 0;
    // calidad automática: si los cuadros pasan de ~34 ms se baja la densidad de píxeles del lienzo (hasta 1); si sobran, se sube (hasta 2)
    if (raw > 0 && raw < .25) this.ft = this.ft ? this.ft * .95 + raw * .05 : raw;
    const q = Save.d.settings.q; if (q === 'auto' && this.ft) { const D = this.dpr || 2; if (this.ft > .034 && D > 1 && t - (this.dprT || 0) > 1.5) { this.dpr = Math.max(1, D - .25); this.dprT = t; } else if (this.ft < .019 && D < 2 && t - (this.dprT || 0) > 4) { this.dpr = Math.min(2, D + .25); this.dprT = t; } }
    const cv = $('#gcv'); if (!cv.clientWidth || !cv.clientHeight) return; const { w, h } = fitCanvas(cv, q === 'low' ? 1 : q === 'auto' ? (this.dpr || 2) : 2), g = cv.getContext('2d');
    if (this._sat == null || this._satW !== innerWidth || this._satH !== innerHeight) { this._sat = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sat')) || 0; this._satW = innerWidth; this._satH = innerHeight; }   // relevo Z1: se lee al cambiar el tamaño, no en cada cuadro
    const top = (46 + this._sat) * (w / cv.clientWidth || 1);
    this.vps = this.duel ? [{ x: 0, y: top + (h - top) / 2, w, h: (h - top) / 2, flip: false, st: this.st }, { x: 0, y: top, w, h: (h - top) / 2, flip: true, st: this.st2 }] : [{ x: 0, y: this.mode.fullCanvas ? 0 : top, w, h: this.mode.fullCanvas ? h : h - top, flip: false, st: this.st, top }];
    MAP.prisa = t + .012; MAP._hechos = 0;   // presupuesto del cuadro para armar trozos del mapa (12 ms; siempre al menos uno)
    try {
      if (dt > 0) for (const vp of this.vps) { if (M.substeps) { let r = dt * (M.escala ? M.escala(vp.st) : 1), n = 0; while (r > 1e-4 && n++ < 14) { const p = Math.min(r, 1 / 30); M.step(vp.st, p); r -= p; } } else M.step(vp.st, dt); }
      g.setTransform(1, 0, 0, 1, 0, 0); if (this.mode.gl && this.mode.gl(this.st) && !this.duel) g.clearRect(0, 0, w, h); else { g.fillStyle = PAL.noche; g.fillRect(0, 0, w, h); if (EM.g3 && EM.g3.cv) EM.g3.show(false); }
      for (const vp of this.vps) { g.save(); g.translate(vp.x, vp.y); if (vp.flip) { g.translate(vp.w, vp.h); g.rotate(Math.PI); } g.beginPath(); g.rect(0, 0, vp.w, vp.h); g.clip(); this.mode.draw(g, vp.st, vp); g.restore(); }
      if (this.duel) { g.fillStyle = PAL.negro; g.fillRect(0, this.vps[0].y - 3, w, 6); }
    } catch (e) { EM.errors.push('frame ' + this.mode.id + ': ' + e.message); console.error(e); }
    MAP.prisa = 0;
    if ((this.hudT -= dt) <= 0) { this.hudT = .2; this.hud(); }
    if (this.net && this.net.tick) this.net.tick(dt);
    if (!this.ended && !(this.net && this.net.guest) && !this.mode.endless) { const r1 = this.mode.result(this.st), r2 = this.st2 ? this.mode.result(this.st2) : null; if (r1.done || (r2 && r2.done)) this.end(r1, r2); }
  },
  hud() {
    const M = this.mode, ch = $('#gChips'); if (!ch) return;
    const items = this.duel ? [['J1', M.result(this.st).score | 0], ['J2', M.result(this.st2).score | 0]] : (M.hud ? M.hud(this.st) : []); if (this.net && this.net.chips) items.push(...this.net.chips()); if (!this.duel && EM.mundo) items.push(['', EM.mundo.chip()]);
    ch.innerHTML = items.map(([k, v]) => `<span class="chip">${esc(k)} <b>${esc(v)}</b></span>`).join('');
  },
  toLocal(vp, x, y) { let lx = x - vp.x, ly = y - vp.y; if (vp.flip) { lx = vp.w - lx; ly = vp.h - ly; } return { x: lx, y: ly }; },
  pointer(type, ev) {
    if (this.paused || !this.mode || !this.mode.pointer) return; const cv = $('#gcv'), r = cv.getBoundingClientRect(), k = cv.width / r.width, x = (ev.clientX - r.left) * k, y = (ev.clientY - r.top) * k;
    const vp = this.vps.find(v => x >= v.x && x < v.x + v.w && y >= v.y && y < v.y + v.h); if (!vp) return;
    const p = this.toLocal(vp, x, y), a = this.mode.pointer(vp.st, type, p.x, p.y, vp);
    if (a) { if (this.net && this.net.guest && vp.st === this.st) this.net.sendAct(a); else this.mode.act(vp.st, a); }
  },
  pause(on = !this.paused) {
    if (this.ended) return; this.paused = on;
    if (on) UI.modal(`<div class="pag">Pausa</div><h2>${esc(this.mode.name)}</h2><p class="m">${esc(this.mode.tip || '')}</p><div class="col"><button class="btn pri" id="pzC">▶ Continuar</button><button class="btn sm" id="pzR">↻ Reiniciar</button><button class="btn sm gh" id="pzX">Salir</button></div>`, () => { this.paused = false; });
    if (on && !EM.headless) { $('#pzC').onclick = () => UI.close(); $('#pzR').onclick = () => { UI.close(); this.start(this.mode.id, this.lv, Object.assign({}, this.opts, { seed: undefined })); }; $('#pzX').onclick = () => { UI.close(); this.exit(); }; }
  },
  exit() { const ex = this.opts && this.opts.onExit; this.stop(); if (this.net && this.net.leave) this.net.leave(); this.net = null; if (ex) { ex(); return; } Music.play('menu'); const back = this.opts && this.opts.back; UI.stack = UI.stack.filter(s => s !== 'game'); UI.show(back || 'levels', false); },
  end(r1, r2) {
    this.ended = true; const M = this.mode;
    try { if (!EM.headless) Vida.onGame(M.id, this.st, r1); } catch (e) { EM.errors.push('vida: ' + e.message); }
    try { if (EM.actividades && EM.actividades.onGameEnd) EM.actividades.onGameEnd(M.id, this.st, r1); } catch (e) { EM.errors.push('rpg: ' + e.message); }
    if (this.opts.onEnd) { this.opts.onEnd(r1, r2); return; }
    if (this.duel) {
      const a = r1.score | 0, b = r2.score | 0, w = a === b ? 'Empate' : a > b ? 'Gana Jugador 1' : 'Gana Jugador 2'; Snd.play('win');
      UI.modal(`<div class="pag">Duelo de mesa</div><h2>${w}</h2><div class="kv"><b>Jugador 1</b><span>${fmt(a)} puntos</span><b>Jugador 2</b><span>${fmt(b)} puntos</span></div><div class="row" style="margin-top:14px"><button class="btn pri" id="rsR">↻ Revancha</button><button class="btn sm gh" id="rsX">Salir</button></div>`);
      $('#rsR').onclick = () => { UI.close(); this.start(M.id, this.lv, this.opts); }; $('#rsX').onclick = () => { UI.close(); this.exit(); }; return;
    }
    if (this.net && this.net.onEnd) this.net.onEnd(r1);
    const earn = Save.record(M.id, this.lv, r1); Snd.play(r1.win ? 'win' : 'lose'); vib(r1.win ? 40 : 120);
    const lvls = M.levels(), i = lvls.findIndex(l => l.id === this.lv), nx = lvls[i + 1];
    const stars = '★'.repeat(r1.stars | 0) + '☆'.repeat(3 - (r1.stars | 0));
    const bien = r1.win && (r1.stars | 0) > 0;
    UI.modal(`<div class="pag">${r1.win ? (bien ? 'Misión cumplida' : 'Llegaste') : 'Fin de la partida'}</div><h2>${bien ? '¡Bien hecho!' : r1.win ? 'Llegaste, sin estrellas' : 'Casi…'}</h2><div style="font-size:34px;color:var(--mostaza);letter-spacing:.1em">${stars}</div>${r1.win && !bien ? '<p class="m">Para ganar estrellas suma más puntos: suavidad, puntualidad y cuidar a los pasajeros.</p>' : ''}
      <div class="kv" style="margin:10px 0">${(r1.lines || []).map(([k, v]) => `<b>${esc(k)}</b><span>${esc(v)}</span>`).join('')}<b>Puntaje</b><span>${fmt(r1.score)}</span><b>Pasajes</b><span>+${earn} 🎫</span></div>
      ${r1.fact ? `<div class="film" style="margin:10px 0">Dato · ${esc(r1.fact)}</div>` : ''}
      <div class="row"><button class="btn pri" id="rsN" ${nx && r1.win ? '' : 'hidden'}>Siguiente ▶</button><button class="btn sm" id="rsR">↻ Otra vez</button><button class="btn sm gh" id="rsX">Salir</button></div>`);
    if (EM.headless) return;
    $('#rsN').onclick = () => { UI.close(); this.start(M.id, nx.id, Object.assign({}, this.opts, { seed: undefined })); };
    $('#rsR').onclick = () => { UI.close(); this.start(M.id, this.lv, Object.assign({}, this.opts, { seed: undefined })); };
    $('#rsX').onclick = () => { UI.close(); this.exit(); };
  },
  bind() {
    const cv = $('#gcv');
    cv.addEventListener('pointerdown', e => { Snd.init(); Snd.resume(); cv.setPointerCapture && cv.setPointerCapture(e.pointerId); this.pointer('down', e); });
    cv.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') this.pointer('move', e); });
    cv.addEventListener('pointerup', e => this.pointer('up', e));
    $('#gPause').onclick = () => this.pause(true);
    addEventListener('keydown', e => { if (UI.cur !== 'game' || !this.mode) return; if (e.key === 'Escape' || e.key === 'p') { this.pause(); return; } if (this.mode.key && !this.paused) this.mode.key(this.st, e.key, true); });
    addEventListener('keyup', e => { if (UI.cur === 'game' && this.mode && this.mode.key) this.mode.key(this.st, e.key, false); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && UI.cur === 'game' && !this.ended && !this.net) this.pause(true); });
    UI.onback.game = () => { if (!$('#modal').hidden) return false; this.pause(true); return true; };
  }
};
/* reglas de estrellas comunes */
function starsOf(frac) { return frac >= .8 ? 3 : frac >= .55 ? 2 : frac >= .25 ? 1 : 0; }
