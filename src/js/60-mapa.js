/* =====================================================================
   LA RED (vista panorámica y general): todo el Valle de Aburrá con las líneas,
   vehículos en servicio, datos de cada estación y la gestión de la flota (estilo idle).
   ===================================================================== */
const KW = { metro: 14, tram: 6, cable: 4, brt: 7, feeder: 3, escalator: 1, future: 0 };
const GROUPS = [['metro', 'Metro'], ['tram', 'Tranvía'], ['cable', 'Cables'], ['brt', 'Metroplús'], ['feeder', 'Alimentadores'], ['future', 'Futuro']];
const RedView = EM.red = {
  cam: { x: 0, y: 0, k: .05 }, on: { metro: 1, tram: 1, cable: 1, brt: 1, feeder: 1, future: 1, escalator: 1 }, ptr: new Map(), raf: 0, t: 0, sel: null, moved: 0,
  flota(id) { const r = Save.d.red.lines[id]; return r ? r.f : 1; },
  income() { let h = 0; for (const l of NET.lines) h += (KW[l.kind] || 0) * this.flota(l.id) * 6; return h; },   // pasajes por hora
  collect() {
    const d = Save.d.red, hrs = clamp((Date.now() - (d.last || Date.now())) / 3600000, 0, 8), earn = Math.floor(this.income() * hrs);
    d.last = Date.now(); if (earn > 0) { Save.d.wallet += earn; d.pax += earn * 37; Save.write(); UI.toast('Mientras no estabas la red movió ' + fmt(earn * 37) + ' pasajeros: +' + fmt(earn) + ' 🎫'); }
  },
  open() {
    UI.show('red'); this.collect(); const cv = $('#rcv'); fitCanvas(cv);
    if (!this.cam.init) { const A = NET.byId.A; const p = A ? NET.at(A.P, A.P.len / 2) : { x: MW * TM / 2, y: MH * TM / 2 }; this.cam = { x: p.x, y: p.y, k: Math.min(cv.width / 16000, cv.height / 26000), init: 1 }; }
    $('#rChips').innerHTML = GROUPS.filter(([k]) => NET.lines.some(l => l.kind === k)).map(([k, n]) => `<button data-k="${k}" class="${this.on[k] ? '' : 'off'}"><span class="badge" style="background:${(NET.lines.find(l => l.kind === k) || {}).color}">${KIND[k].icon}</span>${n}</button>`).join('') + '<button data-k="_flota">🎫 Flota</button>';
    $$('#rChips button').forEach(b => b.onclick = () => { const k = b.dataset.k; if (k === '_flota') { this.flotaCard(); return; } this.on[k] = !this.on[k]; b.classList.toggle('off', !this.on[k]); });
    this.info(); cancelAnimationFrame(this.raf); const loop = () => { if (UI.cur !== 'red') return; this.raf = requestAnimationFrame(loop); this.draw(); }; loop();
  },
  info() { $('#rInfo').textContent = fmt(Save.d.wallet) + ' 🎫 · ' + fmt(this.income()) + '/h'; },
  S(x, y) { const cv = $('#rcv'); return { x: cv.width / 2 + (x - this.cam.x) * this.cam.k, y: cv.height / 2 + (y - this.cam.y) * this.cam.k }; },
  W(sx, sy) { const cv = $('#rcv'); return { x: this.cam.x + (sx - cv.width / 2) / this.cam.k, y: this.cam.y + (sy - cv.height / 2) / this.cam.k }; },
  draw() {
    const cv = $('#rcv'), { w, h, dpr } = fitCanvas(cv), g = cv.getContext('2d'), k = this.cam.k; this.t = now();
    g.fillStyle = PAL.gris; g.fillRect(0, 0, w, h);
    if (MAP.ready) { if (k > .55) MAP.drawTop(g, w, h, this.cam.x, this.cam.y, k); else { const m = MAP.mini(), s = k * MAP.miniK, o = this.S(0, 0); g.imageSmoothingEnabled = k * MAP.miniK > 1.5 ? false : true; g.drawImage(m, o.x, o.y, m.width * s, m.height * s); } }
    const lw = clamp(k * 60, 2.5, 9) * dpr / 1.5;
    for (const l of NET.lines) {
      if (!this.on[l.kind]) continue; g.setLineDash(l.status && l.status !== 'operativa' ? [lw * 2, lw * 1.5] : []);
      g.strokeStyle = PAL.negro; g.lineWidth = lw + 3 * dpr; g.lineJoin = 'round'; g.beginPath(); l.P.pts.forEach((p, i) => { const s = this.S(p.x, p.y); i ? g.lineTo(s.x, s.y) : g.moveTo(s.x, s.y); }); g.stroke();
      g.strokeStyle = l.color; g.lineWidth = lw; g.stroke();
    }
    g.setLineDash([]);
    // vehículos en servicio (ida y vuelta)
    for (const l of NET.lines) {
      if (!this.on[l.kind] || l.kind === 'future') continue; const n = 1 + this.flota(l.id), v = l.kind === 'cable' ? 60 : 160;
      for (let i = 0; i < n; i++) { const L2 = 2 * l.P.len, q = ((this.t * v + i * L2 / n) % L2), s = q < l.P.len ? q : L2 - q, p = NET.at(l.P, s), sp = this.S(p.x, p.y); if (l.kind === 'cable') Art.cabin(g, sp.x, sp.y + 2, Math.max(1, dpr * .9), l.color); else Art.topVehicle(g, sp.x, sp.y, p.a, Math.max(8, KIND[l.kind].len * k) * dpr * .6 + 6, 6 * dpr, l.color, l.kind); }
    }
    // estaciones
    const showLbl = k > .12;
    for (const s of NET.stations) {
      if (!s.lines.some(l => this.on[l.kind])) continue; const p = this.S(s.x, s.y), r = (s.lines.length > 1 ? 5.5 : 4) * dpr * clamp(k * 8, .7, 1.4);
      if (p.x < -40 || p.y < -40 || p.x > w + 40 || p.y > h + 40) continue;
      g.fillStyle = s === this.sel ? PAL.naranja : '#fff'; g.strokeStyle = PAL.negro; g.lineWidth = 2 * dpr; g.beginPath(); g.arc(p.x, p.y, r, 0, TAU); g.fill(); g.stroke();
      if (showLbl || s.lines.length > 2) { g.font = '700 ' + (11 * dpr) + 'px Cuerpo, sans-serif'; g.lineWidth = 3 * dpr; g.strokeStyle = 'rgba(248,241,220,.9)'; g.strokeText(s.name, p.x + r + 3, p.y + 4 * dpr); g.fillStyle = PAL.negro; g.fillText(s.name, p.x + r + 3, p.y + 4 * dpr); }
    }
    g.fillStyle = 'rgba(20,20,20,.55)'; g.font = '600 ' + (10 * dpr) + 'px Cuerpo, sans-serif'; g.fillText('© OpenStreetMap (ODbL) · relieve SRTM/NASA', 8 * dpr, h - 64 * dpr);
  },
  pick(sx, sy) { let best = null, bd = 24 * (window.devicePixelRatio || 1); for (const s of NET.stations) { if (!s.lines.some(l => this.on[l.kind])) continue; const p = this.S(s.x, s.y), d = Math.hypot(p.x - sx, p.y - sy); if (d < bd) { bd = d; best = s; } } return best; },
  card(s) {
    this.sel = s; const el = $('#rCard'); if (!s) { el.classList.add('hide'); return; }
    const fact = NET.fact(s.name), muni = MAP.ready ? MAP.muniAt(s.x, s.y) : '', com = MAP.ready ? MAP.comunaAt(s.x, s.y) : '';
    const drive = s.lines.filter(l => ['metro', 'tram', 'brt', 'feeder'].includes(l.kind));
    el.innerHTML = `<div class="row" style="justify-content:space-between"><div class="pag">${esc(muni)}${com ? ' · ' + esc(com) : ''}</div><button class="btn sm gh" id="rcX">✕</button></div>
      <h2>${esc(s.name)}</h2><div class="row" style="gap:6px;margin-bottom:8px">${s.lines.map(l => `<span class="badge" style="background:${l.color}">${esc(l.id)}</span><small>${esc(l.name)}</small>`).join(' ')}</div>
      ${fact ? `<p class="m"><b>¿Sabías que…?</b> ${esc(fact)}</p>` : ''}${MAP.ready ? `<p class="m">Altura: ${Math.round(MAP.elevM(s.x, s.y))} m sobre el nivel del mar</p>` : ''}
      <div class="row">${drive.map(l => `<button class="btn sm tin" data-l="${l.id}">▶ Conducir ${esc(l.id)}</button>`).join('')}${s.lines.some(l => l.kind === 'cable') ? '<button class="btn sm mos" id="rcC">Armar cable</button>' : ''}</div>`;
    el.classList.remove('hide'); Save.d.facts[s.name] = 1;
    $('#rcX').onclick = () => this.card(null);
    $$('#rCard [data-l]').forEach(b => b.onclick = () => { const l = NET.byId[b.dataset.l], i = l.st.findIndex(q => q.hub === s), lv = Conduce.levels().filter(v => v.line === l.id && !v.full && v.a < v.b), pickLv = lv.find(v => v.a <= i && v.b >= i) || lv[0]; if (pickLv) Game.start('conduce', pickLv.id, { back: 'red' }); });
    const cb = $('#rcC'); if (cb) cb.onclick = () => { const l = s.lines.find(q => q.kind === 'cable'), lv = Cable.levels().find(v => v.line === l.id); if (lv) Game.start('cable', lv.id, { back: 'red' }); };
  },
  flotaCard() {
    const el = $('#rCard'); this.sel = null;
    const rows = NET.lines.filter(l => l.kind !== 'future').map(l => { const f = this.flota(l.id), cost = 40 * f * f; return `<div class="row" style="justify-content:space-between;border-bottom:2px solid var(--negro);padding:6px 0"><span><span class="badge" style="background:${l.color}">${esc(l.id)}</span> <b>${esc(l.name)}</b><br><small>Flota ${'▮'.repeat(f)}${'▯'.repeat(5 - f)} · ${(KW[l.kind] || 0) * f * 6} 🎫/h</small></span>${f < 5 ? `<button class="btn sm" data-u="${l.id}" ${Save.d.wallet < cost ? 'disabled' : ''}>+1 · ${cost} 🎫</button>` : '<b class="gold">MÁX</b>'}</div>`; }).join('');
    el.innerHTML = `<div class="row" style="justify-content:space-between"><div class="pag">Gerencia de la red</div><button class="btn sm gh" id="rcX">✕</button></div><h2>Flota</h2><p class="m">Más vehículos = más pasajeros. La red sigue trabajando mientras no juegas (hasta 8 horas). Tienes <b>${fmt(Save.d.wallet)} 🎫</b>.</p>${rows}`;
    el.classList.remove('hide'); $('#rcX').onclick = () => this.card(null);
    $$('#rCard [data-u]').forEach(b => b.onclick = () => { const id = b.dataset.u, f = this.flota(id), cost = 40 * f * f; if (Save.d.wallet < cost || f >= 5) return; Save.d.wallet -= cost; Save.d.red.lines[id] = { f: f + 1 }; Save.write(); Snd.play('coin'); this.info(); this.flotaCard(); });
  },
  bind() {
    const cv = $('#rcv'), dpr = () => window.devicePixelRatio || 1;
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); this.ptr.set(e.pointerId, { x: e.clientX, y: e.clientY }); this.moved = 0; });
    cv.addEventListener('pointermove', e => {
      const p = this.ptr.get(e.pointerId); if (!p) return; const r = dpr();
      if (this.ptr.size === 1) { this.cam.x -= (e.clientX - p.x) * r / this.cam.k; this.cam.y -= (e.clientY - p.y) * r / this.cam.k; this.moved += Math.abs(e.clientX - p.x) + Math.abs(e.clientY - p.y); }
      else if (this.ptr.size === 2) { const o = [...this.ptr.entries()].find(([id]) => id !== e.pointerId)[1], d0 = Math.hypot(p.x - o.x, p.y - o.y), d1 = Math.hypot(e.clientX - o.x, e.clientY - o.y); if (d0 > 0) this.zoom(d1 / d0, (e.clientX + o.x) / 2 * r, (e.clientY + o.y) / 2 * r); this.moved += 99; }
      p.x = e.clientX; p.y = e.clientY;
    });
    const up = e => { if (this.ptr.size === 1 && this.moved < 8) { const r = dpr(), rc = cv.getBoundingClientRect(), s = this.pick((e.clientX - rc.left) * r, (e.clientY - rc.top) * r); this.card(s); if (s) Snd.play('tap'); } this.ptr.delete(e.pointerId); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', e => this.ptr.delete(e.pointerId));
    cv.addEventListener('wheel', e => { e.preventDefault(); const r = dpr(), rc = cv.getBoundingClientRect(); this.zoom(Math.exp(-e.deltaY * .0015), (e.clientX - rc.left) * r, (e.clientY - rc.top) * r); }, { passive: false });
    $('#rBack').onclick = () => UI.back();
  },
  zoom(f, sx, sy) { const a = this.W(sx, sy); this.cam.k = clamp(this.cam.k * f, .015, 3); const b = this.W(sx, sy); this.cam.x += a.x - b.x; this.cam.y += a.y - b.y; }
};
