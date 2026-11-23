/* =====================================================================
   METROCABLE · VIAJE: opera la línea y viaja en la cabina sobre la loma real.
   Velocidad de línea 0–5 m/s (como los metrocables reales), viento con ráfagas,
   balanceo de la cabina como péndulo (θ'' = −g/L·sen θ − c·θ' + (F_viento − a_línea)·cos θ / L),
   tormentas con relámpagos (hay que detener la línea) y fotos de los miradores.
   Vista lateral en capas (por defecto), 3D, cabina y cenital. El tiempo corre ×3.
   ===================================================================== */
const MIRADORES = { 'Santo Domingo Savio': 'Biblioteca España sobre la loma', 'Parque Arví': 'El bosque de Arví entre la niebla', 'La Aurora': 'El occidente y la Comuna 13', 'El Progreso': 'El cerro El Picacho', 'Villa Sierra': 'El centro desde la Comuna 8', 'Trece de Noviembre': 'Los techos de ladrillo de la 8', 'Andalucía': 'Las casas de colores del nororiente', 'Popular': 'El río y el valle al norte', 'Juan XXIII': 'San Javier desde el aire', 'Vallejuelos': 'La ladera occidental', 'Las Torres': 'El oriente de la ciudad', 'El Pinal': 'Las quebradas del oriente', 'SENA': 'El Doce de Octubre', 'Doce de Octubre': 'El noroccidente encendido' };
const CableViaje = EM.modes.cableviaje = {
  id: 'cableviaje', name: 'Metrocable · Viaje', sub: 'Opera la línea y viaja sobre la loma', music: 'story', fullCanvas: true, substeps: true,
  tip: 'La cabina ya viene en marcha. Ajusta la velocidad con la palanca o ▲/▼ (hasta 5 m/s), cambia el ritmo con ⏩, frena en ráfagas fuertes o tormenta y toma fotos en los miradores 📷.',
  levels() { if (this._lv) return this._lv; return (this._lv = NET.lines.filter(l => l.kind === 'cable').map(l => ({ id: 'cv:' + l.id, line: l.id, name: l.name, sub: l.st[0].name + ' → ' + l.st[l.st.length - 1].name }))); },
  create(lv, opts) {
    const L = this.levels().find(l => l.id === lv) || this.levels()[0], line = NET.byId[L.line], C = G3.cableGeo(line), rng = new RNG(opts.seed | 0), hr = new Date().getHours() + new Date().getMinutes() / 60;
    const stS = C.pts.map((p, i) => p.st ? C.P.cum[i] : null).filter(v => v != null), alto = Math.max(...C.pts.map(p => p.z));
    const h0 = opts.hour != null ? opts.hour : (typeof Mundo !== 'undefined' && Mundo.hour ? Mundo.hour() : hr);
    const st = { lvId: L.id, line: line.id, s: stS[0] + 2, v: 2.4, vt: 4.0, ritmo: 1, th: 0, om: 0, wind: 0, gust: 0, t: 0, hour: h0, hourNow: h0, stS, ni: 1, ph: 'ride', dwell: 0, pax: 0, moved: 0, comfort: 100, score: 0, photos: [], view: opts.view || 'lado', auto: !!opts.auto, done: false, seed: opts.seed | 0,
      fixH: opts.hour, paseo: !!opts.paseo, fog: alto > 2200 || (opts.hour != null ? rng.f() < .15 : Mundo.weather().fog), rain: opts.hour != null ? rng.f() < .3 : Mundo.weather().rain, storm: null, stormT: rng.range(45, 140), stormed: false, stopPen: 0, safety: 0, lastV: 0, titleT: 3, title: line.st[0].name, base: 1.5 + rng.f() * 2.5 + (alto > 2100 ? 2 : 0) };
    st.mir = line.st.slice(1).map(s => ({ name: s.name, txt: MIRADORES[s.name] || 'Mirador de ' + s.name, s: stS[line.st.indexOf(s)] - 140, done: false }));
    return st;
  },
  step(st, dt) { if (st.done) return; const n = 3 * (st.ritmo || 1); for (let i = 0; i < n; i++) this.tick(st, dt); },   // base ×3, ajustable con ⏩
  tick(st, dt) {
    const line = NET.byId[st.line], C = G3.cableGeo(line); st.t += dt; st.hourNow = st.fixH != null ? st.fixH + st.t * 10 / 3600 : Mundo.hour(); if (st.fixH == null && (st._wt = (st._wt || 0) + dt) > 3) { st._wt = 0; const w = Mundo.weather(); st.rain = w.rain; if (w.storm && !st.storm) { st.storm = { t: 0, len: 30 }; this.msg(st, '⚡ Tormenta eléctrica en el valle: detén la línea', 'r'); } }
    // viento: base + ráfagas suaves + ráfagas fuertes ocasionales; tormenta con relámpagos
    if (!st.storm && !st.stormed && st.t > st.stormT) { st.storm = { t: 0, len: 35 + (st.seed % 20) }; st.stormed = true; this.msg(st, '⚡ Tormenta eléctrica: detén la línea hasta que pase', 'r'); this.sfx(st, 'warn'); }
    if (st.storm) { st.storm.t += dt; if (st.storm.t > st.storm.len) { st.storm = null; this.msg(st, 'Pasó la tormenta: puedes reanudar', 'g'); } }
    const gustOn = Math.sin(st.t * .07 + st.seed) > .75;
    st.wind = st.base + 3 * Math.sin(st.t * .13) + 2.2 * Math.sin(st.t * .41 + 1) + (gustOn ? 6 * Math.max(0, Math.sin(st.t * 1.3)) : 0) + (st.storm ? 9 + 3 * Math.sin(st.t * 2.1) : 0);
    // piloto (bot) o mando del jugador
    if (st.auto) st.vt = st.storm ? 0 : st.wind > 12 ? 2 : st.wind > 9 ? 3.5 : 5;
    const lineA = clamp(st.vt - st.v, -.6 * dt, .55 * dt) / dt; st.v = clamp(st.v + lineA * dt, 0, 5);
    if (st.safety > 0) { st.safety -= dt; st.v = Math.max(0, st.v - 1.2 * dt); }
    // péndulo (hanger de 3 m)
    const Lh = 3, Fw = .022 * st.wind * Math.abs(st.wind) * (st.ph === 'station' ? .2 : 1), acc = st.ph === 'station' ? 0 : lineA;
    st.om += (-(9.81 / Lh) * Math.sin(st.th) - .55 * st.om + (Fw - acc) * Math.cos(st.th) / Lh) * dt; st.th += st.om * dt;
    const ang = Math.abs(st.th);
    if (ang > .1 && st.v > .3) st.comfort = Math.max(0, st.comfort - (ang - .1) * 40 * dt);
    if (ang > .36 && st.safety <= 0) { st.safety = 6; st.score -= 150; this.msg(st, 'Parada de seguridad: balanceo de ' + Math.round(ang * 57) + '° −150', 'r'); this.sfx(st, 'crash'); }
    if (st.storm && st.v > 1) { st.stopPen += dt; if (st.stopPen > 8) { st.stopPen = -1e9; st.score -= 200; this.msg(st, 'No se puede operar con tormenta eléctrica −200', 'r'); this.sfx(st, 'bad'); } }
    // avance y estaciones (la cabina se desacopla, abre puertas y vuelve a salir)
    if (st.ph === 'station') { st.dwell += dt; if (st.dwell > 4.5) { st.ph = 'ride'; this.sfx(st, 'whoosh'); } }
    else {
      st.s += st.v * dt; const tgt = st.stS[st.ni];
      for (const m of st.mir) if (!m.done && !m.seen && st.s > m.s && st.s < m.s + 160) { m.seen = true; this.msg(st, '📷 Mirador: ' + m.txt, 'b'); if (st.auto) this.photo(st); }
      if (st.s >= tgt - 1) {
        st.s = tgt; st.ph = 'station'; st.dwell = 0; const name = line.st[st.ni].name, bo = 6 + hashStr(name) % 5; st.moved += bo; st.score += 100 + Math.round(st.comfort); st.title = name; st.titleT = 3.5; this.sfx(st, 'bell'); this.say(st, 'Estación ' + name);
        Save.d.stats.pax += bo; const f = NET.fact(name); if (f) { this.msg(st, name + ': ' + f, 'b'); Save.d.facts[name] = 1; }
        if (st.ni >= st.stS.length - 1) { this.finish(st); return; } st.ni++;
      }
    }
    if (st.titleT > 0) st.titleT -= dt;
  },
  photo(st) {
    const m = st.mir.find(m => m.seen && !m.done && st.s > m.s - 20 && st.s < m.s + 200); if (!m) { this.msg(st, 'Aquí no hay mirador: espera el 📷', 'y'); return; }
    m.done = true; const ok = Math.abs(st.th) < .12; st.score += ok ? 120 : 50; st.photos.push(m.txt); const F = Save.d.fotos || (Save.d.fotos = []); if (!F.includes(m.txt)) F.push(m.txt);
    this.msg(st, ok ? '📷 ¡Foto nítida! +120' : '📷 Salió movida (balanceo) +50', ok ? 'g' : 'y'); this.sfx(st, ok ? 'star' : 'ok'); st.flash = .3;
  },
  finish(st) { if (st.done) return; st.done = true; st.score += Math.round(st.comfort * 3); st.score = Math.max(0, Math.round(st.score)); },
  result(st) { const n = st.stS.length - 1, max = n * 200 + st.mir.length * 120 + 300, line = NET.byId[st.line]; return { done: st.done, win: st.done, score: st.score, stars: st.done ? starsOf(st.score / max) : 0, fact: (line.facts || [])[st.seed % Math.max(1, (line.facts || []).length)] || '', lines: [['Pasajeros movidos', st.moved], ['Fotos', st.photos.length + ' / ' + st.mir.length], ['Confort', Math.round(st.comfort) + ' %']] }; },
  msg(st, t, c) { if (!EM.headless && Game.st === st) UI.gmsg(t, c); },
  say(st, t) { if (!st.auto && Game.st === st) Snd.say(t); },
  sfx(st, k) { if (!EM.headless && Game.st === st) Snd.play(k); },
  hud(st) { this.updCtl(st); const line = NET.byId[st.line]; return [['', st.v.toFixed(1) + ' m/s'], ['💨', Math.round(st.wind * 3.6) + ' km/h'], ['→', line.st[Math.min(st.ni, line.st.length - 1)].name], ['★', fmt(st.score)]]; },
  mount(st, el) {
    el.innerHTML = `<div class="lever" id="cvLev" style="background:linear-gradient(#2f9b57,#f9e4a4 70%,#c8201f)"><div class="lb" style="top:6px">5 m/s</div><div class="lb" style="bottom:6px">PARAR</div><div class="kn" id="cvKn">4.0</div></div>
      <div class="lever-nudge"><button id="cvMas" aria-label="Subir velocidad">▲</button><button id="cvRit" aria-label="Ritmo del viaje">×1</button><button id="cvMen" aria-label="Bajar velocidad">▼</button></div>
      <div class="gbtns"><button class="btn sm mos" id="cvFoto">📷 Foto</button><button class="btn sm" id="cvStop">■ Detener</button></div>
      <div class="vsel" id="cvView"><button data-v="lado">↔</button><button data-v="tps">3ª</button><button data-v="cab">1ª</button><button data-v="cine">🎥</button><button data-v="top">▦</button><button data-v="paseo">🎬</button></div>`;
    const lev = $('#cvLev'), set = e => { const r = lev.getBoundingClientRect(); st.vt = Math.round(clamp(1 - (e.clientY - r.top) / r.height, 0, 1) * 10) / 2; Snd.init(); };
    lev.addEventListener('pointerdown', e => { lev.setPointerCapture(e.pointerId); set(e); }); lev.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') set(e); });
    $('#cvMas').onclick = () => { st.vt = Math.min(5, Math.round((st.vt + .5) * 2) / 2); Snd.init(); this.updCtl(st); };
    $('#cvMen').onclick = () => { st.vt = Math.max(0, Math.round((st.vt - .5) * 2) / 2); Snd.init(); this.updCtl(st); };
    $('#cvRit').onclick = () => { st.ritmo = st.ritmo === 1 ? 2 : st.ritmo === 2 ? 3 : 1; this.msg(st, '⏩ Ritmo del cable: ×' + st.ritmo, 'b'); this.updCtl(st); };
    $('#cvFoto').onclick = () => this.photo(st); $('#cvStop').onclick = () => { st.vt = 0; this.updCtl(st); };
    $$('#cvView button').forEach(b => b.onclick = () => { if (b.dataset.v === 'paseo') { st.paseo = !st.paseo; st.auto = st.paseo; this.msg(st, st.paseo ? 'Modo paseo: la línea se opera sola' : 'Vuelves a operar tú', 'b'); } else st.view = b.dataset.v; this.updCtl(st); });
  },
  updCtl(st) { if (EM.headless || Game.st !== st) return; const kn = $('#cvKn'); if (!kn) return; kn.style.top = 'calc(' + ((1 - st.vt / 5) * 100) + '% - 15px)'; kn.textContent = st.vt.toFixed(1); const rb = $('#cvRit'); if (rb) { rb.textContent = '×' + (st.ritmo || 1); rb.classList.toggle('on', (st.ritmo || 1) > 1); } $$('#cvView button').forEach(b => b.classList.toggle('on', b.dataset.v === st.view || (b.dataset.v === 'paseo' && st.paseo))); if (st.paseo && (st._pv = (st._pv || 0) + .2) > 9) { st._pv = 0; const V = this.gl(Object.assign({}, st, { view: 'tps' })) ? ['lado', 'cine', 'tps', 'cab'] : ['lado', 'top']; st.view = V[(V.indexOf(st.view) + 1) % V.length]; } const f = $('#cvFoto'); const can = st.mir.some(m => m.seen && !m.done && st.s > m.s - 20 && st.s < m.s + 200); f.classList.toggle('on', can); },
  key(st, k, down) { if (!down) return; if (k === 'ArrowUp' || k === 'w') st.vt = Math.min(5, st.vt + .5); if (k === 'ArrowDown' || k === 's') st.vt = Math.max(0, st.vt - .5); if (k === ' ' || k === 'f') this.photo(st); if (k === 'x') st.vt = 0; if (k === 'r') st.ritmo = st.ritmo === 1 ? 2 : st.ritmo === 2 ? 3 : 1; if (k === 'v') { const V = ['lado', 'tps', 'cab', 'cine', 'top']; st.view = V[(V.indexOf(st.view) + 1) % V.length]; } },
  gl(st) { return (st.view === 'tps' || st.view === 'cab' || st.view === 'cine') && G3.init() && Save.d.settings.q !== 'low'; },
  cabin(st) { const line = NET.byId[st.line], C = G3.cableGeo(line), p = NET.at(C.P, st.s); return { x: p.x, y: p.y, a: p.a, z: C.zAt(st.s) + 2 }; },
  draw(g, st, vp) {
    const W = vp.w, H = vp.h, line = NET.byId[st.line], C = G3.cableGeo(line), col = line.color;
    if (this.gl(st)) {
      G3.show(true); const c = this.cabin(st), ca = Math.cos(c.a), sa = Math.sin(c.a), sx = -sa, sy = ca;
      if (st.view === 'cine' && (!st._cine || st._cine.s - st.s < -30)) { const sa = Math.min(C.P.len, st.s + 90 + h2(st.t | 0, 1, 3) * 60), q = NET.at(C.P, sa, (h2(st.t | 0, 2, 3) < .5 ? -1 : 1) * 24); st._cine = { s: sa, x: q.x, y: q.y, z: MAP.elevM(q.x, q.y) + 2 }; }
      const cam = st.view === 'cine' ? { eye: [st._cine.x, st._cine.z, st._cine.y], at: [c.x, c.z - 4, c.y], fov: .95 } : st.view === 'cab' ? { eye: [c.x + ca * 1, c.z - 3.4, c.y + sa * 1], at: [c.x + ca * 60, c.z - 18, c.y + sa * 60], fov: 1.2 } : { eye: [c.x - ca * 24 + sx * 14, c.z + 7, c.y - sa * 24 + sy * 14], at: [c.x + ca * 6, c.z - 6, c.y + sa * 6], fov: 1.05 };
      G3.draw(cam, { hour: st.hourNow, rain: st.rain || !!st.storm, escala: .82, suave: true, fogd: st.fog ? 1 / 1800 : 1 / 9000, dyn: G => { G3.traffic(cam, st.t * 3 + 2000, line); G3.people(cam, st.t); if (st.view !== 'cab') { G.box(c.x, c.z - 2.6, c.y, c.a, .18, .18, 2.6, [.15, .15, .15], 0, st.th); G.box(c.x - sx * Math.sin(st.th) * 2.6, c.z - 5, c.y - sy * Math.sin(st.th) * 2.6, c.a, 2.3, 2.1, 2.3, rgb(col), 0, st.th); } } });
      if (st.storm && (st.t % 7) < .15) { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(0, 0, W, H); }
      if (st.view === 'cab') { g.strokeStyle = '#141414'; g.lineWidth = Math.min(W, H) * .05; g.strokeRect(0, 0, W, H); g.fillStyle = 'rgba(20,20,20,.9)'; g.fillRect(0, H * .82, W, H * .18); }
    } else if (st.view === 'top') {
      if (G3.cv) G3.show(false); const c = this.cabin(st), k = Math.min(W, H) / 380; g.fillStyle = PAL.noche; g.fillRect(0, 0, W, H); if (MAP.ready) MAP.drawTop(g, W, H, c.x, c.y, k);
      const S = (x, y) => ({ x: W / 2 + (x - c.x) * k, y: H / 2 + (y - c.y) * k }); g.strokeStyle = PAL.negro; g.lineWidth = 3; g.beginPath(); C.pts.forEach((p, i) => { const q = S(p.x, p.y); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }); g.stroke();
      for (const p of C.pts) { const q = S(p.x, p.y); g.fillStyle = p.st ? col : '#9aa0a6'; g.fillRect(q.x - (p.st ? 9 : 4), q.y - (p.st ? 6 : 4), p.st ? 18 : 8, p.st ? 12 : 8); }
      Art.cabin(g, W / 2, H / 2, 3, col);
    } else {
      if (G3.cv) G3.show(false); const R = Lado.prof('cable:' + line.id, C.P), c = this.cabin(st), k = Math.max(W, H * .7) / 300, ex = 1.7;
      st._cz = st._cz == null ? c.z : st._cz + (c.z - 12 - st._cz) * .05;
      Lado.draw(g, W, H, { R, s: st.s, z: st._cz, k, hour: st.hourNow, t: st.t, rain: st.rain || !!st.storm, fog: st.fog, storm: !!st.storm, title: st.titleT > 0 ? { t: st.title, sub: line.name.toUpperCase(), a: clamp(st.titleT / 1.5, 0, 1) } : null, fg: (g, X, Y, cN, sky) => {
        const gz = s => Lado.sample(R.near, R, s), Yc = (s, z) => Y(gz(s)) - (z - gz(s)) * k * ex;
        // torres y estaciones
        for (let i = 0; i < C.pts.length; i++) { const p = C.pts[i], s = C.P.cum[i], x = X(s); if (x < -80 || x > W + 80) continue; const yb = Y(gz(s)), yt = Yc(s, p.z); if (p.st) { g.fillStyle = Lado.css(Lado.mix(cN, [.9, .88, .84], .55)); g.fillRect(x - 22 * k, yt - 6 * k, 44 * k, yb - yt + 6 * k); g.fillStyle = col; g.fillRect(x - 26 * k, yt - 10 * k, 52 * k, 5 * k); } else { g.strokeStyle = Lado.css(Lado.mix(cN, [.7, .72, .76], .4)); g.lineWidth = Math.max(1.5, 1.2 * k); g.beginPath(); g.moveTo(x - 3 * k, yb); g.lineTo(x, yt); g.lineTo(x + 3 * k, yb); g.moveTo(x - 2 * k, (yb + yt) / 2); g.lineTo(x + 2 * k, (yb + yt) / 2); g.stroke(); g.fillRect(x - 5 * k, yt - 1, 10 * k, 2); } }
        // cable
        g.strokeStyle = sky.night > .5 ? 'rgba(220,220,230,.6)' : 'rgba(20,20,24,.85)'; g.lineWidth = Math.max(1, .5 * k); g.beginPath(); const sA = st.s - W / k, sB = st.s + W / k; for (let s = Math.max(0, sA); s <= Math.min(C.P.len, sB); s += 6) { const x = X(s), y = Yc(s, C.zAt(s)); s === Math.max(0, sA) ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
        // otras cabinas (separadas ~70 m, ida y vuelta)
        const n = Math.max(4, Math.floor(C.P.len / 70)); for (let i = 0; i < n; i++) { const s = ((st.t * 5 * .6 + i * C.P.len / n) % C.P.len), x = X(s); if (x < -20 || x > W + 20 || Math.abs(s - st.s) < 20) continue; this.drawCab(g, x, Yc(s, C.zAt(s)), k * 2.2, col, Math.sin(st.t + i) * .05, sky); }
        // cabina del jugador (con balanceo)
        this.drawCab(g, X(st.s), Yc(st.s, C.zAt(st.s)), k * 2.6, col, st.th, sky, true);
        // viento: hojas y partículas
        g.fillStyle = Lado.css(Lado.mix(cN, [1, 1, 1], .5), .5); for (let i = 0; i < 24; i++) { const x = ((h2(i, 2, 2) * W + st.t * st.wind * 12) % W), y = (h2(i, 3, 2) * H * .8 + Math.sin(st.t * 3 + i) * 10); g.fillRect(x, y, 3, 1.5); }
      } });
      if (st.flash > 0) { st.flash -= .016; g.fillStyle = 'rgba(255,255,255,' + st.flash * 2 + ')'; g.fillRect(0, 0, W, H); }
    }
    if (!EM.headless) { const gl = this.gl(st); Mundo.overlay(g, W, H, st.t, { noNight: gl || st.view !== 'top', noRain: true, noGrain: gl }); if (st.view === 'top') MAP.lightsTop(g, Mundo.light().night, st.t); }
    this.gauges(g, st, W, H);
  },
  drawCab(g, x, y, s, col, th, sky, me) {
    g.save(); g.translate(x, y); g.rotate(th); g.fillStyle = '#141414'; g.fillRect(-.3 * s, 0, .6 * s, 3 * s); g.fillRect(-2.4 * s, -.6 * s, 4.8 * s, 1.1 * s);
    g.translate(0, 3 * s); g.fillStyle = '#141414'; g.fillRect(-2.2 * s, 0, 4.4 * s, 4 * s); g.fillStyle = col; g.fillRect(-2 * s, .2 * s, 4 * s, 3.6 * s);
    g.fillStyle = sky.night > .5 ? '#ffe7a0' : '#bfe3f0'; g.fillRect(-1.7 * s, .7 * s, 3.4 * s, 1.5 * s); if (me) { g.fillStyle = '#141414'; g.fillRect(-1 * s, 1 * s, .5 * s, 1.1 * s); g.fillRect(.3 * s, 1.1 * s, .5 * s, 1 * s); }
    g.restore();
  },
  gauges(g, st, W, H) {
    const dpr = W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W), x = 12 * dpr, y = 108 * dpr, w = 126 * dpr;
    g.fillStyle = 'rgba(13,20,24,.82)'; g.fillRect(x, y, w, 58 * dpr); g.fillStyle = PAL.mante; g.font = '700 ' + (9 * dpr) + 'px Cuerpo, sans-serif'; g.fillText('VIENTO ' + Math.round(st.wind * 3.6) + ' km/h', x + 8 * dpr, y + 14 * dpr);
    const wf = clamp(st.wind / 20, 0, 1); g.fillStyle = '#333'; g.fillRect(x + 8 * dpr, y + 19 * dpr, w - 16 * dpr, 7 * dpr); g.fillStyle = wf > .7 ? '#ff3b2f' : wf > .45 ? '#ffc23a' : '#38e07b'; g.fillRect(x + 8 * dpr, y + 19 * dpr, (w - 16 * dpr) * wf, 7 * dpr);
    g.fillStyle = PAL.mante; g.fillText('BALANCEO ' + Math.round(Math.abs(st.th) * 57.3) + '°', x + 8 * dpr, y + 40 * dpr); const bf = clamp(Math.abs(st.th) / .36, 0, 1); g.fillStyle = '#333'; g.fillRect(x + 8 * dpr, y + 45 * dpr, w - 16 * dpr, 7 * dpr); g.fillStyle = bf > .7 ? '#ff3b2f' : bf > .3 ? '#ffc23a' : '#38e07b'; g.fillRect(x + 8 * dpr, y + 45 * dpr, (w - 16 * dpr) * bf, 7 * dpr);
    if (st.storm) { g.fillStyle = PAL.rojo; g.fillRect(x, y + 62 * dpr, w, 18 * dpr); g.fillStyle = '#fff'; g.fillText('⚡ TORMENTA: DETÉN LA LÍNEA', x + 6 * dpr, y + 75 * dpr); }
  },
  ai(st) { return null; }
};
