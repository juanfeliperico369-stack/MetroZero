/* =====================================================================
   MENÚS: inicio (la línea), elige tu viaje, niveles, ajustes y créditos
   ===================================================================== */
const MODECARDS = [
  { id: 'libre', cls: 'c-libre', t: 'Ciudad Libre', d: 'Recorre el Valle de Aburrá real: a pie, en bici, skate, patines, monopatín, carro, taxi o moto, o de pasajero en el metro, el tranvía, los cables y los buses. Oficios por la radio y la gente de EnCicla.' },
  { id: 'bus', cls: 'c-volante', t: 'Metroplús y alimentadores', d: 'Simulador de bus en vista cenital: de estación a estación por las calles reales, con pasajeros, semáforos y tráfico.' },
  { id: 'conduce', cls: 'c-conduce', t: 'Metro', d: 'Conduce el metro y el tranvía: vista panorámica 2D del valle y cabina en primera persona con su consola.' },
  { id: 'tranvia', cls: 'c-conduce', t: 'Tranvía de Ayacucho', d: 'Conduce el tranvía por la calle: sube la loma de Ayacucho, toca la campana en los cruces con gente y para en cada estación.' },
  { id: 'cableviaje', cls: 'c-cableviaje', t: 'Metrocable', d: 'Opera la línea y viaja sobre la loma: viento, tormentas y miradores.' },
  { id: 'carrera', cls: 'c-libre', t: 'Ciclovías · Carrera sin fin', d: 'En skate, patines, monopatín o bici EnCicla por las ciclovías reales de Medellín: curvas, tramos anchos y estrechos, rampas de skate, barandas, arcos de parkour y trucos en cadena.' },
  { id: 'historia', cls: 'c-hist', t: 'La última vuelta', d: 'Rosalba y su nieta: todos los capítulos abiertos desde el principio, en el mapa real y en escenas clásicas.' },
  { id: 'guia', cls: 'c-guia', t: 'Aprende a usar el Metro', d: 'Cívica, cómo viajar, transbordos, horarios, líneas y Cultura Metro.' },
  { id: 'red', cls: 'c-red', t: 'La Red', d: 'Panorámica del valle: líneas, datos curiosos y tu flota.' },
  { id: 'multi', cls: 'c-multi', t: 'Juntos', d: 'Duelo en el mismo celular, Wi‑Fi sin internet o servidor local.' },
  { id: 'arcade', cls: 'c-despacho', t: 'Arcade', d: 'Retos rápidos: agujas del Puesto de Control, semáforos, reparto de buses, armar el cable y bus en 3D.' }
];
const Menu = EM.menu = {
  mode: null,
  cover() {
    UI.show('cover', false); Music.play('menu'); const cv = $('#cvArt'), g = cv.getContext('2d');
    // ilustración de portada; si falta o no carga, sigue la portada procedural animada
    let pic = $('#cvImg');
    if (!pic && Atlas.has('portada')) { pic = document.createElement('img'); pic.id = 'cvImg'; pic.className = 'cart'; pic.alt = 'Un metro sobre el viaducto al atardecer, con el metrocable y las laderas de Medellín'; pic.onerror = () => { pic.remove(); cv.hidden = false; }; pic.src = Atlas.url('portada'); cv.after(pic); cv.hidden = true; }
    const fd = $('#cvFiesta'), deco = Atlas.fiesta(); if (fd) fd.innerHTML = deco; else (pic || cv).insertAdjacentHTML('afterend', `<div id="cvFiesta">${deco}</div>`);
    this.tren($('#bPlay'), true);
    let last = '';
    const loop = () => {
      if (UI.cur !== 'cover') return; requestAnimationFrame(loop); const h = new Date().getHours(); if (!cv.hidden) Art.cover(g, 320, 200, now(), h < 6 || h >= 19);
      const abierto = serviceOpen(), t = clockStr() + abierto; if (t === last) return; last = t;
      const el = $('#cvClock'); el.classList.toggle('cerrado', !abierto); el.textContent = abierto ? 'En servicio, ' + clockStr() : 'Cerrado, abre a las ' + abreTxt().replace(' a. m.', '');
    };
    loop();
  },
  /* el tren del menú de inicio viaja hasta la estación tocada (y al entrar, llega a "Jugar") */
  tren(btn, entrada) {
    const tr = $('#cvTren'), nav = tr && tr.parentElement; if (!tr || !btn || !nav) return 0;
    const dot = btn.querySelector('i'), y = dot.getBoundingClientRect().top - nav.getBoundingClientRect().top + dot.offsetHeight / 2 - tr.offsetHeight / 2;
    if (entrada) { tr.style.transition = 'none'; tr.style.transform = 'translateY(' + (y - 70) + 'px)'; void tr.offsetWidth; tr.style.transition = ''; }
    tr.classList.add('on'); tr.style.transform = 'translateY(' + y + 'px)';
    return matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 200;
  },
  modes() {
    UI.show('menu'); $('#mWallet').textContent = fmt(Save.d.wallet) + ' pasajes';
    const h = new Date().getHours(); $('#mGreet').textContent = (h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches') + ', ' + Save.d.name;
    $('#mVida').innerHTML = Vida.panel(); Vida.bindPanel();
    $('#mList').innerHTML = MODECARDS.map(c => {
      const st = c.id === 'libre' ? 'Abierto' : EM.modes[c.id] ? '★ ' + Save.totalStars(c.id) : c.id === 'historia' ? `${CAPS.length} cap. abiertos` : '';
      const ico = Atlas.has('ico_modo_' + c.id) ? Atlas.tag('ico_modo_' + c.id, '', '') : `<canvas width="70" height="55" data-a="${c.id}"></canvas>`;
      return `<button class="modo ${c.cls}" data-m="${c.id}"><span class="nodo">${ico}</span><span class="tx"><b>${esc(c.t)}</b><small>${esc(c.d)}</small></span>${st ? `<span class="st">${st}</span>` : ''}</button>`;
    }).join('');
    $$('#mList canvas').forEach(cv => this.miniArt(cv.getContext('2d'), cv.dataset.a));
    $$('#mList .modo').forEach(b => b.onclick = () => { Snd.init(); Snd.play('tap'); this.go(b.dataset.m); });
  },
  go(id) {
    if (id === 'historia') { this.storyList(); return; }
    if (id === 'guia') { Guia.open(); return; }
    if (id === 'arcade') { this.arcade(); return; }
    if (id === 'red') { RedView.open(); return; }
    if (id === 'multi') { Multi.open(); return; }
    this.levels(id);
  },
  arcade() {
    UI.modal(`<div class="pag">Extras</div><h2>Arcade</h2><p class="m">Retos cortos para jugar en familia o en duelo de mesa. Todos abiertos desde el inicio.</p><div class="col">${[['despacho', 'Despacho · agujas del Puesto de Control'], ['metroplus', 'Semáforos · cruces de Metroplús (Traffix)'], ['alim', 'Reparto · buses por colores'], ['cable', 'Arma el cable · puzle'], ['volante', 'Al volante 3D · buses en primera persona']].map(([m, n]) => `<button class="btn sm" data-a="${m}">${n}</button>`).join('')}</div><button class="btn sm gh" id="arX" style="margin-top:10px">Cerrar</button>`);
    $$('#mBody [data-a]').forEach(b => b.onclick = () => { UI.close(); this.levels(b.dataset.a); }); $('#arX').onclick = () => UI.close();
  },
  miniArt(g, id) {
    g.imageSmoothingEnabled = false; g.clearRect(0, 0, 70, 55);
    if (id === 'conduce') { Art.vehicleBack(g, 35, 52, 34, '#1C5C9C', 'metro', true); }
    else if (id === 'tranvia') { Art.vehicleBack(g, 35, 52, 34, '#2f9b57', 'tram', true); }
    else if (id === 'volante' || id === 'bus') { g.fillStyle = '#3f444d'; g.fillRect(0, 20, 70, 18); g.fillStyle = PAL.mante; for (let x = 2; x < 70; x += 10) g.fillRect(x, 28, 5, 1.5); g.save(); g.translate(36, 29); Spr.veh(g, 'brt', 46, 9, '#0E6F76', { doors: 'left', lights: true }); g.restore(); }
    else if (id === 'guia') { g.fillStyle = PAL.negro; g.fillRect(14, 10, 42, 28); g.fillStyle = '#59AB42'; g.fillRect(16, 12, 38, 24); g.fillStyle = '#fff'; g.fillRect(20, 16, 14, 6); g.fillStyle = PAL.mante; g.fillRect(20, 26, 30, 3); g.fillRect(20, 31, 20, 2); }
    else if (id === 'arcade') { g.strokeStyle = PAL.negro; g.lineWidth = 4; g.beginPath(); g.moveTo(35, 0); g.lineTo(35, 55); g.moveTo(35, 22); g.quadraticCurveTo(35, 34, 58, 36); g.lineTo(58, 55); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(35, 26, 7, 0, TAU); g.fill(); g.stroke(); }
    else if (id === 'libre' || id === 'carrera') { g.fillStyle = '#3f444d'; g.fillRect(0, 22, 70, 16); g.fillStyle = PAL.mante; for (let x = 2; x < 70; x += 10) g.fillRect(x, 29, 5, 1.5); Art.topVehicle(g, 24, 30, 0, 14, 7, '#f2c400', 'car'); Art.topVehicle(g, 52, 30, Math.PI, 12, 6, '#1C5C9C', 'car'); Art.person(g, 12, 50, 2, 3, true); Art.person(g, 60, 12, 2, 5, true); }
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
    this.mode = '__story'; UI.show('levels'); $('#lTitle').textContent = 'La última vuelta'; $('#lStars').textContent = CAPS.length + ' capítulos abiertos';
    const T = Save.d.trama || { c: 0, s: 0 }, tc = Math.min(TRAMA.length, (T.c || 0) + 1);
    $('#lBody').innerHTML = `${Atlas.tag('carga', 'sthero', 'Rosalba de espaldas en el andén, al atardecer')}<div class="boxed" style="margin-bottom:14px;border-left:8px solid var(--lH)"><div class="spaced" style="font-size:12px">Nuevo · la historia en la ciudad</div><p class="m"><b>La última vuelta, jugada en el mapa real:</b> camina, toma el metro, los cables y los buses, habla con Rosalba y su gente, orienta pasajeros y pasa a manejar cada vehículo.</p><div class="row"><button class="btn pri" id="stCity">${T.fin ? '🏙️ Volver a la ciudad' : T.started ? '▶ Seguir · Cap. ' + tc + '/' + TRAMA.length : '▶ Empezar en Niquía'}</button>${T.started ? '<button class="btn sm gh" id="stCityR">↺ Empezar de nuevo</button>' : ''}</div></div><div class="spaced" style="font-size:12px;margin:4px 0 8px">Capítulos clásicos · todos abiertos desde el principio</div>` + `<div class="boxed" style="margin-bottom:14px"><div class="spaced" style="font-size:12px">Sesión 1 : la ciudad y su gente</div><p class="m">Rosalba manejó el primer tren de Medellín. En su última semana te enseña todos los oficios de la red. Puedes abrir cualquier capítulo sin esperar.</p></div><div class="tramos">` +
      CAPS.map((c, i) => `<button class="tramo" data-c="${i}"><span class="badge" style="background:var(--rojo)">${i + 1}</span><span class="tx"><b>${esc(c.t)}</b><small>${c.go ? esc(EM.modes[c.go[0]].name) : 'Final'}</small></span><span>${i < Save.d.story.ch ? '✓' : '▶'}</span></button>`).join('') + '</div>';
    $$('#lBody [data-c]').forEach(b => b.onclick = () => { Story.open(+b.dataset.c); });
    $('#stCity').onclick = () => { Snd.init(); Game.start('libre', 'lb:trama', {}); };
    const rb = $('#stCityR'); if (rb) rb.onclick = () => { if (!rb.dataset.k) { rb.dataset.k = 1; rb.textContent = '¿Seguro? Toca otra vez'; return; } Save.d.trama = { c: 0, s: 0, fin: 0 }; Save.write(); Game.start('libre', 'lb:trama', {}); };
  },
  levels(id) {
    this.mode = id; const M = EM.modes[id], L = M.levels(); UI.show('levels'); $('#lTitle').textContent = M.name; $('#lStars').textContent = id === 'libre' ? 'Mundo abierto' : '★ ' + Save.totalStars(id);
    const duel = ['despacho', 'alim', 'metroplus', 'cable'].includes(id), B = Save.d.bus && Save.d.bus.done || {};
    let h = `<div class="row cabeza" style="justify-content:space-between;align-items:flex-end"><div><h1>${esc(M.name)}</h1>${M.sub ? `<p class="m">${esc(M.sub)}</p>` : ''}</div>${duel ? '<div class="tg"><button id="lDuel">👥 Duelo de mesa</button></div>' : ''}</div><p class="m" style="margin-top:0">${esc(M.tip || '')}</p>`;
    if (id === 'libre') {
      h += '<div class="tramos">' + L.map(l => `<button class="tramo" data-l="${esc(l.id)}"><span class="tx"><b>${esc(l.name)}</b><small>${esc(l.sub || '')}</small></span><span class="badge" style="background:var(--lA)">▶</span></button>`).join('') + '</div>';
    } else if (id === 'conduce' || id === 'volante' || id === 'bus') {
      const byLine = {}; for (const l of L) (byLine[l.line] || (byLine[l.line] = [])).push(l);
      for (const lid in byLine) { const line = NET.byId[lid]; h += `<h3><span class="badge" style="background:${line.color}">${esc(lid.replace(/^AL-/, ''))}</span> ${esc(line.name)} <small class="pag">${esc(KIND[line.kind].label)} · ${line.km} km${B[lid] ? ' · ✓ ruta abierta' : ''}</small></h3><div class="tramos">`; byLine[lid].forEach(l => { const s = Save.stars(id, l.id); h += `<button class="tramo" data-l="${esc(l.id)}"><span class="tx"><b>${esc(l.name)}</b><small>${esc(l.sub)}</small></span><span class="stars">${'★'.repeat(s)}${'☆'.repeat(3 - s)}</span></button>`; }); h += '</div>'; }
    } else {
      h += '<div class="lv">' + L.map((l, i) => { const s = Save.stars(id, l.id); return `<button class="${s ? 'done' : ''}" data-l="${esc(l.id)}"><b>${i + 1}</b><small>${esc(l.name)}</small><span class="stars">${'★'.repeat(s)}${'☆'.repeat(3 - s)}</span></button>`; }).join('') + '</div>';
    }
    $('#lBody').innerHTML = h; let duelOn = false;
    const db = $('#lDuel'); if (db) db.onclick = () => { duelOn = !duelOn; db.classList.toggle('on', duelOn); UI.toast(duelOn ? 'Duelo: pongan el celular en la mesa, uno frente al otro' : 'Un jugador'); };
    $$('#lBody [data-l]').forEach(b => b.onclick = () => { Snd.init(); Game.start(id, b.dataset.l, { duel: duelOn, back: 'levels' }); });
  },
  settings() {
    const s = Save.d.settings, tg = (k, a, b) => `<div class="tg" data-k="${k}"><button data-v="1" class="${s[k] ? 'on' : ''}">${a}</button><button data-v="0" class="${s[k] ? '' : 'on'}">${b}</button></div>`;
    UI.modal(`<div class="pag">Ajustes</div><h2>Tu cabina</h2><div class="col"><label class="pag">Nombre</label><input id="sName" class="campo" maxlength="16" value="${esc(Save.d.name)}">
      <div class="pag">Sonido</div>${tg('snd', 'Sí', 'No')}<div class="pag">Música</div>${tg('mus', 'Sí', 'No')}<div class="pag">Vibración</div>${tg('vib', 'Sí', 'No')}<div class="pag">Voz de anuncios (“Próxima estación…”)</div>${tg('voz', 'Sí', 'No')}
      <div class="pag">Cabina del Metro y Tranvía</div>${tg('cabReal', 'Realista (llave y sentido)', 'Rápida (arranca de una)')}
      <div class="pag">Vista principal en Ciudad Libre</div><div class="tg" data-vl>${[['cen3d', '🛰 3D Cenital'], ['3p', '🎮 3ª persona'], ['1p', '👁 1ª persona'], ['dron', '🏔 Panorámica'], ['2d', '🗺 2D / Pixel']].map(([k, n]) => `<button data-v="${k}" class="${(s.vistaL || 'cen3d') === k ? 'on' : ''}">${n}</button>`).join('')}</div>
      <div class="pag">Reloj del juego (día y noche)</div><div class="tg" data-c>${[['rapido', '×30 (1 min = media hora)'], ['real', 'Hora real'], ['dia', 'Siempre de día'], ['noche', 'Siempre de noche']].map(([k, n]) => `<button data-v="${k}" class="${(s.ciclo || 'rapido') === k ? 'on' : ''}">${n}</button>`).join('')}</div>
      <div class="pag">Ángulo de la cámara (Ciudad Libre y mapas)</div><div class="tg" data-ang>${VC.ANGULOS.map((A, i) => `<button data-v="${i}" class="${(s.angulo | 0) === i ? 'on' : ''}">${A.n}</button>`).join('')}</div>
      <div class="pag">Calidad gráfica</div><div class="tg" data-q><button data-v="auto" class="${s.q !== 'low' ? 'on' : ''}">Normal</button><button data-v="low" class="${s.q === 'low' ? 'on' : ''}">Celular modesto</button></div>
      <div class="row" style="margin-top:8px"><button class="btn pri" id="sOk">Listo</button><button class="btn sm gh" id="sReset">Borrar progreso</button></div></div>`);
    $$('#mBody .tg[data-k] button').forEach(b => b.onclick = () => { const k = b.parentNode.dataset.k; s[k] = +b.dataset.v; $$('button', b.parentNode).forEach(x => x.classList.toggle('on', x === b)); Snd.apply(); if (k === 'mus') { if (s.mus) Music.play('menu'); } Save.write(); });
    $$('#mBody .tg[data-vl] button').forEach(b => b.onclick = () => { s.vistaL = b.dataset.v; $$('button', b.parentNode).forEach(x => x.classList.toggle('on', x === b)); Save.write(); });
    $$('#mBody .tg[data-c] button').forEach(b => b.onclick = () => { s.ciclo = b.dataset.v; Mundo.h0 = null; Mundo.t0 = now(); $$('button', b.parentNode).forEach(x => x.classList.toggle('on', x === b)); Save.write(); });
    $$('#mBody .tg[data-ang] button').forEach(b => b.onclick = () => { s.angulo = +b.dataset.v; VC.angulo(s.angulo); $$('button', b.parentNode).forEach(x => x.classList.toggle('on', x === b)); Save.write(); });
    $$('#mBody .tg[data-q] button').forEach(b => b.onclick = () => { s.q = b.dataset.v; $$('button', b.parentNode).forEach(x => x.classList.toggle('on', x === b)); Save.write(); });
    $('#sOk').onclick = () => { Save.d.name = ($('#sName').value || 'Aprendiz').trim().slice(0, 16); Save.write(); UI.close(); UI.refresh(); };
    $('#sReset').onclick = () => { if (confirm('¿Borrar todo el progreso de El Metro en este dispositivo?')) { Save.d = newSave(); Save.write(); UI.close(); UI.refresh(); UI.toast('Progreso borrado'); } };
  },
  credits() {
    UI.modal(`<h2>El Metro</h2><p class="m">Un juego sin ánimo de lucro, para todo público, sobre el Metro de Medellín y el Valle de Aburrá. No es un producto oficial del Metro de Medellín.</p>
      <h3>Datos del mapa</h3><ul class="m" style="padding-left:18px;margin:0">
        <li>Calles, río y relieve: © colaboradores de OpenStreetMap (ODbL), vía Overture Maps; relieve SRTM / NASA (AWS Terrain Tiles); mapa base de “Juega EnCicla”.</li>
        <li>Fuente: Portal de Datos Abiertos Subsecretaria de Catastro del Municipio de Medellín, Colombia www.medellin.gov.co/geomedellin (lotes, febrero de 2026; pisos de las construcciones de Popular, El Poblado y Robledo).</li>
        <li>Casas y edificios: huellas de Overture Maps Foundation (© colaboradores de OpenStreetMap, ODbL; Microsoft ML Buildings, ODbL; Google Open Buildings, CC BY 4.0). Pisos oficiales o de OpenStreetMap donde existen; en el resto, estimados por zona. Canchas, piscinas y campus: OpenStreetMap vía Overture.</li>
        <li>Datos abiertos de la Alcaldía de Medellín: barrios, manzanas, malla vial 2026, jerarquía vial y espacio público. Barrios de Itagüí, Envigado y Sabaneta publicados por esas alcaldías. Todo se pasó a casillas de 20 m para el juego.</li>
        <li>Estaciones de EnCicla, y nombres de calle y barrios fuera de esas capas: mapa de “Juega EnCicla” v1.2 (OpenStreetMap vía Overture, ODbL); los barrios de esa capa son aproximados. Patio-taller del Metro: © colaboradores de OpenStreetMap.</li></ul>
      <p class="m">¿Te gusta pedalear? <a href="https://juanfeliperico369-stack.github.io/BicicletasUno/" target="_blank" rel="noopener">Juega EnCicla</a>, el juego hermano sobre las bicis públicas del valle.</p>
      <p class="m">Versión ${EM.version}. Funciona sin internet y guarda tus partidas en este dispositivo; exporta una copia para respaldarlas.</p><button class="btn pri" id="cOk">Cerrar</button>`); $('#cOk').onclick = () => UI.close();
  },
  bot() {
    UI.modal(`<div class="pag">Bot de pruebas</div><h2>Inspector de la red</h2><p class="m">Revisa los datos, verifica que cada nivel tenga solución y juega partidas automáticas buscando errores.</p><div id="bRes" class="film">Ejecutando…</div><div class="row" style="margin-top:10px"><button class="btn sm" id="bMore">▶ 100 partidas</button><button class="btn sm gh" id="bOk">Cerrar</button></div>`);
    const run = n => { $('#bRes').textContent = 'Ejecutando…'; setTimeout(() => { const t0 = performance.now(), a = EM.test.selfTest(), b = EM.test.monkey(n, Date.now() & 0xffff); const errs = [...a.errors, ...b.errors, ...EM.errors.slice(-5)]; $('#bRes').innerHTML = `Validación: ${a.errors.length ? '<span class="bad">' + a.errors.length + ' errores</span>' : '<span class="ok">0 errores</span>'} · ${a.warnings.length} avisos<br>${esc(a.stats)}<br>Partidas simuladas: ${b.games} · pasos ${fmt(b.steps)} · <span class="${b.errors.length ? 'bad' : 'ok'}">${b.errors.length} errores</span><br>Victorias del bot: ${b.wins}<br>Tiempo: ${Math.round(performance.now() - t0)} ms` + errs.slice(0, 10).map(x => '<br><span class="bad">• ' + esc(x) + '</span>').join(''); }, 40); };
    $('#bOk').onclick = () => UI.close(); $('#bMore').onclick = () => run(100); run(20);
  },
  bind() {
    const viaje = (id, fn) => { $(id).onclick = e => { Snd.init(); Snd.play('tap'); const ms = this.tren(e.currentTarget); setTimeout(fn, ms); }; };
    viaje('#bPlay', () => this.modes()); viaje('#bGuia', () => Guia.open()); viaje('#bStory', () => Story.open()); viaje('#bMulti', () => Multi.open());
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
