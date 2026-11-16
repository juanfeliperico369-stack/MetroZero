/* =====================================================================
   MENÚS: portada, modos (páginas de revista), niveles, ajustes y créditos
   ===================================================================== */
const MODECARDS = [
  { id: 'historia', cls: 'c-hist', t: 'La última vuelta', d: 'La historia de Rosalba y su nieta. Cada capítulo, un oficio de la red.', n: 'Historia' },
  { id: 'conduce', cls: 'c-conduce', t: 'Conduce', d: 'Metro, tranvía y Metroplús por la vía real. Frena en la marca.', n: 'Cabina · 1ª y 3ª persona' },
  { id: 'libre', cls: 'c-libre', t: 'Ciudad Libre', d: 'Recorre el valle a tu aire: a pie, en taxi, bici, moto o bus, o de pasajero en el metro y los cables. Oficios por la radio.', n: 'Mundo abierto · GTA' },
  { id: 'volante', cls: 'c-volante', t: 'Al volante', d: 'Maneja el articulado de Metroplús o el alimentador por las calles reales, con tráfico y semáforos.', n: 'Buses · 3D' },
  { id: 'cableviaje', cls: 'c-cableviaje', t: 'Metrocable', d: 'Opera la línea y viaja sobre la loma: viento, tormentas y miradores.', n: 'Viaje · vista lateral' },
  { id: 'despacho', cls: 'c-despacho', t: 'Despacho', d: 'Puesto de Control: mueve las agujas y que ningún tren se cruce.', n: 'Agujas' },
  { id: 'metroplus', cls: 'c-metroplus', t: 'Metroplús', d: 'Semáforos y carril exclusivo. Cuidado con las motos.', n: 'Cruces' },
  { id: 'alim', cls: 'c-alim', t: 'Alimentadores', d: 'De los barrios a las estaciones: cada una pide su color.', n: 'Reparto' },
  { id: 'cable', cls: 'c-cable', t: 'Arma el cable', d: 'Gira las piezas y deja la línea conectada sobre la loma.', n: 'Puzle' },
  { id: 'red', cls: 'c-red', t: 'La Red', d: 'Panorámica del valle: líneas, datos curiosos y tu flota.', n: 'Mapa · Gerencia' },
  { id: 'multi', cls: 'c-multi', t: 'Juntos', d: 'Duelo en el mismo celular, Wi‑Fi sin internet o servidor local.', n: 'Multijugador' }
];
const Menu = EM.menu = {
  mode: null,
  cover() {
    UI.show('cover', false); Music.play('menu'); const cv = $('#cvArt'), g = cv.getContext('2d');
    const loop = () => { if (UI.cur !== 'cover') return; requestAnimationFrame(loop); const h = new Date().getHours(); Art.cover(g, 320, 200, now(), h < 6 || h >= 19); $('#cvClock').textContent = (serviceOpen() ? 'En servicio · ' : 'Cerrado · ') + clockStr(); };
    loop();
  },
  modes() {
    UI.show('menu'); $('#mWallet').textContent = fmt(Save.d.wallet) + ' pasajes';
    const h = new Date().getHours(); $('#mGreet').textContent = (h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches') + ', ' + Save.d.name;
    $('#mVida').innerHTML = Vida.panel(); Vida.bindPanel();
    $('#mList').innerHTML = MODECARDS.map((c, i) => { const st = EM.modes[c.id] ? Save.totalStars(c.id) : null; return `<button class="mcard ${c.cls}" data-m="${c.id}"><span class="n">Est. ${pad2(i + 1)} · ${esc(c.n)}</span>${st != null ? `<span class="st">★ ${st}</span>` : c.id === 'historia' ? `<span class="st">Cap. ${Math.min(CAPS.length, Save.d.story.ch + 1)}/${CAPS.length}</span>` : ''}<canvas width="70" height="55" data-a="${c.id}"></canvas><span class="t">${esc(c.t)}</span><span class="d">${esc(c.d)}</span></button>`; }).join('');
    $$('#mList canvas').forEach(cv => this.miniArt(cv.getContext('2d'), cv.dataset.a));
    $$('#mList .mcard').forEach(b => b.onclick = () => { Snd.init(); Snd.play('tap'); this.go(b.dataset.m); });
  },
  go(id) {
    if (id === 'historia') { this.storyList(); return; }
    if (id === 'red') { RedView.open(); return; }
    if (id === 'multi') { Multi.open(); return; }
    this.levels(id);
  },
  miniArt(g, id) {
    g.imageSmoothingEnabled = false; g.clearRect(0, 0, 70, 55);
    if (id === 'conduce') { Art.vehicleBack(g, 35, 52, 34, '#1C5C9C', 'metro', true); }
    else if (id === 'volante') { Art.vehicleBack(g, 35, 52, 36, '#0E6F76', 'brt', true); }
    else if (id === 'libre') { g.fillStyle = '#3f444d'; g.fillRect(0, 22, 70, 16); g.fillStyle = PAL.mante; for (let x = 2; x < 70; x += 10) g.fillRect(x, 29, 5, 1.5); Art.topVehicle(g, 24, 30, 0, 14, 7, '#f2c400', 'car'); Art.topVehicle(g, 52, 30, Math.PI, 12, 6, '#1C5C9C', 'car'); Art.person(g, 12, 50, 2, 3, true); Art.person(g, 60, 12, 2, 5, true); }
    else if (id === 'cableviaje') { g.strokeStyle = PAL.negro; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 10); g.lineTo(70, 30); g.stroke(); Art.cabin(g, 38, 21, 3, '#B8CF40'); }
    else if (id === 'despacho') { g.strokeStyle = PAL.negro; g.lineWidth = 4; g.beginPath(); g.moveTo(35, 0); g.lineTo(35, 55); g.moveTo(35, 22); g.quadraticCurveTo(35, 34, 58, 36); g.lineTo(58, 55); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(35, 26, 7, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#f08a1c'; g.fillRect(31, 4, 8, 14); }
    else if (id === 'metroplus') { g.fillStyle = '#3f444d'; g.fillRect(0, 20, 70, 20); g.fillStyle = '#7ab648'; g.fillRect(6, 24, 28, 12); g.fillRect(36, 24, 28, 12); g.fillStyle = '#f4f1ea'; g.fillRect(9, 27, 22, 5); g.fillRect(39, 27, 22, 5); }
    else if (id === 'alim') { for (let i = 0; i < 4; i++) Art.building(g, 4 + i * 16, 8 + (i % 2) * 6, 13, 18, i, false, true); g.fillStyle = '#f4f1ea'; g.fillRect(14, 38, 30, 12); g.fillStyle = PAL.naranja; g.fillRect(14, 42, 30, 3); }
    else if (id === 'cable') { g.strokeStyle = PAL.negro; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 6); g.lineTo(70, 40); g.stroke(); Art.cabin(g, 30, 26, 2, '#f2a900'); }
    else if (id === 'red') { g.strokeStyle = '#1f63ad'; g.lineWidth = 5; g.beginPath(); g.moveTo(40, 0); g.lineTo(36, 30); g.lineTo(44, 55); g.stroke(); g.strokeStyle = '#f08a1c'; g.beginPath(); g.moveTo(36, 30); g.lineTo(6, 26); g.stroke(); g.fillStyle = '#fff'; g.strokeStyle = PAL.negro; g.lineWidth = 2; g.beginPath(); g.arc(36, 30, 5, 0, TAU); g.fill(); g.stroke(); }
    else if (id === 'historia') { g.fillStyle = PAL.negro; g.fillRect(25, 8, 22, 46); g.fillStyle = '#12446c'; g.fillRect(26, 18, 20, 34); g.fillStyle = '#f1c9a5'; g.fillRect(29, 8, 14, 11); g.fillStyle = '#e8e8e8'; g.fillRect(28, 5, 16, 5); }
    else if (id === 'multi') { Art.person(g, 22, 52, 5, 2, false); Art.person(g, 48, 52, 5, 5, false); }
  },
  storyList() {
    this.mode = '__story'; UI.show('levels'); $('#lTitle').textContent = 'Historia · La última vuelta'; $('#lStars').textContent = 'Cap. ' + Math.min(CAPS.length, Save.d.story.ch + 1) + '/' + CAPS.length;
    $('#lBody').innerHTML = `<div class="boxed" style="margin-bottom:14px"><div class="spaced" style="font-size:12px">Sesión 1 : la ciudad y su gente</div><p class="m">Rosalba manejó el primer tren de Medellín. En su última semana te enseña todos los oficios de la red. Una historia para jugar en familia.</p></div><div class="tramos">` +
      CAPS.map((c, i) => `<button class="tramo ${i > Save.d.story.ch ? 'lock' : ''}" data-c="${i}"><span class="badge" style="background:var(--rojo)">${i + 1}</span><span class="tx"><b>${esc(c.t)}</b><small>${c.go ? esc(EM.modes[c.go[0]].name) : 'Final'}</small></span><span>${i < Save.d.story.ch ? '✓' : i === Save.d.story.ch ? '▶' : '🔒'}</span></button>`).join('') + '</div>';
    $$('#lBody [data-c]').forEach(b => b.onclick = () => { const i = +b.dataset.c; if (i > Save.d.story.ch) { UI.toast('Termina el capítulo anterior'); return; } Story.open(i); });
  },
  levels(id) {
    this.mode = id; const M = EM.modes[id], L = M.levels(); UI.show('levels'); $('#lTitle').textContent = M.name + ' · ' + (M.sub || ''); $('#lStars').textContent = '★ ' + Save.totalStars(id);
    const duel = ['despacho', 'alim', 'metroplus', 'cable'].includes(id);
    let h = `<div class="row" style="justify-content:space-between;align-items:flex-end;margin-bottom:10px"><div><div class="pag">${esc(M.sub || '')}</div><div class="mega" style="font-size:54px">${esc(M.name)}</div></div>${duel ? '<label class="tg"><button id="lDuel">👥 Duelo de mesa</button></label>' : ''}</div><p class="m" style="margin-top:0">${esc(M.tip || '')}</p>`;
    if (id === 'conduce' || id === 'volante') {
      const byLine = {}; for (const l of L) (byLine[l.line] || (byLine[l.line] = [])).push(l);
      for (const lid in byLine) { const line = NET.byId[lid]; h += `<h3><span class="badge" style="background:${line.color}">${esc(lid)}</span> ${esc(line.name)} <small class="pag">${esc(KIND[line.kind].label)} · ${line.km} km</small></h3><div class="tramos">`; byLine[lid].forEach((l, i) => { const open = i === 0 || Save.stars(id, byLine[lid][i - 1].id) > 0 || Save.stars(id, l.id) > 0; const s = Save.stars(id, l.id); h += `<button class="tramo ${open ? '' : 'lock'}" data-l="${esc(l.id)}"><span class="tx"><b>${esc(l.name)}</b><small>${esc(l.sub)}</small></span><span class="stars">${'★'.repeat(s)}${'☆'.repeat(3 - s)}</span></button>`; }); h += '</div>'; }
    } else {
      h += '<div class="lv">' + L.map((l, i) => { const open = i === 0 || Save.stars(id, L[i - 1].id) > 0 || Save.stars(id, l.id) > 0, s = Save.stars(id, l.id); return `<button class="${open ? '' : 'lock'} ${s ? 'done' : ''}" data-l="${esc(l.id)}"><b>${i + 1}</b><small>${esc(l.name)}</small><span class="stars">${'★'.repeat(s)}${'☆'.repeat(3 - s)}</span></button>`; }).join('') + '</div>';
    }
    $('#lBody').innerHTML = h; let duelOn = false;
    const db = $('#lDuel'); if (db) db.onclick = () => { duelOn = !duelOn; db.classList.toggle('on', duelOn); UI.toast(duelOn ? 'Duelo: pongan el celular en la mesa, uno frente al otro' : 'Un jugador'); };
    $$('#lBody [data-l]').forEach(b => b.onclick = () => { if (b.classList.contains('lock')) { UI.toast('Consigue al menos una ★ en el nivel anterior'); return; } Snd.init(); Game.start(id, b.dataset.l, { duel: duelOn, back: 'levels' }); });
  },
  settings() {
    const s = Save.d.settings, tg = (k, a, b) => `<div class="tg" data-k="${k}"><button data-v="1" class="${s[k] ? 'on' : ''}">${a}</button><button data-v="0" class="${s[k] ? '' : 'on'}">${b}</button></div>`;
    UI.modal(`<div class="pag">Ajustes</div><h2>Tu cabina</h2><div class="col"><label class="pag">Nombre</label><input id="sName" maxlength="16" value="${esc(Save.d.name)}" style="border:3px solid var(--negro);padding:8px;font-size:16px">
      <div class="pag">Sonido</div>${tg('snd', 'Sí', 'No')}<div class="pag">Música</div>${tg('mus', 'Sí', 'No')}<div class="pag">Vibración</div>${tg('vib', 'Sí', 'No')}<div class="pag">Voz de anuncios (“Próxima estación…”)</div>${tg('voz', 'Sí', 'No')}
      <div class="pag">Reloj del juego (día y noche)</div><div class="tg" data-c>${[['rapido', '×30 (1 min = media hora)'], ['real', 'Hora real'], ['dia', 'Siempre de día'], ['noche', 'Siempre de noche']].map(([k, n]) => `<button data-v="${k}" class="${(s.ciclo || 'rapido') === k ? 'on' : ''}">${n}</button>`).join('')}</div>
      <div class="pag">Calidad gráfica</div><div class="tg" data-q><button data-v="auto" class="${s.q !== 'low' ? 'on' : ''}">Normal</button><button data-v="low" class="${s.q === 'low' ? 'on' : ''}">Celular modesto</button></div>
      <div class="row" style="margin-top:8px"><button class="btn pri" id="sOk">Listo</button><button class="btn sm gh" id="sReset">Borrar progreso</button></div></div>`);
    $$('#mBody .tg[data-k] button').forEach(b => b.onclick = () => { const k = b.parentNode.dataset.k; s[k] = +b.dataset.v; $$('button', b.parentNode).forEach(x => x.classList.toggle('on', x === b)); Snd.apply(); if (k === 'mus') { if (s.mus) Music.play('menu'); } Save.write(); });
    $$('#mBody .tg[data-c] button').forEach(b => b.onclick = () => { s.ciclo = b.dataset.v; Mundo.h0 = null; Mundo.t0 = now(); $$('button', b.parentNode).forEach(x => x.classList.toggle('on', x === b)); Save.write(); });
    $$('#mBody .tg[data-q] button').forEach(b => b.onclick = () => { s.q = b.dataset.v; $$('button', b.parentNode).forEach(x => x.classList.toggle('on', x === b)); Save.write(); });
    $('#sOk').onclick = () => { Save.d.name = ($('#sName').value || 'Aprendiz').trim().slice(0, 16); Save.write(); UI.close(); UI.refresh(); };
    $('#sReset').onclick = () => { if (confirm('¿Borrar todo el progreso de El Metro en este dispositivo?')) { Save.d = newSave(); Save.write(); UI.close(); UI.refresh(); UI.toast('Progreso borrado'); } };
  },
  credits() {
    UI.modal(`<div class="pag">Créditos</div><h2>El Metro</h2><p class="m">Un juego sin ánimo de lucro, para todo público, sobre el Metro de Medellín y el Valle de Aburrá. No es un producto oficial del Metro de Medellín.</p>
      <div class="film">Mapa: © colaboradores de OpenStreetMap (ODbL), vía Overture Maps · Relieve: SRTM / NASA (AWS Terrain Tiles) · Mapa base y datos tomados de “Juega EnCicla” · Estética: revista EMSAY · Inspiración de géneros: juegos de trenes, semáforos, reparto y conectar piezas.</div>
      <p class="m">Versión ${EM.version} · Funciona sin internet · Tus partidas se guardan en este dispositivo (exporta para respaldarlas).</p><button class="btn pri" id="cOk">Cerrar</button>`); $('#cOk').onclick = () => UI.close();
  },
  bot() {
    UI.modal(`<div class="pag">Bot de pruebas</div><h2>Inspector de la red</h2><p class="m">Revisa los datos, verifica que cada nivel tenga solución y juega partidas automáticas buscando errores.</p><div id="bRes" class="film">Ejecutando…</div><div class="row" style="margin-top:10px"><button class="btn sm" id="bMore">▶ 100 partidas</button><button class="btn sm gh" id="bOk">Cerrar</button></div>`);
    const run = n => { $('#bRes').textContent = 'Ejecutando…'; setTimeout(() => { const t0 = performance.now(), a = EM.test.selfTest(), b = EM.test.monkey(n, Date.now() & 0xffff); const errs = [...a.errors, ...b.errors, ...EM.errors.slice(-5)]; $('#bRes').innerHTML = `Validación: ${a.errors.length ? '<span class="bad">' + a.errors.length + ' errores</span>' : '<span class="ok">0 errores</span>'} · ${a.warnings.length} avisos<br>${esc(a.stats)}<br>Partidas simuladas: ${b.games} · pasos ${fmt(b.steps)} · <span class="${b.errors.length ? 'bad' : 'ok'}">${b.errors.length} errores</span><br>Victorias del bot: ${b.wins}<br>Tiempo: ${Math.round(performance.now() - t0)} ms` + errs.slice(0, 10).map(x => '<br><span class="bad">• ' + esc(x) + '</span>').join(''); }, 40); };
    $('#bOk').onclick = () => UI.close(); $('#bMore').onclick = () => run(100); run(20);
  },
  bind() {
    $('#bPlay').onclick = () => { Snd.init(); Snd.play('tap'); this.modes(); };
    $('#bStory').onclick = () => { Snd.init(); Story.open(); };
    $('#bMulti').onclick = () => { Snd.init(); Multi.open(); };
    $('#bCfg').onclick = () => { Snd.init(); this.settings(); };
    $('#mBack').onclick = $('#lBack').onclick = () => UI.back();
    $('#mBot').onclick = () => this.bot(); $('#mExport').onclick = () => Save.exportFile(); $('#mImport').onclick = () => $('#fileIn').click(); $('#mCred').onclick = () => this.credits();
    $('#fileIn').onchange = e => { const f = e.target.files[0]; if (f) Save.importFile(f); e.target.value = ''; };
    $('#modal').addEventListener('pointerdown', e => { if (e.target.id === 'modal' && !Game.raf) UI.close(); });
    UI.onshow.menu = () => this.modes(); UI.onshow.cover = () => this.cover();
    UI.onshow.levels = () => { if (this.mode === '__story') this.storyList(); else if (this.mode && EM.modes[this.mode]) this.levels(this.mode); };
    addEventListener('keydown', e => { if (e.key === 'Escape' && UI.cur !== 'game') UI.back(); });
    addEventListener('popstate', () => { if (UI.back()) history.pushState(null, ''); });
  }
};
