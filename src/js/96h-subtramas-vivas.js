/* =====================================================================
   GA-36-3 · LAS SUBTRAMAS DEJAN HUELLA + FRASES DE PARADERO Y BANCA (Antigravity, 3.7)
   Cada decisión de las 6 subtramas de 36c-actividades.js deja tres marcas persistentes:
   1) Diario de huellas en Save.d.rpg.diario (legible desde el menú de Ciudad Libre).
   2) Noticia comentada por la gente mediante EM.ciudadViva y Ciudad.say.
   3) Reputación del barrio en Save.d.rpg.barrios, visible en el letrero del lugar (#lbLugar).
   Además, la gente que espera en paraderos/estaciones y descansa en plazas/bancas usa las
   frases con lugar: 'paradero' y 'banca' de src/js/96e1-frases-ciudad.js (FRASES_CIUDAD).
   ===================================================================== */
(function () {
  const Rpg = EM.mundoRPG, L = EM.modes.libre;
  if (!Rpg) return;

  const HUELLAS = {
    'pico-sa': {
      barrio: 'La Candelaria · San Antonio', hub: 'San Antonio',
      aliases: ['candelaria', 'san antonio', 'guayaquil', 'san benito', 'centro', 'bolivar', 'bolívar'],
      op: {
        expreso: { noticia: 'Tren de refuerzo alivió la hora pico en San Antonio', frases: ['¿Supiste? El tren de refuerzo despejó San Antonio rapidito.', 'Qué alivio hoy en el andén de San Antonio, no hubo apretón.'] },
        anfitriones: { noticia: 'Filas ejemplares de Cultura Metro en San Antonio', frases: ['Hoy en San Antonio la fila estuvo impecable, pura Cultura Metro.', 'Qué gusto ver a todos dejando salir antes de entrar en San Antonio.'] },
        integrado: { noticia: 'Conexión fluida entre Metro, Tranvía y Metroplús', frases: ['El aviso del trasbordo en San Antonio nos ahorró media hora.', 'Qué bien organizada estuvo la integración hoy en el centro.'] }
      }
    },
    'ciclo-rio': {
      barrio: 'Parques del Río · Perpetuo Socorro', hub: 'Exposiciones',
      aliases: ['parques del rio', 'parques del río', 'perpetuo socorro', 'conquistadores', 'alpujarra', 'exposiciones'],
      op: {
        zona: { noticia: 'Bahía de skate segura y dos carriles libres en Parques del Río', frases: ['Quedó muy bacana la bahía de skate allá en Parques del Río.', 'Ahora sí se pedalea sabroso por el río sin sustos con las tablas.'] },
        senales: { noticia: 'Flechas y campana de cortesía en la Ciclovía del Río', frases: ['Ya todos avisan con la campana en la ciclovía de Parques del Río.', 'Esas flechas en el corredor del río nos salvaron de más de un choque.'] }
      }
    },
    'niebla-arvi': {
      barrio: 'Santo Domingo Savio · Arví', hub: 'Santo Domingo Savio',
      aliases: ['santo domingo', 'popular', 'arvi', 'arví', 'santa elena', 'granizal', 'andalucia', 'andalucía'],
      op: {
        lento: { noticia: 'Viaje sereno a 3 m/s entre la niebla rumbo a Arví', frases: ['Qué belleza subir a Arví despacio entre la neblina, sin afán.', 'En la Línea L bajaron la velocidad por el viento y fue una maravilla.'] },
        mirador: { noticia: 'Pausa segura y visita guiada al mirador de Santo Domingo', frases: ['Primero la seguridad en Santo Domingo: mientras escampaba vimos el mirador.', 'Qué buen detalle invitar a las familias al mirador antes de subir a Arví.'] }
      }
    },
    'guitarra-t': {
      barrio: 'Buenos Aires · Ayacucho', hub: 'Bicentenario',
      aliases: ['buenos aires', 'ayacucho', 'boston', 'bicentenario', 'la milagrosa', 'bombona', 'bomboná', 'miraflores'],
      op: {
        plazoleta: { noticia: 'Música en vivo en la plazoleta lateral de Bicentenario', frases: ['Qué parche tan bueno armaron con guitarra junto al tranvía en Ayacucho.', 'Movieron la música a la plazoleta y el tranvía pasa limpiecito.'] },
        campana: { noticia: 'Pausa musical al sonar la campana del Tranvía de Ayacucho', frases: ['Es un parche ver cómo paran la guitarra apenas suena la campana del tranvía.', 'En Ayacucho ya hasta saludan al tranvía con palmas.'] }
      }
    },
    'cruce-ind': {
      barrio: 'Industriales · Ciudad del Río', hub: 'Industriales',
      aliases: ['industriales', 'ciudad del rio', 'ciudad del río', 'colombia', 'manila', 'poblado', 'barrio colombia'],
      op: {
        ola: { noticia: 'Ola verde despejó tres articulados de Metroplús en Industriales', frases: ['Pasaron tres Metroplús derechito por Industriales con esa ola verde.', 'Hoy sí rindió el Metroplús en Industriales a pesar del aguacero.'] },
        bici: { noticia: 'Fase protegida para peatones y ciclistas en Industriales', frases: ['Qué descanso cruzar Industriales bajo la lluvia con fase protegida.', 'Por fin dieron paso tranquilo a los de a pie y en bici en Industriales.'] }
      }
    },
    'bici-estadio': {
      barrio: 'Estadio · Unidad Deportiva Atanasio', hub: 'Estadio',
      aliases: ['estadio', 'atanasio', 'suramericana', 'los colores', 'carlos e', 'velodromo', 'velódromo', 'laureles'],
      op: {
        anclar: { noticia: 'Vecino devolvió una bici EnCicla al anclaje de Estadio', frases: ['Vea pues: un vecino devolvió una EnCicla perdida allá en el Estadio.', 'Así se cuida lo público: la bici volvió al anclaje del Atanasio.'] },
        rodada: { noticia: 'Rodada pedagógica de EnCicla en el Atanasio Girardot', frases: ['Qué buena esa rodada pedagógica de EnCicla en la unidad deportiva.', 'Diez personas estrenaron hoy su Cívica en EnCicla por el Estadio.'] }
      }
    }
  };

  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function rpgSave() {
    if (!Save.d) return { diario: [], barrios: {}, subtramas: {} };
    const R = Save.d.rpg || (Save.d.rpg = { xp: { tren: 0, bus: 0, cable: 0, ciclovia: 0 }, rep: 0, subtramas: {}, trucos: 0, zonas: {}, diario: [], barrios: {} });
    if (!Array.isArray(R.diario)) R.diario = [];
    if (!R.barrios || typeof R.barrios !== 'object') R.barrios = {};
    if (!R.subtramas || typeof R.subtramas !== 'object') R.subtramas = {};
    return R;
  }

  /* si un guardado viejo ya tenía decisiones en rpg.subtramas, reconstruye su diario y reputación */
  function hidratar() {
    const R = rpgSave();
    for (const s of Rpg.SUBTRAMAS || []) {
      const dec = R.subtramas[s.id];
      if (!dec || R.diario.some(e => e.id === s.id)) continue;
      const oi = Math.max(0, s.opciones.findIndex(o => o.t === dec));
      SV.registrar(null, s.id, oi, true);
    }
  }

  const SV = EM.subtramasVivas = {
    HUELLAS,
    _ver: 0,
    registrar(st, subId, optIdx, silencioso) {
      const s = (Rpg.SUBTRAMAS || []).find(q => q.id === subId);
      const o = s && s.opciones[optIdx];
      if (!s || !o) return null;
      const R = rpgSave(), h = HUELLAS[s.id] || { barrio: s.lugar, hub: s.lugar, aliases: [norm(s.lugar)], op: {} };
      const info = (h.op && h.op[o.k]) || { noticia: o.res, frases: [o.res] };
      const entrada = { id: s.id, k: o.k, titulo: s.titulo, lugar: s.lugar, barrio: h.barrio, decision: o.t, noticia: info.noticia, rep: o.rep, t: Date.now() };
      R.subtramas[s.id] = o.t;
      const idx = R.diario.findIndex(e => e.id === s.id);
      if (idx >= 0) R.diario[idx] = entrada; else R.diario.unshift(entrada);
      if (R.diario.length > 40) R.diario.length = 40;
      R.barrios[h.barrio] = (R.barrios[h.barrio] || 0) + o.rep;
      this._ver++;
      if (!silencioso) {
        Save.write();
        if (st && !EM.headless) {
          st._bar = '';
          if (L && L.letrero) L.letrero(st);
          if (EM.ciudadViva && EM.ciudadViva.reaccionaNoticia) EM.ciudadViva.reaccionaNoticia(st, s.id);
        }
      }
      return entrada;
    },
    diario() { hidratar(); return rpgSave().diario; },
    barrios() { hidratar(); return rpgSave().barrios; },
    /* reputación del barrio actual por nombre del barrio o cercanía a la estación de la subtrama */
    repBarrio(x, y, barTxt) {
      const R = rpgSave(), B = R.barrios;
      let tiene = false;
      for (const k in B) if (B[k] > 0) { tiene = true; break; }
      if (!tiene) {
        let haySub = false;
        for (const k in R.subtramas) { haySub = true; break; }
        if (!haySub) return 0;
        hidratar();
      }
      const nb = norm(barTxt);
      let best = 0;
      for (const id in HUELLAS) {
        const h = HUELLAS[id], v = B[h.barrio] || 0;
        if (!(v > 0)) continue;
        let hit = nb && h.aliases.some(a => nb.includes(norm(a)));
        if (!hit && isFinite(x) && isFinite(y) && typeof NET !== 'undefined' && NET.stations) {
          const stn = NET.stations.find(q => q.name === h.hub);
          if (stn && dist(x, y, stn.x, stn.y) < 460) hit = true;
        }
        if (hit && v > best) best = v;
      }
      return best;
    },
    noticiasActivas() {
      hidratar();
      const out = [];
      for (const e of rpgSave().diario) {
        const h = HUELLAS[e.id], info = h && h.op && h.op[e.k];
        if (info && info.frases) for (const f of info.frases) out.push(f);
        else if (e.noticia) out.push(e.noticia);
      }
      return out;
    },
    abrirDiario(st) {
      if (Rpg && Rpg.abrir) Rpg.abrir(st, 'rpg');
    }
  };

  /* ---------- Integración con EM.ciudadViva y FRASES_CIUDAD (paradero, banca y noticias) ---------- */
  const Vv = EM.ciudadViva || (EM.ciudadViva = {});
  const fraseLugar = lugar => {
    if (typeof FRASES_CIUDAD === 'undefined') return null;
    const h = (typeof Mundo !== 'undefined' ? Mundo.hour() : 12) * 60;
    const ll = typeof Mundo !== 'undefined' && !!(Mundo.weather() || {}).rain;
    const exactas = FRASES_CIUDAD.filter(f => f.lugar === lugar && (!f.hora || (h >= f.hora[0] && h < f.hora[1])) && (f.lluvia === undefined || f.lluvia === ll));
    const pool = exactas.length ? exactas : FRASES_CIUDAD.filter(f => f.lugar === lugar);
    return pool.length ? pool[(Math.random() * pool.length) | 0].t : null;
  };
  Vv.fraseLugar = fraseLugar;
  Vv.noticias = () => SV.noticiasActivas();
  Vv.reaccionaNoticia = function (st, subId) {
    if (EM.headless || !st || st.auto || typeof Ciudad === 'undefined' || !Ciudad.peds) return 0;
    const h = HUELLAS[subId], R = rpgSave(), ent = R.diario.find(e => e.id === subId);
    const frases = (h && ent && h.op[ent.k] && h.op[ent.k].frases) || (ent ? [ent.noticia] : []);
    if (!frases.length) return 0;
    const cerca = Ciudad.peds.filter(p => !p.dog && !p.gone && Math.abs(p.x - st.x) < 42 && Math.abs(p.y - st.y) < 42).slice(0, 2);
    cerca.forEach((p, i) => {
      p.a = Math.atan2(st.y - p.y, st.x - p.x);
      p.wait = Math.max(p.wait || 0, 2.2);
      Ciudad.say(p, frases[i % frases.length]);
    });
    return cerca.length;
  };

  function lugarDePeaton(p) {
    if (!p || p.dog) return '';
    if (p.waitStop != null) return 'paradero';
    if (typeof NET !== 'undefined' && NET.stations) {
      for (const h of NET.stations) if (Math.abs(h.x - p.x) < 38 && Math.abs(h.y - p.y) < 38) return 'paradero';
    }
    if (typeof MAP !== 'undefined' && MAP.ready) {
      const t = MAP.tileM(p.x, p.y);
      if (t === TT.PLAZA || t === TT.GRASS) return 'banca';
    }
    for (const z of (Rpg.zonas ? Rpg.zonas() : [])) if (Math.abs(z.x - p.x) < 35 && Math.abs(z.y - p.y) < 35) return 'banca';
    return '';
  }

  if (typeof Ciudad !== 'undefined' && Ciudad.say && !Ciudad._conHuellas) {
    Ciudad._conHuellas = 1;
    const say0 = Ciudad.say;
    Ciudad.say = function (p, txt) {
      if (!txt && p && !p.dog) {
        const lug = lugarDePeaton(p);
        if (lug && Math.random() < .65) {
          txt = fraseLugar(lug) || txt;
        } else {
          const notis = SV.noticiasActivas();
          if (notis.length && Math.random() < .32) txt = notis[(Math.random() * notis.length) | 0];
        }
      }
      return say0.call(this, p, txt);
    };
    /* charla suave y esporádica de gente esperando en paraderos o descansando en bancas */
    const pedTick0 = Ciudad.pedTick;
    let tCharla = 0;
    Ciudad.pedTick = function (dt, player) {
      const r = pedTick0.apply(this, arguments);
      if (EM.headless || !player || !this.peds || !this.peds.length) return r;
      tCharla += dt;
      if (tCharla < 4.5) return r;
      tCharla = 0;
      for (const p of this.peds) {
        if (p.dog || p.gone || p.scared > 0) continue;
        if (Math.abs(p.x - player.x) > 36 || Math.abs(p.y - player.y) > 36) continue;
        if (!(p.wait > 0 || p.waitStop != null)) continue;
        const lug = lugarDePeaton(p);
        if (!lug) continue;
        const f = fraseLugar(lug);
        if (f) { say0.call(this, p, f); break; }
      }
      return r;
    };
  }

  /* ---------- Letrero del lugar (#lbLugar): muestra reputación del barrio ---------- */
  if (L && L.letrero && !L._letreroConRep) {
    L._letreroConRep = 1;
    const letrero0 = L.letrero;
    L.letrero = function (st) {
      const prevBar = st._bar, prevCalle = st._calle;
      letrero0.call(this, st);
      if (EM.headless || Game.st !== st || !MAP.ready || st.mode === 'ride') return;
      if (prevBar === st._bar && prevCalle === st._calle && st._repVer === SV._ver) return;
      st._repVer = SV._ver;
      const el = $('#lbLugar'); if (!el || !el.innerHTML) return;
      const rep = SV.repBarrio(st.x, st.y, st._bar);
      st._repBarrio = rep;
      const old = el.querySelector('.rep-barrio');
      if (old) old.remove();
      if (rep > 0) {
        const em = document.createElement('em');
        em.className = 'rep-barrio';
        em.textContent = '⭐ Reputación del barrio: +' + rep + ' · Cultura Metro';
        el.appendChild(em);
        el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
      }
    };
  }

  /* ---------- Modal Actividades y Diario RPG: registra huella y muestra el diario ---------- */
  const abrir0 = Rpg.abrir;
  Rpg.abrir = function (st, tab = 'modos') {
    hidratar();
    abrir0.call(this, st, tab);
    if (EM.headless) return;
    const mBody = $('#mBody'); if (!mBody) return;

    /* engancha los botones de decisión de subtramas para dejar las 3 huellas */
    $$('[data-sub]', mBody).forEach(b => {
      const fn0 = b.onclick;
      b.onclick = () => {
        const subId = b.dataset.sub, oi = +b.dataset.oi;
        const ent = SV.registrar(st, subId, oi, false);
        if (fn0) fn0();
        if (ent && st && L && L.msg) L.msg(st, '📰 ' + ent.noticia + ' · +' + ent.rep + ' rep. en ' + ent.barrio, 'b');
      };
    });

    /* en la pestaña Diario RPG: muestra reputación por barrio y el diario de huellas arriba de las ramas */
    if (tab === 'rpg') {
      const grid = mBody.querySelector('.rpg-grid'), ok = $('#actOk');
      const d = SV.diario(), B = SV.barrios(), barriosPos = Object.entries(B).filter(([, v]) => v > 0);
      const sec = document.createElement('div');
      sec.style.marginTop = '8px';
      sec.innerHTML = `<div class="pag">🏘 Reputación por barrio</div>
        ${barriosPos.length ? `<div class="barrio-rep-list">${barriosPos.map(([n, v]) => `<span class="barrio-rep-chip">⭐ ${esc(n)} · +${v}</span>`).join('')}</div>` : '<p class="m" style="margin:4px 0">Toma decisiones en las subtramas para ganar reconocimiento en cada barrio.</p>'}
        <div class="pag" style="margin-top:8px">📰 Diario de huellas (${d.length}/${(Rpg.SUBTRAMAS || []).length})</div>
        ${d.length ? `<div class="col">${d.map(e => `<div class="diario-item"><b>${esc(e.titulo)} · <span style="color:var(--lA)">${esc(e.barrio)}</span></b><small>Decisión: ${esc(e.decision)}</small><div class="diario-noti">📰 ${esc(e.noticia)} · ⭐ +${e.rep}</div></div>`).join('')}</div>` : '<p class="m" style="margin:4px 0">Todavía no has dejado huella en la ciudad. Abre la pestaña «📖 Subtramas» para empezar.</p>'}`;
      if (grid) grid.after(sec); else if (ok) ok.before(sec); else mBody.appendChild(sec);
    }
  };

  /* acceso directo al diario desde el menú de pausa de Ciudad Libre */
  if (typeof Game !== 'undefined' && Game.pause && !Game._pausaDiario) {
    Game._pausaDiario = 1;
    const pause0 = Game.pause;
    Game.pause = function () {
      const r = pause0.apply(this, arguments);
      if (Game.mode === L && Game.st && !EM.headless) {
        const mBody = $('#mBody');
        const col = mBody && mBody.querySelector('.col');
        if (col && !document.getElementById('pDiarioBtn')) {
          const btn = document.createElement('button');
          btn.id = 'pDiarioBtn'; btn.className = 'btn';
          const n = SV.diario().length;
          btn.textContent = '📰 Diario de huellas y subtramas (' + n + '/6)';
          btn.onclick = () => { Game.resume(); SV.abrirDiario(Game.st); };
          col.appendChild(btn);
        }
      }
      return r;
    };
  }
})();
