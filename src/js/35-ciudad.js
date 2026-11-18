/* =====================================================================
   CIUDAD VIVA (vista cenital): la simulación compartida del Valle de Aburrá.
   · Transporte público real en movimiento y abordable: trenes (A, B), tranvía, cabinas de los
     metrocables, articulados de Metroplús y buses alimentadores, cada uno con sus paradas.
   · Peatones con rumbo (van a la estación, al parque, a la casa), paraguas cuando llueve,
     se asustan con los carros y conversan si te les acercas.
   · Tráfico en los carriles reales con semáforos de 32 s (TRAF).
   · Luces: ventanas, postes en las avenidas, faros de los carros y sombras según el sol.
   · Lugares reales (LUGARES) dibujados sobre el mapa con su nombre.
   ===================================================================== */
const WALK_OK = new Set([TT.WALK, TT.PLAZA, TT.GRASS, TT.CICLO, TT.STATION, TT.BRIDGE, TT.DEPOT, TT.STEPS, TT.ROAD]);
const PED_FRASES = ['¡Qué pena!', '¿Pa’ dónde va el alimentador?', 'Vea pues…', 'Hágale, mijo', '¿Ya pasó el tren?', '¡Buenas!', 'Con permiso', 'Qué calor, ¿no?', '¿Esta es la estación?', 'Voy tarde pa’l trabajo', '¡Uy, cuidado!', 'Gracias, muy amable', '¿Me regala la hora?', 'Hoy no hay pico y placa', 'Está lloviendo, vea'];
const DOG_COL = ['#8a5a32', '#2a2420', '#d8c8a8', '#b07a3a', '#efe8d8', '#5a4636', '#c9a46a'];
const PED_COL = ['#EC343A', '#1C5C9C', '#59AB42', '#F6C538', '#E38835', '#743D90', '#fbe7b0', '#141414', '#0E6F76', '#EB318E', '#ffffff', '#8a5a3b'];
const Ciudad = EM.ciudad = {
  transit: [], peds: [], cars: [], bubbles: [], marks: [], parts: [], vendors: [], t: 0, spawnT: 0, carT: 0, focus: { x: 0, y: 0 }, ready: false, lm: null,
  PRODUCTOS: [['Mango biche', '#59AB42'], ['Tintico', '#5a3417'], ['Chontaduro', '#E38835'], ['Minutos', '#1C5C9C'], ['Arepa de queso', '#F6C538'], ['Jugo de naranja', '#ff9f1c'], ['Chicles y cigarrillos', '#EC343A']],
  init(seed = 1) {
    this.t = 0; this.peds = []; this.cars = []; this.bubbles = []; this.marks = []; this.parts = []; this.transit = []; TRAF.build(); this.rng = new RNG(seed);
    for (const line of NET.lines) {
      if (line.kind === 'future' || line.kind === 'escalator' || line.P.len < 200) continue; const K = KIND[line.kind];
      const n = Math.max(2, Math.round(line.P.len / (line.kind === 'metro' ? 1500 : line.kind === 'cable' ? 180 : line.kind === 'tram' ? 900 : 1300))), L2 = line.P.len * 2;
      for (let i = 0; i < n; i++) { const q = (i * L2 / n) % L2, dir = q < line.P.len ? 1 : -1, s = dir > 0 ? q : L2 - q; const ni = this.nextStop(line, s, dir); this.transit.push({ line, s, dir, ph: 'run', dw: 0, ni, spd: K.vmax * (line.kind === 'cable' ? 1 : .72), st: null, id: line.id + i }); }
    }
    this.vendors = []; for (const h of NET.stations) { if (!h.lines.some(l => l.kind === 'metro' || l.kind === 'tram' || l.kind === 'cable')) continue; const r = h2(h.x | 0, h.y | 0, 21); if (r > .75) continue; const P = this.PRODUCTOS[(r * 97 | 0) % this.PRODUCTOS.length]; let x = h.x + 26, y = h.y + 18; for (let k = 0; k < 12; k++) { const a = r * TAU + k * .9, tx = h.x + Math.cos(a) * (22 + k * 2), ty = h.y + Math.sin(a) * (22 + k * 2), v = MAP.tileM(tx, ty); if (v === TT.WALK || v === TT.PLAZA) { x = tx; y = ty; break; } } this.vendors.push({ x, y, a: r * TAU, name: P[0], col: P[1], seed: (r * 1e6) | 0, skin: SKIN[(r * 5) | 0], said: 0 }); }
    if (!this.lm) this.lm = (typeof LUGARES !== 'undefined' ? LUGARES : []).map(([id, name, muni, lat, lon, w, h, k, fact, secret]) => Object.assign({ id, name, muni, w: w * TM, h: h * TM, k, fact, secret: !!secret }, geoM(lat, lon)));
    this.ready = true;
  },
  nextStop(line, s, dir) { const st = line.st; if (dir > 0) { for (let i = 0; i < st.length; i++) if (st[i].s > s + 1) return i; return st.length - 1; } for (let i = st.length - 1; i >= 0; i--) if (st[i].s < s - 1) return i; return 0; },
  tpos(v) { return NET.at(v.line.P, v.s, v.dir * (v.line.kind === 'metro' ? 2 : v.line.kind === 'cable' ? 0 : 2.2)); },
  /* ---------- transporte ---------- */
  transitTick(dt) {
    const fx = this.focus.x, fy = this.focus.y;
    for (const v of this.transit) {
      const K = KIND[v.line.kind]; if (v.line._far == null || (this.t % 2) < dt) { const s0 = v.line.st[0], s1 = v.line.st[v.line.st.length - 1]; v.line._far = Math.min(dist(fx, fy, s0.x, s0.y), dist(fx, fy, s1.x, s1.y), dist(fx, fy, v.line.st[v.line.st.length >> 1].x, v.line.st[v.line.st.length >> 1].y)) > 6000; }
      if (v.line._far) { v.s = clamp(v.s + v.dir * v.spd * dt * .8, 0, v.line.P.len); if (v.s <= 0 || v.s >= v.line.P.len) { v.dir *= -1; v.ni = this.nextStop(v.line, v.s, v.dir); } continue; }
      if (v.ph === 'dwell') { v.dw += dt; if (v.dw >= K.dwell * (v.line.kind === 'cable' ? .6 : 1)) { v.ph = 'run'; v.st = null; if ((v.dir > 0 && v.ni >= v.line.st.length - 1) || (v.dir < 0 && v.ni <= 0)) v.dir *= -1; v.ni = this.nextStop(v.line, v.s, v.dir); } continue; }
      const tgt = v.line.st[v.ni].s, d = (tgt - v.s) * v.dir, vmax = Math.min(v.spd, Math.sqrt(2 * K.brk * .8 * Math.max(0, d)) + .3); v.v = Math.min(vmax, (v.v || 0) + K.acc * dt); v.s += v.dir * v.v * dt;
      if ((tgt - v.s) * v.dir <= 0) { v.s = tgt; v.ph = 'dwell'; v.dw = 0; v.v = 0; v.st = v.line.st[v.ni]; }
    }
  },
  /* vehículo del transporte detenido en el andén de una estación (para subirse) */
  atHub(hub, x, y, pref) { let best = null, bd = 1e9; for (const v of this.transit) { if (v.ph !== 'dwell' || !v.st || v.st.hub !== hub) continue; const p = this.tpos(v), d = dist(x, y, p.x, p.y) - (pref && v.line.id === pref ? 60 : 0); if (d < bd) { bd = d; best = v; } } return best && bd < 70 ? best : null; },
  /* ---------- peatones ---------- */
  pedTick(dt, player) {
    const L = Mundo.light(), w = L.w, want = Math.round((Save.d.settings.q === 'low' ? 28 : 56) * (1 - .6 * L.night) * (w.rain ? .6 : 1)), fx = this.focus.x, fy = this.focus.y;
    this.spawnT -= dt;
    if (this.spawnT <= 0 && this.peds.length < want) {
      this.spawnT = .12; const rng = this.rng;
      for (let k = 0; k < 6; k++) { const a = rng.f() * TAU, r = 90 + rng.f() * 200; let x = fx + Math.cos(a) * r, y = fy + Math.sin(a) * r; const v = MAP.tileM(x, y), ac = VC.on && rng.f() < .75 ? VC.acera(x, y, () => rng.f()) : null; if (ac) { x = ac.x; y = ac.y; } else if (v !== TT.WALK && v !== TT.PLAZA && v !== TT.STATION && v !== TT.STEPS && !(v === TT.GRASS && rng.f() < .3)) continue; if (VC.on && VC.solid(x, y, .5)) continue; const o = { x, y, a: rng.f() * TAU, v: 1 + rng.f() * .8, seed: rng.i(1, 1e6), tgt: null, wait: 0, umb: w.rain && rng.f() < .7, col: rng.pick(PED_COL), skin: rng.pick(SKIN), stun: 0, ph: 0, scared: 0 }; this.peds.push(o);
        if (rng.f() < .08) { o.dog = 1; o.umb = false; o.v = 1.4 + rng.f(); o.col = rng.pick(DOG_COL); } else if (rng.f() < .1) this.peds.push({ x: x - 1.2, y, a: o.a, v: o.v, seed: rng.i(1, 1e6), tgt: null, wait: 0, col: rng.pick(DOG_COL), stun: 0, ph: 0, scared: 0, dog: 1, owner: o }); break; }
    }
    for (const p of this.peds) {
      p.ph += dt * p.v * 2.4; if (p.stun > 0) { p.stun -= dt; continue; }
      if (p.owner) { const o = p.owner; if (o.gone || o.board || o.waitStop != null || dist(p.x, p.y, o.x, o.y) > 25) p.owner = null; else { const tx = o.x - Math.cos(o.a) * 1.7 + Math.sin(this.t * .8 + p.seed) * .5, ty = o.y - Math.sin(o.a) * 1.7 + Math.cos(this.t * .7 + p.seed) * .5, d = dist(p.x, p.y, tx, ty); if (d > .25) { p.a = Math.atan2(ty - p.y, tx - p.x); const st = Math.min(d, (o.v + 1.4) * dt); p.x += Math.cos(p.a) * st; p.y += Math.sin(p.a) * st; p.ph += dt * 5; } if (p.scared > 0) p.scared -= dt; continue; } }
      if (p.board) { const d = dist(p.x, p.y, p.board.x, p.board.y); if (d < 1.2) { p.gone = true; continue; } p.a = Math.atan2(p.board.y - p.y, p.board.x - p.x); p.x += Math.cos(p.a) * 1.7 * dt; p.y += Math.sin(p.a) * 1.7 * dt; continue; }
      if (p.waitStop != null) { p.ph = Math.sin(this.t * .6 + p.seed) * .3; continue; }
      if (p.scared > 0) { p.scared -= dt; if (p.dog && !p.bark) { p.bark = 1; this.say(p, this.rng.pick(['¡Guau!', '¡Guau, guau!', '¡Grrr!'])); } const st = p.v * 2.4 * dt, nx = p.x + Math.cos(p.a) * st, ny = p.y + Math.sin(p.a) * st; if (this.pisa(nx, ny)) { p.x = nx; p.y = ny; } continue; }
      if (p.wait > 0) { p.wait -= dt; continue; }
      if (!p.tgt || dist(p.x, p.y, p.tgt.x, p.tgt.y) < 4) { if (p.tgt) p.wait = .5 + this.rng.f() * 3; p.tgt = this.pedTarget(p); continue; }
      const ta = Math.atan2(p.tgt.y - p.y, p.tgt.x - p.x); let moved = false;
      for (const off of [0, .5, -.5, 1, -1, 1.6, -1.6, 2.4]) { const a = ta + off, st = p.v * dt, nx = p.x + Math.cos(a) * st, ny = p.y + Math.sin(a) * st, v = MAP.tileM(nx, ny); if (this.pisa(nx, ny, v) && (v !== TT.ROAD || off === 0 || VC.on)) { p.a += Math.atan2(Math.sin(a - p.a), Math.cos(a - p.a)) * Math.min(1, dt * 6); p.x = nx; p.y = ny; moved = true; break; } }
      if (!moved) { p.tgt = null; p.wait = .3; }
      // miedo a los vehículos rápidos
      if (player && player.veh && Math.abs(player.vf) > 3) { const dx = p.x - player.x, dy = p.y - player.y, d = Math.hypot(dx, dy); if (d < 9) { p.scared = .8; p.a = Math.atan2(dy, dx); if (d < 2.2 && Math.abs(player.vf) > 1.5 && !p.hit) { p.hit = 1; p.stun = 2.5; player.onPed && player.onPed(p); } } }
    }
    this.peds = this.peds.filter(p => !p.gone && (p.waitStop != null || dist(p.x, p.y, fx, fy) < 420));
  },
  /* ¿un peatón puede pisar aquí? con la ciudad vectorial: todo menos edificios y agua; si no, las casillas de andar */
  pisa(x, y, v = MAP.tileM(x, y)) { return VC.on ? !VC.solid(x, y, .3) : WALK_OK.has(v); },
  /* gente esperando en una parada (para el simulador de bus) */
  spawnWaiting(stopIdx, x, y, n) {
    const rng = this.rng, out = [];
    for (let i = 0; i < n; i++) { let px = x, py = y; for (let k = 0; k < 10; k++) { const a = rng.f() * TAU, r = 2 + rng.f() * 7, tx = x + Math.cos(a) * r, ty = y + Math.sin(a) * r, v = MAP.tileM(tx, ty); if (v === TT.WALK || v === TT.PLAZA || v === TT.STATION) { px = tx; py = ty; break; } } const p = { x: px, y: py, a: rng.f() * TAU, v: 1.2, seed: rng.i(1, 1e6), tgt: null, wait: 0, umb: Mundo.weather().rain && rng.f() < .7, col: rng.pick(PED_COL), skin: rng.pick(SKIN), stun: 0, ph: 0, scared: 0, waitStop: stopIdx }; this.peds.push(p); out.push(p); }
    return out;
  },
  vendorsDraw(g, S, k, sh, x0, y0, x1, y1) {
    for (const v of this.vendors) { if (v.x < x0 - 10 || v.x > x1 + 10 || v.y < y0 - 10 || v.y > y1 + 10) continue; if (VC.on && !v.ok) { const q = VC.despeja(v.x, v.y, 1.6); v.x = q.x; v.y = q.y; v.ok = 1; } const q = S(v.x, v.y), s = Math.max(2, k * 1.6); g.save(); g.translate(q.x + 2.2 * s, q.y); g.rotate(v.a); Spr.cart(g, s * .9, v.col); g.restore(); this.ped(g, { x: v.x, y: v.y, a: v.a, ph: 0, col: '#fbe7b0', skin: v.skin, seed: v.seed, stun: 0, hat: '#f4f1ea' }, S, k, sh); if (dist(v.x, v.y, this.focus.x, this.focus.y) < 40 && this.t - v.said > 9) { v.said = this.t; this.say(v, '¡' + v.name + '! ¡A la orden!'); } }
  },
  pedTarget(p) {
    const rng = this.rng; if (rng.f() < .35) { let best = null, bd = 1e9; for (const h of NET.stations) { const d = dist(h.x, h.y, p.x, p.y); if (d < bd && d > 25) { bd = d; best = h; } } if (best && bd < 260) return { x: best.x + (rng.f() - .5) * 20, y: best.y + (rng.f() - .5) * 20 }; }
    if (VC.on) for (let k = 0; k < 4; k++) { const a = p.a + (rng.f() - .5) * (k ? 2.4 : .7), r = 30 + rng.f() * 90, q = VC.acera(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r, () => rng.f()); if (q) return q; }   // por el andén, más o menos hacia donde iba
    for (let k = 0; k < 8; k++) { const a = rng.f() * TAU, r = 40 + rng.f() * 120, x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r, v = MAP.tileM(x, y); if ((v === TT.WALK || v === TT.PLAZA || v === TT.STATION || v === TT.GRASS) && !(VC.on && VC.solid(x, y, .5))) return { x, y }; }
    return { x: p.x + (rng.f() - .5) * 30, y: p.y + (rng.f() - .5) * 30 };
  },
  say(p, txt) { this.bubbles.push({ x: p.x, y: p.y, t: 2.4, txt: txt || this.rng.pick(PED_FRASES), p }); },
  /* ---------- carros ---------- */
  carTick(dt, player) {
    const want = Save.d.settings.q === 'low' ? 10 : 20, fx = this.focus.x, fy = this.focus.y, L = Mundo.light(); this.carT -= dt;
    if (this.carT <= 0 && this.cars.length < want * (1 - .4 * L.night)) {
      this.carT = .22; const near = TRAF.near(fx, fy); if (near.length) { const rng = this.rng, Ln = rng.pick(near), p = rng.f() * Ln.P.len, q = NET.at(Ln.P, p, Ln.off), d = dist(q.x, q.y, fx, fy); if (d > 60 && d < 330 && !(player && dist(q.x, q.y, player.x, player.y) < 30)) { const r = rng.f(); this.cars.push({ L: Ln, p, v: Ln.spd * .7, spd: Ln.spd * (.8 + r * .35), kind: r < .16 ? 'moto' : r < .4 ? 'taxi' : r < .47 ? 'bus' : 'car', col: r >= .16 && r < .4 ? '#f2c400' : CARCOL[(r * 97 | 0) % CARCOL.length], x: q.x, y: q.y, a: q.a, stop: 0, honk: 0 }); } }
    }
    for (const c of this.cars) {
      let v = c.spd * (L.w.rain ? .85 : 1); const len = c.kind === 'bus' ? 12 : c.kind === 'moto' ? 2 : 4.5;
      for (const o of this.cars) { if (o === c || o.L !== c.L) continue; const ahead = (o.p - c.p) * c.L.d; if (ahead > 0 && ahead < len + 7) v = Math.min(v, o.v * .9, Math.max(0, ahead - len - 2)); }
      const front = c.p + c.L.d * len / 2; for (const q of c.L.lights) { const d = (q.s - front) * c.L.d; if (d < 0 || d > 35) continue; const s = TRAF.state(q.g, this.t)[q.ax]; if (s === 'r' || (s === 'y' && d > 8 && c.kind !== 'moto')) v = Math.min(v, Math.max(0, (d - 3) * 1.2)); break; }
      if (player) { const fxv = Math.cos(c.a), fyv = Math.sin(c.a), dx = player.x - c.x, dy = player.y - c.y, along = dx * fxv + dy * fyv, lat = Math.abs(-dx * fyv + dy * fxv); if (along > 0 && along < 24 && lat < 3.5) { v = along < 10 ? 0 : Math.min(v, 2.5); if (c.honk <= 0 && player.veh && Math.abs(player.vf) < 1) { c.honk = 4; if (dist(c.x, c.y, fx, fy) < 120) Snd.play('horn'); } } }
      for (const p of this.peds) { const dx = p.x - c.x, dy = p.y - c.y, along = dx * Math.cos(c.a) + dy * Math.sin(c.a), lat = Math.abs(-dx * Math.sin(c.a) + dy * Math.cos(c.a)); if (along > 0 && along < 9 && lat < 2) v = 0; }
      if (c.stop > 0) { c.stop -= dt; v = 0; } c.honk -= dt;
      c.v += clamp(v - c.v, -6 * dt, 3 * dt); c.p += c.v * c.L.d * dt; const q = NET.at(c.L.P, c.p, c.L.off); c.x = q.x; c.y = q.y; c.a = c.L.d > 0 ? q.a : q.a + Math.PI;
      if (player && player.veh && !(c.ghost > 0)) { const dx = c.x - player.x, dy = c.y - player.y, along = dx * Math.cos(player.h) + dy * Math.sin(player.h), lat = -dx * Math.sin(player.h) + dy * Math.cos(player.h); if (Math.abs(along) < player.veh.len / 2 + len / 2 && Math.abs(lat) < player.veh.wid / 2 + 1) { c.ghost = 3; c.stop = 2.5; player.onCar && player.onCar(c); } } else if (c.ghost > 0) c.ghost -= dt;
    }
    this.cars = this.cars.filter(c => c.p > -10 && c.p < c.L.P.len + 10 && dist(c.x, c.y, fx, fy) < 480);
  },
  tick(dt, player) {
    this.t += dt; this.focus.x = player ? player.x : this.focus.x; this.focus.y = player ? player.y : this.focus.y;
    this.transitTick(dt); this.pedTick(dt, player); this.carTick(dt, player);
    for (const b of this.bubbles) { b.t -= dt; if (b.p) { b.x = b.p.x; b.y = b.p.y; } } this.bubbles = this.bubbles.filter(b => b.t > 0);
    for (const m of this.marks) m.t -= dt * .08; this.marks = this.marks.filter(m => m.t > 0); if (this.marks.length > 500) this.marks.splice(0, this.marks.length - 500);
    for (const p of this.parts) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; } this.parts = this.parts.filter(p => p.t > 0);
  },
  /* ---------- dibujo ---------- */
  shadowDir() { const s = SKY.at(Mundo.hour()).sun, el = Math.max(.2, s.el); return { dx: -Math.sin(s.az) * Math.min(3, 1 / Math.tan(el)), dy: Math.cos(s.az) * Math.min(3, 1 / Math.tan(el)), a: clamp(.18 + .25 * Math.sin(el), .08, .4) }; },
  landmarks(g, S, k, x0, y0, x1, y1) {
    for (const L of this.lm) {
      if (L.x + L.w < x0 || L.x - L.w > x1 || L.y + L.h < y0 || L.y - L.h > y1) continue; const p = S(L.x - L.w / 2, L.y - L.h / 2), w = L.w * k, h = L.h * k;
      const col = { iglesia: '#e9d9b7', terminal: '#c9ced4', volador: null, campus: '#d6e6d2', moravia: '#f2cfae', botanico: null, explora: '#EC343A', estadio: '#9aa0a6', botero: '#e9c9c9', coltejer: '#8d97a4', teatro: '#b9b5ad', lleras: null, pies: '#d9cdae', luces: '#d9cdae', depot: '#bfe1d9', cerro: null, mamm: '#b4583a', aeropuerto: '#9aa1a8', comuna13: null, bibespana: '#2b2b2b', palacio: '#f4ecd0', catedral: '#b4583a', parquenorte: null, deporte: '#cfe0ea', memoria: '#8d97a4', cruces: null }[L.k];
      if (VC.on) { if (L.k === 'aeropuerto') { g.fillStyle = '#3f444d'; g.fillRect(p.x + w * .38, p.y + h * .04, w * .24, h * .92); g.fillStyle = '#fff'; for (let yy = p.y + h * .08; yy < p.y + h * .9; yy += Math.max(6, k * 24)) g.fillRect(p.x + w * .49, yy, Math.max(1, k * .6), Math.max(3, k * 10)); } }   // con la ciudad vectorial los edificios y parques ya están dibujados: sin íconos planos
      else if (col) {   // sin rectángulos planos: el mapa ya trae lo real (datos oficiales); aquí va solo el ícono del lugar
        if (L.k === 'iglesia' || L.k === 'catedral') { const cx = p.x + w / 2, cy = p.y + h / 2, u = Math.min(w, h) * .32; g.fillStyle = 'rgba(20,20,20,.35)'; g.fillRect(cx - u * .45 + 2, cy - u * .2 + 3, u * .9, u * 1.1); g.fillStyle = col; g.fillRect(cx - u * .45, cy - u * .2, u * .9, u * 1.1); g.fillStyle = Art.shade(col, .8); g.fillRect(cx - u * .18, cy - u * .75, u * .36, u * .6); g.strokeStyle = PAL.negro; g.lineWidth = Math.max(1, k * .4); g.strokeRect(cx - u * .45, cy - u * .2, u * .9, u * 1.1); g.strokeRect(cx - u * .18, cy - u * .75, u * .36, u * .6); g.fillStyle = PAL.negro; g.fillRect(cx - Math.max(1, k * .3) / 2, cy - u * 1.05, Math.max(1, k * .3), u * .3); g.fillRect(cx - u * .1, cy - u * .95, u * .2, Math.max(1, k * .3)); }
        if (L.k === 'estadio') { g.fillStyle = '#59AB42'; g.beginPath(); g.ellipse(p.x + w / 2, p.y + h / 2, w * .3, h * .36, 0, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1; g.stroke(); }
        if (L.k === 'aeropuerto') { g.fillStyle = '#3f444d'; g.fillRect(p.x + w * .38, p.y + h * .04, w * .24, h * .92); g.fillStyle = '#fff'; for (let yy = p.y + h * .08; yy < p.y + h * .9; yy += Math.max(6, k * 24)) g.fillRect(p.x + w * .49, yy, Math.max(1, k * .6), Math.max(3, k * 10)); }
        if (L.k === 'campus' || L.k === 'deporte') { g.fillStyle = Art.shade(col, .85); for (let i = 0; i < 4; i++) g.fillRect(p.x + w * (.1 + (i % 2) * .5), p.y + h * (.1 + (i >> 1) * .5), w * .3, h * .3); }
        if (L.k === 'bibespana') { g.fillStyle = '#3a3a3a'; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(p.x + w * (.1 + i * .3), p.y + h * .9); g.lineTo(p.x + w * (.25 + i * .3), p.y + h * .15); g.lineTo(p.x + w * (.4 + i * .3), p.y + h * .9); g.fill(); } }
      } else if (!VC.on) { const n = Math.max(3, Math.round(w * h / Math.max(60, k * k * 400))); for (let i = 0; i < Math.min(n, 60); i++) { const tx = p.x + h2(i, 1, L.id.length) * w, ty = p.y + h2(i, 2, L.id.length) * h, r = (1.5 + h2(i, 3, 1) * 2) * k; g.fillStyle = 'rgba(18,38,22,.4)'; g.beginPath(); g.ellipse(tx + r * .4, ty + r * .5, r, r * .7, 0, 0, TAU); g.fill(); g.fillStyle = ['#3f7a3a', '#4b8640', '#2f6b3c'][i % 3]; g.beginPath(); g.arc(tx, ty, r, 0, TAU); g.fill(); } }
      if (k > .9) { g.font = '700 ' + Math.max(10, Math.min(16, k * 5)) + 'px Cuerpo, sans-serif'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(253,251,245,.9)'; g.strokeText(L.name, p.x + w / 2, p.y + h + 12); g.fillStyle = PAL.negro; g.fillText(L.name, p.x + w / 2, p.y + h + 12); g.textAlign = 'left'; }
    }
  },
  /* peatón visto desde arriba: sombra, cuerpo, cabeza, brazos al caminar, paraguas */
  ped(g, p, S, k, sh) {
    const q = S(p.x, p.y), s = Math.max(2, k * 1.6), sw = Math.sin(p.ph) * s * .8;
    if (p.dog) { const ds = s * .62; if (p.owner) { const o = S(p.owner.x, p.owner.y); g.strokeStyle = 'rgba(30,30,30,.75)'; g.lineWidth = Math.max(1, k * .12); g.beginPath(); g.moveTo(q.x, q.y); g.quadraticCurveTo((q.x + o.x) / 2, (q.y + o.y) / 2 + s * .4, o.x, o.y); g.stroke(); }
      g.fillStyle = 'rgba(0,0,0,' + sh.a + ')'; g.beginPath(); g.ellipse(q.x + sh.dx * ds, q.y + sh.dy * ds, ds * .9, ds * .5, p.a, 0, TAU); g.fill(); g.save(); g.translate(q.x, q.y); g.rotate(p.a); Spr.dog(g, ds, p); g.restore(); return; }
    g.fillStyle = 'rgba(0,0,0,' + sh.a + ')'; g.beginPath(); g.ellipse(q.x + sh.dx * s, q.y + sh.dy * s, s * 1.1, s * .7, 0, 0, TAU); g.fill();
    g.save(); g.translate(q.x, q.y); g.rotate(p.a); Spr.ped(g, s * .8, p); g.restore();
  },
  /* vehículo cenital con sombra, techo, ventanas, luces (faros de noche) */
  car(g, x, y, a, len, wid, col, kind, S, k, sh, night, lights, o) {
    const vs = k < 2.5 ? 1.25 : 1, q = S(x, y), L = Math.max(6, len * k * vs), W = Math.max(3.5, wid * k * vs);
    g.save(); g.translate(q.x + sh.dx * k * .8, q.y + sh.dy * k * .8); g.rotate(a); g.fillStyle = 'rgba(0,0,0,' + sh.a + ')'; g.fillRect(-L / 2, -W / 2, L, W); g.restore();
    g.save(); g.translate(q.x, q.y); g.rotate(a); Spr.veh(g, kind, L, W, col, Object.assign({ lights, night: night > .3, doors: kind === 'brt' ? 'left' : kind === 'feeder' || kind === 'bus' ? 'right' : null }, o || {})); g.restore();
    if (night > .3 && lights && kind !== 'cable') { g.save(); g.translate(q.x, q.y); g.rotate(a); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(L / 2, 0, L / 2 + 26 * k, 0); gr.addColorStop(0, 'rgba(255,240,180,' + (.45 * night) + ')'); gr.addColorStop(1, 'rgba(255,240,180,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(L / 2, -W / 2); g.lineTo(L / 2 + 26 * k, -W * 1.6); g.lineTo(L / 2 + 26 * k, W * 1.6); g.lineTo(L / 2, W / 2); g.fill(); g.restore(); }
  },
  transitDraw(g, S, k, sh, night, x0, y0, x1, y1) {
    for (const v of this.transit) {
      const p = this.tpos(v); if (p.x < x0 - 100 || p.x > x1 + 100 || p.y < y0 - 100 || p.y > y1 + 100) continue; const K = KIND[v.line.kind], kind = v.line.kind, col = v.line.color;
      if (kind === 'metro' || kind === 'tram') { const carL = kind === 'metro' ? 22 : 19.5, n = kind === 'metro' ? 3 : 2, T = kind === 'metro' && VC.on ? (x, y) => S(x, y - KIND.metro.deck * VC.ob) : S; for (let i = 0; i < n; i++) { const q = NET.at(v.line.P, v.s - v.dir * (i * (carL + 1) + carL / 2), v.dir * 2); this.car(g, q.x, q.y, q.a + (v.dir < 0 ? Math.PI : 0), carL, 3, col, kind, T, k, sh, night, true, { end: n === 1 ? 'both' : i === 0 ? 'front' : i === n - 1 ? 'back' : 'mid' }); } }
      else if (kind === 'cable') { const q = NET.at(v.line.P, v.s), T = VC.on ? (x, y) => S(x, y - 14 * VC.ob) : S; this.car(g, q.x, q.y, q.a, 2.6, 2.2, col, 'cable', T, k, sh, night, false); }
      else { const q = NET.at(v.line.P, v.s - v.dir * K.len / 2, v.dir * 2.2); this.car(g, q.x, q.y, q.a + (v.dir < 0 ? Math.PI : 0), K.len, 2.5, col, kind, S, k, sh, night, true); }
    }
  },
  /* luces de la ciudad de noche: postes en avenidas y plazas (aditivo) */
  streetLights(g, S, k, night, x0, y0, x1, y1, W, H) {
    if (night < .25) return; g.save(); g.globalCompositeOperation = 'lighter';
    const step = TM * 3, R = Math.max(8, 14 * k);
    if (VC.on) {   // postes a lo largo de las calles dibujadas: un halo cacheado por poste
      const HL = VC.halo(), CR = 320; g.globalAlpha = clamp(.5 * night, 0, .5);
      for (let cy = Math.floor((y0 - 20) / CR); cy <= Math.floor((y1 + 20) / CR); cy++) for (let cx = Math.floor((x0 - 20) / CR); cx <= Math.floor((x1 + 20) / CR); cx++) { const P = VC.postes(cx, cy); for (let i = 0; i < P.length; i += 2) { const q = S(P[i], P[i + 1]); if (q.x < -R || q.y < -R || q.x > W + R || q.y > H + R) continue; g.drawImage(HL, q.x - R, q.y - R, R * 2, R * 2); } }
      g.globalAlpha = 1;
    } else for (let y = Math.floor(y0 / step) * step; y < y1; y += step) for (let x = Math.floor(x0 / step) * step; x < x1; x += step) {
      const v = MAP.tileM(x + 10, y + 10); if (!(v === TT.AVE || v === TT.AUTO || v === TT.PLAZA || v === TT.STATION || (v === TT.ROAD && h2(x, y, 4) < .25))) continue; if (h2(x, y, 5) > .8) continue;
      const q = S(x + 10, y + 10); if (q.x < -R || q.y < -R || q.x > W + R || q.y > H + R) continue; const gr = g.createRadialGradient(q.x, q.y, 0, q.x, q.y, R); gr.addColorStop(0, 'rgba(255,214,140,' + (.45 * night) + ')'); gr.addColorStop(1, 'rgba(255,214,140,0)'); g.fillStyle = gr; g.fillRect(q.x - R, q.y - R, R * 2, R * 2);
    }
    for (const h of NET.stations) { const q = S(h.x, h.y); if (q.x < -60 || q.y < -60 || q.x > W + 60 || q.y > H + 60) continue; const r = Math.max(16, 40 * k), gr = g.createRadialGradient(q.x, q.y, 0, q.x, q.y, r); gr.addColorStop(0, 'rgba(200,230,255,' + (.35 * night) + ')'); gr.addColorStop(1, 'rgba(200,230,255,0)'); g.fillStyle = gr; g.fillRect(q.x - r, q.y - r, r * 2, r * 2); }
    g.restore();
  },
  /* franja que sigue la línea P entre s0 y s1, con desplazamientos laterales o0 y o1 (andenes y techos sobre la curva) */
  banda(g, S, P, s0, s1, o0, o1) { const n = Math.max(2, Math.ceil((s1 - s0) / 8)); g.beginPath(); for (let i = 0; i <= n; i++) { const q = NET.at(P, s0 + (s1 - s0) * i / n, o0), w = S(q.x, q.y); i ? g.lineTo(w.x, w.y) : g.moveTo(w.x, w.y); } for (let i = n; i >= 0; i--) { const q = NET.at(P, s0 + (s1 - s0) * i / n, o1), w = S(q.x, q.y); g.lineTo(w.x, w.y); } g.closePath(); },
  /* estaciones y paradas sobre el mapa */
  stations(g, S, k, x0, y0, x1, y1) {
    // tramos de la línea que tocan la vista (los segmentos rectos pueden medir cientos de metros: se mira el segmento, no el vértice)
    const vis = (l, pad) => { const P = l.P.pts, c = l.P.cum; let a = Infinity, b = -1; for (let i = 0; i < P.length - 1; i++) { const p = P[i], q = P[i + 1]; if (Math.max(p.x, q.x) < x0 - pad || Math.min(p.x, q.x) > x1 + pad || Math.max(p.y, q.y) < y0 - pad || Math.min(p.y, q.y) > y1 + pad) continue; if (c[i] < a) a = c[i]; if (c[i + 1] > b) b = c[i + 1]; } return b < 0 ? null : [a, b]; };
    const path = (l, pad, T = S) => { g.beginPath(); const P = l.P.pts; let last = -2; for (let i = 0; i < P.length - 1; i++) { const p = P[i], q = P[i + 1]; if (Math.max(p.x, q.x) < x0 - pad || Math.min(p.x, q.x) > x1 + pad || Math.max(p.y, q.y) < y0 - pad || Math.min(p.y, q.y) > y1 + pad) continue; if (last !== i - 1) { const w = T(p.x, p.y); g.moveTo(w.x, w.y); } const w = T(q.x, q.y); g.lineTo(w.x, w.y); last = i; } };
    const rieles = (l, R, offs, col, lw, T = S) => { const st = Math.max(3, 2.5 / k); g.strokeStyle = col; g.lineWidth = lw; for (const o of offs) { g.beginPath(); for (let s = R[0]; s <= R[1] + st; s += st) { const q0 = NET.at(l.P, Math.min(s, R[1]), o), q = T(q0.x, q0.y); s === R[0] ? g.moveTo(q.x, q.y) : g.lineTo(q.x, q.y); } g.stroke(); } };
    // el metro va elevado: tablero a 7 m (en la vista con volumen se dibuja corrido hacia arriba, con columnas y su sombra en el piso)
    const dz = VC.on ? KIND.metro.deck * VC.ob : 0, Se = (x, y) => S(x, y - dz), Sc = (x, y) => S(x, y - (KIND.metro.deck + 4.2) * VC.ob);
    g.lineJoin = 'round'; g.lineCap = 'butt';
    for (const l of NET.lines) {
      if (l.kind === 'future' || l.kind === 'cable') continue; const R = vis(l, 160); if (!R) continue;
      if (l.kind === 'metro') { // viaducto: columnas, sombra en el piso, tablero a su altura, durmientes y dos vías (cuatro rieles)
        if (dz) {
          // edificio de acceso de cada estación, abajo del viaducto: muros claros, techo y franja del color de la línea (asoma a los lados del tablero)
          for (const st of l.st) { if (st.x < x0 - 90 || st.x > x1 + 90 || st.y < y0 - 90 || st.y > y1 + 90) continue; const s0 = clamp(st.s - KIND.metro.plat / 2, 0, Math.max(0, l.P.len - KIND.metro.plat)), a0 = s0 + 22, a1 = s0 + KIND.metro.plat - 22, S5 = (x, y) => S(x, y - 5 * VC.ob);
            this.banda(g, S, l.P, a0, a1, -11, 11); g.fillStyle = 'rgba(0,0,0,.22)'; g.save(); g.translate(1.6 * k, 1 * k); g.fill(); g.restore(); g.fillStyle = '#cfc6b3'; g.fill();
            this.banda(g, S5, l.P, a0, a1, -11, 11); g.fillStyle = '#e6dfcf'; g.fill(); g.strokeStyle = 'rgba(40,36,30,.5)'; g.lineWidth = Math.max(1, .2 * k); g.stroke();
            for (const sd of [-1, 1]) { this.banda(g, S5, l.P, a0, a1, sd * 10, sd * 11); g.fillStyle = l.color; g.fill(); } }
          const paso = 30; g.lineCap = 'butt';
          for (let t = Math.ceil(R[0] / paso) * paso; t <= R[1]; t += paso) { const q0 = NET.at(l.P, t); if (q0.x < x0 - 30 || q0.x > x1 + 30 || q0.y < y0 - 30 || q0.y > y1 + 30) continue; const a = S(q0.x, q0.y), b = Se(q0.x, q0.y);
            g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 2.4 * k; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(a.x + 2.2 * k, a.y + 1.4 * k); g.stroke();
            g.strokeStyle = '#857f75'; g.lineWidth = 2.4 * k; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.strokeStyle = '#aaa398'; g.lineWidth = .8 * k; g.beginPath(); g.moveTo(a.x - .6 * k, a.y); g.lineTo(b.x - .6 * k, b.y); g.stroke(); }
          path(l, 160); g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 9.6 * k; g.save(); g.translate(2.2 * k, 1.4 * k); g.stroke(); g.restore();
        } else { path(l, 160); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 10.5 * k; g.save(); g.translate(1.5 * k, 2.5 * k); g.stroke(); g.restore(); }
        path(l, 160, Se); g.strokeStyle = '#4f4b45'; g.lineWidth = 10 * k; g.stroke(); g.strokeStyle = '#9a9185'; g.lineWidth = 8.6 * k; g.stroke();
        if (dz) { g.strokeStyle = 'rgba(60,56,50,.55)'; g.lineWidth = 1.1 * k; g.save(); g.translate(0, 5 * k); g.stroke(); g.restore(); }   // canto del tablero
        if (k > .5) { g.strokeStyle = '#7d756a'; g.lineWidth = 2.6 * k; g.setLineDash([.35 * k, .55 * k]); for (const o of [-2, 2]) { g.beginPath(); for (let s = R[0]; s <= R[1] + 3; s += Math.max(3, 2.5 / k)) { const q0 = NET.at(l.P, Math.min(s, R[1]), o), q = Se(q0.x, q0.y); s === R[0] ? g.moveTo(q.x, q.y) : g.lineTo(q.x, q.y); } g.stroke(); } g.setLineDash([]); }
        rieles(l, R, [-2.72, -1.28, 1.28, 2.72], '#2b2a28', Math.max(.8, .22 * k), Se);
      } else if (l.kind === 'tram') { path(l, 160); g.strokeStyle = 'rgba(30,30,30,.45)'; g.lineWidth = 6.4 * k; g.stroke(); g.strokeStyle = '#6a6e74'; g.lineWidth = 6 * k; g.stroke(); rieles(l, R, [-1.9, -.5, .5, 1.9], '#2e3034', Math.max(.8, .2 * k)); g.strokeStyle = '#c9c9c4'; g.lineWidth = Math.max(.8, .22 * k); path(l, 160); g.stroke(); }
      else { path(l, 160); g.strokeStyle = l.color + (l.kind === 'brt' ? '70' : '45'); g.lineWidth = (l.kind === 'brt' ? 3.4 : 2.6) * k; g.stroke(); }
      // andenes: siguen la curva de su línea entre s − largo/2 y s + largo/2 (el tren se detiene dentro y los rieles salen por los extremos)
      for (const s of l.st) {
        if (s.x < x0 - 90 || s.x > x1 + 90 || s.y < y0 - 90 || s.y > y1 + 90) continue; const K = KIND[l.kind], s0 = clamp(s.s - K.plat / 2, 0, Math.max(0, l.P.len - K.plat)), s1 = Math.min(l.P.len, s0 + K.plat);   // en las terminales el andén entero queda hacia adentro
        if (l.kind === 'metro') {
          for (const sd of [-1, 1]) {   // dos andenes laterales: piso, línea amarilla junto a la vía y franja del color de la línea
            this.banda(g, Se, l.P, s0, s1, sd * 4.1, sd * 8.6); g.fillStyle = 'rgba(0,0,0,.28)'; g.save(); g.translate(1.5 * k, 2.5 * k); g.fill(); g.restore(); g.fillStyle = '#ece6d6'; g.fill(); g.strokeStyle = 'rgba(40,36,30,.55)'; g.lineWidth = Math.max(1, .25 * k); g.stroke();
            this.banda(g, Se, l.P, s0, s1, sd * 4.1, sd * 4.55); g.fillStyle = '#f2c400'; g.fill();
            if (dz) {   // cubierta metálica sobre el andén (a 4 m), con su sombra, nervios y el borde del color de la línea
              this.banda(g, Se, l.P, s0 + 6, s1 - 6, sd * 4.6, sd * 8.6); g.fillStyle = 'rgba(30,30,30,.16)'; g.fill();
              this.banda(g, Sc, l.P, s0 + 6, s1 - 6, sd * 5.0, sd * 9.0); g.fillStyle = '#dde1e4'; g.fill(); g.strokeStyle = 'rgba(60,66,74,.6)'; g.lineWidth = Math.max(1, .2 * k); g.stroke();
              this.banda(g, Sc, l.P, s0 + 6, s1 - 6, sd * 8.3, sd * 9.0); g.fillStyle = l.color; g.fill();
              if (k > .6) { g.strokeStyle = 'rgba(120,126,134,.55)'; g.lineWidth = Math.max(1, .16 * k); g.beginPath(); for (let t = s0 + 10; t < s1 - 8; t += 6) { const A = NET.at(l.P, t, sd * 5.0), B2 = NET.at(l.P, t, sd * 8.3), qa = Sc(A.x, A.y), qb = Sc(B2.x, B2.y); g.moveTo(qa.x, qa.y); g.lineTo(qb.x, qb.y); } g.stroke(); }
            } else {
              this.banda(g, S, l.P, s0 + 6, s1 - 6, sd * 5.6, sd * 8.6); g.fillStyle = '#d4d0c6'; g.fill();
              this.banda(g, S, l.P, s0 + 6, s1 - 6, sd * 7.8, sd * 8.6); g.fillStyle = l.color; g.fill();
            }
          }
        } else if (l.kind === 'tram' || l.kind === 'brt') {
          const o = l.kind === 'tram' ? 3.3 : 1.9, w = l.kind === 'tram' ? 2.8 : 3.2;
          for (const sd of l.kind === 'tram' ? [-1, 1] : [-1]) { this.banda(g, S, l.P, s0, s1, sd * o, sd * (o + w)); g.fillStyle = 'rgba(0,0,0,.22)'; g.save(); g.translate(k, 1.6 * k); g.fill(); g.restore(); g.fillStyle = '#ece6d6'; g.fill(); g.strokeStyle = 'rgba(40,36,30,.5)'; g.lineWidth = Math.max(1, .2 * k); g.stroke(); this.banda(g, S, l.P, s0 + 3, s1 - 3, sd * (o + w * .45), sd * (o + w)); g.fillStyle = l.color; g.fill(); }
        } else { const q = S(s.x, s.y); g.fillStyle = l.color; g.strokeStyle = PAL.negro; g.lineWidth = 1.5; g.beginPath(); g.arc(q.x, q.y, Math.max(3, 2.2 * k), 0, TAU); g.fill(); g.stroke(); }
      }
    }
    // metrocables: cable doble, torres cada ~260 m y estaciones
    for (const l of NET.lines) { if (l.kind !== 'cable') continue; const zc = VC.on ? 14 * VC.ob : 0, Sk = (x, y) => S(x, y - zc);
      for (let i = 0; i < l.st.length - 1; i++) { const a = l.st[i], b = l.st[i + 1]; if (Math.max(a.x, b.x) < x0 - 100 || Math.min(a.x, b.x) > x1 + 100 || Math.max(a.y, b.y) < y0 - 100 || Math.min(a.y, b.y) > y1 + 100) continue;
        const qa = Sk(a.x, a.y), qb = Sk(b.x, b.y), L = dist(a.x, a.y, b.x, b.y), nt = Math.max(0, Math.round(L / 260) - 1), ang = Math.atan2(b.y - a.y, b.x - a.x), ox = -Math.sin(ang) * 1.5 * k, oy = Math.cos(ang) * 1.5 * k;
        for (let t = 1; t <= nt; t++) { const f = t / (nt + 1), tx = lerp(a.x, b.x, f), ty = lerp(a.y, b.y, f), q = S(tx, ty), qt = Sk(tx, ty);   // torres: poste del piso al cable, con su brazo
          if (zc) { g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q.x + 4.5 * k, q.y + 2.8 * k); g.stroke(); g.strokeStyle = '#7c8188'; g.lineWidth = 1.6 * k; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(qt.x, qt.y); g.stroke(); g.strokeStyle = '#5b5f66'; g.lineWidth = Math.max(1, .5 * k); g.beginPath(); g.moveTo(qt.x - ox * 1.3, qt.y - oy * 1.3); g.lineTo(qt.x + ox * 1.3, qt.y + oy * 1.3); g.stroke(); }
          else { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(q.x - 1.5 * k + 2 * k, q.y - 1.5 * k + 3 * k, 3 * k, 3 * k); g.fillStyle = '#8f949a'; g.fillRect(q.x - 1.5 * k, q.y - 1.5 * k, 3 * k, 3 * k); g.strokeStyle = PAL.negro; g.lineWidth = 1; g.strokeRect(q.x - 1.5 * k, q.y - 1.5 * k, 3 * k, 3 * k); } }
        if (zc) { g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = Math.max(1, .3 * k); g.beginPath(); const sa = S(a.x, a.y), sb = S(b.x, b.y); g.moveTo(sa.x + 4.5 * k, sa.y + 2.8 * k); g.lineTo(sb.x + 4.5 * k, sb.y + 2.8 * k); g.stroke(); }   // sombra del cable
        g.strokeStyle = 'rgba(20,20,20,.8)'; g.lineWidth = Math.max(1, .3 * k); g.beginPath(); g.moveTo(qa.x + ox, qa.y + oy); g.lineTo(qb.x + ox, qb.y + oy); g.moveTo(qa.x - ox, qa.y - oy); g.lineTo(qb.x - ox, qb.y - oy); g.stroke(); }
      for (const s of l.st) { if (s.x < x0 - 60 || s.x > x1 + 60 || s.y < y0 - 60 || s.y > y1 + 60) continue; const q = S(s.x, s.y), a = NET.dirAt(l.P, s.s, 40), up = 7 * k * .45;   // estación girada con su cable: base, volumen y techo
        g.save(); g.translate(q.x, q.y); g.rotate(a); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-14 * k + 2.5 * k, -9 * k + 3.5 * k, 28 * k, 18 * k); g.fillStyle = '#b9b2a4'; g.fillRect(-14 * k, -9 * k, 28 * k, 18 * k); g.restore();
        g.save(); g.translate(q.x, q.y - up); g.rotate(a); g.fillStyle = '#e4ddcc'; g.fillRect(-14 * k, -9 * k, 28 * k, 18 * k); g.fillStyle = '#5b5f66'; g.fillRect(-9 * k, -2.2 * k, 18 * k, 4.4 * k); g.fillStyle = l.color; g.fillRect(-14 * k, -9 * k, 28 * k, 2 * k); g.fillRect(-14 * k, 7 * k, 28 * k, 2 * k); g.strokeStyle = PAL.negro; g.lineWidth = 1.5; g.strokeRect(-14 * k, -9 * k, 28 * k, 18 * k); g.restore(); } }
    g.setLineDash([]);
    for (const h of NET.stations) { if (h.x < x0 || h.x > x1 || h.y < y0 || h.y > y1 || !h.lines.some(l => l.kind !== 'future')) continue; const q = S(h.x, h.y), big = h.lines.some(l => l.kind === 'metro' || l.kind === 'tram' || l.kind === 'cable'); if (!big && k < 1.4) continue; g.fillStyle = '#fff'; g.strokeStyle = PAL.negro; g.lineWidth = 2; g.beginPath(); g.arc(q.x, q.y, big ? Math.max(5, 3 * k) : 3, 0, TAU); g.fill(); g.stroke(); if (k > .7 || big) { g.font = '700 ' + Math.max(10, Math.min(15, k * 5)) + 'px Cuerpo, sans-serif'; g.lineWidth = 3; g.strokeStyle = 'rgba(253,251,245,.92)'; g.strokeText(h.name, q.x + 7, q.y - 6); g.fillStyle = PAL.negro; g.fillText(h.name, q.x + 7, q.y - 6); } }
  },
  bubblesDraw(g, S, k) { for (const b of this.bubbles) { const q = S(b.x, b.y); g.font = '700 11px Cuerpo, sans-serif'; const w = g.measureText(b.txt).width + 10; g.globalAlpha = clamp(b.t, 0, 1); g.fillStyle = '#fff'; g.strokeStyle = PAL.negro; g.lineWidth = 1.5; g.fillRect(q.x - w / 2, q.y - 26 - 8 * k, w, 16); g.strokeRect(q.x - w / 2, q.y - 26 - 8 * k, w, 16); g.fillStyle = PAL.negro; g.textAlign = 'center'; g.fillText(b.txt, q.x, q.y - 14 - 8 * k); g.textAlign = 'left'; g.globalAlpha = 1; } },
  marksDraw(g, S, k) { g.lineCap = 'round'; for (const m of this.marks) { const a = S(m.x1, m.y1), b = S(m.x2, m.y2); g.strokeStyle = 'rgba(20,20,20,' + (.35 * clamp(m.t, 0, 1)) + ')'; g.lineWidth = Math.max(1, .3 * k); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); } },
  partsDraw(g, S, k) { for (const p of this.parts) { const q = S(p.x, p.y); g.fillStyle = p.c; g.globalAlpha = clamp(p.t / p.t0, 0, 1) * .8; g.fillRect(q.x - p.r * k, q.y - p.r * k, p.r * 2 * k, p.r * 2 * k); } g.globalAlpha = 1; }
};
