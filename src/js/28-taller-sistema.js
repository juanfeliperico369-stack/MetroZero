/* =====================================================================
   EL SISTEMA EN 3D (3.0) · trenes de las líneas A y B, tranvía, cabinas de los cables y articulados de Metroplús, con la paleta
   oficial de cada línea (el color de NET.lines). Usa la malla del taller de arte (28-taller-00.js: X al frente, Y arriba, Z al
   costado, medidas en metros) y se sube una sola vez por clase y color (EM.taller.malla). Si no hay taller o no hay WebGL, el juego
   sigue con sus cajas de siempre (G3.vehicle): es el respaldo procedural.
   - Vagón del metro: 22 m, plateado, banda de ventanas, franja del color de la línea, cuatro puertas dobles por lado, techo con
     equipos y, en los vagones de punta, frente con parabrisas y faros; el pantógrafo va sobre el primer vagón.
   - Tranvía (neumático guiado por un riel central, como el de Ayacucho): blanco con su verde, ventanas grandes y pantógrafo.
   - Cabina de cable: del color de la línea, ventanas alrededor, techo, brazo y pinza.
   - Articulado de Metroplús: dos cuerpos (el de adelante con parabrisas) del color de su línea, con techo claro.
   Chispas del pantógrafo: con lluvia o de noche, la catenaria chispea de vez en cuando (todo público: nada de explosiones).
   ===================================================================== */
