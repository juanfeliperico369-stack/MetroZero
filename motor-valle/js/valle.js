/* =====================================================================
   MOTOR DEL VALLE 1.1.0 · Interfaz compartida (MAP, VC, G3)
   Expone las funciones y consultas del motor del Valle de Aburrá compartidas
   entre El Metro (src/js/10-map.js, 11-ciudad2.js, 11-puentes.js, 11-edificios.js, 22-gl.js)
   y Juega EnCicla (motor-valle/MOTOR.md):
   · MAP.elevM(x, y), MAP.tileM(x, y), MAP.barrioAt(x, y), MAP.comunaAt(x, y), MAP.muniAt(x, y), MAP.calleAt(x, y)
   · VC.solid(x, y, r), VC.agarre(x, y), VC.despeja(x, y, r, calle, R), VC.camaraLibre(x0, y0, tx, ty, z0),
     VC.puenteEn(x, y, z, m), VC.tapado(x, y), VC.drawTop(g, W, H, mx, my, k, night), VC.piso3D(X0, Y0, S, sc)
   · G3.init(), G3.draw(cam, opts), G3.toScreen(x, y, z, W, H), G3.vehicle(x, z, y, a, len, kind, c)
   ===================================================================== */
const MotorValle = (typeof EM !== 'undefined' ? (EM.motorValle = {
  version: '1.1.0',
  get map() { return typeof MAP !== 'undefined' ? MAP : null; },
  get vcity() { return typeof VC !== 'undefined' ? VC : null; },
  get g3() { return typeof G3 !== 'undefined' ? G3 : null; }
}) : { version: '1.1.0' });
