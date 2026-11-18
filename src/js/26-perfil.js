/* =====================================================================
   TU PERSONAJE (1.3.0): piel, peinado, ropa, gorro y accesorio, como en Juega EnCicla, y con prendas de acá: el sombrero
   aguadeño, la ruana y el carriel de los arrieros. Se guarda en Save.d.perfil (un campo nuevo con su valor por defecto:
   el guardado elmetro.v1 no cambia). Lo usan el jugador de Ciudad Libre y la gente de la ciudad (sus caras en las charlas).
   ===================================================================== */
const PERFIL = {
  pieles: ['#f6d2b4', '#e8b98f', '#c68a5e', '#9a6440', '#6b4128'],
  peinados: ['Corto', 'Largo', 'Rapado', 'Crespo', 'Coleta', 'Trenzas'],
  colPelo: ['#2a1a10', '#4a2c18', '#7a4a22', '#c9a25a', '#151515', '#d9d9d9', '#b8402a', '#3f6fd8'],
  camisas: ['#1C5C9C', '#59AB42', '#EC343A', '#F6C538', '#ffffff', '#23272f', '#b07cff', '#ff8fc7', '#2ec4b6', '#f08a4b'],
  pantalones: ['#2a3b5c', '#3d4a5a', '#5a4632', '#1f2a3a', '#6a7a8a', '#c9b38a', '#7a3b3b'],
  zapatos: ['#111111', '#ffffff', '#ff6b5a', '#56c7ff', '#9bd341'],
  gorros: ['Nada', 'Gorra', 'Sombrero aguadeño', 'Casco de bici', 'Gorro de lana'],
  colGorro: ['#EC343A', '#1C5C9C', '#59AB42', '#F6C538', '#23272f', '#ffffff'],
  accesorios: ['Nada', 'Mochila', 'Carriel', 'Ruana', 'Cámara de turista']
};
const Perfil = EM.perfil = {
  BASE: { piel: 1, peinado: 0, colPelo: 0, camisa: 0, pantalon: 0, zapatos: 0, gorro: 0, colGorro: 0, accesorio: 0 },
  get() { const d = Save.d; if (!d.perfil || typeof d.perfil !== 'object' || Array.isArray(d.perfil)) d.perfil = {}; const P = d.perfil; for (const k in this.BASE) if (typeof P[k] !== 'number' || !isFinite(P[k])) P[k] = this.BASE[k]; return P; },
  /* parámetros del dibujo (Spr.ped y el retrato) para un perfil */
  ped(P) { P = P || this.get(); const A = PERFIL, i = (L, v) => L[clamp(v | 0, 0, L.length - 1)]; return { skin: i(A.pieles, P.piel), hair: i(A.colPelo, P.colPelo), peinado: clamp(P.peinado | 0, 0, A.peinados.length - 1), col: i(A.camisas, P.camisa), pants: i(A.pantalones, P.pantalon), shoes: i(A.zapatos, P.zapatos), gorro: clamp(P.gorro | 0, 0, A.gorros.length - 1), hatCol: i(A.colGorro, P.colGorro), acc: clamp(P.accesorio | 0, 0, A.accesorios.length - 1) }; },
  azar(r = Math.random) { const A = PERFIL, pk = n => Math.floor(r() * n); return { piel: pk(A.pieles.length), peinado: pk(A.peinados.length), colPelo: pk(A.colPelo.length), camisa: pk(A.camisas.length), pantalon: pk(A.pantalones.length), zapatos: pk(A.zapatos.length), gorro: r() < .45 ? 0 : pk(A.gorros.length), colGorro: pk(A.colGorro.length), accesorio: r() < .5 ? 0 : pk(A.accesorios.length) }; },
  /* retrato de frente: hombros con la ropa y el accesorio, cara, pelo y gorro (para las charlas y la ficha) */
  _ret: new Map(),
  retrato(p, S = 96) {
    const key = JSON.stringify(p) + S; let u = this._ret.get(key); if (u) return u;
    const cv = mkCanvas(S, S), g = cv.getContext('2d'), c = S / 2, r = S * .2, sh = (h, f) => Art.shade(h, f);
    g.fillStyle = '#cfe0ea'; g.beginPath(); g.arc(c, c, c, 0, TAU); g.fill(); g.save(); g.beginPath(); g.arc(c, c, c, 0, TAU); g.clip();
    // pelo largo, trenzas o coleta: por detrás de la cabeza
    g.fillStyle = p.hair; if (p.peinado === 1) { g.beginPath(); g.ellipse(c, c + r * .55, r * 1.15, r * 1.5, 0, 0, TAU); g.fill(); } if (p.peinado === 5) for (const s of [-1, 1]) { g.fillRect(c + s * r * .95 - r * .16, c, r * .32, r * 1.7); } if (p.peinado === 4) { g.beginPath(); g.ellipse(c + r * 1.05, c + r * .2, r * .3, r * .7, -.3, 0, TAU); g.fill(); }
    // hombros: camiseta; la ruana encima, ancha y a rayas
    g.fillStyle = p.col; g.beginPath(); g.ellipse(c, S * 1.02, S * .42, S * .3, 0, 0, TAU); g.fill();
    if (p.acc === 3) { g.fillStyle = '#8a8274'; g.beginPath(); g.moveTo(c - S * .5, S); g.lineTo(c - r * .7, S * .7); g.lineTo(c + r * .7, S * .7); g.lineTo(c + S * .5, S); g.fill(); g.strokeStyle = '#5c564b'; g.lineWidth = S * .025; for (const y of [.82, .9]) { g.beginPath(); g.moveTo(c - S * .5, S * y + S * .07); g.lineTo(c + S * .5, S * y + S * .07); g.stroke(); } }
    if (p.acc === 1) { g.strokeStyle = '#2b2f38'; g.lineWidth = S * .05; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(c + s * r * .9, S * .74); g.lineTo(c + s * r * 1.05, S); g.stroke(); } }
    if (p.acc === 2) { g.strokeStyle = '#5a3a1c'; g.lineWidth = S * .035; g.beginPath(); g.moveTo(c - r * 1.1, S * .76); g.lineTo(c + r * 1.4, S); g.stroke(); g.fillStyle = '#7a4a22'; g.fillRect(c + r * 1.05, S * .86, r * .8, r * .7); }
    if (p.acc === 4) { g.strokeStyle = '#151515'; g.lineWidth = S * .025; g.beginPath(); g.moveTo(c - r * .8, S * .76); g.lineTo(c, S * .9); g.lineTo(c + r * .8, S * .76); g.stroke(); g.fillStyle = '#23272f'; g.fillRect(c - r * .38, S * .87, r * .76, r * .5); g.fillStyle = '#9fb7c9'; g.beginPath(); g.arc(c, S * .87 + r * .25, r * .16, 0, TAU); g.fill(); }
    // cuello y cara
    g.fillStyle = sh(p.skin, .92); g.fillRect(c - r * .32, c + r * .7, r * .64, r * .6);
    g.fillStyle = p.skin; g.beginPath(); g.ellipse(c, c, r * .9, r * 1.02, 0, 0, TAU); g.fill();
    g.fillStyle = '#1a1410'; for (const s of [-1, 1]) { g.beginPath(); g.arc(c + s * r * .34, c - r * .05, r * .09, 0, TAU); g.fill(); }
    g.strokeStyle = sh(p.skin, .6); g.lineWidth = S * .018; g.beginPath(); g.arc(c, c + r * .28, r * .32, .2, Math.PI - .2); g.stroke();
    // pelo por encima
    g.fillStyle = p.hair;
    if (p.peinado === 2) { g.globalAlpha = .55; g.beginPath(); g.ellipse(c, c - r * .55, r * .86, r * .5, 0, Math.PI, TAU); g.fill(); g.globalAlpha = 1; }
    else if (p.peinado === 3) { for (let i = 0; i < 9; i++) { const a = Math.PI + i / 8 * Math.PI; g.beginPath(); g.arc(c + Math.cos(a) * r * .85, c - r * .25 + Math.sin(a) * r * .85, r * .32, 0, TAU); g.fill(); } }
    else { g.beginPath(); g.ellipse(c, c - r * .5, r * .95, r * .62, 0, Math.PI, TAU); g.fill(); g.fillRect(c - r * .95, c - r * .55, r * .22, r * .5); g.fillRect(c + r * .73, c - r * .55, r * .22, r * .5); }
    // gorro
    if (p.gorro === 1) { g.fillStyle = p.hatCol; g.beginPath(); g.ellipse(c, c - r * .6, r * .98, r * .62, 0, Math.PI, TAU); g.fill(); g.fillStyle = sh(p.hatCol, .8); g.beginPath(); g.ellipse(c + r * .25, c - r * .58, r * 1.05, r * .2, 0, 0, TAU); g.fill(); }
    if (p.gorro === 2) { g.fillStyle = '#f3ecdb'; g.beginPath(); g.ellipse(c, c - r * .62, r * 1.75, r * .34, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 1; g.stroke(); g.beginPath(); g.ellipse(c, c - r * .85, r * .78, r * .62, 0, Math.PI, TAU); g.fill(); g.fillStyle = '#1a1a1a'; g.fillRect(c - r * .78, c - r * .92, r * 1.56, r * .2); }
    if (p.gorro === 3) { g.fillStyle = p.hatCol; g.beginPath(); g.ellipse(c, c - r * .5, r * 1.02, r * .78, 0, Math.PI, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(c - r * .1, c - r * 1.25, r * .2, r * .7); }
    if (p.gorro === 4) { g.fillStyle = p.hatCol; g.beginPath(); g.ellipse(c, c - r * .55, r * .98, r * .72, 0, Math.PI, TAU); g.fill(); g.fillStyle = sh(p.hatCol, 1.2); g.beginPath(); g.arc(c, c - r * 1.3, r * .24, 0, TAU); g.fill(); g.fillStyle = sh(p.hatCol, .8); g.fillRect(c - r * .98, c - r * .62, r * 1.96, r * .18); }
    g.restore(); u = cv.toDataURL ? cv.toDataURL() : ''; this._ret.set(key, u); while (this._ret.size > 80) this._ret.delete(this._ret.keys().next().value); return u;
  },
  /* la ficha: retrato, vista de arriba (como se ve en el juego) y las opciones por pestañas */
  abrir(alCerrar) {
    const P = this.get(), A = PERFIL, tab = this._tab || 'cuerpo';
    const sw = (L, k) => `<div class="swt">${L.map((c, i) => `<button data-pk="${k}" data-i="${i}" class="${(P[k] | 0) === i ? 'on' : ''}" style="background:${c}" aria-label="${k} ${i + 1}"></button>`).join('')}</div>`;
    const tx = (L, k) => `<div class="tg wrap">${L.map((t, i) => `<button data-pk="${k}" data-i="${i}" class="${(P[k] | 0) === i ? 'on' : ''}">${esc(t)}</button>`).join('')}</div>`;
    const body = { cuerpo: `<div class="pag">Piel</div>${sw(A.pieles, 'piel')}<div class="pag">Peinado</div>${tx(A.peinados, 'peinado')}<div class="pag">Color de pelo</div>${sw(A.colPelo, 'colPelo')}`,
      ropa: `<div class="pag">Camiseta</div>${sw(A.camisas, 'camisa')}<div class="pag">Pantalón</div>${sw(A.pantalones, 'pantalon')}<div class="pag">Zapatos</div>${sw(A.zapatos, 'zapatos')}`,
      mas: `<div class="pag">Gorro</div>${tx(A.gorros, 'gorro')}<div class="pag">Color de la gorra, el casco o el gorro</div>${sw(A.colGorro, 'colGorro')}<div class="pag">Accesorio</div>${tx(A.accesorios, 'accesorio')}<p class="m" style="font-size:12.5px;margin:6px 0 0">El sombrero aguadeño, la ruana y el carriel son las prendas de los arrieros antioqueños: el carriel, de cuero, tenía bolsillos secretos para guardar lo de valor.</p>` }[tab];
    UI.modal(`<div class="pag">Tu personaje</div><h2>Así te ve la ciudad</h2><div class="pfvis"><img id="pfRet" alt="Tu retrato"><canvas id="pfTop" width="150" height="150" aria-label="Tu personaje visto desde arriba"></canvas></div>
      <label class="pag" for="pfNom">Nombre</label><input id="pfNom" class="campo" maxlength="16" value="${esc(Save.d.name)}">
      <div class="tg pftabs">${[['cuerpo', '🙂 Cuerpo'], ['ropa', '👕 Ropa'], ['mas', '🎩 Gorro y más']].map(([k, n]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${n}</button>`).join('')}</div>${body}
      <div class="row" style="margin-top:10px"><button class="btn pri" id="pfOk">Listo</button><button class="btn sm gh" id="pfAzar">🎲 Al azar</button></div>`, alCerrar);
    const pinta = () => { const p = this.ped(P), im = $('#pfRet'); if (im) im.src = this.retrato(p, 150); const cv = $('#pfTop'); if (!cv) return; const g = cv.getContext('2d'); g.clearRect(0, 0, 150, 150); g.fillStyle = '#d3cdc0'; g.fillRect(0, 0, 150, 150); g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(80, 80, 36, 24, 0, 0, TAU); g.fill(); g.save(); g.translate(75, 75); g.rotate(-Math.PI / 2); Spr.ped(g, 30, Object.assign({ ph: 1.1, seed: 7 }, p)); g.restore(); };
    const nombre = () => { const v = $('#pfNom'); if (v) Save.d.name = (v.value || 'Aprendiz').trim().slice(0, 16) || 'Aprendiz'; };
    pinta();
    $$('#mBody [data-tab]').forEach(b => b.onclick = () => { nombre(); this._tab = b.dataset.tab; Snd.play('tap'); this.abrir(alCerrar); });
    $$('#mBody [data-pk]').forEach(b => b.onclick = () => { const k = b.dataset.pk; P[k] = +b.dataset.i; $$(`#mBody [data-pk="${k}"]`).forEach(x => x.classList.toggle('on', x === b)); Save.write(); Snd.play('tap'); pinta(); });
    $('#pfAzar').onclick = () => { nombre(); Object.assign(P, this.azar()); Save.write(); this.abrir(alCerrar); };
    $('#pfOk').onclick = () => { nombre(); Save.write(); Snd.play('ok'); UI.close(); };
  }
};
