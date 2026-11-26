/* =====================================================================
   MODO TURISMO (3.12.0 · Claude, 26‑nov‑2026)
   El autor: «Agrega a El Metro y EnCicla un modo turismo de la ciudad y las estaciones para todos aquellos que no conozcan los
   sistemas del Valle de Aburrá».
   - Una tarjeta en el menú: «🧭 Turismo por el valle».
   - Primero, el sistema integrado: las líneas de RED (metro, cables, tranvía y buses) con su color, su recorrido y su apertura.
   - Después, 12 paradas para quien llega al valle. Cada una trae el lugar, su dato (los LUGARES del juego) y cómo llegar: la
     estación más cercana de toda la red, con sus líneas, su color y la distancia a pie. Todo sale de los datos del juego, sin
     inventar nada. El minimapa marca dónde queda.
   - «🚶 Ir ahí» abre la Ciudad Libre en esa estación, para recorrer el sitio a pie, en bici o en el sistema.
   Aditivo: suma la tarjeta a MODECARDS y envuelve Menu.go.
   ===================================================================== */
if (typeof ARTE !== 'undefined' && !ARTE.ico_modo_turismo) {   /* el ícono de la tarjeta: una brújula sobre las lomas del valle (vectorial, sin texto) */
  ARTE.ico_modo_turismo = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 55"><rect width="70" height="55" rx="10" fill="#14324a"/><path d="M4 47 Q16 31 30 39 T66 31 L66 51 L4 51 Z" fill="#2e6b3f"/><path d="M4 51 Q24 41 40 46 T66 43 L66 51 Z" fill="#3f8f4f"/><circle cx="35" cy="23" r="15" fill="#f4f1e8" stroke="#fdd835" stroke-width="2.5"/><path d="M35 10.5 L39.5 23 L30.5 23 Z" fill="#e63946"/><path d="M35 35.5 L39.5 23 L30.5 23 Z" fill="#1d3557"/><circle cx="35" cy="23" r="2.2" fill="#fff" stroke="#1d3557" stroke-width="1"/><path d="M35 6.5 V9 M35 37 V39.5 M18.5 23 H21 M49 23 H51.5" stroke="#fdd835" stroke-width="2" stroke-linecap="round"/></svg>';
}
const Turismo = EM.turismo = {
  IDS: ['botero', 'palacio', 'cerro', 'pies', 'explora', 'botanico', 'udea', 'mamm', 'lleras', 'comuna13', 'memoria', 'estadio'],
  i: 0,
  TIPO: { metro: '🚇 Metro', cable: '🚡 Metrocable', tram: '🚋 Tranvía', brt: '🚌 Metroplús', escalator: '🛗 Escaleras eléctricas' },
  lineas() { return RED.lines.filter(l => this.TIPO[l.kind]); },   /* las que funcionan y le sirven a un turista (sin alimentadores ni futuras) */
  paradas() {
    if (this._p) return this._p;
    const L = {}; for (const r of LUGARES) if (!L[r[0]]) L[r[0]] = r;
    return this._p = this.IDS.filter(id => L[id]).map(id => { const [, nombre, muni, lat, lon, , , , dato] = L[id]; return { id, nombre, muni, lat, lon, dato, cerca: this.estacion(lat, lon) }; });
  },
  /* la estación más cercana de toda la red (y todas las líneas que pasan por ella) */
  estacion(lat, lon) {
    const kx = 111320 * Math.cos(lat * Math.PI / 180), ky = 110540; let best = null;
    for (const l of this.lineas()) for (const s of l.stations || []) { const d = Math.hypot((s[2] - lon) * kx, (s[1] - lat) * ky); if (!best || d < best.d) best = { d, nombre: s[0], lat: s[1], lon: s[2] }; }
    if (!best) return null;
    best.lineas = this.lineas().filter(l => (l.stations || []).some(s => s[0] === best.nombre)).map(l => ({ id: l.id, nombre: l.name, color: l.color, kind: l.kind }));
    best.d = Math.round(best.d / 10) * 10; return best;
  },
  abrir(i = 0) { this.i = i; this.pintar(); },
  linea(l) { return `<span style="display:inline-block;min-width:22px;padding:1px 6px;border-radius:6px;background:${esc(l.color || '#555')};color:#fff;font-weight:700;font-size:12px">${esc(l.id)}</span>`; },
  pintar() {
    const P = this.paradas(), n = P.length, i = this.i;
    let html;
    if (i === 0) {
      const grupos = {}; for (const l of this.lineas()) { const k = this.TIPO[l.kind]; (grupos[k] = grupos[k] || []).push(l); }
      html = `<h2>🧭 Turismo por el valle</h2><p>¿Llegas por primera vez al Valle de Aburrá? El sistema integrado une el metro, los cables, el tranvía y los buses de Metroplús: con la tarjeta Cívica pasas de uno a otro. Aquí van sus líneas y ${n} sitios para conocer, con la estación más cercana de cada uno.</p>` +
        Object.entries(grupos).map(([k, ls]) => `<div class="boxed" style="margin:8px 0"><b>${k}</b>${ls.map(l => `<div style="margin-top:4px">${this.linea(l)} ${esc(l.from || '')} – ${esc(l.to || '')}${l.open ? ` <small>· desde ${esc(String(l.open).slice(0, 4))}</small>` : ''}${l.km ? ` <small>· ${l.km} km</small>` : ''}</div>`).join('')}</div>`).join('') +
        `<p><small>Para aprender a pagar, hacer transbordos y la Cultura Metro: «Aprende a usar el Metro», en el menú.</small></p>`;
    } else {
      const p = P[i - 1], c = p.cerca;
      html = `<h2>🧭 ${i} de ${n} · ${esc(p.nombre)}</h2><div style="display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap"><canvas id="turMapa" width="150" height="190" style="border-radius:10px;flex:0 0 auto;image-rendering:auto" aria-label="Dónde queda ${esc(p.nombre)}"></canvas>` +
        `<div style="flex:1 1 180px"><p><b>${esc(p.nombre)}</b> <small>· ${esc(p.muni)}</small></p><p>${esc(p.dato)}</p>` +
        (c ? `<p>Cómo llegar: estación <b>${esc(c.nombre)}</b> ${c.lineas.map(l => this.linea(l)).join(' ')} <small>· a unos ${c.d} m a pie</small></p>` : '') + `</div></div>`;
    }
    html += `<div class="row" style="justify-content:space-between;margin-top:10px;gap:8px"><button class="btn sm" id="turAnt" ${i === 0 ? 'disabled' : ''}>◀</button>` +
      (i > 0 ? `<button class="btn pri" id="turIr">🚶 Ir ahí</button>` : `<button class="btn pri" id="turEmp">Empezar el recorrido ▶</button>`) +
      `<button class="btn sm" id="turSig" ${i >= n ? 'disabled' : ''}>▶</button></div>`;
    UI.modal(html);
    const sel = id => document.getElementById(id);
    if (sel('turAnt')) sel('turAnt').onclick = () => { Snd.play('tap'); this.i = Math.max(0, this.i - 1); this.pintar(); };
    if (sel('turSig')) sel('turSig').onclick = () => { Snd.play('tap'); this.i = Math.min(n, this.i + 1); this.pintar(); };
    if (sel('turEmp')) sel('turEmp').onclick = () => { Snd.play('tap'); this.i = 1; this.pintar(); };
    if (sel('turIr')) sel('turIr').onclick = () => this.ir(P[i - 1]);
    if (i > 0) this.mapa(P[i - 1]);
  },
  /* el minimapa del valle con el sitio marcado */
  mapa(p) {
    try {
      const cv = document.getElementById('turMapa'); if (!cv || typeof MAP === 'undefined' || !MAP.mini) return; const g = cv.getContext('2d'), m = MAP.mini();
      const W = MW * TM, H = MH * TM, q = geoM(p.lat, p.lon), lado = 9000, x0 = Math.max(0, Math.min(W - lado, q.x - lado / 2)), y0 = Math.max(0, Math.min(H - lado * 1.27, q.y - lado * .63)), kx = m.width / W, ky = m.height / H;
      g.imageSmoothingEnabled = true; g.fillStyle = '#0e1a2b'; g.fillRect(0, 0, cv.width, cv.height);
      g.drawImage(m, x0 * kx, y0 * ky, lado * kx, lado * 1.27 * ky, 0, 0, cv.width, cv.height);
      const sx = cv.width / lado, mx = (q.x - x0) * sx, my = (q.y - y0) * sx;
      g.strokeStyle = '#fff'; g.lineWidth = 3; g.fillStyle = '#e63946'; g.beginPath(); g.arc(mx, my, 7, 0, Math.PI * 2); g.fill(); g.stroke();
      if (p.cerca) { const e = geoM(p.cerca.lat, p.cerca.lon), ex = (e.x - x0) * sx, ey = (e.y - y0) * sx; g.fillStyle = (p.cerca.lineas[0] && p.cerca.lineas[0].color) || '#1C5C9C'; g.beginPath(); g.arc(ex, ey, 5, 0, Math.PI * 2); g.fill(); g.stroke(); }
    } catch (e) { /* sin minimapa: la tarjeta sigue */ }
  },
  /* a la Ciudad Libre, en la estación más cercana */
  ir(p) {
    Snd.init(); UI.close && UI.close(); if (UI.closeModal) UI.closeModal(); const m = document.getElementById('modal'); if (m) m.hidden = true;
    Game.start('libre', 'lb:ultimo', { back: 'cover' });
    const c = p.cerca || p, q = geoM(c.lat, c.lon), st = Game.st;
    if (st) { st.x = q.x; st.y = q.y; if (st._ec) st._ec = null; if (Libre && Libre.msg) Libre.msg(st, '🧭 ' + p.nombre + (p.cerca ? ' · estás en la estación ' + p.cerca.nombre : ''), 'b'); }
    this.visitas = (this.visitas || 0) + 1;
  }
};
(function () {
  if (typeof MODECARDS === 'undefined' || typeof Menu === 'undefined') return;
  if (!MODECARDS.some(c => c.id === 'turismo')) { const i = MODECARDS.findIndex(c => c.id === 'guia'); MODECARDS.splice(i >= 0 ? i + 1 : MODECARDS.length, 0, { id: 'turismo', cls: 'c-guia', t: '🧭 Turismo por el valle', d: 'Para quien no conoce el Valle de Aburrá: 12 sitios para visitar, cómo llegar a cada uno en metro, cable, tranvía o Metroplús, y un paseo en la Ciudad Libre.' }); }
  const go0 = Menu.go; Menu.go = function (id) { if (id === 'turismo') { Turismo.abrir(0); return; } return go0.apply(this, arguments); };
})();
