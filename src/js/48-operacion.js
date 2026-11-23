/* CX-36-3 · «Un día de operación» — OpenAI GPT-6 / Eón.
   Juego roguelite autónomo sin internet sobre las estaciones reales.
   No cambia la estructura de elmetro.v1.
   3.9 (Claude) · se pudo ganar, se lee y se entiende:
   - Equilibrio medido con simulación (EM.modes.operacion.simular, 5 semillas). En la 3.8.0 nadie podía ganar: el piloto automático, que
     siempre refuerza la estación más llena, se saturaba en el día 1 a los 13 s. La hora pico traía ~1200 pasajeros de más y los
     refuerzos alcanzaban para ~380. Ahora cada estación pesa según cuántas líneas la cruzan (San Antonio, la que más), la gente
     de la hora pico cabe si se reparten bien los refuerzos y cada jornada trae un poco más de gente que la anterior.
   - El plano usa el color de cada línea, separa las estaciones que se encimaban en el centro y deja libre la barra de arriba.
   - La hora pico se anuncia, el refuerzo se ve en la estación y cada mejora dice qué hace. */
(() => {
  /* base y pico: gente por turno de 10 min; flota0 y flota: los que salen por turno; refuerzo: los que saca un tren extra por
     turno durante «dura» turnos; crece: la gente de más que trae cada jornada nueva; min: minutos del día por segundo real */
  const K = { base: 2.4, pico: 4.8, flota0: 9, flota: 3, refuerzo: 12, dura: 4, costo: 3, crece: 1.12, min: 16, fichas: 12 };
  const LINEAS = ['metro', 'tram', 'cable', 'brt', 'feeder'];
  const MEJORAS = [['Más trenes', '+3 viajes por turno en todas', '#1C5C9C'], ['Más aforo', '+30 personas antes de saturarse', '#59AB42'], ['Información', '−9 % de gente en hora pico', '#E38835']];
  const corto = n => n.replace(/^Santo Domingo Savio$/, 'Santo Domingo').replace(/^Exposiciones$/, 'Exposic.');
  EM.modes.operacion = {
    id: 'operacion', name: 'Un día de operación', sub: 'La red de 4:30 a. m. a 11:00 p. m.', music: 'puzzle', fullCanvas: true, substeps: true, K,
    tip: 'Toca una estación para enviarle un tren de refuerzo (3 fichas). Tras cada jornada elige una mejora. Pierdes si una estación se satura.',
    levels() { return [{ id: 'op:red', name: 'Turno del Valle', sub: 'Gestiona la demanda del metro, tranvía, bus y cable' }]; },
    create(_lv, opts = {}) {
      const wish = ['Niquía', 'Acevedo', 'Universidad', 'Hospital', 'San Antonio', 'Exposiciones', 'Industriales', 'Poblado', 'Itagüí', 'La Estrella', 'Estadio', 'San Javier', 'Santo Domingo Savio'];
      const hubs = (NET.stations || []).filter(h => h && Number.isFinite(h.x) && Number.isFinite(h.y));
      const chosen = wish.map(n => hubs.find(h => h.name === n)).filter((h, i, a) => h && a.indexOf(h) === i);
      for (const h of hubs) if (chosen.length < 11 && !chosen.includes(h)) chosen.push(h);
      if (!chosen.length) throw new Error('Operación: la red de estaciones no está cargada');
      /* peso: cuántas líneas cruzan la estación (los transbordos atraen más gente); San Antonio, el corazón de la red */
      const stations = chosen.map((h, i) => ({ id: h.name, rx: h.x, ry: h.y, x: 0, y: 0, q: 6 + (i % 5) * 2, fleet: 0, boost: 0, cap: 120, fx: 0,
        w: h.name === 'San Antonio' ? 1.3 : clamp(.85 + .12 * (((h.lines || []).filter(l => LINEAS.includes(l.kind)).length || 1) - 1), .85, 1.15) }));
      this.plano(stations);
      const lookup = new Map(stations.map((s, i) => [s.id, i])), links = [], seen = new Set();
      for (const l of NET.lines) {
        if (!LINEAS.includes(l.kind)) continue;
        let last = -1;
        for (const t of l.st || []) {
          const idx = lookup.get(t.name) ?? lookup.get(t.hub && t.hub.name) ?? -1;
          if (idx < 0) continue;
          if (last >= 0 && idx !== last) { const a = Math.min(idx, last), b = Math.max(idx, last), k = a + ':' + b; if (!seen.has(k)) { seen.add(k); links.push([a, b, l.color || '#4d7eaa']); } }
          last = idx;
        }
      }
      return { lv: 'op:red', seed: opts.seed | 0, stations, links, t: 270, acc: 0, day: 1, credits: 6, score: 0, served: 0, saturated: -1, done: false, win: false, upgrade: null, demand: 1, auto: !!opts.auto, ticks: 0, aviso: 0 };
    },
    /* posiciones reales, con la proporción del valle, y separadas para que ninguna estación tape a otra (en una caja de 364 × 600) */
    plano(S) {
      const W = 364, H = 600, minx = Math.min(...S.map(s => s.rx)), maxx = Math.max(...S.map(s => s.rx)), miny = Math.min(...S.map(s => s.ry)), maxy = Math.max(...S.map(s => s.ry));
      const k = Math.min((W - 40) / Math.max(1, maxx - minx), (H - 40) / Math.max(1, maxy - miny)), ox = (W - (maxx - minx) * k) / 2, oy = (H - (maxy - miny) * k) / 2;
      const P = S.map(s => [ox + (s.rx - minx) * k, oy + (s.ry - miny) * k]), D = 62;
      for (let it = 0; it < 80; it++) for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
        let dx = P[j][0] - P[i][0], dy = P[j][1] - P[i][1], d = Math.hypot(dx, dy); if (d >= D) continue;
        if (d < .01) { dx = 1; dy = .3; d = Math.hypot(dx, dy); } const e = (D - d) / 2 / d; P[i][0] -= dx * e; P[i][1] -= dy * e; P[j][0] += dx * e; P[j][1] += dy * e;
      }
      S.forEach((s, i) => { s.x = clamp(P[i][0], 16, W - 16) / W; s.y = clamp(P[i][1], 12, H - 12) / H; });
    },
    caja(vp) { const top = 118, bot = 128; return { x0: 24, y0: top, w: vp.w - 48, h: Math.max(160, vp.h - top - bot) }; },
    peak(h) { return 1 + 1.9 * Math.exp(-Math.pow((h - 7.6) / 1.05, 2)) + 1.8 * Math.exp(-Math.pow((h - 17.6) / 1.2, 2)); },
    tick(st) {
      const peak = this.peak(st.t / 60);
      for (let i = 0; i < st.stations.length; i++) {
        const s = st.stations[i], rand = h2(i, st.t | 0, st.seed + st.day * 131);
        const arrivals = (K.base + K.pico * peak * st.demand * s.w) * (.85 + rand * .3), throughput = K.flota0 + s.fleet * K.flota + (s.boost > 0 ? K.refuerzo : 0);
        st.served += Math.min(throughput, arrivals + s.q);
        s.q = Math.max(0, s.q + arrivals - throughput);
        if (s.boost > 0) s.boost--;
        if (s.q >= s.cap) { st.saturated = i; st.done = true; st.win = false; return; }
      }
      st.credits = Math.min(K.fichas, st.credits + 1); st.score += Math.round(peak * 10); st.ticks++;
    },
    step(st, dt) {
      for (const s of st.stations) s.fx = Math.max(0, s.fx - dt * 1.6);
      if (st.aviso > 0) st.aviso = Math.max(0, st.aviso - dt);
      if (st.done || st.upgrade) return;
      const antes = this.peak(st.t / 60) > 2.2;
      st.acc += Math.max(0, dt) * K.min;
      let n = 0;
      while (st.acc >= 10 && n++ < 10 && !st.done) {
        st.acc -= 10; st.t += 10;
        if (st.t >= 1380) { if (st.day >= 7) { st.done = true; st.win = true; st.score += 5000; break; } st.upgrade = true; st.t = 1380; break; }
        this.tick(st);
      }
      if (!antes && this.peak(st.t / 60) > 2.2 && !st.done) { st.aviso = 2.4; if (EM.jugo && !st.auto) EM.jugo.pop(st, '🔺 Hora pico', 'r'); }
    },
    act(st, a) {
      if (!a || st.done) return;
      if (a.k === 'refuerzo' && !st.upgrade && st.credits >= K.costo && st.stations[a.i]) {
        const s = st.stations[a.i]; st.credits -= K.costo; s.boost += K.dura; s.fx = 1; st.score += 5;
        if (typeof Snd !== 'undefined' && !st.auto) Snd.play('ok');
      } else if (a.k === 'mejora' && st.upgrade && a.i >= 0 && a.i < 3) {
        if (a.i === 0) for (const s of st.stations) s.fleet++;
        if (a.i === 1) for (const s of st.stations) s.cap += 30;
        if (a.i === 2) st.demand *= .91;
        st.day++; st.demand *= K.crece; st.t = 270; st.acc = 0; st.credits = Math.max(st.credits, 6); st.upgrade = null; st.score += 450;
      }
    },
    /* el piloto: refuerza la estación más cerca de saturarse (sin repetir una que ya va reforzada) y rota las mejoras */
    ai(st) {
      if (st.upgrade) return { k: 'mejora', i: st.day % 3 };
      if (st.credits >= K.costo) { let i = -1, m = -1; st.stations.forEach((s, j) => { const r = s.q / s.cap - (s.boost > 1 ? .2 : 0); if (r > m) { m = r; i = j; } }); return i >= 0 ? { k: 'refuerzo', i } : null; }
      return null;
    },
    /* simulación rápida para medir el equilibrio: quien = 'bot' | 'nada' | segundos entre jugadas de una persona */
    simular(quien = 'bot', seed = 7) {
      const st = this.create('op:red', { seed, auto: true }); let t = 0, acc = 0;
      while (!st.done && t < 3600) {
        this.step(st, 1 / 30); t += 1 / 30; acc += 1 / 30;
        if (st.upgrade) this.act(st, { k: 'mejora', i: st.day % 3 });
        else if (quien === 'bot' || (typeof quien === 'number' && acc > quien)) { acc = 0; const a = this.ai(st); if (a) this.act(st, a); }
      }
      return { gana: st.win, dia: st.day, segundos: Math.round(t), puntos: st.score, saturada: st.saturated >= 0 ? st.stations[st.saturated].id : null };
    },
    key(st, k, down) {
      if (!down) return;
      if (st.upgrade && /^[123]$/.test(k)) this.act(st, { k: 'mejora', i: +k - 1 });
      else if (/^[1-9]$/.test(k)) this.act(st, { k: 'refuerzo', i: +k - 1 });
    },
    pointer(st, type, x, y, vp) {
      if (type !== 'down') return null;
      const w = vp.w, h = vp.h;
      if (st.upgrade) return y > h - 150 && y < h - 30 ? { k: 'mejora', i: clamp(Math.floor(x / (w / 3)), 0, 2) } : null;
      const B = this.caja(vp); let best = -1, dd = Infinity;
      for (let i = 0; i < st.stations.length; i++) { const s = st.stations[i], dx = x - (B.x0 + s.x * B.w), dy = y - (B.y0 + s.y * B.h), d = dx * dx + dy * dy; if (d < dd) { dd = d; best = i; } }
      return dd < 2704 ? { k: 'refuerzo', i: best } : null;
    },
    draw(g, st, vp) {
      const w = vp.w, h = vp.h, B = this.caja(vp), P = s => [B.x0 + s.x * B.w, B.y0 + s.y * B.h], hora = st.t / 60, pico = this.peak(hora), F = 'px Cuerpo, system-ui, sans-serif';
      g.fillStyle = '#0f2a45'; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(241,236,224,.05)'; g.lineWidth = 1; for (let x = 0; x < w; x += 24) { g.beginPath(); g.moveTo(x + .5, 0); g.lineTo(x + .5, h); g.stroke(); } for (let y = 0; y < h; y += 24) { g.beginPath(); g.moveTo(0, y + .5); g.lineTo(w, y + .5); g.stroke(); }
      /* tablero de turno (debajo de la barra de arriba): jornada, reloj, la franja del día con sus horas pico y las fichas */
      g.fillStyle = 'rgba(21,74,128,.92)'; g.fillRect(10, 56, w - 20, 54);
      g.fillStyle = '#f1ece0'; g.font = '700 15' + F; g.textAlign = 'left'; g.fillText('Jornada ' + st.day + ' de 7 · ' + pad2(Math.floor(st.t / 60)) + ':' + pad2(st.t % 60), 20, 76);
      g.textAlign = 'right'; g.font = '700 13' + F; g.fillStyle = '#F6C538'; g.fillText('🎟️ ' + st.credits + ' fichas', w - 20, 76); g.textAlign = 'left';
      const bx = 20, bw = w - 40, by = 88; g.fillStyle = 'rgba(241,236,224,.18)'; g.fillRect(bx, by, bw, 10);
      for (let i = 0; i < 60; i++) { const hh = 4.5 + i * 18.5 / 60, p = this.peak(hh); if (p > 2) { g.fillStyle = 'rgba(236,52,58,' + Math.min(.75, (p - 2) * .8 + .2) + ')'; g.fillRect(bx + i * bw / 60, by, bw / 60 + .5, 10); } }
      const f = clamp((st.t - 270) / (1380 - 270), 0, 1); g.fillStyle = '#F6C538'; g.fillRect(bx + f * bw - 2, by - 3, 4, 16);
      if (pico > 2.2 && !st.upgrade) { g.font = '700 12' + F; g.fillStyle = (st.aviso > 0 && (st.aviso * 4 | 0) % 2) ? '#F6C538' : '#ff8a8e'; g.fillText('🔺 Hora pico', bx, by + 22); }
      /* las líneas con su color y las estaciones */
      g.lineCap = 'round';
      for (const [a, b, c] of st.links) { const A = P(st.stations[a]), Bq = P(st.stations[b]); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 9; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(Bq[0], Bq[1]); g.stroke(); g.strokeStyle = c; g.lineWidth = 5; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(Bq[0], Bq[1]); g.stroke(); }
      const ahora = typeof performance !== 'undefined' ? performance.now() / 1000 : 0;
      st.stations.forEach((s, i) => {
        const [x, y] = P(s), q = s.q / s.cap, r = 15 + q * 8, alerta = q > .8;
        if (s.boost > 0) { g.strokeStyle = 'rgba(46,196,182,.9)'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, r + 6, 0, TAU); g.stroke(); }
        if (s.fx > 0) { g.strokeStyle = 'rgba(246,197,56,' + s.fx + ')'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, r + 6 + (1 - s.fx) * 22, 0, TAU); g.stroke(); }
        g.beginPath(); g.fillStyle = q > .7 ? '#EC343A' : q > .4 ? '#E38835' : '#59AB42'; g.arc(x, y, r * (alerta ? 1 + .06 * Math.sin(ahora * 9) : 1), 0, TAU); g.fill(); g.strokeStyle = '#f1ece0'; g.lineWidth = 2; g.stroke();
        g.textAlign = 'center'; g.fillStyle = '#f1ece0'; g.font = '700 11' + F; g.fillText(Math.round(q * 100) + '%', x, y + 4);
        g.font = '600 11' + F; g.lineWidth = 3; g.strokeStyle = 'rgba(15,42,69,.95)'; g.strokeText(corto(s.id), x, y - r - 7); g.fillText(corto(s.id), x, y - r - 7);
        if (i < 9 && !st.auto) { g.font = '700 9' + F; g.fillStyle = 'rgba(241,236,224,.55)'; g.fillText(i + 1, x + r + 6, y + r + 2); }
      });
      g.textAlign = 'left'; g.fillStyle = 'rgba(241,236,224,.85)'; g.font = '13' + F;
      g.fillText(st.credits >= K.costo ? 'Toca la estación más llena: tren de refuerzo (3 fichas)' : 'Ganando fichas… (una por turno de 10 min)', 18, h - 38);
      if (st.upgrade) {
        g.fillStyle = 'rgba(15,42,69,.97)'; g.fillRect(0, h - 200, w, 200); g.fillStyle = '#F6C538'; g.font = '700 18' + F; g.fillText('Jornada ' + st.day + ' cumplida: elige una mejora', 12, h - 170);
        g.font = '12' + F; g.fillStyle = 'rgba(241,236,224,.8)'; g.fillText('Mañana viene ' + Math.round((K.crece - 1) * 100) + ' % más gente.', 12, h - 152);
        MEJORAS.forEach(([t, d, c], i) => {
          const x0 = i * w / 3 + 4, cw = w / 3 - 8; g.fillStyle = c; g.fillRect(x0, h - 140, cw, 104); g.fillStyle = '#f1ece0'; g.font = '700 14' + F; g.fillText(t, x0 + 7, h - 116);
          g.font = '11' + F; const pal = d.split(' '); let lin = '', yy = h - 96; for (const p of pal) { if (g.measureText(lin + p).width > cw - 12) { g.fillText(lin, x0 + 7, yy); yy += 14; lin = ''; } lin += p + ' '; } g.fillText(lin, x0 + 7, yy);
        });
      }
    },
    hud(st) { return [['Día', st.day], ['Viajes', Math.round(st.served)], ['Fichas', st.credits]]; },
    result(st) { return { done: !!st.done, win: !!st.win, stars: st.win ? 3 : st.day >= 4 ? 2 : st.day >= 2 ? 1 : 0, score: st.score | 0, lines: [['Jornadas', st.day], ['Viajes atendidos', Math.round(st.served)], ['Estado', st.win ? 'Red a salvo' : st.saturated >= 0 ? 'Saturación: ' + st.stations[st.saturated].id : 'En servicio']] }; }
  };
})();
