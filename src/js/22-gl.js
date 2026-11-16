/* =====================================================================
   MUNDO 3D (WebGL 1, sin librerías): el Valle de Aburrá en low‑poly con la textura
   pixelada del mapa real. Se dibuja a baja resolución y se escala sin suavizar
   (píxel 3D). Ejes: X = este, Y = altura (m s. n. m.), Z = sur. Unidades: metros.
   ===================================================================== */
const M4 = {
  persp(f, a, n, fa) { const t = 1 / Math.tan(f / 2), o = new Float32Array(16); o[0] = t / a; o[5] = t; o[10] = (fa + n) / (n - fa); o[11] = -1; o[14] = 2 * fa * n / (n - fa); return o; },
  look(e, c, u = [0, 1, 0]) {
    let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2], l = Math.hypot(zx, zy, zz) || 1; zx /= l; zy /= l; zz /= l;
    let xx = u[1] * zz - u[2] * zy, xy = u[2] * zx - u[0] * zz, xz = u[0] * zy - u[1] * zx; l = Math.hypot(xx, xy, xz) || 1; xx /= l; xy /= l; xz /= l;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return new Float32Array([xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0, -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1]);
  },
  mul(a, b) { const o = new Float32Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; },
  /* caja: escala (sx, sy, sz), giro en Y (yaw), inclinación (pitch) y balanceo (roll), posición */
  trs(x, y, z, yaw, sx, sy, sz, pitch = 0, roll = 0) {
    const cy = Math.cos(yaw), sy_ = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), cr = Math.cos(roll), sr = Math.sin(roll);
    // R = Ry(yaw) · Rz(pitch) · Rx(roll); el eje largo de la caja es X
    const r00 = cy * cp, r01 = -cy * sp * cr + sy_ * sr, r02 = cy * sp * sr + sy_ * cr, r10 = sp, r11 = cp * cr, r12 = -cp * sr, r20 = -sy_ * cp, r21 = sy_ * sp * cr + cy * sr, r22 = -sy_ * sp * sr + cy * cr;
    return new Float32Array([r00 * sx, r10 * sx, r20 * sx, 0, r01 * sy, r11 * sy, r21 * sy, 0, r02 * sz, r12 * sz, r22 * sz, 0, x, y, z, 1]);
  },
  xf(m, x, y, z) { const w = m[3] * x + m[7] * y + m[11] * z + m[15]; return [(m[0] * x + m[4] * y + m[8] * z + m[12]) / w, (m[1] * x + m[5] * y + m[9] * z + m[13]) / w, (m[2] * x + m[6] * y + m[10] * z + m[14]) / w, w]; }
};
/* sol real de Medellín (6,25° N): casi 12 h de día todo el año */
const SKY = {
  sun(hour, doy) {
    const dec = 23.44 * Math.sin(TAU * (doy - 81) / 365) * Math.PI / 180, lat = 6.25 * Math.PI / 180, H = (hour - 12.1) * 15 * Math.PI / 180;
    const el = Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H));
    let az = Math.atan2(-Math.sin(H), Math.tan(dec) * Math.cos(lat) - Math.sin(lat) * Math.cos(H)); // desde el norte, horario
    return { el, az, dir: [Math.cos(el) * Math.sin(az), Math.sin(el), -Math.cos(el) * Math.cos(az)] };
  },
  /* paleta por hora (amanecer, día, atardecer, noche), interpolada */
  KEYS: [[0, '#08122a', '#1a2b4f', '#0e1a33'], [4.8, '#0f1d3f', '#3a3f6b', '#22284a'], [5.8, '#3b3f7a', '#f2a07a', '#c98a7a'], [7, '#4f93cf', '#cfe6ef', '#b9d4dc'], [12, '#3f8bd0', '#d6ecf3', '#c4dde4'], [16.5, '#4a86c4', '#f4d9a8', '#d8c2a0'], [17.8, '#3d2f66', '#f08a5d', '#b8706a'], [18.6, '#1d2350', '#7a4f78', '#4a3a5e'], [19.5, '#0b1530', '#25305a', '#141d3a'], [24, '#08122a', '#1a2b4f', '#0e1a33']],
  at(hour, doy = 320) {
    const K = this.KEYS, h = ((hour % 24) + 24) % 24; let i = 0; while (i < K.length - 2 && K[i + 1][0] <= h) i++;
    const a = K[i], b = K[i + 1], f = (h - a[0]) / (b[0] - a[0] || 1), mix = (p, q) => { const x = parseInt(p.slice(1), 16), y = parseInt(q.slice(1), 16); return [0, 1, 2].map(k => ((x >> (16 - 8 * k) & 255) * (1 - f) + (y >> (16 - 8 * k) & 255) * f) / 255); };
    const s = this.sun(h, doy), day = clamp(Math.sin(s.el) * 4 + .25, 0, 1), night = clamp(1 - day * 1.4, 0, 1);
    return { top: mix(a[1], b[1]), bot: mix(a[2], b[2]), fog: mix(a[3], b[3]), sun: s, day, night, amb: [.32 + .3 * day, .34 + .3 * day, .42 + .25 * day], sunc: [.95 * day, .86 * day, .72 * day] };
  },
  hex(c) { return 'rgb(' + c.map(v => Math.round(v * 255)).join(',') + ')'; }
};
const VS = `attribute vec3 p;attribute vec3 n;attribute vec3 c;attribute float k;uniform mat4 M;uniform mat4 VP;varying vec3 vc;varying float vk;varying vec3 vn;varying vec3 wp;varying float vd;
void main(){vec4 w=M*vec4(p,1.);wp=w.xyz;vn=mat3(M)*n;vc=c;vk=k;gl_Position=VP*w;vd=gl_Position.w;}`;
const FS = `precision mediump float;uniform sampler2D T;uniform vec4 R;uniform vec4 hole;uniform vec3 sun;uniform vec3 amb;uniform vec3 sunc;uniform vec3 fogc;uniform float fogd;uniform float night;uniform float time;uniform vec4 tint;
varying vec3 vc;varying float vk;varying vec3 vn;varying vec3 wp;varying float vd;
float h(vec2 q){return fract(sin(dot(q,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec3 base=mix(vc,tint.rgb,tint.a);
if(vk>=2.&&vk<3.){if(wp.x>hole.x&&wp.x<hole.z&&wp.z>hole.y&&wp.z<hole.w)discard;base=texture2D(T,(wp.xz-R.xy)/R.zw).rgb;}
vec3 N=normalize(vn);float d=max(dot(N,sun),0.);vec3 col=base*(amb+sunc*d);
if(vk>=2.&&vk<3.&&night>0.){float u=vk-2.;vec2 cl=floor(wp.xz/7.);float r=h(cl);float on=step(1.-u*.6,r)*(.65+.35*sin(time*1.7+r*50.));col+=night*on*vec3(1.,.74,.38)*1.3;}
if(vk>.5&&vk<1.5){vec2 q=vec2((wp.x+wp.z)/3.4,wp.y/3.1);vec2 f=fract(q);float w=step(.22,f.x)*step(f.x,.78)*step(.28,f.y)*step(f.y,.82);float lit=step(.42,h(floor(q)+floor(wp.xz*.02)));col=mix(col,mix(col*.55,vec3(1.,.84,.48),night*lit),w*.85);}
if(vk>3.5)col=base*(.8+.2*night);
float fg=clamp(1.-exp(-vd*fogd),0.,1.);gl_FragColor=vec4(mix(col,fogc,fg),1.);}`;
const SVS = `attribute vec2 p;varying vec2 v;void main(){v=p;gl_Position=vec4(p,.9999,1.);}`;
const SFS = `precision mediump float;uniform vec3 top;uniform vec3 bot;uniform vec3 sc;uniform vec3 sp;varying vec2 v;void main(){vec3 c=mix(bot,top,clamp(v.y*.5+.5,0.,1.));float d=length((v-sp.xy)*vec2(sp.z,1.));c+=sc*(smoothstep(.06,.04,d)+.35*smoothstep(.45,0.,d));gl_FragColor=vec4(c,1.);}`;
/* constructor de mallas (triángulos sin índices, sombreado plano estilo low‑poly) */
class MB {
  constructor() { this.parts = []; this.a = []; }
  v(x, y, z, nx, ny, nz, c, k) { this.a.push(x, y, z, nx, ny, nz, c[0], c[1], c[2], k); if (this.a.length >= 60000 * 10) this.flush(); }
  tri(p, q, r, c, k = 0) { const ux = q[0] - p[0], uy = q[1] - p[1], uz = q[2] - p[2], wx = r[0] - p[0], wy = r[1] - p[1], wz = r[2] - p[2]; let nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l; if (ny < -.01 && k >= 2) { nx = -nx; ny = -ny; nz = -nz; } this.v(...p, nx, ny, nz, c, k); this.v(...q, nx, ny, nz, c, k); this.v(...r, nx, ny, nz, c, k); }
  quad(p, q, r, s, c, k = 0) { this.tri(p, q, r, c, k); this.tri(p, r, s, c, k); }
  /* caja orientada: centro de la base (x, y, z), largo L (eje del rumbo a), ancho W, alto H */
  box(x, y, z, a, L, W, H, c, cTop, k = 0, kTop = 0) {
    const ca = Math.cos(a), sa = Math.sin(a), P = (u, w, h) => [x + ca * u - sa * w, y + h, z + sa * u + ca * w], l = L / 2, w = W / 2;
    const b = [P(-l, -w, 0), P(l, -w, 0), P(l, w, 0), P(-l, w, 0)], t = [P(-l, -w, H), P(l, -w, H), P(l, w, H), P(-l, w, H)];
    this.quad(t[0], t[3], t[2], t[1], cTop || c, kTop);
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; this.quad(b[j], b[i], t[i], t[j], c, k); }
  }
  /* techo a dos aguas (cumbrera a lo largo de L), con alero */
  roof(x, y, z, a, L, W, rh, c) {
    const ca = Math.cos(a), sa = Math.sin(a), l = L / 2 + .5, w = W / 2 + .6, P = (u, v, h) => [x + ca * u - sa * v, y + h, z + sa * u + ca * v];
    this.quad(P(-l, -w, 0), P(-l, 0, rh), P(l, 0, rh), P(l, -w, 0), c); this.quad(P(-l, 0, rh), P(-l, w, 0), P(l, w, 0), P(l, 0, rh), c.map(v => v * .86));
    this.tri(P(-l, -w, 0), P(-l, w, 0), P(-l, 0, rh), c.map(v => v * .93)); this.tri(P(l, w, 0), P(l, -w, 0), P(l, 0, rh), c.map(v => v * .93));
  }
  /* árbol low‑poly: tronco + copa hexagonal (normales hacia afuera) */
  tree(x, y, z, s, c) {
    this.box(x, y, z, 0, .5 * s / 3, .5 * s / 3, s * .55, [.36, .25, .17], [.36, .25, .17]);
    const top = [x, y + s * 1.75, z], bot = [x, y + s * .45, z], ring = []; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + s; ring.push([x + Math.cos(a) * s * .62, y + s * 1.02, z + Math.sin(a) * s * .62]); }
    const ctr = [x, y + s * 1.05, z], tri = (p, q, r, col) => { const ux = q[0] - p[0], uy = q[1] - p[1], uz = q[2] - p[2], wx = r[0] - p[0], wy = r[1] - p[1], wz = r[2] - p[2]; let nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx; const mx = (p[0] + q[0] + r[0]) / 3 - ctr[0], my = (p[1] + q[1] + r[1]) / 3 - ctr[1], mz = (p[2] + q[2] + r[2]) / 3 - ctr[2]; if (nx * mx + ny * my + nz * mz < 0) { nx = -nx; ny = -ny; nz = -nz; } const L = Math.hypot(nx, ny, nz) || 1; for (const v of [p, q, r]) this.v(v[0], v[1], v[2], nx / L, ny / L, nz / L, col, 0); };
    for (let i = 0; i < 6; i++) { const j = (i + 1) % 6; tri(ring[i], top, ring[j], c); tri(ring[j], bot, ring[i], c.map(v => v * .8)); }
  }
  flush() { if (this.a.length) this.parts.push(new Float32Array(this.a)); this.a = []; }
  done() { this.flush(); return this.parts; }
}
const rgb = h => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
const HOUSE_COL = ['#efe3c8', '#f2cfae', '#d6e6d2', '#e9c9c9', '#f4e2a0', '#cfe0ea', '#e2d4ee', '#f7efe2', '#bfe1d9'].map(rgb), ROOF_COL = ['#b4583a', '#a24b30', '#c4683f', '#8e4128', '#9aa0a6'].map(rgb), TREE_COL = ['#3f7a3a', '#4b8640', '#2f6b3c', '#5a8f3e', '#3a7246'].map(rgb);
const G3 = EM.g3 = {
  ok: false, tried: false, gl: null, cv: null, P: null, S: null, stat: [], far: [], near: [], bld: [], win: null, texFar: null, texNear: null, cube: null, quadB: null, scale: .5,
  init() {
    if (this.tried) return this.ok; this.tried = true;
    if (EM.headless || !MAP.ready) return false;
    try {
      const cv = this.cv = document.createElement('canvas'); cv.id = 'g3d'; cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:none;image-rendering:pixelated;z-index:0';
      $('#game').insertBefore(cv, $('#gcv'));
      const gl = this.gl = cv.getContext('webgl', { antialias: false, alpha: false, depth: true, powerPreference: 'low-power', preserveDrawingBuffer: false }); if (!gl) return false;
      const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
      const pr = (v, f) => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, v)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, f)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i = 0; i < n; i++) { const q = gl.getActiveUniform(p, i); u[q.name] = gl.getUniformLocation(p, q.name); } return { p, u, a: { p: gl.getAttribLocation(p, 'p'), n: gl.getAttribLocation(p, 'n'), c: gl.getAttribLocation(p, 'c'), k: gl.getAttribLocation(p, 'k') } }; };
      this.P = pr(VS, FS); this.S = pr(SVS, SFS);
      this.quadB = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.quadB); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const cb = new MB(); cb.box(0, 0, 0, 0, 1, 1, 1, [1, 1, 1], [1, 1, 1]); this.cube = { b: this.buf(cb.done()[0]), n: 30 };
      this.texFar = this.tex(MAP.mini()); this.buildFar(); this.buildNet();
      this.ok = true;
    } catch (e) { EM.errors.push('3D: ' + e.message); this.ok = false; }
    return this.ok;
  },
  buf(arr) { const gl = this.gl, b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW); b.n = arr.length / 10; return b; },
  tex(cv) { const gl = this.gl, t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cv); for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v); return t; },
  urban(x, y, r) { let n = 0, c = 0; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const v = MAP.tileM(x + i * r, y + j * r); c++; if (v === TT.BRICK || v === TT.BLDG) n++; } return n / c; },
  /* malla lejana: todo el valle cada 320 m */
  buildFar() {
    const S = 320, W = MW * TM, H = MH * TM, nx = Math.floor(W / S), nz = Math.floor(H / S), mb = new MB(), E = (i, j) => [i * S, MAP.elevM(i * S, j * S), j * S];
    const U = []; for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) U.push(this.urban(i * S, j * S, 90));
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const a = E(i, j), b = E(i + 1, j), c = E(i + 1, j + 1), d = E(i, j + 1), u = 2 + U[j * (nx + 1) + i] * .9; mb.tri(a, d, c, [1, 1, 1], u); mb.tri(a, c, b, [1, 1, 1], u); }
    this.far = mb.done().map(a => this.buf(a));
  },
  /* ventana cercana (4,8 km) con textura de 4 px por casilla y edificios en 3D */
  buildNear(cx, cz) {
    const gl = this.gl, half = 2400, x0 = Math.floor((cx - half) / TM) * TM, z0 = Math.floor((cz - half) / TM) * TM, nt = 2 * half / TM, P = 4;
    const cv = mkCanvas(nt * P, nt * P), g = cv.getContext('2d'), img = g.createImageData(nt * P, nt * P), d = img.data;
    for (let ty = 0; ty < nt; ty++) for (let tx = 0; tx < nt; tx++) {
      const X = x0 / TM + tx, Y = z0 / TM + ty, v = MAP.tile(X, Y), base = TRGB[v] || TRGB[0];
      for (let py = 0; py < P; py++) for (let px = 0; px < P; px++) {
        const ht = h2(X, Y, v); let m = .94 + ht * .1;
        if ((v === TT.AVE || v === TT.AUTO) && (px === 1 || px === 2) && py === 1 && (X + Y) % 2 === 0) m = 1.6;
        else if ((v === TT.MOUNT && ht < .6 || v === TT.GRASS && ht < .3) && px > 0 && py > 0 && px < 3 && py < 3) m = .74;
        else if ((v === TT.BRICK || v === TT.BLDG) && (px === 0 || py === 0)) m = .8;
        const o = ((ty * P + py) * nt * P + tx * P + px) * 4; d[o] = clamp(base[0] * m, 0, 255); d[o + 1] = clamp(base[1] * m, 0, 255); d[o + 2] = clamp(base[2] * m, 0, 255); d[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    if (this.texNear) gl.deleteTexture(this.texNear); this.texNear = this.tex(cv);
    for (const b of this.near.concat(this.bld)) gl.deleteBuffer(b);
    const S = 40, n = 2 * half / S, mb = new MB(), E = (i, j) => [x0 + i * S, MAP.elevM(x0 + i * S, z0 + j * S), z0 + j * S];
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const a = E(i, j), b = E(i + 1, j), c = E(i + 1, j + 1), dd = E(i, j + 1), u = 2 + this.urban(a[0] + 20, a[2] + 20, 20) * .95; mb.tri(a, dd, c, [1, 1, 1], u); mb.tri(a, c, b, [1, 1, 1], u); }
    this.near = mb.done().map(a => this.buf(a));
    // edificios: bloques de 2×2 casillas dentro de 1,5 km (0,9 km en celulares modestos)
    const R = Save.d.settings.q === 'low' ? 600 : 1100, bm = new MB();
    for (let bz = cz - R; bz < cz + R; bz += TM) for (let bx = cx - R; bx < cx + R; bx += TM) {
      const X = Math.floor(bx / TM) * TM, Z = Math.floor(bz / TM) * TM; if ((X - cx) ** 2 + (Z - cz) ** 2 > R * R) continue;
      const v = MAP.tileM(X + 10, Z + 10); if (v !== TT.BLDG && v !== TT.BRICK) continue;
      const r = h2(X, Z, 5), brick = v === TT.BRICK, hgt = brick ? 4 + r * 6 : MAP.bHeight(X + 10, Z + 10, X ^ Z), w = 11 + r * 4, l = 12 + h2(X, Z, 6) * 5, y = MAP.elevM(X + 10, Z + 10) - 2, a = h2(X, Z, 9) < .5 ? 0 : Math.PI / 2;
      // casas: ladrillo a la vista o pintadas en tonos pastel (como las laderas de Medellín); edificios: concreto y vidrio
      const wall = brick ? (r < .55 ? (r < .3 ? [.71, .35, .23] : [.62, .3, .2]) : HOUSE_COL[(r * 97 | 0) % HOUSE_COL.length]) : [[.55, .59, .64], [.64, .66, .69], [.72, .69, .63], [.85, .8, .68], [.62, .72, .8]][(r * 5) | 0];
      if (brick) { bm.box(X + 10, y, Z + 10, a, l, w, hgt + 2, wall, wall, 1, 0); bm.roof(X + 10, y + hgt + 2, Z + 10, a, l, w, w * .32, ROOF_COL[(r * 31 | 0) % ROOF_COL.length]); }
      else { bm.box(X + 10, y, Z + 10, 0, l + 3, w + 3, hgt + 2, wall, [.5, .53, .57], 1, 0); if (hgt > 25 && r > .5) bm.box(X + 12, y + hgt + 2, Z + 8, 0, 4, 4, 2.5, [.8, .8, .82], [.3, .3, .32]); }
    }
    // árboles en parques y montes cercanos
    const RT = Save.d.settings.q === 'low' ? 350 : 750;
    for (let bz = cz - RT; bz < cz + RT; bz += TM) for (let bx = cx - RT; bx < cx + RT; bx += TM) {
      const X = Math.floor(bx / TM) * TM, Z = Math.floor(bz / TM) * TM; if ((X - cx) ** 2 + (Z - cz) ** 2 > RT * RT) continue;
      const v = MAP.tileM(X + 10, Z + 10), r = h2(X, Z, 13); if (!((v === TT.GRASS && r < .3) || (v === TT.MOUNT && r < .6))) continue;
      const tx = X + 3 + h2(X, Z, 14) * 14, tz = Z + 3 + h2(X, Z, 15) * 14; bm.tree(tx, MAP.elevM(tx, tz) - .5, tz, 4 + r * 5, TREE_COL[(r * 53 | 0) % TREE_COL.length]);
    }
    this.bld = bm.done().map(a => this.buf(a));
    this.win = { cx, cz, x0, z0, s: 2 * half };
  },
  /* red de transporte estática: viaductos, rieles, postes, estaciones, torres de cable y carriles de bus */
  netZ: {},
  trackZ(line) {
    if (this.netZ[line.id]) return this.netZ[line.id];
    const n = Math.ceil(line.P.len / 12) + 1, z = new Float32Array(n), g = new Float32Array(n);
    for (let i = 0; i < n; i++) { const p = NET.at(line.P, i * 12); g[i] = MAP.elevM(p.x, p.y); }
    const deck = line.kind === 'metro' ? 7.5 : line.kind === 'tram' || line.kind === 'future' ? .3 : .25, W = line.kind === 'metro' ? 16 : 2;
    for (let i = 0; i < n; i++) { let s = 0, c = 0; for (let j = Math.max(0, i - W); j <= Math.min(n - 1, i + W); j++) { s += g[j]; c++; } z[i] = (line.kind === 'metro' ? s / c : g[i]) + deck; }
    return (this.netZ[line.id] = { z, g, n });
  },
  zOn(line, s) { const T = this.trackZ(line), f = clamp(s / 12, 0, T.n - 1.001), i = f | 0, k = f - i; return T.z[i] * (1 - k) + T.z[i + 1] * k; },
  /* geometría de cada metrocable: torres y catenaria */
  cableGeo(line) {
    if (line._cg) return line._cg; const pts = [];
    for (let i = 0; i < line.st.length; i++) {
      const a = line.st[i]; pts.push({ x: a.x, y: a.y, z: MAP.elevM(a.x, a.y) + 12, st: true, name: a.name });
      if (i < line.st.length - 1) { const b = line.st[i + 1], L = dist(a.x, a.y, b.x, b.y), nt = Math.max(0, Math.round(L / 260) - 1); for (let k = 1; k <= nt; k++) { const f = k / (nt + 1), x = lerp(a.x, b.x, f), y = lerp(a.y, b.y, f); pts.push({ x, y, z: MAP.elevM(x, y) + 24 + h2(x | 0, y | 0, 2) * 10, st: false }); } }
    }
    const P = NET.poly(pts.map(p => ({ x: p.x, y: p.y }))); return (line._cg = { pts, P, zAt: s => { let i = 0; while (i < P.cum.length - 2 && P.cum[i + 1] < s) i++; const L = (P.cum[i + 1] - P.cum[i]) || 1, f = clamp((s - P.cum[i]) / L, 0, 1), sag = 4 * .025 * L * f * (1 - f); return lerp(pts[i].z, pts[Math.min(i + 1, pts.length - 1)].z, f) - sag; } });
  },
  buildNet() {
    const mb = new MB(), lines = [];
    for (const l of NET.lines) {
      const col = rgb(l.color), K = l.kind;
      if (K === 'metro' || K === 'tram' || (K === 'future' && !/cable/i.test(l.name))) {
        const T = this.trackZ(l), dk = K === 'metro';
        for (let i = 0; i < T.n - 1; i++) {
          const a = NET.at(l.P, i * 12), b = NET.at(l.P, (i + 1) * 12), za = T.z[i], zb = T.z[i + 1], sa = [-Math.sin(a.a), Math.cos(a.a)], sb = [-Math.sin(b.a), Math.cos(b.a)], hw = dk ? 4.6 : 3.2;
          const E = (p, s, o, z) => [p.x + s[0] * o, z, p.y + s[1] * o];
          mb.quad(E(a, sa, -hw, za), E(a, sa, hw, za), E(b, sb, hw, zb), E(b, sb, -hw, zb), dk ? [.74, .71, .64] : [.42, .44, .47]);
          if (dk) { mb.quad(E(a, sa, hw, za), E(a, sa, hw, za - 1.4), E(b, sb, hw, zb - 1.4), E(b, sb, hw, zb), [.6, .57, .52]); mb.quad(E(a, sa, -hw, za - 1.4), E(a, sa, -hw, za), E(b, sb, -hw, zb), E(b, sb, -hw, zb - 1.4), [.6, .57, .52]); }
          for (const o of [-2.3, -1.1, 1.1, 2.3]) mb.quad(E(a, sa, o - .12, za + .12), E(a, sa, o + .12, za + .12), E(b, sb, o + .12, zb + .12), E(b, sb, o - .12, zb + .12), [.25, .24, .23]);
          if (dk && i % 3 === 0) mb.box(a.x, T.g[i] - 2, a.y, a.a, 1.8, 2.2, za - T.g[i] + .6, [.68, .65, .58], [.68, .65, .58]);
          if (i % 4 === 0) { const q = E(a, sa, hw - .4, za); mb.box(q[0], za, q[2], a.a, .35, .35, 6.5, [.35, .37, .4], [.35, .37, .4]); const q2 = E(a, sa, 0, za); mb.box((q[0] + q2[0]) / 2, za + 6, (q[2] + q2[2]) / 2, a.a + Math.PI / 2, hw, .2, .25, [.35, .37, .4], [.35, .37, .4]); }
        }
        const K2 = KIND[K === 'future' ? 'tram' : K];
        for (const s of l.st) { const p = NET.at(l.P, s.s), z = this.zOn(l, s.s); for (const sd of [-1, 1]) { const o = sd * (dk ? 7.5 : 5.5), x = p.x - Math.sin(p.a) * o, y = p.y + Math.cos(p.a) * o; mb.box(x, z - (dk ? 1.2 : .2), y, p.a, K2.plat, dk ? 5 : 3, dk ? 2.2 : 1.1, [.85, .8, .7], [.88, .84, .74]); mb.box(x, z + 4.6, y, p.a, K2.plat * .9, dk ? 6 : 3.6, .6, col, col); } if (dk) mb.box(p.x, MAP.elevM(p.x, p.y) - 1, p.y, p.a, 30, 26, z - MAP.elevM(p.x, p.y) - 1.5, [.78, .75, .68], [.78, .75, .68], 1, 0); }
      } else if (K === 'cable' || (K === 'future' && /cable/i.test(l.name))) {
        const C = this.cableGeo(l);
        for (const p of C.pts) { const gz = MAP.elevM(p.x, p.y); if (p.st) { mb.box(p.x, gz - 2, p.y, 0, 34, 22, p.z - gz + 2, [.86, .84, .8], col, 1, 0); mb.box(p.x, p.z + 2, p.y, 0, 38, 26, 1.2, col, col); } else { mb.box(p.x, gz - 1, p.y, Math.PI / 4, 3.4, 3.4, p.z - gz + 3, [.72, .74, .78], [.72, .74, .78]); mb.box(p.x, p.z + 1.5, p.y, 0, 6, 9, 1, [.5, .52, .56], [.5, .52, .56]); } }
        const seg = []; for (let s = 0; s <= C.P.len; s += 14) { const q = NET.at(C.P, s); seg.push([q.x, C.zAt(s) + 2, q.y]); } lines.push({ pts: seg, c: [.12, .12, .14] });
      } else if (K === 'brt' || K === 'feeder') {
        const w = K === 'brt' ? 3.2 : 1.6, dark = col.map(v => v * .85);
        for (let s = 0; s < l.P.len - 10; s += 10) { const a = NET.at(l.P, s), b = NET.at(l.P, s + 10), za = MAP.elevM(a.x, a.y) + .45, zb = MAP.elevM(b.x, b.y) + .45, sa = [-Math.sin(a.a), Math.cos(a.a)]; mb.quad([a.x + sa[0] * -w, za, a.y + sa[1] * -w], [a.x + sa[0] * w, za, a.y + sa[1] * w], [b.x + sa[0] * w, zb, b.y + sa[1] * w], [b.x + sa[0] * -w, zb, b.y + sa[1] * -w], dark, 4); }
        for (const s of l.st) { const z = MAP.elevM(s.x, s.y); mb.box(s.x, z, s.y, NET.at(l.P, s.s).a, K === 'brt' ? 24 : 6, K === 'brt' ? 4 : 2.4, 3.2, [.85, .85, .82], col); }
      }
    }
    this.decor(mb);
    this.stat = mb.done().map(a => this.buf(a));
    const la = []; for (const L of lines) for (let i = 0; i < L.pts.length - 1; i++) { la.push(...L.pts[i], 0, 1, 0, ...L.c, 0, ...L.pts[i + 1], 0, 1, 0, ...L.c, 0); }
    this.wires = la.length ? this.buf(new Float32Array(la)) : null;
  },
  /* adornos según la fecha: alumbrados, banderas, velitas, flores, calabazas, morado */
  decor(mb) {
    const d = Mundo.deco(); if (!d) return; const C = { luces: ['#EC343A', '#F6C538', '#59AB42', '#1C5C9C', '#EB318E'], banderas: ['#F6C538', '#1C5C9C', '#EC343A'], flores: ['#EB318E', '#F6C538', '#EC343A', '#ffffff'], calabazas: ['#E38835'], velas: ['#ffd36a'], morado: ['#743D90'], fuegos: ['#EC343A', '#F6C538', '#1C5C9C'], banderines: ['#1C5C9C', '#E38835', '#59AB42', '#F6C538', '#EB318E'] }[d] || ['#F6C538'];
    for (const l of NET.lines) {
      if (l.kind !== 'metro' && l.kind !== 'tram') continue; const dk = l.kind === 'metro';
      if (d === 'luces' || d === 'banderines') for (let s = 0, i = 0; s < l.P.len; s += 9, i++) { const p = NET.at(l.P, s), z = this.zOn(l, s); for (const sd of [-1, 1]) { const o = sd * (dk ? 4.7 : 3.4); mb.box(p.x - Math.sin(p.a) * o, z + (dk ? .1 : 6), p.y + Math.cos(p.a) * o, p.a, .5, .5, .5, rgb(C[i % C.length]), rgb(C[i % C.length]), 4, 4); } }
      for (const sI of l.st) { const p = NET.at(l.P, sI.s), z = this.zOn(l, sI.s), K2 = KIND[l.kind];
        if (d === 'banderas') for (let k = 0; k < 3; k++) mb.box(p.x, z + 7 + k * .8, p.y, p.a, 3, .2, .8, rgb(C[k]), rgb(C[k]));
        else for (let u = -K2.plat / 2; u < K2.plat / 2; u += d === 'velas' ? 3 : 5) for (const sd of [-1, 1]) { const o = sd * (dk ? 9.2 : 6.6), q = NET.at(l.P, sI.s + u); mb.box(q.x - Math.sin(q.a) * o, z - (dk ? .1 : 0), q.y + Math.cos(q.a) * o, q.a, d === 'velas' ? .25 : .7, d === 'velas' ? .25 : .7, d === 'velas' ? .5 : .8, rgb(C[(u | 0) % C.length < 0 ? 0 : (u | 0) % C.length]), rgb(C[0]), d === 'velas' ? 4 : 0, d === 'velas' ? 4 : 0); }
      }
    }
  },
  /* ---------- dibujo ---------- */
  draw(cam, opts = {}) {
    const gl = this.gl, cv = this.cv, q = Save.d.settings.q === 'low' ? .4 : (Save.d.settings.px3d === 'fino' ? Math.min(1.5, window.devicePixelRatio || 1) : .55);
    const w = Math.max(64, Math.round(cv.clientWidth * q)), h = Math.max(64, Math.round(cv.clientHeight * q)); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    if (!this.win || dist(cam.eye[0], cam.eye[2], this.win.cx, this.win.cz) > 1000) this.buildNear(cam.eye[0], cam.eye[2]);
    const sky = SKY.at(opts.hour != null ? opts.hour : 12), V = M4.look(cam.eye, cam.at), Pm = M4.persp(cam.fov || 1.05, w / h, 1.2, 26000), VP = M4.mul(Pm, V); this.VP = VP; this.vw = w; this.vh = h;
    gl.viewport(0, 0, w, h); gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
    // cielo con gradiente y sol
    const S = this.S, sd = sky.sun.dir, sp = M4.xf(VP, cam.eye[0] + sd[0] * 2e4, cam.eye[1] + sd[1] * 2e4, cam.eye[2] + sd[2] * 2e4);
    for (const k in this.P.a) if (this.P.a[k] >= 0) gl.disableVertexAttribArray(this.P.a[k]);
    const sl = gl.getAttribLocation(S.p, 'p'); gl.useProgram(S.p); gl.bindBuffer(gl.ARRAY_BUFFER, this.quadB); gl.enableVertexAttribArray(sl); gl.vertexAttribPointer(sl, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(S.u.top, sky.top); gl.uniform3fv(S.u.bot, sky.bot); gl.uniform3fv(S.u.sp, [sp[3] > 0 ? sp[0] : 9, sp[3] > 0 ? sp[1] : 9, w / h]); gl.uniform3fv(S.u.sc, sky.sun.el > -.05 ? [1, .85 * (.6 + .4 * sky.day), .6 * sky.day + .2] : [.5, .55, .7]);
    gl.drawArrays(gl.TRIANGLES, 0, 3); gl.disableVertexAttribArray(sl);
    gl.enable(gl.DEPTH_TEST); gl.clear(gl.DEPTH_BUFFER_BIT);
    const P = this.P; gl.useProgram(P.p); const u = P.u;
    gl.uniformMatrix4fv(u.VP, false, VP); gl.uniform3fv(u.sun, sky.sun.el > 0 ? sd : [-sd[0], .3, -sd[2]]); gl.uniform3fv(u.amb, sky.amb); gl.uniform3fv(u.sunc, sky.sunc); gl.uniform3fv(u.fogc, opts.fog || sky.fog);
    gl.uniform1f(u.fogd, (opts.fogd || 1 / 9000) * (opts.rain ? 2.2 : 1)); gl.uniform1f(u.night, sky.night); gl.uniform1f(u.time, now()); gl.uniform4fv(u.tint, [0, 0, 0, 0]); gl.uniform1i(u.T, 0); gl.activeTexture(gl.TEXTURE0);
    const I = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); gl.uniformMatrix4fv(u.M, false, I);
    const run = (b, mode = gl.TRIANGLES) => { gl.bindBuffer(gl.ARRAY_BUFFER, b); const st = 40; gl.enableVertexAttribArray(P.a.p); gl.vertexAttribPointer(P.a.p, 3, gl.FLOAT, false, st, 0); gl.enableVertexAttribArray(P.a.n); gl.vertexAttribPointer(P.a.n, 3, gl.FLOAT, false, st, 12); gl.enableVertexAttribArray(P.a.c); gl.vertexAttribPointer(P.a.c, 3, gl.FLOAT, false, st, 24); gl.enableVertexAttribArray(P.a.k); gl.vertexAttribPointer(P.a.k, 1, gl.FLOAT, false, st, 36); gl.drawArrays(mode, 0, b.n); };
    const W = this.win; gl.bindTexture(gl.TEXTURE_2D, this.texFar); gl.uniform4fv(u.R, [0, 0, MW * TM, MH * TM]); gl.uniform4fv(u.hole, [W.x0 + 40, W.z0 + 40, W.x0 + W.s - 40, W.z0 + W.s - 40]);
    for (const b of this.far) run(b);
    gl.bindTexture(gl.TEXTURE_2D, this.texNear); gl.uniform4fv(u.R, [W.x0, W.z0, W.s, W.s]); gl.uniform4fv(u.hole, [0, 0, 0, 0]);
    for (const b of this.near) run(b);
    for (const b of this.bld) run(b);
    for (const b of this.stat) run(b);
    if (this.wires) run(this.wires, gl.LINES);
    this._run = run; this._I = I;
    if (opts.dyn) opts.dyn(this);
  },
  /* caja dinámica (vehículos): color, posición, rumbo y tamaño */
  box(x, y, z, yaw, L, W, H, col, pitch = 0, roll = 0) { const gl = this.gl, u = this.P.u; gl.uniformMatrix4fv(u.M, false, M4.trs(x, y, z, -yaw, L, H, W, pitch, roll)); gl.uniform4fv(u.tint, [col[0], col[1], col[2], 1]); this._run(this.cube.b); gl.uniform4fv(u.tint, [0, 0, 0, 0]); gl.uniformMatrix4fv(u.M, false, this._I); },
  /* vehículos de la red en servicio (ciudad viva) cerca de la cámara */
  traffic(cam, t, skip) {
    for (const l of NET.lines) {
      if (l === skip || l.kind === 'future' || l.kind === 'escalator') continue; const c = rgb(l.color);
      if (l.kind === 'cable') { const C = this.cableGeo(l), n = Math.max(4, Math.floor(C.P.len / 70)); for (let i = 0; i < n; i++) { const s = ((t * 5 + i * C.P.len * 2 / n) % (C.P.len * 2)), ss = s < C.P.len ? s : 2 * C.P.len - s, q = NET.at(C.P, ss); if (Math.abs(q.x - cam.eye[0]) > 2500 || Math.abs(q.y - cam.eye[2]) > 2500) continue; const z = C.zAt(ss) + 2; this.box(q.x, z - 4.6, q.y, q.a, 2.2, 2, 2.2, c); this.box(q.x, z - 2.4, q.y, q.a, .2, .2, 2.4, [.15, .15, .15]); } continue; }
      const K = KIND[l.kind], v = K.vmax * .65, n = l.kind === 'metro' ? Math.max(2, Math.round(l.P.len / 2600)) : Math.max(1, Math.round(l.P.len / 1500));
      for (let i = 0; i < n; i++) {
        const L2 = l.P.len * 2, s0 = (t * v + i * L2 / n) % L2, dir = s0 < l.P.len ? 1 : -1, s = dir > 0 ? s0 : L2 - s0, p = NET.at(l.P, s, dir * (l.kind === 'metro' ? 1.7 : 1.6)); if (Math.abs(p.x - cam.eye[0]) > 3000 || Math.abs(p.y - cam.eye[2]) > 3000) continue;
        const z = l.kind === 'metro' || l.kind === 'tram' ? this.zOn(l, s) : MAP.elevM(p.x, p.y), cars = l.kind === 'metro' ? 3 : l.kind === 'tram' ? 2 : 1, len = l.kind === 'metro' ? 22 : l.kind === 'tram' ? 19 : K.len;
        for (let k = 0; k < cars; k++) { const q = NET.at(l.P, s - dir * k * (len + 1), dir * 1.7), zq = l.kind === 'metro' || l.kind === 'tram' ? this.zOn(l, s - dir * k * (len + 1)) : MAP.elevM(q.x, q.y); this.vehicle(q.x, zq, q.y, q.a + (dir < 0 ? Math.PI : 0), len, l.kind, c); }
      }
    }
  },
  vehicle(x, z, y, a, len, kind, c) {
    const body = kind === 'metro' || kind === 'tram' ? [.86, .88, .9] : c, H = kind === 'metro' ? 3.7 : 3.2, W = kind === 'metro' ? 2.9 : 2.55;
    this.box(x, z + .5, y, a, len, W, H * .55, body); this.box(x, z + .5 + H * .55, y, a, len * .98, W * .98, H * .3, [.12, .2, .28]); this.box(x, z + .5 + H * .85, y, a, len, W, H * .15, kind === 'metro' || kind === 'tram' ? c : [.95, .95, .93]);
  },
  /* de mundo a pantalla (para letreros 2D sobre el 3D) */
  toScreen(x, y, z, W, H) { const q = M4.xf(this.VP, x, y, z); if (q[3] <= 0 || q[2] > 1) return null; return { x: (q[0] * .5 + .5) * W, y: (1 - (q[1] * .5 + .5)) * H, d: q[3] }; },
  show(on) { if (this.cv) this.cv.style.display = on ? 'block' : 'none'; }
};
