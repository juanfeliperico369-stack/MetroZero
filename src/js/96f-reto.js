/* =====================================================================
   RETO DEL DÍA (3.6, Claude, 23‑nov‑2026) · partidas cortas con una meta clara y una razón para volver mañana
   (lo que más hace volver en Super Arcade Racing, Mini Metro o Alto's: el plan del documento de evolución, sección 6).
   - Cada día, un reto distinto y el mismo para todos ese día (la semilla es la fecha): un tramo del metro con 3 ★, el tranvía
     sin frenadas de emergencia, el Metroplús con 3 ★, una ciclorruta sin perder vidas o un metrocable con 2 ★ o más.
   - Cumplirlo da 40 🎫 y, con la racha de días seguidos, hasta 100. Se guarda en Save.d.reto (con su valor por defecto).
   - En la portada, debajo de «Todos los modos»: «⭐ Reto del día».
   ===================================================================== */
(function () {
  if (typeof Game === 'undefined' || typeof Menu === 'undefined') return;
  const fecha = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const R = EM.reto = Object.assign(EM.reto || {}, {   // 3.9: sin borrar lo que otro módulo ya puso (EM.reto.fantasma, de 48a)
    datos() { return Save.d.reto || (Save.d.reto = { dia: '', racha: 0, ultimo: '' }); },
    hoy() {
      const dia = fecha(new Date()), listo = typeof VC !== 'undefined' && VC.on; if (this._c && this._c.dia === dia && this._c.listo === listo) return this._c;
      const rng = new RNG(hashStr('reto ' + dia)), P = [], de = (id, f) => { const M = EM.modes[id]; return M ? M.levels().filter(f) : []; };
      let L = de('conduce', l => !l.full && !l.escuela && /^[AB]:\d+-\d+$/.test(l.id)); if (L.length) { const l = rng.pick(L); P.push({ m: 'conduce', lv: l.id, t: 'Metro · ' + l.name, meta: 'Llega con 3 ★: frena justo en la marca', ok: r => (r.stars | 0) >= 3 }); }
      L = de('tranvia', () => true); if (L.length) { const l = rng.pick(L); P.push({ m: 'tranvia', lv: l.id, t: 'Tranvía · ' + l.name, meta: '3 ★ y ninguna frenada de emergencia', ok: r => (r.stars | 0) >= 3 }); }
      L = de('bus', l => /^bus:MP/.test(l.id) && !l.full); if (L.length) { const l = rng.pick(L); P.push({ m: 'bus', lv: l.id, t: 'Metroplús · ' + l.name, meta: 'Llega con 3 ★', ok: r => (r.stars | 0) >= 3 }); }
      L = de('carrera', l => /^cr:c\d+$/.test(l.id)); if (L.length) { const l = rng.pick(L); P.push({ m: 'carrera', lv: l.id, t: 'Ciclorruta ' + l.name, meta: 'Llega al final sin perder una vida', ok: (r, st) => !!r.win && !!st && st.vidas >= 3 }); }
      L = de('cableviaje', () => true); if (L.length) { const l = rng.pick(L); P.push({ m: 'cableviaje', lv: l.id, t: 'Metrocable · ' + l.name, meta: 'Llega con 2 ★ o más', ok: r => (r.stars | 0) >= 2 }); }
      return (this._c = Object.assign({ dia, listo }, P.length ? P[(hashStr(dia) >>> 0) % P.length] : {}));
    },
    hecho() { return this.datos().dia === fecha(new Date()); },
    jugar() { const H = this.hoy(); if (!H.m) return; Snd.init(); Game.start(H.m, H.lv, { back: 'cover', onEnd: r => this.fin(H, r) }); },
    fin(H, r) {
      const st = Game.st, D = this.datos(), ok = !!H.ok(r, st), earn = Save.record(H.m, H.lv, r); let premio = 0;
      if (ok && D.dia !== H.dia) { const a = new Date(); a.setDate(a.getDate() - 1); D.racha = D.ultimo === fecha(a) ? D.racha + 1 : 1; D.ultimo = H.dia; D.dia = H.dia; if (D.racha >= 7 && typeof Vida !== 'undefined') Vida.logro('racha7'); premio = 40 + 10 * Math.min(6, D.racha - 1); Save.d.wallet += premio; Save.write(); if (EM.jugo) EM.jugo.pop(st, '⭐ +' + premio + ' 🎫', 'y'); }
      UI.modal(`<div class="pag">⭐ Reto del día</div><h2>${ok ? '¡Reto cumplido!' : 'Casi…'}</h2><p class="m">${esc(H.t)}<br><b>${esc(H.meta)}</b></p><div style="font-size:30px;color:var(--mostaza)">${'★'.repeat(r.stars | 0)}${'☆'.repeat(3 - (r.stars | 0))}</div><div class="kv" style="margin:10px 0">${(r.lines || []).map(([k, v]) => `<b>${esc(k)}</b><span>${esc(v)}</span>`).join('')}<b>Pasajes</b><span>+${earn + premio} 🎫</span>${D.racha ? `<b>Racha</b><span>${D.racha} ${D.racha === 1 ? 'día' : 'días seguidos'}</span>` : ''}</div><div class="row">${ok ? '' : '<button class="btn pri" id="rtOtra">↻ Otra vez</button>'}<button class="btn ${ok ? 'pri' : 'sm gh'}" id="rtSal">Salir</button></div>`);
      const o = $('#rtOtra'); if (o) o.onclick = () => { UI.close(); Game.stop(); this.jugar(); };
      $('#rtSal').onclick = () => { UI.close(); Game.exit(); this.etiqueta(); };
    },
    etiqueta() { const b = document.getElementById('bReto'); if (!b) return; const H = this.hoy(), D = this.datos(); b.querySelector('small').textContent = H.m ? (this.hecho() ? '✓ Cumplido hoy' + (D.racha > 1 ? ' · racha ' + D.racha : '') : H.t + ' · ' + H.meta) : 'Mañana hay otro'; }
  });
  const bind0 = Menu.bind;
  Menu.bind = function () {
    const r = bind0.apply(this, arguments), play = document.getElementById('bPlay');
    if (play && !document.getElementById('bReto')) { const b = document.createElement('button'); b.className = 'parada'; b.id = 'bReto'; b.style.setProperty('--c', 'var(--mostaza, #F6C538)'); b.innerHTML = '<i></i><span><b>⭐ Reto del día</b><small>Cargando…</small></span>'; play.insertAdjacentElement('afterend', b); b.onclick = () => { Snd.init(); Snd.play('tap'); R.jugar(); }; }
    return r;
  };
  const t = setInterval(() => { if (!EM.ready || typeof VC === 'undefined' || !VC.on) return; clearInterval(t); R.etiqueta(); }, 300);
})();
