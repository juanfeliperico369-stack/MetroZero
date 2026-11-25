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
  scooter: { n: 'Patineta eléctrica', len: 1.1, wid: .5, wb: .8, vmax: 25 / 3.6, acc: 2.2, brk: 4.5, smax: .7, srate: 4, grip: 8, lat: 5, col: '#2ec4b6', icon: '🛴', soft: 1, ciclo: 1, monta: 1 },
  monopatin: { n: 'Monopatín eléctrico', len: 1, wid: .32, wb: .62, vmax: 28 / 3.6, acc: 2.4, brk: 4, smax: .55, srate: 3.5, grip: 7, lat: 5, col: '#3f6fd8', icon: '🛹', soft: 1, ciclo: 1, monta: 1 },
  skate: { n: 'Skate', len: .85, wid: .26, wb: .5, vmax: 18 / 3.6, acc: 1.4, brk: 2.5, smax: .6, srate: 3.5, grip: 7, lat: 4.5, col: '#f08a4b', icon: '🛹', soft: 1, ciclo: 1, walk: 1, monta: 1 },
  patines: { n: 'Patines', len: .5, wid: .42, wb: .35, vmax: 17 / 3.6, acc: 1.5, brk: 2.8, smax: .9, srate: 5, grip: 7, lat: 4.5, col: '#ff8fc7', icon: '🛼', soft: 1, ciclo: 1, walk: 1, monta: 1 },
  carro: { n: 'Carro particular', len: 4.2, wid: 1.75, wb: 2.5, vmax: 90 / 3.6, acc: 3, brk: 7, smax: .6, srate: 2.3, grip: 6, lat: 8, col: '#c0392b', icon: '🚗', soft: 1 },
  bus: { n: 'Bus de ruta', len: 10.5, wid: 2.45, wb: 5.4, vmax: 60 / 3.6, acc: 1.3, brk: 3.2, smax: .55, srate: 1.4, grip: 5, lat: 4.4, col: '#f6c538', icon: '🚌', soft: 0 },
  metroplus: { n: 'Articulado Metroplús', len: 18, wid: 2.55, wb: 6.5, vmax: 65 / 3.6, acc: 1.05, brk: 2.8, smax: .5, srate: 1.15, grip: 5, lat: 3.8, art: 5.6, col: '#0E6F76', icon: '🚌', soft: 0 }
};
/* pieza del taller de arte para cada vehículo, alto de los pies del que va de pie encima (null: va sentado o adentro) y 1 si la pieza trae su conductor sentado */
const MALLA3 = { skate: ['skate', .16], patines: ['patines', .2], monopatin: ['scooter', .16], scooter: ['electrico', .24], bici: ['bici', null, 1], moto: ['moto', null, 1], taxi: ['taxi', null], carro: ['carro', null], camioneta: ['camioneta', null], bus: ['bus', null], alimentador: ['alimentador', null] };
const SOLID_V = new Set([TT.MOUNT, TT.BRICK, TT.BLDG, TT.WATER, TT.CANAL, TT.LAND]), SOLID_W = new Set([TT.BRICK, TT.BLDG, TT.LAND, TT.WATER, TT.CANAL]);
Music.SONGS.ciudad = { bpm: 100, root: 55, sc: [0, 2, 3, 5, 7, 9, 10], prog: [0, 3, 4, 3], bass: [1, 0, 0, 1, 0, 0, 1, 0], mel: .4, w: 'triangle' };
const Libre = EM.modes.libre = {
  id: 'libre', name: 'Ciudad Libre', sub: 'Recorre el valle', music: 'ciudad', fullCanvas: true, endless: true,
  tip: 'Un solo mundo 3D del Valle de Aburrá: cambia entre 3D Cenital 🛰, 3ª persona 🎮, 1ª persona 👁, Panorámica 🏔, Cine 🎬 o 2D/Pixel 🗺. Usa ⏫ para acelerador fijo, 📋 para abrir cualquier modo o zona Skate/Parkour y tu diario RPG, ● para subir/abordar y M o el minimapa para viajar.',
  substeps: true,
  RITMOS: [['×1', 1, 1], ['×1,5', 1.5, 3], ['×2', 2, 6]],   // [rótulo, a pie y manejando, en metro, cable, tranvía o bus]
  escala(st) { const R = this.RITMOS[clamp(Save.d.settings.ritmo | 0, 0, 2)]; return st.mode === 'ride' ? R[2] : R[1]; },
  /* 3.11.0 · LA CÁMARA ÚNICA (el autor, 25‑nov‑2026: «Hay que eliminar las cámaras, la de maqueta, la de panorámica 2D, etc. Ya
     dije que debe prevalecer» el mundo 3D en «vista cenital de cámara más bien centrada y que se puede mover al gusto, acercarse y
     alejarse, y así añadiría un poco la forma de tercera persona»). En la Ciudad Libre queda la 3D Cenital; sin WebGL o en calidad
     baja, el 2D de respaldo (no se elige). Se fueron la tercera y la primera persona, la panorámica y el cine como cámaras.
     El 👁 pasa por cuatro acercamientos (ZOOMS): de lejos, cenital, de cerca y casi tercera persona; desde el zoom 2 la cámara baja
     (hasta unos 40°, con el ojo a 8 m o más) y se va detrás del rumbo, y la palanca gira con ella. Pellizcar acerca y aleja, arrastrar inclina, 📐 cambia el
     ángulo de base y 🎥 suelta la cámara para mirar la ciudad. */
  VISTAS: [['cen3d', '🛰', '3D Cenital']],
  ZOOMS: [[.55, '🛰', 'de lejos'], [1, '🗺', 'cenital'], [2, '🔎', 'de cerca'], [3.6, '🎮', 'casi tercera persona']], ZU_MAX: 4,   /* 3.11.1: de cerca, una cámara de persecución alta (unos 40° y el ojo a 8 m o más), no pegada a las paredes */
  zoomPreset(st) { const z = st.zoomU || 1; let i = 0, d = 1e9; this.ZOOMS.forEach((q, k) => { const e = Math.abs(Math.log(z / q[0])); if (e < d) { d = e; i = k; } }); return i; },
  gl(st) { return !!st.vista3 && !EM.headless && Save.d.settings.q !== 'low' && G3.init(); },
  vista(st, v) {
    v = 'cen3d';   /* 3.11.0: la cámara única */
    if (EM.headless || Save.d.settings.q === 'low' || !G3.init()) { this.msg(st, 'La vista 3D necesita «Calidad gráfica: Normal» y WebGL', 'y'); v = '2d'; }
    st.vista3 = v === '2d' ? null : v; st.cy = st.h; st.cyo = 0; st.cpo = 0; st._cine = null; st._ec = null;
    Save.d.settings.vistaL = v; Save.write();
    const A = this.VISTAS.find(q => q[0] === v) || this.VISTAS[0]; this.msg(st, A[1] + ' ' + A[2], 'b'); this.updCtl(st);
  },
  /* joystick coherente con la cámara: en 3D Cenital y 2D el norte es arriba; en 3p/1p/dron/cine sigue el rumbo de la cámara */
  joyMundo(st) { const j = st.joy; if (!st.vista3 || !j.m) return j;
    if (st.vista3 === 'cen3d') { const F = st.fangC; if (F == null || Math.abs(Math.atan2(Math.sin(F + Math.PI / 2), Math.cos(F + Math.PI / 2))) < 1e-3) return j; const a = F + Math.atan2(j.x, -j.y); return { x: Math.cos(a) * j.m, y: Math.sin(a) * j.m, m: j.m }; }   /* 3.11.0: de cerca, arriba es hacia donde mira la cámara */ const a = (st.cy || 0) + (st.cyo || 0) + Math.atan2(j.x, -j.y); return { x: Math.cos(a) * j.m, y: Math.sin(a) * j.m, m: j.m }; },
  STARTS: ['San Antonio', 'Niquía', 'Acevedo', 'San Javier', 'Poblado', 'Envigado', 'Itagüí', 'Bello', 'Industriales', 'Parque Berrío', 'La Estrella', 'Santo Domingo Savio', 'Estadio', 'Caribe'],
  levels() { const L = [{ id: 'lb:trama', name: '📖 Historia en la ciudad', sub: 'La última vuelta, jugada en el mapa' }, { id: 'lb:ultimo', name: 'Donde quedé', sub: 'Sigue tu recorrido' }, { id: 'lb:mapa', name: '🗺 Elegir en el mapa', sub: 'Mira todo el valle y escoge dónde empezar' }]; for (const n of this.STARTS) if (NET.stations.find(h => h.name === n)) L.push({ id: 'lb:' + n, name: n, sub: 'Empieza en la estación ' + n }); return L; },
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
    let start; if ((lv === 'lb:ultimo' || (trama && !fresh)) && sv.x) start = { x: sv.x, y: sv.y }; else { const h = this.hub(trama ? 'Niquía' : lv === 'lb:mapa' ? 'San Antonio' : lv.startsWith('lb:') ? lv.slice(3) : 'San Antonio'); start = this.libre(h.x, h.y, v => v === TT.WALK || v === TT.PLAZA || v === TT.STATION, 6); }
    const st = { lvId: lv, x: start.x, y: start.y, h: -Math.PI / 2, vf: 0, vs: 0, steer: 0, mode: 'walk', veh: null, ride: null, hb: false, run: false, acelFijo: false, jumpY: 0, jumpVy: 0, trickSpin: 0, combo: 0, comboT: 0, joy: { x: 0, y: 0, m: 0 }, keys: {}, t: 0, dmg: 0, job: null, jobT: 18, jobs: 0, pay: 0, crashes: 0, peds: 0, km: 0, photos: [], visited: Object.assign({}, sv.visited || {}), cam: { x: start.x, y: start.y, k: 3 }, z: 0, far: false, parked: [], msg: [], shake: 0, seed: opts.seed | 0, act: 0, actHold: 0, done: false, auto: !!opts.auto, radio: 0, lastHub: null, near: null, engine: 0 };
    // vehículos parqueados: taxis y bicis en las estaciones, camionetas en el taller de Bello, alimentadores en sus cabeceras, articulados en Metroplús
    const park = (kind, x, y, a) => { const p = this.nearTile(x, y, v => v === TT.ROAD || v === TT.AVE || v === TT.DEPOT || v === TT.WALK, 7); st.parked.push({ kind, x: p.x, y: p.y, a: a != null ? a : rng.f() * TAU, id: st.parked.length }); };
    // estaciones de EnCicla (src/data/encicla.js, de Juega EnCicla): anclajes con 2 a 4 bicis
    st.docks = []; if (typeof ENCICLA !== 'undefined') ENCICLA.estaciones.forEach(([n, mu, la, lo, tp], i) => { const q = geoM(la, lo), p = this.nearTile(q.x, q.y, v => v === TT.WALK || v === TT.PLAZA || v === TT.STATION || v === TT.GRASS, 5); st.docks.push({ n, mu, tp, x: p.x, y: p.y }); for (let b = 0, nb = 2 + (h2(i, 7, 5) * 3 | 0); b < nb; b++) st.parked.push({ kind: 'bici', x: p.x - 2.4 + b * 1.4, y: p.y + 1.6, a: Math.PI / 2, id: st.parked.length, dock: i }); });
    for (const h of NET.stations) { if (!h.lines.some(l => l.kind === 'metro' || l.kind === 'tram')) continue; park('taxi', h.x + 30, h.y + 14); if (!st.docks.length && rng.f() < .7) park('bici', h.x - 24, h.y + 10); if (rng.f() < .25) park('moto', h.x + 18, h.y - 26); }
    for (const h of NET.stations) { if (!h.lines.some(l => l.kind === 'metro' || l.kind === 'tram' || l.kind === 'brt')) continue; if (rng.f() < .4) park('scooter', h.x - 22, h.y - 16); if (rng.f() < .16) park('monopatin', h.x + 26, h.y - 10); if (rng.f() < .2) park('carro', h.x - 34, h.y + 24); }
    for (const H of (VC.HT || [])) if (rng.f() < .55) park(rng.f() < .5 ? 'skate' : 'patines', H.cx + 12, H.y1 + 10);
    for (const l of NET.lines) if (l.kind === 'feeder' && rng.f() < .45) { const e = l.st[l.st.length - 1]; park('bus', e.x + 14, e.y + 12, NET.at(l.P, Math.max(0, l.P.len - 5)).a); }
    const bello = this.hub('Bello'); park('camioneta', bello.x + 60, bello.y + 40); park('camioneta', bello.x - 50, bello.y + 70); const sa = this.hub('San Antonio'); park('camioneta', sa.x + 60, sa.y - 50);
    for (const l of NET.lines) { if (l.kind === 'feeder') park('alimentador', l.st[0].x, l.st[0].y, NET.at(l.P, 5).a); if (l.kind === 'brt') { park('metroplus', l.st[0].x, l.st[0].y, NET.at(l.P, 5).a); park('metroplus', l.st[l.st.length - 1].x, l.st[l.st.length - 1].y, NET.at(l.P, l.P.len - 5).a + Math.PI); } }
    if (sv.veh && (lv === 'lb:ultimo' || (trama && !fresh)) && VEH[sv.veh]) { st.parked = st.parked.filter(p => !(p.kind === sv.veh && dist(p.x, p.y, st.x, st.y) < 40)); st.veh = { kind: sv.veh, col: VEH[sv.veh].col, id: -1 }; st.mode = 'veh'; st.h = sv.h || st.h; }
    if (trama) Trama.init(st);
    if (lv === 'lb:mapa') st.abrirMapa = 1;
    const prefV = Save.d.settings.vistaL || 'cen3d';
    st.vista3 = prefV !== '2d' && !EM.headless && Save.d.settings.q !== 'low' ? 'cen3d' : null; st.cy = st.h;   /* 3.11.0: la cámara única (un guardado de 3ª, 1ª, panorámica o cine vuelve a la 3D Cenital) */
    st.inicio = { x: st.x, y: st.y }; st.h2 = st.h; st.thr = 0; st.wv = 0; st._crEspera = 25; if (typeof Gente !== 'undefined') Gente.crear(st);
    if (EM.mundoRPG && EM.mundoRPG.initLibre) EM.mundoRPG.initLibre(st);
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
      const V = this.V(st); st.parked.push({ kind: st.veh.kind, x: st.x, y: st.y, a: st.h, id: st.parked.length }); st.veh = null; st.mode = 'walk'; st.vf = st.vs = 0; st.acelFijo = false; const t = this.libre(st.x - Math.sin(st.h) * (V.wid + 1.2), st.y + Math.cos(st.h) * (V.wid + 1.2), q => WALK_OK.has(q), 3); st.x = t.x; st.y = t.y; this.sfx(st, 'door'); if (st.job && st.job.k === 'ruta') this.fail(st, 'dejaste el bus'); if (st.job && st.job.k === 'taxi' && st.job.stage === 1) this.fail(st, 'dejaste al pasajero'); return;
    }
    // a pie: personaje de la historia, vehículo cercano, transporte en la estación, persona
    if (st.trama && Trama.onAction(st)) return;
    const np = typeof Gente !== 'undefined' ? Gente.cerca(st, 3.4) : null; if (np) { const dn = dist(np.x, np.y, st.x, st.y), dv = st.parked.reduce((m, q) => Math.min(m, dist(q.x, q.y, st.x, st.y) - VEH[q.kind].len / 2), 1e9); if (!(dv < dn)) { Gente.hablar(st, np); return; } }   // con un vehículo más cerca que la persona, gana el vehículo
    let best = null, bd = 4.5; for (const p of st.parked) { const d = dist(p.x, p.y, st.x, st.y); if (d < bd + VEH[p.kind].len / 2) { bd = d; best = p; } }
    if (best && best.dock != null && !EM.headless) { const Hh = enciclaHorario(new Date()); if (!Hh.abierto) { this.msg(st, '🚲 EnCicla no presta a esta hora: ' + Hh.txt, 'y'); return; } }
    if (best) { st.parked = st.parked.filter(p => p !== best); st.veh = { kind: best.kind, col: VEH[best.kind].col, id: best.id }; st.mode = 'veh'; st.x = best.x; st.y = best.y; st.h = best.a; st.vf = st.vs = 0; st.steer = 0; st.acelFijo = false; if (Save.d.settings.crucero && this.crucero && !st.auto) this.crucero(st, true); this.msg(st, VEH[best.kind].icon + ' ' + VEH[best.kind].n + (best.kind === 'bici' ? ' · pedalea con ▲ o ⏫' : ' · ▲ acelera · ⏫ fijo · ✋ derrapa'), 'b'); if (best.dock != null) this.prestar(st, best.dock); this.sfx(st, 'door'); if (st.jobT > 4) st.jobT = 4; return; }
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
  /* salto y truco en vivo en zonas Skate/Parkour o con skate/patines/patineta */
  saltaTruco(st) {
    const z = EM.mundoRPG && EM.mundoRPG.enZona ? EM.mundoRPG.enZona(st) : null;
    const V = this.V(st), puede = !!z || (V && V.monta);
    if (!puede) return false;
    if ((st.jumpY || 0) <= .05) {
      st.jumpVy = z ? 8.2 : 6.4; st.jumpY = .12; st.trickSpin = 1;
      st.combo = Math.min(5, (st.combo || 0) + 1); st.comboT = 4.5;
      const trucos = st.mode === 'walk' ? ['Salto Parkour', 'Bóveda', 'Salto de precisión'] : ['Ollie', 'Kickflip', '360° Valle', 'Grind Aéreo'];
      const nom = trucos[(Math.floor(st.t * 10) + st.combo) % trucos.length], pts = (z ? 15 : 6) * st.combo;
      if (z) { Save.d.wallet += Math.min(25, Math.ceil(pts / 5)); if (Save.d.rpg) { Save.d.rpg.trucos = (Save.d.rpg.trucos || 0) + 1; Save.d.rpg.xp.ciclovia = (Save.d.rpg.xp.ciclovia || 0) + 12; } Save.write(); }
      this.msg(st, '★ ' + nom + (z ? ' en ' + z.n + ' · ×' + st.combo + ' (+' + Math.min(25, Math.ceil(pts / 5)) + ' 🎫)' : ' · ×' + st.combo), 'g');
      this.sfx(st, 'star'); vib(22);
      return true;
    }
    return false;
  },
  nearHub(st, r) { let best = null, bd = r; for (const h of NET.stations) { const d = dist(h.x, h.y, st.x, st.y); if (d < bd) { bd = d; best = h; } } return best; },
  /* ---------- física ---------- */
  step(st, dt) {
    if (st.done) return; st.t += dt; const J = st.job;
    if (st.prestamo) { const P = st.prestamo; P.min += dt / 10; if (P.min > 60 && !P.avisado) { P.avisado = 1; this.msg(st, '⏰ Pasó la hora del préstamo: devuelve o renueva la bici en una estación EnCicla', 'y'); } }   // 10 s de juego = 1 minuto de préstamo
    if (st.jumpY > 0 || st.jumpVy > 0) { st.jumpVy -= 22 * dt; st.jumpY = Math.max(0, st.jumpY + st.jumpVy * dt); if (st.jumpY === 0) st.jumpVy = 0; }
    if (st.trickSpin > 0) st.trickSpin = Math.max(0, st.trickSpin - dt * 2.4);
    if (st.comboT > 0) { st.comboT -= dt; if (st.comboT <= 0) st.combo = 0; }
    if (st.hb) {
      const z = EM.mundoRPG && EM.mundoRPG.enZona ? EM.mundoRPG.enZona(st) : null;
      if (z || (st.mode === 'veh' && this.V(st).monta)) { st.hb = false; this.saltaTruco(st); }
      else if (st.mode === 'veh' && st.veh.kind === 'bici') { st.hb = false; this.timbre(st); }
    }
    if (st.auto) { st.joy = { x: Math.sin(st.t * .3), y: -.8, m: 1 }; if (Math.floor(st.t) % 7 === 0 && !st._a) { st._a = 1; this.action(st); } else if (Math.floor(st.t) % 7) st._a = 0; }
    if (st.trama && st.trama.talk) { st.joy = { x: 0, y: 0, m: 0 }; st.keys.up = st.keys.down = false; }
    if (st.charla) { st.joy = { x: 0, y: 0, m: 0 }; st.keys.up = st.keys.down = false; } const wdt = dt;
    if (st.mode === 'ride') { const p = Ciudad.tpos(st.ride); st.x = p.x; st.y = p.y; st.h = p.a + (st.ride.dir < 0 ? Math.PI : 0); st.vf = st.ride.v || 0; const v = st.ride; if (v.ph === 'dwell' && v.st && st._lastSt !== v.st) { st._lastSt = v.st; st.visited[v.st.name] = 1; this.msg(st, '🚉 ' + v.st.name + ' · ● para bajarte', 'b'); if (NET.fact(v.st.name) && Ciudad.rng.f() < .5) this.msg(st, NET.fact(v.st.name), 'y'); } }
    else if (st.mode === 'veh') this.drive(st, dt);
    else this.walk(st, dt);
    Ciudad.tick(wdt, { x: st.x, y: st.y, z: st.z || 0, h: st.h, vf: st.vf, veh: st.mode === 'veh' ? this.V(st) : null, onPed: p => { st.peds++; st.crashesJ = 1; Save.d.wallet = Math.max(0, Save.d.wallet - 30); st.vf *= .5; this.msg(st, '¡Casi atropellas a alguien! −30 🎫 · Cultura Metro: el peatón primero', 'r'); this.sfx(st, 'bad'); vib(120); Ciudad.say(p, '¡Uy, cuidado!'); }, onCar: c => { if (Math.abs(st.vf) < 1) return; st.crashes++; st.crashesJ = 1; st.dmg += Math.abs(st.vf); st.vf *= .3; st.shake = .35; this.sfx(st, 'crash'); this.msg(st, 'Choque con un ' + (c.kind === 'moto' ? 'motociclista' : c.kind === 'taxi' ? 'taxi' : c.kind === 'bus' ? 'bus' : 'carro'), 'r'); vib(100); } });
    this.acomoda(st); this.jobTick(st, dt); if (st.trama) Trama.tick(st, dt); if (typeof Gente !== 'undefined') Gente.tick(st, dt); if (EM.mundoRPG && EM.mundoRPG.tick) EM.mundoRPG.tick(st, dt); this.vigila(st, dt); const hub = this.nearHub(st, 40); if (hub && hub !== st.lastHub) { st.lastHub = hub; st.visited[hub.name] = 1; }
    if (st.shake > 0) st.shake -= dt;
    // cámara: sigue al jugador con adelanto y zoom según la velocidad
    const V = this.V(st), kT = st.far ? .42 : st.mode === 'walk' ? 2.1 : st.mode === 'ride' ? (st.ride.line.kind === 'cable' ? 1.5 : 1.15) : st.veh.kind === 'bici' ? 1.8 : lerp(1.7, 1.05, clamp(Math.abs(st.vf) / V.vmax, 0, 1));
    if (!st.camLibre) { st.cam.k += (kT * (st.zoomU || 1) - st.cam.k) * Math.min(1, dt * 2); const lead = st.mode === 'walk' ? 6 : 1.1 * st.vf; st.cam.x += (st.x + Math.cos(st.h) * lead - st.cam.x) * Math.min(1, dt * 4); st.cam.y += (st.y + Math.sin(st.h) * lead - st.cam.y) * Math.min(1, dt * 4); }
    if (st.vista3 && st.vista3 !== 'cen3d') { const mov = st.vista3 === '1p' || st.mode === 'ride' || Math.abs(st.vf) > .6, d = Math.atan2(Math.sin(st.h - (st.cy || 0)), Math.cos(st.h - (st.cy || 0))); if (st.cy == null) st.cy = st.h; if (mov) st.cy += d * Math.min(1, dt * (st.vista3 === '1p' ? 12 : st.vista3 === 'dron' ? .5 : st.mode === 'walk' ? 1.5 : 2.6)); else if (st.vista3 === 'dron') st.cy += dt * .07; }
    if ((st._sv = (st._sv || 0) + dt) > 5) { st._sv = 0; this.persist(st); }
  },
  walk(st, dt) {
    // a pie con algo de peso: arranca y para en un instante corto y gira hacia donde apunta el joystick
    const j = this.joyMundo(st), m = j.m > .15, tile = st.z ? TT.ROAD : MAP.tileM(st.x, st.y), spd = m ? (st.run ? 5.2 : 2.4) * (tile === TT.MOUNT ? .45 : tile === TT.GRASS ? .85 : tile === TT.STEPS ? .6 : 1) * clamp(j.m, .3, 1) : 0;
    if (m) { const a = Math.atan2(j.y, j.x); st.wa = a; st.h += Math.atan2(Math.sin(a - st.h), Math.cos(a - st.h)) * (1 - Math.exp(-dt * 16)); }
    const w0 = st.wv || 0; st.wv = w0 + (spd - w0) * (1 - Math.exp(-dt * (spd > w0 ? 11 : 16)));   // 3.1 · igual a cualquier ritmo de cuadros if (st.wv < .03) st.wv = 0; st.vf = st.wv; if (!st.wv) return;
    const a = st.wa != null ? st.wa : st.h, spdN = st.wv, nx = st.x + Math.cos(a) * spdN * dt, ny = st.y + Math.sin(a) * spdN * dt;
    const bloq = (x, y) => VC.on ? VC.solid(x, y, .35) : SOLID_W.has(MAP.tileM(x, y));   // a pie se anda por todo el mapa: solo frenan los edificios y el agua
    const mov = (x, y) => { const r = this.nivel(st, x, y, bloq, true); if (r[0]) { st.x = x; st.y = y; st.z = r[1]; } return r[0]; };
    if (!mov(nx, ny)) { const dx = nx - st.x, dy = ny - st.y, L = Math.hypot(dx, dy); let bx = 0, by = 0;   // 3.0 · a lo largo del muro (Motor City 4.5)
      for (let k = 0; k < 8; k++) { const q = k * Math.PI / 4; if (bloq(nx + Math.cos(q) * .5, ny + Math.sin(q) * .5)) { bx += Math.cos(q); by += Math.sin(q); } }
      const bl = Math.hypot(bx, by); let ok = false; if (bl > .01 && L > 1e-6) { const Nx = -bx / bl, Ny = -by / bl, ux = dx / L, uy = dy / L, d = ux * Nx + uy * Ny; let tx = ux - d * Nx, ty = uy - d * Ny; const tl = Math.hypot(tx, ty); if (tl > .1) ok = mov(st.x + tx / tl * L * tl, st.y + ty / tl * L * tl); }
      if (!ok) mov(nx, st.y) || mov(st.x, ny); }
    st.km += spdN * dt / 1000;
  },
  /* ---------- 3.1 · manejo de Juega EnCicla (BicicletasUno, src/js/30-ride.js: Ride.update), adaptado a Ciudad Libre ----------
     El autor: «el manejo es muy pesado… básate en el de EnCicla, que es mucho más fluido; que se sienta fluido, rápido y que no
     difiera con el tiempo». Como allá: el vehículo apunta hacia donde va el dedo con un giro que sigue al joystick, limitado por la
     velocidad (w0 parado, w1 a toda marcha) y con una inercia corta (tw); arranca rápido hasta la velocidad pedida, frena para tomar
     la curva si el dedo apunta lejos del rumbo y, al soltar, rueda y se detiene solo. Todo con exponenciales del paso de tiempo:
     igual a 30 o a 60 cuadros por segundo. Se queda lo de El Metro: el choque que desliza, el desatascador, la asistencia de carril
     y de paredes, el suelo (andén, pasto, monte), la pendiente real, la lluvia, el freno de mano y los niveles (puentes y deprimidos). */
  ARC: { micro: [5.2, 3, .08, 2.2, .9, .18], bici: [5, 2.7, .09, 2.4, .9, .2], moto: [4.2, 2.2, .1, 4.5, 2.2, .1], carro: [3, 1.45, .13, 5.5, 2.6, .06], bus: [1.9, .85, .2, 9, 3.5, .05] },   // [w0, w1, tw, s hasta la punta, s para frenar, rodada]
  arc(V, kind) { const A = this.ARC[V.monta ? 'micro' : kind === 'bici' ? 'bici' : kind === 'moto' ? 'moto' : (V.art || kind === 'bus' || kind === 'alimentador') ? 'bus' : 'carro'];
    return { w0: A[0], w1: A[1], tw: A[2], max: V.vmax, acc: V.vmax / A[3], brk: V.vmax / A[4], coast: V.vmax * A[5] }; },
  driveArcade(st, dt) {
    const V = this.V(st), kind = st.veh.kind, A = this.arc(V, kind), j = st.joy, k = st.keys, S = Save.d.settings, facil = !st.auto && S.manejo !== 'clasico', wet = Mundo.weather().rain;
    const c0 = Math.cos(st.h), s0 = Math.sin(st.h), gr = st.z ? 0 : clamp((MAP.elevM(st.x + c0 * 8, st.y + s0 * 8) - MAP.elevM(st.x - c0 * 8, st.y - s0 * 8)) / 16, -.2, .2);
    const ag = st.z ? 1 : VC.on ? VC.agarre(st.x, st.y) : 1, blando = ag < .95 && !V.campo;
    const loma = (kind === 'scooter' || kind === 'monopatin') && gr > 0 ? 1 : clamp(1 - (kind === 'bici' || V.monta ? 2.2 : V.art || kind === 'bus' || kind === 'alimentador' ? .9 : 1.1) * gr, .5, 1.3);
    const suelo = blando ? (V.walk || V.monta ? .85 : clamp(.45 + .55 * ag, .4, .9)) : 1, FXk = st.auto ? null : Save.d.settings, tope = A.max * suelo * loma * (FXk && FXk.velo || 1), kw = 1 - Math.exp(-dt / A.tw);   // 3.3 · ⚙️ Flexibilidad: velocidad y giro de quien juega
    const wm = (A.w1 + (A.w0 - A.w1) * clamp(1 - Math.abs(st.vf) / A.max, 0, 1)) * (wet ? .85 : 1) * (st.hb && !V.walk && Math.abs(st.vf) > 4 ? 1.45 : 1) * (FXk && FXk.giro || 1);
    let wT = 0, tv = 0, hay = false;
    if (k.down || st.hb) st.acelFijo = false;
    if (facil && j.m > .15 && !k.left && !k.right) {   // el joystick apunta en el mundo: hacia allá va (y si apunta casi a lo largo de la calle, sigue la calle)
      const jw = this.joyMundo(st); let ta = Math.atan2(jw.y, jw.x); const R = S.asist !== 0 && Math.abs(st.vf) > 2 ? this.rumbo(st, ta) : null; if (R != null && Math.abs(Math.atan2(Math.sin(R - ta), Math.cos(R - ta))) < .3) ta = R;
      const da = Math.atan2(Math.sin(ta - st.h), Math.cos(ta - st.h)); hay = true;
      if (Math.abs(da) > 2.35 && st.vf < 1.5 && !V.walk) { st.acelFijo = false; const db = Math.atan2(Math.sin(ta + Math.PI - st.h), Math.cos(ta + Math.PI - st.h)); wT = clamp(db * 6.5, -wm, wm); tv = -A.max * .3 * j.m; }   // de reversa, con la cola hacia el dedo
      else { wT = clamp(da * 6.5, -wm, wm); tv = Math.max(st.acelFijo ? tope * .84 : 0, tope * j.m * (.3 + .7 * Math.max(0, Math.cos(da)))); }
      st._quiere = ta;
    } else {   // teclas, acelerador fijo (⏫) o joystick clásico
      let giro = k.left ? -1 : k.right ? 1 : 0, ac = k.up ? 1 : st.acelFijo ? .84 : 0, fr = k.down ? 1 : 0;
      if (!facil && j.m > .15) { const ax = Math.abs(j.x); if (ax > .1) giro = Math.sign(j.x) * Math.pow((ax - .1) / .9, 1.3); if (j.y < -.2) ac = Math.max(ac, Math.min(1, (-j.y - .2) / .65)); if (j.y > .25) { fr = Math.max(fr, Math.min(1, (j.y - .25) / .6)); st.acelFijo = false; ac = 0; } }
      hay = !!(giro || ac || fr); wT = giro * wm; tv = ac ? tope * ac : fr ? (st.vf > .5 ? 0 : -A.max * .3 * fr) : 0; st._quiere = st.h + (fr > ac ? Math.PI : 0);
    }
    if (S.asist !== 0 && !st.auto && hay) { const As = this.asistencia(st, V, dt, wT / Math.max(.01, wm), st._quiere); if (As.giro && Math.abs(wT) < wm * .7) wT = clamp(wT + As.giro * wm * .6, -wm, wm); if (As.freno && Math.abs(st.vf) > 9) tv = Math.min(tv, A.max * .5); }
    if (blando && !V.walk && !V.monta && kind !== 'bici' && Math.abs(tv) > 4 + 6 * ag) tv = Math.sign(tv) * (4 + 6 * ag);   // carros y buses, despacio fuera del asfalto
    st._w = (st._w || 0) + ((hay ? wT : 0) - (st._w || 0)) * kw;
    if (hay && tv !== 0) { if (tv > st.vf) st.vf = Math.min(tv, st.vf + Math.min(A.acc, (tv - st.vf) * 2 + .5) * dt); else st.vf = Math.max(tv, st.vf - Math.min(A.brk * (wet ? .7 : 1), (st.vf - tv) * 3.5 + 1) * dt); }
    else if (hay && tv === 0) st.vf -= Math.sign(st.vf) * Math.min(Math.abs(st.vf), A.brk * (wet ? .7 : 1) * dt);
    else st.vf -= Math.sign(st.vf) * Math.min(Math.abs(st.vf), (A.coast * (wet ? .6 : 1) + Math.abs(st.vf) * (V.walk || V.monta || kind === 'bici' ? .35 : .08)) * dt);   // al soltar: rueda y se detiene solo
    if (gr && !(kind === 'scooter' || kind === 'monopatin')) st.vf -= 9.81 * gr * (V.monta || kind === 'bici' ? .35 : .12) * dt;   // la bajada empuja y la subida frena
    const hb = st.hb && !V.walk && Math.abs(st.vf) > 3; if (hb) st.vf *= Math.exp(-.9 * dt);
    const oh = st.h; st.h += st._w * dt * (st.vf < -.2 ? -1 : 1) * Math.min(1, .35 + Math.abs(st.vf) / 3); st._yaw = st._w; st.steer = clamp(Math.atan(st._w * V.wb / Math.max(1.5, Math.abs(st.vf))), -V.smax, V.smax); st.vs = 0;
    const c2 = Math.cos(st.h), s2 = Math.sin(st.h), vx = st.vf * c2, vy = st.vf * s2;
    if (hb) { for (const o of [-1, 1]) { const rx = st.x - c2 * V.len * .38 - s2 * o * V.wid * .42, ry = st.y - s2 * V.len * .38 + c2 * o * V.wid * .42; Ciudad.marks.push({ x1: rx, y1: ry, x2: rx - vx * dt, y2: ry - vy * dt, t: 1 }); } if (!st._drT) { st._drT = 1; this.sfx(st, 'brake'); } } else st._drT = 0;
    if (wet && Math.abs(st.vf) > 8 && Ciudad.rng.f() < .4) Ciudad.parts.push({ x: st.x - c2 * V.len * .3 + (Ciudad.rng.f() - .5) * V.wid, y: st.y - s2 * V.len * .3, vx: -vx * .1, vy: -vy * .1 - 1, t: .4, t0: .4, c: 'rgba(210,230,245,.9)', r: .2 });
    const nx = st.x + vx * dt, ny = st.y + vy * dt, piso = (x, y) => this.hitV(x, y, st.h, V) && !(st.lane && st.lane(x, y)), hit = (x, y) => { const r = this.nivelV(st, x, y, V, piso); st._nz = r[1]; return !r[0]; };
    const x0m = st.x, y0m = st.y; if (st._chT > 0) st._chT -= dt;
    if (!hit(nx, ny)) { st.x = nx; st.y = ny; st.z = st._nz; } else this.deslizar(st, V, nx - st.x, ny - st.y, dt, hit);
    if (st.h !== oh && hit(st.x, st.y)) { const hN = st.h; st.h = oh; if (hit(st.x, st.y)) st.h = hN; else st._w *= .5; }
    this.despues(st, V, dt, hit, x0m, y0m, hay && (Math.abs(tv) > .5), st._quiere != null ? st._quiere : st.h);
    if (V.art) { const h2 = st.h2 == null ? st.h : st.h2, d = Math.atan2(Math.sin(st.h - h2), Math.cos(st.h - h2)); st.h2 = h2 + st.vf / V.art * Math.sin(d) * dt; const d2 = Math.atan2(Math.sin(st.h - st.h2), Math.cos(st.h - st.h2)); if (Math.abs(d2) > .95) st.h2 = st.h - Math.sign(d2) * .95; } else st.h2 = st.h;
    st.km += Math.abs(st.vf) * dt / 1000; st.engine = tv > st.vf ? 1 : 0; st.thr = st.engine;
  },
  drive(st, dt) {
    if (String(st.lvId || '').startsWith('lb:')) return this.driveArcade(st, dt);   // 3.1 · Ciudad Libre maneja como Juega EnCicla; los demás modos (bus) siguen con su modelo
    const V = this.V(st), j = st.joy, k = st.keys, S = Save.d.settings, libre = String(st.lvId || '').startsWith('lb:'), facil = libre && !st.auto && S.manejo !== 'clasico';
    let thrIn = k.up ? 1 : 0, br = k.down ? 1 : 0, sIn = k.left ? -1 : k.right ? 1 : 0, thr, spdF;
    if (libre) {
      // mandos. Teclas y botones: ▲ acelera, ▼ frena, ◀ ▶ giran. Joystick en «fácil»: se apunta hacia donde se quiere ir; el vehículo gira
      // hacia allá con su radio de giro y acelera según lo que se empuje (si se apunta casi a lo largo de la calle, sigue la calle; hacia
      // atrás frena y, ya quieto, da reversa). En «clásico»: los lados giran (con zona muerta y curva fina cerca del centro) y arriba acelera
      if (j.m > .15 && !sIn) {
        if (facil) { const jw = this.joyMundo(st); let a = Math.atan2(jw.y, jw.x); const R = S.asist !== 0 && Math.abs(st.vf) > 2 ? this.rumbo(st, a) : null; if (R != null && Math.abs(Math.atan2(Math.sin(R - a), Math.cos(R - a))) < .3) a = R;
          const d = Math.atan2(Math.sin(a - st.h), Math.cos(a - st.h));
          if (Math.abs(d) > 2.35) { br = Math.max(br, j.m); if (st.vf < 1.2) { const d2 = Math.atan2(Math.sin(a - st.h - Math.PI), Math.cos(a - st.h - Math.PI)); sIn = clamp(-d2 / .6, -1, 1); } }
          else { sIn = clamp(d / .6 - (st._yaw || 0) * .12, -1, 1); thrIn = Math.max(thrIn, j.m * clamp(1.2 - Math.abs(d) / 1.9, .25, 1)); } }   // 3.0 · amortiguado (Motor City 4.5)
        else { const ax = Math.abs(j.x); if (ax > .1) sIn = Math.sign(j.x) * Math.pow((ax - .1) / .9, 1.4); if (j.y < -.2) thrIn = Math.max(thrIn, Math.min(1, (-j.y - .2) / .65)); if (j.y > .25) br = Math.max(br, Math.min(1, (j.y - .25) / .6)); } }
      // pedal con peso: el acelerador entra en ~0,3 s y se suelta más rápido
      st.thr = (st.thr || 0) + (thrIn - (st.thr || 0)) * Math.min(1, dt * (thrIn > (st.thr || 0) ? 3.5 : 7)); thr = st.thr < .02 ? 0 : st.thr;
      // dirección según la velocidad: las ruedas giran solo lo que aguanta el agarre (la aceleración lateral del vehículo), así a 80 km/h
      // un toque no lo voltea, y en la esquina, despacio, gira cerrado; el volante vuelve solo al centro
      if (S.asist !== 0 && !st.auto) { const A = this.asistencia(st, V, dt, sIn, j.m > .15 && facil ? Math.atan2(this.joyMundo(st).y, this.joyMundo(st).x) : null); if (A.giro && Math.abs(sIn) < .7) sIn = clamp(sIn + A.giro, -1, 1); if (A.freno && st.thr > .5 && Math.abs(st.vf) > 9) st.thr = .5; }
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
    const hb = st.hb && !V.walk, rot = st.vf / V.wb * Math.tan(st.steer) * (hb ? 1.4 : 1) * dt, oh = st.h; st.h += rot; st._yaw = dt > 0 ? rot / dt : 0;
    const vx = st.vf * Math.cos(oh) - st.vs * Math.sin(oh), vy = st.vf * Math.sin(oh) + st.vs * Math.cos(oh), c2 = Math.cos(st.h), s2 = Math.sin(st.h); st.vf = vx * c2 + vy * s2; st.vs = -vx * s2 + vy * c2;
    const grip = (hb ? 1.1 : V.grip) * (wet ? .6 : 1) * (soft ? .7 : 1); st.vs *= Math.exp(-grip * dt); if (hb) st.vf *= Math.exp(-.9 * dt);
    const drifting = Math.abs(st.vs) > 2.2 && Math.abs(st.vf) > 2; if (drifting || (hb && Math.abs(st.vf) > 3)) { for (const o of [-1, 1]) { const rx = st.x - c2 * V.len * .38 - s2 * o * V.wid * .42, ry = st.y - s2 * V.len * .38 + c2 * o * V.wid * .42; Ciudad.marks.push({ x1: rx, y1: ry, x2: rx - (vx * dt), y2: ry - (vy * dt), t: 1 }); } if (Ciudad.rng.f() < .5) Ciudad.parts.push({ x: st.x - c2 * V.len * .4, y: st.y - s2 * V.len * .4, vx: (Ciudad.rng.f() - .5) * 3, vy: (Ciudad.rng.f() - .5) * 3, t: .6, t0: .6, c: wet ? 'rgba(200,220,235,.8)' : 'rgba(190,180,160,.8)', r: .35 + Ciudad.rng.f() * .4 }); if (!st._drT) { st._drT = 1; this.sfx(st, 'brake'); } } else st._drT = 0;
    if (wet && Math.abs(st.vf) > 8 && Ciudad.rng.f() < .4) Ciudad.parts.push({ x: st.x - c2 * V.len * .3 + (Ciudad.rng.f() - .5) * V.wid, y: st.y - s2 * V.len * .3, vx: -vx * .1, vy: -vy * .1 - 1, t: .4, t0: .4, c: 'rgba(210,230,245,.9)', r: .2 });
    // movimiento y choques con lo sólido (esquinas del vehículo); desliza por paredes
    const nx = st.x + vx * dt, ny = st.y + vy * dt, piso = (x, y) => this.hitV(x, y, st.h, V) && !(st.lane && st.lane(x, y)), hit = (x, y) => { const r = this.nivelV(st, x, y, V, piso); st._nz = r[1]; return !r[0]; };
    const x0m = st.x, y0m = st.y; if (st._chT > 0) st._chT -= dt;
    if (!hit(nx, ny)) { st.x = nx; st.y = ny; st.z = st._nz; } else this.deslizar(st, V, nx - st.x, ny - st.y, dt, hit);   // 3.0 · desliza por la pared (Motor City 4.5)
    if (st.h !== oh && hit(st.x, st.y)) { const hN = st.h; st.h = oh; if (hit(st.x, st.y)) st.h = hN; else { st.vs *= .5; } }   // si el giro de este cuadro lo monta en la pared, conserva el rumbo de antes
    this.despues(st, V, dt, hit, x0m, y0m, thr > .3 || br > .3 || (j.m > .3 && libre), facil && j.m > .15 ? Math.atan2(this.joyMundo(st).y, this.joyMundo(st).x) : st.h + (st.vf < 0 || br > thr ? Math.PI : 0));
    if (V.art) { const h2 = st.h2 == null ? st.h : st.h2, d = Math.atan2(Math.sin(st.h - h2), Math.cos(st.h - h2)); st.h2 = h2 + st.vf / V.art * Math.sin(d) * dt; const d2 = Math.atan2(Math.sin(st.h - st.h2), Math.cos(st.h - st.h2)); if (Math.abs(d2) > .95) st.h2 = st.h - Math.sign(d2) * .95; } else st.h2 = st.h;
    st.km += Math.abs(st.vf) * dt / 1000; st.engine = thr;
  },
  /* ---------- 3.0 · manejo que no se traba (portado de Motor City 4.5: js/32-fisica.js _mover, _asistencia, _despues, _desatascar) ----------
     · deslizar: si el paso está bloqueado, la normal de la pared se estima tanteando 8 puntos alrededor; el vehículo sigue a lo largo de
       la pared y pierde velocidad según el ángulo del golpe (rasante: casi nada; de frente: casi toda) y se alinea con ella. Solo cuenta
       como golpe si la parte de la velocidad que va contra la pared pasa de 2,5 m/s (antes cualquier roce en diagonal trababa el carro).
     · asistencia: cada 0,08 s mira adelante (0,45 s de camino, de 3 a 12 m); si viene pared y no se está girando fuerte, empuja el
       volante hacia el lado libre más parecido a lo que se pide y no deja ir a fondo hacia ella. Se apaga con la asistencia al volante.
     · desatascar: si empuja y no avanza en 0,85 s, busca el hueco libre más cercano hacia donde se quiere ir (anillos de 0,8 a 3,2 m)
       y sale con un empujón suave; el bordillo (de la calzada al andén) da un tumbo a la cámara. */
  deslizar(st, V, dx, dy, dt, hit) {
    const L = Math.hypot(dx, dy); if (L < 1e-7) return false;
    const r = clamp(V.wid * .65, .5, 1.4), px = st.x + dx, py = st.y + dy; let bx = 0, by = 0;
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, cx = Math.cos(a), cy = Math.sin(a); if (hit(px + cx * r, py + cy * r)) { bx += cx; by += cy; } }
    const bl = Math.hypot(bx, by), Nx = bl > .01 ? -bx / bl : -dx / L, Ny = bl > .01 ? -by / bl : -dy / L, ux = dx / L, uy = dy / L, dot = ux * Nx + uy * Ny, impacto = clamp(-dot, 0, 1);
    let tx = ux - dot * Nx, ty = uy - dot * Ny; const tl = Math.hypot(tx, ty); let movio = false;
    if (tl > .05) { tx /= tl; ty /= tl; const s = L * tl; if (!hit(st.x + tx * s, st.y + ty * s)) { st.x += tx * s; st.y += ty * s; st.z = st._nz; movio = true; } }
    if (!movio) { if (!hit(st.x + dx, st.y)) { st.x += dx; st.z = st._nz; movio = true; } else if (!hit(st.x, st.y + dy)) { st.y += dy; st.z = st._nz; movio = true; } }
    const sp = Math.hypot(st.vf, st.vs), imp = sp * impacto;
    if (imp > 2.5 && !(st._chT > 0)) { st._chT = .4; st.crashes++; st.crashesJ = 1; st.dmg += imp; st.shake = Math.min(.3, .08 + imp * .025); this.sfx(st, 'crash'); vib(imp > 8 ? 80 : 30); this.msg(st, imp > 8 ? '¡Golpe duro!' : 'Golpe', 'r');
      for (let q = 0; q < 6; q++) Ciudad.parts.push({ x: px - Nx * r, y: py - Ny * r, vx: (Nx + (Ciudad.rng.f() - .5)) * 5, vy: (Ny + (Ciudad.rng.f() - .5)) * 5, t: .5, t0: .5, c: '#fbe7b0', r: .3 }); }
    if (movio) { const f = 1 - Math.min(.95, impacto * impacto * .9 + dt * .6); st.vf *= f; st.vs *= f;
      if (!V.walk && tl > .05) { const dir = st.vf >= 0 ? Math.atan2(ty, tx) : Math.atan2(-ty, -tx); st.h += Math.atan2(Math.sin(dir - st.h), Math.cos(dir - st.h)) * Math.min(1, dt * 7) * (1 - impacto * .6); } }
    else { st.vf *= V.walk || V.monta ? 0 : -.18; st.vs *= .3; if (!hit(st.x + Nx * .06, st.y + Ny * .06)) { st.x += Nx * .06; st.y += Ny * .06; st.z = st._nz; } }
    return movio;
  },
  asistencia(st, V, dt, sIn, quiere) {
    const A = st._asis || (st._asis = { t: 0, giro: 0, freno: 0 }); if (Math.abs(st.vf) < 3 || st.mode !== 'veh') { A.giro = A.freno = 0; return A; }
    if ((A.t -= dt) > 0) return A; A.t = .08; A.giro = 0; A.freno = 0;
    const la = clamp(Math.abs(st.vf) * .45, 3, 12), sg = st.vf >= 0 ? 1 : -1, piso = (x, y) => this.hitV(x, y, st.h, V), libre = da => !piso(st.x + Math.cos(st.h + da) * la * sg, st.y + Math.sin(st.h + da) * la * sg);
    if (st.z || libre(0)) return A;   // en puentes y deprimidos manda la baranda
    const pide = quiere != null ? Math.atan2(Math.sin(quiere - st.h), Math.cos(quiere - st.h)) : sIn;
    for (const da of pide >= 0 ? [.3, -.3, .6, -.6] : [-.3, .3, -.6, .6]) if (libre(da)) { A.giro = Math.sign(da) * sg * (Math.abs(da) > .4 ? .75 : .5); break; }
    A.freno = 1; return A;
  },
  despues(st, V, dt, hit, x0m, y0m, empuja, quiere) {
    if (empuja && Math.hypot(st.x - x0m, st.y - y0m) < .015) st._atasco = (st._atasco || 0) + dt; else st._atasco = Math.max(0, (st._atasco || 0) - dt * 2);
    if (st._atasco > .85) { st._atasco = 0; let mejor = null, md = 1e9;
      for (const d of hit(st.x, st.y) ? [.8, 1.4, 2.2, 3.2, 4.5, 6, 8, 10.5, 13.5, 17, 22, 28] : [.8, 1.4, 2.2, 3.2]) { for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, x = st.x + Math.cos(a) * d, y = st.y + Math.sin(a) * d; if (hit(x, y)) continue; const pen = d * .6 + Math.abs(Math.atan2(Math.sin(quiere - a), Math.cos(quiere - a))) * 1.2; if (pen < md) { md = pen; mejor = { x: x - st.x, y: y - st.y, a }; } } if (mejor) break; }   // metido en un edificio grande: busca más lejos
      if (!mejor && VC.on && VC.despeja && hit(st.x, st.y)) { const q = VC.despeja(st.x, st.y, Math.max(V.len, V.wid) / 2 + .3, !V.walk, 90); if (q && !hit(q.x, q.y)) mejor = { x: q.x - st.x, y: q.y - st.y, a: Math.atan2(q.y - st.y, q.x - st.x) }; }   // un edificio enorme: el hueco libre más cercano
      if (mejor) { st._empujon = { x: mejor.x, y: mejor.y }; if (!V.walk) st.h += Math.atan2(Math.sin(mejor.a - st.h), Math.cos(mejor.a - st.h)) * .5; st.vf = st.vs = 0; st.desatascos = (st.desatascos || 0) + 1; } }
    if (st._empujon) { const q = st._empujon, f = Math.min(1, dt * 8), metido = hit(st.x, st.y); if (metido || !hit(st.x + q.x * f, st.y + q.y * f)) { st.x += q.x * f; st.y += q.y * f; } q.x *= 1 - f; q.y *= 1 - f; if (Math.hypot(q.x, q.y) < .02) st._empujon = null; }
    if (VC.on && !st.z) { const ag = VC.agarre(st.x, st.y) >= .95; if (st._agP != null && ag !== st._agP && Math.abs(st.vf) > 2 && !V.walk) st.shake = Math.max(st.shake || 0, Math.min(.1, Math.abs(st.vf) / 120)); st._agP = ag; }   // el bordillo
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
      <div class="pag">Tamaño de botones e información</div><div class="tg" data-ui>${EM.iconos ? EM.iconos.TAM.map(([n], i) => `<button data-v="${i}" class="${EM.iconos.tam() === i ? 'on' : ''}">${n}</button>`).join('') : ''}</div>
      <div class="pag">Vista de lejos clara (líneas, estaciones y trenes resaltados)</div><div class="tg" data-cl><button data-v="1" class="${S.claro !== 0 ? 'on' : ''}">Sí</button><button data-v="0" class="${S.claro === 0 ? 'on' : ''}">No</button></div>
      <div class="pag">Asistencia al volante (se endereza con la calle y esquiva las paredes)</div><div class="tg" data-as><button data-v="1" class="${S.asist !== 0 ? 'on' : ''}">Sí</button><button data-v="0" class="${S.asist === 0 ? 'on' : ''}">No</button></div>
      <div class="row" style="margin-top:10px"><button class="btn" id="ayPf">🧑 Mi personaje</button><button class="btn pri" id="ayOk">Seguir</button></div>`);
    const fin = t => { UI.close(); if (t) this.msg(st, t, 'b'); };
    $$('#mBody [data-a]').forEach(b => b.onclick = () => { const a = b.dataset.a;
      if (a === 'est' && h) { const t = this.salida(h); this.llevar(st, t.x, t.y, false); fin('🚉 Estás en ' + h.name + ': ● para abordar'); }
      if (a === 'calle') { const t = VC.on ? VC.despeja(st.x, st.y, st.mode === 'veh' ? 1.4 : .6, true, 400) : this.libre(st.x, st.y, v => WALK_OK.has(v), 20); this.llevar(st, t.x, t.y, true); fin('🛣 De vuelta en la calle'); }
      if (a === 'taxi') { const t = VC.on ? VC.despeja(st.x, st.y, 1.4, true, 400) : this.libre(st.x, st.y, v => v === TT.ROAD || v === TT.AVE, 20); if (st.mode === 'veh') this.llevar(st, st.x, st.y, false); const R = this.rumbo({ x: t.x, y: t.y, t: -1, z: 0 }, st.h); st.parked.push({ kind: 'taxi', x: t.x, y: t.y, a: R != null ? R : st.h, id: st.parked.length }); const w = VC.on ? VC.despeja(t.x + 3, t.y + 3, .6, false, 20) : t; this.llevar(st, w.x, w.y, false); fin('🚕 Tu taxi llegó: está a tu lado, toca ● para subirte'); }
      if (a === 'ini') { this.llevar(st, ini.x, ini.y, false); fin('🏠 De vuelta donde empezaste'); } });
    $$('#mBody .tg[data-mj] button').forEach(b => b.onclick = () => { S.manejo = b.dataset.v; $$('button', b.parentNode).forEach(x => x.classList.toggle('on', x === b)); Save.write(); });
    $$('#mBody .tg[data-ui] button').forEach(b => b.onclick = () => { S.uiTam = +b.dataset.v; $$('button', b.parentNode).forEach(x => x.classList.toggle('on', x === b)); if (EM.iconos) EM.iconos.ponTam(); Save.write(); });
    $$('#mBody .tg[data-cl] button').forEach(b => b.onclick = () => { S.claro = +b.dataset.v; $$('button', b.parentNode).forEach(x => x.classList.toggle('on', x === b)); Save.write(); });
    $$('#mBody .tg[data-as] button').forEach(b => b.onclick = () => { S.asist = +b.dataset.v; $$('button', b.parentNode).forEach(x => x.classList.toggle('on', x === b)); Save.write(); });
    $('#ayPf').onclick = () => Perfil.abrir(); $('#ayOk').onclick = () => fin();
  },
  /* moverse con niveles: ¿se puede pasar a (x, y) y en qué nivel queda? Al puente se sube por sus extremos, donde el tablero
     está bajo; encima, la baranda no deja caer; por debajo se pasa entre las pilas (lo sólido del piso lo dice bloq) */
  nivel(st, x, y, bloq, pie) {
    if (!VC.PG) return [!bloq(x, y), 0];
    if (st.z) { if (VC.puenteEn(x, y, st.z, .1)) return [true, st.z]; const cur = VC.puenteEn(st.x, st.y, st.z, .8); if (!cur || cur.h < 1.2) return [!bloq(x, y), 0]; return [false, st.z]; }
    const P = VC.puenteEn(x, y, null, 0); if (P && P.h < .9 && (pie || !P.B.pe)) return [true, P.B.z];
    return [!bloq(x, y), 0];
  },
  /* lo mismo para un vehículo: en el tablero, ninguna esquina puede salirse de la baranda (salvo en las rampas) */
  nivelV(st, x, y, V, piso) {
    if (!VC.PG) return [!piso(x, y), 0]; const pie = !!V.walk;
    if (st.z) {   // en un puente (z > 0) o en un deprimido (z = -1)
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
  unmount(st) { if (this._mapa) this.mapaCierra(); if (this._cg) this._cg(); this.persist(st); if (this._eng) { try { this._eng.g.gain.setTargetAtTime(0, Snd.ac.currentTime, .05); this._eng.o.stop(Snd.ac.currentTime + .2); } catch (e) { } this._eng = null; } },
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
      <div class="lbbtns"><button class="abtn big" id="lbAct">●<small>acción</small></button><button class="abtn acc" id="lbUp" aria-label="Correr o acelerar">▲</button><button class="abtn brk" id="lbDown" aria-label="Frenar">▼</button><button class="abtn hb" id="lbHb" aria-label="Freno de mano o truco">✋</button></div>
      <div class="vsel" id="lbView"><button id="lbVista" title="Cámara: toca para acercar o alejar (de lejos, cenital, de cerca y casi tercera persona)">👁<small id="lbVistaN"></small></button><button id="lbActHub" title="Actividades, modos, Skate/Parkour y diario RPG">📋</button><button id="lbFoto" title="Foto">${Atlas.ico('ico_foto', '📷')}</button><button id="lbCam" title="Cámara libre: arrastra para mirar, pellizca para acercar">🎥</button><button id="lbZoom" title="Acercar o alejar">${Atlas.ico('ico_lupa', '🔎')}</button><button id="lbRun" title="Correr">${Atlas.ico('ico_correr', '🏃')}</button><button id="lbFF" title="Ritmo del juego">⏩<small id="lbFFn"></small></button><button id="lbGuia" title="Qué ver cerca">📍</button><button id="lbAyuda" title="Ayuda y rescate">🆘</button></div><div id="lbJob" class="jobbar hide"></div><div id="lbLugar" class="lugar"></div><div id="trTalk" class="trtalk hide"></div><div id="lbActBar" class="actbar hide"></div><button id="lbMini" class="lbmini" aria-label="Abrir el mapa del valle"></button>`;
    const jz = $('#lbJz'), joy = $('#lbJoy'); let jid = null, jx = 0, jy = 0;
    jz.addEventListener('pointerdown', e => { jid = e.pointerId; jz.setPointerCapture(jid); const r = jz.getBoundingClientRect(); jx = e.clientX - r.left; jy = e.clientY - r.top; joy.style.left = jx + 'px'; joy.style.top = jy + 'px'; joy.classList.add('on'); Snd.init(); });
    jz.addEventListener('pointermove', e => { if (e.pointerId !== jid) return; const r = jz.getBoundingClientRect(), dx = e.clientX - r.left - jx, dy = e.clientY - r.top - jy, d = Math.hypot(dx, dy), R = 46, m = Math.min(1, d / R); st.joy = { x: d ? dx / d * m : 0, y: d ? dy / d * m : 0, m }; joy.firstChild.style.transform = 'translate(' + (dx / Math.max(1, d) * Math.min(d, R)) + 'px,' + (dy / Math.max(1, d) * Math.min(d, R)) + 'px)'; });
    const jend = e => { if (e.pointerId !== jid) return; jid = null; st.joy = { x: 0, y: 0, m: 0 }; joy.classList.remove('on'); joy.firstChild.style.transform = ''; }; jz.addEventListener('pointerup', jend); jz.addEventListener('pointercancel', jend);
    const hold = (id, key, down, up) => { const b = $(id), on = e => { e.preventDefault(); b.setPointerCapture && b.setPointerCapture(e.pointerId); st.keys[key] = true; b.classList.add('on'); Snd.init(); if (down) down(); }, off = () => { st.keys[key] = false; b.classList.remove('on'); if (up) up(); }; b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off); };
    hold('#lbUp', 'up', () => { st.run = true; }, () => { st.run = false; }); hold('#lbDown', 'down'); hold('#lbHb', 'hb', () => { st.hb = true; }, () => { st.hb = false; });
    hold('#lbAct', 'act', () => { st.act = 1; this.action(st); }, () => { st.act = 0; });
    $('#lbActHub').onclick = () => { Snd.init(); if (EM.mundoRPG && EM.mundoRPG.abrir) EM.mundoRPG.abrir(st); };
    this.camMount(st);
    $('#lbFoto').onclick = () => this.photo(st); $('#lbZoom').onclick = () => { st.far = !st.far; }; $('#lbRun').onclick = () => { st.run = !st.run; $('#lbRun').classList.toggle('on', st.run); }; $('#lbFF').onclick = () => { const s = Save.d.settings; s.ritmo = ((s.ritmo | 0) + 1) % 3; Save.write(); const R = this.RITMOS[s.ritmo]; this.msg(st, '⏩ Ritmo ' + R[0] + (R[2] > 1 ? ' · en metro y cable ×' + R[2] : '') , 'b'); this.updCtl(st); };
    $('#lbGuia').onclick = () => { if (typeof Gente !== 'undefined') Gente.guia(st); };
    $('#lbMini').onclick = () => this.mapa(st); if (st.abrirMapa) { st.abrirMapa = 0; setTimeout(() => this.mapa(st, 1), 350); }
    $('#lbVista').onclick = () => { const Q = this.ZOOMS[(this.zoomPreset(st) + 1) % this.ZOOMS.length]; st.zoomObj = Q[0]; this.msg(st, Q[1] + ' Cámara ' + Q[2] + ' · pellizca para acercar o alejar', 'b'); this.updCtl(st); };   /* 3.11.0: acercamientos de la cámara única */ $('#lbAyuda').onclick = () => this.ayuda(st);
    this.updCtl(st);
  },
  updCtl(st) {
    if (EM.headless || Game.st !== st) return; this.letrero(st); const jb = $('#lbJob'); if (!jb) return; const J = st.goal ? null : st.job;
    if (st.goal) { const G = st.goal, d = dist(st.x, st.y, G.x, G.y); jb.className = 'jobbar trama'; jb.innerHTML = `<b>📖 ${esc(G.title)}</b><span>${esc(G.hint)}</span><em>${d < 1000 ? Math.round(d) + ' m' : (d / 1000).toFixed(1) + ' km'}</em>`; }
    const vb = $('#lbVistaN'); if (vb) { const Q = this.ZOOMS[this.zoomPreset(st)]; vb.textContent = Q[1]; $('#lbVista').classList.toggle('on', !!st.vista3); $('#lbVista').title = 'Cámara ' + Q[2] + ': toca para acercar o alejar'; }
    const ff = $('#lbFF'); if (ff) { const r = clamp(Save.d.settings.ritmo | 0, 0, 2), R = this.RITMOS[r]; ff.classList.toggle('on', r > 0); const n = $('#lbFFn'); if (n) n.textContent = st.mode === 'ride' ? '×' + R[2] : R[0]; }
    if (!st.goal && !J && st.guia) { const G = st.guia, d = dist(st.x, st.y, G.x, G.y); jb.className = 'jobbar guia'; jb.innerHTML = `<b>📍 ${esc(G.title)}</b><span>${esc(G.hint || '')}</span><em>${d < 1000 ? Math.round(d) + ' m' : (d / 1000).toFixed(1) + ' km'}</em>`; }
    if (J) { const left = J.limit ? Math.max(0, J.limit - J.t) : 0, d = J.x != null ? dist(st.x, st.y, J.x, J.y) : 0; jb.classList.remove('hide'); jb.innerHTML = `<b>${esc(J.title)}</b><span>${esc(J.hint || '')}</span><em>${d ? (d < 1000 ? Math.round(d) + ' m' : (d / 1000).toFixed(1) + ' km') : ''}${J.limit ? ' · ⏱ ' + pad2(Math.floor(left / 60)) + ':' + pad2(Math.floor(left % 60)) : ''}${J.k === 'reparacion' && J.hold ? ' · reparando ' + Math.round(J.hold / 3 * 100) + '%' : ''}</em>`; jb.className = 'jobbar' + (J.limit && left < 20 ? ' low' : ''); } else if (!st.goal && !st.guia) jb.classList.add('hide');
    const veh = st.mode === 'veh', z = EM.mundoRPG && EM.mundoRPG.enZona ? EM.mundoRPG.enZona(st) : null;
    $('#lbUp').textContent = veh ? '▲' : '🏃'; $('#lbDown').style.visibility = veh ? '' : 'hidden';
    const bici = veh && st.veh.kind === 'bici', truco = !!z || (veh && this.V(st).monta), hbB = $('#lbHb');
    const hbKind = truco ? 'truco' : bici ? 'bici' : 'freno';
    hbB.style.visibility = (truco || (veh && (!this.V(st).walk || bici))) ? '' : 'hidden';
    if (hbB.dataset.b !== hbKind) { hbB.dataset.b = hbKind; hbB.textContent = truco ? '★' : bici ? '🔔' : '✋'; hbB.setAttribute('aria-label', truco ? 'Saltar y hacer truco' : bici ? 'Timbre' : 'Freno de mano'); }
    const a = $('#lbAct'); let lbl = 'acción'; if (st.mode === 'ride') lbl = st.ride.ph === 'dwell' ? 'bajar' : 'viajando'; else if (veh) lbl = (st.job && st.job.k === 'taxi' && st.job.stage === 0 && dist(st.x, st.y, st.job.client.x, st.job.client.y) < 9) ? 'recoger' : 'bajarse'; else { const p = st.parked.find(p => dist(p.x, p.y, st.x, st.y) < 4.5 + VEH[p.kind].len / 2); if (p) lbl = VEH[p.kind].icon + ' subir'; else if (typeof Gente !== 'undefined' && Gente.cerca(st, 3.4)) lbl = 'hablar'; else if (this.nearHub(st, 34)) lbl = 'abordar'; else if (Ciudad.peds.some(p => dist(p.x, p.y, st.x, st.y) < 3)) lbl = 'hablar'; }
    a.querySelector('small').textContent = lbl; a.classList.toggle('hot', lbl !== 'acción' && lbl !== 'viajando' && lbl !== 'bajarse');
    if (EM.mundoRPG && EM.mundoRPG.updBar) EM.mundoRPG.updBar(st);
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
    const zoom = f => { if (st.camLibre && !st.vista3) st.cam.k = clamp(st.cam.k * f, .12, 7); else st.zoomU = clamp((st.zoomU || 1) * f, .35, this.ZU_MAX); };
    $('#lbCamM').onclick = () => zoom(1 / 1.35); $('#lbCamMas').onclick = () => zoom(1.35);
    $('#lbCamA').onclick = () => { const s = Save.d.settings; s.angulo = ((s.angulo | 0) + 1) % VC.ANGULOS.length; const A = VC.angulo(s.angulo); $('#lbCamAn').textContent = A.n; Save.write(); this.msg(st, '📐 Ángulo: ' + A.n, 'b'); };
    this._zoom = zoom; this.camGestos(st);
  },
  camGestos(st) {
    const cv = $('#gcv'); if (!cv) return; if (this._cg) this._cg(); const T = new Map(); let pinch = null;
    const down = e => { T.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (T.size === 2) { const [a, b] = [...T.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: st.cam.k, z: st.zoomU || 1 }; } };
    const move = e => { const q = T.get(e.pointerId); if (!q) return; const nx = e.clientX, ny = e.clientY;
      if (T.size >= 2 && pinch) { q.x = nx; q.y = ny; const [a, b] = [...T.values()], f = Math.hypot(a.x - b.x, a.y - b.y) / Math.max(12, pinch.d); if (st.camLibre && !st.vista3) st.cam.k = clamp(pinch.k * f, .12, 7); else st.zoomU = clamp(pinch.z * f, .35, this.ZU_MAX); return; }
      if (st.vista3 === 'cen3d' && T.size === 1) { if (st.camLibre) { const sc = .35 / clamp(st.zoomU || 1, .35, this.ZU_MAX); st.cam.x -= (nx - q.x) * sc; st.cam.y -= (ny - q.y) * sc; } else { st.cpo = clamp((st.cpo || 0) + (ny - q.y) * .003, -.35, .45); } q.x = nx; q.y = ny; return; }
      if (st.vista3 && T.size === 1) { st.cyo = (st.cyo || 0) - (nx - q.x) * .006; st.cpo = clamp((st.cpo || 0) + (ny - q.y) * .004, -.45, .9); q.x = nx; q.y = ny; return; }
      if (st.camLibre && T.size === 1) { st.cam.x -= (nx - q.x) / st.cam.k; st.cam.y -= (ny - q.y) / st.cam.k; } q.x = nx; q.y = ny; };
    const up = e => { T.delete(e.pointerId); if (T.size < 2) pinch = null; };
    const wheel = e => { e.preventDefault(); if (this._zoom) this._zoom(Math.exp(-clamp(e.deltaY, -120, 120) * .0016)); };
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('wheel', wheel, { passive: false });
    this._cg = () => { cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up); cv.removeEventListener('wheel', wheel); this._cg = null; };
  },
  photo(st) { if (st.trama && Trama.onPhoto(st)) return; const J = st.job; if (J && J.k === 'postal' && dist(st.x, st.y, J.x, J.y) < 70) { st.flash = .4; this.complete(st); return; } const L = Ciudad.lm.find(l => dist(l.x, l.y, st.x, st.y) < 70); st.flash = .4; this.sfx(st, 'ok'); if (L) { const F = Save.d.fotos || (Save.d.fotos = []); if (!F.includes(L.name)) { F.push(L.name); Save.d.wallet += 20; this.msg(st, '📷 ' + L.name + ' · nueva postal +20 🎫', 'g'); this.msg(st, L.fact, 'y'); Save.write(); } else this.msg(st, '📷 ' + L.name, 'b'); } else this.msg(st, '📷 Foto del valle', 'b'); },
  key(st, k, down) { if (down && (k === 'm' || k === 'M')) { if (this._mapa) this.mapaCierra(); else this.mapa(st); return; } if (down && (k === '+' || k === '=') && this._zoom) { this._zoom(1.25); return; } if (down && (k === '-' || k === '_') && this._zoom) { this._zoom(1 / 1.25); return; } if (down && (k === 'c' || k === 'C') && this._camLibre) { this._camLibre(!st.camLibre); return; } if (down && (k === 'j' || k === 'J') && EM.mundoRPG && EM.mundoRPG.abrir) { EM.mundoRPG.abrir(st); return; } if (down && (k === 'v' || k === 'V') && st.mode === 'veh') { st.acelFijo = !st.acelFijo; this.msg(st, st.acelFijo ? '⏫ Acelerador fijo encendido' : 'Acelerador fijo apagado', 'b'); this.updCtl(st); return; } const m = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ' ': 'hb', Shift: 'run' }[k]; if (m) { st.keys[m] = down; if (m === 'hb') st.hb = down; if (m === 'run') st.run = down; const kx = (st.keys.right ? 1 : 0) - (st.keys.left ? 1 : 0), ky = (st.keys.down ? 1 : 0) - (st.keys.up ? 1 : 0); if (st.mode !== 'veh') st.joy = { x: kx, y: ky, m: Math.min(1, Math.hypot(kx, ky)) }; else st.joy = { x: 0, y: 0, m: 0 }; return; } if (!down) return; if (k === 'e' || k === 'Enter') { st.act = 1; this.action(st); setTimeout(() => { st.act = 0; }, 3500); } if (k === 'f') this.photo(st); if (k === 'z') st.far = !st.far; if (k === 'h' || k === 'q') { Snd.play('horn'); for (const c of Ciudad.cars) if (dist(c.x, c.y, st.x, st.y) < 40) c.stop = Math.max(c.stop, .8); } },
  /* ---------- dibujo ---------- */
  draw(g, st, vp) {
    if (this.gl(st)) { G3.show(true); this.draw3D(g, st, vp); return; } else if (G3.cv) G3.show(false);
    const W = vp.w, H = vp.h, k = st.cam.k * (W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W)), L = Mundo.light(), night = L.night, sh = Ciudad.shadowDir();
    const shx = st.shake > 0 ? (Math.random() - .5) * 6 : 0, shy = st.shake > 0 ? (Math.random() - .5) * 6 : 0, mx = Math.round(st.cam.x * k) / k, my = Math.round(st.cam.y * k) / k, S = (x, y) => ({ x: W / 2 + (x - mx) * k + shx, y: H / 2 + (y - my) * k + shy }), x0 = mx - W / 2 / k, y0 = my - H / 2 / k, x1 = mx + W / 2 / k, y1 = my + H / 2 / k;
    g.fillStyle = '#3a6b45'; g.fillRect(0, 0, W, H); if (MAP.ready) { if (k < .3) { const m = MAP.mini(), s = k * MAP.miniK; g.imageSmoothingEnabled = false; g.drawImage(m, W / 2 - mx * k, H / 2 - my * k, m.width * s, m.height * s); } else MAP.drawTop(g, W, H, mx, my, k); }
    Ciudad.landmarks(g, S, k, x0, y0, x1, y1); const clara = this.clara(st, k, vp); if (clara) { g.fillStyle = 'rgba(246,243,236,.42)'; g.fillRect(0, 0, W, H); } Ciudad.stations(g, S, k, x0, y0, x1, y1, VC.on ? 'piso' : null); Ciudad.marksDraw(g, S, k);
    if (EM.mundoRPG && EM.mundoRPG.draw2D) EM.mundoRPG.draw2D(g, st, S, k, x0, y0, x1, y1);
    // estaciones de EnCicla: anclaje azul con postes verdes y tótem
    for (const D of st.docks || []) {
      if (D.x < x0 - 12 || D.x > x1 + 12 || D.y < y0 - 12 || D.y > y1 + 12) continue; const q = S(D.x, D.y);
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(q.x - 3.6 * k + 2, q.y + .2 * k + 2, 7.2 * k, 1.6 * k); g.fillStyle = '#0e2d55'; g.fillRect(q.x - 3.6 * k, q.y + .2 * k, 7.2 * k, 1.6 * k);
      g.fillStyle = '#9bd341'; for (let i = 0; i < 5; i++) g.fillRect(q.x - 3.2 * k + i * 1.5 * k, q.y + .45 * k, .35 * k, 1.1 * k);
      g.fillStyle = '#0e2d55'; g.fillRect(q.x + 3.9 * k, q.y - .9 * k, .9 * k, 2.6 * k); g.fillStyle = '#9bd341'; g.fillRect(q.x + 4.05 * k, q.y - .7 * k, .6 * k, .6 * k);
      if (k > 2.2 && !st.far) { g.font = '700 ' + Math.round(clamp(k * 3, 10, 13)) + 'px Cuerpo, sans-serif'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.9)'; g.strokeText('EnCicla · ' + D.n, q.x, q.y - 1.8 * k); g.fillStyle = '#0e2d55'; g.fillText('EnCicla · ' + D.n, q.x, q.y - 1.8 * k); g.textAlign = 'left'; }
    }
    // vehículos parqueados
    for (const p of st.parked) { if (p.x < x0 - 20 || p.x > x1 + 20 || p.y < y0 - 20 || p.y > y1 + 20) continue; const V = VEH[p.kind]; if (V.monta) this.tabla(g, S(p.x, p.y), p.a, V, k, sh); else if (p.kind === 'bici') { const q = S(p.x, p.y); g.save(); g.translate(q.x, q.y); g.rotate(p.a); g.fillStyle = PAL.negro; g.fillRect(-1.1 * k, -.5 * k, 2.2 * k, 1 * k); g.fillStyle = V.col; g.fillRect(-.9 * k, -.3 * k, 1.8 * k, .6 * k); g.restore(); } else Ciudad.car(g, p.x, p.y, p.a, V.len, V.wid, V.col, p.kind === 'alimentador' ? 'feeder' : p.kind === 'bus' ? 'bus' : p.kind === 'metroplus' ? 'brt' : p.kind === 'moto' ? 'moto' : 'car', S, k, sh, night, false); }
    Ciudad.transitDraw(g, S, k, sh, night, x0, y0, x1, y1, VC.on ? 'piso' : null);
    // a ras de piso: gente, carros y el jugador, en orden de pintura con los edificios que les quedan delante (así los tapan)
    const dprL = W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W), kj = Math.max(k, 3.2 * dprL), yo = typeof Perfil !== 'undefined' ? Perfil.ped() : { col: '#1C5C9C', skin: SKIN[1] }, pz = st.z || 0, ob = VC.ob, SZ = h => h ? (x, y) => S(x, y - h * ob) : S, hz = pz && VC.PG ? ((VC.puenteEn(st.x, st.y, pz, .8) || { h: 0 }).h) : 0, Sj = SZ(hz);
    const dibJug = () => { if (st.mode === 'veh') { const V = this.V(st); if (V.monta) { this.tabla(g, Sj(st.x, st.y), st.h, V, k, sh); Ciudad.ped(g, Object.assign({ x: st.x, y: st.y, a: st.h, ph: 0, seed: 7, stun: 0 }, yo), Sj, kj, sh); } else if (st.veh.kind === 'bici') { const q = Sj(st.x, st.y); g.save(); g.translate(q.x, q.y); g.rotate(st.h); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-1 * k + sh.dx * k, -.4 * k + sh.dy * k, 2 * k, .8 * k); g.fillStyle = PAL.negro; g.fillRect(-1.1 * k, -.45 * k, 2.2 * k, .9 * k); g.fillStyle = V.col; g.fillRect(-.9 * k, -.25 * k, 1.8 * k, .5 * k); g.restore(); Ciudad.ped(g, Object.assign({ x: st.x, y: st.y, a: st.h, ph: st.t * 8, seed: 7, stun: 0 }, yo), Sj, kj, sh); } else if (V.art) Ciudad.articulado(g, st.x, st.y, st.h, st.h2 == null ? st.h : st.h2, V, Sj, k, sh, night, true); else Ciudad.car(g, st.x, st.y, st.h, V.len, V.wid, V.col, st.veh.kind === 'alimentador' ? 'feeder' : st.veh.kind === 'bus' ? 'bus' : st.veh.kind === 'moto' ? 'moto' : 'car', Sj, k, sh, night, true); } if (st.mode === 'walk') Ciudad.ped(g, Object.assign({ x: st.x, y: st.y, a: st.h, ph: st.t * (st.run ? 14 : 8) * (st.wv > .2 ? 1 : 0), seed: 7, stun: 0, umb: L.w.rain && !yo.gorro }, yo), Sj, kj, sh); };
    if (st.mode !== 'ride') { const q = Sj(st.x, st.y), r = Math.max(10 * dprL, (st.mode === 'veh' ? this.V(st).len * .55 : 1.5) * k); g.fillStyle = 'rgba(255,160,30,.26)'; g.beginPath(); g.arc(q.x, q.y, r, 0, TAU); g.fill(); }   // disco naranja bajo los pies
    const altos = [], items = [];
    for (const c of Ciudad.cars) { const h = VC.PG ? VC.carAlto(c) : 0, Sc = SZ(h); if (h < -2.5) continue;   // bajo tierra, en el tramo cubierto de un deprimido
      if (h > .4) { altos.push([c.z || 1, () => { Ciudad.car(g, c.x, c.y, c.a, c.kind === 'bus' ? 12 : c.kind === 'moto' ? 2 : 4.4, c.kind === 'moto' ? .8 : c.kind === 'bus' ? 2.5 : 1.8, c.col, c.kind, Sc, k, sh, night, true); }]); continue; } items.push({ x: c.x, y: c.y, r: c.kind === 'bus' ? 6 : 2.5, a: c.kind === 'bus' ? 3.2 : 1.6, f: () => { Ciudad.car(g, c.x, c.y, c.a, c.kind === 'bus' ? 12 : c.kind === 'moto' ? 2 : 4.4, c.kind === 'moto' ? .8 : c.kind === 'bus' ? 2.5 : 1.8, c.col, c.kind, Sc, k, sh, night, true); } }); }
    for (const p of Ciudad.peds) if (p.x > x0 - 5 && p.x < x1 + 5 && p.y > y0 - 5 && p.y < y1 + 5) items.push({ x: p.x, y: p.y, r: .5, a: 1.8, f: () => { Ciudad.ped(g, p, S, k, sh); if (p.client) { const q = S(p.x, p.y); g.fillStyle = PAL.mostaza; g.strokeStyle = PAL.negro; g.lineWidth = 1.5; g.beginPath(); g.arc(q.x, q.y - 12 * Math.max(.6, k * .4) - 6, 7, 0, TAU); g.fill(); g.stroke(); g.fillStyle = PAL.negro; g.font = '700 11px Cuerpo, sans-serif'; g.textAlign = 'center'; g.fillText('!', q.x, q.y - 12 * Math.max(.6, k * .4) - 2); g.textAlign = 'left'; } } });
    if (typeof Gente !== 'undefined') Gente.items(st, items, g, S, k, sh, x0, y0, x1, y1);
    if (st.mode !== 'ride') { if (pz <= 0) items.push({ x: st.x, y: st.y, r: st.mode === 'veh' ? this.V(st).len / 2 : .6, a: st.mode === 'veh' ? 1.6 : 1.8, f: dibJug }); else altos.push([pz, dibJug]); }
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
    if (clara) this.lectura(g, S, k, W, H, x0, y0, x1, y1, 'red');   // 3.0 · vista de lejos clara: las líneas, las estaciones y los vehículos encima de todo
    // el jugador se ve siempre: su anillo encima de todo y, si va por debajo de un tablero, su silueta a través
    if (st.mode !== 'ride') { g.globalAlpha = .38; dibJug(); g.globalAlpha = 1;   // tu silueta encima de todo: se ve aunque un edificio te tape
      const q = Sj(st.x, st.y), r = Math.max(13 * dprL, (st.mode === 'veh' ? this.V(st).len * .7 : 2.2) * k), pu = 1 + Math.sin(st.t * 4) * .06; g.lineWidth = 4 * dprL; g.strokeStyle = 'rgba(15,34,56,.55)'; g.beginPath(); g.arc(q.x, q.y, r * pu, 0, TAU); g.stroke(); g.lineWidth = 2.2 * dprL; g.strokeStyle = '#ffb21e'; g.stroke();
      g.save(); g.translate(q.x, q.y); g.rotate(st.h); g.fillStyle = '#ffb21e'; g.strokeStyle = 'rgba(15,34,56,.8)'; g.lineWidth = 1.5 * dprL; g.beginPath(); g.moveTo(r * pu + 9 * dprL, 0); g.lineTo(r * pu + 1 * dprL, -6 * dprL); g.lineTo(r * pu + 1 * dprL, 6 * dprL); g.closePath(); g.fill(); g.stroke(); g.restore(); }
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
  /* ---------- 🗺 mapa del valle (1.4.0), como en Juega EnCicla: se toca el minimapa (o M). Arrastrar, pellizcar o la rueda;
     tocar una estación, un lugar, un personaje o cualquier punto ofrece «Ir aquí» (eliges dónde estar) o «Marcar destino» ---------- */
  mapa(st, inicio) {
    if (EM.headless || this._mapa) return; const el = $('#gctl'); if (!el) return; Game.freeze(true);
    const d = document.createElement('div'); d.className = 'mapagr'; d.id = 'lbMapa';
    d.innerHTML = `<div class="mgtop"><b>🗺 ${inicio ? '¿Dónde quieres empezar?' : 'Mapa del valle'}</b><button data-m="yo" title="Volver a donde estás">◎</button><button data-m="mas" aria-label="Acercar">+</button><button data-m="menos" aria-label="Alejar">−</button><button data-m="x" aria-label="Cerrar">✕</button></div><canvas id="lbMapaCv"></canvas><div class="mghint">${inicio ? 'Toca un lugar del valle y elige «Ir aquí».' : 'Toca un lugar para ir o para marcarlo como destino.'}</div><div class="mgcard hide" id="lbMapaCard"></div>`;
    el.appendChild(d); const cv = $('#lbMapaCv'), r0 = cv.getBoundingClientRect(), M = this._mapa = { st, cv, x: inicio ? MW * TM * .5 : st.x, y: inicio ? MH * TM * .5 : st.y, k: inicio ? Math.min(r0.width / (MW * TM * .8), r0.height / (MH * TM * .8)) : .12, T: new Map(), pinch: null, mov: 0, sel: null, raf: 0, sucio: 1 };   // al empezar, todo el valle
    const zoom = (f, sx, sy) => { const k0 = M.k, k1 = clamp(k0 * f, .012, 3.2); if (sx != null) { const r = cv.getBoundingClientRect(), dx = sx - r.left - r.width / 2, dy = sy - r.top - r.height / 2; M.x += dx / k0 - dx / k1; M.y += dy / k0 - dy / k1; } M.k = k1; M.sucio = 1; };
    d.querySelector('[data-m=yo]').onclick = () => { M.x = st.x; M.y = st.y; M.k = Math.max(M.k, .5); M.sucio = 1; }; d.querySelector('[data-m=mas]').onclick = () => zoom(1.6); d.querySelector('[data-m=menos]').onclick = () => zoom(1 / 1.6); d.querySelector('[data-m=x]').onclick = () => this.mapaCierra();
    cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); M.T.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY }); M.mov = 0; if (M.T.size === 2) { const [a, b] = [...M.T.values()]; M.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: M.k }; } });
    cv.addEventListener('pointermove', e => { const q = M.T.get(e.pointerId); if (!q) return; if (M.T.size >= 2 && M.pinch) { q.x = e.clientX; q.y = e.clientY; const [a, b] = [...M.T.values()]; M.k = clamp(M.pinch.k * Math.hypot(a.x - b.x, a.y - b.y) / Math.max(12, M.pinch.d), .012, 3.2); M.mov = 99; M.sucio = 1; return; }
      const dx = e.clientX - q.x, dy = e.clientY - q.y; M.x -= dx / M.k; M.y -= dy / M.k; q.x = e.clientX; q.y = e.clientY; M.mov = Math.max(M.mov, Math.hypot(e.clientX - q.x0, e.clientY - q.y0)); M.sucio = 1; });
    const up = e => { const q = M.T.get(e.pointerId); M.T.delete(e.pointerId); if (M.T.size < 2) M.pinch = null; if (q && M.mov < 7 && !M.T.size) this.mapaToca(e.clientX, e.clientY); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', e => { M.T.delete(e.pointerId); M.pinch = null; });
    cv.addEventListener('wheel', e => { e.preventDefault(); zoom(Math.exp(-clamp(e.deltaY, -120, 120) * .0018), e.clientX, e.clientY); }, { passive: false });
    const loop = () => { if (this._mapa !== M) return; if (M.sucio || MAP._pend) { M.sucio = 0; this.mapaDib(); } M.raf = requestAnimationFrame(loop); }; M.raf = requestAnimationFrame(loop); this.sfx(st, 'tap');
  },
  mapaCierra() { const M = this._mapa; if (!M) return; cancelAnimationFrame(M.raf); this._mapa = null; const d = $('#lbMapa'); if (d) d.remove(); Game.freeze(false); },
  /* lo que hay en el mapa para tocar: estaciones, lugares famosos, personajes y la gente con nombre */
  mapaCosas(st) { const L = [];
    for (const h of NET.stations) { if (!h.lines.some(l => l.kind !== 'future' && l.kind !== 'feeder')) continue; L.push({ t: 'est', n: h.name, s: 'Estación de ' + h.lines.filter(l => l.kind !== 'future' && l.kind !== 'feeder').map(l => l.name).slice(0, 2).join(' y '), x: h.x, y: h.y, c: (h.lines.find(l => l.kind === 'metro') || h.lines[0]).color }); }
    for (const H of VC.HT || []) L.push({ t: 'hito', n: H.n, s: (typeof LUGAR_INFO !== 'undefined' && LUGAR_INFO[H.id]) || '', x: H.cx, y: H.cy });
    for (const p of st.gente || []) L.push({ t: 'gente', n: p.G.n, s: p.G.o.charAt(0).toUpperCase() + p.G.o.slice(1), x: p.x, y: p.y }); return L; },
  mapaDib() {
    const M = this._mapa, st = M.st, cv = M.cv, g = cv.getContext('2d'), { w, h } = fitCanvas(cv, 2), dpr = w / Math.max(1, cv.clientWidth), k = M.k * dpr, mx = M.x, my = M.y, S = (x, y) => ({ x: w / 2 + (x - mx) * k, y: h / 2 + (y - my) * k });
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#1b2a39'; g.fillRect(0, 0, w, h); MAP._pend = 0;
    if (MAP.ready) { if (k < .07) { const m = MAP.mini(), s = k * MAP.miniK; g.imageSmoothingEnabled = true; g.drawImage(m, w / 2 - mx * k, h / 2 - my * k, m.width * s, m.height * s); } else { MAP.prisa = now() + .018; MAP._hechos = 0; MAP.drawTop(g, w, h, mx, my, k); MAP.prisa = 0; MAP._pend = 1; } if (k >= .3) MAP.drawLabels(g, w, h, mx, my, k, dpr, 0); }
    for (const l of NET.lines) { if (l.kind !== 'feeder') continue; g.strokeStyle = l.color; g.globalAlpha = .85; g.lineWidth = 1.8 * dpr; g.setLineDash([4 * dpr, 3 * dpr]); g.lineJoin = 'round'; g.beginPath(); l.P.pts.forEach((p, i) => { const q = S(p.x, p.y); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; }   // 3.1 · las rutas de los alimentadores
    for (const l of NET.lines) { if (l.kind === 'future' || l.kind === 'feeder' || l.kind === 'escalator') continue; g.strokeStyle = l.color; g.lineWidth = (l.kind === 'metro' ? 4 : 2.6) * dpr; g.lineJoin = 'round'; g.beginPath(); l.P.pts.forEach((p, i) => { const q = S(p.x, p.y); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }); g.stroke(); }
    const C = this.mapaCosas(st), vis = Save.d.gente || {}; g.textAlign = 'center'; g.font = '700 ' + Math.round(11 * dpr) + 'px Cuerpo, sans-serif';
    for (const o of C) { const q = S(o.x, o.y); if (q.x < -20 || q.y < -20 || q.x > w + 20 || q.y > h + 20) continue;
      if (o.t === 'est') { g.fillStyle = '#fff'; g.strokeStyle = o.c; g.lineWidth = 2 * dpr; g.beginPath(); g.arc(q.x, q.y, 3.8 * dpr, 0, TAU); g.fill(); g.stroke(); if (M.k > .09) { g.lineWidth = 3 * dpr; g.strokeStyle = 'rgba(15,34,56,.85)'; g.strokeText(o.n, q.x, q.y - 7 * dpr); g.fillStyle = '#fff'; g.fillText(o.n, q.x, q.y - 7 * dpr); } }
      else if (M.k > .16) { const e = o.t === 'hito' ? '🏛' : vis[(st.gente.find(p => p.G.n === o.n) || { G: {} }).G.id] ? '🙂' : '💬'; g.font = Math.round(14 * dpr) + 'px sans-serif'; g.fillText(e, q.x, q.y + 5 * dpr); g.font = '700 ' + Math.round(11 * dpr) + 'px Cuerpo, sans-serif'; if (M.k > .45) { g.lineWidth = 3 * dpr; g.strokeStyle = 'rgba(255,255,255,.9)'; g.strokeText(o.n, q.x, q.y + 18 * dpr); g.fillStyle = '#0f2238'; g.fillText(o.n, q.x, q.y + 18 * dpr); } } }
    // destino marcado y tú
    const J = st.goal || st.job || st.guia; if (J && J.x != null) { const q = S(J.x, J.y); g.fillStyle = PAL.mostaza; g.strokeStyle = PAL.negro; g.lineWidth = 1.5 * dpr; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q.x - 7 * dpr, q.y - 16 * dpr); g.arc(q.x, q.y - 18 * dpr, 7 * dpr, Math.PI * .8, Math.PI * .2); g.closePath(); g.fill(); g.stroke(); }
    if (M.sel) { const q = S(M.sel.x, M.sel.y); g.strokeStyle = '#fff'; g.lineWidth = 3 * dpr; g.beginPath(); g.arc(q.x, q.y, 11 * dpr, 0, TAU); g.stroke(); }
    const q = S(st.x, st.y); g.save(); g.translate(q.x, q.y); g.rotate(st.h); g.fillStyle = PAL.naranja; g.strokeStyle = '#fff'; g.lineWidth = 2 * dpr; g.beginPath(); g.moveTo(11 * dpr, 0); g.lineTo(-7 * dpr, -8 * dpr); g.lineTo(-3 * dpr, 0); g.lineTo(-7 * dpr, 8 * dpr); g.closePath(); g.fill(); g.stroke(); g.restore();
    g.textAlign = 'left'; g.fillStyle = 'rgba(255,255,255,.85)'; g.font = '700 ' + Math.round(10 * dpr) + 'px Cuerpo, sans-serif'; g.fillText('N ↑', 10 * dpr, h - 10 * dpr);
  },
  mapaToca(cx, cy) {
    const M = this._mapa, st = M.st, r = M.cv.getBoundingClientRect(), x = M.x + (cx - r.left - r.width / 2) / M.k, y = M.y + (cy - r.top - r.height / 2) / M.k; let best = null, bd = 22 / M.k;
    for (const o of this.mapaCosas(st)) { if (o.t !== 'est' && M.k <= .16) continue; const d = dist(o.x, o.y, x, y); if (d < bd) { bd = d; best = o; } }
    const o = best || { t: 'punto', n: (MAP.barrioAt && MAP.barrioAt(x, y) || [])[0] || 'Este punto', s: (VC.calle ? VC.calle(x, y) : '') || 'del Valle de Aburrá', x, y }; M.sel = o; M.sucio = 1; const km = d => d < 1000 ? Math.round(d) + ' m' : (d / 1000).toFixed(1).replace('.', ',') + ' km';
    const c = $('#lbMapaCard'); c.classList.remove('hide'); c.innerHTML = `<b>${o.t === 'est' ? '🚉 ' : o.t === 'hito' ? '🏛 ' : o.t === 'gente' ? '🙂 ' : '📍 '}${esc(o.n)}</b><span>${esc(o.s)} · a ${km(dist(o.x, o.y, st.x, st.y))}</span><div class="row"><button class="btn pri sm" data-c="ir">🚶 Ir aquí</button><button class="btn sm" data-c="dest">📍 Marcar destino</button></div>`;
    c.querySelector('[data-c=ir]').onclick = () => { const t = o.t === 'est' ? this.salida(NET.stations.find(h => h.name === o.n) || o) : VC.on ? VC.despeja(o.x, o.y, .6, true, 220) : this.libre(o.x, o.y, v => WALK_OK.has(v), 12); this.mapaCierra(); this.llevar(st, t.x, t.y, false); st.inicio = st.inicio || { x: t.x, y: t.y }; this.msg(st, '🚶 Estás en ' + o.n, 'b'); };
    c.querySelector('[data-c=dest]').onclick = () => { st.guia = { x: o.x, y: o.y, title: o.n, hint: o.s }; this.mapaCierra(); this.msg(st, '📍 Rumbo a ' + o.n + ' · ' + km(dist(o.x, o.y, st.x, st.y)), 'b'); };
  },
  /* tabla de los vehículos que se montan (patineta, monopatín, skate y patines), vista desde arriba, con su sombra y la ruedas */
  tabla(g, q, a, V, k, sh) {
    const L = Math.max(5, V.len * k * 1.15), W = Math.max(2.5, V.wid * k * 1.3); g.save(); g.translate(q.x, q.y); g.rotate(a);
    g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(-L / 2 + sh.dx * 2, -W / 2 + sh.dy * 2, L, W); g.fillStyle = '#141414'; g.fillRect(-L / 2 - 1, -W / 2 - 1, L + 2, W + 2); g.fillStyle = V.col; g.fillRect(-L / 2, -W / 2, L, W);
    if (V.n === 'Patines') { g.fillStyle = '#141414'; g.fillRect(-L / 2, -1, L, 2); }   // dos patines, uno al lado del otro
    else { g.fillStyle = '#141414'; for (const u of [-.38, .38]) g.fillRect(u * L - 1, -W / 2 - 1.5, 2, W + 3); }   // los ejes
    if (V.n === 'Patineta eléctrica') { g.strokeStyle = '#23272f'; g.lineWidth = Math.max(1.5, .08 * k); g.beginPath(); g.moveTo(L * .42, -W * 1.1); g.lineTo(L * .42, W * 1.1); g.stroke(); }   // el manubrio
    g.restore();
  },
  /* 3.0 · la vista de lejos que se lee de un vistazo (la idea de lectura de Hunter Assassin que pidió el autor, sin su arte): al alejar
     la cámara (🔭 o pellizcando), la ciudad se aclara un poco y encima quedan las líneas con su color, las estaciones como anillos y
     cada tren, cable o bus como un punto vivo. Se apaga en el menú (⏸): «Vista de lejos clara». */
  clara(st, k, vp) { const d = vp.w / Math.max(1, ($('#gcv') || { clientWidth: vp.w }).clientWidth || vp.w); return Save.d.settings.claro !== 0 && (st.far || k / d < .95); },
  lectura(g, S, k, W, H, x0, y0, x1, y1, fase) {
    const d = W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W), KINDS = { metro: 1, tram: 1, cable: 1, brt: 1 };
    if (fase === 'red') {
      for (const l of NET.lines) { if (!KINDS[l.kind]) continue; const P = l._pts || (l._pts = (() => { const o = []; for (let s = 0; s <= l.P.len; s += 20) { const q = NET.at(l.P, s); o.push(q.x, q.y); } const q = NET.at(l.P, l.P.len); o.push(q.x, q.y); return Float32Array.from(o); })());
        if (!l._bb) { let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9; for (let i = 0; i < P.length; i += 2) { bx0 = Math.min(bx0, P[i]); bx1 = Math.max(bx1, P[i]); by0 = Math.min(by0, P[i + 1]); by1 = Math.max(by1, P[i + 1]); } l._bb = [bx0, by0, bx1, by1]; }
        const B = l._bb; if (B[2] < x0 - 50 || B[0] > x1 + 50 || B[3] < y0 - 50 || B[1] > y1 + 50) continue;
        const w = (l.kind === 'metro' ? 4.2 : l.kind === 'cable' ? 2.4 : 3) * d; g.lineCap = g.lineJoin = 'round';
        for (const [col, lw] of [['rgba(255,255,255,.95)', w + 2.4 * d], [l.color, w]]) { g.strokeStyle = col; g.lineWidth = lw; if (l.kind === 'cable') g.setLineDash([5 * d, 3 * d]); g.beginPath(); for (let i = 0; i < P.length; i += 2) { const q = S(P[i], P[i + 1]); if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); } g.stroke(); g.setLineDash([]); }
        for (const e of l.st) { if (e.x < x0 - 20 || e.x > x1 + 20 || e.y < y0 - 20 || e.y > y1 + 20) continue; const q = S(e.x, e.y); g.fillStyle = '#fff'; g.strokeStyle = l.color; g.lineWidth = 2.2 * d; g.beginPath(); g.arc(q.x, q.y, (l.kind === 'metro' ? 4.6 : 3.6) * d, 0, TAU); g.fill(); g.stroke(); }
      }
    } if (fase === 'red') for (const v of Ciudad.transit) { const l = v.line; if (!KINDS[l.kind]) continue; const p = Ciudad.tpos(v); if (p.x < x0 || p.x > x1 || p.y < y0 || p.y > y1) continue; const q = S(p.x, p.y); g.fillStyle = l.color; g.strokeStyle = '#fff'; g.lineWidth = 1.8 * d; g.beginPath(); g.arc(q.x, q.y, (l.kind === 'metro' ? 3.8 : 2.8) * d, 0, TAU); g.fill(); g.stroke(); }
  },
  /* malla 3D del taller de arte para un vehículo de VEH (null sin taller o sin WebGL: se dibuja con cajas) */
  malla3(kind, monta) { const M = MALLA3[kind], p = !!(monta && M && M[2]); return M && EM.taller && EM.taller.malla ? EM.taller.malla('v:' + M[0] + (p ? '+p' : ''), () => EM.taller.vehiculo(M[0], { persona: p })) : null; },
  /* ---------- vistas 3D (1.4.0) ---------- */
  alto3(st) {   // altura del jugador en 3D: el piso, el tablero del puente, la vía del metro o la línea del cable
    let z = MAP.elevM(st.x, st.y); if (st.mode === 'ride') { const v = st.ride, l = v.line; if (l.kind === 'metro' || l.kind === 'tram') z = G3.zOn(l, v.s) + 1.2; else if (l.kind === 'cable') { const C = G3.cableGeo(l); z = C.zAt(NET.project(C.P, st.x, st.y).s) - 3.2; } }
    else if (st.z && VC.PG) { const P = VC.puenteEn(st.x, st.y, st.z, .8); if (P) z += st.z < 0 ? -P.h : P.h; } return z;
  },
  _rgb: new Map(),
  rgb3(h) { let c = this._rgb.get(h); if (!c) { c = typeof h === 'string' && /^#[0-9a-f]{6}$/i.test(h) ? rgb(h) : typeof h === 'string' && /^#[0-9a-f]{3}$/i.test(h) ? rgb('#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]) : [.8, .8, .8]; this._rgb.set(h, c); } return c; },
  /* una persona en cajas: piernas, cuerpo, cabeza y gorro (el jugador, la gente con nombre y los peatones) */
  persona3(G, x, z, y, a, p, s = 1, paso = 0) {
    const C = h => this.rgb3(h), b = Math.abs(Math.sin(paso)) * .06 * s;
    G.box(x, z, y, a, .32 * s, .42 * s, .8 * s, C(p.pants || '#2a3b5c')); G.box(x, z + .8 * s + b, y, a, .36 * s, .5 * s, .62 * s, C(p.col || '#1C5C9C')); G.box(x, z + 1.42 * s + b, y, a, .3 * s, .3 * s, .3 * s, C(p.skin || '#e8b98f'));
    if (p.gorro === 2) G.box(x, z + 1.66 * s + b, y, a, .62 * s, .62 * s, .07 * s, [.94, .91, .83]); else if (p.gorro) G.box(x, z + 1.68 * s + b, y, a, .34 * s, .34 * s, .1 * s, C(p.hatCol || '#EC343A')); else G.box(x, z + 1.68 * s + b, y, a, .31 * s, .31 * s, .06 * s, C(p.hair || '#2a1a10'));
    if (p.acc === 1) G.box(x - Math.cos(a) * .25 * s, z + .95 * s + b, y - Math.sin(a) * .25 * s, a, .16 * s, .36 * s, .42 * s, [.17, .18, .22]); if (p.acc === 3) G.box(x, z + .78 * s + b, y, a, .44 * s, .62 * s, .5 * s, [.54, .51, .45]);
  },
  draw3D(g, st, vp) {
    const W = vp.w, H = vp.h, V = this.V(st), z = this.alto3(st), jY = st.jumpY || 0, yaw = (st.cy == null ? st.h : st.cy) + (st.cyo || 0), c = Math.cos(yaw), s = Math.sin(yaw), zu = clamp(st.zoomU || 1, .35, this.ZU_MAX), po = st.cpo || 0;
    const largo = st.mode === 'ride' ? (st.ride.line.kind === 'metro' ? 34 : st.ride.line.kind === 'cable' ? 12 : 26) : st.mode === 'veh' ? 8 + V.len * 1.1 : 9;
    let cam, nearP = 2.4;
    if (st.vista3 === 'cen3d') {
      // 3D Cenital sobre el MISMO mundo 3D: Norte arriba (-Y), Este derecha (+X), ángulo configurable (76°/62°/48°)
      const angI = clamp((Save.d.settings.angulo | 0), 0, 2);
      if (st.zoomObj) { st.zoomU = st.zoomObj + ((st.zoomU || 1) - st.zoomObj) * .82; if (Math.abs(st.zoomU - st.zoomObj) < .004) { st.zoomU = st.zoomObj; st.zoomObj = 0; } }   /* 3.11.0: el paso suave del 👁 */
      const zw = clamp(((st.zoomU || 1) - 2) / 1.6, 0, 1), w = zw * zw * (3 - 2 * zw);   /* 0 hasta el zoom 2; 1 en el 3,6: casi tercera persona */
      const pitch = lerp(clamp(([1.32, 1.08, .84][angI] || 1.08) + po * .75, .52, 1.44), .7, w);
      if (st.camLibre || w <= 0) st.cyC = st.h; else st.cyC = (st.cyC == null ? st.h : st.cyC) + Math.atan2(Math.sin(st.h - st.cyC), Math.cos(st.h - st.cyC)) * .06;
      const F = st.camLibre ? -Math.PI / 2 : -Math.PI / 2 + Math.atan2(Math.sin(st.cyC + Math.PI / 2), Math.cos(st.cyC + Math.PI / 2)) * w; st.fangC = F;   /* hacia dónde mira: el norte de lejos, el rumbo de cerca */
      const lead = st.mode === 'walk' ? 4 : Math.min(18, Math.abs(st.vf) * .9);
      const tx = st.camLibre ? st.cam.x : st.x + Math.cos(st.h) * lead;
      const ty = st.camLibre ? st.cam.y : st.y + Math.sin(st.h) * lead;
      const tz = st.camLibre ? MAP.elevM(tx, ty) : z;
      const distR = (st.far ? 185 : st.mode === 'ride' ? 96 : st.mode === 'veh' ? lerp(72, 104, clamp(Math.abs(st.vf) / V.vmax, 0, 1)) : 68) / zu;
      const ex = tx - Math.cos(F) * Math.cos(pitch) * distR, ey = ty - Math.sin(F) * Math.cos(pitch) * distR, ez = Math.max(tz + Math.sin(pitch) * distR, MAP.elevM(ex, ey) + lerp(14, 8, w));
      st._ec = st._ec || { x: ex, y: ey, z: ez };
      const E = st._ec, f = st.camLibre ? .35 : .18;
      E.x += (ex - E.x) * f; E.y += (ey - E.y) * f; E.z += (ez - E.z) * f;
      if (dist(E.x, E.y, ex, ey) > 350) { E.x = ex; E.y = ey; E.z = ez; }
      cam = { eye: [E.x, E.z, E.y], at: [tx, tz + 1.2, ty], fov: .88 };
      nearP = 3.2;
    } else if (st.vista3 === '1p') {
      // Primera persona real sobre el MISMO mundo 3D
      const eyeH = st.mode === 'ride' ? (st.ride.line.kind === 'cable' ? 1.0 : 2.3) : st.mode === 'veh' ? (V.monta || st.veh.kind === 'bici' ? 1.65 : st.veh.kind === 'alimentador' || st.veh.kind === 'bus' || st.veh.kind === 'metroplus' ? 2.35 : 1.45) : 1.68;
      const fwd = st.mode === 'veh' && !V.monta && st.veh.kind !== 'bici' ? V.len * .16 : .25;
      const h1 = st.h + (st.cyo || 0), c1 = Math.cos(h1), s1 = Math.sin(h1);
      const ex = st.x + c1 * fwd, ey = st.y + s1 * fwd, ez = z + eyeH + jY;
      cam = { eye: [ex, ez, ey], at: [ex + c1 * 40, ez - 2.2 - po * 18, ey + s1 * 40], fov: 1.18 / Math.sqrt(clamp(zu, .6, 1.6)) };
      nearP = .55;
    } else if (st.vista3 === 'cine') {   // una cámara en la calle, adelante y a un lado, que te ve pasar; se cambia cuando la dejas atrás
      const C0 = st._cine, ad = C0 ? (C0.x - st.x) * Math.cos(st.h) + (C0.y - st.y) * Math.sin(st.h) : -1;
      if (!C0 || ad < -12 || dist(C0.x, C0.y, st.x, st.y) > 160 || st.t - C0.t > 14) { const sd = h2(st.t | 0, 3, 7) < .5 ? -1 : 1, fw = 26 + h2(st.t | 0, 4, 7) * 30, px0 = st.x + Math.cos(st.h) * fw - Math.sin(st.h) * sd * 9, py0 = st.y + Math.sin(st.h) * fw + Math.cos(st.h) * sd * 9, z0 = Math.max(MAP.elevM(px0, py0), z - 4) + 4.2 + (st.mode === 'ride' ? 8 : 0), q = VC.on && VC.camaraLibre ? VC.camaraLibre(px0, py0, st.x, st.y, z0) : { x: px0, y: py0, z: z0 }; st._cine = { x: q.x, y: q.y, z: q.z, t: st.t }; }   // en la calle, a la altura de un poste
      cam = { eye: [st._cine.x, st._cine.z, st._cine.y], at: [st.x, z + 1.2 + jY, st.y], fov: .9 / Math.sqrt(zu) };
    } else {
      const D = (st.vista3 === 'dron' ? 95 : largo) / zu, Hh = (st.vista3 === 'dron' ? 70 : st.mode === 'walk' ? 3.4 : 4.2 + (V ? V.len * .25 : 3)) / zu * (1 + po * 1.6) + (st.vista3 === 'dron' ? 0 : 1.2);
      const ex = st.x - c * D, ey = st.y - s * D, ez = Math.max(z + Hh, MAP.elevM(ex, ey) + 2.5); st._ec = st._ec || { x: ex, y: ey, z: ez }; const E = st._ec, f = st.vista3 === 'dron' ? .08 : .25; E.x += (ex - E.x) * f; E.y += (ey - E.y) * f; E.z += (ez - E.z) * f; if (dist(E.x, E.y, ex, ey) > 300) { E.x = ex; E.y = ey; E.z = ez; }
      cam = { eye: [E.x, E.z, E.y], at: [st.x + c * (st.vista3 === 'dron' ? 0 : 4), z + (st.vista3 === 'dron' ? 0 : 1.4 + jY * .7), st.y + s * (st.vista3 === 'dron' ? 0 : 4)], fov: st.vista3 === 'dron' ? .85 : 1.05 };
    }
    G3.draw(cam, { hour: Mundo.hour(), rain: Mundo.weather().rain, escala: Game.dpr && Game.dpr < 1.5 ? .75 : .92, suave: true, cerca: nearP, dyn: G => this.dyn3D(G, st, z) });
    if (st.vista3 === '1p' && st.mode === 'veh' && EM.taller && EM.taller.primera) {
      const mid = (MALLA3[st.veh.kind] && MALLA3[st.veh.kind][0]) || (st.veh.kind === 'metroplus' ? 'bus' : st.veh.kind);
      EM.taller.primera(g, mid, W, H, -(st.steer || 0) * .42 + (jY > .1 ? -.04 : 0));
    }
    this.hud3D(g, st, W, H, z);
  },
  dyn3D(G, st, zj) {
    const C = h => this.rgb3(h), E = (x, y) => MAP.elevM(x, y), cerca = (x, y, r) => Math.abs(x - st.x) < r && Math.abs(y - st.y) < r;
    for (const k of Ciudad.cars) { if (!cerca(k.x, k.y, 240)) continue; const L = k.kind === 'bus' ? 12 : k.kind === 'moto' ? 2 : 4.4, Wd = k.kind === 'moto' ? .8 : k.kind === 'bus' ? 2.5 : 1.8, Hh = k.kind === 'bus' ? 3 : k.kind === 'moto' ? 1.5 : 1.45, zk = E(k.x, k.y) + (VC.PG ? VC.carAlto(k) : 0); G.box(k.x, zk + .3, k.y, k.a, L, Wd, Hh * .62, C(k.col)); G.box(k.x, zk + .3 + Hh * .62, k.y, k.a, L * .55, Wd * .92, Hh * .38, [.15, .22, .3]); }
    for (const p of Ciudad.peds) { if (!cerca(p.x, p.y, 90) || p.dog) continue; this.persona3(G, p.x, E(p.x, p.y), p.y, p.a || 0, p, 1, p.ph || 0); }
    if (typeof Gente !== 'undefined') for (const p of Gente.todos(st)) { if (!cerca(p.x, p.y, 130)) continue; this.persona3(G, p.x, E(p.x, p.y), p.y, p.a || 0, p.look, 1.05, p.v > .1 ? p.ph : 0); }
    // estaciones de EnCicla en 3D
    for (const D of st.docks || []) {
      if (!cerca(D.x, D.y, 150)) continue;
      const zd = E(D.x, D.y);
      G.box(D.x, zd + .08, D.y, 0, 7.2, 1.5, .18, [.055, .176, .333]);
      for (let i = 0; i < 5; i++) G.box(D.x - 2.9 + i * 1.45, zd + .18, D.y, 0, .24, .34, .75, [.608, .827, .255]);
      G.box(D.x + 4.1, zd + .05, D.y, 0, .7, .7, 2.5, [.055, .176, .333]);
      G.box(D.x + 4.1, zd + 2.0, D.y, 0, .74, .74, .45, [.608, .827, .255]);
    }
    if (EM.mundoRPG && EM.mundoRPG.draw3D) EM.mundoRPG.draw3D(G, st, zj);
    for (const p of st.parked) { if (!cerca(p.x, p.y, 160)) continue; const V = VEH[p.kind], zp = E(p.x, p.y), m3 = this.malla3(p.kind); if (m3) { EM.taller.mundo(m3, p.x, zp, p.y, p.a); continue; } const chico = p.kind === 'bici' || V.monta; G.box(p.x, zp + (V.monta ? .05 : .3), p.y, p.a, V.len, V.wid, V.monta ? .12 : chico ? .9 : 1, C(V.col)); if (!chico && p.kind !== 'moto') G.box(p.x, zp + 1.3, p.y, p.a, V.len * .55, V.wid * .92, .55, [.15, .22, .3]); }
    // el transporte de la ciudad en su sitio: trenes por vagones sobre su vía, articulados en dos cuerpos, cabinas en su cable
    for (const v of Ciudad.transit) { const p = Ciudad.tpos(v); if (!cerca(p.x, p.y, 700)) continue; const l = v.line, kind = l.kind, col = C(l.color);
      const TS = EM.taller && EM.taller.dibujaSistema, lluvia = Mundo.weather().rain;   // 3.0 · el sistema en 3D con la paleta de cada línea (28-taller-sistema.js); si no, las cajas
      if (kind === 'metro' || kind === 'tram') { const carL = kind === 'metro' ? 22 : 19.5, n = kind === 'metro' ? 3 : 2; for (let i = 0; i < n; i++) { const s0 = v.s - v.dir * (i * (carL + 1) + carL / 2), q = Ciudad.cuerda(l.P, s0 + v.dir * carL * .35, s0 - v.dir * carL * .35, v.dir * 2), zq = G3.zOn(l, s0), op = { largo: carL, panto: i === 0, puntas: i === 0 ? [1] : i === n - 1 ? [-1] : [] };
        if (!(TS && TS(kind === 'metro' ? 'metro' : 'tranvia', l.color, q.x, zq, q.y, q.a, op))) G3.vehicle(q.x, zq, q.y, q.a, carL, kind, col); else if (i === 0 && cerca(q.x, q.y, 260)) { const u = kind === 'metro' ? carL * .3 - .25 : carL * .1 - .2; EM.taller.chispa(q.x + Math.cos(q.a) * u, zq + (kind === 'metro' ? 5.05 : 4.6), q.y + Math.sin(q.a) * u, q.a, st.t + i * 3.1 + v.s * .01, lluvia); } } }
      else if (kind === 'cable') { const Cg = G3.cableGeo(l), zc = Cg.zAt(NET.project(Cg.P, p.x, p.y).s); if (!(TS && TS('cabina', l.color, p.x, zc - 4.05, p.y, p.a))) { G.box(p.x, zc - 4.6, p.y, p.a, 2.2, 2, 2.2, col); G.box(p.x, zc - 2.4, p.y, p.a, .25, .25, 2.4, [.3, .3, .32]); } }
      else { const zb = E(p.x, p.y); if (kind === 'brt') { const f = Ciudad.cuerda(l.P, v.s - v.dir * 1.4, v.s - v.dir * 9.9, v.dir * 2.2), r = Ciudad.cuerda(l.P, v.s - v.dir * 12.6, v.s - v.dir * 16.6, v.dir * 2.2); if (!(TS && TS('brtF', l.color, f.x, zb, f.y, f.a, { largo: 11.3 }))) G3.vehicle(f.x, zb, f.y, f.a, 11.3, 'brt', col); if (!(TS && TS('brtR', l.color, r.x, zb, r.y, r.a, { largo: 6.4 }))) G3.vehicle(r.x, zb, r.y, r.a, 6.4, 'brt', col); } else { const q = Ciudad.cuerda(l.P, v.s - v.dir * 2.4, v.s - v.dir * (KIND[kind].len - 2.6), v.dir * 2.2); if (!(TS && TS('bus', l.color, q.x, zb, q.y, q.a, { largo: KIND[kind].len }))) G3.vehicle(q.x, zb, q.y, q.a, KIND[kind].len, kind, col); } } }
    // tú: a pie con tu ropa, o tu vehículo (se omite el cuerpo propio en 1ª persona); con salto y giro de truco
    const zjP = zj + (st.jumpY || 0), hP = st.h + (st.trickSpin > 0 ? st.trickSpin * TAU : 0);
    if (st.mode !== 'ride' && st.vista3 !== '1p') { const V = this.V(st);
      if (st.mode === 'walk') this.persona3(G, st.x, zjP, st.y, hP, Perfil.ped(), 1.08, st.wv > .2 ? st.t * (st.run ? 14 : 8) : 0);
      else if (V.art) { const Lf = V.len * .63, hx = st.x + Math.cos(st.h) * (V.len / 2 - Lf), hy = st.y + Math.sin(st.h) * (V.len / 2 - Lf), a2 = st.h2 == null ? st.h : st.h2; G3.vehicle(hx + Math.cos(st.h) * Lf / 2, zjP, hy + Math.sin(st.h) * Lf / 2, st.h, Lf, 'brt', C(V.col)); G3.vehicle(hx - Math.cos(a2) * (.9 + (V.len - Lf - .9) / 2), zjP, hy - Math.sin(a2) * (.9 + (V.len - Lf - .9) / 2), a2, V.len - Lf - .9, 'brt', C(V.col)); }
      else if (this.malla3(st.veh.kind, 1)) { EM.taller.mundo(this.malla3(st.veh.kind, 1), st.x, zjP, st.y, hP); const pie = MALLA3[st.veh.kind][1]; if (pie != null) this.persona3(G, st.x, zjP + pie, st.y, hP, Perfil.ped(), 1, 0); }   // mallas del taller de arte (Codex)
      else if (V.monta) { G.box(st.x, zjP + .06, st.y, hP, V.len, V.wid, .12, C(V.col)); if (st.veh.kind === 'scooter') G.box(st.x + Math.cos(hP) * V.len * .42, zjP + .1, st.y + Math.sin(hP) * V.len * .42, hP, .06, .06, 1, [.14, .15, .17]); this.persona3(G, st.x, zjP + .18, st.y, hP, Perfil.ped(), 1, 0); }
      else if (st.veh.kind === 'bici') { G.box(st.x, zjP + .35, st.y, hP, 1.7, .12, .7, C(V.col)); this.persona3(G, st.x, zjP + .55, st.y, hP, Perfil.ped(), 1, 0); }
      else { const Hh = st.veh.kind === 'moto' ? 1.3 : st.veh.kind === 'alimentador' ? 3 : 1.45; G.box(st.x, zjP + .3, st.y, hP, V.len, V.wid, Hh * .62, C(V.col)); G.box(st.x, zjP + .3 + Hh * .62, st.y, hP, V.len * .55, V.wid * .92, Hh * .38, [.15, .22, .3]); }
      const tope = zjP + (st.mode === 'veh' ? 3.6 : 2.5) + Math.sin(st.t * 3) * .18; G.box(st.x, tope, st.y, st.t * 1.5, .38, .38, .38, [1, .55, .1], .78, .78); }
    else if (st.mode === 'ride' && st.vista3 !== '1p') { const tope = zj + 6 + Math.sin(st.t * 3) * .18; G.box(st.x, tope, st.y, st.t * 1.5, .42, .42, .42, [1, .55, .1], .78, .78); }
    // el destino: un poste alto que se ve de lejos
    const J = st.goal || st.job || st.guia; if (J && J.x != null && cerca(J.x, J.y, 1500)) { const zg = E(J.x, J.y); G.box(J.x, zg, J.y, 0, .7, .7, 16 + Math.sin(st.t * 4), [.98, .78, .2]); G.box(J.x, zg + 16, J.y, st.t, 2.4, 2.4, 2.4, [1, .9, .4]); }
  },
  hud3D(g, st, W, H, zj) {
    const dpr = W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W), P = (x, y, z) => G3.toScreen(x, z, y, W, H);
    const rot = (t, x, y, col) => { g.lineWidth = 3 * dpr; g.strokeStyle = 'rgba(255,255,255,.92)'; g.strokeText(t, x, y); g.fillStyle = col || '#0f2238'; g.fillText(t, x, y); };
    g.font = '700 ' + Math.round(12 * dpr) + 'px Cuerpo, sans-serif'; g.textAlign = 'center';
    if (typeof Gente !== 'undefined') for (const p of Gente.todos(st)) { const d = dist(p.x, p.y, st.x, st.y); if (d > 40) continue; const q = P(p.x, p.y, MAP.elevM(p.x, p.y) + 2.3); if (q) rot(p.G.n + ((Save.d.gente || {})[p.G.id] || p.tur ? '' : ' 💬'), q.x, q.y); }
    for (const h of NET.stations) { if (Math.abs(h.x - st.x) > 500 || Math.abs(h.y - st.y) > 500 || !h.lines.some(l => l.kind === 'metro' || l.kind === 'tram' || l.kind === 'cable')) continue; const l = h.lines.find(l => l.kind === 'metro' || l.kind === 'tram') , q = P(h.x, h.y, (l ? G3.zOn(l, NET.project(l.P, h.x, h.y).s) : MAP.elevM(h.x, h.y)) + 9); if (q) rot('🚉 ' + h.name, q.x, q.y, '#1C5C9C'); }
    if (EM.mundoRPG && EM.mundoRPG.hud3D) EM.mundoRPG.hud3D(g, st, P, rot, dpr);
    if (st.vista3 !== '1p' && st.mode !== 'ride') { const yo = P(st.x, st.y, zj + (st.jumpY || 0) + (st.mode === 'veh' ? 4.5 : 3.2)); if (yo) { g.font = '800 ' + Math.round(12 * dpr) + 'px Cuerpo, sans-serif'; rot('Tú', yo.x, yo.y - 6 * dpr, '#c2410c'); } }
    g.textAlign = 'left';
    // el destino: anillo en pantalla o flecha al borde, según hacia dónde queda respecto a la cámara
    const J = st.goal || st.job || st.guia; if (J && J.x != null) { const q = P(J.x, J.y, MAP.elevM(J.x, J.y) + 2), inside = q && q.x > 20 && q.x < W - 20 && q.y > 60 && q.y < H - 20;
      if (!inside) { const dx = J.x - st.x, dy = J.y - st.y; let a; if (st.vista3 === 'cen3d') a = Math.atan2(dy, dx); else { const yaw = (st.cy || 0) + (st.cyo || 0), fx = dx * Math.cos(yaw) + dy * Math.sin(yaw), rx = -dx * Math.sin(yaw) + dy * Math.cos(yaw); a = Math.atan2(-fx, rx); } const r = Math.min(W, H) * .4, ax = W / 2 + Math.cos(a) * r, ay = H / 2 + Math.sin(a) * r; g.save(); g.translate(ax, ay); g.rotate(a); g.fillStyle = PAL.mostaza; g.strokeStyle = PAL.negro; g.lineWidth = 2; g.beginPath(); g.moveTo(16 * dpr, 0); g.lineTo(-10 * dpr, -11 * dpr); g.lineTo(-4 * dpr, 0); g.lineTo(-10 * dpr, 11 * dpr); g.closePath(); g.fill(); g.stroke(); g.restore(); } }
    this.minimap(g, st, W, H);
  },
  minimap(g, st, W, H) {
    const dpr = W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W), R = 58 * dpr, cx = R + 12 * dpr, cy = H - R - 12 * dpr, km = st.far ? 1 / 90 : 1 / 45;
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.clip(); g.fillStyle = PAL.noche; g.fillRect(cx - R, cy - R, R * 2, R * 2);
    if (MAP.ready) { const m = MAP.mini(), s = km * MAP.miniK * dpr; g.imageSmoothingEnabled = true; g.drawImage(m, cx - st.x * km * dpr, cy - st.y * km * dpr, m.width * s, m.height * s); }
    const S = (x, y) => ({ x: cx + (x - st.x) * km * dpr, y: cy + (y - st.y) * km * dpr });
    for (const l of NET.lines) { if (l.kind !== 'feeder') continue; g.strokeStyle = l.color; g.globalAlpha = .8; g.lineWidth = 1 * dpr; g.setLineDash([3 * dpr, 2 * dpr]); g.beginPath(); l.P.pts.forEach((p, i) => { const q = S(p.x, p.y); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; }   // 3.1 · alimentadores en el minimapa
    for (const l of NET.lines) { if (l.kind === 'future' || l.kind === 'feeder') continue; g.strokeStyle = l.color; g.lineWidth = (l.kind === 'metro' ? 3 : 1.5) * dpr; g.beginPath(); l.P.pts.forEach((p, i) => { const q = S(p.x, p.y); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }); g.stroke(); }
    for (const h of NET.stations) { if (!h.lines.some(l => l.kind === 'metro' || l.kind === 'tram' || l.kind === 'cable')) continue; const q = S(h.x, h.y); if (Math.hypot(q.x - cx, q.y - cy) > R) continue; g.fillStyle = st.visited[h.name] ? '#fff' : 'rgba(255,255,255,.45)'; g.fillRect(q.x - 1.5 * dpr, q.y - 1.5 * dpr, 3 * dpr, 3 * dpr); }
    const GJ = st.goal || st.job; if (GJ && GJ.x != null) { const q = S(GJ.x, GJ.y), d = Math.hypot(q.x - cx, q.y - cy), f = d > R - 6 ? (R - 6) / d : 1; g.fillStyle = PAL.mostaza; g.beginPath(); g.arc(cx + (q.x - cx) * f, cy + (q.y - cy) * f, 4 * dpr, 0, TAU); g.fill(); }
    g.save(); g.translate(cx, cy); g.rotate(st.h); g.fillStyle = PAL.naranja; g.strokeStyle = PAL.negro; g.lineWidth = 1.5; g.beginPath(); g.moveTo(7 * dpr, 0); g.lineTo(-5 * dpr, -5 * dpr); g.lineTo(-5 * dpr, 5 * dpr); g.closePath(); g.fill(); g.stroke(); g.restore();
    g.restore(); g.strokeStyle = PAL.negro; g.lineWidth = 3 * dpr; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.stroke(); g.strokeStyle = PAL.mante; g.lineWidth = 1.5 * dpr; g.stroke();
    g.fillStyle = PAL.mante; g.font = '800 ' + (9 * dpr) + 'px Cuerpo, sans-serif'; g.textAlign = 'center'; g.fillText('N', cx, cy - R + 11 * dpr); g.textAlign = 'left';
  },
  ai(st) { return null; }
};
