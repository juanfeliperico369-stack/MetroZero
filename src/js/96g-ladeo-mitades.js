/* =====================================================================
   GA-36-1 Y GA-36-2 · INCLINACIÓN EN CURVAS + PANTALLA EN MITADES EN 3D (Antigravity, 3.7)
   - GA-36-1 (de Motor City 5.2, Cuerpo._ladear): bici, moto, patineta, monopatín, skate y
     patines se inclinan hacia adentro de la curva con φ = clamp(atan(v·ω / 9.81), ±0.45 rad),
     suavizado, girando juntos el vehículo y el piloto en el 3D de Ciudad Libre y el corredor.
     Cero llamadas extra de dibujo y cero vértices nuevos.
   - GA-36-2 (de Motor City 4.8, MC.Controles): pantalla en mitades en el 3D de Ciudad Libre
     (mitad superior = cámara con arrastre, pellizco y doble toque para centrar; mitad inferior
     = manejo/joystick sin soltarse al mover la cámara). Conmutable en Ajustes → ⚙️ Flexibilidad.
   ===================================================================== */
(function () {
  const L = EM.modes.libre, Cr = EM.modes.carrera, T = EM.taller;
  const G_ACC = 9.81, TOPE_RAD = .45, TAU_LADEO = .14;
  const VEH_LADEO = { bici: 1, moto: 1, scooter: 1, skate: 1, monopatin: 1, patines: 1 };
  const angDif = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

  /* ---------- GA-36-1: inclinación física φ = clamp(atan(v·ω/g), ±0.45 rad) ---------- */
  const LD = EM.ladeo = {
    G: G_ACC,
    TOPE: TOPE_RAD,
    VEH: VEH_LADEO,
    _activo: 0,
    _px: 0,
    _py: 0,
    _pz: 0,
    _roll: 0,
    esLadeable(kind) { return !!VEH_LADEO[kind]; },
    objetivo(v, w, enAire) {
      if (enAire || !isFinite(v) || !isFinite(w)) return 0;
      return clamp(Math.atan((v * w) / G_ACC), -TOPE_RAD, TOPE_RAD);
    },
    paso(cur, v, w, dt, enAire) {
      if (!(dt > 0)) return cur || 0;
      const obj = this.objetivo(v, w, enAire);
      const k = 1 - Math.exp(-dt / TAU_LADEO);
      return (cur || 0) + (obj - (cur || 0)) * k;
    }
  };

  /* soporte opcional de alabeo (roll) en EM.taller.mundo sin romper llamadas existentes */
  if (T && T.mundo && !T._conRoll) {
    T._conRoll = 1;
    T.mundo = (buffer, x, altura, z, rumbo, g3, roll) => {
      if (typeof g3 === 'number') { roll = g3; g3 = EM.g3; }
      const G = g3 || EM.g3;
      let r = roll != null ? roll : 0;
      if (!r && LD._activo && Math.abs(x - LD._px) < .05 && Math.abs(z - LD._py) < .05) r = LD._roll;
      const gl = G.gl, u = G.P.u;
      gl.uniformMatrix4fv(u.M, false, M4.trs(x, altura, z, -rumbo, 1, 1, 1, 0, r));
      try { G._run(buffer); } finally { gl.uniformMatrix4fv(u.M, false, G._I); }
    };
  }

  /* manubrio en primera persona con inclinación sutil en curva */
  if (T && T.primera && !T._conLadeo1p) {
    T._conLadeo1p = 1;
    const pr0 = T.primera;
    T.primera = function (g, id, W, H, tilt) {
      const st = typeof Game !== 'undefined' ? Game.st : null;
      const extra = st && isFinite(st.ladeo) ? st.ladeo * .42 : 0;
      return pr0.call(this, g, id, W, H, (tilt || 0) + extra);
    };
  }

  /* piloto en 3D inclinado en bloque rígido junto al vehículo alrededor del punto de apoyo */
  if (L && L.persona3 && !L._personaConRoll) {
    L._personaConRoll = 1;
    const p30 = L.persona3;
    L.persona3 = function (G, x, z, y, a, p, s = 1, paso = 0, rollArg = null, zPivotArg = null) {
      const auto = rollArg == null && LD._activo && Math.abs(x - LD._px) < .05 && Math.abs(y - LD._py) < .05;
      const roll = rollArg != null ? rollArg : (auto ? LD._roll : 0);
      if (Math.abs(roll) <= .003) return p30.call(this, G, x, z, y, a, p, s, paso);
      const zPiv = zPivotArg != null ? zPivotArg : (auto ? LD._pz : z);
      const C = h => this.rgb3(h), b = Math.abs(Math.sin(paso)) * .06 * s, dy0 = z - zPiv;
      const ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca, sr = Math.sin(roll), cr = Math.cos(roll);
      const parte = (dy, atras, len, wid, hi, col) => {
        const lat = dy * sr, up = dy * cr;
        G.box(x + nx * lat - ca * atras, zPiv + up, y + ny * lat - sa * atras, a, len, wid, hi, col, 0, roll);
      };
      parte(dy0, 0, .32 * s, .42 * s, .8 * s, C(p.pants || '#2a3b5c'));
      parte(dy0 + .8 * s + b, 0, .36 * s, .5 * s, .62 * s, C(p.col || '#1C5C9C'));
      parte(dy0 + 1.42 * s + b, 0, .3 * s, .3 * s, .3 * s, C(p.skin || '#e8b98f'));
      if (p.gorro === 2) parte(dy0 + 1.66 * s + b, 0, .62 * s, .62 * s, .07 * s, [.94, .91, .83]);
      else if (p.gorro) parte(dy0 + 1.68 * s + b, 0, .34 * s, .34 * s, .1 * s, C(p.hatCol || '#EC343A'));
      else parte(dy0 + 1.68 * s + b, 0, .31 * s, .31 * s, .06 * s, C(p.hair || '#2a1a10'));
      if (p.acc === 1) parte(dy0 + .95 * s + b, .25 * s, .16 * s, .36 * s, .42 * s, [.17, .18, .22]);
      if (p.acc === 3) parte(dy0 + .78 * s + b, 0, .44 * s, .62 * s, .5 * s, [.54, .51, .45]);
    };
  }

  /* Ciudad Libre: calcula st.ladeo por paso y lo aplica al vehículo + piloto en dyn3D */
  if (L && !L._conLadeo) {
    L._conLadeo = 1;
    const stepL0 = L.step, dynL0 = L.dyn3D;
    L.step = function (st, dt) {
      const h0 = st.h;
      const r = stepL0.apply(this, arguments);
      if (st.mode === 'veh' && st.veh && VEH_LADEO[st.veh.kind] && dt > 0) {
        const w = angDif(h0, st.h) / dt;
        st.ladeo = LD.paso(st.ladeo || 0, st.vf || 0, w, dt, (st.jumpY || 0) > .08);
      } else {
        st.ladeo = LD.paso(st.ladeo || 0, 0, 0, dt, true);
      }
      return r;
    };
    L.dyn3D = function (G, st, zj) {
      const on = st.mode === 'veh' && st.veh && VEH_LADEO[st.veh.kind] && st.vista3 !== '1p' && Math.abs(st.ladeo || 0) > .003;
      if (!on) return dynL0.call(this, G, st, zj);
      const zPiv = zj + (st.jumpY || 0), r = st.ladeo;
      LD._activo = 1; LD._px = st.x; LD._py = st.y; LD._pz = zPiv; LD._roll = r;
      if (this.malla3 && this.malla3(st.veh.kind, 1)) {
        try { return dynL0.call(this, G, st, zj); } finally { LD._activo = 0; }
      }
      const sr = Math.sin(r), cr = Math.cos(r), nx = -Math.sin(st.h), ny = Math.cos(st.h), box0 = G.box;
      /* respaldo de cajas solo cuando el vehículo no tiene malla del taller */
      G.box = function (x, y, z, yaw, len, wid, hi, col, pitch = 0, roll = 0) {
        if (!pitch && !roll && Math.abs(x - st.x) < .75 && Math.abs(z - st.y) < .75 && y >= zPiv - .05 && y <= zPiv + 1.9) {
          const dy = y - zPiv;
          return box0.call(this, x + nx * dy * sr, zPiv + dy * cr, z + ny * dy * sr, yaw, len, wid, hi, col, 0, r);
        }
        return box0.call(this, x, y, z, yaw, len, wid, hi, col, pitch, roll);
      };
      try { return dynL0.call(this, G, st, zj); } finally { G.box = box0; LD._activo = 0; }
    };
  }

  /* Corredor (47-carrera.js + 47b-ciclovia.js): ladeo por curvatura de la ciclorruta y cambio de carril */
  if (Cr && !Cr._conLadeo) {
    Cr._conLadeo = 1;
    const stepC0 = Cr.step, dynC0 = Cr.dyn3D;
    Cr.step = function (st, dt) {
      const r = stepC0.apply(this, arguments);
      if (st && dt > 0 && !st.done) {
        const V = this.V(st);
        if (!V || V.id === 'pie') { st.ladeo = 0; return r; }
        const a1 = this.pos(st, st.s, st.cx).a;
        const a0 = st._aLadeo != null ? st._aLadeo : a1;
        st._aLadeo = a1;
        const wRuta = angDif(a0, a1) / dt;
        const wCarril = clamp((st.c - st.cx) * 2.4, -2.5, 2.5);
        st.ladeo = LD.paso(st.ladeo || 0, st.v || 0, wRuta + wCarril, dt, (st.y || 0) > .08);
      }
      return r;
    };
    Cr.dyn3D = function (G, st, p, z) {
      const V = this.V(st);
      const on = V && V.id !== 'pie' && !st.primera && Math.abs(st.ladeo || 0) > .003;
      if (!on) return dynC0.call(this, G, st, p, z);
      LD._activo = 1; LD._px = p.x; LD._py = p.y; LD._pz = z; LD._roll = st.ladeo;
      try { return dynC0.call(this, G, st, p, z); } finally { LD._activo = 0; }
    };
  }

  /* ---------- GA-36-2: pantalla en mitades en el 3D (de Motor City 4.8) ---------- */
  const MT = EM.mitades = {
    activa(st) {
      const s = Save.d && Save.d.settings;
      if (s && s.pantalla === 'clasica') return false;
      return !st || (!!st.vista3 && !st.camLibre);
    },
    aplicarClase() {
      if (typeof document === 'undefined' || !document.body) return;
      const s = Save.d && Save.d.settings;
      document.body.classList.toggle('pant-clasica', !!(s && s.pantalla === 'clasica'));
    }
  };
  if (typeof document !== 'undefined') setTimeout(() => MT.aplicarClase(), 0);

  if (L && !L._conMitades) {
    L._conMitades = 1;
    const mount0 = L.mount;
    L.mount = function (st, el) {
      MT.aplicarClase();
      const r = mount0.apply(this, arguments);
      const jz = $('#lbJz');
      if (jz) {
        /* registra el pointerId activo del joystick para no soltarlo nunca al mover la cámara */
        jz.addEventListener('pointerdown', e => { st._joyPid = e.pointerId; e.stopPropagation(); });
        const finJ = e => { if (e.pointerId === st._joyPid) st._joyPid = null; };
        jz.addEventListener('pointerup', finJ);
        jz.addEventListener('pointercancel', finJ);
      }
      return r;
    };
    L.camGestos = function (st) {
      const cv = $('#gcv'); if (!cv) return;
      if (this._cg) this._cg();
      const T = new Map();
      let pinch = null, ultToque = null;
      const down = e => {
        if (st._joyPid != null && e.pointerId === st._joyPid) return;
        const r = cv.getBoundingClientRect(), yRel = (e.clientY - r.top) / Math.max(1, r.height);
        /* en mitades: la mitad inferior es para manejar; solo la mitad superior inicia gestos de cámara */
        if (MT.activa(st) && yRel >= .5) return;
        T.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY });
        try { cv.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
        if (T.size === 2) {
          const [a, b] = [...T.values()];
          pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: st.cam.k, z: st.zoomU || 1 };
        }
      };
      const move = e => {
        if (st._joyPid != null && e.pointerId === st._joyPid) return;
        const q = T.get(e.pointerId); if (!q) return;
        const nx = e.clientX, ny = e.clientY;
        if (T.size >= 2 && pinch) {
          q.x = nx; q.y = ny;
          const [a, b] = [...T.values()], f = Math.hypot(a.x - b.x, a.y - b.y) / Math.max(12, pinch.d);
          if (st.camLibre && !st.vista3) st.cam.k = clamp(pinch.k * f, .12, 7);
          else st.zoomU = clamp(pinch.z * f, .35, 3.2);
          return;
        }
        if (st.vista3 === 'cen3d' && T.size === 1) {
          if (st.camLibre) { const sc = .35 / clamp(st.zoomU || 1, .35, 3.2); st.cam.x -= (nx - q.x) * sc; st.cam.y -= (ny - q.y) * sc; }
          else { st.cpo = clamp((st.cpo || 0) + (ny - q.y) * .003, -.35, .45); }
          q.x = nx; q.y = ny; return;
        }
        if (st.vista3 && T.size === 1) {
          st.cyo = (st.cyo || 0) - (nx - q.x) * .006;
          st.cpo = clamp((st.cpo || 0) + (ny - q.y) * .004, -.45, .9);
          q.x = nx; q.y = ny; return;
        }
        if (st.camLibre && T.size === 1) { st.cam.x -= (nx - q.x) / st.cam.k; st.cam.y -= (ny - q.y) / st.cam.k; }
        q.x = nx; q.y = ny;
      };
      const up = e => {
        const q = T.get(e.pointerId);
        if (q && T.size === 1 && MT.activa(st)) {
          const quieto = Math.hypot(q.x - q.x0, q.y - q.y0) < 10;
          if (quieto) {
            const tNow = typeof performance !== 'undefined' ? performance.now() : Date.now();
            if (ultToque && tNow - ultToque.t < 320 && Math.hypot(q.x - ultToque.x, q.y - ultToque.y) < 40) {
              st.cyo = 0; st.cpo = 0; ultToque = null;
              if (L.msg) L.msg(st, '🎯 Cámara centrada', 'b');
            } else {
              ultToque = { x: q.x, y: q.y, t: tNow };
            }
          }
        }
        T.delete(e.pointerId);
        if (T.size < 2) pinch = null;
      };
      const wheel = e => { e.preventDefault(); if (this._zoom) this._zoom(Math.exp(-clamp(e.deltaY, -120, 120) * .0016)); };
      cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('wheel', wheel, { passive: false });
      this._cg = () => { cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up); cv.removeEventListener('wheel', wheel); this._cg = null; };
    };
  }

  /* Ajustes → ⚙️ Flexibilidad: opción «✂️ Pantalla en 3D» */
  if (typeof Menu !== 'undefined' && Menu.settings && !Menu._conPantalla3d) {
    Menu._conPantalla3d = 1;
    const set0 = Menu.settings;
    Menu.settings = function () {
      const r = set0.apply(this, arguments);
      const mBody = document.getElementById('mBody');
      if (!mBody || document.getElementById('sPant3d')) return r;
      const zurdoTg = mBody.querySelector('.tg[data-fx="zurdo"]');
      const ancla = zurdoTg || mBody.querySelector('.tg[data-fx="uiTam"]');
      if (!ancla) return r;
      const s = Save.d.settings, cur = s.pantalla === 'clasica' ? 'clasica' : 'mitades';
      const wrap = document.createElement('div');
      wrap.innerHTML = `<div class="pag">✂️ Pantalla en 3D (Ciudad Libre)</div><div class="tg" id="sPant3d"><button data-v="mitades" class="${cur === 'mitades' ? 'on' : ''}">En mitades: arriba cámara, abajo manejo</button><button data-v="clasica" class="${cur === 'clasica' ? 'on' : ''}">Clásica: joystick amplio</button></div>`;
      ancla.after(wrap);
      for (const b of wrap.querySelectorAll('#sPant3d button')) {
        b.onclick = () => {
          s.pantalla = b.dataset.v === 'clasica' ? 'clasica' : 'mitades';
          MT.aplicarClase(); Save.write();
          for (const x of wrap.querySelectorAll('#sPant3d button')) x.classList.toggle('on', x === b);
        };
      }
      return r;
    };
  }
})();