(() => {
  const T = EM.taller; if (!T) return;
  const PLATA = '#e4e7ea', FALDA = '#5b6168', VIDRIO = '#1d2833', TECHO = '#cfd3d8', OSCURO = '#2b2f36', METAL = '#9aa1a8', FARO = '#fff3c4';
  T.sistema = (clase, color = '#1f63ad', op = {}) => {
    const m = new T.Malla(), b = (...a) => m.caja(...a);
    if (clase === 'metro') {
      const L = op.largo || 22, W = 3, s2 = W / 2;
      for (const u of [-L * .33, L * .33]) b(u, .05, 0, 2.8, .5, 2.4, OSCURO);   // bogies
      b(0, .55, 0, L, .5, W, FALDA); b(0, 1.05, 0, L, 2.15, W, PLATA);
      for (const s of [-1, 1]) {
        b(0, 1.88, s * (s2 + .01), L * .92, .95, .02, VIDRIO);   // banda de ventanas
        b(0, 1.5, s * (s2 + .015), L, .24, .02, color);          // franja de la línea
        for (const u of [-L * .37, -L * .12, L * .12, L * .37]) { b(u, 1.05, s * (s2 + .02), 1.35, 1.95, .02, '#c3c8cd'); b(u, 1.86, s * (s2 + .028), 1.12, .82, .02, '#26323d'); }
      }
      b(0, 3.2, 0, L * .98, .2, W * .9, TECHO); b(-L * .2, 3.4, 0, 2.4, .32, 1.6, '#b9bec4'); b(L * .05, 3.4, 0, 1.6, .26, 1.4, '#b9bec4');
      if (op.panto) { b(L * .3, 3.4, 0, 1.3, .14, 1.3, '#3b3f45'); m.barra([L * .3 - .5, 3.55, 0], [L * .3 + .55, 4.45, 0], .045, METAL); m.barra([L * .3 + .55, 4.45, 0], [L * .3 - .25, 5.05, 0], .04, METAL); m.barra([L * .3 - .25, 5.05, -.85], [L * .3 - .25, 5.05, .85], .045, '#3b3f45'); }
      for (const f of op.puntas || []) {   // f = 1 adelante (+X), -1 atrás
        const x = f * (L / 2 + .02); m.cara(f > 0 ? [[x, 1.85, -1.2], [x, 1.85, 1.2], [x, 2.95, 1.1], [x, 2.95, -1.1]] : [[x, 1.85, 1.2], [x, 1.85, -1.2], [x, 2.95, -1.1], [x, 2.95, 1.1]], VIDRIO);
        b(f * (L / 2 + .01), 1.3, 0, .04, .3, W * .96, color); for (const z of [-1.05, 1.05]) b(f * (L / 2 + .03), 1.05, z, .04, .18, .32, FARO, true);
      }
    } else if (clase === 'tranvia') {
      const L = op.largo || 19.5, W = 2.4;
      for (const u of [-L * .3, L * .3]) b(u, .05, 0, 1.8, .4, 2, OSCURO);
      b(0, .35, 0, L, .55, W, color); b(0, .9, 0, L, 2.05, W, '#f3f4f5');
      for (const s of [-1, 1]) { b(0, 1.25, s * (W / 2 + .01), L * .94, 1.3, .02, VIDRIO); for (const u of [-L * .25, L * .25]) b(u, .9, s * (W / 2 + .02), 1.3, 1.9, .02, color); }
      b(0, 2.95, 0, L * .97, .18, W * .9, TECHO); b(0, 3.1, 0, L * .4, .3, 1.5, '#b9bec4');
      if (op.panto) { m.barra([L * .1 - .4, 3.4, 0], [L * .1 + .5, 4.1, 0], .04, METAL); m.barra([L * .1 + .5, 4.1, 0], [L * .1 - .2, 4.6, 0], .035, METAL); m.barra([L * .1 - .2, 4.6, -.7], [L * .1 - .2, 4.6, .7], .04, '#3b3f45'); }
      for (const f of op.puntas || []) { const x = f * (L / 2 + .02); m.cara(f > 0 ? [[x, 1.25, -1.05], [x, 1.25, 1.05], [x, 2.6, .95], [x, 2.6, -.95]] : [[x, 1.25, 1.05], [x, 1.25, -1.05], [x, 2.6, -.95], [x, 2.6, .95]], VIDRIO); for (const z of [-.9, .9]) b(f * (L / 2 + .03), .75, z, .04, .16, .28, FARO, true); }
    } else if (clase === 'cabina') {
      b(0, 0, 0, 2.3, .35, 2, color); b(0, .35, 0, 2.3, .55, 2, color);
      for (const s of [-1, 1]) { b(0, .9, s * 1.01, 2.1, .9, .02, VIDRIO); b(s * 1.16, .9, 0, .02, .9, 1.8, VIDRIO); }
      b(0, 1.8, 0, 2.3, .3, 2, color); b(0, 2.1, 0, 1.8, .14, 1.5, TECHO);
      m.barra([0, 2.24, 0], [0, 3.7, 0], .07, METAL); b(0, 3.7, 0, .7, .35, .5, '#3b3f45');
    } else if (clase === 'brtF' || clase === 'brtR') {
      const L = op.largo || (clase === 'brtF' ? 11.3 : 6.4), W = 2.55;
      for (const u of clase === 'brtF' ? [L * .3, -L * .25] : [-L * .2]) for (const s of [-1, 1]) m.barra([u, .48, s * 1.05], [u, .48, s * 1.28], .48, OSCURO, 10);
      b(0, .3, 0, L, .9, W, color); b(0, 1.2, 0, L, 1.2, W, color);
      for (const s of [-1, 1]) { b(0, 1.3, s * (W / 2 + .01), L * .9, 1, .02, VIDRIO); b(clase === 'brtF' ? L * .1 : 0, .35, s * (W / 2 + .02), 1.2, 2.1, .02, '#c3c8cd'); }
      b(0, 2.4, 0, L * .98, .28, W * .94, '#f1f3f4');
      if (clase === 'brtF') { const x = L / 2 + .02; m.cara([[x, 1.15, -1.15], [x, 1.15, 1.15], [x, 2.35, 1.1], [x, 2.35, -1.1]], VIDRIO); for (const z of [-1, 1]) b(L / 2 + .03, .7, z, .04, .18, .3, FARO, true); }
    } else if (clase === 'bus') {   // 3.1 · bus alimentador: la mitad de abajo del color de su ruta, blanco arriba, ventanas y parabrisas
      const L = op.largo || 10.5, W = 2.5;
      for (const u of [L * .3, -L * .28]) for (const s of [-1, 1]) m.barra([u, .45, s * 1.02], [u, .45, s * 1.26], .45, OSCURO, 10);
      b(0, .3, 0, L, 1, W, color); b(0, 1.3, 0, L, 1.35, W, '#f3f4f5');
      for (const s of [-1, 1]) { b(-L * .04, 1.4, s * (W / 2 + .01), L * .82, .95, .02, VIDRIO); b(L * .38, .35, s * (W / 2 + .02), 1.1, 2.1, .02, '#c3c8cd'); }
      b(0, 2.65, 0, L * .97, .2, W * .92, TECHO);
      const x = L / 2 + .02; m.cara([[x, 1.2, -1.12], [x, 1.2, 1.12], [x, 2.5, 1.08], [x, 2.5, -1.08]], VIDRIO); for (const z of [-1, 1]) b(L / 2 + .03, .65, z, .04, .18, .3, FARO, true);
    } else throw Error('Clase del sistema desconocida: ' + clase);
    return m;
  };
  /* dibuja una pieza del sistema en el mundo (cacheada por clase, color y variante); false si no se pudo (el llamador usa su respaldo) */
  T.dibujaSistema = (clase, color, x, z, y, a, op = {}) => {
    if (!T.malla || !EM.g3 || !EM.g3.gl) return false;
    const clave = 'sis:' + clase + ':' + color + ':' + (op.largo || '') + ':' + (op.panto ? 'p' : '') + (op.puntas || []).join(',');
    const buf = T.malla(clave, () => T.sistema(clase, color, op)); if (!buf) return false;
    T.mundo(buf, x, z, y, a); return true;
  };
  /* chispa del pantógrafo: un destello azul blanco en el hilo de contacto, de vez en cuando (más con lluvia) */
  T.chispa = (x, z, y, a, t, lluvia) => {
    const p = (lluvia > .2 ? .16 : .05), r = Math.sin(t * 37.1 + x * .31) * .5 + .5; if (r > p * 2.2) return;
    const buf = T.malla && T.malla('chispa', () => { const m = new T.Malla(); m.caja(0, 0, 0, .35, .35, .35, '#d8ecff', true); m.caja(0, .1, 0, .7, .08, .08, '#ffffff', true); return m; });
    if (buf) T.mundo(buf, x, z, y, a + t * 9);
  };
})();
