/* =====================================================================
   CIUDAD LIBRE · recorre el Valle de Aburrá a tu aire (vista cenital, de Caldas a Barbosa)
   A pie, en bici, moto, taxi, camioneta del Metro, alimentador o articulado; y de pasajero en
   el metro, el tranvía, los cables y los buses. Física arcade con derrape (freno de mano),
   tráfico y peatones vivos, día y noche, clima, y oficios que llegan por la radio.
   ===================================================================== */
const VEH = {
  taxi: { n: 'Taxi', len: 4.4, wid: 1.8, wb: 2.6, vmax: 100 / 3.6, acc: 3.4, brk: 7, smax: .62, srate: 2.4, grip: 6, lat: 8.5, col: '#f2c400', icon: '🚕', soft: 1 },
  moto: { n: 'Moto', len: 2.1, wid: .8, wb: 1.4, vmax: 115 / 3.6, acc: 4.2, brk: 7, smax: .7, srate: 3.2, grip: 7, lat: 9.5, col: '#EC343A', icon: '🏍', soft: 1, ciclo: 1 },
  camioneta: { n: 'Camioneta del Metro', len: 5.3, wid: 1.95, wb: 3.1, vmax: 95 / 3.6, acc: 2.9, brk: 6.5, smax: .58, srate: 2.1, grip: 5.5, lat: 7.5, col: '#1C5C9C', icon: '🛻', soft: 1, campo: 1 },
  bici: { n: 'Bici EnCicla', len: 1.8, wid: .6, wb: 1.05, vmax: 30 / 3.6, acc: 1.6, brk: 4, smax: .8, srate: 4, grip: 9, lat: 5.5, col: '#9bd341', icon: '🚲', soft: 1, ciclo: 1, walk: 1 },
  alimentador: { n: 'Bus alimentador', len: 12, wid: 2.5, wb: 6, vmax: 55 / 3.6, acc: 1.2, brk: 3, smax: .55, srate: 1.3, grip: 5, lat: 4.2, col: '#f4f1ea', icon: '🚐', soft: 0 },
  metroplus: { n: 'Articulado Metroplús', len: 18, wid: 2.55, wb: 6.5, vmax: 65 / 3.6, acc: 1.05, brk: 2.8, smax: .5, srate: 1.15, grip: 5, lat: 3.8, art: 5.6, col: '#0E6F76', icon: '🚌', soft: 0 }
};
const SOLID_V = new Set([TT.MOUNT, TT.BRICK, TT.BLDG, TT.WATER, TT.CANAL, TT.LAND]), SOLID_W = new Set([TT.BRICK, TT.BLDG, TT.LAND, TT.WATER, TT.CANAL]);
Music.SONGS.ciudad = { bpm: 100, root: 55, sc: [0, 2, 3, 5, 7, 9, 10], prog: [0, 3, 4, 3], bass: [1, 0, 0, 1, 0, 0, 1, 0], mel: .4, w: 'triangle' };
const Libre = EM.modes.libre = {
  id: 'libre', name: 'Ciudad Libre', sub: 'Recorre el valle', music: 'ciudad', fullCanvas: true, endless: true,
  tip: 'Joystick a la izquierda: a pie y en «manejo fácil» apunta hacia donde quieres ir, y el vehículo gira hacia allá con su radio de giro (en «clásico», los lados giran y arriba acelera). ● sirve para subirte a un vehículo o al metro, hablar con la gente o entregar. ▼ frena y ✋ derrapa. ⏩ elige el ritmo: ×1, ×1,5 o ×2 (en metro y cable, hasta ×6). 🎥 suelta la cámara: arrastra para mirar, pellizca para acercar y 📐 cambia el ángulo. 📍 te muestra qué ver cerca y 🆘 te rescata si te pierdes.',
  substeps: true,
  RITMOS: [['×1', 1, 1], ['×1,5', 1.5, 3], ['×2', 2, 6]],   // [rótulo, a pie y manejando, en metro, cable, tranvía o bus]
  escala(st) { const R = this.RITMOS[clamp(Save.d.settings.ritmo | 0, 0, 2)]; return st.mode === 'ride' ? R[2] : R[1]; },
  STARTS: ['San Antonio', 'Niquía', 'Acevedo', 'San Javier', 'Poblado', 'Envigado', 'Itagüí', 'Bello', 'Industriales', 'Parque Berrío', 'La Estrella', 'Santo Domingo Savio', 'Estadio', 'Caribe'],
  levels() { const L = [{ id: 'lb:trama', name: '📖 Historia en la ciudad', sub: 'La última vuelta, jugada en el mapa' }, { id: 'lb:ultimo', name: 'Donde quedé', sub: 'Sigue tu recorrido' }]; for (const n of this.STARTS) if (NET.stations.find(h => h.name === n)) L.push({ id: 'lb:' + n, name: n, sub: 'Empieza en la estación ' + n }); return L; },
  hub(name) { return NET.stations.find(h => h.name === name) || NET.stations[0]; },
  /* casilla transitable más cercana para parquear o aparecer */
  /* punto libre para el jugador (con la ciudad vectorial, fuera de edificios y agua) */
  libre(x, y, ok, maxR = 8) { return VC.on ? VC.despeja(x, y, .6, false, maxR * TM) : this.nearTile(x, y, ok, maxR); },
  /* carros, bicis y anclajes de EnCicla se acomodan fuera de los edificios cuando el jugador se acerca (sin generar todo el valle al empezar) */
  acomoda(st) {
    if (!VC.on || (st._ac = (st._ac || 0) + 1) % 15) return;
    st.docks.forEach((D, i) => { if (D.ok || dist(D.x, D.y, st.x, st.y) > 320) return; const q = VC.despeja(D.x, D.y, 2.2), dx = q.x - D.x, dy = q.y - D.y; D.x = q.x; D.y = q.y; D.ok = 1; for (const p of st.parked) if (p.dock === i && !p.ok) { p.x += dx; p.y += dy; p.ok = 1; } });
    for (const p of st.parked) { if (p.ok || dist(p.x, p.y, st.x, st.y) > 320) continue; const q = VC.despeja(p.x, p.y, p.kind === 'bici' ? .5 : 1.4, p.kind !== 'bici'); p.x = q.x; p.y = q.y; p.ok = 1; }
  },
  nearTile(x, y, ok, maxR = 8) { const tx = Math.floor(x / TM), ty = Math.floor(y / TM); for (let r = 0; r <= maxR; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; if (ok(MAP.tile(tx + dx, ty + dy))) return { x: (tx + dx + .5) * TM, y: (ty + dy + .5) * TM }; } return { x, y }; },
  create(lv, opts) {
    Ciudad.init((opts.seed | 0) || 1); const rng = new RNG((opts.seed | 0) + 3), sv = Save.d.libre || {};
    const trama = lv === 'lb:trama', T = trama ? Trama.save() : null, fresh = trama && !T.started; if (fresh) { T.started = 1; T.c = T.c || 0; T.s = T.s || 0; }
    let start; if ((lv === 'lb:ultimo' || (trama && !fresh)) && sv.x) start = { x: sv.x, y: sv.y }; else { const h = this.hub(trama ? 'Niquía' : lv.startsWith('lb:') ? lv.slice(3) : 'San Antonio'); start = this.libre(h.x, h.y, v => v === TT.WALK || v === TT.PLAZA || v === TT.STATION, 6); }
    const st = { lvId: lv, x: start.x, y: start.y, h: -Math.PI / 2, vf: 0, vs: 0, steer: 0, mode: 'walk', veh: null, ride: null, hb: false, run: false, joy: { x: 0, y: 0, m: 0 }, keys: {}, t: 0, dmg: 0, job: null, jobT: 18, jobs: 0, pay: 0, crashes: 0, peds: 0, km: 0, photos: [], visited: Object.assign({}, sv.visited || {}), cam: { x: start.x, y: start.y, k: 3 }, z: 0, far: false, parked: [], msg: [], shake: 0, seed: opts.seed | 0, act: 0, actHold: 0, done: false, auto: !!opts.auto, radio: 0, lastHub: null, near: null, engine: 0 };
    // vehículos parqueados: taxis y bicis en las estaciones, camionetas en el taller de Bello, alimentadores en sus cabeceras, articulados en Metroplús
    const park = (kind, x, y, a) => { const p = this.nearTile(x, y, v => v === TT.ROAD || v === TT.AVE || v === TT.DEPOT || v === TT.WALK, 7); st.parked.push({ kind, x: p.x, y: p.y, a: a != null ? a : rng.f() * TAU, id: st.parked.length }); };
    // estaciones de EnCicla (src/data/encicla.js, de Juega EnCicla): anclajes con 2 a 4 bicis
    st.docks = []; if (typeof ENCICLA !== 'undefined') ENCICLA.estaciones.forEach(([n, mu, la, lo, tp], i) => { const q = geoM(la, lo), p = this.nearTile(q.x, q.y, v => v === TT.WALK || v === TT.PLAZA || v === TT.STATION || v === TT.GRASS, 5); st.docks.push({ n, mu, tp, x: p.x, y: p.y }); for (let b = 0, nb = 2 + (h2(i, 7, 5) * 3 | 0); b < nb; b++) st.parked.push({ kind: 'bici', x: p.x - 2.4 + b * 1.4, y: p.y + 1.6, a: Math.PI / 2, id: st.parked.length, dock: i }); });
    for (const h of NET.stations) { if (!h.lines.some(l => l.kind === 'metro' || l.kind === 'tram')) continue; park('taxi', h.x + 30, h.y + 14); if (!st.docks.length && rng.f() < .7) park('bici', h.x - 24, h.y + 10); if (rng.f() < .25) park('moto', h.x + 18, h.y - 26); }
    const bello = this.hub('Bello'); park('camioneta', bello.x + 60, bello.y + 40); park('camioneta', bello.x - 50, bello.y + 70); const sa = this.hub('San Antonio'); park('camioneta', sa.x + 60, sa.y - 50);
    for (const l of NET.lines) { if (l.kind === 'feeder') park('alimentador', l.st[0].x, l.st[0].y, NET.at(l.P, 5).a); if (l.kind === 'brt') { park('metroplus', l.st[0].x, l.st[0].y, NET.at(l.P, 5).a); park('metroplus', l.st[l.st.length - 1].x, l.st[l.st.length - 1].y, NET.at(l.P, l.P.len - 5).a + Math.PI); } }
    if (sv.veh && (lv === 'lb:ultimo' || (trama && !fresh)) && VEH[sv.veh]) { st.parked = st.parked.filter(p => !(p.kind === sv.veh && dist(p.x, p.y, st.x, st.y) < 40)); st.veh = { kind: sv.veh, col: VEH[sv.veh].col, id: -1 }; st.mode = 'veh'; st.h = sv.h || st.h; }
    if (trama) Trama.init(st);
    st.inicio = { x: st.x, y: st.y }; st.h2 = st.h; st.thr = 0; st.wv = 0; if (typeof Gente !== 'undefined') Gente.crear(st);
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
    // domicilio por dirección (de El Metro 1.0.0): sin marca el primer minuto; las calles crecen hacia el norte y las carreras hacia el occidente
    if (!J && st.mode !== 'ride' && rng.f() < .2) { const e = MAP.esquina(st.x, st.y, 500, 1800, rng); if (e) { const D = dist(e.x, e.y, st.x, st.y); J = { k: 'direccion', title: 'Domicilio a la ' + e.a + ' con ' + e.b, hint: 'Sin marca: las calles crecen hacia el norte y las carreras hacia el occidente', x: null, y: null, tx: e.x, ty: e.y, name: e.a + ' con ' + e.b, oculta: true, limit: D / 4 + 150, pay: 45 + Math.round(D / 45), stage: 0 }; } }
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
    else if (J.k === 'direccion') { if (J.oculta && J.t > 60) { J.oculta = false; J.x = J.tx; J.y = J.ty; this.msg(st, '📍 Pista: te marcamos la esquina', 'b'); } if (dist(st.x, st.y, J.tx, J.ty) < 26) { if (J.oculta) { J.pay += 20; this.msg(st, '🧭 ¡Sin mapa! La encontraste por la nomenclatura (+20)', 'b'); } this.complete(st); } }
    else if (J.k === 'pasajero') { if (dist(st.x, st.y, J.x, J.y) < 30 && st.mode !== 'veh') this.complete(st); }
    else if (J.k === 'reparacion') { if (dist(st.x, st.y, J.x, J.y) < 14 && Math.abs(st.vf) < .5 && st.act) { J.hold += dt; if (J.hold >= 3) this.complete(st); } else J.hold = Math.max(0, J.hold - dt); }
    else if (J.k === 'ruta') { const s = J.line.st[J.ni]; J.x = s.x; J.y = s.y; J.name = s.name; if (dist(st.x, st.y, s.x, s.y) < 16 && Math.abs(st.vf) < .5) { J.pay += 25; st.pay += 25; Save.d.wallet += 25; this.msg(st, 'Parada ' + s.name + ' +25 🎫', 'g'); this.sfx(st, 'coin'); for (let k = 0; k < 3; k++) Ciudad.parts.push({ x: st.x + (Math.random() - .5) * 6, y: st.y + (Math.random() - .5) * 6, vx: 0, vy: -2, t: 1, t0: 1, c: '#fff', r: .4 }); J.ni++; if (J.ni >= J.stops) this.complete(st); } }
  },
  complete(st) { const J = st.job; let pay = J.pay; if (J.k === 'taxi') { const d = dist(J.client.x0 || J.x, J.client.y0 || J.y, J.x, J.y); pay = 50 + Math.round(J.dist / 35) + (st.crashesJ ? 0 : 40); if (J.client) { J.client.client = false; J.client.wait = 1; J.client.x = st.x + 3; J.client.y = st.y + 3; Ciudad.peds.push(J.client); Ciudad.say(J.client, st.crashesJ ? 'Uy, qué susto' : '¡Gracias, muy amable!'); } }
    if (J.k === 'postal') { st.photos.push(J.name); Album.ganar(J.name); }
    if (J.k === 'ruta') pay = 60;
    st.jobs++; st.pay += pay; Save.d.wallet += pay; Save.d.libre.jobs = (Save.d.libre.jobs || 0) + 1; Save.write(); this.msg(st, '✓ ' + J.title + ' · +' + pay + ' 🎫', 'g'); this.sfx(st, 'star'); vib(40); st.job = null; st.jobT = 10; st.crashesJ = 0;
  },
  fail(st, why) { const J = st.job; if (J.k === 'taxi' && J.client) { J.client.client = false; J.client.wait = 1; if (J.stage === 1) { J.client.x = st.x + 3; J.client.y = st.y + 3; Ciudad.peds.push(J.client); } } this.msg(st, '✗ ' + J.title + ': ' + why, 'r'); this.sfx(st, 'bad'); st.job = null; st.jobT = 12; },
  /* ---------- acción (●) ---------- */
  action(st) {
    if (st.mode === 'ride') { const v = st.ride; if (v.ph === 'dwell' && v.st) { st.mode = 'walk'; st.ride = null; const t = this.salida(v.st); st.x = t.x; st.y = t.y; st.z = 0; st.vf = 0; st.wv = 0; this.msg(st, 'Bajas en ' + v.st.name, 'b'); this.sfx(st, 'door'); Album.estacion(v.st.name); } else this.msg(st, 'Espera a que pare en la estación', 'y'); return; }
    if (st.mode === 'veh') {
      const J = st.job; if (J && J.k === 'taxi' && J.stage === 0 && Math.abs(st.vf) < 1 && dist(st.x, st.y, J.client.x, J.client.y) < 7) { J.stage = 1; Ciudad.peds = Ciudad.peds.filter(p => p !== J.client); J.client.x0 = st.x; J.client.y0 = st.y; J.dist = dist(st.x, st.y, J.dest.x, J.dest.y); J.limit = J.t + J.dist / 8 + 50; J.title = 'Lleva al pasajero a ' + J.dest.name; J.hint = 'Sin choques y sin pasarte de velocidad'; this.msg(st, '«A ' + J.dest.name + ', por favor»', 'b'); this.sfx(st, 'door'); return; }
      if (Math.abs(st.vf) > 1.5) { this.msg(st, 'Frena primero para bajarte', 'y'); return; }
      if (st.veh.kind === 'bici' && st.prestamo) { if (this.devolver(st)) return; st.prestamo = null; this.msg(st, '⚠ Dejaste la bici EnCicla sola. En EnCicla eso se reporta: devuélvela siempre en un anclaje', 'y'); }
      const V = this.V(st); st.parked.push({ kind: st.veh.kind, x: st.x, y: st.y, a: st.h, id: st.parked.length }); st.veh = null; st.mode = 'walk'; st.vf = st.vs = 0; const t = this.libre(st.x - Math.sin(st.h) * (V.wid + 1.2), st.y + Math.cos(st.h) * (V.wid + 1.2), q => WALK_OK.has(q), 3); st.x = t.x; st.y = t.y; this.sfx(st, 'door'); if (st.job && st.job.k === 'ruta') this.fail(st, 'dejaste el bus'); if (st.job && st.job.k === 'taxi' && st.job.stage === 1) this.fail(st, 'dejaste al pasajero'); return;
    }
    // a pie: personaje de la historia, vehículo cercano, transporte en la estación, persona
    if (st.trama && Trama.onAction(st)) return;
    const np = typeof Gente !== 'undefined' ? Gente.cerca(st, 3.4) : null; if (np) { const dn = dist(np.x, np.y, st.x, st.y), dv = st.parked.reduce((m, q) => Math.min(m, dist(q.x, q.y, st.x, st.y) - VEH[q.kind].len / 2), 1e9); if (!(dv < dn)) { Gente.hablar(st, np); return; } }   // con un vehículo más cerca que la persona, gana el vehículo
    let best = null, bd = 4.5; for (const p of st.parked) { const d = dist(p.x, p.y, st.x, st.y); if (d < bd + VEH[p.kind].len / 2) { bd = d; best = p; } }
    if (best && best.dock != null && !EM.headless) { const Hh = enciclaHorario(new Date()); if (!Hh.abierto) { this.msg(st, '🚲 EnCicla no presta a esta hora: ' + Hh.txt, 'y'); return; } }
    if (best) { st.parked = st.parked.filter(p => p !== best); st.veh = { kind: best.kind, col: VEH[best.kind].col, id: best.id }; st.mode = 'veh'; st.x = best.x; st.y = best.y; st.h = best.a; st.vf = st.vs = 0; st.steer = 0; this.msg(st, VEH[best.kind].icon + ' ' + VEH[best.kind].n + (best.kind === 'bici' ? ' · pedalea con ▲' : ' · ▲ acelera · ✋ derrapa'), 'b'); if (best.dock != null) this.prestar(st, best.dock); this.sfx(st, 'door'); if (st.jobT > 4) st.jobT = 4; return; }
    const hub = this.nearHub(st, 34); if (hub) { const v = Ciudad.atHub(hub, st.x, st.y, st.trama ? Trama.wantLine(st) : null); if (v) { if (!Save.d.civica && Game.st === st && !st.auto && !EM.headless) { Save.d.civica = 1; Save.write(); UI.modal(`<div class="pag">Primera vez en el Metro</div><h2>Tu Cívica</h2><div class="civica"><i></i>Metro de Medellín</div><p>Para viajar se pasa la tarjeta <b>Cívica</b> por el torniquete. La personal es gratis en los puntos de atención y cobra la tarifa frecuente. Cada viaje descuenta un pasaje; los transbordos a cables y Metroplús no cobran de nuevo.</p><p class="m">En el juego cada viaje cuesta 1 🎫 y los cables integrados son gratis.</p><button class="btn pri" id="cvOk">Entendido · pasar la Cívica</button>`); $('#cvOk').onclick = () => UI.close(); }
      if (v.line.kind !== 'cable') { if (Save.d.wallet >= 1) { Save.d.wallet -= 1; } else this.msg(st, 'Sin saldo en la Cívica: haz un oficio para ganar pasajes (te dejan pasar esta vez)', 'y'); }
      st.mode = 'ride'; st.ride = v; st.vf = st.vs = 0; st.subio = 1; this.msg(st, 'Abordas ' + v.line.name + ' → ' + v.line.st[v.dir > 0 ? Math.min(v.ni + 1, v.line.st.length - 1) : Math.max(v.ni - 1, 0)].name, 'b'); this.sfx(st, 'bell'); return; } const coming = Ciudad.transit.find(t => t.line.st.some(s => s.hub === hub) && !t.line._far); this.msg(st, coming ? 'Espera en el andén: el ' + coming.line.K.label.toLowerCase() + ' viene en camino' : 'Aquí no para nada por ahora', 'y'); return; }
    const p = Ciudad.peds.find(p => dist(p.x, p.y, st.x, st.y) < 3); if (p) { p.wait = 2; if (p.dog) { Ciudad.say(p, '¡Guau! 🐾'); p.owner = p.owner || null; return; } Ciudad.say(p); if (st.job && st.job.hint && Ciudad.rng.f() < .4) setTimeout(() => Ciudad.say(p, st.job.hint.slice(0, 40)), 1200); return; }
    this.msg(st, 'Nada por aquí: busca una estación, un taxi o una bici', 'y');
  },
  /* ---------- EnCicla (cruce con Juega EnCicla): préstamo de una hora, devolución en cualquier anclaje y timbre ---------- */
  FRASES_ENCICLA: ['Santi, anfitrión: «Una sonrisa también se presta.»', 'Doña Luz, usuaria desde 2011: «Del afán no queda sino el cansancio.»', 'Don Jairo, mecánico: «Toda bici avisa lo que le duele.»', 'Wilson, conductor de balance: «Por las vías, nunca por la ciclorruta.»', 'Cata, sala de control: «El mapa habla.»', 'Maryi, pausas activas: «Un cuerpo que se mueve trabaja mejor.»'],
  prestar(st, i) { const D = st.docks[i]; st.prestamo = { i, min: 0, x0: st.x, y0: st.y, avisado: 0 }; this.msg(st, '🚲 Préstamo EnCicla en ' + D.n + ': tienes 60 minutos', 'b'); this.msg(st, this.FRASES_ENCICLA[(st.t * 7 | 0) % this.FRASES_ENCICLA.length], 'g'); const h = new Date().getHours(); if (h >= 18 || h < 6) this.msg(st, 'Casco al montar y luces de noche: Cultura EnCicla', 'y'); },
  devolver(st) {
    let bi = -1, bd = 12; st.docks.forEach((D, i) => { const d = dist(D.x, D.y, st.x, st.y); if (d < bd) { bd = d; bi = i; } }); if (bi < 0) return false;
    const P = st.prestamo, D = st.docks[bi], lejos = dist(P.x0, P.y0, D.x, D.y) > 400;
    st.parked.push({ kind: 'bici', x: D.x - 2.4 + (st.parked.length % 4) * 1.4, y: D.y + 1.6, a: Math.PI / 2, id: st.parked.length, dock: bi }); st.veh = null; st.mode = 'walk'; st.vf = st.vs = 0; st.prestamo = null;
    const t = this.libre(D.x, D.y - 3, q => WALK_OK.has(q), 3); st.x = t.x; st.y = t.y;
    this.msg(st, '✓ Devuelves la bici en ' + D.n + ' (' + Math.max(1, Math.round(P.min)) + ' min)' + (lejos ? ' · «Nadie aplaude al anfitrión, pero todos llegan.»' : ''), 'g'); this.sfx(st, 'star');
    if (st.subio && lejos) { Vida.logro('intermodal'); Album.ganar('Metro + EnCicla'); }
    return true;
  },
  timbre(st) {
    this.sfx(st, 'bell'); const T = st.timbres = (st.timbres || []).filter(t => st.t - t < 2.5); T.push(st.t); const h = this.nearHub(st, 45);
    if (T.length >= 3 && h && h.lines.some(l => l.kind === 'metro')) { st.timbres = []; Vida.logro('ciclista'); this.msg(st, '🚲 ¡Ciclista secreto! Tres timbrazos debajo del metro. ¿Te gusta pedalear? Juega EnCicla', 'g'); }
    else if (T.length === 1) this.msg(st, '🔔 ¡Tilín, tilín!', 'b');
  },
  nearHub(st, r) { let best = null, bd = r; for (const h of NET.stations) { const d = dist(h.x, h.y, st.x, st.y); if (d < bd) { bd = d; best = h; } } return best; },
  /* ---------- física ---------- */
  step(st, dt) {
    if (st.done) return; st.t += dt; const J = st.job;
    if (st.prestamo) { const P = st.prestamo; P.min += dt / 10; if (P.min > 60 && !P.avisado) { P.avisado = 1; this.msg(st, '⏰ Pasó la hora del préstamo: devuelve o renueva la bici en una estación EnCicla', 'y'); } }   // 10 s de juego = 1 minuto de préstamo
    if (st.mode === 'veh' && st.veh.kind === 'bici' && st.hb) { st.hb = false; this.timbre(st); }
    if (st.auto) { st.joy = { x: Math.sin(st.t * .3), y: -.8, m: 1 }; if (Math.floor(st.t) % 7 === 0 && !st._a) { st._a = 1; this.action(st); } else if (Math.floor(st.t) % 7) st._a = 0; }
    if (st.trama && st.trama.talk) { st.joy = { x: 0, y: 0, m: 0 }; st.keys.up = st.keys.down = false; }
    if (st.charla) { st.joy = { x: 0, y: 0, m: 0 }; st.keys.up = st.keys.down = false; } const wdt = dt;
    if (st.mode === 'ride') { const p = Ciudad.tpos(st.ride); st.x = p.x; st.y = p.y; st.h = p.a + (st.ride.dir < 0 ? Math.PI : 0); st.vf = st.ride.v || 0; const v = st.ride; if (v.ph === 'dwell' && v.st && st._lastSt !== v.st) { st._lastSt = v.st; st.visited[v.st.name] = 1; this.msg(st, '🚉 ' + v.st.name + ' · ● para bajarte', 'b'); if (NET.fact(v.st.name) && Ciudad.rng.f() < .5) this.msg(st, NET.fact(v.st.name), 'y'); } }
    else if (st.mode === 'veh') this.drive(st, dt);
    else this.walk(st, dt);
    Ciudad.tick(wdt, { x: st.x, y: st.y, z: st.z || 0, h: st.h, vf: st.vf, veh: st.mode === 'veh' ? this.V(st) : null, onPed: p => { st.peds++; st.crashesJ = 1; Save.d.wallet = Math.max(0, Save.d.wallet - 30); st.vf *= .5; this.msg(st, '¡Casi atropellas a alguien! −30 🎫 · Cultura Metro: el peatón primero', 'r'); this.sfx(st, 'bad'); vib(120); Ciudad.say(p, '¡Uy, cuidado!'); }, onCar: c => { if (Math.abs(st.vf) < 1) return; st.crashes++; st.crashesJ = 1; st.dmg += Math.abs(st.vf); st.vf *= .3; st.shake = .35; this.sfx(st, 'crash'); this.msg(st, 'Choque con un ' + (c.kind === 'moto' ? 'motociclista' : c.kind === 'taxi' ? 'taxi' : c.kind === 'bus' ? 'bus' : 'carro'), 'r'); vib(100); } });
    this.acomoda(st); this.jobTick(st, dt); if (st.trama) Trama.tick(st, dt); if (typeof Gente !== 'undefined') Gente.tick(st, dt); this.vigila(st, dt); const hub = this.nearHub(st, 40); if (hub && hub !== st.lastHub) { st.lastHub = hub; st.visited[hub.name] = 1; }
    if (st.shake > 0) st.shake -= dt;
    // cámara: sigue al jugador con adelanto y zoom según la velocidad
    const V = this.V(st), kT = st.far ? .42 : st.mode === 'walk' ? 2.1 : st.mode === 'ride' ? (st.ride.line.kind === 'cable' ? 1.5 : 1.15) : st.veh.kind === 'bici' ? 1.8 : lerp(1.7, 1.05, clamp(Math.abs(st.vf) / V.vmax, 0, 1));
    if (!st.camLibre) { st.cam.k += (kT * (st.zoomU || 1) - st.cam.k) * Math.min(1, dt * 2); const lead = st.mode === 'walk' ? 6 : 1.1 * st.vf; st.cam.x += (st.x + Math.cos(st.h) * lead - st.cam.x) * Math.min(1, dt * 4); st.cam.y += (st.y + Math.sin(st.h) * lead - st.cam.y) * Math.min(1, dt * 4); }
    if ((st._sv = (st._sv || 0) + dt) > 5) { st._sv = 0; this.persist(st); }
  },
  walk(st, dt) {
    // a pie con algo de peso: arranca y para en un instante corto y gira hacia donde apunta el joystick
    const j = st.joy, m = j.m > .15, tile = st.z ? TT.ROAD : MAP.tileM(st.x, st.y), spd = m ? (st.run ? 3.6 : 1.6) * (tile === TT.MOUNT ? .45 : tile === TT.GRASS ? .85 : tile === TT.STEPS ? .6 : 1) * clamp(j.m, .3, 1) : 0;
    if (m) { const a = Math.atan2(j.y, j.x); st.wa = a; st.h += Math.atan2(Math.sin(a - st.h), Math.cos(a - st.h)) * Math.min(1, dt * 12); }
    const w0 = st.wv || 0; st.wv = w0 + (spd - w0) * Math.min(1, dt * (spd > w0 ? 7 : 11)); if (st.wv < .03) st.wv = 0; st.vf = st.wv; if (!st.wv) return;
    const a = st.wa != null ? st.wa : st.h, spdN = st.wv, nx = st.x + Math.cos(a) * spdN * dt, ny = st.y + Math.sin(a) * spdN * dt;
    const bloq = (x, y) => VC.on ? VC.solid(x, y, .35) : SOLID_W.has(MAP.tileM(x, y));   // a pie se anda por todo el mapa: solo frenan los edificios y el agua
    const mov = (x, y) => { const r = this.nivel(st, x, y, bloq, true); if (r[0]) { st.x = x; st.y = y; st.z = r[1]; } return r[0]; };
    mov(nx, ny) || mov(nx, st.y) || mov(st.x, ny);
    st.km += spdN * dt / 1000;
  },
  drive(st, dt) {
    const V = this.V(st), j = st.joy, k = st.keys, S = Save.d.settings, libre = String(st.lvId || '').startsWith('lb:'), facil = libre && !st.auto && S.manejo !== 'clasico';
    let thrIn = k.up ? 1 : 0, br = k.down ? 1 : 0, sIn = k.left ? -1 : k.right ? 1 : 0, thr, spdF;
    if (libre) {
      // mandos. Teclas y botones: ▲ acelera, ▼ frena, ◀ ▶ giran. Joystick en «fácil»: se apunta hacia donde se quiere ir; el vehículo gira
      // hacia allá con su radio de giro y acelera según lo que se empuje (si se apunta casi a lo largo de la calle, sigue la calle; hacia
      // atrás frena y, ya quieto, da reversa). En «clásico»: los lados giran (con zona muerta y curva fina cerca del centro) y arriba acelera
      if (j.m > .15 && !sIn) {
        if (facil) { let a = Math.atan2(j.y, j.x); const R = S.asist !== 0 && Math.abs(st.vf) > 2 ? this.rumbo(st, a) : null; if (R != null && Math.abs(Math.atan2(Math.sin(R - a), Math.cos(R - a))) < .3) a = R;
          const d = Math.atan2(Math.sin(a - st.h), Math.cos(a - st.h));
          if (Math.abs(d) > 2.35) { br = Math.max(br, j.m); if (st.vf < 1.2) { const d2 = Math.atan2(Math.sin(a - st.h - Math.PI), Math.cos(a - st.h - Math.PI)); sIn = clamp(-d2 / .6, -1, 1); } }
          else { sIn = clamp(d / .6, -1, 1); thrIn = Math.max(thrIn, j.m * clamp(1.2 - Math.abs(d) / 1.9, .25, 1)); } }
        else { const ax = Math.abs(j.x); if (ax > .1) sIn = Math.sign(j.x) * Math.pow((ax - .1) / .9, 1.4); if (j.y < -.2) thrIn = Math.max(thrIn, Math.min(1, (-j.y - .2) / .65)); if (j.y > .25) br = Math.max(br, Math.min(1, (j.y - .25) / .6)); } }
      // pedal con peso: el acelerador entra en ~0,3 s y se suelta más rápido
      st.thr = (st.thr || 0) + (thrIn - (st.thr || 0)) * Math.min(1, dt * (thrIn > (st.thr || 0) ? 3.5 : 7)); thr = st.thr < .02 ? 0 : st.thr;
      // dirección según la velocidad: las ruedas giran solo lo que aguanta el agarre (la aceleración lateral del vehículo), así a 80 km/h
      // un toque no lo voltea, y en la esquina, despacio, gira cerrado; el volante vuelve solo al centro
      const v = Math.abs(st.vf), target = sIn * this.giroMax(V, v, st.hb && !V.walk);
      spdF = clamp(v / V.vmax, 0, 1); st.steer += (target - st.steer) * Math.min(1, dt * (sIn ? 6 : 9)); st.steer = clamp(st.steer, -V.smax, V.smax);
      // asistencia de carril: sin mandos de giro, el vehículo se endereza solo con la calle
      if (S.asist !== 0 && !sIn && v > 3 && !st.hb) { const R = this.rumbo(st, st.h); if (R != null) { const d = Math.atan2(Math.sin(R - st.h), Math.cos(R - st.h)); if (Math.abs(d) < .22) st.h += d * Math.min(1, dt * 1.6); } }
    } else {   // los otros modos (bus) siguen con su asistente de siempre
      thr = k.up ? 1 : j.y < -.2 ? -j.y : 0; br = k.down ? 1 : j.y > .25 ? j.y : 0; sIn = k.left ? -1 : k.right ? 1 : Math.abs(j.x) > .12 ? j.x : 0;
      spdF = clamp(Math.abs(st.vf) / V.vmax, 0, 1); const target = sIn * V.smax * (1 - .55 * spdF); st.steer += clamp(target - st.steer, -V.srate * dt, V.srate * dt);
    }
    const tile = st.z ? TT.ROAD : MAP.tileM(st.x, st.y), ag = st.z ? 1 : VC.on ? VC.agarre(st.x, st.y) : 1, soft = VC.on ? ag < .95 : !(tile === TT.ROAD || tile === TT.AVE || tile === TT.AUTO || tile === TT.BRIDGE || tile === TT.DEPOT) && !(V.ciclo && tile === TT.CICLO), wet = Mundo.weather().rain, capS = VC.on ? 4 + 6 * ag : 6;   // fuera del asfalto: más roce y menos velocidad (andén y plaza, pasto, monte)
    const c = Math.cos(st.h), s = Math.sin(st.h), gr = st.z ? 0 : clamp((MAP.elevM(st.x + c * 8, st.y + s * 8) - MAP.elevM(st.x - c * 8, st.y - s * 8)) / 16, -.2, .2);
    if (thr > 0) { if (st.vf < -.3) st.vf = Math.min(0, st.vf + V.brk * dt); else st.vf += thr * V.acc * (1 - .55 * spdF) * dt * (soft && !V.campo ? .5 : 1); }
    if (br > 0) { if (st.vf > .3) st.vf = Math.max(0, st.vf - V.brk * br * dt); else st.vf = Math.max(-5, st.vf - V.acc * .6 * dt); }
    if (!thr && !br) st.vf -= Math.sign(st.vf) * Math.min(Math.abs(st.vf), (.4 + .003 * st.vf * st.vf + (soft ? 2.5 : 0)) * dt);
    st.vf -= 9.81 * gr * (V.walk ? .5 : .22) * dt; if (soft && !V.campo && Math.abs(st.vf) > capS) st.vf = Math.sign(st.vf) * capS; if (Math.abs(st.vf) > V.vmax * 1.05) st.vf = Math.sign(st.vf) * V.vmax * 1.05;
    // giro (modelo bicicleta) y derrape: la velocidad lateral se apaga según el agarre
    const hb = st.hb && !V.walk, rot = st.vf / V.wb * Math.tan(st.steer) * (hb ? 1.4 : 1) * dt, oh = st.h; st.h += rot;
    const vx = st.vf * Math.cos(oh) - st.vs * Math.sin(oh), vy = st.vf * Math.sin(oh) + st.vs * Math.cos(oh), c2 = Math.cos(st.h), s2 = Math.sin(st.h); st.vf = vx * c2 + vy * s2; st.vs = -vx * s2 + vy * c2;
    const grip = (hb ? 1.1 : V.grip) * (wet ? .6 : 1) * (soft ? .7 : 1); st.vs *= Math.exp(-grip * dt); if (hb) st.vf *= Math.exp(-.9 * dt);
    const drifting = Math.abs(st.vs) > 2.2 && Math.abs(st.vf) > 2; if (drifting || (hb && Math.abs(st.vf) > 3)) { for (const o of [-1, 1]) { const rx = st.x - c2 * V.len * .38 - s2 * o * V.wid * .42, ry = st.y - s2 * V.len * .38 + c2 * o * V.wid * .42; Ciudad.marks.push({ x1: rx, y1: ry, x2: rx - (vx * dt), y2: ry - (vy * dt), t: 1 }); } if (Ciudad.rng.f() < .5) Ciudad.parts.push({ x: st.x - c2 * V.len * .4, y: st.y - s2 * V.len * .4, vx: (Ciudad.rng.f() - .5) * 3, vy: (Ciudad.rng.f() - .5) * 3, t: .6, t0: .6, c: wet ? 'rgba(200,220,235,.8)' : 'rgba(190,180,160,.8)', r: .35 + Ciudad.rng.f() * .4 }); if (!st._drT) { st._drT = 1; this.sfx(st, 'brake'); } } else st._drT = 0;
    if (wet && Math.abs(st.vf) > 8 && Ciudad.rng.f() < .4) Ciudad.parts.push({ x: st.x - c2 * V.len * .3 + (Ciudad.rng.f() - .5) * V.wid, y: st.y - s2 * V.len * .3, vx: -vx * .1, vy: -vy * .1 - 1, t: .4, t0: .4, c: 'rgba(210,230,245,.9)', r: .2 });
    // movimiento y choques con lo sólido (esquinas del vehículo); desliza por paredes
    const nx = st.x + vx * dt, ny = st.y + vy * dt, piso = (x, y) => this.hitV(x, y, st.h, V) && !(st.lane && st.lane(x, y)), hit = (x, y) => { const r = this.nivelV(st, x, y, V, piso); st._nz = r[1]; return !r[0]; };
    if (!hit(nx, ny)) { st.x = nx; st.y = ny; st.z = st._nz; } else if (!hit(nx, st.y)) { st.x = nx; st.z = st._nz; st.vs *= .5; } else if (!hit(st.x, ny)) { st.y = ny; st.z = st._nz; st.vs *= .5; } else { const imp = Math.abs(st.vf); st.vf *= -.2; st.vs *= .3; if (imp > 2) { st.crashes++; st.crashesJ = 1; st.dmg += imp; st.shake = .3; this.sfx(st, 'crash'); vib(80); this.msg(st, imp > 8 ? '¡Golpe duro!' : 'Golpe', 'r'); for (let q = 0; q < 6; q++) Ciudad.parts.push({ x: nx, y: ny, vx: (Ciudad.rng.f() - .5) * 8, vy: (Ciudad.rng.f() - .5) * 8, t: .5, t0: .5, c: '#fbe7b0', r: .3 }); } }
    if (V.art) { const h2 = st.h2 == null ? st.h : st.h2, d = Math.atan2(Math.sin(st.h - h2), Math.cos(st.h - h2)); st.h2 = h2 + st.vf / V.art * Math.sin(d) * dt; const d2 = Math.atan2(Math.sin(st.h - st.h2), Math.cos(st.h - st.h2)); if (Math.abs(d2) > .95) st.h2 = st.h - Math.sign(d2) * .95; } else st.h2 = st.h;
    st.km += Math.abs(st.vf) * dt / 1000; st.engine = thr;
  },
  /* ángulo máximo de las ruedas a la velocidad v: el que da la aceleración lateral que aguanta el vehículo (V.lat), sin pasar del tope mecánico */
  giroMax(V, v, hb) { return Math.min(V.smax, Math.atan((V.lat || 8) * (hb ? 1.8 : 1) * V.wb / Math.max(9, v * v))); },
  /* rumbo de la calle bajo el vehículo, del lado más parecido a h (para la asistencia); se recalcula cada 1,5 m o 0,25 s */
  rumbo(st, h) {
    if (!VC.on || !VC.rumbo) return null; let c = st._rb; if (!c || Math.abs(c.x - st.x) + Math.abs(c.y - st.y) > 1.5 || st.t - c.t > .25) c = st._rb = { x: st.x, y: st.y, t: st.t, r: VC.rumbo(st.x, st.y, 0, st.z || 0) };
    if (c.r == null) return null; const d = Math.atan2(Math.sin(c.r - h), Math.cos(c.r - h)); return Math.abs(d) > Math.PI / 2 ? c.r + Math.PI : c.r;
  },
  /* dónde queda uno al bajarse en una estación: en la calle o el andén más cercano, nunca en el monte ni entre las casas */
  salida(s) {
    const q = this.libre(s.x + 8, s.y + 8, v => v === TT.WALK || v === TT.PLAZA || v === TT.STATION, 6); if (!VC.on) return q;
    const c = VC.despeja(s.x, s.y, .6, true, 130); return Math.hypot(c.x - s.x, c.y - s.y) > .5 || VC.agarre(s.x, s.y) === 1 ? c : q;
  },
  /* vigía: si llevas rato fuera de toda calle (monte, potrero) o empujando sin moverte, el juego ofrece el rescate */
  vigila(st, dt) {
    if (st.mode === 'ride' || !VC.on || st.auto || st.charla) return; const j = st.joy;
    if (j.m > .5 || st.keys.up) { const a = st._at || (st._at = { x: st.x, y: st.y, t: 0 }); a.t += dt; if (Math.hypot(st.x - a.x, st.y - a.y) > 1.2) st._at = null; else if (a.t > 3.5) { st._at = null; this.avisoRescate(st, '¿Atascado? Toca 🆘 y te saco a la calle más cercana'); } } else st._at = null;
    if ((st._pv = (st._pv || 0) + dt) < 3) return; st._pv = 0;
    // con las casillas de 20 m (no arma regiones nuevas): ¿hay calle, andén, plaza o estación a menos de ~50 m?
    const C = new Set([TT.ROAD, TT.AVE, TT.AUTO, TT.BRIDGE, TT.WALK, TT.PLAZA, TT.STATION, TT.STEPS, TT.CICLO]), tx = Math.floor(st.x / TM), ty = Math.floor(st.y / TM); let calle = false; for (let j = -2; j <= 2 && !calle; j++) for (let i = -2; i <= 2 && !calle; i++) calle = C.has(MAP.tile(tx + i, ty + j));
    if (calle || this.nearHub(st, 80)) { st._lejos = 0; return; } st._lejos = (st._lejos || 0) + 3; if (st._lejos >= 9) { st._lejos = -30; this.avisoRescate(st, '¿Perdido? Estás lejos de las calles: toca 🆘 para volver a una estación o a la calle'); }
  },
  avisoRescate(st, t) { if (st.t - (st._avR || -99) < 25) return; st._avR = st.t; this.msg(st, t, 'y'); const b = $('#lbAyuda'); if (b && !EM.headless) { b.classList.add('hot'); setTimeout(() => b.classList.remove('hot'), 6000); } },
  /* llevar al jugador a (x, y): a pie (el vehículo queda parqueado donde estaba) o con su vehículo; la cámara salta con él */
  llevar(st, x, y, conVeh) {
    if (st.mode === 'ride') return; if (st.mode === 'veh' && !conVeh) { st.parked.push({ kind: st.veh.kind, x: st.x, y: st.y, a: st.h, id: st.parked.length }); st.veh = null; st.mode = 'walk'; }
    st.x = x; st.y = y; st.z = 0; st.vf = st.vs = 0; st.wv = 0; st.thr = 0; st.steer = 0; st.h2 = st.h; st.cam.x = x; st.cam.y = y; st.camLibre = false; if (this._camLibre) this._camLibre(false); st._at = null; st._lejos = 0; this.sfx(st, 'door');
  },
  /* 🆘 ayuda: volver a una estación, a la calle o al inicio, pedir un taxi; y tus ajustes de manejo y tu personaje */
  ayuda(st) {
    if (EM.headless) return; const S = Save.d.settings, hubs = NET.stations.filter(h => h.lines.some(l => l.kind === 'metro' || l.kind === 'tram' || l.kind === 'cable'));
    let h = null, bd = 1e9; for (const q of hubs) { const d = dist(q.x, q.y, st.x, st.y); if (d < bd) { bd = d; h = q; } } const km = d => d < 1000 ? Math.round(d) + ' m' : (d / 1000).toFixed(1).replace('.', ',') + ' km';
    const enRide = st.mode === 'ride', ini = st.inicio || { x: st.x, y: st.y };
    UI.modal(`<div class="pag">Ayuda</div><h2>🆘 ¿Qué necesitas?</h2>${enRide ? '<p class="m">Vas de viaje: te bajas en la próxima estación con ●. Mientras tanto, ⏩ acelera el viaje.</p>' : `<div class="col ayuda">
      <button class="btn" data-a="est">🚉 Ir a la estación más cercana<small>${esc(h ? h.name : '')} · a ${km(bd)}</small></button>
      <button class="btn" data-a="calle">🛣 Salir a la calle más cercana<small>${st.mode === 'veh' ? 'con tu vehículo' : 'a pie'}</small></button>
      <button class="btn" data-a="taxi">🚕 Pedir un taxi<small>llega a la calle más cercana</small></button>
      <button class="btn" data-a="ini">🏠 Volver a donde empecé<small>a ${km(dist(ini.x, ini.y, st.x, st.y))}</small></button></div>`}
      <div class="pag">Manejo</div><div class="tg" data-mj><button data-v="facil" class="${S.manejo !== 'clasico' ? 'on' : ''}">Fácil: apunta hacia donde vas</button><button data-v="clasico" class="${S.manejo === 'clasico' ? 'on' : ''}">Clásico: izquierda y derecha giran</button></div>
      <div class="pag">Asistencia al volante (se endereza con la calle)</div><div class="tg" data-as><button data-v="1" class="${S.asist !== 0 ? 'on' : ''}">Sí</button><button data-v="0" class="${S.asist === 0 ? 'on' : ''}">No</button></div>
      <div class="row" style="margin-top:10px"><button class="btn" id="ayPf">🧑 Mi personaje</button><button class="btn pri" id="ayOk">Seguir</button></div>`);
    const fin = t => { UI.close(); if (t) this.msg(st, t, 'b'); };
    $$('#mBody [data-a]').forEach(b => b.onclick = () => { const a = b.dataset.a;
      if (a === 'est' && h) { const t = this.salida(h); this.llevar(st, t.x, t.y, false); fin('🚉 Estás en ' + h.name + ': ● para abordar'); }
      if (a === 'calle') { const t = VC.on ? VC.despeja(st.x, st.y, st.mode === 'veh' ? 1.4 : .6, true, 400) : this.libre(st.x, st.y, v => WALK_OK.has(v), 20); this.llevar(st, t.x, t.y, true); fin('🛣 De vuelta en la calle'); }
      if (a === 'taxi') { const t = VC.on ? VC.despeja(st.x, st.y, 1.4, true, 400) : this.libre(st.x, st.y, v => v === TT.ROAD || v === TT.AVE, 20); if (st.mode === 'veh') this.llevar(st, st.x, st.y, false); const R = this.rumbo({ x: t.x, y: t.y, t: -1, z: 0 }, st.h); st.parked.push({ kind: 'taxi', x: t.x, y: t.y, a: R != null ? R : st.h, id: st.parked.length }); const w = VC.on ? VC.despeja(t.x + 3, t.y + 3, .6, false, 20) : t; this.llevar(st, w.x, w.y, false); fin('🚕 Tu taxi llegó: está a tu lado, toca ● para subirte'); }
      if (a === 'ini') { this.llevar(st, ini.x, ini.y, false); fin('🏠 De vuelta donde empezaste'); } });
    $$('#mBody .tg[data-mj] button').forEach(b => b.onclick = () => { S.manejo = b.dataset.v; $$('button', b.parentNode).forEach(x => x.classList.toggle('on', x === b)); Save.write(); });
    $$('#mBody .tg[data-as] button').forEach(b => b.onclick = () => { S.asist = +b.dataset.v; $$('button', b.parentNode).forEach(x => x.classList.toggle('on', x === b)); Save.write(); });
    $('#ayPf').onclick = () => Perfil.abrir(); $('#ayOk').onclick = () => fin();
  },
  /* moverse con niveles: ¿se puede pasar a (x, y) y en qué nivel queda? Al puente se sube por sus extremos, donde el tablero
     está bajo; encima, la baranda no deja caer; por debajo se pasa entre las pilas (lo sólido del piso lo dice bloq) */
  nivel(st, x, y, bloq, pie) {
    if (!VC.PG) return [!bloq(x, y), 0];
    if (st.z > 0) { if (VC.puenteEn(x, y, st.z, .1)) return [true, st.z]; const cur = VC.puenteEn(st.x, st.y, st.z, .8); if (!cur || cur.h < 1.2) return [!bloq(x, y), 0]; return [false, st.z]; }
    const P = VC.puenteEn(x, y, null, 0); if (P && P.h < .9 && (pie || !P.B.pe)) return [true, P.B.z];
    return [!bloq(x, y), 0];
  },
  /* lo mismo para un vehículo: en el tablero, ninguna esquina puede salirse de la baranda (salvo en las rampas) */
  nivelV(st, x, y, V, piso) {
    if (!VC.PG) return [!piso(x, y), 0]; const pie = !!V.walk;
    if (st.z > 0) {
      const P = VC.puenteEn(x, y, st.z, .1);
      if (P) { if (P.h > 1.2) { const c = Math.cos(st.h), s = Math.sin(st.h), l = V.len / 2, w = V.wid / 2; for (const [u, v] of [[l, w], [l, -w], [-l, w], [-l, -w]]) if (!VC.puenteEn(x + c * u - s * v, y + s * u + c * v, st.z, .45)) return [false, st.z]; } return [true, st.z]; }
      const cur = VC.puenteEn(st.x, st.y, st.z, .8); if (!cur || cur.h < 1.2) return [!piso(x, y), 0]; return [false, st.z];
    }
    const P = VC.puenteEn(x, y, null, 0); if (P && P.h < .9 && (pie || !P.B.pe)) return [true, P.B.z];
    return [!piso(x, y), 0];
  },
  hitV(x, y, h, V) { const c = Math.cos(h), s = Math.sin(h), l = V.len / 2, w = V.wid / 2;
    if (VC.on) { const n = Math.max(1, Math.ceil(V.len / 3)); for (let i = 0; i <= n; i++) { const u = -l + 2 * l * i / n; for (const v of [w, -w]) if (VC.solid(x + c * u - s * v, y + s * u + c * v, 0)) return true; } return VC.solid(x, y, 0); }
    for (const [u, v] of [[l, w], [l, -w], [-l, w], [-l, -w], [0, 0]]) { const t = MAP.tileM(x + c * u - s * v, y + s * u + c * v); if (SOLID_V.has(t) && !(V.campo && t === TT.MOUNT)) return true; } return false; },
  persist(st) { const L = Save.d.libre || (Save.d.libre = {}); L.x = st.x; L.y = st.y; L.h = st.h; L.veh = st.mode === 'veh' ? st.veh.kind : null; L.visited = st.visited; L.km = (L.km || 0) + st.km; st.km = 0; Save.write(); },
  unmount(st) { if (this._cg) this._cg(); this.persist(st); if (this._eng) { try { this._eng.g.gain.setTargetAtTime(0, Snd.ac.currentTime, .05); this._eng.o.stop(Snd.ac.currentTime + .2); } catch (e) { } this._eng = null; } },
  result(st) { return { done: false, win: false, score: st.pay, stars: 0, lines: [] }; },
  msg(st, t, c) { if (!EM.headless && Game.st === st) UI.gmsg(t, c); },
  sfx(st, k) { if (!EM.headless && Game.st === st) Snd.play(k); },
  hud(st) { this.updCtl(st); const r = [['🎫', fmt(Save.d.wallet)], ['', st.mode === 'veh' ? Math.round(Math.abs(st.vf) * 3.6) + ' km/h' : st.mode === 'ride' ? st.ride.line.id + ' · ' + Math.round(st.vf * 3.6) + ' km/h' : this.lugarTxt(st)]]; if (st.prestamo) r.push(['🚲', Math.round(st.prestamo.min) + '/60 min']); return r; },
  lugarTxt(st) { if (!MAP.ready) return ''; const B = MAP.barrioAt(st.x, st.y); return B ? B[0] : (MAP.comunaAt(st.x, st.y) || MAP.muniAt(st.x, st.y)).replace(/^Comuna \d+ - /, ''); },
  /* letrero al entrar a otra calle o a otro barrio (como en los juegos de mundo abierto) */
  letrero(st) {
    if (EM.headless || Game.st !== st || !MAP.ready || st.mode === 'ride') return; if ((st._lt = (st._lt || 0) + 1) % 2) return;
    const el = $('#lbLugar'); if (!el) return; const c = MAP.calleAt(st.x, st.y), B = MAP.barrioAt(st.x, st.y), calle = c ? (c.p || c.n) : '', bar = B ? B[0] + (B[1] && B[1] !== B[0] ? ' · ' + B[1] : '') : MAP.muniAt(st.x, st.y);
    if (calle === st._calle && bar === st._bar) return; const nueva = calle && calle !== st._calle; st._calle = calle; st._bar = bar; if (!nueva && !bar) return;
    el.innerHTML = (calle ? `<b>${esc(calle)}</b>${c && c.p && c.n ? `<i>${esc(c.n)}</i>` : ''}` : '') + `<span>${esc(bar || '')}</span>`; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  },
  /* ---------- controles ---------- */
  mount(st, el) {
    el.innerHTML = `<div class="joyzone" id="lbJz"><div class="joy" id="lbJoy"><i></i></div></div>
      <div class="lbbtns"><button class="abtn big" id="lbAct">●<small>acción</small></button><button class="abtn acc" id="lbUp" aria-label="Correr o acelerar">▲</button><button class="abtn brk" id="lbDown" aria-label="Frenar">▼</button><button class="abtn hb" id="lbHb" aria-label="Freno de mano">✋</button></div>
      <div class="vsel" id="lbView"><button id="lbFoto" title="Foto">${Atlas.ico('ico_foto', '📷')}</button><button id="lbCam" title="Cámara libre: arrastra para mirar, pellizca para acercar">🎥</button><button id="lbZoom" title="Acercar o alejar">${Atlas.ico('ico_lupa', '🔎')}</button><button id="lbRun" title="Correr">${Atlas.ico('ico_correr', '🏃')}</button><button id="lbFF" title="Ritmo del juego">⏩<small id="lbFFn"></small></button><button id="lbGuia" title="Qué ver cerca">📍</button><button id="lbAyuda" title="Ayuda y rescate">🆘</button></div><div id="lbJob" class="jobbar hide"></div><div id="lbLugar" class="lugar"></div><div id="trTalk" class="trtalk hide"></div>`;
    const jz = $('#lbJz'), joy = $('#lbJoy'); let jid = null, jx = 0, jy = 0;
    jz.addEventListener('pointerdown', e => { jid = e.pointerId; jz.setPointerCapture(jid); const r = jz.getBoundingClientRect(); jx = e.clientX - r.left; jy = e.clientY - r.top; joy.style.left = jx + 'px'; joy.style.top = jy + 'px'; joy.classList.add('on'); Snd.init(); });
    jz.addEventListener('pointermove', e => { if (e.pointerId !== jid) return; const r = jz.getBoundingClientRect(), dx = e.clientX - r.left - jx, dy = e.clientY - r.top - jy, d = Math.hypot(dx, dy), R = 46, m = Math.min(1, d / R); st.joy = { x: d ? dx / d * m : 0, y: d ? dy / d * m : 0, m }; joy.firstChild.style.transform = 'translate(' + (dx / Math.max(1, d) * Math.min(d, R)) + 'px,' + (dy / Math.max(1, d) * Math.min(d, R)) + 'px)'; });
    const jend = e => { if (e.pointerId !== jid) return; jid = null; st.joy = { x: 0, y: 0, m: 0 }; joy.classList.remove('on'); joy.firstChild.style.transform = ''; }; jz.addEventListener('pointerup', jend); jz.addEventListener('pointercancel', jend);
    const hold = (id, key, down, up) => { const b = $(id), on = e => { e.preventDefault(); b.setPointerCapture && b.setPointerCapture(e.pointerId); st.keys[key] = true; b.classList.add('on'); Snd.init(); if (down) down(); }, off = () => { st.keys[key] = false; b.classList.remove('on'); if (up) up(); }; b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off); };
    hold('#lbUp', 'up', () => { st.run = true; }, () => { st.run = false; }); hold('#lbDown', 'down'); hold('#lbHb', 'hb', () => { st.hb = true; }, () => { st.hb = false; });
    hold('#lbAct', 'act', () => { st.act = 1; this.action(st); }, () => { st.act = 0; });
    this.camMount(st);
    $('#lbFoto').onclick = () => this.photo(st); $('#lbZoom').onclick = () => { st.far = !st.far; }; $('#lbRun').onclick = () => { st.run = !st.run; $('#lbRun').classList.toggle('on', st.run); }; $('#lbFF').onclick = () => { const s = Save.d.settings; s.ritmo = ((s.ritmo | 0) + 1) % 3; Save.write(); const R = this.RITMOS[s.ritmo]; this.msg(st, '⏩ Ritmo ' + R[0] + (R[2] > 1 ? ' · en metro y cable ×' + R[2] : '') , 'b'); this.updCtl(st); };
    $('#lbGuia').onclick = () => { if (typeof Gente !== 'undefined') Gente.guia(st); }; $('#lbAyuda').onclick = () => this.ayuda(st);
    this.updCtl(st);
  },
  updCtl(st) {
    if (EM.headless || Game.st !== st) return; this.letrero(st); const jb = $('#lbJob'); if (!jb) return; const J = st.goal ? null : st.job;
    if (st.goal) { const G = st.goal, d = dist(st.x, st.y, G.x, G.y); jb.className = 'jobbar trama'; jb.innerHTML = `<b>📖 ${esc(G.title)}</b><span>${esc(G.hint)}</span><em>${d < 1000 ? Math.round(d) + ' m' : (d / 1000).toFixed(1) + ' km'}</em>`; }
    const ff = $('#lbFF'); if (ff) { const r = clamp(Save.d.settings.ritmo | 0, 0, 2), R = this.RITMOS[r]; ff.classList.toggle('on', r > 0); const n = $('#lbFFn'); if (n) n.textContent = st.mode === 'ride' ? '×' + R[2] : R[0]; }
    if (!st.goal && !J && st.guia) { const G = st.guia, d = dist(st.x, st.y, G.x, G.y); jb.className = 'jobbar guia'; jb.innerHTML = `<b>📍 ${esc(G.title)}</b><span>${esc(G.hint || '')}</span><em>${d < 1000 ? Math.round(d) + ' m' : (d / 1000).toFixed(1) + ' km'}</em>`; }
    if (J) { const left = J.limit ? Math.max(0, J.limit - J.t) : 0, d = J.x != null ? dist(st.x, st.y, J.x, J.y) : 0; jb.classList.remove('hide'); jb.innerHTML = `<b>${esc(J.title)}</b><span>${esc(J.hint || '')}</span><em>${d ? (d < 1000 ? Math.round(d) + ' m' : (d / 1000).toFixed(1) + ' km') : ''}${J.limit ? ' · ⏱ ' + pad2(Math.floor(left / 60)) + ':' + pad2(Math.floor(left % 60)) : ''}${J.k === 'reparacion' && J.hold ? ' · reparando ' + Math.round(J.hold / 3 * 100) + '%' : ''}</em>`; jb.className = 'jobbar' + (J.limit && left < 20 ? ' low' : ''); } else if (!st.goal && !st.guia) jb.classList.add('hide');
    const veh = st.mode === 'veh'; $('#lbUp').textContent = veh ? '▲' : '🏃'; $('#lbDown').style.visibility = veh ? '' : 'hidden'; const bici = veh && st.veh.kind === 'bici', hbB = $('#lbHb'); hbB.style.visibility = veh && (!this.V(st).walk || bici) ? '' : 'hidden'; if (hbB.dataset.b !== String(bici)) { hbB.dataset.b = bici; hbB.textContent = bici ? '🔔' : '✋'; hbB.setAttribute('aria-label', bici ? 'Timbre' : 'Freno de mano'); }
    const a = $('#lbAct'); let lbl = 'acción'; if (st.mode === 'ride') lbl = st.ride.ph === 'dwell' ? 'bajar' : 'viajando'; else if (veh) lbl = (st.job && st.job.k === 'taxi' && st.job.stage === 0 && dist(st.x, st.y, st.job.client.x, st.job.client.y) < 9) ? 'recoger' : 'bajarse'; else { const p = st.parked.find(p => dist(p.x, p.y, st.x, st.y) < 4.5 + VEH[p.kind].len / 2); if (p) lbl = VEH[p.kind].icon + ' subir'; else if (typeof Gente !== 'undefined' && Gente.cerca(st, 3.4)) lbl = 'hablar'; else if (this.nearHub(st, 34)) lbl = 'abordar'; else if (Ciudad.peds.some(p => dist(p.x, p.y, st.x, st.y) < 3)) lbl = 'hablar'; }
    a.querySelector('small').textContent = lbl; a.classList.toggle('hot', lbl !== 'acción' && lbl !== 'viajando' && lbl !== 'bajarse');
    // motor (zumbido según la velocidad)
    if (Snd.ac && Save.d.settings.snd) { if (veh && !this.V(st).walk) { if (!this._eng) { const o = Snd.ac.createOscillator(), g = Snd.ac.createGain(); o.type = 'sawtooth'; g.gain.value = 0; o.connect(g); g.connect(Snd.sfxG); o.start(); this._eng = { o, g }; } const f = 40 + Math.abs(st.vf) * 7 + st.engine * 25; this._eng.o.frequency.setTargetAtTime(f, Snd.ac.currentTime, .08); this._eng.g.gain.setTargetAtTime(.025 + .02 * st.engine, Snd.ac.currentTime, .1); } else if (this._eng) this._eng.g.gain.setTargetAtTime(0, Snd.ac.currentTime, .1); }
  },
  /* ---------- cámara: seguir al jugador o libre (arrastrar), pellizcar o rueda para acercar, y ángulo ---------- */
  camMount(st) {
    const el = $('#gctl'); if (!el) return; let P = el.querySelector('#lbCamP'); if (!P) { P = document.createElement('div'); P.id = 'lbCamP'; P.className = 'campanel hide'; el.appendChild(P); }
    P.innerHTML = `<button id="lbCamV" title="Volver al jugador">⤺<small>volver</small></button><button id="lbCamM" aria-label="Alejar">−</button><button id="lbCamMas" aria-label="Acercar">+</button><button id="lbCamA" title="Ángulo de la cámara">📐<small id="lbCamAn">${VC.ANGULOS[(Save.d.settings.angulo | 0) % VC.ANGULOS.length].n}</small></button>`;
    const libre = on => { st.camLibre = on; P.classList.toggle('hide', !on); const jz = $('#lbJz'); if (jz) jz.style.display = on ? 'none' : ''; const b = $('#lbCam'); if (b) b.classList.toggle('on', on); if (on) { st.joy = { x: 0, y: 0, m: 0 }; this.msg(st, '🎥 Cámara libre: arrastra para mirar, pellizca para acercar', 'b'); } };
    this._camLibre = libre;
    $('#lbCam').onclick = () => libre(!st.camLibre); $('#lbCamV').onclick = () => libre(false);
    const zoom = f => { if (st.camLibre) st.cam.k = clamp(st.cam.k * f, .12, 7); else st.zoomU = clamp((st.zoomU || 1) * f, .3, 3.2); };
    $('#lbCamM').onclick = () => zoom(1 / 1.35); $('#lbCamMas').onclick = () => zoom(1.35);
    $('#lbCamA').onclick = () => { const s = Save.d.settings; s.angulo = ((s.angulo | 0) + 1) % VC.ANGULOS.length; const A = VC.angulo(s.angulo); $('#lbCamAn').textContent = A.n; Save.write(); this.msg(st, '📐 Ángulo: ' + A.n, 'b'); };
    this._zoom = zoom; this.camGestos(st);
  },
  camGestos(st) {
    const cv = $('#gcv'); if (!cv) return; if (this._cg) this._cg(); const T = new Map(); let pinch = null;
    const down = e => { T.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (T.size === 2) { const [a, b] = [...T.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: st.cam.k, z: st.zoomU || 1 }; } };
    const move = e => { const q = T.get(e.pointerId); if (!q) return; const nx = e.clientX, ny = e.clientY;
      if (T.size >= 2 && pinch) { q.x = nx; q.y = ny; const [a, b] = [...T.values()], f = Math.hypot(a.x - b.x, a.y - b.y) / Math.max(12, pinch.d); if (st.camLibre) st.cam.k = clamp(pinch.k * f, .12, 7); else st.zoomU = clamp(pinch.z * f, .3, 3.2); return; }
      if (st.camLibre && T.size === 1) { st.cam.x -= (nx - q.x) / st.cam.k; st.cam.y -= (ny - q.y) / st.cam.k; } q.x = nx; q.y = ny; };
    const up = e => { T.delete(e.pointerId); if (T.size < 2) pinch = null; };
    const wheel = e => { e.preventDefault(); if (this._zoom) this._zoom(Math.exp(-clamp(e.deltaY, -120, 120) * .0016)); };
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('wheel', wheel, { passive: false });
    this._cg = () => { cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up); cv.removeEventListener('wheel', wheel); this._cg = null; };
  },
  photo(st) { if (st.trama && Trama.onPhoto(st)) return; const J = st.job; if (J && J.k === 'postal' && dist(st.x, st.y, J.x, J.y) < 70) { st.flash = .4; this.complete(st); return; } const L = Ciudad.lm.find(l => dist(l.x, l.y, st.x, st.y) < 70); st.flash = .4; this.sfx(st, 'ok'); if (L) { const F = Save.d.fotos || (Save.d.fotos = []); if (!F.includes(L.name)) { F.push(L.name); Save.d.wallet += 20; this.msg(st, '📷 ' + L.name + ' · nueva postal +20 🎫', 'g'); this.msg(st, L.fact, 'y'); Save.write(); } else this.msg(st, '📷 ' + L.name, 'b'); } else this.msg(st, '📷 Foto del valle', 'b'); },
  key(st, k, down) { if (down && (k === '+' || k === '=') && this._zoom) { this._zoom(1.25); return; } if (down && (k === '-' || k === '_') && this._zoom) { this._zoom(1 / 1.25); return; } if (down && (k === 'c' || k === 'C') && this._camLibre) { this._camLibre(!st.camLibre); return; } const m = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ' ': 'hb', Shift: 'run' }[k]; if (m) { st.keys[m] = down; if (m === 'hb') st.hb = down; if (m === 'run') st.run = down; const kx = (st.keys.right ? 1 : 0) - (st.keys.left ? 1 : 0), ky = (st.keys.down ? 1 : 0) - (st.keys.up ? 1 : 0); if (st.mode !== 'veh') st.joy = { x: kx, y: ky, m: Math.min(1, Math.hypot(kx, ky)) }; else st.joy = { x: 0, y: 0, m: 0 }; return; } if (!down) return; if (k === 'e' || k === 'Enter') { st.act = 1; this.action(st); setTimeout(() => { st.act = 0; }, 3500); } if (k === 'f') this.photo(st); if (k === 'z') st.far = !st.far; if (k === 'h' || k === 'q') { Snd.play('horn'); for (const c of Ciudad.cars) if (dist(c.x, c.y, st.x, st.y) < 40) c.stop = Math.max(c.stop, .8); } },
  /* ---------- dibujo ---------- */
  draw(g, st, vp) {
    const W = vp.w, H = vp.h, k = st.cam.k * (W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W)), L = Mundo.light(), night = L.night, sh = Ciudad.shadowDir();
    const shx = st.shake > 0 ? (Math.random() - .5) * 6 : 0, shy = st.shake > 0 ? (Math.random() - .5) * 6 : 0, mx = Math.round(st.cam.x * k) / k, my = Math.round(st.cam.y * k) / k, S = (x, y) => ({ x: W / 2 + (x - mx) * k + shx, y: H / 2 + (y - my) * k + shy }), x0 = mx - W / 2 / k, y0 = my - H / 2 / k, x1 = mx + W / 2 / k, y1 = my + H / 2 / k;
    g.fillStyle = '#3a6b45'; g.fillRect(0, 0, W, H); if (MAP.ready) { if (k < .3) { const m = MAP.mini(), s = k * MAP.miniK; g.imageSmoothingEnabled = false; g.drawImage(m, W / 2 - mx * k, H / 2 - my * k, m.width * s, m.height * s); } else MAP.drawTop(g, W, H, mx, my, k); }
    Ciudad.landmarks(g, S, k, x0, y0, x1, y1); Ciudad.stations(g, S, k, x0, y0, x1, y1, VC.on ? 'piso' : null); Ciudad.marksDraw(g, S, k);
    // estaciones de EnCicla: anclaje azul con postes verdes y tótem
    for (const D of st.docks || []) {
      if (D.x < x0 - 12 || D.x > x1 + 12 || D.y < y0 - 12 || D.y > y1 + 12) continue; const q = S(D.x, D.y);
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(q.x - 3.6 * k + 2, q.y + .2 * k + 2, 7.2 * k, 1.6 * k); g.fillStyle = '#0e2d55'; g.fillRect(q.x - 3.6 * k, q.y + .2 * k, 7.2 * k, 1.6 * k);
      g.fillStyle = '#9bd341'; for (let i = 0; i < 5; i++) g.fillRect(q.x - 3.2 * k + i * 1.5 * k, q.y + .45 * k, .35 * k, 1.1 * k);
      g.fillStyle = '#0e2d55'; g.fillRect(q.x + 3.9 * k, q.y - .9 * k, .9 * k, 2.6 * k); g.fillStyle = '#9bd341'; g.fillRect(q.x + 4.05 * k, q.y - .7 * k, .6 * k, .6 * k);
      if (k > 2.2 && !st.far) { g.font = '700 ' + Math.round(clamp(k * 3, 10, 13)) + 'px Cuerpo, sans-serif'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.9)'; g.strokeText('EnCicla · ' + D.n, q.x, q.y - 1.8 * k); g.fillStyle = '#0e2d55'; g.fillText('EnCicla · ' + D.n, q.x, q.y - 1.8 * k); g.textAlign = 'left'; }
    }
    // vehículos parqueados
    for (const p of st.parked) { if (p.x < x0 - 20 || p.x > x1 + 20 || p.y < y0 - 20 || p.y > y1 + 20) continue; const V = VEH[p.kind]; if (p.kind === 'bici') { const q = S(p.x, p.y); g.save(); g.translate(q.x, q.y); g.rotate(p.a); g.fillStyle = PAL.negro; g.fillRect(-1.1 * k, -.5 * k, 2.2 * k, 1 * k); g.fillStyle = V.col; g.fillRect(-.9 * k, -.3 * k, 1.8 * k, .6 * k); g.restore(); } else Ciudad.car(g, p.x, p.y, p.a, V.len, V.wid, V.col, p.kind === 'alimentador' ? 'feeder' : p.kind === 'metroplus' ? 'brt' : p.kind === 'moto' ? 'moto' : 'car', S, k, sh, night, false); }
    Ciudad.transitDraw(g, S, k, sh, night, x0, y0, x1, y1, VC.on ? 'piso' : null);
    // a ras de piso: gente, carros y el jugador, en orden de pintura con los edificios que les quedan delante (así los tapan)
    const yo = typeof Perfil !== 'undefined' ? Perfil.ped() : { col: '#1C5C9C', skin: SKIN[1] }, pz = st.z || 0, ob = VC.ob, SZ = h => h ? (x, y) => S(x, y - h * ob) : S, hz = pz && VC.PG ? ((VC.puenteEn(st.x, st.y, pz, .8) || { h: 0 }).h) : 0, Sj = SZ(hz);
    const dibJug = () => { if (st.mode === 'veh') { const V = this.V(st); if (st.veh.kind === 'bici') { const q = Sj(st.x, st.y); g.save(); g.translate(q.x, q.y); g.rotate(st.h); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-1 * k + sh.dx * k, -.4 * k + sh.dy * k, 2 * k, .8 * k); g.fillStyle = PAL.negro; g.fillRect(-1.1 * k, -.45 * k, 2.2 * k, .9 * k); g.fillStyle = V.col; g.fillRect(-.9 * k, -.25 * k, 1.8 * k, .5 * k); g.restore(); Ciudad.ped(g, Object.assign({ x: st.x, y: st.y, a: st.h, ph: st.t * 8, seed: 7, stun: 0 }, yo), Sj, k, sh); } else if (V.art) Ciudad.articulado(g, st.x, st.y, st.h, st.h2 == null ? st.h : st.h2, V, Sj, k, sh, night, true); else Ciudad.car(g, st.x, st.y, st.h, V.len, V.wid, V.col, st.veh.kind === 'alimentador' ? 'feeder' : st.veh.kind === 'moto' ? 'moto' : 'car', Sj, k, sh, night, true); } if (st.mode === 'walk') Ciudad.ped(g, Object.assign({ x: st.x, y: st.y, a: st.h, ph: st.t * (st.run ? 14 : 8) * (st.wv > .2 ? 1 : 0), seed: 7, stun: 0, umb: L.w.rain && !yo.gorro }, yo), Sj, k, sh); };
    const altos = [], items = [];
    for (const c of Ciudad.cars) { const h = VC.PG ? VC.carAlto(c) : 0, Sc = SZ(h); if (h > .4) { altos.push([c.z || 1, () => { Ciudad.car(g, c.x, c.y, c.a, c.kind === 'bus' ? 12 : c.kind === 'moto' ? 2 : 4.4, c.kind === 'moto' ? .8 : c.kind === 'bus' ? 2.5 : 1.8, c.col, c.kind, Sc, k, sh, night, true); }]); continue; } items.push({ x: c.x, y: c.y, r: c.kind === 'bus' ? 6 : 2.5, a: c.kind === 'bus' ? 3.2 : 1.6, f: () => { Ciudad.car(g, c.x, c.y, c.a, c.kind === 'bus' ? 12 : c.kind === 'moto' ? 2 : 4.4, c.kind === 'moto' ? .8 : c.kind === 'bus' ? 2.5 : 1.8, c.col, c.kind, Sc, k, sh, night, true); } }); }
    for (const p of Ciudad.peds) if (p.x > x0 - 5 && p.x < x1 + 5 && p.y > y0 - 5 && p.y < y1 + 5) items.push({ x: p.x, y: p.y, r: .5, a: 1.8, f: () => { Ciudad.ped(g, p, S, k, sh); if (p.client) { const q = S(p.x, p.y); g.fillStyle = PAL.mostaza; g.strokeStyle = PAL.negro; g.lineWidth = 1.5; g.beginPath(); g.arc(q.x, q.y - 12 * Math.max(.6, k * .4) - 6, 7, 0, TAU); g.fill(); g.stroke(); g.fillStyle = PAL.negro; g.font = '700 11px Cuerpo, sans-serif'; g.textAlign = 'center'; g.fillText('!', q.x, q.y - 12 * Math.max(.6, k * .4) - 2); g.textAlign = 'left'; } } });
    if (typeof Gente !== 'undefined') Gente.items(st, items, g, S, k, sh, x0, y0, x1, y1);
    if (st.mode !== 'ride') { if (!pz) items.push({ x: st.x, y: st.y, r: st.mode === 'veh' ? this.V(st).len / 2 : .6, a: st.mode === 'veh' ? 1.6 : 1.8, f: dibJug }); else altos.push([pz, dibJug]); }
    for (const it of items) it.y = it.y == null ? 0 : it.y;
    const delante = VC.on && VC.ocluir ? VC.ocluir(items) : [];
    for (const b of delante) items.push({ y: b.ym + .01, b });
    items.sort((a, b) => a.y - b.y);
    for (const it of items) { if (it.b) VC.dibEdVista(g, it.b, k, W, H, mx, my, shx, shy); else it.f(); }
    if (st.trama) Trama.draw(g, st, S, k, sh);
    // arriba, por niveles: puentes de nivel 1 con sus carros y el jugador; el viaducto del metro y sus trenes; puentes más altos; cables
    const nivelDib = z => { if (VC.PG) VC.puentesDib(g, S, k, x0, y0, x1, y1, z); for (const [lz, f] of altos) if (lz === z) f(); };
    nivelDib(1);
    if (VC.on) { Ciudad.stations(g, S, k, x0, y0, x1, y1, 'alto'); Ciudad.transitDraw(g, S, k, sh, night, x0, y0, x1, y1, 'alto'); }
    nivelDib(2); nivelDib(3);
    if (VC.on) { Ciudad.stations(g, S, k, x0, y0, x1, y1, 'cable'); Ciudad.transitDraw(g, S, k, sh, night, x0, y0, x1, y1, 'cable'); }
    // el jugador se ve siempre: su anillo encima de todo y, si va por debajo de un tablero, su silueta a través
    if (st.mode !== 'ride') { const q = Sj(st.x, st.y); g.strokeStyle = 'rgba(251,231,176,.9)'; g.lineWidth = 2; g.beginPath(); g.arc(q.x, q.y, (st.mode === 'veh' ? this.V(st).len * .7 : 2.2) * k, 0, TAU); g.stroke(); }
    if (VC.on && !pz && st.mode !== 'ride' && VC.tapado(st.x, st.y)) { g.globalAlpha = .5; dibJug(); g.globalAlpha = 1; }
    Ciudad.partsDraw(g, S, k); Ciudad.bubblesDraw(g, S, k);
    // noche, luces y clima
    if (!EM.headless) { Mundo.overlay(g, W, H, st.t, { noRain: false, noGrain: true }); if (MAP.ready && k >= .3) MAP.lightsTop(g, night, st.t); if (MAP.ready) MAP.drawLabels(g, W, H, mx, my, k, W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W), night); Ciudad.streetLights(g, S, k, night, x0, y0, x1, y1, W, H); if (night > .3 && st.mode === 'veh') { const q = S(st.x, st.y); g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(q.x, q.y, 0, q.x, q.y, 30 * k); gr.addColorStop(0, 'rgba(255,240,200,' + (.18 * night) + ')'); gr.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gr; g.fillRect(q.x - 30 * k, q.y - 30 * k, 60 * k, 60 * k); g.restore(); } Mundo.grain(g, W, H); }
    // objetivo: flecha al borde y marcador (la historia tiene prioridad sobre los oficios)
    const J = st.goal || st.job || st.guia; if (J && J.x != null) { const q = S(J.x, J.y), inside = q.x > 20 && q.x < W - 20 && q.y > 60 && q.y < H - 20; if (inside) { g.strokeStyle = PAL.mostaza; g.lineWidth = 3; g.beginPath(); g.arc(q.x, q.y, 10 + 4 * Math.sin(st.t * 5), 0, TAU); g.stroke(); g.fillStyle = PAL.mostaza; g.beginPath(); g.moveTo(q.x, q.y - 26); g.lineTo(q.x - 7, q.y - 38); g.lineTo(q.x + 7, q.y - 38); g.fill(); } else { const a = Math.atan2(J.y - st.y, J.x - st.x), cx = W / 2, cy = H / 2, r = Math.min(W, H) * .4, ax = cx + Math.cos(a) * r, ay = cy + Math.sin(a) * r; g.save(); g.translate(ax, ay); g.rotate(a); g.fillStyle = PAL.mostaza; g.strokeStyle = PAL.negro; g.lineWidth = 2; g.beginPath(); g.moveTo(16, 0); g.lineTo(-10, -11); g.lineTo(-4, 0); g.lineTo(-10, 11); g.closePath(); g.fill(); g.stroke(); g.restore(); } }
    if (st.flash > 0) { st.flash -= .016; g.fillStyle = 'rgba(255,255,255,' + st.flash * 2 + ')'; g.fillRect(0, 0, W, H); }
    this.minimap(g, st, W, H);
    if (MAP.ready && k >= .3) VC.prefetch(W, H, mx, my, k, st.mode === 'walk' ? 0 : Math.cos(st.h) * st.vf, st.mode === 'walk' ? 0 : Math.sin(st.h) * st.vf);
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
