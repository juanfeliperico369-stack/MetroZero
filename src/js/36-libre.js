/* =====================================================================
   CIUDAD LIBRE · recorre el Valle de Aburrá a tu aire (vista cenital, de Caldas a Barbosa)
   A pie, en bici, moto, taxi, camioneta del Metro, alimentador o articulado; y de pasajero en
   el metro, el tranvía, los cables y los buses. Física arcade con derrape (freno de mano),
   tráfico y peatones vivos, día y noche, clima, y oficios que llegan por la radio.
   ===================================================================== */
const VEH = {
  taxi: { n: 'Taxi', len: 4.4, wid: 1.8, wb: 2.6, vmax: 100 / 3.6, acc: 3.4, brk: 7, smax: .62, srate: 2.4, grip: 6, col: '#f2c400', icon: '🚕', soft: 1 },
  moto: { n: 'Moto', len: 2.1, wid: .8, wb: 1.4, vmax: 115 / 3.6, acc: 4.2, brk: 7, smax: .7, srate: 3.2, grip: 7, col: '#EC343A', icon: '🏍', soft: 1, ciclo: 1 },
  camioneta: { n: 'Camioneta del Metro', len: 5.3, wid: 1.95, wb: 3.1, vmax: 95 / 3.6, acc: 2.9, brk: 6.5, smax: .58, srate: 2.1, grip: 5.5, col: '#1C5C9C', icon: '🛻', soft: 1, campo: 1 },
  bici: { n: 'Bici EnCicla', len: 1.8, wid: .6, wb: 1.05, vmax: 30 / 3.6, acc: 1.6, brk: 4, smax: .8, srate: 4, grip: 9, col: '#59AB42', icon: '🚲', soft: 1, ciclo: 1, walk: 1 },
  alimentador: { n: 'Bus alimentador', len: 12, wid: 2.5, wb: 6, vmax: 55 / 3.6, acc: 1.2, brk: 3, smax: .55, srate: 1.3, grip: 5, col: '#f4f1ea', icon: '🚐', soft: 0 },
  metroplus: { n: 'Articulado Metroplús', len: 18, wid: 2.55, wb: 6.5, vmax: 65 / 3.6, acc: 1.05, brk: 2.8, smax: .5, srate: 1.15, grip: 5, col: '#0E6F76', icon: '🚌', soft: 0 }
};
const SOLID_V = new Set([TT.MOUNT, TT.BRICK, TT.BLDG, TT.WATER, TT.CANAL, TT.LAND]), SOLID_W = new Set([TT.BRICK, TT.BLDG, TT.LAND, TT.WATER, TT.CANAL]);
Music.SONGS.ciudad = { bpm: 100, root: 55, sc: [0, 2, 3, 5, 7, 9, 10], prog: [0, 3, 4, 3], bass: [1, 0, 0, 1, 0, 0, 1, 0], mel: .4, w: 'triangle' };
const Libre = EM.modes.libre = {
  id: 'libre', name: 'Ciudad Libre', sub: 'Recorre el valle', music: 'ciudad', fullCanvas: true, endless: true,
  tip: 'Joystick a la izquierda para moverte. ● sirve para subirte a un vehículo o al metro, hablar o entregar. En carro: ▲ acelera, ▼ frena, ✋ freno de mano para derrapar. Los oficios llegan por la radio.',
  STARTS: ['San Antonio', 'Niquía', 'Acevedo', 'San Javier', 'Poblado', 'Envigado', 'Itagüí', 'Bello', 'Industriales', 'Parque Berrío', 'La Estrella', 'Santo Domingo Savio', 'Estadio', 'Caribe'],
  levels() { const L = [{ id: 'lb:trama', name: '📖 Historia en la ciudad', sub: 'La última vuelta, jugada en el mapa' }, { id: 'lb:ultimo', name: 'Donde quedé', sub: 'Sigue tu recorrido' }]; for (const n of this.STARTS) if (NET.stations.find(h => h.name === n)) L.push({ id: 'lb:' + n, name: n, sub: 'Empieza en la estación ' + n }); return L; },
  hub(name) { return NET.stations.find(h => h.name === name) || NET.stations[0]; },
  /* casilla transitable más cercana para parquear o aparecer */
  nearTile(x, y, ok, maxR = 8) { const tx = Math.floor(x / TM), ty = Math.floor(y / TM); for (let r = 0; r <= maxR; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; if (ok(MAP.tile(tx + dx, ty + dy))) return { x: (tx + dx + .5) * TM, y: (ty + dy + .5) * TM }; } return { x, y }; },
  create(lv, opts) {
    Ciudad.init((opts.seed | 0) || 1); const rng = new RNG((opts.seed | 0) + 3), sv = Save.d.libre || {};
    const trama = lv === 'lb:trama', T = trama ? Trama.save() : null, fresh = trama && !T.started; if (fresh) { T.started = 1; T.c = T.c || 0; T.s = T.s || 0; }
    let start; if ((lv === 'lb:ultimo' || (trama && !fresh)) && sv.x) start = { x: sv.x, y: sv.y }; else { const h = this.hub(trama ? 'Niquía' : lv.startsWith('lb:') ? lv.slice(3) : 'San Antonio'); start = this.nearTile(h.x, h.y, v => v === TT.WALK || v === TT.PLAZA || v === TT.STATION, 6); }
    const st = { lvId: lv, x: start.x, y: start.y, h: -Math.PI / 2, vf: 0, vs: 0, steer: 0, mode: 'walk', veh: null, ride: null, hb: false, run: false, joy: { x: 0, y: 0, m: 0 }, keys: {}, t: 0, dmg: 0, job: null, jobT: 18, jobs: 0, pay: 0, crashes: 0, peds: 0, km: 0, photos: [], visited: Object.assign({}, sv.visited || {}), cam: { x: start.x, y: start.y, k: 3 }, far: false, parked: [], msg: [], shake: 0, seed: opts.seed | 0, act: 0, actHold: 0, done: false, auto: !!opts.auto, radio: 0, lastHub: null, near: null, engine: 0 };
    // vehículos parqueados: taxis y bicis en las estaciones, camionetas en el taller de Bello, alimentadores en sus cabeceras, articulados en Metroplús
    const park = (kind, x, y, a) => { const p = this.nearTile(x, y, v => v === TT.ROAD || v === TT.AVE || v === TT.DEPOT || v === TT.WALK, 7); st.parked.push({ kind, x: p.x, y: p.y, a: a != null ? a : rng.f() * TAU, id: st.parked.length }); };
    for (const h of NET.stations) { if (!h.lines.some(l => l.kind === 'metro' || l.kind === 'tram')) continue; park('taxi', h.x + 30, h.y + 14); if (rng.f() < .7) park('bici', h.x - 24, h.y + 10); if (rng.f() < .25) park('moto', h.x + 18, h.y - 26); }
    const bello = this.hub('Bello'); park('camioneta', bello.x + 60, bello.y + 40); park('camioneta', bello.x - 50, bello.y + 70); const sa = this.hub('San Antonio'); park('camioneta', sa.x + 60, sa.y - 50);
    for (const l of NET.lines) { if (l.kind === 'feeder') park('alimentador', l.st[0].x, l.st[0].y, NET.at(l.P, 5).a); if (l.kind === 'brt') { park('metroplus', l.st[0].x, l.st[0].y, NET.at(l.P, 5).a); park('metroplus', l.st[l.st.length - 1].x, l.st[l.st.length - 1].y, NET.at(l.P, l.P.len - 5).a + Math.PI); } }
    if (sv.veh && (lv === 'lb:ultimo' || (trama && !fresh)) && VEH[sv.veh]) { st.parked = st.parked.filter(p => !(p.kind === sv.veh && dist(p.x, p.y, st.x, st.y) < 40)); st.veh = { kind: sv.veh, col: VEH[sv.veh].col, id: -1 }; st.mode = 'veh'; st.h = sv.h || st.h; }
    if (trama) Trama.init(st);
    return st;
  },
  V(st) { return st.veh ? VEH[st.veh.kind] : null; },
  /* ---------- oficios ---------- */
  offer(st) {
    const rng = Ciudad.rng, V = this.V(st), hubs = NET.stations.filter(h => h.lines.some(l => l.kind !== 'future')), pick = (mn, mx) => { const c = hubs.filter(h => { const d = dist(h.x, h.y, st.x, st.y); return d > mn && d < mx; }); return c.length ? rng.pick(c) : null; };
    let J = null;
    if (st.mode === 'veh' && st.veh.kind === 'taxi') { const c = Ciudad.peds.find(p => !p.client && !p.dog && dist(p.x, p.y, st.x, st.y) < 140 && dist(p.x, p.y, st.x, st.y) > 20); const d = pick(700, 3500); if (c && d) { c.client = true; c.tgt = null; c.wait = 99; Ciudad.say(c, '¡Taxi! ¡Taxi!'); J = { k: 'taxi', title: 'Un pasajero pide taxi', hint: 'Para junto a la persona que te llama y presiona ●', client: c, dest: d, stage: 0, pay: 0 }; } }
    else if (st.mode === 'veh' && st.veh.kind === 'camioneta') { const lines = NET.lines.filter(l => l.kind !== 'future' && l.kind !== 'escalator'), l = rng.pick(lines), s = rng.f() * l.P.len, p = NET.at(l.P, s), near = dist(p.x, p.y, st.x, st.y); if (near < 2600 && near > 200) J = { k: 'reparacion', title: 'Falla en ' + l.name, hint: 'Llega al punto marcado y mantén ● 3 s para repararla', x: p.x, y: p.y, name: l.name, limit: near / 7 + 70, pay: 120, stage: 0, hold: 0 }; }
    else if (st.mode === 'veh' && (st.veh.kind === 'alimentador' || st.veh.kind === 'metroplus')) { const line = NET.lines.find(l => (st.veh.kind === 'alimentador' ? l.kind === 'feeder' : l.kind === 'brt') && dist(l.st[0].x, l.st[0].y, st.x, st.y) < 120) || null; if (line) { J = { k: 'ruta', title: 'Ruta ' + line.name.replace(/^Alimentador\s*/, ''), hint: 'Para en cada parada (●) y lleva la gente a la estación', line, ni: 1, stops: line.st.length, pay: 0, stage: 0, limit: line.P.len / 5 + 60 * line.st.length }; } }
    if (!J && st.mode !== 'ride') { const r = rng.f(), d = pick(600, 2600);
      if (r < .3 && d) J = { k: 'encomienda', title: 'Encomienda para ' + d.name, hint: 'Lleva el paquete a la estación ' + d.name, x: d.x, y: d.y, name: d.name, limit: dist(d.x, d.y, st.x, st.y) / 7 + 80, pay: 40 + Math.round(dist(d.x, d.y, st.x, st.y) / 50), stage: 0 };
      else if (r < .55) { const far = pick(2200, 9000); if (far) J = { k: 'pasajero', title: 'Cita en ' + far.name, hint: 'Llega usando el metro, los cables o los buses (sin manejar)', x: far.x, y: far.y, name: far.name, limit: dist(far.x, far.y, st.x, st.y) / 6 + 150, pay: 60 + Math.round(dist(far.x, far.y, st.x, st.y) / 40), stage: 0 }; }
      else if (r < .8) { const L = Ciudad.lm.filter(l => !l.secret && dist(l.x, l.y, st.x, st.y) < 2400 && dist(l.x, l.y, st.x, st.y) > 150); if (L.length) { const l = rng.pick(L); J = { k: 'postal', title: 'Postal: ' + l.name, hint: 'Acércate y toma la foto con 📷', x: l.x, y: l.y, name: l.name, lm: l, limit: 240, pay: 60, stage: 0 }; } }
      else { const c = pick(300, 1300); if (c) J = { k: 'tinto', title: 'Un tinto para el conductor', hint: 'Llévalo caliente a la estación ' + c.name + ' (sin regarlo)', x: c.x, y: c.y, name: c.name, limit: dist(c.x, c.y, st.x, st.y) / 3 + 60, pay: 35, stage: 0 }; }
    }
    if (!J) return; J.t = 0; st.job = J; this.msg(st, '📻 ' + J.title + ' · ' + (J.pay ? '+' + J.pay + ' 🎫' : ''), 'b'); this.sfx(st, 'beep');
  },
  jobTick(st, dt) {
    const J = st.job; if (!J) { if (st.trama && Trama.active()) return; st.jobT -= dt; if (st.jobT <= 0) { st.jobT = 16 + Ciudad.rng.f() * 14; this.offer(st); } return; }
    J.t += dt; if (J.limit && J.t > J.limit) { this.fail(st, 'Se acabó el tiempo'); return; }
    if (J.k === 'taxi') { if (J.stage === 0) { if (!Ciudad.peds.includes(J.client)) { this.fail(st, 'El pasajero se fue'); return; } J.x = J.client.x; J.y = J.client.y; } else { J.x = J.dest.x; J.y = J.dest.y; if (dist(st.x, st.y, J.x, J.y) < 18 && Math.abs(st.vf) < .5) this.complete(st); } }
    else if (J.k === 'encomienda' || J.k === 'tinto') { if (dist(st.x, st.y, J.x, J.y) < 16 && Math.abs(st.vf) < 1) this.complete(st); }
    else if (J.k === 'pasajero') { if (dist(st.x, st.y, J.x, J.y) < 30 && st.mode !== 'veh') this.complete(st); }
    else if (J.k === 'reparacion') { if (dist(st.x, st.y, J.x, J.y) < 14 && Math.abs(st.vf) < .5 && st.act) { J.hold += dt; if (J.hold >= 3) this.complete(st); } else J.hold = Math.max(0, J.hold - dt); }
    else if (J.k === 'ruta') { const s = J.line.st[J.ni]; J.x = s.x; J.y = s.y; J.name = s.name; if (dist(st.x, st.y, s.x, s.y) < 16 && Math.abs(st.vf) < .5) { J.pay += 25; st.pay += 25; Save.d.wallet += 25; this.msg(st, 'Parada ' + s.name + ' +25 🎫', 'g'); this.sfx(st, 'coin'); for (let k = 0; k < 3; k++) Ciudad.parts.push({ x: st.x + (Math.random() - .5) * 6, y: st.y + (Math.random() - .5) * 6, vx: 0, vy: -2, t: 1, t0: 1, c: '#fff', r: .4 }); J.ni++; if (J.ni >= J.stops) this.complete(st); } }
  },
  complete(st) { const J = st.job; let pay = J.pay; if (J.k === 'taxi') { const d = dist(J.client.x0 || J.x, J.client.y0 || J.y, J.x, J.y); pay = 50 + Math.round(J.dist / 35) + (st.crashesJ ? 0 : 40); if (J.client) { J.client.client = false; J.client.wait = 1; J.client.x = st.x + 3; J.client.y = st.y + 3; Ciudad.peds.push(J.client); Ciudad.say(J.client, st.crashesJ ? 'Uy, qué susto' : '¡Gracias, muy amable!'); } }
    if (J.k === 'postal') { st.photos.push(J.name); const F = Save.d.fotos || (Save.d.fotos = []); if (!F.includes(J.name)) F.push(J.name); }
    if (J.k === 'ruta') pay = 60;
    st.jobs++; st.pay += pay; Save.d.wallet += pay; Save.d.libre.jobs = (Save.d.libre.jobs || 0) + 1; Save.write(); this.msg(st, '✓ ' + J.title + ' · +' + pay + ' 🎫', 'g'); this.sfx(st, 'star'); vib(40); st.job = null; st.jobT = 10; st.crashesJ = 0;
  },
  fail(st, why) { const J = st.job; if (J.k === 'taxi' && J.client) { J.client.client = false; J.client.wait = 1; if (J.stage === 1) { J.client.x = st.x + 3; J.client.y = st.y + 3; Ciudad.peds.push(J.client); } } this.msg(st, '✗ ' + J.title + ': ' + why, 'r'); this.sfx(st, 'bad'); st.job = null; st.jobT = 12; },
  /* ---------- acción (●) ---------- */
  action(st) {
    if (st.mode === 'ride') { const v = st.ride; if (v.ph === 'dwell' && v.st) { st.mode = 'walk'; st.ride = null; const t = this.nearTile(v.st.x + 8, v.st.y + 8, q => q === TT.WALK || q === TT.PLAZA || q === TT.STATION, 6); st.x = t.x; st.y = t.y; st.vf = 0; this.msg(st, 'Bajas en ' + v.st.name, 'b'); this.sfx(st, 'door'); } else this.msg(st, 'Espera a que pare en la estación', 'y'); return; }
    if (st.mode === 'veh') {
      const J = st.job; if (J && J.k === 'taxi' && J.stage === 0 && Math.abs(st.vf) < 1 && dist(st.x, st.y, J.client.x, J.client.y) < 7) { J.stage = 1; Ciudad.peds = Ciudad.peds.filter(p => p !== J.client); J.client.x0 = st.x; J.client.y0 = st.y; J.dist = dist(st.x, st.y, J.dest.x, J.dest.y); J.limit = J.t + J.dist / 8 + 50; J.title = 'Lleva al pasajero a ' + J.dest.name; J.hint = 'Sin choques y sin pasarte de velocidad'; this.msg(st, '«A ' + J.dest.name + ', por favor»', 'b'); this.sfx(st, 'door'); return; }
      if (Math.abs(st.vf) > 1.5) { this.msg(st, 'Frena primero para bajarte', 'y'); return; }
      const V = this.V(st); st.parked.push({ kind: st.veh.kind, x: st.x, y: st.y, a: st.h, id: st.parked.length }); st.veh = null; st.mode = 'walk'; st.vf = st.vs = 0; const t = this.nearTile(st.x - Math.sin(st.h) * (V.wid + 1.2), st.y + Math.cos(st.h) * (V.wid + 1.2), q => WALK_OK.has(q), 3); st.x = t.x; st.y = t.y; this.sfx(st, 'door'); if (st.job && st.job.k === 'ruta') this.fail(st, 'dejaste el bus'); if (st.job && st.job.k === 'taxi' && st.job.stage === 1) this.fail(st, 'dejaste al pasajero'); return;
    }
    // a pie: personaje de la historia, vehículo cercano, transporte en la estación, persona
    if (st.trama && Trama.onAction(st)) return;
    let best = null, bd = 4.5; for (const p of st.parked) { const d = dist(p.x, p.y, st.x, st.y); if (d < bd + VEH[p.kind].len / 2) { bd = d; best = p; } }
    if (best) { st.parked = st.parked.filter(p => p !== best); st.veh = { kind: best.kind, col: VEH[best.kind].col, id: best.id }; st.mode = 'veh'; st.x = best.x; st.y = best.y; st.h = best.a; st.vf = st.vs = 0; st.steer = 0; this.msg(st, VEH[best.kind].icon + ' ' + VEH[best.kind].n + (best.kind === 'bici' ? ' · pedalea con ▲' : ' · ▲ acelera · ✋ derrapa'), 'b'); this.sfx(st, 'door'); if (st.jobT > 4) st.jobT = 4; return; }
    const hub = this.nearHub(st, 34); if (hub) { const v = Ciudad.atHub(hub, st.x, st.y, st.trama ? Trama.wantLine(st) : null); if (v) { if (!Save.d.civica && Game.st === st && !st.auto && !EM.headless) { Save.d.civica = 1; Save.write(); UI.modal(`<div class="pag">Primera vez en el Metro</div><h2>Tu Cívica</h2><div class="civica"><i></i>Metro de Medellín</div><p>Para viajar se pasa la tarjeta <b>Cívica</b> por el torniquete. La personal es gratis en los puntos de atención y cobra la tarifa frecuente. Cada viaje descuenta un pasaje; los transbordos a cables y Metroplús no cobran de nuevo.</p><p class="m">En el juego cada viaje cuesta 1 🎫 y los cables integrados son gratis.</p><button class="btn pri" id="cvOk">Entendido · pasar la Cívica</button>`); $('#cvOk').onclick = () => UI.close(); }
      if (v.line.kind !== 'cable') { if (Save.d.wallet >= 1) { Save.d.wallet -= 1; } else this.msg(st, 'Sin saldo en la Cívica: haz un oficio para ganar pasajes (te dejan pasar esta vez)', 'y'); }
      st.mode = 'ride'; st.ride = v; st.vf = st.vs = 0; this.msg(st, 'Abordas ' + v.line.name + ' → ' + v.line.st[v.dir > 0 ? Math.min(v.ni + 1, v.line.st.length - 1) : Math.max(v.ni - 1, 0)].name, 'b'); this.sfx(st, 'bell'); return; } const coming = Ciudad.transit.find(t => t.line.st.some(s => s.hub === hub) && !t.line._far); this.msg(st, coming ? 'Espera en el andén: el ' + coming.line.K.label.toLowerCase() + ' viene en camino' : 'Aquí no para nada por ahora', 'y'); return; }
    const p = Ciudad.peds.find(p => dist(p.x, p.y, st.x, st.y) < 3); if (p) { p.wait = 2; if (p.dog) { Ciudad.say(p, '¡Guau! 🐾'); p.owner = p.owner || null; return; } Ciudad.say(p); if (st.job && st.job.hint && Ciudad.rng.f() < .4) setTimeout(() => Ciudad.say(p, st.job.hint.slice(0, 40)), 1200); return; }
    this.msg(st, 'Nada por aquí: busca una estación, un taxi o una bici', 'y');
  },
  nearHub(st, r) { let best = null, bd = r; for (const h of NET.stations) { const d = dist(h.x, h.y, st.x, st.y); if (d < bd) { bd = d; best = h; } } return best; },
  /* ---------- física ---------- */
  step(st, dt) {
    if (st.done) return; st.t += dt; const J = st.job;
    if (st.auto) { st.joy = { x: Math.sin(st.t * .3), y: -.8, m: 1 }; if (Math.floor(st.t) % 7 === 0 && !st._a) { st._a = 1; this.action(st); } else if (Math.floor(st.t) % 7) st._a = 0; }
    if (st.trama && st.trama.talk) { st.joy = { x: 0, y: 0, m: 0 }; st.keys.up = st.keys.down = false; }
    const ffOn = st.ff && (st.mode === 'ride' || !!this.nearHub(st, 70)); if (st.ff && !ffOn) st.ff = 0; const wdt = ffOn ? dt * 5 : dt;
    if (st.mode === 'ride') { const p = Ciudad.tpos(st.ride); st.x = p.x; st.y = p.y; st.h = p.a + (st.ride.dir < 0 ? Math.PI : 0); st.vf = st.ride.v || 0; const v = st.ride; if (v.ph === 'dwell' && v.st && st._lastSt !== v.st) { st._lastSt = v.st; st.visited[v.st.name] = 1; this.msg(st, '🚉 ' + v.st.name + ' · ● para bajarte', 'b'); if (NET.fact(v.st.name) && Ciudad.rng.f() < .5) this.msg(st, NET.fact(v.st.name), 'y'); } }
    else if (st.mode === 'veh') this.drive(st, dt);
    else this.walk(st, dt);
    Ciudad.tick(wdt, { x: st.x, y: st.y, h: st.h, vf: st.vf, veh: st.mode === 'veh' ? this.V(st) : null, onPed: p => { st.peds++; st.crashesJ = 1; Save.d.wallet = Math.max(0, Save.d.wallet - 30); st.vf *= .5; this.msg(st, '¡Casi atropellas a alguien! −30 🎫 · Cultura Metro: el peatón primero', 'r'); this.sfx(st, 'bad'); vib(120); Ciudad.say(p, '¡Uy, cuidado!'); }, onCar: c => { if (Math.abs(st.vf) < 1) return; st.crashes++; st.crashesJ = 1; st.dmg += Math.abs(st.vf); st.vf *= .3; st.shake = .35; this.sfx(st, 'crash'); this.msg(st, 'Choque con un ' + (c.kind === 'moto' ? 'motociclista' : c.kind === 'taxi' ? 'taxi' : c.kind === 'bus' ? 'bus' : 'carro'), 'r'); vib(100); } });
    this.jobTick(st, dt); if (st.trama) Trama.tick(st, dt); const hub = this.nearHub(st, 40); if (hub && hub !== st.lastHub) { st.lastHub = hub; st.visited[hub.name] = 1; }
    if (st.shake > 0) st.shake -= dt;
    // cámara: sigue al jugador con adelanto y zoom según la velocidad
    const V = this.V(st), kT = st.far ? .42 : st.mode === 'walk' ? 2.1 : st.mode === 'ride' ? (st.ride.line.kind === 'cable' ? 1.5 : 1.15) : st.veh.kind === 'bici' ? 1.8 : lerp(1.7, 1.05, clamp(Math.abs(st.vf) / V.vmax, 0, 1));
    st.cam.k += (kT - st.cam.k) * Math.min(1, dt * 2); const lead = st.mode === 'walk' ? 6 : 1.1 * st.vf; st.cam.x += (st.x + Math.cos(st.h) * lead - st.cam.x) * Math.min(1, dt * 4); st.cam.y += (st.y + Math.sin(st.h) * lead - st.cam.y) * Math.min(1, dt * 4);
    if ((st._sv = (st._sv || 0) + dt) > 5) { st._sv = 0; this.persist(st); }
  },
  walk(st, dt) {
    const j = st.joy, m = j.m > .15 ? 1 : 0; st.vf = 0;
    if (!m) return; const a = Math.atan2(j.y, j.x), tile = MAP.tileM(st.x, st.y), spd = (st.run ? 3.6 : 1.6) * (tile === TT.MOUNT ? .45 : tile === TT.GRASS ? .85 : tile === TT.STEPS ? .6 : 1) * clamp(j.m, .3, 1);
    st.h += Math.atan2(Math.sin(a - st.h), Math.cos(a - st.h)) * Math.min(1, dt * 10);
    const nx = st.x + Math.cos(a) * spd * dt, ny = st.y + Math.sin(a) * spd * dt; st.vf = spd;
    if (!SOLID_W.has(MAP.tileM(nx, ny))) { st.x = nx; st.y = ny; } else if (!SOLID_W.has(MAP.tileM(nx, st.y))) st.x = nx; else if (!SOLID_W.has(MAP.tileM(st.x, ny))) st.y = ny;
    st.km += spd * dt / 1000;
  },
  drive(st, dt) {
    const V = this.V(st), j = st.joy, k = st.keys, thr = k.up ? 1 : j.y < -.2 ? -j.y : 0, br = k.down ? 1 : j.y > .25 ? j.y : 0, sIn = k.left ? -1 : k.right ? 1 : Math.abs(j.x) > .12 ? j.x : 0;
    const spdF = clamp(Math.abs(st.vf) / V.vmax, 0, 1), target = sIn * V.smax * (1 - .55 * spdF); st.steer += clamp(target - st.steer, -V.srate * dt, V.srate * dt);
    const tile = MAP.tileM(st.x, st.y), soft = !(tile === TT.ROAD || tile === TT.AVE || tile === TT.AUTO || tile === TT.BRIDGE || tile === TT.DEPOT) && !(V.ciclo && tile === TT.CICLO), wet = Mundo.weather().rain;
    const c = Math.cos(st.h), s = Math.sin(st.h), gr = clamp((MAP.elevM(st.x + c * 8, st.y + s * 8) - MAP.elevM(st.x - c * 8, st.y - s * 8)) / 16, -.2, .2);
    if (thr > 0) { if (st.vf < -.3) st.vf = Math.min(0, st.vf + V.brk * dt); else st.vf += thr * V.acc * (1 - .55 * spdF) * dt * (soft && !V.campo ? .5 : 1); }
    if (br > 0) { if (st.vf > .3) st.vf = Math.max(0, st.vf - V.brk * br * dt); else st.vf = Math.max(-5, st.vf - V.acc * .6 * dt); }
    if (!thr && !br) st.vf -= Math.sign(st.vf) * Math.min(Math.abs(st.vf), (.4 + .003 * st.vf * st.vf + (soft ? 2.5 : 0)) * dt);
    st.vf -= 9.81 * gr * (V.walk ? .5 : .22) * dt; if (soft && !V.campo && Math.abs(st.vf) > 6) st.vf = Math.sign(st.vf) * 6; if (Math.abs(st.vf) > V.vmax * 1.05) st.vf = Math.sign(st.vf) * V.vmax * 1.05;
    // giro (modelo bicicleta) y derrape: la velocidad lateral se apaga según el agarre
    const hb = st.hb && !V.walk, rot = st.vf / V.wb * Math.tan(st.steer) * (hb ? 1.4 : 1) * dt, oh = st.h; st.h += rot;
    const vx = st.vf * Math.cos(oh) - st.vs * Math.sin(oh), vy = st.vf * Math.sin(oh) + st.vs * Math.cos(oh), c2 = Math.cos(st.h), s2 = Math.sin(st.h); st.vf = vx * c2 + vy * s2; st.vs = -vx * s2 + vy * c2;
    const grip = (hb ? 1.1 : V.grip) * (wet ? .6 : 1) * (soft ? .7 : 1); st.vs *= Math.exp(-grip * dt); if (hb) st.vf *= Math.exp(-.9 * dt);
    const drifting = Math.abs(st.vs) > 2.2 && Math.abs(st.vf) > 2; if (drifting || (hb && Math.abs(st.vf) > 3)) { for (const o of [-1, 1]) { const rx = st.x - c2 * V.len * .38 - s2 * o * V.wid * .42, ry = st.y - s2 * V.len * .38 + c2 * o * V.wid * .42; Ciudad.marks.push({ x1: rx, y1: ry, x2: rx - (vx * dt), y2: ry - (vy * dt), t: 1 }); } if (Ciudad.rng.f() < .5) Ciudad.parts.push({ x: st.x - c2 * V.len * .4, y: st.y - s2 * V.len * .4, vx: (Ciudad.rng.f() - .5) * 3, vy: (Ciudad.rng.f() - .5) * 3, t: .6, t0: .6, c: wet ? 'rgba(200,220,235,.8)' : 'rgba(190,180,160,.8)', r: .35 + Ciudad.rng.f() * .4 }); if (!st._drT) { st._drT = 1; this.sfx(st, 'brake'); } } else st._drT = 0;
    if (wet && Math.abs(st.vf) > 8 && Ciudad.rng.f() < .4) Ciudad.parts.push({ x: st.x - c2 * V.len * .3 + (Ciudad.rng.f() - .5) * V.wid, y: st.y - s2 * V.len * .3, vx: -vx * .1, vy: -vy * .1 - 1, t: .4, t0: .4, c: 'rgba(210,230,245,.9)', r: .2 });
    // movimiento y choques con lo sólido (esquinas del vehículo); desliza por paredes
    const nx = st.x + vx * dt, ny = st.y + vy * dt, hit = (x, y) => this.hitV(x, y, st.h, V) && !(st.lane && st.lane(x, y));
    if (!hit(nx, ny)) { st.x = nx; st.y = ny; } else if (!hit(nx, st.y)) { st.x = nx; st.vs *= .5; } else if (!hit(st.x, ny)) { st.y = ny; st.vs *= .5; } else { const imp = Math.abs(st.vf); st.vf *= -.2; st.vs *= .3; if (imp > 2) { st.crashes++; st.crashesJ = 1; st.dmg += imp; st.shake = .3; this.sfx(st, 'crash'); vib(80); this.msg(st, imp > 8 ? '¡Golpe duro!' : 'Golpe', 'r'); for (let q = 0; q < 6; q++) Ciudad.parts.push({ x: nx, y: ny, vx: (Ciudad.rng.f() - .5) * 8, vy: (Ciudad.rng.f() - .5) * 8, t: .5, t0: .5, c: '#fbe7b0', r: .3 }); } }
    st.km += Math.abs(st.vf) * dt / 1000; st.engine = thr;
  },
  hitV(x, y, h, V) { const c = Math.cos(h), s = Math.sin(h), l = V.len / 2, w = V.wid / 2; for (const [u, v] of [[l, w], [l, -w], [-l, w], [-l, -w], [0, 0]]) { const t = MAP.tileM(x + c * u - s * v, y + s * u + c * v); if (SOLID_V.has(t) && !(V.campo && t === TT.MOUNT)) return true; } return false; },
  persist(st) { const L = Save.d.libre || (Save.d.libre = {}); L.x = st.x; L.y = st.y; L.h = st.h; L.veh = st.mode === 'veh' ? st.veh.kind : null; L.visited = st.visited; L.km = (L.km || 0) + st.km; st.km = 0; Save.write(); },
  unmount(st) { this.persist(st); if (this._eng) { try { this._eng.g.gain.setTargetAtTime(0, Snd.ac.currentTime, .05); this._eng.o.stop(Snd.ac.currentTime + .2); } catch (e) { } this._eng = null; } },
  result(st) { return { done: false, win: false, score: st.pay, stars: 0, lines: [] }; },
  msg(st, t, c) { if (!EM.headless && Game.st === st) UI.gmsg(t, c); },
  sfx(st, k) { if (!EM.headless && Game.st === st) Snd.play(k); },
  hud(st) { this.updCtl(st); return [['🎫', fmt(Save.d.wallet)], ['', st.mode === 'veh' ? Math.round(Math.abs(st.vf) * 3.6) + ' km/h' : st.mode === 'ride' ? st.ride.line.id + ' · ' + Math.round(st.vf * 3.6) + ' km/h' : (MAP.ready ? (MAP.comunaAt(st.x, st.y) || MAP.muniAt(st.x, st.y)).replace(/^Comuna \d+ - /, '') : '')]]; },
  /* ---------- controles ---------- */
  mount(st, el) {
    el.innerHTML = `<div class="joyzone" id="lbJz"><div class="joy" id="lbJoy"><i></i></div></div>
      <div class="lbbtns"><button class="abtn big" id="lbAct">●<small>acción</small></button><button class="abtn acc" id="lbUp">▲</button><button class="abtn brk" id="lbDown">▼</button><button class="abtn hb" id="lbHb">✋</button></div>
      <div class="vsel" id="lbView"><button id="lbFoto" title="Foto">${Atlas.ico('ico_foto', '📷')}</button><button id="lbZoom" title="Acercar o alejar">${Atlas.ico('ico_lupa', '🔎')}</button><button id="lbRun" title="Correr">${Atlas.ico('ico_correr', '🏃')}</button><button id="lbFF" title="Adelantar el viaje">${Atlas.ico('ico_adelantar', '⏩')}</button></div><div id="lbJob" class="jobbar hide"></div><div id="trTalk" class="trtalk hide"></div>`;
    const jz = $('#lbJz'), joy = $('#lbJoy'); let jid = null, jx = 0, jy = 0;
    jz.addEventListener('pointerdown', e => { jid = e.pointerId; jz.setPointerCapture(jid); const r = jz.getBoundingClientRect(); jx = e.clientX - r.left; jy = e.clientY - r.top; joy.style.left = jx + 'px'; joy.style.top = jy + 'px'; joy.classList.add('on'); Snd.init(); });
    jz.addEventListener('pointermove', e => { if (e.pointerId !== jid) return; const r = jz.getBoundingClientRect(), dx = e.clientX - r.left - jx, dy = e.clientY - r.top - jy, d = Math.hypot(dx, dy), R = 46, m = Math.min(1, d / R); st.joy = { x: d ? dx / d * m : 0, y: d ? dy / d * m : 0, m }; joy.firstChild.style.transform = 'translate(' + (dx / Math.max(1, d) * Math.min(d, R)) + 'px,' + (dy / Math.max(1, d) * Math.min(d, R)) + 'px)'; });
    const jend = e => { if (e.pointerId !== jid) return; jid = null; st.joy = { x: 0, y: 0, m: 0 }; joy.classList.remove('on'); joy.firstChild.style.transform = ''; }; jz.addEventListener('pointerup', jend); jz.addEventListener('pointercancel', jend);
    const hold = (id, key, down, up) => { const b = $(id), on = e => { e.preventDefault(); b.setPointerCapture && b.setPointerCapture(e.pointerId); st.keys[key] = true; b.classList.add('on'); Snd.init(); if (down) down(); }, off = () => { st.keys[key] = false; b.classList.remove('on'); if (up) up(); }; b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off); };
    hold('#lbUp', 'up', () => { st.run = true; }, () => { st.run = false; }); hold('#lbDown', 'down'); hold('#lbHb', 'hb', () => { st.hb = true; }, () => { st.hb = false; });
    hold('#lbAct', 'act', () => { st.act = 1; this.action(st); }, () => { st.act = 0; });
    $('#lbFoto').onclick = () => this.photo(st); $('#lbZoom').onclick = () => { st.far = !st.far; }; $('#lbRun').onclick = () => { st.run = !st.run; $('#lbRun').classList.toggle('on', st.run); }; $('#lbFF').onclick = () => { st.ff = st.ff ? 0 : 1; this.msg(st, st.ff ? '⏩ Adelantando el viaje (×5)' : '▶ Tiempo normal', 'b'); };
    this.updCtl(st);
  },
  updCtl(st) {
    if (EM.headless || Game.st !== st) return; const jb = $('#lbJob'); if (!jb) return; const J = st.goal ? null : st.job;
    if (st.goal) { const G = st.goal, d = dist(st.x, st.y, G.x, G.y); jb.className = 'jobbar trama'; jb.innerHTML = `<b>📖 ${esc(G.title)}</b><span>${esc(G.hint)}</span><em>${d < 1000 ? Math.round(d) + ' m' : (d / 1000).toFixed(1) + ' km'}</em>`; }
    const ff = $('#lbFF'); if (ff) { ff.style.display = st.mode === 'ride' || this.nearHub(st, 70) ? '' : 'none'; ff.classList.toggle('on', !!st.ff); }
    if (J) { const left = J.limit ? Math.max(0, J.limit - J.t) : 0, d = J.x != null ? dist(st.x, st.y, J.x, J.y) : 0; jb.classList.remove('hide'); jb.innerHTML = `<b>${esc(J.title)}</b><span>${esc(J.hint || '')}</span><em>${d ? (d < 1000 ? Math.round(d) + ' m' : (d / 1000).toFixed(1) + ' km') : ''}${J.limit ? ' · ⏱ ' + pad2(Math.floor(left / 60)) + ':' + pad2(Math.floor(left % 60)) : ''}${J.k === 'reparacion' && J.hold ? ' · reparando ' + Math.round(J.hold / 3 * 100) + '%' : ''}</em>`; jb.className = 'jobbar' + (J.limit && left < 20 ? ' low' : ''); } else if (!st.goal) jb.classList.add('hide');
    const veh = st.mode === 'veh'; $('#lbUp').textContent = veh ? '▲' : '🏃'; $('#lbDown').style.visibility = veh ? '' : 'hidden'; $('#lbHb').style.visibility = veh && !this.V(st).walk ? '' : 'hidden';
    const a = $('#lbAct'); let lbl = 'acción'; if (st.mode === 'ride') lbl = st.ride.ph === 'dwell' ? 'bajar' : 'viajando'; else if (veh) lbl = (st.job && st.job.k === 'taxi' && st.job.stage === 0 && dist(st.x, st.y, st.job.client.x, st.job.client.y) < 9) ? 'recoger' : 'bajarse'; else { const p = st.parked.find(p => dist(p.x, p.y, st.x, st.y) < 4.5 + VEH[p.kind].len / 2); if (p) lbl = VEH[p.kind].icon + ' subir'; else if (this.nearHub(st, 34)) lbl = 'abordar'; else if (Ciudad.peds.some(p => dist(p.x, p.y, st.x, st.y) < 3)) lbl = 'hablar'; }
    a.querySelector('small').textContent = lbl; a.classList.toggle('hot', lbl !== 'acción' && lbl !== 'viajando' && lbl !== 'bajarse');
    // motor (zumbido según la velocidad)
    if (Snd.ac && Save.d.settings.snd) { if (veh && !this.V(st).walk) { if (!this._eng) { const o = Snd.ac.createOscillator(), g = Snd.ac.createGain(); o.type = 'sawtooth'; g.gain.value = 0; o.connect(g); g.connect(Snd.sfxG); o.start(); this._eng = { o, g }; } const f = 40 + Math.abs(st.vf) * 7 + st.engine * 25; this._eng.o.frequency.setTargetAtTime(f, Snd.ac.currentTime, .08); this._eng.g.gain.setTargetAtTime(.025 + .02 * st.engine, Snd.ac.currentTime, .1); } else if (this._eng) this._eng.g.gain.setTargetAtTime(0, Snd.ac.currentTime, .1); }
  },
  photo(st) { if (st.trama && Trama.onPhoto(st)) return; const J = st.job; if (J && J.k === 'postal' && dist(st.x, st.y, J.x, J.y) < 70) { st.flash = .4; this.complete(st); return; } const L = Ciudad.lm.find(l => dist(l.x, l.y, st.x, st.y) < 70); st.flash = .4; this.sfx(st, 'ok'); if (L) { const F = Save.d.fotos || (Save.d.fotos = []); if (!F.includes(L.name)) { F.push(L.name); Save.d.wallet += 20; this.msg(st, '📷 ' + L.name + ' · nueva postal +20 🎫', 'g'); this.msg(st, L.fact, 'y'); Save.write(); } else this.msg(st, '📷 ' + L.name, 'b'); } else this.msg(st, '📷 Foto del valle', 'b'); },
  key(st, k, down) { const m = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ' ': 'hb', Shift: 'run' }[k]; if (m) { st.keys[m] = down; if (m === 'hb') st.hb = down; if (m === 'run') st.run = down; const kx = (st.keys.right ? 1 : 0) - (st.keys.left ? 1 : 0), ky = (st.keys.down ? 1 : 0) - (st.keys.up ? 1 : 0); if (st.mode !== 'veh') st.joy = { x: kx, y: ky, m: Math.min(1, Math.hypot(kx, ky)) }; else st.joy = { x: 0, y: 0, m: 0 }; return; } if (!down) return; if (k === 'e' || k === 'Enter') { st.act = 1; this.action(st); setTimeout(() => { st.act = 0; }, 3500); } if (k === 'f') this.photo(st); if (k === 'z') st.far = !st.far; if (k === 'h' || k === 'q') { Snd.play('horn'); for (const c of Ciudad.cars) if (dist(c.x, c.y, st.x, st.y) < 40) c.stop = Math.max(c.stop, .8); } },
  /* ---------- dibujo ---------- */
  draw(g, st, vp) {
    const W = vp.w, H = vp.h, k = st.cam.k * (W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W)), L = Mundo.light(), night = L.night, sh = Ciudad.shadowDir();
    const shx = st.shake > 0 ? (Math.random() - .5) * 6 : 0, shy = st.shake > 0 ? (Math.random() - .5) * 6 : 0, mx = st.cam.x, my = st.cam.y, S = (x, y) => ({ x: W / 2 + (x - mx) * k + shx, y: H / 2 + (y - my) * k + shy }), x0 = mx - W / 2 / k, y0 = my - H / 2 / k, x1 = mx + W / 2 / k, y1 = my + H / 2 / k;
    g.fillStyle = '#3a6b45'; g.fillRect(0, 0, W, H); if (MAP.ready) { if (k < .3) { const m = MAP.mini(), s = k * MAP.miniK; g.imageSmoothingEnabled = false; g.drawImage(m, W / 2 - mx * k, H / 2 - my * k, m.width * s, m.height * s); } else MAP.drawTop(g, W, H, mx, my, k); }
    Ciudad.landmarks(g, S, k, x0, y0, x1, y1); Ciudad.stations(g, S, k, x0, y0, x1, y1); Ciudad.marksDraw(g, S, k);
    // vehículos parqueados
    for (const p of st.parked) { if (p.x < x0 - 20 || p.x > x1 + 20 || p.y < y0 - 20 || p.y > y1 + 20) continue; const V = VEH[p.kind]; if (p.kind === 'bici') { const q = S(p.x, p.y); g.save(); g.translate(q.x, q.y); g.rotate(p.a); g.fillStyle = PAL.negro; g.fillRect(-1.1 * k, -.5 * k, 2.2 * k, 1 * k); g.fillStyle = V.col; g.fillRect(-.9 * k, -.3 * k, 1.8 * k, .6 * k); g.restore(); } else Ciudad.car(g, p.x, p.y, p.a, V.len, V.wid, V.col, p.kind === 'alimentador' ? 'feeder' : p.kind === 'metroplus' ? 'brt' : p.kind === 'moto' ? 'moto' : 'car', S, k, sh, night, false); }
    Ciudad.transitDraw(g, S, k, sh, night, x0, y0, x1, y1);
    for (const c of Ciudad.cars) Ciudad.car(g, c.x, c.y, c.a, c.kind === 'bus' ? 12 : c.kind === 'moto' ? 2 : 4.4, c.kind === 'moto' ? .8 : c.kind === 'bus' ? 2.5 : 1.8, c.col, c.kind, S, k, sh, night, true);
    for (const p of Ciudad.peds) if (p.x > x0 - 5 && p.x < x1 + 5 && p.y > y0 - 5 && p.y < y1 + 5) { Ciudad.ped(g, p, S, k, sh); if (p.client) { const q = S(p.x, p.y); g.fillStyle = PAL.mostaza; g.strokeStyle = PAL.negro; g.lineWidth = 1.5; g.beginPath(); g.arc(q.x, q.y - 12 * Math.max(.6, k * .4) - 6, 7, 0, TAU); g.fill(); g.stroke(); g.fillStyle = PAL.negro; g.font = '700 11px Cuerpo, sans-serif'; g.textAlign = 'center'; g.fillText('!', q.x, q.y - 12 * Math.max(.6, k * .4) - 2); g.textAlign = 'left'; } }
    if (st.trama) Trama.draw(g, st, S, k, sh);
    // jugador
    if (st.mode === 'veh') { const V = this.V(st); if (st.veh.kind === 'bici') { const q = S(st.x, st.y); g.save(); g.translate(q.x, q.y); g.rotate(st.h); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-1 * k + sh.dx * k, -.4 * k + sh.dy * k, 2 * k, .8 * k); g.fillStyle = PAL.negro; g.fillRect(-1.1 * k, -.45 * k, 2.2 * k, .9 * k); g.fillStyle = V.col; g.fillRect(-.9 * k, -.25 * k, 1.8 * k, .5 * k); g.restore(); Ciudad.ped(g, { x: st.x, y: st.y, a: st.h, ph: st.t * 8, col: '#1C5C9C', skin: SKIN[1], seed: 7, stun: 0 }, S, k, sh); } else Ciudad.car(g, st.x, st.y, st.h, V.len, V.wid, V.col, st.veh.kind === 'alimentador' ? 'feeder' : st.veh.kind === 'metroplus' ? 'brt' : st.veh.kind === 'moto' ? 'moto' : 'car', S, k, sh, night, true); }
    if (st.mode !== 'ride') { const q = S(st.x, st.y); g.strokeStyle = 'rgba(251,231,176,.9)'; g.lineWidth = 2; g.beginPath(); g.arc(q.x, q.y, (st.mode === 'veh' ? this.V(st).len * .7 : 2.2) * k, 0, TAU); g.stroke(); }
    if (st.mode === 'walk') Ciudad.ped(g, { x: st.x, y: st.y, a: st.h, ph: st.t * (st.run ? 14 : 8) * (st.joy.m > .15 ? 1 : 0), col: '#1C5C9C', skin: SKIN[1], seed: 7, stun: 0, umb: L.w.rain }, S, k, sh);
    Ciudad.partsDraw(g, S, k); Ciudad.bubblesDraw(g, S, k);
    // noche, luces y clima
    if (!EM.headless) { Mundo.overlay(g, W, H, st.t, { noRain: false, noGrain: true }); if (MAP.ready && k >= .3) MAP.lightsTop(g, night, st.t); Ciudad.streetLights(g, S, k, night, x0, y0, x1, y1, W, H); if (night > .3 && st.mode === 'veh') { const q = S(st.x, st.y); g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(q.x, q.y, 0, q.x, q.y, 30 * k); gr.addColorStop(0, 'rgba(255,240,200,' + (.18 * night) + ')'); gr.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gr; g.fillRect(q.x - 30 * k, q.y - 30 * k, 60 * k, 60 * k); g.restore(); } Mundo.grain(g, W, H); }
    // objetivo: flecha al borde y marcador (la historia tiene prioridad sobre los oficios)
    const J = st.goal || st.job; if (J && J.x != null) { const q = S(J.x, J.y), inside = q.x > 20 && q.x < W - 20 && q.y > 60 && q.y < H - 20; if (inside) { g.strokeStyle = PAL.mostaza; g.lineWidth = 3; g.beginPath(); g.arc(q.x, q.y, 10 + 4 * Math.sin(st.t * 5), 0, TAU); g.stroke(); g.fillStyle = PAL.mostaza; g.beginPath(); g.moveTo(q.x, q.y - 26); g.lineTo(q.x - 7, q.y - 38); g.lineTo(q.x + 7, q.y - 38); g.fill(); } else { const a = Math.atan2(J.y - st.y, J.x - st.x), cx = W / 2, cy = H / 2, r = Math.min(W, H) * .4, ax = cx + Math.cos(a) * r, ay = cy + Math.sin(a) * r; g.save(); g.translate(ax, ay); g.rotate(a); g.fillStyle = PAL.mostaza; g.strokeStyle = PAL.negro; g.lineWidth = 2; g.beginPath(); g.moveTo(16, 0); g.lineTo(-10, -11); g.lineTo(-4, 0); g.lineTo(-10, 11); g.closePath(); g.fill(); g.stroke(); g.restore(); } }
    if (st.flash > 0) { st.flash -= .016; g.fillStyle = 'rgba(255,255,255,' + st.flash * 2 + ')'; g.fillRect(0, 0, W, H); }
    this.minimap(g, st, W, H);
  },
  minimap(g, st, W, H) {
    const dpr = W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W), R = 58 * dpr, cx = R + 12 * dpr, cy = H - R - 12 * dpr, km = st.far ? 1 / 90 : 1 / 45;
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.clip(); g.fillStyle = PAL.noche; g.fillRect(cx - R, cy - R, R * 2, R * 2);
    if (MAP.ready) { const m = MAP.mini(), s = km * MAP.miniK * dpr; g.imageSmoothingEnabled = true; g.drawImage(m, cx - st.x * km * dpr, cy - st.y * km * dpr, m.width * s, m.height * s); }
    const S = (x, y) => ({ x: cx + (x - st.x) * km * dpr, y: cy + (y - st.y) * km * dpr });
    for (const l of NET.lines) { if (l.kind === 'future' || l.kind === 'feeder') continue; g.strokeStyle = l.color; g.lineWidth = (l.kind === 'metro' ? 3 : 1.5) * dpr; g.beginPath(); l.P.pts.forEach((p, i) => { const q = S(p.x, p.y); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }); g.stroke(); }
    for (const h of NET.stations) { if (!h.lines.some(l => l.kind === 'metro' || l.kind === 'tram' || l.kind === 'cable')) continue; const q = S(h.x, h.y); if (Math.hypot(q.x - cx, q.y - cy) > R) continue; g.fillStyle = st.visited[h.name] ? '#fff' : 'rgba(255,255,255,.45)'; g.fillRect(q.x - 1.5 * dpr, q.y - 1.5 * dpr, 3 * dpr, 3 * dpr); }
    const GJ = st.goal || st.job; if (GJ && GJ.x != null) { const q = S(GJ.x, GJ.y), d = Math.hypot(q.x - cx, q.y - cy), f = d > R - 6 ? (R - 6) / d : 1; g.fillStyle = PAL.mostaza; g.beginPath(); g.arc(cx + (q.x - cx) * f, cy + (q.y - cy) * f, 4 * dpr, 0, TAU); g.fill(); }
    g.save(); g.translate(cx, cy); g.rotate(st.h); g.fillStyle = PAL.naranja; g.strokeStyle = PAL.negro; g.lineWidth = 1.5; g.beginPath(); g.moveTo(7 * dpr, 0); g.lineTo(-5 * dpr, -5 * dpr); g.lineTo(-5 * dpr, 5 * dpr); g.closePath(); g.fill(); g.stroke(); g.restore();
    g.restore(); g.strokeStyle = PAL.negro; g.lineWidth = 3 * dpr; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.stroke(); g.strokeStyle = PAL.mante; g.lineWidth = 1.5 * dpr; g.stroke();
    g.fillStyle = PAL.mante; g.font = '800 ' + (9 * dpr) + 'px Cuerpo, sans-serif'; g.textAlign = 'center'; g.fillText('N', cx, cy - R + 11 * dpr); g.textAlign = 'left';
  },
  ai(st) { return null; }
};
