/* =====================================================================
   CABINA DEL METRO: procedimiento real de conducción y escuela paso a paso.
   · Llave: activa la cabina (solo detenido).        · Sentido: NEUTRO / ADELANTE / ATRÁS.
   · Puertas por lado: el andén puede estar a la izquierda (central) o a la derecha (laterales);
     abrir del lado sin andén está prohibido.          · Señal de salida: verde unos segundos después de cerrar.
   · Vigilante (hombre muerto): cada 25–40 s suena; tócalo (o mueve la palanca) en 6 s o frena de emergencia.
   · Anuncio: “Próxima estación…” por los parlantes (Cultura Metro, +30).
   La escuela se activa la primera vez en la Línea A o desde “Escuela de conducción”.
   ===================================================================== */
(function () {
  const C = Conduce, base = { create: C.create, tick: C.tick, doors: C.doors, mount: C.mount, updCtl: C.updCtl, key: C.key, drawCab: C.drawCab, drawMiniHud: C.drawMiniHud, levels: C.levels };
  const TUT = [
    ['Gira la LLAVE 🔑 para activar la cabina', st => st.key],
    ['Pon el SENTIDO en ADELANTE', st => st.sel === 1],
    ['Espera la señal verde y sube la palanca a TRACCIÓN', st => st.ph === 'run'],
    ['Respeta el arco verde del velocímetro y frena para detener el frente en la marca amarilla', st => st.ph === 'dwell'],
    ['Abre las puertas del lado del ANDÉN (mira el panel: IZQ o DER)', st => st.doors === 1],
    ['Espera el TIMBRE de abordaje completo y cierra las puertas', st => st.doors === 2],
    ['Cuando la SEÑAL esté en verde, arranca de nuevo', st => st.ph === 'run' && st.ni > 1],
    ['Haz el ANUNCIO 🎙 de la próxima estación', st => Object.keys(st.annDone).length > 0],
    ['Cuando suene el VIGILANTE, tócalo antes de 6 s', st => st.vigAcks > 0]
  ];
  C.sideOf = function (st, i) { const name = NET.byId[st.line].st[st.stops[i]].name; return h2(hashStr(name), 3, 19) < .3 ? 'izq' : 'der'; };
  C.levels = function () {
    if (this._lv2) return this._lv2; const L = base.levels.call(this).slice(), A = NET.byId.A;
    if (A) L.unshift({ id: 'A:0-2#escuela', line: 'A', a: 0, b: 2, name: 'Escuela de conducción', sub: 'Línea A · aprende la cabina paso a paso', k: -1, escuela: true });
    return (this._lv2 = L);
  };
  C.create = function (lv, opts) {
    const esc_ = String(lv).endsWith('#escuela'), st = base.create.call(this, esc_ ? String(lv).replace('#escuela', '') : lv, opts); if (esc_) st.lvId = lv;
    Object.assign(st, { key: !!opts.auto, sel: opts.auto ? 1 : 0, sigOK: false, sigT: 0, vigNext: 28 + (st.seed % 12), vigAlarm: false, vigT: 0, vigAcks: 0, lastLev: 0, annDone: {}, wrongDoor: 0, tut: !opts.auto && !EM.headless && (esc_ || (!Save.d.tutMetro && st.line === 'A')) ? 0 : -1 });
    return st;
  };
  C.vigAck = function (st) { if (!st.vigAlarm) return; st.vigAlarm = false; st.vigT = 0; st.vigNext = 25 + h2(st.t | 0, 7, 1) * 15; st.vigAcks++; this.sfx2(st, 'tap'); };
  C.sfx2 = function (st, k) { if (!EM.headless && Game.st === st) Snd.play(k); };
  C.tick = function (st, dt, K, line) {
    if (st.auto) { st.key = true; st.sel = 1; if (st.vigAlarm && st.vigT > .8) this.vigAck(st); }
    // sin cabina activa o sin sentido no hay tracción
    if ((!st.key || st.sel !== 1) && st.lev > 0) { st.lev = 0; if (!st._hintK || st.t - st._hintK > 4) { st._hintK = st.t; this.msg(st, !st.key ? 'Primero gira la llave 🔑' : 'Pon el sentido en ADELANTE', 'y'); } }
    // salida: la señal se pone verde 1,5 s (inicio) o 2,5 s (estación) después de quedar listo
    const ready = st.ph === 'ready' || (st.ph === 'dwell' && st.doors === 2);
    if (ready && st.key && st.sel === 1 && !st.sigOK) { st.sigT += dt; if (st.sigT > (st.ph === 'ready' ? 1.5 : 2.5)) { st.sigOK = true; this.sfx2(st, 'beep'); this.msg(st, 'Señal de salida en verde ●', 'g'); } }
    if (ready && !st.sigOK) { if (st.lev > .05 && !st.auto && (!st._hintS || st.t - st._hintS > 3)) { st._hintS = st.t; this.msg(st, 'Espera la señal de salida en verde', 'y'); } st.t += dt; if (st.ph === 'dwell') st.dwell += dt; st.lev = Math.min(st.lev, 0); return; }
    const was = st.ph;
    // vigilante (solo en marcha)
    if (st.ph === 'run') {
      if (Math.abs(st.lev - st.lastLev) > .1) { if (st.vigAlarm) this.vigAck(st); else st.vigNext = Math.max(st.vigNext, 12); }
      st.lastLev = st.lev;
      if (!st.vigAlarm) { st.vigNext -= dt; if (st.vigNext <= 0 && st.v > 1) { st.vigAlarm = true; st.vigT = 0; this.sfx2(st, 'warn'); this.msg(st, '⚠ VIGILANTE: tócalo para confirmar que estás atento', 'r'); } }
      else { st.vigT += dt; if ((st.vigT * 2 | 0) !== ((st.vigT - dt) * 2 | 0)) this.sfx2(st, 'beep'); if (st.vigT > 6) { st.vigAlarm = false; st.vigNext = 25; st.eb = 1; st.score -= 100; this.msg(st, 'Vigilante sin respuesta: freno de emergencia −100', 'r'); this.sfx2(st, 'crash'); vib(200); } }
    }
    base.tick.call(this, st, dt, K, line);
    if (was !== 'run' && st.ph === 'run') { st.sigOK = false; st.sigT = 0; }   // la próxima salida necesita su señal
  };
  C.doors = function (st, side) {
    if (st.ph !== 'dwell') { this.msg(st, 'Las puertas solo abren detenido en el andén', 'y'); return; }
    if (st.doors === 0) { const ok = this.sideOf(st, st.ni); if (side && side !== ok) { st.score -= 120; st.wrongDoor++; this.msg(st, '¡Ese lado no tiene andén! Abre las de la ' + (ok === 'izq' ? 'IZQUIERDA' : 'DERECHA') + ' −120', 'r'); this.sfx2(st, 'bad'); vib(120); return; } }
    base.doors.call(this, st);
  };
  C.announce = function (st) {
    if (st.ph !== 'run') { this.msg(st, 'El anuncio se hace en marcha, antes de llegar', 'y'); return; } if (st.annDone[st.ni]) { this.msg(st, 'Ya anunciaste esta estación', 'y'); return; }
    st.annDone[st.ni] = 1; st.score += 30; const nx = NET.byId[st.line].st[st.stops[st.ni]].name, side = this.sideOf(st, st.ni) === 'izq' ? 'izquierdo' : 'derecho';
    if (!EM.headless && Game.st === st) Snd.say('Próxima estación: ' + nx + '. Puertas por el lado ' + side + '. Recuerde dejar salir antes de entrar.'); this.msg(st, '🎙 Anuncio hecho · +30', 'g');
  };
  C.mount = function (st, el) {
    base.mount.call(this, st, el);
    const gb = el.querySelector('.gbtns'); gb.className = 'cabgrid';
    gb.innerHTML = `<button class="cb" id="cbKey"><b>🔑</b>LLAVE</button><button class="cb" id="cbSel"><b>N</b>SENTIDO</button><button class="cb" id="cbVig"><b>◉</b>VIGILANTE</button><button class="cb" id="cbAnn"><b>🎙</b>ANUNCIO</button>
      <button class="cb" id="cbDL"><b>◧</b>PUERTAS IZQ</button><button class="cb" id="cbDR"><b>◨</b>PUERTAS DER</button><button class="cb" id="cFF"><b>⏩</b>CRUCERO</button><button class="cb" id="cHorn"><b>📯</b>PITO</button><button id="cDoor" hidden></button>`;
    const tut = document.createElement('div'); tut.id = 'cTut'; tut.className = 'jobbar tut hide'; el.appendChild(tut);
    $('#cbKey').onclick = () => { if (st.v > .1) { this.msg(st, 'Detén el tren para mover la llave', 'y'); return; } st.key = !st.key; if (!st.key) st.sel = 0; this.sfx2(st, 'switch'); vib(15); };
    $('#cbSel').onclick = () => { if (!st.key) { this.msg(st, 'Primero gira la llave', 'y'); return; } if (st.v > .1) { this.msg(st, 'El sentido solo cambia detenido', 'y'); return; } st.sel = st.sel === 0 ? 1 : st.sel === 1 ? -1 : 0; this.sfx2(st, 'switch'); if (st.sel === -1) this.msg(st, 'ATRÁS: solo para maniobras (el juego no permite retroceder en servicio)', 'y'); };
    $('#cbVig').onclick = () => { if (st.vigAlarm) this.vigAck(st); else this.sfx2(st, 'tap'); };
    $('#cbAnn').onclick = () => this.announce(st);
    $('#cbDL').onclick = () => { if (st.doors === 1) this.doors(st); else this.doors(st, 'izq'); };
    $('#cbDR').onclick = () => { if (st.doors === 1) this.doors(st); else this.doors(st, 'der'); };
    $('#cFF').onclick = () => { st.ff = !st.ff; }; $('#cHorn').onclick = () => { Snd.play('horn'); vib(30); };
  };
  C.updCtl = function (st) {
    base.updCtl.call(this, st); if (EM.headless || Game.st !== st) return; const k = $('#cbKey'); if (!k) return;
    k.classList.toggle('on', st.key); const sl = $('#cbSel'); sl.querySelector('b').textContent = st.sel === 1 ? 'ADEL' : st.sel === -1 ? 'ATRÁS' : 'N'; sl.classList.toggle('on', st.sel === 1);
    $('#cbVig').classList.toggle('warn', st.vigAlarm); $('#cbAnn').classList.toggle('on', !!st.annDone[st.ni]);
    const side = st.ph === 'dwell' || (st.tgt[st.ni] - st.s) * st.dir < 400 ? this.sideOf(st, st.ni) : null, open = st.doors === 1;
    $('#cbDL').classList.toggle('hot', side === 'izq' && st.ph === 'dwell' && st.doors === 0); $('#cbDR').classList.toggle('hot', side === 'der' && st.ph === 'dwell' && st.doors === 0);
    $('#cbDL').classList.toggle('on', open && side === 'izq'); $('#cbDR').classList.toggle('on', open && side === 'der');
    $('#cFF').classList.toggle('on', st.ff); $('#cFF').disabled = st.ph !== 'run';
    // escuela paso a paso
    const tb = $('#cTut'); if (st.tut >= 0) { while (st.tut < TUT.length && TUT[st.tut][1](st)) { st.tut++; this.sfx2(st, 'coin'); } if (st.tut >= TUT.length) { st.tut = -1; Save.d.tutMetro = 1; Save.write(); this.msg(st, '🎓 ¡Ya sabes manejar el metro! Escuela completa', 'g'); tb.classList.add('hide'); } else { tb.classList.remove('hide'); tb.innerHTML = `<b>Escuela · paso ${st.tut + 1} de ${TUT.length}</b><span>${esc(TUT[st.tut][0])}</span>`; } } else tb.classList.add('hide');
    if (st.ph === 'ready' && !st._rt2) { st._rt2 = 1; if (st.tut < 0 && !st.key) this.msg(st, 'Gira la llave, pon ADELANTE y espera la señal verde', 'b'); }
  };
  C.key = function (st, k, down) {
    if (down && (k === 'q' || k === 'Q')) { if (st.doors === 1) this.doors(st); else this.doors(st, 'izq'); return; }
    if (down && (k === 'e' || k === 'E')) { if (st.doors === 1) this.doors(st); else this.doors(st, 'der'); return; }
    if (down && (k === 'k' || k === 'K')) { $('#cbKey') ? $('#cbKey').click() : (st.key = !st.key); return; }
    if (down && (k === 'r' || k === 'R')) { $('#cbSel') ? $('#cbSel').click() : (st.sel = st.sel === 1 ? 0 : 1); return; }
    if (down && (k === 'g' || k === 'G')) { this.vigAck(st); return; }
    if (down && (k === 'a' || k === 'A')) { this.announce(st); return; }
    if (down && (k === ' ' || k === 'd') && st.doors !== 1) { this.doors(st, this.sideOf(st, st.ni)); return; }
    base.key.call(this, st, k, down);
  };
  /* consola: panel LED, velocímetro con arco ATP y lámparas de señal/timbre/freno/vigilante */
  C.drawCab = function (st, ...a) { return this._drawCab2(...arguments); };
  C._drawCab2 = function (g, st, W, H, K, line, night) {
    const dpr = W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W), zl = 222 * dpr, zr = W - 76 * dpr, db = H - Math.min(H * .32, 186 * dpr), vmax = K.vmax * 3.6, lim = this.limAt(st, st.s) * 3.6, d = (st.tgt[st.ni] - st.s) * st.dir, late = st.t - st.sched[Math.min(st.ni, st.sched.length - 1)];
    g.fillStyle = '#121a21'; g.fillRect(0, 0, W, 8 * dpr); g.fillRect(0, 0, 10 * dpr, H); g.fillRect(W - 10 * dpr, 0, 10 * dpr, H);
    if (st.rain) { const an = Math.sin(st.t * 3.2) * .95; g.strokeStyle = '#141414'; g.lineWidth = 3 * dpr; g.beginPath(); g.moveTo(W * .32, db); g.lineTo(W * .32 + Math.sin(an) * H * .34, db - Math.cos(an) * H * .34); g.stroke(); }
    g.fillStyle = '#1b262e'; g.beginPath(); g.moveTo(0, db + 16 * dpr); g.lineTo(W * .14, db); g.lineTo(W * .86, db); g.lineTo(W, db + 16 * dpr); g.lineTo(W, H); g.lineTo(0, H); g.fill();
    g.fillStyle = line.color; g.fillRect(W * .14, db, W * .72, 3 * dpr);
    // panel LED a lo ancho
    const px0 = 14 * dpr, pw = zr - px0 - 6 * dpr, py = db + 10 * dpr, ph = 32 * dpr, cxp = px0 + pw / 2, nx = line.st[st.stops[Math.min(st.ni, st.stops.length - 1)]], side = this.sideOf(st, st.ni);
    g.fillStyle = '#060a0c'; g.fillRect(px0, py, pw, ph); g.strokeStyle = '#3a4a55'; g.lineWidth = 1.5; g.strokeRect(px0, py, pw, ph);
    g.textAlign = 'center'; g.fillStyle = '#ff9a2e'; g.font = '700 ' + (10.5 * dpr) + 'px ui-monospace, Consolas, monospace';
    const L1 = !st.key ? 'CABINA INACTIVA · GIRA LA LLAVE' : st.sel !== 1 ? 'SENTIDO EN ' + (st.sel ? 'ATRÁS' : 'NEUTRO') : st.ph === 'dwell' ? (st.doors === 1 ? 'PUERTAS ' + (side === 'izq' ? 'IZQ' : 'DER') + ' ABIERTAS · ' + Math.round(st.board * 100) + '%' : st.doors === 2 ? (st.sigOK ? 'SEÑAL VERDE · TRACCIÓN' : 'ESPERE SEÑAL DE SALIDA') : nx.name.toUpperCase() + ' · ANDÉN ' + (side === 'izq' ? '◀ IZQUIERDA' : 'DERECHA ▶')) : st.ph === 'ready' ? (st.sigOK ? 'SEÑAL VERDE · PUEDE SALIR' : 'ESPERE SEÑAL DE SALIDA') : 'PRÓXIMA: ' + nx.name.toUpperCase() + ' · ' + (Math.abs(d) < 100 ? d.toFixed(0) : Math.round(d)) + ' m';
    g.fillText(L1, cxp, py + 13 * dpr);
    g.fillStyle = late > 15 ? '#ff6a3d' : '#7fe0a0'; g.font = '700 ' + (8.5 * dpr) + 'px ui-monospace, Consolas, monospace'; g.fillText((late >= 0 ? 'RETRASO +' : 'ADELANTO ') + Math.abs(Math.round(late)) + ' s · ANDÉN ' + (side === 'izq' ? 'IZQ' : 'DER') + ' · ' + Mundo.chip(), cxp, py + 26 * dpr);
    // lámparas
    const lamp = (x, y, on, col, t) => { g.fillStyle = on ? col : '#2a3238'; g.beginPath(); g.arc(x, y, 4.5 * dpr, 0, TAU); g.fill(); if (on) { g.fillStyle = col + '55'; g.beginPath(); g.arc(x, y, 8 * dpr, 0, TAU); g.fill(); } g.fillStyle = '#9fb0bb'; g.font = '700 ' + (6 * dpr) + 'px Cuerpo, sans-serif'; g.fillText(t, x, y + 12 * dpr); };
    const ly = py + ph + 16 * dpr, lw = (zr - zl) / 4, l0 = zl + lw / 2;
    lamp(l0, ly, (st.ph === 'ready' || (st.ph === 'dwell' && st.doors === 2)) && st.sigOK, '#38e07b', 'SEÑAL'); lamp(l0 + lw, ly, st.ph === 'dwell' && st.board >= 1 && st.doors === 1, '#ffc23a', 'TIMBRE'); lamp(l0 + lw * 2, ly, st.vigAlarm && (st.t * 4 | 0) % 2 === 0, '#ff3b2f', 'VIGIL.'); lamp(l0 + lw * 3, ly, st.v > lim / 3.6 + .5 || st.eb > 0, '#ff3b2f', 'ATP');
    // velocímetro
    const cx = (zl + zr) / 2, R = Math.min((zr - zl) * .46, 58 * dpr), cy = H - 8 * dpr;
    g.fillStyle = '#0b1115'; g.beginPath(); g.arc(cx, cy, R + 4 * dpr, Math.PI, TAU); g.fill(); g.strokeStyle = '#3a4a55'; g.lineWidth = 2 * dpr; g.beginPath(); g.arc(cx, cy, R + 3 * dpr, Math.PI, TAU); g.stroke();
    const al = Math.PI + Math.PI * clamp(lim / vmax, 0, 1); g.lineWidth = 5 * dpr; g.strokeStyle = '#2f9b57'; g.beginPath(); g.arc(cx, cy, R - 3 * dpr, Math.PI, al); g.stroke(); g.strokeStyle = PAL.rojo; g.beginPath(); g.arc(cx, cy, R - 3 * dpr, al, TAU); g.stroke();
    g.fillStyle = '#c9d6dc'; g.font = '700 ' + (6.5 * dpr) + 'px Cuerpo, sans-serif'; for (let v = 0; v <= vmax; v += 20) { const an = Math.PI + Math.PI * v / vmax; g.fillText(String(v), cx + Math.cos(an) * (R - 15 * dpr), cy + Math.sin(an) * (R - 15 * dpr) + 3); }
    const an = Math.PI + Math.PI * clamp(st.v * 3.6 / vmax, 0, 1); g.strokeStyle = '#fff'; g.lineWidth = 2.5 * dpr; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(an) * (R - 6 * dpr), cy + Math.sin(an) * (R - 6 * dpr)); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, cy, 4 * dpr, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.font = '700 ' + (R * .36) + 'px Titulos, sans-serif'; g.fillText(Math.round(st.v * 3.6), cx, cy - R * .38); g.fillStyle = PAL.mante; g.font = '700 ' + (R * .14) + 'px Cuerpo, sans-serif'; g.fillText('KM/H · LÍM ' + Math.round(lim), cx, cy - R * .2);
    g.textAlign = 'left';
    // tinto (confort) arriba a la izquierda
    const tx = 26 * dpr, ty = 150 * dpr, sl = clamp(st.a * 4, -6, 6) * dpr; g.fillStyle = 'rgba(13,20,24,.7)'; g.fillRect(tx - 18 * dpr, ty - 6 * dpr, 36 * dpr, 40 * dpr); g.fillStyle = '#f3efe6'; g.fillRect(tx - 7 * dpr, ty, 14 * dpr, 14 * dpr); g.fillStyle = '#5a3417'; g.beginPath(); g.moveTo(tx - 6 * dpr, ty + 4 * dpr - sl); g.lineTo(tx + 6 * dpr, ty + 4 * dpr + sl); g.lineTo(tx + 6 * dpr, ty + 13 * dpr); g.lineTo(tx - 6 * dpr, ty + 13 * dpr); g.fill(); g.fillStyle = PAL.mante; g.font = '700 ' + (9 * dpr) + 'px Cuerpo, sans-serif'; g.textAlign = 'center'; g.fillText(Math.round(st.comfort) + '%', tx, ty + 27 * dpr); g.textAlign = 'left';
    if (st.eb) { g.fillStyle = 'rgba(200,32,31,' + (.22 + .18 * Math.sin(st.t * 12)) + ')'; g.fillRect(0, 0, W, H); }
  };
  /* mini panel en las otras vistas: velocidad, señal, andén y vigilante */
  C.drawMiniHud = function (g, st, W, H, K) {
    const u = W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W), side = this.sideOf(st, st.ni), lines = [Math.round(st.v * 3.6) + ' km/h'];
    g.fillStyle = 'rgba(6,10,12,.88)'; g.fillRect(8 * u, 136 * u, 150 * u, 46 * u); g.strokeStyle = '#3a4a55'; g.lineWidth = 1.5; g.strokeRect(8 * u, 136 * u, 150 * u, 46 * u);
    g.fillStyle = '#fff'; g.font = '700 ' + (17 * u) + 'px Titulos, sans-serif'; g.fillText(lines[0], 16 * u, 156 * u);
    g.fillStyle = '#ff9a2e'; g.font = '700 ' + (8.5 * u) + 'px ui-monospace, Consolas, monospace'; g.fillText(!st.key ? 'GIRA LA LLAVE' : st.sel !== 1 ? 'SENTIDO: ADELANTE' : 'ANDÉN ' + (side === 'izq' ? '◀ IZQ' : 'DER ▶'), 16 * u, 172 * u);
    const sig = (st.ph === 'ready' || (st.ph === 'dwell' && st.doors === 2)); g.fillStyle = sig ? (st.sigOK ? '#38e07b' : '#ff3b2f') : '#2a3238'; g.beginPath(); g.arc(138 * u, 150 * u, 5 * u, 0, TAU); g.fill(); g.fillStyle = st.vigAlarm && (st.t * 4 | 0) % 2 === 0 ? '#ff3b2f' : '#2a3238'; g.beginPath(); g.arc(138 * u, 168 * u, 5 * u, 0, TAU); g.fill();
  };
})();
