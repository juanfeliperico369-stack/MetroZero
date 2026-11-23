/* =====================================================================
   ACTIVIDADES EN EL MUNDO ABIERTO (3.2 «Evolución», Claude, 22‑nov‑2026)
   Pedido del autor: «cada módulo del juego presente en el mundo abierto, con la misma experiencia que el módulo cerrado».
   En Ciudad Libre, cerca de cada estación aparece 🎮 «jugar» con lo que se puede hacer ahí mismo:
   - Metro y tranvía: manejar DESDE ESA ESTACIÓN hacia un lado o el otro (dos estaciones), o el recorrido completo.
   - Metroplús y alimentadores: manejar desde esa parada (desde arriba o en la cabina 3D) y los cruces del Metroplús.
   - Metrocable: operar la línea y armarla en la loma.
   - Despacho de trenes, el rompecabezas de los alimentadores y la carrera junto a la vía.
   Se juega el mismo módulo del menú (mismos niveles; los tramos «desde aquí» son niveles nuevos con el mismo formato) y al
   terminar —o al salir con ⏸— se vuelve a la ciudad, donde estabas y en lo que ibas.
   ===================================================================== */
(function () {
  if (typeof Libre === 'undefined' || typeof Game === 'undefined') return;
  const svg = d => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICO = svg('<path d="M7 8h10a4 4 0 014 4v1.5a3.5 3.5 0 01-6.2 2.2L13.5 14h-3l-1.3 1.7A3.5 3.5 0 013 13.5V12a4 4 0 014-4z"/><path d="M7.5 10.8v3M6 12.3h3"/><circle cx="15.6" cy="11.4" r=".8" fill="currentColor"/><circle cx="17.4" cy="13.2" r=".8" fill="currentColor"/>');

  /* ---------- tramos «desde aquí»: niveles con el mismo formato que los del menú (línea:a-b) ---------- */
  const dinamico = (M, patron, hacer) => {
    if (!M) return; const lv0 = M.levels, cr0 = M.create;
    M.levels = function () { const L = lv0.apply(this, arguments); return M._extra ? L.concat([M._extra]) : L; };
    M.create = function (lv, opts) {
      const m = patron.exec(String(lv || '')); if (!m || M._extra || lv0.call(this).some(l => l.id === lv)) return cr0.call(this, lv, opts);
      const x = hacer(m, lv); if (!x) return cr0.call(this, lv, opts);
      M._extra = x; try { return cr0.call(this, lv, opts); } finally { M._extra = null; }
    };
  };
  const tramo = (id, a, b, sub) => { const l = NET.byId[id]; if (!l || a === b || !l.st[a] || !l.st[b]) return null; return { line: id, a, b, name: l.st[a].name + ' → ' + l.st[b].name, sub: sub || l.name }; };
  dinamico(EM.modes.conduce, /^([A-Z]):(\d+)-(\d+)$/, (m, id) => { const t = tramo(m[1], +m[2], +m[3]); return t && Object.assign(t, { id, k: 99 }); });
  dinamico(EM.modes.tranvia, /^(T):(\d+)-(\d+)$/, (m, id) => { const t = tramo(m[1], +m[2], +m[3]); return t && Object.assign(t, { id, k: 99 }); });
  dinamico(EM.modes.bus, /^bus:([A-Z0-9-]+):(\d+)-(\d+)$/, (m, id) => { const t = tramo(m[1], +m[2], +m[3]); return t && Object.assign(t, { id }); });
  dinamico(EM.modes.volante, /^vo:([A-Z0-9-]+):(\d+)-(\d+)$/, (m, id) => { const t = tramo(m[1], +m[2], +m[3]); return t && Object.assign(t, { id }); });

  const sigue = (m, pre) => { const M = EM.modes[m]; if (!M) return null; const L = M.levels().filter(l => !pre || String(l.id).startsWith(pre)); return (L.find(l => !Save.stars(m, l.id)) || L[0] || {}).id; };
  const A = EM.actividades = {
    R: 70,
    /* lo que se puede jugar junto a la estación más cercana (a menos de R metros) */
    aqui(st) {
      if (!st || st.mode === 'ride' || st.trama && st.trama.talk) return null;
      const h = Libre.nearHub(st, this.R); if (!h) return null;
      const G = [], pon = (g, m, lv, ico, n, sub) => { if (!EM.modes[m] || !lv) return; g.it.push({ m, lv, ico, n, sub }); };
      let feeders = 0;
      for (const l of h.lines) {
        const i = l.st.findIndex(s => s.hub === h); if (i < 0) continue; const n = l.st.length, g = { l, it: [] };
        if (l.kind === 'metro' || l.kind === 'tram') {
          const m = l.kind === 'tram' ? 'tranvia' : 'conduce', ic = l.kind === 'tram' ? '🚋' : '🚇';
          if (i < n - 1) { const b = Math.min(n - 1, i + 2); pon(g, m, l.id + ':' + i + '-' + b, ic, 'Maneja hacia ' + l.st[b].name, 'Desde ' + l.st[i].name + ', ' + (b - i) + ' estaciones'); }
          if (i > 0) { const b = Math.max(0, i - 2); pon(g, m, l.id + ':' + i + '-' + b, ic, 'Maneja hacia ' + l.st[b].name, 'Desde ' + l.st[i].name + ', sentido contrario'); }
          const full = EM.modes[m].levels().find(q => q.line === l.id && q.full); if (full) pon(g, m, full.id, '🏁', 'Recorrido completo', full.sub);
          if (l.kind === 'metro') pon(g, 'despacho', sigue('despacho'), '🎛', 'Despacho de trenes', 'El Puesto de Control: agujas y horarios');
          pon(g, 'carrera', 'cr:' + l.id, '🛹', 'Carrera junto a la línea', 'En skate, patines, monopatín o bici');
        } else if (l.kind === 'brt' || l.kind === 'feeder') {
          if (l.kind === 'feeder' && ++feeders > 3) continue;
          const ic = l.kind === 'brt' ? '🚌' : '🚐', paso = l.kind === 'brt' ? 4 : n;
          if (i < n - 1) { const b = Math.min(n - 1, i + paso); pon(g, 'bus', 'bus:' + l.id + ':' + i + '-' + b, ic, 'Maneja hacia ' + l.st[b].name, 'Desde arriba, con las paradas y la gente'); pon(g, 'volante', 'vo:' + l.id + ':' + i + '-' + b, '🎮', 'Al volante hacia ' + l.st[b].name, 'En la cabina 3D, con timón y pedales'); }
          if (i > 0 && l.kind === 'brt') { const b = Math.max(0, i - paso); pon(g, 'bus', 'bus:' + l.id + ':' + i + '-' + b, ic, 'Maneja hacia ' + l.st[b].name, 'Sentido contrario'); }
          if (l.kind === 'brt') { pon(g, 'metroplus', sigue('metroplus'), '🚦', 'Cruces del Metroplús', 'Semáforos y carril exclusivo'); pon(g, 'carrera', 'cr:' + l.id, '🛹', 'Carrera junto a la línea', 'En skate, patines, monopatín o bici'); }
          else pon(g, 'alim', sigue('alim'), '🧩', 'Alimentadores: barrios → Metro', 'Rompecabezas de agujas');
        } else if (l.kind === 'cable') {
          pon(g, 'cableviaje', 'cv:' + l.id, '🚡', 'Opera la línea ' + l.id, l.st[0].name + ' → ' + l.st[n - 1].name);
          pon(g, 'cable', sigue('cable', 'cb:' + l.id + ':'), '🧩', 'Arma el cable en la loma', 'Rompecabezas de la línea ' + l.id);
        }
        if (g.it.length) G.push(g);
      }
      return G.length ? { h, G } : null;
    },
    abrir(st) {
      const q = this.aqui(st); if (!q) { Libre.msg(st, 'Acércate a una estación para jugar sus modos', 'y'); return; }
      Libre.persist(st);
      UI.modal(`<div class="pag">Jugar aquí</div><h2>🎮 ${esc(q.h.name)}</h2><p class="m" style="margin-top:0">El mismo juego de cada modo. Al terminar vuelves aquí.</p>` + q.G.map(g => `<h3 style="margin:12px 0 6px"><span class="badge" style="background:${g.l.color}">${esc(g.l.id.replace(/^AL-/, ''))}</span> ${esc(g.l.name)}</h3><div class="tramos">` + g.it.map((a, k) => `<button class="tramo" data-a="${esc(g.l.id)}|${k}"><span class="tx"><b>${a.ico} ${esc(a.n)}</b><small>${esc(EM.modes[a.m].name)} · ${esc(a.sub || '')}</small></span><span>▶</span></button>`).join('') + '</div>').join('') + '<div class="row" style="margin-top:12px"><button class="btn sm gh" id="acX">Seguir en la ciudad</button></div>');
      const x = $('#acX'); if (x) x.onclick = () => UI.close();
      for (const b of document.querySelectorAll('[data-a]')) b.onclick = () => { const [lid, k] = b.dataset.a.split('|'), g = q.G.find(g => g.l.id === lid), a = g && g.it[+k]; if (!a) return; UI.close(); this.lanzar(a); };
    },
    lanzar(a) {
      Snd.init(); Game.start(a.m, a.lv, { back: 'cover', ciudad: 1, onEnd: r => this.fin(a, r) });
    },
    fin(a, r) {
      const ok = r.win || (r.stars | 0) > 0, earn = Save.record(a.m, a.lv, r), M = EM.modes[a.m];
      UI.modal(`<div class="pag">${esc(M.name)}</div><h2>${ok ? '¡Bien hecho!' : 'Casi…'}</h2><div style="font-size:30px;color:var(--mostaza)">${'★'.repeat(r.stars | 0)}${'☆'.repeat(3 - (r.stars | 0))}</div><div class="kv" style="margin:10px 0">${(r.lines || []).map(([k, v]) => `<b>${esc(k)}</b><span>${esc(v)}</span>`).join('')}<b>Pasajes</b><span>+${earn} 🎫</span></div>${r.fact ? `<div class="film" style="margin:10px 0">Dato · ${esc(r.fact)}</div>` : ''}<div class="row"><button class="btn pri" id="acCity">🏙️ Volver a la ciudad</button><button class="btn sm" id="acOtra">↻ Otra vez</button></div>`);
      $('#acCity').onclick = () => { UI.close(); this.volver(); };
      $('#acOtra').onclick = () => { UI.close(); Game.stop(); this.lanzar(a); };
    },
    volver() { Game.stop(); Game.start('libre', 'lb:ultimo', { back: 'cover' }); }
  };

  /* ⏸ Salir de un módulo lanzado desde la ciudad: de vuelta a la ciudad (no al menú) */
  const ex0 = Game.exit;
  Game.exit = function () { const c = this.opts && this.opts.ciudad; const r = ex0.apply(this, arguments); if (c) A.volver(); return r; };

  /* el botón 🎮 en la columna de Ciudad Libre: aparece solo junto a una estación */
  const mount0 = Libre.mount, step0 = Libre.step, key0 = Libre.key;
  Libre.mount = function (st, el) {
    const r = mount0.apply(this, arguments), col = document.getElementById('lbView');
    if (col && !document.getElementById('lbJuego')) { const b = document.createElement('button'); b.id = 'lbJuego'; b.title = 'Jugar aquí: los modos de esta estación'; b.innerHTML = ICO + '<small>jugar</small>'; b.style.display = 'none'; b.onclick = () => A.abrir(st); col.prepend(b); }
    return r;
  };
  Libre.step = function (st, dt) {
    const r = step0.apply(this, arguments);
    if (!EM.headless && !st.auto && Game.st === st && (st._acT = (st._acT || 0) - dt) <= 0) {
      st._acT = .5; const b = document.getElementById('lbJuego'), q = A.aqui(st), on = !!q && !(st.mode === 'veh' && Math.abs(st.vf) > 6);
      if (b && (b.style.display === 'none') === on) { b.style.display = on ? '' : 'none'; if (on && !st._acAviso) { st._acAviso = 1; Libre.msg(st, '🎮 En las estaciones puedes jugar sus modos: toca «jugar»', 'b'); } }
    }
    return r;
  };
  Libre.key = function (st, k, down) { if (down && (k === 'j' || k === 'J')) { if (A.aqui(st)) A.abrir(st); else if (EM.mundoRPG && EM.mundoRPG.abrir) EM.mundoRPG.abrir(st); else A.abrir(st); return; } return key0.call(this, st, k, down); };
})();
