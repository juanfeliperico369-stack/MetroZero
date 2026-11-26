/* =====================================================================
   LA VENTANA POR PARTES (3.11.1 · Claude, 25‑nov‑2026) · fase A del pedido del autor (motor-city/docs/PEDIDO-DEL-AUTOR-2026-11-25.md)
   El autor: «El mundo en tercera persona no carga en totalidad ni aunque avances más… hay que pensar en formas ingeniosas
   para hacer la carga del mundo y mejorar su fluidez».
   Medido con el CPU 4× (como un celular): la ventana cercana de 2,6 km (G3.buildNear) se rehacía de un solo tirón cada ~520 m,
   y el juego se congelaba ~1,7 s. El piso tardaba 524 ms, subir su textura 645 ms (con WebGL por software), los edificios 400 ms
   y lo lejano 121 ms.
   Ahora la ventana siguiente se arma por partes ANTES de llegar al borde (desde el 40 % del recorrido, centrada adelante):
   - el piso se pinta en 16 baldosas de 650 m, una por cuadro, y se compone en el lienzo de siempre (VC.piso3D ya sabe pintar
     cualquier rectángulo; las baldosas casan porque cada una pinta lo suyo con la misma escala);
   - los edificios de la ventana nueva se arman por partes (G3.edifCercaPasos, unos 8 ms por cuadro);
   - lo lejano de la ventana nueva (con su hueco) también se arma por partes (G3.buildFarPasos);
   - el cambio llama al G3.buildNear de siempre, que recibe lo ya armado: solo sube la textura y arma el terreno.
   Si llegas al borde antes de que esté lista, se termina de una vez solo lo que falta. Cuando el regulador de calidad (96d) cambia
   el detalle, la ventana también se rehace por partes en vez de borrarse. Aditivo: envuelve G3.draw.
   ===================================================================== */
