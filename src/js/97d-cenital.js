/* =====================================================================
   97d · EL CENITAL NUEVO (renacimiento cenital, Fase 2 · Claude, 24‑nov‑2026)
   Solo en Ciudad Libre y Bus, detrás de una bandera (decisión 4 del autor). Los demás modos que dibujan la misma ciudad
   (Conducir, Volante, Carrera, Metrocable, el mapa y el álbum) siguen con el render de siempre: este archivo solo envuelve
   funciones y mira la bandera, que vive mientras dibujan Ciudad Libre o Bus.
   La bandera: Ajustes → «🛰 Cenital nuevo», `?cenital` (o `?cenital=0`) en la dirección, o EM.cenital.forzar en las pruebas.
   Desde la 3.9.0 (Fase 3) viene encendida (PREDETERMINADA = 1); en la Fase 2 venía apagada. Guardado: Save.d.settings.cenital (1 o 0; sin el
   campo, la predeterminada), así que el guardado elmetro.v1 no cambia.
   Con la bandera:
   1. Occluder fade (3D): lo que tapa al jugador (edificios, árboles, marquesinas) baja a 0,30 con un tramado 4 × 4, en un cono
      de la cámara al jugador. Los tableros de los puentes y del viaducto no se esconden nunca: el jugador se ve debajo con su
      silueta (se pinta donde algo lo tapa). En 2D, el edificio que te tapa baja a 0,30 (la silueta ya existía).
   2. Anillo lejano (3D): de 700 a 1.100 m, los edificios reales simplificados en vez de las cajas de relleno por casilla de 20 m
      (el 14,9 % de esas cajas tocaba una calle). Sin datos de edificios, queda el relleno de siempre.
   3. Zócalos (3D): si el suelo baja desde el centro hacia una esquina, los muros siguen hasta zBase = suelo del centro −
      max(6 m, lo que baja + 0,8), con un color de base. Ninguna casa flota en la ladera.
   4. Terreno facetado (3D): normales planas (con las derivadas de la pantalla) y bandas de cota de 12 m, en lo rural y en las
      laderas altas (sobre 1.580 m). En lo urbano plano queda el piso suave con sus calles.
   5. Sombra de contacto: una elipse oscura bajo cada vehículo, bici y persona, en 2D y en 3D (en 3D, en un solo dibujo).
   6. Bruma en el 12 % de arriba de la pantalla, con el color de la neblina de la hora (una capa CSS: no cuesta por cuadro).
   7. Cámara: 1 − e^(−k·dt) en vez de min(1, dt·k) en 2D, y en el ojo de las vistas 3D (que se movía una fracción fija por cuadro):
      a 60 cuadros por segundo es la misma; a 20 ya no se queda atrás.
   ===================================================================== */
