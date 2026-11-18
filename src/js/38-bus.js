/* =====================================================================
   SIMULADOR DE BUS (vista cenital): Metroplús y alimentadores de estación a estación
   sobre las calles reales, con tráfico, semáforos, pasajeros que esperan y suben,
   horario, precisión en la parada y confort. El asistente de carril sigue la ruta solo
   (tú manejas la velocidad); apágalo para girar con el joystick.
   ===================================================================== */
const Bus = EM.modes.bus = {
  id: 'bus', name: 'Bus', sub: 'Metroplús y alimentadores', music: 'ciudad', fullCanvas: true, endless: false, camara: {},
  tip: '▲ acelera, ▼ frena. Para en cada parada (dentro de la zona), abre las puertas con ● para que suba la gente, ciérralas y sigue. Respeta los semáforos y no te pases de velocidad.',
  levels() {
    if (this._lv) return this._lv; const L = [];
    for (const line of NET.lines.filter(l => l.kind === 'brt')) { const n = line.st.length; for (let a = 0; a < n - 1; a += 4) { const b = Math.min(n - 1, a + 4); L.push({ id: 'bus:' + line.id + ':' + a + '-' + b, line: line.id, a, b, name: line.st[a].name + ' → ' + line.st[b].name, sub: line.name }); } L.push({ id: 'bus:' + line.id + ':0-' + (n - 1), line: line.id, a: 0, b: n - 1, name: 'Ruta completa', sub: line.name + ' · ' + n + ' estaciones', full: true }); L.push({ id: 'bus:' + line.id + ':' + (n - 1) + '-0', line: line.id, a: n - 1, b: 0, name: 'Ruta completa · regreso', sub: line.name, full: true }); }
    for (const line of NET.lines.filter(l => l.kind === 'feeder')) { const n = line.st.length; L.push({ id: 'bus:' + line.id + ':0-' + (n - 1), line: line.id, a: 0, b: n - 1, name: line.name.replace(/^Alimentador\s*/, ''), sub: 'Alimentador · ' + n + ' paradas · ' + line.km + ' km' }); }
    return (this._lv = L);
  },
  create(lv, opts) {
    Ciudad.init((opts.seed | 0) || 1); const L = this.levels().find(l => l.id === lv) || this.levels()[0], line = NET.byId[L.line], kind = line.kind === 'brt' ? 'metroplus' : 'alimentador', V = VEH[kind], rng = new RNG((opts.seed | 0) + 11);
    const dir = L.b >= L.a ? 1 : -1, stops = []; for (let i = L.a; dir > 0 ? i <= L.b : i >= L.b; i += dir) stops.push(i);
    const p0 = NET.at(line.P, line.st[L.a].s + dir * 2), h = p0.a + (dir < 0 ? Math.PI : 0);
    const st = { lvId: L.id, line: line.id, kind, veh: { kind, col: V.col }, mode: 'veh', dir, stops, ni: 1, x: p0.x, y: p0.y, h, vf: 0, vs: 0, steer: 0, hb: false, assist: opts.assist != null ? opts.assist : true, joy: { x: 0, y: 0, m: 0 }, keys: {}, t: 0, sR: line.st[L.a].s, off: 0,
      ph: 'ready', doors: 0, dwell: 0, pax: 4 + rng.i(0, 8), cap: kind === 'metroplus' ? 160 : 60, score: 0, comfort: 100, crashes: 0, reds: 0, peds: 0, arr: [], sched: [0], seed: opts.seed | 0, cam: { x: p0.x, y: p0.y, k: 1.6 }, far: false, shake: 0, done: false, win: false, auto: !!opts.auto, lastA: 0, redSeen: {}, waiting: {}, boarding: [], alight: 0, visited: {}, job: null, lastHub: null, flash: 0, over: 0 };
    st.stopS = stops.map(i => line.st[i].s);
    let acc = 0; for (let k = 1; k < stops.length; k++) { acc += Math.abs(st.stopS[k] - st.stopS[k - 1]) / (kind === 'metroplus' ? 6.5 : 5.2) + 18; st.sched.push(acc); }
    this.spawnStops(st, line, rng); return st;
  },
  V(st) { return VEH[st.veh.kind]; },
  stopPos(line, s, dir, kind) { const p = NET.at(line.P, s); const side = kind === 'metroplus' ? -1 : 1; return { x: p.x - Math.sin(p.a) * side * dir * 5.5, y: p.y + Math.cos(p.a) * side * dir * 5.5, a: p.a }; },
  spawnStops(st, line, rng) { for (let k = Math.max(1, st.ni); k < Math.min(st.stops.length, st.ni + 3); k++) { if (st.waiting[k]) continue; const q = this.stopPos(line, st.stopS[k], st.dir, st.kind), last = k === st.stops.length - 1; st.waiting[k] = Ciudad.spawnWaiting(k, q.x, q.y, last ? 0 : 2 + rng.i(0, st.kind === 'metroplus' ? 6 : 4)); } },
  /* piloto: sigue la ruta y regula la velocidad (asistente y bot) */
  pilot(st, dt) {
    const line = NET.byId[st.line], V = this.V(st), R = Volante.route(line), i = clamp(Math.round(st.sR / 8), 0, R.n - 1), j = clamp(Math.round((st.sR + st.dir * (18 + Math.abs(st.vf) * 2)) / 8), 0, R.n - 1);
    const Ld = 7 + Math.abs(st.vf) * .9, q = NET.at(line.P, clamp(st.sR + st.dir * Ld, 0, line.P.len)), dx = q.x - st.x, dy = q.y - st.y, al = Math.atan2(dy, dx) - st.h, a = Math.atan2(Math.sin(al), Math.cos(al));
    st.steerWant = clamp(Math.atan(2 * V.wb * Math.sin(a) / Math.max(4, Math.hypot(dx, dy))) / V.smax, -1, 1);
    if (!st.auto) return;
    let tgt = Math.min(V.vmax * .9, R.lim[i] * 1.1, R.lim[j] * 1.1); const dS = (st.stopS[st.ni] - st.sR) * st.dir, bm = V.brk * .5; tgt = Math.min(tgt, Math.sqrt(2 * bm * Math.max(0, dS - 2)));
    const red = this.redAhead(st); if (red != null) tgt = Math.min(tgt, Math.sqrt(2 * bm * Math.max(0, red - 5)));
    const car = this.carAhead(st); if (car != null) tgt = Math.min(tgt, Math.max(0, (car - 9) * .9));
    st.keys.up = st.vf < tgt - .4; st.keys.down = st.vf > tgt + .4 || (dS < 3 && st.vf > .2);
  },
  redAhead(st) { let best = null; const c = Math.cos(st.h), s = Math.sin(st.h); for (const g of TRAF.lights) { const dx = g.x - st.x, dy = g.y - st.y; if (Math.abs(dx) > 70 || Math.abs(dy) > 70) continue; const along = dx * c + dy * s, lat = Math.abs(-dx * s + dy * c); if (along < 4 || along > 60 || lat > 12) continue; const ax = Math.abs(c) > Math.abs(s) ? 0 : 1, ls = TRAF.state(g, st.t)[ax]; if (ls !== 'g' && (best == null || along < best)) best = along; } return best; },
  carAhead(st) { let best = null; const c = Math.cos(st.h), s = Math.sin(st.h); for (const k of Ciudad.cars) { const dx = k.x - st.x, dy = k.y - st.y, along = dx * c + dy * s, lat = Math.abs(-dx * s + dy * c); if (along > 0 && along < 40 && lat < 3) best = best == null ? along : Math.min(best, along); } return best; },
  step(st, dt) {
    if (st.done) return; st.t += dt; const line = NET.byId[st.line], V = this.V(st);
    this.pilot(st, dt);
    if (st.ph === 'ready' && (st.keys.up || st.joy.y < -.3)) { st.ph = 'run'; this.say(st, 'Próxima parada: ' + line.st[st.stops[1]].name); }
    if (st.ph === 'stop') { this.stopTick(st, dt, line); }
    else if (st.ph !== 'ready') {
      // asistente de carril: convierte el rumbo deseado en entrada de joystick
      if (st.assist) st.joy = { x: st.steerWant, y: st.joy.y, m: 1 };
      // el corredor de la ruta es transitable aunque la casilla de 20 m marque esquina de manzana (los buses largos no se traban al girar)
      if (!st.lane) st.lane = (x, y) => Volante.projLocal(line.P, x, y, st.sR).d < 7;
      const kd = st.keys.down; Libre.drive(st, dt); st.keys.down = kd;
      const pr = Volante.projLocal(line.P, st.x, st.y, st.sR); st.sR = pr.s; st.off = pr.d;
      if (st.off > 25 && !st._lost) { st._lost = 1; this.msg(st, 'Te saliste de la ruta: sigue la línea ' + (st.kind === 'metroplus' ? 'del carril exclusivo' : 'de la ruta'), 'y'); } else if (st.off < 12) st._lost = 0;
      // exceso de velocidad (60 km/h Metroplús, 50 alimentador) y semáforos
      if (Math.abs(st.vf) > V.vmax * .93) { st.over += dt; st.score -= 8 * dt; if (!st._ov) { st._ov = 1; this.msg(st, 'Exceso de velocidad', 'y'); this.sfx(st, 'warn'); } } else st._ov = 0;
      const c = Math.cos(st.h), s = Math.sin(st.h); for (const g of TRAF.lights) { if (st.redSeen[g.i] || Math.abs(g.x - st.x) > 60 || Math.abs(g.y - st.y) > 60) continue; const d = dist(g.x, g.y, st.x + c * V.wb, st.y + s * V.wb); if (d < 7 && st.vf > 2) { const ax = Math.abs(c) > Math.abs(s) ? 0 : 1, ls = TRAF.state(g, st.t)[ax]; st.redSeen[g.i] = 1; if (ls === 'r') { st.reds++; st.score -= 120; this.msg(st, '¡Semáforo en rojo! −120', 'r'); this.sfx(st, 'bad'); } } }
      // confort: aceleraciones bruscas y curvas rápidas
      const lat = st.vf * st.vf * Math.abs(Math.tan(st.steer)) / V.wb, a = (st.vf - (st._pv || st.vf)) / dt; st._pv = st.vf; if ((lat > 2.2 || Math.abs(a) > 2.8) && Math.abs(st.vf) > 1) st.comfort = Math.max(0, st.comfort - dt * 9);
      // llegada a la parada / parada perdida
      const dS = (st.stopS[st.ni] - st.sR) * st.dir;
      if (Math.abs(st.vf) < .3 && Math.abs(dS) <= 15 && st.off < 12) { st.ph = 'stop'; st.dwell = 0; st.doors = 0; st.vf = 0; st.keys.up = false; const err = Math.abs(dS), late = st.t - st.sched[st.ni], pP = err < 1.5 ? 300 : err < 4 ? 220 : err < 8 ? 140 : 60, pT = Math.abs(late) <= 12 ? 200 : Math.abs(late) <= 30 ? 120 : Math.abs(late) <= 60 ? 50 : 0; st.score += pP + pT; st.arr.push({ err, late }); this.sfx(st, pP >= 220 ? 'star' : 'ok'); this.msg(st, line.st[st.stops[st.ni]].name + ' · ' + err.toFixed(1) + ' m · ' + (late >= 0 ? '+' : '') + Math.round(late) + ' s' + (pP >= 220 ? ' ¡Bien!' : ''), pP >= 220 ? 'g' : 'y'); const f = NET.fact(line.st[st.stops[st.ni]].name); if (f) { this.msg(st, f, 'b'); Save.d.facts[line.st[st.stops[st.ni]].name] = 1; } }
      else if (dS < -45) { st.score -= 200; st.arr.push({ err: 99, late: 0 }); this.msg(st, 'Te pasaste la parada ' + line.st[st.stops[st.ni]].name + ' −200', 'r'); this.sfx(st, 'bad'); for (const p of st.waiting[st.ni] || []) { p.waitStop = null; p.wait = 1; Ciudad.say(p, '¡Oiga! ¡Se pasó!'); } if (st.ni < st.stops.length - 1) { st.ni++; this.spawnStops(st, line, Ciudad.rng); } else this.finish(st); }
    }
    Ciudad.tick(dt, { x: st.x, y: st.y, h: st.h, vf: st.vf, veh: V, onPed: p => { st.peds++; st.score -= 150; st.comfort = Math.max(0, st.comfort - 20); st.vf *= .4; this.msg(st, '¡Casi atropellas a alguien! −150', 'r'); this.sfx(st, 'bad'); vib(120); Ciudad.say(p, '¡Uy, cuidado!'); }, onCar: c => { if (Math.abs(st.vf) < 1) return; st.crashes++; st.score -= 120; st.comfort = Math.max(0, st.comfort - 12); st.vf *= .3; st.shake = .35; this.sfx(st, 'crash'); this.msg(st, 'Choque con un ' + (c.kind === 'moto' ? 'motociclista' : c.kind === 'taxi' ? 'taxi' : 'carro') + ' −120', 'r'); vib(100); } });
    if (st.shake > 0) st.shake -= dt;
    const kT = st.far ? .45 : st.ph === 'stop' ? 1.8 : lerp(1.75, 1.1, clamp(Math.abs(st.vf) / V.vmax, 0, 1)); st.cam.k += (kT - st.cam.k) * Math.min(1, dt * 2); const lead = 1.2 * st.vf + 6; st.cam.x += (st.x + Math.cos(st.h) * lead - st.cam.x) * Math.min(1, dt * 4); st.cam.y += (st.y + Math.sin(st.h) * lead - st.cam.y) * Math.min(1, dt * 4);
    st.job = { x: NET.at(line.P, st.stopS[Math.min(st.ni, st.stops.length - 1)]).x, y: NET.at(line.P, st.stopS[Math.min(st.ni, st.stops.length - 1)]).y };
  },
  doorPos(st) { const V = this.V(st), side = st.kind === 'metroplus' ? -1 : 1, c = Math.cos(st.h), s = Math.sin(st.h); return { x: st.x + c * V.len * .15 - Math.sin(st.h) * side * (V.wid / 2 + .6), y: st.y + s * V.len * .15 + Math.cos(st.h) * side * (V.wid / 2 + .6) }; },
  stopTick(st, dt, line) {
    st.dwell += dt; st.vf = 0; const W = st.waiting[st.ni] || [];
    if (st.doors === 1) {
      st.doorT += dt; const d = this.doorPos(st);
      if (st.alight > 0 && st.doorT > .6) { st.alight--; st.doorT = .15; st.pax--; const p = Ciudad.spawnWaiting(null, d.x, d.y, 1)[0]; p.waitStop = null; p.x = d.x; p.y = d.y; p.wait = 0; p.tgt = null; }
      else if (st.alight <= 0) { for (const p of W) if (!p.board && !p.gone) { if (st.doorT > .5) { if (!p.recarga && h2(st.ni, W.indexOf(p), st.seed + 7) < .07) { p.recarga = 1; st.doorT = -1.4; this.msg(st, 'Cívica sin saldo: el pasajero recarga…', 'y'); Ciudad.say(p, '¡Ay, sin saldo!'); this.sfx(st, 'bad'); } else { p.board = { x: d.x, y: d.y }; st.doorT = 0; } } break; } }
      const left = W.filter(p => !p.gone).length; st.pax = Math.min(st.cap, st.pax0 + (W.length - left));
      const nb = W.length - left; if (nb > (st.nb || 0)) { st.fares = (st.fares || 0) + nb - (st.nb || 0); st.nb = nb; this.sfx(st, 'beep'); }
      if (!left && st.alight <= 0 && !st.bell) { st.bell = 1; this.sfx(st, 'bell'); this.msg(st, 'Todos arriba · cierra las puertas', 'y'); }
      if (st.auto && !left && st.alight <= 0) this.doors(st);
    } else if (st.doors === 0 && st.auto && st.dwell > .5) this.doors(st);
    if (st.doors === 2 && (st.keys.up || st.joy.y < -.3 || st.auto)) { st.ph = 'run'; st.doors = 0; st.bell = 0; st.nb = 0; if (st.ni < st.stops.length - 1) { st.ni++; this.spawnStops(st, line, Ciudad.rng); this.say(st, 'Próxima parada: ' + line.st[st.stops[st.ni]].name); } }
  },
  doors(st) {
    if (st.ph !== 'stop') { this.msg(st, 'Las puertas solo abren en la parada', 'y'); return; } const line = NET.byId[st.line], last = st.ni === st.stops.length - 1;
    if (st.doors === 0) { st.doors = 1; st.doorT = 0; st.pax0 = st.pax; st.alight = last ? st.pax : Math.min(st.pax, 1 + ((hashStr(line.st[st.stops[st.ni]].name) + st.ni) % 4)); this.sfx(st, 'door'); vib(20); }
    else if (st.doors === 1) { const W = (st.waiting[st.ni] || []).filter(p => !p.gone && !p.board); if (W.length || st.alight > 0) { st.score -= 40; this.msg(st, 'Cerraste con gente subiendo −40', 'r'); for (const p of W) { p.waitStop = null; p.wait = 1; Ciudad.say(p, '¡Espere!'); } } st.doors = 2; this.sfx(st, 'door'); if (last) this.finish(st); }
  },
  finish(st) { if (st.done) return; st.done = true; st.win = st.arr.filter(a => a.err >= 99).length === 0; st.score += Math.round(st.comfort * 2); st.score = Math.max(0, Math.round(st.score)); Save.d.stats.km += st.sR / 1000; const B = Save.d.bus || (Save.d.bus = { done: {} }); if (st.win) B.done[st.line] = (B.done[st.line] || 0) + 1; },
  result(st) { const n = st.stops.length - 1, miss = st.arr.filter(a => a.err >= 99).length, ok = st.arr.filter(a => a.err < 99), avg = ok.length ? ok.reduce((a, b) => a + b.err, 0) / ok.length : 0, max = n * 500 + 200, line = NET.byId[st.line]; return { done: st.done, win: st.win, score: st.score, stars: st.done && st.win ? starsOf(st.score / max) : 0, fact: (line.facts || [])[st.seed % Math.max(1, (line.facts || []).length)] || '', lines: [['Paradas', (n - miss) + ' / ' + n], ['Pasajeros', st.pax + ' a bordo al final'], ['Pasajes Cívica', (st.fares || 0) + ' validados'], ['Precisión media', avg.toFixed(1) + ' m'], ['Confort', Math.round(st.comfort) + ' %'], ['Choques / rojos', st.crashes + ' / ' + st.reds], ['Asistente', st.assist ? 'encendido' : 'apagado (×1,25)']] }; },
  msg(st, t, c) { if (!EM.headless && Game.st === st) UI.gmsg(t, c); },
  say(st, t) { if (!st.auto && Game.st === st) Snd.say(t); },
  sfx(st, k) { if (!EM.headless && Game.st === st) Snd.play(k); },
  hud(st) { this.updCtl(st); const line = NET.byId[st.line], nx = line.st[st.stops[Math.min(st.ni, st.stops.length - 1)]], d = (st.stopS[st.ni] - st.sR) * st.dir; return [['', Math.round(Math.abs(st.vf) * 3.6) + ' km/h'], ['→', nx.name], ['', st.ph === 'stop' ? 'En la parada' : Math.round(Math.max(0, d)) + ' m'], ['👥', st.pax + (st.fares ? ' · 💳' + st.fares : '')], ['★', fmt(Math.max(0, st.score))]]; },
  mount(st, el) {
    el.innerHTML = `<div class="joyzone" id="bsJz"><div class="joy" id="bsJoy"><i></i></div></div>
      <div class="lbbtns"><button class="abtn big" id="bsDoor">⇆<small>puertas</small></button><button class="abtn acc" id="bsUp">▲</button><button class="abtn brk" id="bsDown">▼</button><button class="abtn hb" id="bsHorn">📯</button></div>
      <div class="vsel" id="bsView"><button id="bsAs">🛞</button><button id="bsZoom">🔎</button></div><div id="bsJob" class="jobbar"></div>`;
    const jz = $('#bsJz'), joy = $('#bsJoy'); let jid = null, jx = 0, jy = 0;
    jz.addEventListener('pointerdown', e => { jid = e.pointerId; jz.setPointerCapture(jid); const r = jz.getBoundingClientRect(); jx = e.clientX - r.left; jy = e.clientY - r.top; joy.style.left = jx + 'px'; joy.style.top = jy + 'px'; joy.classList.add('on'); Snd.init(); if (st.assist) { st.assist = false; this.msg(st, 'Asistente apagado: giras con el joystick (×1,25)', 'b'); } });
    jz.addEventListener('pointermove', e => { if (e.pointerId !== jid) return; const r = jz.getBoundingClientRect(), dx = e.clientX - r.left - jx, dy = e.clientY - r.top - jy, d = Math.hypot(dx, dy), R = 46, m = Math.min(1, d / R); st.joy = { x: d ? dx / d * m : 0, y: d ? dy / d * m : 0, m }; joy.firstChild.style.transform = 'translate(' + (dx / Math.max(1, d) * Math.min(d, R)) + 'px,' + (dy / Math.max(1, d) * Math.min(d, R)) + 'px)'; });
    const jend = e => { if (e.pointerId !== jid) return; jid = null; st.joy = { x: 0, y: 0, m: 0 }; joy.classList.remove('on'); joy.firstChild.style.transform = ''; }; jz.addEventListener('pointerup', jend); jz.addEventListener('pointercancel', jend);
    const hold = (id, key) => { const b = $(id), on = e => { e.preventDefault(); b.setPointerCapture && b.setPointerCapture(e.pointerId); st.keys[key] = true; b.classList.add('on'); Snd.init(); }, off = () => { st.keys[key] = false; b.classList.remove('on'); }; b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off); };
    hold('#bsUp', 'up'); hold('#bsDown', 'down');
    $('#bsDoor').onclick = () => this.doors(st); $('#bsHorn').onclick = () => { Snd.play('horn'); vib(30); for (const c of Ciudad.cars) if (dist(c.x, c.y, st.x, st.y) < 40) c.stop = Math.max(c.stop, .8); };
    $('#bsAs').onclick = () => { st.assist = !st.assist; this.msg(st, st.assist ? 'Asistente de carril encendido' : 'Asistente apagado: giras con el joystick (×1,25)', 'b'); }; $('#bsZoom').onclick = () => { st.far = !st.far; };
    this.updCtl(st);
  },
  updCtl(st) {
    if (EM.headless || Game.st !== st) return; const jb = $('#bsJob'); if (!jb) return; const line = NET.byId[st.line], nx = line.st[st.stops[Math.min(st.ni, st.stops.length - 1)]], d = (st.stopS[st.ni] - st.sR) * st.dir, late = st.t - st.sched[Math.min(st.ni, st.sched.length - 1)], W = (st.waiting[st.ni] || []).filter(p => !p.gone).length;
    jb.innerHTML = `<b>${st.ph === 'stop' ? (st.doors === 1 ? 'Puertas abiertas · suben ' + W : st.doors === 2 ? 'Puertas cerradas · ▲ para seguir' : 'En la parada · ● abre las puertas') : (st.ph === 'ready' ? '▲ para arrancar' : 'Próxima: ' + esc(nx.name))}</b><span>${st.ph === 'ready' ? esc(line.name) : (Math.round(Math.max(0, d)) + ' m · horario ' + (late >= 0 ? '+' : '') + Math.round(late) + ' s · ' + (st.ni) + '/' + (st.stops.length - 1))}</span><em>👥 ${st.pax}/${st.cap} · ☕ ${Math.round(st.comfort)} % · ${Mundo.chip()}</em>`;
    jb.className = 'jobbar' + (st.ph === 'stop' ? ' stop' : ''); $('#bsAs').classList.toggle('on', st.assist); const db = $('#bsDoor'); db.classList.toggle('hot', st.ph === 'stop' && st.doors !== 2); db.querySelector('small').textContent = st.doors === 1 ? 'cerrar' : 'puertas';
  },
  key(st, k, down) { const m = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' }[k]; if (m) { st.keys[m] = down; if ((m === 'left' || m === 'right') && down && st.assist) { st.assist = false; this.msg(st, 'Asistente apagado', 'b'); } if (!st.assist) st.joy = { x: (st.keys.right ? 1 : 0) - (st.keys.left ? 1 : 0), y: 0, m: 1 }; return; } if (!down) return; if (k === ' ' || k === 'e') this.doors(st); if (k === 'g') st.assist = !st.assist; if (k === 'z') st.far = !st.far; if (k === 'h' || k === 'q') Snd.play('horn'); },
  draw(g, st, vp) {
    const W = vp.w, H = vp.h, cw = ($('#gcv') || { clientWidth: W }).clientWidth || W, W_ = W, k = st.cam.k * CamUI.zoom(st) * (W / Math.max(1, cw)), L = Mundo.light(), night = L.night, sh = Ciudad.shadowDir(), line = NET.byId[st.line], V = this.V(st), co = CamUI.off(st); st._k = k * cw / W_;
    const shx = st.shake > 0 ? (Math.random() - .5) * 6 : 0, shy = st.shake > 0 ? (Math.random() - .5) * 6 : 0, mx = Math.round((st.cam.x + co.x) * k) / k, my = Math.round((st.cam.y + co.y) * k) / k, S = (x, y) => ({ x: W / 2 + (x - mx) * k + shx, y: H / 2 + (y - my) * k + shy }), x0 = mx - W / 2 / k, y0 = my - H / 2 / k, x1 = mx + W / 2 / k, y1 = my + H / 2 / k;
    g.fillStyle = '#3a6b45'; g.fillRect(0, 0, W, H); if (MAP.ready) { if (k < .3) { const m = MAP.mini(), s = k * MAP.miniK; g.imageSmoothingEnabled = false; g.drawImage(m, W / 2 - mx * k, H / 2 - my * k, m.width * s, m.height * s); } else MAP.drawTop(g, W, H, mx, my, k); } if (MAP.ready && k >= .3) MAP.drawLabels(g, W, H, mx, my, k, W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W), Mundo.light().night);
    // ruta: carril exclusivo o recorrido del alimentador
    g.strokeStyle = st.kind === 'metroplus' ? 'rgba(14,111,118,.45)' : line.color + '66'; g.lineWidth = (st.kind === 'metroplus' ? 7 : 5) * k; g.lineJoin = 'round'; g.beginPath(); let on = false; for (const p of line.P.pts) { if (p.x < x0 - 200 || p.x > x1 + 200 || p.y < y0 - 200 || p.y > y1 + 200) { on = false; continue; } const q = S(p.x, p.y); if (on) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); on = true; } g.stroke();
    if (st.kind === 'metroplus') { g.setLineDash([3 * k, 3 * k]); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = Math.max(1, .3 * k); g.stroke(); g.setLineDash([]); }
    Ciudad.landmarks(g, S, k, x0, y0, x1, y1); Ciudad.stations(g, S, k, x0, y0, x1, y1, VC.on ? 'piso' : null); Ciudad.marksDraw(g, S, k);
    // paradas de esta ruta: zona de parada, caseta y nombre
    for (let i = 0; i < st.stops.length; i++) { const s = st.stopS[i], q0 = this.stopPos(line, s, st.dir, st.kind), q = S(q0.x, q0.y); if (q.x < -80 || q.y < -80 || q.x > W + 80 || q.y > H + 80) continue; const cur = i === st.ni; g.save(); g.translate(q.x, q.y); g.rotate(q0.a); g.fillStyle = cur ? 'rgba(246,197,56,.35)' : 'rgba(255,255,255,.12)'; g.fillRect(-15 * k, -(st.kind === 'metroplus' ? 2 : 1) * k - 4.5 * k, 30 * k, 4 * k); g.fillStyle = PAL.negro; g.fillRect(-3 * k, -2.2 * k, 6 * k, 2.2 * k); g.fillStyle = cur ? PAL.mostaza : line.color; g.fillRect(-2.7 * k, -2 * k, 5.4 * k, 1.6 * k); g.restore(); const nm = line.st[st.stops[i]].name; g.font = '700 ' + Math.max(10, Math.min(15, k * 7)) + 'px Cuerpo, sans-serif'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(253,251,245,.92)'; g.strokeText(nm, q.x, q.y - 9 * k); g.fillStyle = cur ? '#8a5d00' : PAL.negro; g.fillText(nm, q.x, q.y - 9 * k); g.textAlign = 'left'; }
    Ciudad.transitDraw(g, S, k, sh, night, x0, y0, x1, y1, VC.on ? 'piso' : null); Ciudad.vendorsDraw(g, S, k, sh, x0, y0, x1, y1);
    // por niveles, como en Ciudad Libre: lo de abajo, los puentes con lo que va encima, el viaducto y los cables
    const ob = VC.ob, SZ = h => h ? (x, y) => S(x, y - h * ob) : S, altos = [];
    for (const c of Ciudad.cars) { const h = VC.PG ? VC.carAlto(c) : 0, Sc = SZ(h), f = () => Ciudad.car(g, c.x, c.y, c.a, c.kind === 'bus' ? 12 : c.kind === 'moto' ? 2 : 4.4, c.kind === 'moto' ? .8 : c.kind === 'bus' ? 2.5 : 1.8, c.col, c.kind, Sc, k, sh, night, true); if (h > .4) altos.push([c.z || 1, f]); else f(); }
    for (const p of Ciudad.peds) if (p.x > x0 - 5 && p.x < x1 + 5 && p.y > y0 - 5 && p.y < y1 + 5) Ciudad.ped(g, p, S, k, sh);
    // el bus del jugador (articulado: dos secciones), en el puente si su recorrido va por uno (tablero en la misma dirección)
    let bz = 0, bh = 0; if (VC.PG) { const P = VC.puenteEn(st.x, st.y, null, .5); if (P && !P.B.pe) { const u = VC.puAt(P.B, P.s); if (Math.abs(u.ux * Math.cos(st.h) + u.uy * Math.sin(st.h)) > .86) { bz = P.B.z; bh = P.h; } } }
    const Sb = SZ(bh), bus = () => { if (st.kind === 'metroplus') Ciudad.articulado(g, st.x + Math.cos(st.h) * 2.4, st.y + Math.sin(st.h) * 2.4, st.h, st.h2 == null ? st.h : st.h2, V, Sb, k, sh, night, true, { doors: 'left', sign: 1 }); else Ciudad.car(g, st.x + Math.cos(st.h) * 2.4, st.y + Math.sin(st.h) * 2.4, st.h, V.len, V.wid, V.col, 'feeder', Sb, k, sh, night, true, { doors: 'right', sign: 1 }); };
    if (bz) altos.push([bz, bus]); else bus();
    const nivelDib = z => { if (VC.PG) VC.puentesDib(g, S, k, x0, y0, x1, y1, z); for (const [lz, f] of altos) if (lz === z) f(); };
    nivelDib(1); if (VC.on) { Ciudad.stations(g, S, k, x0, y0, x1, y1, 'alto'); Ciudad.transitDraw(g, S, k, sh, night, x0, y0, x1, y1, 'alto'); } nivelDib(2); nivelDib(3);
    if (VC.on) { Ciudad.stations(g, S, k, x0, y0, x1, y1, 'cable'); Ciudad.transitDraw(g, S, k, sh, night, x0, y0, x1, y1, 'cable'); }
    if (st.doors === 1) { const d = this.doorPos(st), q = S(d.x, d.y); g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(q.x - 1.5 * k, q.y - 1.5 * k, 3 * k, 3 * k); }
    Ciudad.partsDraw(g, S, k); Ciudad.bubblesDraw(g, S, k);
    if (!EM.headless) { Mundo.overlay(g, W, H, st.t, { noGrain: true }); if (MAP.ready && k >= .3) MAP.lightsTop(g, night, st.t); Ciudad.streetLights(g, S, k, night, x0, y0, x1, y1, W, H); Mundo.grain(g, W, H); }
    // flecha hacia la próxima parada
    const J = st.job; if (J && st.ph !== 'stop') { const q = S(J.x, J.y), inside = q.x > 20 && q.x < W - 20 && q.y > 60 && q.y < H - 20; if (inside) { g.fillStyle = PAL.mostaza; g.beginPath(); g.moveTo(q.x, q.y - 22 * Math.max(.6, k * .5)); g.lineTo(q.x - 7, q.y - 34 * Math.max(.6, k * .5)); g.lineTo(q.x + 7, q.y - 34 * Math.max(.6, k * .5)); g.fill(); } else { const a = Math.atan2(J.y - st.y, J.x - st.x), cx = W / 2, cy = H / 2, r = Math.min(W, H) * .4; g.save(); g.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.rotate(a); g.fillStyle = PAL.mostaza; g.strokeStyle = PAL.negro; g.lineWidth = 2; g.beginPath(); g.moveTo(16, 0); g.lineTo(-10, -11); g.lineTo(-4, 0); g.lineTo(-10, 11); g.closePath(); g.fill(); g.stroke(); g.restore(); } }
    Libre.minimap(g, st, W, H);
    // velocímetro
    const dpr = W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W), R = 44 * dpr, cx = W * .5 - 16 * dpr, cy = H - 10 * dpr; g.fillStyle = 'rgba(16,46,80,.9)'; g.beginPath(); g.arc(cx, cy, R, Math.PI, TAU); g.fill(); g.strokeStyle = PAL.mante; g.lineWidth = 2 * dpr; g.stroke(); const an = Math.PI + Math.PI * clamp(Math.abs(st.vf) / V.vmax, 0, 1); g.strokeStyle = Math.abs(st.vf) > V.vmax * .93 ? PAL.rojo : '#fff'; g.lineWidth = 2.5 * dpr; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(an) * R * .8, cy + Math.sin(an) * R * .8); g.stroke(); g.textAlign = 'center'; g.fillStyle = '#fff'; g.font = '700 ' + (R * .4) + 'px Titulos, sans-serif'; g.fillText(Math.round(Math.abs(st.vf) * 3.6), cx, cy - R * .18); g.fillStyle = PAL.mante; g.font = '700 ' + (R * .16) + 'px Cuerpo, sans-serif'; g.fillText('KM/H · MÁX ' + Math.round(V.vmax * 3.6 * .93), cx, cy - R * .02); g.textAlign = 'left';
  },
  ai(st) { return null; }
};