(function () {
  if (typeof G3 === 'undefined' || typeof VC === 'undefined' || typeof VC.piso3D !== 'function') return;
  const N = 4, VP = G3.ventanaPorPartes = { trabajos: 0, cambios: 0, deUnaVez: 0, pasoMaxMs: 0, ultimo: null, eventos: [] };
  const ev = (tipo, o) => { if (VP.eventos.length >= 24) VP.eventos.shift(); VP.eventos.push(Object.assign({ t: Math.round(performance.now()), tipo }, o)); };
  let job = null;
  const ahora = () => performance.now();
  /* los mismos números que G3.buildNear (22-gl.js) para la ventana centrada en (cx, cz) */
  const plan = (G, cx, cz) => {
    const real = VC.on && !!VC.piso3D; if (!real) return null;
    const half = 1300, x0 = Math.floor((cx - half) / TM) * TM, z0 = Math.floor((cz - half) / TM) * TM, S = 2 * half;
    const sc = (Save.d.settings.q === 'low' || G.liviano ? 1024 : 2048) / S, n = Math.round(S * sc), sub = S / N, nsub = Math.round(sub * sc);
    if (nsub * N !== n) return null;   /* las baldosas deben casar exacto con el lienzo */
    return { cx, cz, real, x0, z0, S, sc, n, sub, nsub, k: 0, cv: null, g: null, bm: null, listo: false, t0: ahora() };
  };
  /* un paso por cuadro: una baldosa del piso, o los edificios */
  const paso = (G, J, apuro) => {
    const t0 = ahora();
    if (J.k < N * N) {
      if (!J.cv) { J.cv = mkCanvas(J.n, J.n); J.g = J.cv.getContext('2d'); }
      const i = J.k % N, j = Math.floor(J.k / N), b = VC.piso3D(J.x0 + i * J.sub, J.z0 + j * J.sub, J.sub, J.sc);
      J.g.drawImage(b, i * J.nsub, j * J.nsub); J.k++;
    } else if (!J.bm) {   /* los edificios por partes (G3.edifCercaPasos, 97d), con ~8 ms por cuadro; si no existe, de una vez */
      if (!J.it) J.it = typeof G.edifCercaPasos === 'function' ? G.edifCercaPasos(J.cx, J.cz, J.real) : null;
      if (!J.it) { J.bm = G.edifCerca(J.cx, J.cz, J.real); J.listo = true; }
      else { let r; do { r = J.it.next(); } while (!r.done && (apuro || ahora() - t0 < 8)); if (r.done) { J.bm = r.value; if (typeof G.buildFarPasos !== 'function') J.listo = true; } }
    } else if (!J.far) {   /* lo lejano de la ventana nueva (con su hueco), por partes (G3.buildFarPasos, 22-gl.js) */
      if (!J.itF) { J.hueco = [J.x0 + 40, J.z0 + 40, J.x0 + J.S - 40, J.z0 + J.S - 40]; J.itF = G.buildFarPasos(...J.hueco); }
      let r; do { r = J.itF.next(); } while (!r.done && (apuro || ahora() - t0 < 8)); if (r.done) { J.far = r.value; J.listo = true; }
    }
    VP.pasoMaxMs = Math.max(VP.pasoMaxMs, Math.round(ahora() - t0));
  };
  /* el cambio: buildNear de siempre, con el piso y los edificios ya armados */
  const cambiar = (G, J) => {
    const p0 = VC.piso3D, e0 = G.edifCerca, f0 = G.buildFar;
    VC.piso3D = function (X0, Y0, S, sc) { return X0 === J.x0 && Y0 === J.z0 && S === J.S && Math.abs(sc - J.sc) < 1e-9 ? J.cv : p0.apply(this, arguments); };
    G.edifCerca = function (cx, cz, real) { return cx === J.cx && cz === J.cz && real === J.real ? J.bm : e0.apply(this, arguments); };
    G.buildFar = function (a, b, c, d) { if (J.far && J.hueco && a === J.hueco[0] && b === J.hueco[1] && c === J.hueco[2] && d === J.hueco[3]) return this.ponerFar(J.far); return f0.apply(this, arguments); };
    const t0 = ahora();
    try { G.buildNear(J.cx, J.cz); } finally { VC.piso3D = p0; G.edifCerca = e0; G.buildFar = f0; }
    VP.cambios++; VP.ultimo = { cambioMs: Math.round(ahora() - t0), armadoMs: Math.round(ahora() - J.t0) };
  };
  const draw0 = G3.draw;
  G3.draw = function (cam, opts) {
    try {
      const W = this.win;
      if (this.ok && W && cam && cam.eye) {
        const ex = cam.eye[0], ez = cam.eye[2], lim = Math.min(1000, W.s * .2), dx = ex - W.cx, dz = ez - W.cz, d = Math.hypot(dx, dz);
        if (job && Math.hypot(job.cx - ex, job.cz - ez) > lim * 1.6) job = null;   /* se fue para otro lado (o saltó): se descarta */
        if (!job && VP.rehacer) { VP.rehacer = false; job = plan(this, Math.round(ex), Math.round(ez)); if (job) { VP.trabajos++; ev('rehacer', { d: Math.round(d) }); } else this.win = null; }   /* el regulador cambió la calidad (96d): se rehace por partes */
        if (!job && d > lim * .4) { const a = lim * .55 / Math.max(1, d); job = plan(this, Math.round(ex + dx * a), Math.round(ez + dz * a)); if (job) { VP.trabajos++; ev('empieza', { d: Math.round(d), lim: Math.round(lim) }); } }
        if (job && !job.listo && d > lim * .97) { VP.apurados = (VP.apurados || 0) + 1; for (let i = 0; i < 200 && !job.listo; i++) paso(this, job, true); }   /* ya en el borde: se termina solo lo que falta */
        if (job && !job.listo) paso(this, job);
        else if (job && job.listo) { const J = job; job = null; cambiar(this, J); }
      }
    } catch (e) { job = null; if (EM.errors) EM.errors.push('ventana por partes: ' + e.message); }
    const w0 = this.win, r = draw0.apply(this, arguments);
    if (this.win !== w0) { VP.deUnaVez++; ev('deUnaVez', { antes: !!w0, job: !!job, k: job ? job.k : -1 }); job = null; }   /* llegó al borde antes: se armó de una vez, como antes */
    return r;
  };
})();