(function () {
  if (typeof G3 === 'undefined' || typeof Libre === 'undefined' || typeof Bus === 'undefined' || typeof MB === 'undefined') return;
  const PREDETERMINADA = 1;   // Fase 3 (3.9.0): encendida en Ciudad Libre y Bus; Ajustes → «🛰 Cenital nuevo» la apaga
  const S = () => (Save.d && Save.d.settings) || {};
  const URL_ON = typeof location !== 'undefined' ? (/[?&]cenital=0\b/.test(location.search) ? 0 : /[?&]cenital\b/.test(location.search) ? 1 : null) : null;
  const CEN = EM.cenital = {
    activo: false, forzar: null, st: null, M: null, _ojo: null,
    n: { ventanas: 0, relleno: 0, reales: 0, anillo: 0, zocalos: 0, sombras: 0 },
    encendida() { if (this.forzar != null) return !!this.forzar; if (URL_ON != null) return !!URL_ON; const v = S().cenital; return v == null ? !!PREDETERMINADA : v === 1; },
    /* el piso de la malla cercana en (x, y), exacto (la misma triangulación de 40 m de buildNear), con su pendiente */
    piso(x, y) {
      const W = G3.win; if (!W) return [MAP.elevM(x, y), 0, 0];
      const fx = (x - W.x0) / 40, fz = (y - W.z0) / 40, i = Math.floor(fx), j = Math.floor(fz); if (i < 0 || j < 0 || i >= W.s / 40 || j >= W.s / 40) return [MAP.elevM(x, y), 0, 0];
      const u = fx - i, v = fz - j, X = W.x0 + i * 40, Z = W.z0 + j * 40, a = MAP.elevM(X, Z), c = MAP.elevM(X + 40, Z + 40);
      if (u >= v) { const b = MAP.elevM(X + 40, Z); return [a + (b - a) * u + (c - b) * v, (b - a) / 40, (c - b) / 40]; }
      const d = MAP.elevM(X, Z + 40); return [a + (d - a) * v + (c - d) * u, (c - d) / 40, (d - a) / 40];
    },
    /* el cono del occluder fade: el jugador (x, altura, y) y su radio; 0 = apagado (primera persona) */
    oclusor(st) {
      if (!st || st.vista3 === '1p') return [0, 0, 0, 0];
      const z = Libre.alto3(st) + (st.jumpY || 0), V = st.mode === 'veh' ? Libre.V(st) : null, cen = st.vista3 === 'cen3d', dron = st.vista3 === 'dron';
      /* el radio en el jugador: en la cenital se abre la calle alrededor (5,5 m a pie; los techos de las estaciones se abren aparte); de cerca (3.ª persona, cine), lo justo */
      const r = st.mode === 'ride' ? (cen || dron ? 9 : 7) : V ? Math.max(cen || dron ? 6.5 : 3.6, V.len * .6 + (cen || dron ? 2.5 : 1.6)) : cen || dron ? 5.5 : 3.4;
      return [st.x, z + (st.mode === 'ride' ? 1.2 : 1), st.y, r];
    },
    /* 2D: ¿el edificio b tapa al jugador? (la misma caja en pantalla de VC.ocluir) */
    tapa(b) {
      const st = this.st; if (!st || st.mode === 'ride' || st.z > 0 || b.ym <= st.y + .2) return false;
      const ob = VC.ob, V = Libre.V(st), er = st.mode === 'veh' && V ? V.len / 2 : .6, top = st.y - (st.mode === 'veh' ? 1.6 : 1.8) * ob, up = b.h * ob;
      const r = b.P ? Math.hypot(b.hw, b.hd) : Math.abs(b.ux) * b.hw + Math.abs(b.uy) * b.hd, ry = b.P ? r : Math.abs(b.uy) * b.hw + Math.abs(b.ux) * b.hd;
      return !(st.x + er < b.x - r || st.x - er > b.x + r || st.y < b.y - ry - up || top > b.ym);
    },
    /* bruma en el 12 % de arriba, con el color de la neblina de la hora: una capa CSS sobre los lienzos y debajo de la interfaz
       (z-index 1; la barra y los controles van en 3), así no cuesta nada por cuadro ni en 2D ni en 3D */
    bruma(on) {
      if (EM.headless || typeof document === 'undefined') return; let d = this._bd;
      if (!d) { if (!on) return; const cv = document.getElementById('gcv'); if (!cv) return; d = this._bd = document.createElement('div'); d.id = 'cenBruma'; d.setAttribute('aria-hidden', 'true'); d.style.cssText = 'position:absolute;left:0;right:0;top:0;height:12%;pointer-events:none;z-index:1;display:none'; cv.after(d); }
      if (!on) { if (d.style.display !== 'none') d.style.display = 'none'; return; }
      const t = now(); if (t - (this._bt || 0) > 2 || d.style.display === 'none') { this._bt = t; const C = SKY.at(Mundo.hour()).fog.map(v => Math.round(v * 255)).join(','), bg = `linear-gradient(rgba(${C},.5),rgba(${C},.18) 50%,rgba(${C},0))`; if (this._bg !== bg) { d.style.background = bg; this._bg = bg; } d.style.display = 'block'; }
    },
    /* cámara 3D: el ojo se movía una fracción fija por cuadro (f); ahora 1 − (1 − f)^(60·dt), igual a 60 cuadros por segundo */
    ojo(cam) {
      const o = this._ojo; this._ojo = null; if (!o || !o.e0 || !o.st._ec) return; const st = o.st, v = st.vista3; if (v !== 'cen3d' && v !== '3p' && v !== 'dron') return;
      const f = v === 'cen3d' ? (st.camLibre ? .35 : .18) : v === 'dron' ? .08 : .25, E = st._ec, dx = E.x - o.e0.x, dy = E.y - o.e0.y, dz = E.z - o.e0.z;
      if (Math.hypot(dx, dy) > (v === 'cen3d' ? 350 : 300) * f / (1 - f) * 1.01) return;   // fue un salto (la vista se reubicó de una): se queda
      const q = (1 - Math.pow(1 - f, clamp(o.dt, 0, .25) * 60)) / f;
      E.x = o.e0.x + dx * q; E.y = o.e0.y + dy * q; E.z = o.e0.z + dz * q; cam.eye[0] = E.x; cam.eye[1] = E.z; cam.eye[2] = E.y;
    }
  };

  /* ---------- la bandera vive solo mientras dibujan Ciudad Libre o Bus ---------- */
  for (const M of [Libre, Bus]) {
    const d0 = M.draw;
    M.draw = function (g, st, vp) { CEN.activo = CEN.encendida(); CEN.st = st; CEN.M = M; CEN.bruma(CEN.activo); try { return d0.call(this, g, st, vp); } finally { CEN.activo = false; CEN.st = null; CEN.M = null; } };
    /* 7 · cámara 2D: el paso de siempre hace c += (meta − c)·min(1, dt·k); aquí ese mismo paso se lleva a 1 − e^(−k·dt) */
    const s0 = M.step;
    M.step = function (st, dt) {
      const c0 = dt > 0 && st && st.cam && !st.camLibre && CEN.encendida() ? [st.cam.x, st.cam.y, st.cam.k] : null, r = s0.apply(this, arguments);
      if (c0 && !st.camLibre) for (let i = 0; i < 3; i++) { const p = 'xyk'[i], kk = i < 2 ? 4 : 2, d = st.cam[p] - c0[i], m = Math.min(1, dt * kk); if (!d || !m || (i < 2 && Math.abs(d) > 60)) continue; st.cam[p] = c0[i] + d * (1 - Math.exp(-dt * kk)) / m; }
      return r;
    };
  }

  /* ---------- 3D: el programa del cenital (el sombreado de siempre más el tramado, las facetas, las bandas y las sombras) ---------- */
  const BAYER = 'float B2(vec2 a){a=floor(a);return fract(dot(a,vec2(.5,a.y*.75)));}float B4(vec2 a){return B2(.5*a)*.25+B2(a);}';
  /* lo que se puede desvanecer: k terminado en ,25 (edificios, zócalos, árboles e hitos), en un cono de la cámara al jugador; k terminado
     en ,4 (techos y muros de las estaciones de metro, tranvía, cable y Metroplús), además todo lo que quede más de 1,6 m sobre tu cabeza
     a menos de 30 m: el techo de la estación se abre entero. Los tableros de los puentes y del viaducto van con k 0: nunca */
  const DESV = 'if(uOc.w>0.&&vk<1.9){float fk=fract(vk);if(fk>.2&&fk<.45){vec3 ab=camPos-uOc.xyz;vec3 ap=wp-uOc.xyz;float fo=0.;float tt=dot(ap,ab)/dot(ab,ab);if(tt>0.&&tt<1.){float rr=uOc.w*(1.-tt);fo=1.-smoothstep(rr*.5,rr,length(ap-ab*tt));}if(fk>.32)fo=max(fo,step(1.6,ap.y)*(1.-smoothstep(26.,34.,length(ap.xz))));if(fo>0.&&B4(gl_FragCoord.xy)>=1.-.7*fo)discard;}}';
  /* k 5: sombra de contacto (vc.r: de 1 en el centro a 0 en el borde; vc.g: lo oscura que es) */
  const SOMB = 'if(vk>4.5){float s=clamp(vc.r,0.,1.);float fg0=clamp(1.-exp(-vd*fogd),0.,1.);gl_FragColor=vec4(.035,.045,.07,s*s*(3.-2.*s)*vc.g*(1.-fg0));return;}';
  const FACETA = 'float wF=0.;if(uFac>0.&&vk>=2.&&vk<3.){vec3 Nf=normalize(cross(dFdx(wp),dFdy(wp)));if(Nf.y<0.)Nf=-Nf;wF=uFac*max(1.-smoothstep(.1,.42,vk-2.),smoothstep(.05,.13,1.-N.y)*smoothstep(1580.,1720.,wp.y));N=normalize(mix(N,Nf,wF));}';
  const BANDAS = 'if(wF>0.){float bz=wp.y/12.;float fb=fract(bz);float lw=max(fwidth(bz)*1.2,.002);float lin=1.-smoothstep(0.,lw,min(fb,1.-fb));float tono=mix(1.,.955,step(.5,fract(floor(bz)*.5)));base*=mix(1.,tono*(1.-.15*lin),wF*(1.-smoothstep(600.,1600.,vd)));}';
  function fuente(der) {
    let f = FS; const R = (a, b) => { if (f.indexOf(a) < 0) throw new Error('el sombreado de 22-gl.js cambió (' + a.slice(0, 28) + ')'); f = f.replace(a, b); };
    R('uniform float uReal;', 'uniform float uReal;uniform vec4 uOc;uniform float uFac;');
    R('float h(vec2 q)', BAYER + 'float h(vec2 q)');
    R('void main(){vec3 base=mix(vc,tint.rgb,tint.a);', 'void main(){' + DESV + SOMB + 'vec3 base=mix(vc,tint.rgb,tint.a);');
    if (der) { R('vec3 N=normalize(vn);vec3 V=normalize(camPos-wp);', 'vec3 N=normalize(vn);vec3 V=normalize(camPos-wp);' + FACETA); R('base*=fino*mancha;}}', 'base*=fino*mancha;}}' + BANDAS); f = '#extension GL_OES_standard_derivatives : enable\n' + f; }
    return f;
  }
  function compila() {
    if (CEN._P !== undefined) return CEN._P; CEN._P = null;
    const gl = G3.gl, P0 = G3.P; if (!gl || !P0) return null;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
    for (const der of gl.getExtension('OES_standard_derivatives') ? [true, false] : [false]) {
      try {
        const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fuente(der)));
        for (const n of ['p', 'n', 'c', 'k']) if (P0.a[n] >= 0) gl.bindAttribLocation(p, P0.a[n], n);   // los mismos lugares que el programa de siempre
        gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
        const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i = 0; i < n; i++) { const q = gl.getActiveUniform(p, i); u[q.name] = gl.getUniformLocation(p, q.name); }
        return (CEN._P = { p, u, der, a: { p: gl.getAttribLocation(p, 'p'), n: gl.getAttribLocation(p, 'n'), c: gl.getAttribLocation(p, 'c'), k: gl.getAttribLocation(p, 'k') } });
      } catch (e) { EM.errors.push('cenital 3D' + (der ? ' (facetas)' : '') + ': ' + e.message); }
    }
    return null;
  }

  /* ---------- 2 y 3 · la ventana cercana: edificios reales hasta 1.100 m, con zócalos, y lo que tapa marcado para desvanecerse ---------- */
  class MBF extends MB { v(x, y, z, nx, ny, nz, c, k) { super.v(x, y, z, nx, ny, nz, c, this.f && k < 2 ? k + .25 : k); } }
  const zocC = new Map(), zocalo = c => { const k = c.join(); let z = zocC.get(k); if (!z) zocC.set(k, z = [c[0] * .58 + .07, c[1] * .56 + .065, c[2] * .53 + .06]); return z; };
  function muros(bm, x, z, a, L, W, y0, y1, c) {   // los cuatro muros de una caja, sin tapas (el zócalo queda debajo de la casa)
    const ca = Math.cos(a), sa = Math.sin(a), l = L / 2, w = W / 2, P = (u, v, h) => [x + ca * u - sa * v, h, z + sa * u + ca * v];
    const b = [P(-l, -w, y0), P(l, -w, y0), P(l, w, y0), P(-l, w, y0)], t = [P(-l, -w, y1), P(l, -w, y1), P(l, w, y1), P(-l, w, y1)];
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; bm.quad(b[j], b[i], t[i], t[j], c, 0); }
  }
  /* como G3.edifReales (22-gl.js), con zócalos y con el anillo exterior hasta R2 */
  function edifCen(bm, cx, cz, R, R2) {
    const RG = VC.R, Rmax = Math.max(R, R2), R2sq = Rmax * Rmax, Rsq = R * R, cols = new Map(), C = h => { let c = cols.get(h); if (!c) cols.set(h, c = rgb(h)); return c; }, E = MAP.elevM.bind(MAP);
    for (let ry = Math.floor((cz - Rmax) / RG); ry <= Math.floor((cz + Rmax) / RG); ry++) for (let rx = Math.floor((cx - Rmax) / RG); rx <= Math.floor((cx + Rmax) / RG); rx++) {
      const Rg = VC.reg.get(rx * 4096 + ry), L = Rg ? Rg.bs : VC.edifDe(rx, ry);
      for (const b of L) {
        const d2 = (b.x - cx) ** 2 + (b.y - cz) ** 2;
        if (b.rec === false || d2 > R2sq || (d2 > Rsq && b.h < 5.5)) continue;
        if (!Rg && b.rec === undefined && VC.enSegs(VC.segsCerca(b.x, b.y, 1), b.x, b.y)) continue;
        VC.estilo(b); const y0 = E(b.x, b.y), y = y0 - 1.2, a = Math.atan2(b.uy, b.ux), Lx = b.hw * 2, Wz = b.hd * 2, H = Math.max(2.6, b.h) + 1.2;
        const cw = C(b.cw && b.cw[0] === '#' ? b.cw : '#d9d2c3'), cr = C(b.cr && b.cr[0] === '#' ? b.cr : '#b4583a');
        bm.box(b.x, y, b.y, a, Lx, Wz, H, cw, cr, 1, 0); CEN.n.reales++; if (d2 > Rsq) CEN.n.anillo++;
        // zócalo: el suelo de cada esquina con el relieve del juego; si baja más de 0,6 m desde el centro, los muros siguen hasta zBase
        const ex = b.ux * b.hw, ey = b.uy * b.hw, fx = -b.uy * b.hd, fy = b.ux * b.hd;
        const baja = y0 - Math.min(E(b.x + ex + fx, b.y + ey + fy), E(b.x + ex - fx, b.y + ey - fy), E(b.x - ex + fx, b.y - ey + fy), E(b.x - ex - fx, b.y - ey - fy));
        if (baja > .6) { muros(bm, b.x, b.y, a, Lx, Wz, y0 - Math.max(6, baja + .8), y + .05, zocalo(cw)); CEN.n.zocalos++; }
        if (d2 > Rsq) continue;   // anillo exterior: caja limpia
        const yt = y + H, tq = h2(b.x | 0, b.y | 0, 41);
        if (b.rt === 'teja' && b.h < 11 && Lx < 22 && Wz < 22) bm.roof(b.x, yt, b.y, a, Lx * .94, Wz * .94, Math.min(2.1, Math.min(Lx, Wz) * .26), cr);
        else if (b.h < 12 && b.z === 'ladera' && (b.rt === 'plancha' || b.rt === 'azotea') && tq < .55 && Lx >= 4.5 && Wz >= 4.5) { const tc = tq < .2 ? [.16, .34, .58] : [.18, .19, .22]; bm.box(b.x + b.ux * Lx * .22, yt, b.y + b.uy * Lx * .22, a, .95, .95, 1.15, tc, tc, 0, 0); }
        else if (b.h >= 26) { bm.box(b.x, yt - .15, b.y, a, Lx + .45, Wz + .45, .55, cr, cr, 0, 0); bm.box(b.x, yt + .4, b.y, a, Lx * .62, Wz * .62, 2.8, cw, cr, 1, 0); if (b.h >= 42) bm.box(b.x, yt + 3.2, b.y, 0, .5, .5, 4.5, [.92, .2, .18], [.92, .2, .18], 4, 4); }
        else if (b.h >= 12 && d2 < Rsq * .55) bm.box(b.x, yt - .1, b.y, a, Lx + .3, Wz + .3, .45, cr, cr, 0, 0);
      }
    }
  }
  const ec0 = G3.edifCerca;
  G3.edifCerca = function (cx, cz, real) {
    if (!CEN.activo || !real || !VC.ED) { if (CEN.activo) CEN.n.relleno++; return ec0.call(this, cx, cz, real); }
    const low = S().q === 'low' || this.liviano, R = low ? 600 : 1100, RR = low ? 380 : 700, bm = new MBF(); CEN.n.reales = CEN.n.anillo = CEN.n.zocalos = 0;
    bm.f = 1; edifCen(bm, cx, cz, RR, R); this.hitos3D(bm, cx, cz, R);
    bm.f = 0; this.puentes3D(bm, cx, cz, RR);   // los tableros no se desvanecen
    bm.f = 1; this.arboles3D(bm, cx, cz, low); bm.f = 0;
    return bm;
  };
  const bn0 = G3.buildNear;
  G3.buildNear = function () { const r = bn0.apply(this, arguments); if (this.win) { this.win.cen = !!CEN.activo; if (CEN.activo) CEN.n.ventanas++; } return r; };

  /* ---------- el dibujo 3D: la ventana del cenital, el programa, el cono y el ojo ---------- */
  const draw0 = G3.draw;
  G3.draw = function (cam, opts) {
    if (!CEN.activo || !this.ok) { if (this.win && this.win.cen) this.win = null; return draw0.apply(this, arguments); }   // la ventana se rearma como siempre
    if (this.win && !this.win.cen) this.win = null;
    CEN.ojo(cam);
    const P = compila(), P0 = this.P;
    if (P) { const gl = this.gl; gl.useProgram(P.p); gl.uniform4fv(P.u.uOc, CEN.oclusor(CEN.st)); if (P.u.uFac) gl.uniform1f(P.u.uFac, S().q === 'low' || G3.simple ? 0 : 1); this.P = P; }
    CEN._cam = cam;
    try { return draw0.apply(this, arguments); } finally { this.P = P0; }
  };
  const d3 = Libre.draw3D;
  Libre.draw3D = function (g, st, vp) {
    if (CEN.activo) { const t = now(); CEN._ojo = { st, e0: st._ec ? { x: st._ec.x, y: st._ec.y, z: st._ec.z } : null, dt: st._cenT ? t - st._cenT : 0 }; st._cenT = t; }
    try { return d3.call(this, g, st, vp); } finally { CEN._ojo = null; }
  };
  const box0 = G3.box;
  G3.box = function (x, y, z, yaw, L, W, H, col, pitch, roll) { return box0.call(this, x, y, z, yaw, L, W, H, CEN.sil || col, pitch, roll); };

  /* 5 · sombras de contacto en 3D: todas en un solo dibujo (elipse de 8 lados, más oscura en el centro), antes que lo dinámico */
  const SEG = 8, MAXO = 420; let VB = null, IB = null, A = null;
  function sombras3D(G, st, zj) {
    const P = G.P; if (!P || !P.u.uOc || !CEN._cam) return; const gl = G.gl;
    if (!VB) { VB = gl.createBuffer(); IB = gl.createBuffer(); A = new Float32Array(MAXO * (SEG + 1) * 10); const I = new Uint16Array(MAXO * SEG * 3); for (let o = 0; o < MAXO; o++) for (let j = 0; j < SEG; j++) { const b = o * (SEG + 1), q = (o * SEG + j) * 3; I[q] = b; I[q + 1] = b + 1 + j; I[q + 2] = b + 1 + (j + 1) % SEG; } gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IB); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, I, gl.STATIC_DRAW); }
    const at = CEN._cam.at, ax = at[0], az = at[2], RV = (st.vista3 === 'cen3d' ? 130 : 110) ** 2; let n = 0;
    /* (x, y): centro; z: altura de la base o null (en el piso: sigue la malla); a: rumbo; L × W: tamaño; al: lo oscura */
    const pon = (x, y, z, a, L, W, al) => {
      if (n >= MAXO || (x - ax) ** 2 + (y - az) ** 2 > RV) return;
      let zc, gx = 0, gz = 0; if (z == null) { const p = CEN.piso(x, y); zc = p[0] + .12; gx = p[1]; gz = p[2]; } else zc = z + .1;
      const ca = Math.cos(a), sa = Math.sin(a), rx = L / 2 * 1.06 + .18, rz = W / 2 * 1.18 + .18; let o = n * (SEG + 1) * 10;
      A[o] = x; A[o + 1] = zc; A[o + 2] = y; A[o + 3] = 0; A[o + 4] = 1; A[o + 5] = 0; A[o + 6] = 1; A[o + 7] = al; A[o + 8] = 0; A[o + 9] = 5; o += 10;
      for (let j = 0; j < SEG; j++) { const t = j / SEG * TAU, ux = Math.cos(t) * rx, uz = Math.sin(t) * rz, dx = ca * ux - sa * uz, dy = sa * ux + ca * uz; A[o] = x + dx; A[o + 1] = zc + gx * dx + gz * dy + .04; A[o + 2] = y + dy; A[o + 3] = 0; A[o + 4] = 1; A[o + 5] = 0; A[o + 6] = 0; A[o + 7] = al; A[o + 8] = 0; A[o + 9] = 5; o += 10; }
      n++;
    };
    const E = (x, y) => MAP.elevM(x, y), suelo = (x, y, z) => Math.abs(z - E(x, y)) < .4 ? null : z;
    for (const k of Ciudad.cars) { const h = VC.PG ? VC.carAlto(k) : 0; pon(k.x, k.y, Math.abs(h) < .4 ? null : E(k.x, k.y) + h, k.a, k.kind === 'bus' ? 12 : k.kind === 'moto' ? 2 : 4.4, k.kind === 'moto' ? .8 : k.kind === 'bus' ? 2.5 : 1.8, .5); }
    for (const p of Ciudad.peds) if (!p.dog) pon(p.x, p.y, null, p.a || 0, .6, .6, .42);
    if (typeof Gente !== 'undefined') for (const p of Gente.todos(st)) pon(p.x, p.y, null, p.a || 0, .6, .6, .42);
    for (const p of st.parked) { const V = VEH[p.kind]; if (V) pon(p.x, p.y, null, p.a, V.len, V.wid, .42); }
    for (const v of Ciudad.transit) { const l = v.line, K = l.kind; if (K === 'metro' || K === 'cable' || K === 'future') continue;
      if (K === 'tram') { for (let i = 0; i < 2; i++) { const s0 = v.s - v.dir * (i * 20.5 + 9.75), q = Ciudad.cuerda(l.P, s0 + v.dir * 6.8, s0 - v.dir * 6.8, v.dir * 2); pon(q.x, q.y, suelo(q.x, q.y, G3.zOn(l, s0)), q.a, 19.5, 2.65, .5); } }
      else if (K === 'brt') { const f = Ciudad.cuerda(l.P, v.s - v.dir * 1.4, v.s - v.dir * 9.9, v.dir * 2.2), r = Ciudad.cuerda(l.P, v.s - v.dir * 12.6, v.s - v.dir * 16.6, v.dir * 2.2); pon(f.x, f.y, null, f.a, 11.3, 2.6, .5); pon(r.x, r.y, null, r.a, 6.4, 2.6, .5); }
      else if (KIND[K]) { const q = Ciudad.cuerda(l.P, v.s - v.dir * 2.4, v.s - v.dir * (KIND[K].len - 2.6), v.dir * 2.2); pon(q.x, q.y, null, q.a, KIND[K].len - 2, 2.5, .5); } }
    if (st.mode !== 'ride') { const V = Libre.V(st), al = (st.mode === 'veh' ? .55 : .5) * clamp(1 - (st.jumpY || 0) / 4, .25, 1); pon(st.x, st.y, suelo(st.x, st.y, zj), st.h, st.mode === 'veh' && V ? V.len : .7, st.mode === 'veh' && V ? V.wid : .7, al); }
    CEN.n.sombras = n; if (!n) return;
    const a = P.a; gl.bindBuffer(gl.ARRAY_BUFFER, VB); gl.bufferData(gl.ARRAY_BUFFER, A.subarray(0, n * (SEG + 1) * 10), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(a.p); gl.vertexAttribPointer(a.p, 3, gl.FLOAT, false, 40, 0); gl.enableVertexAttribArray(a.n); gl.vertexAttribPointer(a.n, 3, gl.FLOAT, false, 40, 12); gl.enableVertexAttribArray(a.c); gl.vertexAttribPointer(a.c, 3, gl.FLOAT, false, 40, 24); gl.enableVertexAttribArray(a.k); gl.vertexAttribPointer(a.k, 1, gl.FLOAT, false, 40, 36);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, IB); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
    gl.drawElements(gl.TRIANGLES, n * SEG * 3, gl.UNSIGNED_SHORT, 0);
    gl.depthMask(true); gl.disable(gl.BLEND);
  }
  /* 1 · tu silueta donde algo te tapa (el tablero de un puente o del viaducto, o lo que el tramado no alcanzó a abrir) */
  function silueta(G, st, zj) {
    if (st.mode === 'ride' || st.vista3 === '1p') return; const gl = G.gl, V = Libre.V(st), z = zj + (st.jumpY || 0), lote = G._eonCollect;
    G._eonCollect = false;   // 22a junta las cajas dinámicas y las pinta al final: la silueta va directo, con su prueba de profundidad
    gl.depthFunc(gl.GREATER); gl.depthMask(false); gl.enable(gl.BLEND); gl.blendColor(0, 0, 0, .6); gl.blendFunc(gl.CONSTANT_ALPHA, gl.ONE_MINUS_CONSTANT_ALPHA); CEN.sil = CEN.colSil || [1, .6, .16];
    try {
      if (st.mode === 'walk' || !V) Libre.persona3(G, st.x, z + .35, st.y, st.h, Perfil.ped(), 1.04, 0);
      else { const kd = st.veh.kind, Hh = V.monta ? .12 : kd === 'bici' ? .8 : kd === 'moto' ? 1.2 : kd === 'alimentador' || kd === 'bus' || V.art ? 2.9 : 1.4; G.box(st.x, z + .4, st.y, st.h, V.len * .96, V.wid * .94, Hh, [1, 1, 1]); if (V.monta || kd === 'bici' || kd === 'moto') Libre.persona3(G, st.x, z + (V.monta ? .3 : .6), st.y, st.h, Perfil.ped(), 1, 0); }
    } finally { CEN.sil = null; G._eonCollect = lote; gl.depthFunc(gl.LESS); gl.depthMask(true); gl.disable(gl.BLEND); }
  }
  const dyn0 = Libre.dyn3D;
  Libre.dyn3D = function (G, st, zj) {
    if (CEN.activo) { try { sombras3D(G, st, zj); silueta(G, st, zj); } catch (e) { CEN.sil = null; if (!CEN._err) { CEN._err = 1; EM.errors.push('cenital 3D: ' + e.message); } } }
    return dyn0.apply(this, arguments);
  };

  /* al salir del modo (o de la partida), la bruma se va con él */
  const stop0 = Game.stop; Game.stop = function () { CEN.bruma(false); return stop0.apply(this, arguments); };

  /* ---------- 2D (Ciudad Libre y Bus): sombras de contacto, el edificio que te tapa y la silueta del bus ---------- */
  const elipse = (g, x, y, rx, ry, a, al) => { const c = g.canvas, m = rx + 4; if (x < -m || y < -m || x > c.width + m || y > c.height + m || rx < 1.6) return; g.fillStyle = 'rgba(10,14,24,' + al + ')'; g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, TAU); g.fill(); };
  const car0 = Ciudad.car, ped0 = Ciudad.ped, art0 = Ciudad.articulado, tabla0 = Libre.tabla;
  Ciudad.car = function (g, x, y, a, len, wid, col, kind, S2, k) { if (CEN.activo && kind !== 'cable') { const q = S2(x, y), vs = k < 2.5 ? 1.25 : 1; elipse(g, q.x, q.y, Math.max(6, len * k * vs) * .56, Math.max(3.5, wid * k * vs) * .64, a, .3); } return car0.apply(this, arguments); };
  Ciudad.ped = function (g, p, S2, k) { if (CEN.activo && !p.dog) { const q = S2(p.x, p.y), s = Math.max(2, k * 1.6); elipse(g, q.x, q.y, s * .62, s * .44, 0, .3); } return ped0.apply(this, arguments); };
  Ciudad.articulado = function (g, x, y, a, a2, V, S2, k) { if (CEN.activo) { const q = S2(x, y), vs = k < 2.5 ? 1.25 : 1; elipse(g, q.x, q.y, Math.max(8, (V.len || 18) * k * vs) * .53, Math.max(3.5, (V.wid || 2.6) * k * vs) * .64, a, .3); } return art0.apply(this, arguments); };
  if (tabla0) Libre.tabla = function (g, q, a, V, k) { if (CEN.activo) elipse(g, q.x, q.y, Math.max(3, V.len * k) * .58, Math.max(2, V.wid * k) * .75, a, .28); return tabla0.apply(this, arguments); };
  const dib0 = VC.dibEdVista;
  VC.dibEdVista = function (g, b) { if (!CEN.activo || !CEN.tapa(b)) return dib0.apply(this, arguments); const a0 = g.globalAlpha; g.globalAlpha = a0 * .3; try { return dib0.apply(this, arguments); } finally { g.globalAlpha = a0; } };
  /* Bus: si vas por debajo del viaducto o de un puente, tu bus se ve a través (como tu silueta en Ciudad Libre) */
  const parts0 = Ciudad.partsDraw;
  Ciudad.partsDraw = function (g, S2, k) {
    const st = CEN.st;
    if (CEN.activo && CEN.M === Bus && st && VC.on && VC.tapado && VC.tapado(st.x, st.y)) {
      let encima = false; if (VC.PG) { const P = VC.puenteEn(st.x, st.y, null, .5); if (P && !P.B.pe) { const u = VC.puAt(P.B, P.s); encima = Math.abs(u.ux * Math.cos(st.h) + u.uy * Math.sin(st.h)) > .86; } }
      if (!encima) { const V = Bus.V(st), sh = Ciudad.shadowDir(), night = Mundo.light().night, x = st.x + Math.cos(st.h) * 2.4, y = st.y + Math.sin(st.h) * 2.4, a0 = g.globalAlpha; g.globalAlpha = a0 * .42;
        try { if (st.kind === 'metroplus') art0.call(Ciudad, g, x, y, st.h, st.h2 == null ? st.h : st.h2, V, S2, k, sh, night, true, { doors: 'left', sign: 1 }); else car0.call(Ciudad, g, x, y, st.h, V.len, V.wid, V.col, 'feeder', S2, k, sh, night, true, { doors: 'right', sign: 1 }); } finally { g.globalAlpha = a0; } }
    }
    return parts0.apply(this, arguments);
  };

  /* ---------- Ajustes: 🛰 Cenital nuevo (Ciudad Libre y Bus) ---------- */
  if (typeof Menu !== 'undefined' && Menu.settings) {
    const set0 = Menu.settings;
    Menu.settings = function () {
      const r = set0.apply(this, arguments), ok = document.getElementById('sOk'); if (!ok || document.getElementById('sCenital')) return r;
      const s = S(), v = CEN.encendida() ? '1' : '0', d = document.createElement('div');
      d.innerHTML = `<div class="pag">🛰 Cenital nuevo · Ciudad Libre y Bus</div><div class="tg" id="sCenital">${[['1', 'Encendido'], ['0', 'Apagado']].map(([k, n]) => `<button data-v="${k}" class="${v === k ? 'on' : ''}">${n}</button>`).join('')}</div>`;
      ok.closest('.row').before(d);
      for (const b of d.querySelectorAll('#sCenital button')) b.onclick = () => { s.cenital = +b.dataset.v; Save.write(); for (const x of d.querySelectorAll('#sCenital button')) x.classList.toggle('on', x === b); };
      return r;
    };
  }
})();
