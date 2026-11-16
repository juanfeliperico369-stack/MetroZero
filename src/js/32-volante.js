/* =====================================================================
   AL VOLANTE: maneja el bus de Metroplús o el alimentador por las calles reales.
   Física de bicicleta (dirección) + remolque articulado, pendientes reales del valle,
   tráfico en carriles reales con semáforos (ciclo de 32 s), paradas con pasajeros,
   GPS sobre la ruta y asistente de carril (para jugar en familia).
   ===================================================================== */
const BUSES = {
  brt: { name: 'Articulado Metroplús', len1: 11.2, len2: 6.8, w: 2.55, wb: 5.7, hitch: 1.7, wb2: 5.3, vmax: 60 / 3.6, acc: 1.0, brk: 2.6, emg: 5.5, smax: .62, srate: 1.15 },
  feeder: { name: 'Bus alimentador', len1: 12, len2: 0, w: 2.5, wb: 6.1, hitch: 0, wb2: 0, vmax: 50 / 3.6, acc: 1.2, brk: 3, emg: 6, smax: .6, srate: 1.25 }
};
const DRIVE_OK = new Set([TT.ROAD, TT.AVE, TT.AUTO, TT.BRIDGE, TT.DEPOT, TT.STATION]), SOLIDB = new Set([TT.MOUNT, TT.BRICK, TT.BLDG, TT.WATER, TT.CANAL, TT.LAND]);
/* carriles de carros y semáforos reales (OSM) en metros */
const TRAF = {
  lanes: null, grid: null, lights: null,
  build() {
    if (this.lanes) return; this.lanes = []; this.grid = new Map(); this.lights = VM.lights.map(([a, b], i) => ({ i, x: a * TM / 4, y: b * TM / 4, off: h2(a, b, 7) * 32 }));
    const SPD = { t: 50 / 3.6, p: 40 / 3.6, s: 30 / 3.6 };
    for (const l of VM.lanes) {
      const pts = []; for (let i = 0; i < l.p.length; i += 2) pts.push({ x: l.p[i] * TM / 4, y: l.p[i + 1] * TM / 4 }); const P = NET.poly(pts); if (P.len < 40) continue;
      const dirs = l.o ? [1] : [1, -1];
      for (const d of dirs) { const L = { P, d, off: l.o ? 0 : 1.9 * d, spd: SPD[l.c] || 30 / 3.6, name: l.n, lights: [] }; this.lanes.push(L); const seen = new Set(); for (const p of pts) { const k = Math.floor(p.x / 400) + ',' + Math.floor(p.y / 400); if (seen.has(k)) continue; seen.add(k); (this.grid.get(k) || this.grid.set(k, []).get(k)).push(L); } }
    }
    // semáforos sobre cada carril (posición a lo largo y eje)
    const lg = new Map(); for (const g of this.lights) { const k = Math.floor(g.x / 400) + ',' + Math.floor(g.y / 400); (lg.get(k) || lg.set(k, []).get(k)).push(g); }
    for (const L of this.lanes) { const cand = new Set(); for (const p of L.P.pts) { const a = lg.get(Math.floor(p.x / 400) + ',' + Math.floor(p.y / 400)); if (a) a.forEach(g => cand.add(g)); } for (const g of cand) { const pr = NET.project(L.P, g.x, g.y); if (pr.d < 16) { const q = NET.at(L.P, pr.s); L.lights.push({ s: pr.s, g, ax: Math.abs(Math.cos(q.a)) > Math.abs(Math.sin(q.a)) ? 0 : 1 }); } } L.lights.sort((a, b) => a.s - b.s); }
  },
  near(x, y) { const r = []; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const a = this.grid.get((Math.floor(x / 400) + i) + ',' + (Math.floor(y / 400) + j)); if (a) r.push(...a); } return r; },
  /* ciclo de 32 s: [este‑oeste, norte‑sur]  g verde · y amarillo · r rojo */
  state(g, t) { const p = ((t + g.off) % 32 + 32) % 32; return p < 13 ? 'gr' : p < 16 ? 'yr' : p < 29 ? 'rg' : 'ry'; }
};
const Volante = EM.modes.volante = {
  id: 'volante', name: 'Al volante', sub: 'Metroplús y alimentadores', music: 'conduce', fullCanvas: true,
  tip: 'Palanca: acelerar/frenar. Con el asistente de carril el bus gira solo; apágalo para manejar con el timón (×1,25 puntos). Para en cada parada, abre puertas y respeta los semáforos.',
  levels() {
    if (this._lv) return this._lv; const L = [];
    for (const line of NET.lines.filter(l => l.kind === 'brt' || l.kind === 'feeder')) {
      const n = line.st.length;
      if (line.kind === 'brt') { for (let a = 0; a < n - 1; a += 4) { const b = Math.min(n - 1, a + 4); L.push({ id: 'vo:' + line.id + ':' + a + '-' + b, line: line.id, a, b, name: line.st[a].name + ' → ' + line.st[b].name, sub: line.name }); } L.push({ id: 'vo:' + line.id + ':0-' + (n - 1), line: line.id, a: 0, b: n - 1, name: 'Recorrido completo', sub: line.name, full: true }); }
      else L.push({ id: 'vo:' + line.id + ':0-' + (n - 1), line: line.id, a: 0, b: n - 1, name: line.name.replace(/^Alimentador\s*/, ''), sub: 'Alimentador · ' + n + ' paradas' });
    }
    return (this._lv = L);
  },
  route(line) {
    if (line._vr) return line._vr; const P = line.P, n = Math.ceil(P.len / 8) + 1, lim = new Float32Array(n), an = new Float32Array(n);
    for (let i = 0; i < n; i++) an[i] = NET.at(P, i * 8).a;
    for (let i = 0; i < n; i++) { let da = 0; for (let j = Math.max(0, i - 3); j < Math.min(n - 1, i + 3); j++) { let d = an[j + 1] - an[j]; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; da += Math.abs(d); } const R = da > 1e-3 ? 48 / da : 1e5; lim[i] = clamp(Math.sqrt(1.7 * R), 4, 99); }
    return (line._vr = { lim, n });
  },
  create(lv, opts) {
    TRAF.build(); const L = this.levels().find(l => l.id === lv) || this.levels()[0], line = NET.byId[L.line], B = BUSES[line.kind === 'brt' ? 'brt' : 'feeder'], rng = new RNG(opts.seed | 0);
    const stops = []; for (let i = L.a; i <= L.b; i++) stops.push(i);
    const p0 = NET.at(line.P, line.st[L.a].s), hr = new Date().getHours() + new Date().getMinutes() / 60;
    const st = { lvId: L.id, line: line.id, kind: line.kind === 'brt' ? 'brt' : 'feeder', stops, ni: 1, x: p0.x - Math.cos(p0.a) * 4, y: p0.y - Math.sin(p0.a) * 4, h: p0.a, h2: p0.a, v: 0, steer: 0, sin: 0, lev: 0, rev: false, revT: 0,
      sR: line.st[L.a].s, off: 0, t: 0, hour: opts.hour != null ? opts.hour : hr, fixH: opts.hour, paseo: !!opts.paseo, tilt: false, rain: opts.hour != null ? rng.f() < .3 : Mundo.weather().rain, assist: opts.assist != null ? opts.assist : true, auto: !!opts.auto, view: opts.view || 'tps',
      ph: 'ready', doors: 0, board: 0, dwell: 0, pax: 10 + rng.i(0, 20), score: 0, comfort: 100, damage: 0, crashes: 0, reds: 0, offT: 0, arr: [], sched: [0], cars: [], spawnT: 0, redSeen: {}, fx: [], keys: {}, seed: opts.seed | 0, done: false, lastA: 0, shake: 0, stopTgt: [] };
    st.stopTgt = stops.map(i => line.st[i].s);
    let acc = 0; for (let k = 1; k < stops.length; k++) { const d = st.stopTgt[k] - st.stopTgt[k - 1]; acc += d / (line.kind === 'brt' ? 6.2 : 5.2) + (k > 1 ? 14 : 0); st.sched.push(acc); }
    return st;
  },
  elev(x, y) { return MAP.ready ? MAP.elevM(x, y) : 1500; },
  /* piloto: velocidad objetivo por curvas, parada, semáforos y carro de adelante */
  pilot(st, line, B) {
    const R = this.route(line), i = clamp(Math.round(st.sR / 8), 0, R.n - 1), j = clamp(Math.round((st.sR + 20 + st.v * 2) / 8), 0, R.n - 1);
    let tgt = Math.min(B.vmax * .92, R.lim[i], R.lim[j]); const dS = st.stopTgt[st.ni] - st.sR, bm = B.brk * (st.rain ? .75 : 1) * .7;
    tgt = Math.min(tgt, Math.sqrt(2 * bm * Math.max(0, dS - 1)));
    const red = this.redAhead(st); if (red != null) tgt = Math.min(tgt, Math.sqrt(2 * bm * Math.max(0, red - 6)));
    const car = this.carAhead(st); if (car != null) tgt = Math.min(tgt, Math.max(0, (car - 9) * .9));
    if (dS < 12) { if (dS < .4) return -1; const need = st.v * st.v / (2 * Math.max(.3, dS)); if (need > bm * .5) return -clamp(need / (B.brk * .8), 0, 1); return st.v < 2 ? .35 : 0; }
    const e = tgt - st.v; return e > .6 ? clamp(e / 3, .25, 1) : e < -.4 ? clamp(e / 3, -1, -.15) : 0;
  },
  redAhead(st) {
    let best = null; for (const g of this._lightsNear(st)) { const dx = g.x - st.x, dy = g.y - st.y, along = dx * Math.cos(st.h) + dy * Math.sin(st.h), lat = Math.abs(-dx * Math.sin(st.h) + dy * Math.cos(st.h)); if (along < 4 || along > 60 || lat > 12) continue; const ax = Math.abs(Math.cos(st.h)) > Math.abs(Math.sin(st.h)) ? 0 : 1, s = TRAF.state(g, st.t)[ax]; if (s !== 'g' && (best == null || along < best)) best = along; } return best;
  },
  carAhead(st) { let best = null; for (const c of st.cars) { const dx = c.x - st.x, dy = c.y - st.y, along = dx * Math.cos(st.h) + dy * Math.sin(st.h), lat = Math.abs(-dx * Math.sin(st.h) + dy * Math.cos(st.h)); if (along > 0 && along < 40 && lat < 3) best = best == null ? along : Math.min(best, along); } return best; },
  _lightsNear(st) { if (!st._lt || st.t - st._ltT > 1) { st._lt = TRAF.lights.filter(g => Math.abs(g.x - st.x) < 120 && Math.abs(g.y - st.y) < 120); st._ltT = st.t; } return st._lt; },
  pts(st, B) { // puntos del eje del bus: frente, eje delantero, eje trasero, cola (y remolque)
    const c = Math.cos(st.h), s = Math.sin(st.h), fx = st.x + c * (B.wb + 2.2), fy = st.y + s * (B.wb + 2.2), out = [[fx, fy], [st.x + c * B.wb * .5, st.y + s * B.wb * .5], [st.x - c * 2.5, st.y - s * 2.5]];
    if (B.len2) { const hx = st.x - c * B.hitch, hy = st.y - s * B.hitch, c2 = Math.cos(st.h2), s2 = Math.sin(st.h2); out.push([hx - c2 * B.len2 * .5, hy - s2 * B.len2 * .5], [hx - c2 * (B.len2 - .5), hy - s2 * (B.len2 - .5)]); }
    return out;
  },
  step(st, dt) { if (st.done) return; const n = dt > .04 ? 2 : 1; for (let i = 0; i < n; i++) this.tick(st, dt / n); },
  tick(st, dt) {
    const line = NET.byId[st.line], B = BUSES[st.kind]; st.t += dt; st.hourNow = st.fixH != null ? st.fixH + st.t * 6 / 3600 : Mundo.hour(); if (st.fixH == null && (st._wt = (st._wt || 0) + dt) > 2) { st._wt = 0; st.rain = Mundo.weather().rain; }
    if (st.auto && (st.ph === 'run' || st.ph === 'ready')) st.lev = this.pilot(st, line, B);
    else if (!st.auto) { if (st.keys.up || st.keys.down) st.lev = clamp(st.lev + (st.keys.up ? 1 : -1) * dt * 2.6, -1, 1); else st.lev *= Math.pow(.0004, dt); }
    if (st.keys.left || st.keys.right) st.sin = clamp(st.sin + (st.keys.right ? 1 : -1) * dt * 2.2, -1, 1); else if (st.keys._kb) st.sin *= Math.pow(.02, dt);
    if (st.ph === 'ready') { if (st.lev > .05) { st.ph = 'run'; this.say(st, 'Próxima parada: ' + line.st[st.stops[1]].name); } else return; }
    if (st.ph === 'dwell') { this.dwellTick(st, dt, line); return; }
    // dirección: asistente (persecución pura) o timón
    let want;
    if (st.assist || st.auto) { const Ld = 7 + st.v * .9, q = NET.at(line.P, Math.min(line.P.len, st.sR + Ld)), dx = q.x - st.x, dy = q.y - st.y, al = Math.atan2(dy, dx) - st.h, a = Math.atan2(Math.sin(al), Math.cos(al)); want = Math.atan(2 * B.wb * Math.sin(a) / Math.max(4, Math.hypot(dx, dy))); }
    else want = st.sin * B.smax;
    want = clamp(want, -B.smax, B.smax); st.steer += clamp(want - st.steer, -B.srate * dt, B.srate * dt);
    // tracción, freno, pendiente real y reversa
    const c = Math.cos(st.h), s = Math.sin(st.h), gr = clamp((this.elev(st.x + c * 6, st.y + s * 6) - this.elev(st.x - c * 6, st.y - s * 6)) / 12, -.25, .25), wet = st.rain ? .75 : 1;
    if (!st.rev && st.v <= .05 && st.lev < -.5) { st.revT += dt; if (st.revT > .8) { st.rev = true; Snd.play && this.sfx(st, 'beep'); } } else if (st.lev >= 0) st.revT = 0;
    let a;
    if (st.rev) { a = st.lev < 0 ? -st.lev * .8 : -st.lev * B.brk; if (st.lev > .05 && st.v >= -.05) { st.rev = false; st.v = 0; } }
    else { const tr = st.lev > 0 ? st.lev * B.acc * clamp(2.6 - 2.2 * st.v / B.vmax, .4, 2.6) : 0, br = st.lev < 0 ? -st.lev * B.brk * wet : 0; a = tr - br - 9.81 * gr * .95 - .02 - .0004 * st.v * st.v; if (st.v <= .02 && a < 0 && st.lev <= 0) a = 0; }
    if (st.rev) { st.v = clamp(st.v - a * dt, -2.5, 0); if (st.lev >= 0 && st.v > -.05) st.v = 0; } else st.v = Math.max(0, st.v + a * dt);
    // movimiento (modelo de bicicleta) + remolque
    const ox = st.x, oy = st.y, oh = st.h, oh2 = st.h2;
    st.h += st.v / B.wb * Math.tan(st.steer) * dt; st.x += st.v * Math.cos(st.h) * dt; st.y += st.v * Math.sin(st.h) * dt;
    if (B.len2) { let d = st.h - st.h2; d = Math.atan2(Math.sin(d), Math.cos(d)); st.h2 += st.v / B.wb2 * Math.sin(d) * dt; d = st.h - st.h2; d = Math.atan2(Math.sin(d), Math.cos(d)); if (Math.abs(d) > 1) st.h2 = st.h - Math.sign(d) * 1; }
    // choques con edificios, montaña y agua (por el eje del bus)
    let hit = false, soft = 0; if (MAP.ready) for (const [px, py] of this.pts(st, B)) { const v = MAP.tileM(px, py); if (SOLIDB.has(v)) hit = true; else if (!DRIVE_OK.has(v)) soft++; }
    if (hit) { st.x = ox; st.y = oy; st.h = oh; st.h2 = oh2; const imp = Math.abs(st.v); if (imp > 1.5) { st.damage += imp * 2; st.score -= Math.round(20 * imp); st.crashes++; st.comfort = Math.max(0, st.comfort - imp * 3); st.shake = .4; this.sfx(st, 'crash'); this.msg(st, '¡Golpe! −' + Math.round(20 * imp), 'r'); vib(120); } st.v = -st.v * .2; }
    // ruta: proyección local sobre la polilínea
    const pr = this.projLocal(line.P, st.x, st.y, st.sR); st.sR = pr.s; st.off = pr.d;
    if (soft && st.off > 14 && st.v > 1) { st.offT += dt; st.score -= 6 * dt; if (!st._offMsg) { st._offMsg = 1; this.msg(st, '¡Por el andén no! Vuelve a la calle', 'y'); } } else st._offMsg = 0;
    if (soft && st.off > 14) st.v = Math.min(st.v, 4);
    if (st.off > 70 && !st._lost) { st._lost = 1; this.msg(st, 'Te saliste de la ruta: sigue la flecha', 'y'); } else if (st.off < 30) st._lost = 0;
    // confort: aceleración longitudinal y lateral (v²·curvatura)
    const lat = st.v * st.v * Math.abs(Math.tan(st.steer)) / B.wb, jerk = Math.abs(a - st.lastA) / dt; st.lastA = a;
    if ((lat > 2.2 || jerk > 4) && st.v > 1) st.comfort = Math.max(0, st.comfort - dt * (lat > 2.2 ? (lat - 2.2) * 14 : 10));
    // semáforos en rojo
    for (const g of this._lightsNear(st)) { if (st.redSeen[g.i]) continue; const d = dist(g.x, g.y, st.x + c * B.wb, st.y + s * B.wb); if (d < 7 && st.v > 2) { const ax = Math.abs(c) > Math.abs(s) ? 0 : 1, ls = TRAF.state(g, st.t)[ax]; st.redSeen[g.i] = 1; if (ls === 'r') { st.reds++; st.score -= 120; this.msg(st, '¡Semáforo en rojo! −120', 'r'); this.sfx(st, 'bad'); } } }
    this.trafficTick(st, dt, B);
    // llegada a la parada
    const dS = st.stopTgt[st.ni] - st.sR;
    if (Math.abs(st.v) < .3 && Math.abs(dS) <= 15 && st.off < 14 && st.lev <= 0) {
      st.ph = 'dwell'; st.dwell = 0; st.doors = 0; st.v = 0; const err = Math.abs(dS), late = st.t - st.sched[st.ni];
      const pP = err < 1 ? 300 : err < 3 ? 220 : err < 6 ? 140 : err < 10 ? 70 : 25, pT = Math.abs(late) <= 10 ? 200 : Math.abs(late) <= 25 ? 120 : Math.abs(late) <= 45 ? 50 : 0;
      st.score += pP + pT; st.arr.push({ err, late }); this.sfx(st, pP >= 220 ? 'star' : 'ok'); this.msg(st, err.toFixed(1) + ' m · ' + (late >= 0 ? '+' : '') + Math.round(late) + ' s', pP >= 220 ? 'g' : 'y');
    } else if (dS < -40 && st.ni < st.stops.length) { st.score -= 200; st.arr.push({ err: 99, late: 0 }); this.msg(st, 'Te pasaste la parada ' + line.st[st.stops[st.ni]].name + ' −200', 'r'); this.sfx(st, 'bad'); if (st.ni < st.stops.length - 1) st.ni++; else this.finish(st); }
    if (st.shake > 0) st.shake -= dt;
  },
  projLocal(P, x, y, s0) {
    let bd = 1e18, bs = s0; const a = Math.max(0, s0 - 120), b = Math.min(P.len, s0 + 220);
    let lo = 0, hi = P.cum.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (P.cum[m] <= a) lo = m; else hi = m; }
    for (let i = lo; i < P.pts.length - 1 && P.cum[i] <= b; i++) { const p = P.pts[i], q = P.pts[i + 1], dx = q.x - p.x, dy = q.y - p.y, L2 = dx * dx + dy * dy || 1, t = clamp(((x - p.x) * dx + (y - p.y) * dy) / L2, 0, 1), px = p.x + dx * t, py = p.y + dy * t, d = (x - px) ** 2 + (y - py) ** 2; if (d < bd) { bd = d; bs = P.cum[i] + Math.sqrt(L2) * t; } }
    return { s: bs, d: Math.sqrt(bd) };
  },
  dwellTick(st, dt, line) {
    st.dwell += dt; st.v = 0;
    if (st.doors === 1) { st.board = Math.min(1, st.board + dt / st.bTime); if (st.board >= 1 && !st.bell) { st.bell = 1; this.sfx(st, 'bell'); this.msg(st, 'Todos arriba · cierra puertas', 'y'); } }
    if (st.auto) { if (st.doors === 0 && st.dwell > .4) this.doors(st); else if (st.doors === 1 && st.board >= 1) this.doors(st); else if (st.doors === 2) st.lev = .6; }
    if (st.doors === 2 && st.lev > .05) { st.ph = 'run'; st.doors = 0; st.bell = 0; if (st.ni < st.stops.length) this.say(st, 'Próxima parada: ' + line.st[st.stops[st.ni]].name); }
  },
  doors(st) {
    if (st.ph !== 'dwell') return; const line = NET.byId[st.line], last = st.ni === st.stops.length - 1;
    if (st.doors === 0) { st.doors = 1; this.sfx(st, 'door'); const name = line.st[st.stops[st.ni]].name, al = last ? st.pax : Math.round(st.pax * .35), bo = last ? 0 : 4 + hashStr(name) % 18; st.pax += bo - al; st.bTime = 3 + (al + bo) / 6; st.board = 0; Save.d.stats.pax += bo; const f = NET.fact(name); if (f) { this.msg(st, name + ': ' + f, 'b'); Save.d.facts[name] = 1; } }
    else if (st.doors === 1) { if (st.board < 1) { st.score -= 40; this.msg(st, 'Cerraste con gente subiendo −40', 'r'); } st.doors = 2; this.sfx(st, 'door'); if (last) { this.finish(st); return; } st.ni++; }
  },
  /* tráfico: carros en carriles reales alrededor del bus */
  trafficTick(st, dt, B) {
    const want = Save.d.settings.q === 'low' ? 9 : 16; st.spawnT -= dt;
    if (st.spawnT <= 0 && st.cars.length < want) {
      st.spawnT = .25; const near = TRAF.near(st.x, st.y); if (near.length) { const L = near[(h2(st.t * 100 | 0, st.cars.length, 3) * near.length) | 0], p = h2(st.t * 37 | 0, 5, 1) * L.P.len, q = NET.at(L.P, p, L.off); const d = dist(q.x, q.y, st.x, st.y); if (d > 70 && d < 380) { const r = h2(st.t * 13 | 0, 9, 2); st.cars.push({ L, p, v: L.spd * .7, spd: L.spd * (.8 + r * .35), kind: r < .18 ? 'moto' : r < .4 ? 'taxi' : r < .47 ? 'bus' : 'car', col: r < .4 && r >= .18 ? '#f2c400' : CARCOL[(r * 97 | 0) % CARCOL.length], x: q.x, y: q.y, a: q.a, stop: 0 }); } }
    }
    for (const c of st.cars) {
      let v = c.spd * (st.rain ? .85 : 1); const len = c.kind === 'bus' ? 12 : c.kind === 'moto' ? 2 : 4.5;
      for (const o of st.cars) { if (o === c || o.L !== c.L) continue; const ahead = (o.p - c.p) * c.L.d; if (ahead > 0 && ahead < len + 7) v = Math.min(v, o.v * .9, Math.max(0, ahead - len - 2)); }
      const front = c.p + c.L.d * len / 2; for (const q of c.L.lights) { const d = (q.s - front) * c.L.d; if (d < 0 || d > 35) continue; const s = TRAF.state(q.g, st.t)[q.ax]; if (s === 'r' || (s === 'y' && d > 8 && c.kind !== 'moto')) v = Math.min(v, Math.max(0, (d - 3) * 1.2)); break; }
      const fx = Math.cos(c.a), fy = Math.sin(c.a), dx = st.x - c.x, dy = st.y - c.y, along = dx * fx + dy * fy, lat = Math.abs(-dx * fy + dy * fx); if (along > 0 && along < 26 && lat < 4) v = along < 12 ? 0 : Math.min(v, 3);
      if (c.stop > 0) { c.stop -= dt; v = 0; }
      c.v += clamp(v - c.v, -6 * dt, 3 * dt); c.p += c.v * c.L.d * dt; const q = NET.at(c.L.P, c.p, c.L.off); c.x = q.x; c.y = q.y; c.a = c.L.d > 0 ? q.a : q.a + Math.PI;
      // choque con el bus (círculos a lo largo del eje)
      if (!(c.ghost > 0)) { for (const [px, py] of this.pts(st, B)) { if (dist(px, py, c.x, c.y) < (c.kind === 'bus' ? 3.6 : 2.4)) { c.ghost = 4; c.stop = 3; if (Math.abs(st.v) > .8) { st.crashes++; st.score -= 150; st.comfort = Math.max(0, st.comfort - 15); st.shake = .4; st.v *= .3; this.sfx(st, 'crash'); this.msg(st, '¡Choque con un ' + (c.kind === 'moto' ? 'motociclista' : c.kind === 'taxi' ? 'taxi' : 'carro') + '! −150', 'r'); vib(140); } break; } } } else c.ghost -= dt;
    }
    st.cars = st.cars.filter(c => c.p > -10 && c.p < c.L.P.len + 10 && dist(c.x, c.y, st.x, st.y) < 520);
  },
  finish(st) { if (st.done) return; st.done = true; st.ph = 'end'; st.score += Math.round(st.comfort * 2) - Math.round(st.damage * 3); if (!st.assist && !st.auto) st.score = Math.round(st.score * 1.25); st.score = Math.max(0, Math.round(st.score)); Save.d.stats.km += st.sR / 1000; },
  result(st) {
    const n = st.stops.length - 1, ok = st.arr.filter(a => a.err < 99), skipped = st.arr.length - ok.length, avg = ok.length ? ok.reduce((a, b) => a + b.err, 0) / ok.length : 0, max = n * 500 + 200, line = NET.byId[st.line];
    return { done: st.done, win: st.done && skipped === 0, score: st.score, stars: st.done && skipped === 0 ? starsOf(st.score / max) : 0, fact: (line.facts || [])[st.seed % Math.max(1, (line.facts || []).length)] || '',
      lines: [['Paradas', (n - skipped) + ' / ' + n], ['Precisión media', avg.toFixed(1) + ' m'], ['Confort (tinto)', Math.round(st.comfort) + ' %'], ['Choques / rojos', st.crashes + ' / ' + st.reds], ['Asistente', st.assist ? 'encendido' : 'apagado (×1,25)']] };
  },
  msg(st, t, c) { if (!EM.headless && Game.st === st) UI.gmsg(t, c); },
  say(st, t) { if (!st.auto && Game.st === st) Snd.say(t); },
  sfx(st, k) { if (!EM.headless && Game.st === st) Snd.play(k); },
  hud(st) { const line = NET.byId[st.line], nx = line.st[st.stops[Math.min(st.ni, st.stops.length - 1)]], d = st.stopTgt[st.ni] - st.sR; this.updCtl(st); return [['', Math.round(Math.abs(st.v) * 3.6) + ' km/h' + (st.rev ? ' R' : '')], ['→', nx.name], ['', st.ph === 'dwell' ? 'Parada' : Math.round(Math.max(0, d)) + ' m'], ['★', fmt(st.score)]]; },
  /* ---------- controles: timón, palanca, botones ---------- */
  mount(st, el) {
    el.innerHTML = `<div class="pedals"><button class="pedal acc" id="vAcc"><b>▲</b>Acelerar</button><button class="pedal brk" id="vBrk"><b>▼</b>Frenar · R</button></div>
      <div class="wheel" id="vWh"><div class="wh-in" id="vWi"><i></i></div></div>
      <div class="gbtns" style="bottom:calc(150px + var(--sab))"><button class="btn sm mos" id="vDoor">⇆ Puertas</button><button class="btn sm" id="vAs">🛞 Asistente</button><button class="btn sm" id="vTilt">📱 Inclinar</button><button class="btn sm" id="vHorn">📯 Pito</button></div>
      <div class="vsel" id="vView"><button data-v="tps">3ª</button><button data-v="cab">1ª</button><button data-v="cine">🎥</button><button data-v="top">▦</button><button data-v="pan">◎</button><button data-v="paseo">🎬</button></div>`;
    const pedal = (id, key) => { const b = $(id), on = e => { e.preventDefault(); b.setPointerCapture && b.setPointerCapture(e.pointerId); st.keys[key] = true; b.classList.add('on'); Snd.init(); vib(8); }, off = () => { st.keys[key] = false; b.classList.remove('on'); }; b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off); };
    pedal('#vAcc', 'up'); pedal('#vBrk', 'down');
    $('#vTilt').onclick = () => this.tiltToggle(st);
    const wh = $('#vWh'), ws = e => { const r = wh.getBoundingClientRect(); st.sin = clamp((e.clientX - (r.left + r.width / 2)) / (r.width * .42), -1, 1); st.keys._kb = false; };
    wh.addEventListener('pointerdown', e => { wh.setPointerCapture(e.pointerId); if (st.assist) { st.assist = false; this.msg(st, 'Asistente apagado: manejas tú (×1,25)', 'b'); } ws(e); });
    wh.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') ws(e); }); wh.addEventListener('pointerup', () => { st.keys._kb = true; });
    $('#vDoor').onclick = () => this.doors(st); $('#vHorn').onclick = () => { Snd.play('horn'); vib(30); for (const c of st.cars) if (dist(c.x, c.y, st.x, st.y) < 40) c.stop = Math.max(c.stop, .8); };
    $('#vAs').onclick = () => { st.assist = !st.assist; this.msg(st, st.assist ? 'Asistente de carril encendido' : 'Asistente apagado: usa el timón (×1,25)', 'b'); };
    $$('#vView button').forEach(b => b.onclick = () => { if (b.dataset.v === 'paseo') { st.paseo = !st.paseo; st.auto = st.paseo; if (st.paseo) st.assist = true; this.msg(st, st.paseo ? 'Modo paseo: el bus va solo y la cámara cambia de plano' : 'Vuelves a manejar tú', 'b'); } else st.view = b.dataset.v; });
  },
  /* dirección inclinando el celular (giroscopio) */
  tiltToggle(st) {
    const on = () => { st.tilt = true; st.assist = false; st.keys._kb = false; this._tl = e => { const land = Math.abs(window.orientation || (screen.orientation && screen.orientation.angle) || 0) === 90, v = land ? (e.beta || 0) * (((window.orientation || (screen.orientation && screen.orientation.angle)) === -90 || (screen.orientation && screen.orientation.angle === 270)) ? -1 : 1) : (e.gamma || 0); if (st.tilt) st.sin = clamp(v / 28, -1, 1); }; addEventListener('deviceorientation', this._tl); this.msg(st, 'Inclina el celular para girar (×1,25)', 'b'); };
    if (st.tilt) { st.tilt = false; removeEventListener('deviceorientation', this._tl); this.msg(st, 'Inclinar apagado', 'b'); return; }
    if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) DeviceOrientationEvent.requestPermission().then(r => { if (r === 'granted') on(); else this.msg(st, 'Sin permiso para el giroscopio', 'y'); }).catch(() => this.msg(st, 'Sin permiso para el giroscopio', 'y')); else if (window.DeviceOrientationEvent) on(); else this.msg(st, 'Este equipo no tiene giroscopio', 'y');
  },
  unmount(st) { if (this._tl) removeEventListener('deviceorientation', this._tl); },
  updCtl(st) {
    if (EM.headless || Game.st !== st) return; const pb = $('#vBrk'); if (!pb) return;
    pb.querySelector('b').textContent = st.rev ? 'R' : '▼'; $('#vTilt').style.background = st.tilt ? 'var(--mante)' : '';
    const d = $('#vDoor'); d.disabled = st.ph !== 'dwell'; d.textContent = st.doors === 1 ? (st.board >= 1 ? '🔔 Cerrar' : '⇆ Cerrar') : '⇆ Abrir';
    $('#vAs').style.background = st.assist ? 'var(--mante)' : ''; $('#vWi').style.transform = 'rotate(' + (st.steer / BUSES[st.kind].smax * 120) + 'deg)';
    $$('#vView button').forEach(b => b.classList.toggle('on', b.dataset.v === st.view || (b.dataset.v === 'paseo' && st.paseo)));
    if (st.paseo && (st._pv = (st._pv || 0) + .2) > 8) { st._pv = 0; const V = this.gl(Object.assign({}, st, { view: 'tps' })) ? ['cine', 'tps', 'cab', 'cine', 'pan'] : ['top', 'pan']; st.view = V[(V.indexOf(st.view) + 1) % V.length]; }
    if (st.ph === 'ready' && !st._rt) { st._rt = 1; this.msg(st, 'Mantén ACELERAR para arrancar desde ' + NET.byId[st.line].st[st.stops[0]].name, 'b'); }
  },
  key(st, k, down) { const m = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' }[k]; if (m) { st.keys[m] = down; if (m === 'left' || m === 'right') { st.keys._kb = true; if (down && st.assist) { st.assist = false; this.msg(st, 'Asistente apagado: manejas tú', 'b'); } } return; } if (!down) return; if (k === ' ') this.doors(st); if (k === 'h') Snd.play('horn'); if (k === 'v') { const V = ['tps', 'cab', 'cine', 'top', 'pan']; st.view = V[(V.indexOf(st.view) + 1) % 4]; } if (k === 'g') st.assist = !st.assist; },
  gl(st) { return (st.view === 'tps' || st.view === 'cab' || st.view === 'cine') && G3.init() && Save.d.settings.q !== 'low'; },
  /* ---------- dibujo ---------- */
  draw(g, st, vp) {
    const W = vp.w, H = vp.h, line = NET.byId[st.line], B = BUSES[st.kind];
    if (this.gl(st)) { G3.show(true); this.draw3D(g, st, W, H, line, B); }
    else { if (G3.cv) G3.show(false); this.drawTop(g, st, W, H, line, B, st.view === 'pan'); }
    if (!EM.headless) { const gl = this.gl(st); Mundo.overlay(g, W, H, st.t, { noNight: gl || st.view === 'pan', noRain: gl, noGrain: gl }); if (!gl && st.view === 'top') MAP.lightsTop(g, Mundo.light().night, st.t); }
    this.overlay(g, st, W, H, line, B);
  },
  draw3D(g, st, W, H, line, B) {
    const c = Math.cos(st.h), s = Math.sin(st.h), z = this.elev(st.x, st.y), sh = st.shake > 0 ? (Math.random() - .5) * st.shake * 2 : 0; let cam;
    if (st.view === 'cine') { if (!st._cine || st._cine.s - st.sR < -25) { const sa = Math.min(line.P.len, st.sR + 110 + h2(st.t | 0, 1, 2) * 60), sd = h2(st.t | 0, 2, 2) < .5 ? -1 : 1, q = NET.at(line.P, sa, sd * 13); st._cine = { s: sa, x: q.x, y: q.y, z: this.elev(q.x, q.y) + 1.6 }; } cam = { eye: [st._cine.x, st._cine.z, st._cine.y], at: [st.x + c * 6, z + 2, st.y + s * 6], fov: .95 }; }
    else if (st.view === 'cab') cam = { eye: [st.x + c * (B.wb + 1.6), z + 2.9 + sh, st.y + s * (B.wb + 1.6)], at: [st.x + c * 60, z + 1.5 + (this.elev(st.x + c * 60, st.y + s * 60) - z) * .6, st.y + s * 60], fov: 1.15 };
    else { const bk = B.len2 ? 30 : 25, ex = st.x - c * bk, ey = st.y - s * bk, ez = Math.max(z, this.elev(ex, ey)) + 12; if (!st._cam) st._cam = { x: ex, y: ey, z: ez }; st._cam.x += (ex - st._cam.x) * .18; st._cam.y += (ey - st._cam.y) * .18; st._cam.z += (ez - st._cam.z) * .18; cam = { eye: [st._cam.x, st._cam.z + sh, st._cam.y], at: [st.x + c * 14, z + 2.5, st.y + s * 14], fov: .95 }; }
    G3.draw(cam, { hour: st.hourNow, rain: st.rain, dyn: G => {
      G3.traffic(cam, st.t + 3000, line); G3.people(cam, st.t);
      // bus del jugador
      const col = rgb(line.color), zf = this.elev(st.x + c * B.wb * .5, st.y + s * B.wb * .5);
      const fcx = st.x + c * (B.wb + 2.2 - B.len1 / 2), fcy = st.y + s * (B.wb + 2.2 - B.len1 / 2), pitch = Math.atan2(this.elev(st.x + c * 6, st.y + s * 6) - this.elev(st.x - c * 6, st.y - s * 6), 12);
      if (st.view !== 'cab') { G.box(fcx, zf + .4, fcy, st.h, B.len1, B.w, 1.9, col, pitch); G.box(fcx, zf + 2.3, fcy, st.h, B.len1 * .98, B.w * .98, .9, [.12, .2, .28], pitch); G.box(fcx, zf + 3.2, fcy, st.h, B.len1, B.w, .25, [.95, .95, .93], pitch); }
      if (B.len2) { const hx = st.x - c * B.hitch, hy = st.y - s * B.hitch, c2 = Math.cos(st.h2), s2 = Math.sin(st.h2), tx = hx - c2 * B.len2 / 2, ty = hy - s2 * B.len2 / 2, zt = this.elev(tx, ty); G.box(tx, zt + .4, ty, st.h2, B.len2, B.w, 1.9, col); G.box(tx, zt + 2.3, ty, st.h2, B.len2 * .98, B.w * .98, .9, [.12, .2, .28]); G.box(tx, zt + 3.2, ty, st.h2, B.len2, B.w, .25, [.95, .95, .93]); G.box(hx, zt + .5, hy, st.h, 1.2, B.w * .9, 2.6, [.15, .15, .15]); }
      for (const k of st.cars) { const zc = this.elev(k.x, k.y), L = k.kind === 'bus' ? 12 : k.kind === 'moto' ? 2 : 4.4, Wd = k.kind === 'moto' ? .8 : 1.9, Hh = k.kind === 'bus' ? 3 : k.kind === 'moto' ? 1.5 : 1.45; G.box(k.x, zc + .3, k.y, k.a, L, Wd, Hh * .62, rgb(k.col)); G.box(k.x, zc + .3 + Hh * .62, k.y, k.a, L * .55, Wd * .92, Hh * .38, [.15, .22, .3]); }
      for (const gl of this._lightsNear(st)) { const zl = this.elev(gl.x, gl.y), ss = TRAF.state(gl, st.t), ax = Math.abs(c) > Math.abs(s) ? 0 : 1, sc = ss[ax]; G.box(gl.x, zl, gl.y, 0, .3, .3, 5, [.2, .2, .22]); G.box(gl.x, zl + 5, gl.y, 0, .7, .7, 1.4, sc === 'g' ? [.22, .9, .48] : sc === 'y' ? [1, .76, .23] : [1, .23, .18]); }
      // parada siguiente: poste alto del color de la línea
      const nx = NET.at(line.P, st.stopTgt[st.ni]), zn = this.elev(nx.x, nx.y); G.box(nx.x, zn, nx.y, 0, .6, .6, 9 + Math.sin(st.t * 4), col); G.box(nx.x, zn + 9, nx.y, st.t, 2.2, 2.2, 2.2, [1, .9, .4]);
    } });
    // lluvia y limpiaparabrisas
    if (st.rain) { g.strokeStyle = 'rgba(220,235,245,.4)'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i < 80; i++) { const x = (h2(i, 3, 3) * W + st.t * 90) % W, y = (h2(i, 4, 3) * H + st.t * 800 * (1 + h2(i, 5, 3))) % H; g.moveTo(x, y); g.lineTo(x - 3, y + 12); } g.stroke(); }
    if (st.view === 'cab') { const u = Math.min(W, H) / 220; g.fillStyle = '#141414'; g.fillRect(0, 0, W, 8 * u); g.fillRect(0, 0, 9 * u, H); g.fillRect(W - 9 * u, 0, 9 * u, H); g.fillStyle = '#1e2a33'; g.fillRect(0, H - 30 * u, W, 30 * u); if (st.rain) { const a = Math.sin(st.t * 3) * .9; g.strokeStyle = '#141414'; g.lineWidth = 3 * u; g.beginPath(); g.moveTo(W * .3, H - 30 * u); g.lineTo(W * .3 + Math.sin(a) * H * .35, H - 30 * u - Math.cos(a) * H * .35); g.stroke(); } }
    // letreros de paradas proyectados
    g.textAlign = 'center'; for (let k = st.ni; k < Math.min(st.stops.length, st.ni + 2); k++) { const sI = line.st[st.stops[k]], p = NET.at(line.P, sI.s), q = G3.toScreen(p.x, this.elev(p.x, p.y) + 12, p.y, W, H); if (!q || q.d > 900) continue; const fs = clamp(2600 / q.d, 11, 22) * (W / ($('#gcv').clientWidth || W)); g.font = '700 ' + fs + 'px Titulos, sans-serif'; const tw = g.measureText(sI.name).width; g.fillStyle = 'rgba(20,20,20,.85)'; g.fillRect(q.x - tw / 2 - 6, q.y - fs, tw + 12, fs * 1.3); g.fillStyle = line.color; g.fillRect(q.x - tw / 2 - 6, q.y - fs, 4, fs * 1.3); g.fillStyle = '#fff'; g.fillText(sI.name, q.x, q.y); }
    g.textAlign = 'left';
  },
  drawTop(g, st, W, H, line, B, pan) {
    const k = pan ? Math.min(W, H) / 1400 : Math.min(W, H) / 150, mx = st.x + (pan ? 0 : Math.cos(st.h) * 25), my = st.y + (pan ? 0 : Math.sin(st.h) * 25);
    g.fillStyle = PAL.noche; g.fillRect(0, 0, W, H); if (MAP.ready) { if (pan) { const m = MAP.mini(), s = k * MAP.miniK; g.imageSmoothingEnabled = false; g.drawImage(m, W / 2 - mx * k, H / 2 - my * k, m.width * s, m.height * s); } else MAP.drawTop(g, W, H, mx, my, k); }
    const S = (x, y) => ({ x: W / 2 + (x - mx) * k, y: H / 2 + (y - my) * k });
    g.strokeStyle = line.color + 'aa'; g.lineWidth = Math.max(3, 7 * k); g.lineJoin = 'round'; g.beginPath(); line.P.pts.forEach((p, i) => { const q = S(p.x, p.y); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }); g.stroke();
    for (let i = 0; i < st.stops.length; i++) { const sI = line.st[st.stops[i]], p = NET.at(line.P, sI.s), q = S(p.x, p.y), cur = i === st.ni; g.fillStyle = cur ? PAL.mante : '#fff'; g.strokeStyle = PAL.negro; g.lineWidth = 2; g.beginPath(); g.arc(q.x, q.y, cur ? 9 + 3 * Math.sin(st.t * 5) : 6, 0, TAU); g.fill(); g.stroke(); if (!pan || cur) { g.fillStyle = PAL.negro; g.font = '700 12px Cuerpo, sans-serif'; g.fillText(sI.name, q.x + 11, q.y - 8); } if (!pan) for (let j = 0; j < 4; j++) Art.person(g, q.x - 14 + j * 5, q.y + 16, 2, i * 7 + j, false); }
    for (const gl of this._lightsNear(st)) { const q = S(gl.x, gl.y), ss = TRAF.state(gl, st.t); g.fillStyle = PAL.negro; g.fillRect(q.x - 5, q.y - 5, 10, 10); g.fillStyle = ss[0] === 'g' ? '#38e07b' : ss[0] === 'y' ? '#ffc23a' : '#ff3b2f'; g.fillRect(q.x - 4, q.y - 4, 4, 8); g.fillStyle = ss[1] === 'g' ? '#38e07b' : ss[1] === 'y' ? '#ffc23a' : '#ff3b2f'; g.fillRect(q.x, q.y - 4, 4, 8); }
    for (const c of st.cars) { const q = S(c.x, c.y), L = c.kind === 'bus' ? 12 : c.kind === 'moto' ? 2 : 4.4; Art.topVehicle(g, q.x, q.y, c.a, Math.max(4, L * k), Math.max(2.5, (c.kind === 'moto' ? .9 : 1.9) * k), c.col, 'car'); }
    const c = Math.cos(st.h), s = Math.sin(st.h), f = S(st.x + c * (B.wb + 2.2 - B.len1 / 2), st.y + s * (B.wb + 2.2 - B.len1 / 2)); Art.topVehicle(g, f.x, f.y, st.h, Math.max(10, B.len1 * k), Math.max(5, B.w * k), line.color, 'brt');
    if (B.len2) { const hx = st.x - c * B.hitch, hy = st.y - s * B.hitch, q = S(hx - Math.cos(st.h2) * B.len2 / 2, hy - Math.sin(st.h2) * B.len2 / 2); Art.topVehicle(g, q.x, q.y, st.h2, Math.max(6, B.len2 * k), Math.max(5, B.w * k), line.color, 'brt'); }
  },
  /* tablero: velocímetro, flecha GPS, tinto, clima */
  overlay(g, st, W, H, line, B) {
    const dpr = W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W), cx = W / 2, R = Math.min(W * .12, 46 * dpr), cy = H - 8 * dpr;
    g.fillStyle = 'rgba(13,20,24,.85)'; g.beginPath(); g.arc(cx, cy, R, Math.PI, TAU); g.fill(); g.strokeStyle = PAL.mante; g.lineWidth = 2 * dpr; g.stroke();
    const an = Math.PI + Math.PI * clamp(Math.abs(st.v) / B.vmax, 0, 1); g.strokeStyle = '#fff'; g.lineWidth = 2.5 * dpr; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(an) * R * .82, cy + Math.sin(an) * R * .82); g.stroke();
    g.textAlign = 'center'; g.fillStyle = '#fff'; g.font = '700 ' + (R * .36) + 'px Titulos, sans-serif'; g.fillText(Math.round(Math.abs(st.v) * 3.6), cx, cy - R * .2); g.font = '700 ' + (R * .16) + 'px Cuerpo, sans-serif'; g.fillStyle = PAL.mante; g.fillText(st.rev ? 'REVERSA' : 'KM/H', cx, cy - R * .02);
    // flecha GPS hacia la ruta (punto 40 m adelante)
    const q = NET.at(line.P, Math.min(line.P.len, st.sR + 40)), br = Math.atan2(q.y - st.y, q.x - st.x) - st.h, ay = 92 * dpr, ar = 18 * dpr;
    g.save(); g.translate(cx, ay); g.rotate(br); g.fillStyle = st.off > 30 ? PAL.naranja : 'rgba(249,228,164,.9)'; g.strokeStyle = PAL.negro; g.lineWidth = 2 * dpr; g.beginPath(); g.moveTo(ar, 0); g.lineTo(-ar * .6, -ar * .6); g.lineTo(-ar * .25, 0); g.lineTo(-ar * .6, ar * .6); g.closePath(); g.fill(); g.stroke(); g.restore();
    const d = st.stopTgt[st.ni] - st.sR, late = st.t - st.sched[Math.min(st.ni, st.sched.length - 1)];
    g.fillStyle = 'rgba(13,20,24,.82)'; g.fillRect(cx - 90 * dpr, ay + 24 * dpr, 180 * dpr, 34 * dpr); g.fillStyle = line.color; g.fillRect(cx - 90 * dpr, ay + 24 * dpr, 4 * dpr, 34 * dpr);
    g.fillStyle = '#fff'; g.font = '700 ' + (15 * dpr) + 'px Titulos, sans-serif'; g.fillText(st.ph === 'dwell' ? (st.doors === 1 ? 'ABORDANDO ' + Math.round(st.board * 100) + '%' : 'EN LA PARADA') : Math.round(Math.max(0, d)) + ' m a la parada', cx, ay + 41 * dpr);
    g.font = '600 ' + (9.5 * dpr) + 'px Cuerpo, sans-serif'; g.fillStyle = late > 20 ? PAL.naranja : PAL.mante; g.fillText('HORARIO ' + (late >= 0 ? '+' : '') + Math.round(late) + ' s · ' + clockStr(new Date(0, 0, 0, Math.floor(st.hourNow % 24), Math.floor((st.hourNow % 1) * 60))) + (st.rain ? ' · LLUVIA' : ''), cx, ay + 53 * dpr);
    // tinto
    const tx = 26 * dpr, ty = 62 * dpr; g.fillStyle = 'rgba(13,20,24,.7)'; g.fillRect(tx - 18 * dpr, ty - 6 * dpr, 36 * dpr, 40 * dpr); g.fillStyle = '#f3efe6'; g.fillRect(tx - 7 * dpr, ty, 14 * dpr, 14 * dpr); const sl = clamp(st.lastA * 3 + st.steer * st.v * .3, -6, 6) * dpr; g.fillStyle = '#5a3417'; g.beginPath(); g.moveTo(tx - 6 * dpr, ty + 4 * dpr - sl); g.lineTo(tx + 6 * dpr, ty + 4 * dpr + sl); g.lineTo(tx + 6 * dpr, ty + 13 * dpr); g.lineTo(tx - 6 * dpr, ty + 13 * dpr); g.fill(); g.fillStyle = PAL.mante; g.font = '700 ' + (9 * dpr) + 'px Cuerpo, sans-serif'; g.fillText(Math.round(st.comfort) + '%', tx, ty + 27 * dpr);
    g.textAlign = 'left';
  },
  ai(st) { return null; }
};
