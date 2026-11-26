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
const VS = `attribute vec3 p;attribute vec3 n;attribute vec3 c;attribute float k;uniform mat4 M;uniform mat4 VP;uniform vec4 Rv;uniform vec4 Hv;varying vec3 vc;varying float vk;varying vec3 vn;varying vec3 wp;varying float vd;varying vec2 vuv;varying float vh;varying vec3 vw;
void main(){vec4 w=M*vec4(p,1.);wp=w.xyz;vuv=(w.xz-Rv.xy)/Rv.zw-.5;vh=(w.x>Hv.x&&w.x<Hv.z&&w.z>Hv.y&&w.z<Hv.w)?1.:0.;vw=vec3(mod(w.x,340.),mod(w.y,310.),mod(w.z,340.));vn=mat3(M)*n;vc=c;vk=k;gl_Position=VP*w;vd=gl_Position.w;}`;
const FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D T;uniform vec4 R;uniform vec4 hole;uniform vec3 sun;uniform vec3 amb;uniform vec3 sunc;uniform vec3 fogc;uniform float fogd;uniform float night;uniform float time;uniform vec4 tint;uniform vec3 camPos;uniform float uReal;
varying vec3 vc;varying float vk;varying vec3 vn;varying vec3 wp;varying float vd;varying vec2 vuv;varying float vh;varying vec3 vw;
float h(vec2 q){return fract(sin(dot(q,vec2(12.9898,78.233)))*43758.5453);}
float ruido2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
vec3 neutralTM(vec3 c){float x=min(c.r,min(c.g,c.b));float o=x<.08?x-6.25*x*x:.04;c=max(c-o,0.);float pk=max(c.r,max(c.g,c.b));if(pk<.76)return c;float d=.24;float np=1.-d*d/(pk+d-.76);c*=np/max(pk,.0001);float g=1.-1./(.15*(pk-np)+1.);return mix(c,vec3(np),g);}
void main(){vec3 base=mix(vc,tint.rgb,tint.a);
vec3 N=normalize(vn);vec3 V=normalize(camPos-wp);
if(vk>=2.&&vk<3.){if(vh>.5)discard;base=texture2D(T,vuv+.5).rgb;if(uReal>.5){float fino=.93+.07*h(floor(vw.xz*6.5));float mancha=.92+.11*ruido2(vw.xz*.06)+.04*ruido2(vw.xz*.42);base*=fino*mancha;}}
else if(vk<1.9&&uReal>.5){float muro=1.-smoothstep(.35,.6,abs(N.y));float grano=.94+.06*h(floor(vw.xz*5.+vw.y*3.1));float ladr=step(.07,base.r-base.g)*step(base.b,base.g+.03);float junta=muro*ladr*(1.-smoothstep(0.,.09,fract(vw.y*3.5)))*.22;base*=mix(1.,grano,muro)*(1.-junta);}
float hemi=N.y*.5+.5;vec3 skyBounce=mix(amb*vec3(.78,.73,.68),amb*vec3(.96,1.05,1.16),hemi);
float d=max(dot(N,sun),0.);vec3 H=normalize(sun+V);float sp=pow(max(dot(N,H),0.),26.);
vec3 col=base*(skyBounce+sunc*d)+sunc*sp*(vk>.5&&vk<1.5?.08:vk>=2.?.05:.16)*(1.-night);
if(vk>=2.&&vk<3.&&night>0.){float u=vk-2.;float farL=smoothstep(160.,480.,vd);vec2 cl=floor(vw.xz/7.);float r=h(cl);float on=step(1.-u*.6,r)*(.65+.35*sin(time*1.7+r*50.));col+=night*farL*on*vec3(1.,.74,.38)*1.3;}
if(vk>.5&&vk<1.5){vec2 q=vec2((vw.x+vw.z)/3.4,vw.y/3.1);vec2 f=fract(q);float w=step(.2,f.x)*step(f.x,.8)*step(.24,f.y)*step(f.y,.8);float lit=step(.42,h(floor(q)+floor(vw.xz*.02)));vec3 dayWin=mix(vec3(.2,.32,.44),vec3(.56,.74,.86),hemi)+sunc*sp*.45;vec3 winCol=mix(dayWin,vec3(1.,.84,.48),night*lit);col=mix(col,mix(col*.45,winCol,.85),w*.86);}
if(vk>3.5)col=base*(.85+.18*night);
if(uReal>.5)col=neutralTM(col);
float fg=clamp(1.-exp(-vd*fogd),0.,1.);float sAmt=max(dot(-V,sun),0.);vec3 fCol=mix(fogc,sunc*1.05+vec3(.18,.15,.1),pow(sAmt,6.)*.32*(1.-night));
gl_FragColor=vec4(mix(col,fCol,fg),1.);}`;
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
/* 3.6 (Claude) · mallas por celdas de 800 m: la red de transporte de todo el valle (viaductos, rieles, estaciones con interior,
   torres de cable: 830 mil vértices medidos) se dibujaba entera en cada cuadro; ahora cada triángulo va a la celda donde cae y
   al dibujar solo entran las celdas cercanas a la cámara (G3.draw). Lo que se arme con v() directo queda en una parte global */
/* 3.9 (Claude) · cada celda lleva su caja (bb: x0, y0, z0, x1, y1, z1, medida sobre sus vértices) para el recorte por lo que
   ve la cámara (G3.vis). en(x, z) da la malla de la celda que contiene el punto (el piso lejano y los árboles van enteros a una celda) */
class MBC extends MB {
  constructor(L = 800) { super(); this.L = L; this.c = new Map(); }
  en(x, z) { const i = Math.floor(x / this.L), j = Math.floor(z / this.L), key = i * 100003 + j; let m = this.c.get(key); if (!m) { m = new MB(); m.cx = (i + .5) * this.L; m.cz = (j + .5) * this.L; this.c.set(key, m); } return m; }
  tri(p, q, r, c, k = 0) { this.en((p[0] + q[0] + r[0]) / 3, (p[2] + q[2] + r[2]) / 3).tri(p, q, r, c, k); }
  tree(x, y, z, s, c) { MB.prototype.tree.call(this.en(x, z), x, y, z, s, c); }
  celdas() { const out = []; for (const m of this.c.values()) for (const a of m.done()) out.push({ a, cx: m.cx, cz: m.cz, bb: MBC.caja(a) }); for (const a of MB.prototype.done.call(this)) out.push({ a, cx: null, cz: null, bb: null }); return out; }
  static caja(a) { let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity; for (let i = 0; i < a.length; i += 10) { const x = a[i], y = a[i + 1], z = a[i + 2]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; if (z < z0) z0 = z; if (z > z1) z1 = z; } return [x0, y0, z0, x1, y1, z1]; }
}
const rgb = h => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
const HOUSE_COL = ['#efe3c8', '#f2cfae', '#d6e6d2', '#e9c9c9', '#f4e2a0', '#cfe0ea', '#e2d4ee', '#f7efe2', '#bfe1d9'].map(rgb), ROOF_COL = ['#b4583a', '#a24b30', '#c4683f', '#8e4128', '#9aa0a6'].map(rgb), TREE_COL = ['#3f7a3a', '#4b8640', '#2f6b3c', '#5a8f3e', '#3a7246', '#e6b822', '#d96ca8'].map(rgb);
const G3 = EM.g3 = {
  ok: false, tried: false, gl: null, cv: null, P: null, S: null, stat: [], far: [], near: [], bld: [], win: null, texFar: null, texNear: null, cube: null, quadB: null, scale: .5,
  init() {
    if (EM.headless || !MAP.ready) return false;
    if (this.tried) return this.ok; this.tried = true;
    try {
      const cv = this.cv = document.createElement('canvas'); cv.id = 'g3d'; cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:none;image-rendering:auto;z-index:0';
      $('#game').insertBefore(cv, $('#gcv'));
      const gl = this.gl = cv.getContext('webgl', { antialias: true, alpha: false, depth: true, powerPreference: 'low-power', preserveDrawingBuffer: false }); if (!gl) return false;
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
  tex(cv, suave) { const gl = this.gl, t = gl.createTexture(), pot = suave && !(cv.width & (cv.width - 1)) && !(cv.height & (cv.height - 1)), F = suave ? gl.LINEAR : gl.NEAREST; gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cv);
    if (pot) { gl.generateMipmap(gl.TEXTURE_2D); const an = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic'); if (an) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT))); }   // piso de calles: mipmaps y filtro anisótropo 8x
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, pot ? gl.LINEAR_MIPMAP_LINEAR : F], [gl.TEXTURE_MAG_FILTER, F], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v); return t; },
  urban(x, y, r) { let n = 0, c = 0; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const v = MAP.tileM(x + i * r, y + j * r); c++; if (v === TT.BRICK || v === TT.BLDG) n++; } return n / c; },
  /* normal suave del terreno en (x, z) para que las laderas empinadas (Santo Domingo, San Javier) no se vean facetadas ni granuladas */
  normT(x, z, d = 24) {
    const nx = MAP.elevM(x - d, z) - MAP.elevM(x + d, z), ny = 2 * d, nz = MAP.elevM(x, z - d) - MAP.elevM(x, z + d), L = Math.hypot(nx, ny, nz) || 1;
    return [nx / L, ny / L, nz / L];
  },
  quadT(mb, a, b, c, d, col, u) {
    for (const p of [a, d, c, a, c, b]) mb.v(p[0], p[1], p[2], p[3], p[4], p[5], col, u);
  },
  /* casillas del corredor de metro y tranvía (sin edificios encima de la vía) */
  railMask() { if (this._rm) return this._rm; const m = this._rm = new Set(); for (const l of NET.lines) { if (!(l.kind === 'metro' || l.kind === 'tram' || (l.kind === 'future' && !/cable/i.test(l.name)))) continue; for (let s = 0; s <= l.P.len; s += 8) { const p = NET.at(l.P, s), tx = Math.floor(p.x / TM), ty = Math.floor(p.y / TM); for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) m.add((ty + j) * MW + tx + i); } } return m; },
  /* malla lejana: todo el valle cada 320 m con normales suaves por vértice */
  buildFar(hx0, hz0, hx1, hz1) {   // con hueco (1.4.0): las celdas que caen enteras dentro de la ventana cercana no se arman (no hay piso doble que parpadee)
    const it = this.buildFarPasos(hx0, hz0, hx1, hz1); let r; do { r = it.next(); } while (!r.done); this.ponerFar(r.value);
  },
  /* 3.11.1: lo lejano por partes (cede cada fila de 320 m) para la ventana por partes (97e); devuelve las celdas sin subirlas */
  *buildFarPasos(hx0, hz0, hx1, hz1) {
    const S = 320, W = MW * TM, H = MH * TM, nx = Math.floor(W / S), nz = Math.floor(H / S), mb = new MBC(5120), E = (i, j) => { const x = i * S, z = j * S, n = this.normT(x, z, 80); return [x, MAP.elevM(x, z), z, n[0], n[1], n[2]]; };
    const U = this._U || (this._U = (() => { const U = []; for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) U.push(this.urban(i * S, j * S, 90)); return U; })());
    for (let j = 0; j < nz; j++) { for (let i = 0; i < nx; i++) { if (hx0 != null && i * S >= hx0 && (i + 1) * S <= hx1 && j * S >= hz0 && (j + 1) * S <= hz1) continue; const a = E(i, j), b = E(i + 1, j), c = E(i + 1, j + 1), d = E(i, j + 1), u = 2 + U[j * (nx + 1) + i] * .9; this.quadT(mb.en((i + .5) * S, (j + .5) * S), a, b, c, d, [1, 1, 1], u); } yield; }
    return mb.celdas();
  },
  ponerFar(C) { if (this.far) for (const q of this.far) this.gl.deleteBuffer(q); this.far = C.map(o => this.buf(o.a)); this.farBB = C.map(o => o.bb); },   // 3.9: por celdas, con su caja
  /* ventana cercana con textura vectorial de calles y edificios reales en 3D con techos y anillo extendido */
  buildNear(cx, cz) {
    const real = typeof VC !== 'undefined' && VC.on && !!VC.piso3D, gl = this.gl, half = real ? 1300 : 2400, x0 = Math.floor((cx - half) / TM) * TM, z0 = Math.floor((cz - half) / TM) * TM, nt = 2 * half / TM, P = 8;
    const cv = real ? VC.piso3D(x0, z0, 2 * half, (Save.d.settings.q === 'low' || this.liviano ? 1024 : 2048) / (2 * half)) : mkCanvas(nt * P, nt * P), g = real ? null : cv.getContext('2d'), img = real ? null : g.createImageData(nt * P, nt * P), d = real ? null : img.data, road = v => v === TT.ROAD || v === TT.AVE || v === TT.AUTO || v === TT.BRIDGE;
    if (!real) for (let ty = 0; ty < nt; ty++) for (let tx = 0; tx < nt; tx++) {
      const X = x0 / TM + tx, Y = z0 / TM + ty, v = MAP.tile(X, Y); let base = TRGB[v] || TRGB[0]; const ht = h2(X, Y, v), nN = road(MAP.tile(X, Y - 1)), nS = road(MAP.tile(X, Y + 1)), nW = road(MAP.tile(X - 1, Y)), nE = road(MAP.tile(X + 1, Y)), vert = nN || nS, horz = nW || nE;
      if (v === TT.BRICK || v === TT.BLDG) base = [92, 104, 72];
      for (let py = 0; py < P; py++) for (let px = 0; px < P; px++) {
        let m = .96 + ht * .06, col = base;
        if (road(v)) { const edge = (py === 0 && !nN) || (py === P - 1 && !nS) || (px === 0 && !nW) || (px === P - 1 && !nE); if (edge && v !== TT.BRIDGE) { col = [200, 194, 178]; m = 1; } else if (v !== TT.ROAD && ((vert && !horz && (px === 3 || px === 4) && py < 4 && (Y & 1)) || (horz && !vert && (py === 3 || py === 4) && px < 4 && (X & 1)))) { col = [244, 236, 208]; m = 1; } else m *= ((px + py) & 1) ? .985 : 1.01; }
        else if (v === TT.WALK || v === TT.PLAZA) { m *= (px % 4 === 0 || py % 4 === 0) ? .92 : 1; if ((py === P - 1 && nS) || (py === 0 && nN) || (px === 0 && nW) || (px === P - 1 && nE)) m = 1.12; }
        else if (v === TT.GRASS) { m *= ((px * 3 + py * 5 + (X ^ Y)) % 11 === 0) ? .84 : 1; }
        else if (v === TT.MOUNT) { m *= ((px * 7 + py * 3 + X * 5 + Y) % 9 === 0) ? .78 : .95; }
        else if (v === TT.WATER || v === TT.CANAL) { m *= ((py + (X * 3)) % 6 === 0 && px > 1 && px < 6) ? 1.15 : 1; }
        else if (v === TT.CICLO) { if (px === 3 || px === 4) { col = [250, 250, 245]; m = py % 4 < 2 ? 1 : .8; } }
        const o = ((ty * P + py) * nt * P + tx * P + px) * 4; d[o] = clamp(col[0] * m, 0, 255); d[o + 1] = clamp(col[1] * m, 0, 255); d[o + 2] = clamp(col[2] * m, 0, 255); d[o + 3] = 255;
      }
    }
    if (!real) g.putImageData(img, 0, 0);
    if (this.texNear) gl.deleteTexture(this.texNear); this.texNear = this.tex(cv, real);   // las calles reales, suavizadas
    for (const b of this.near.concat(this.bld)) gl.deleteBuffer(b);
    const S = 40, n = 2 * half / S, mb = new MB(), E = (i, j) => { const x = x0 + i * S, z = z0 + j * S, nm = this.normT(x, z, 20); return [x, MAP.elevM(x, z), z, nm[0], nm[1], nm[2]]; };
    const V = []; for (let j = 0; j <= n; j++) { const row = []; for (let i = 0; i <= n; i++) row.push(E(i, j)); V.push(row); }
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const a = V[j][i], b = V[j][i + 1], c = V[j + 1][i + 1], dd = V[j + 1][i], u = 2 + this.urban(a[0] + 20, a[2] + 20, 20) * .95; this.quadT(mb, a, b, c, dd, [1, 1, 1], u); }
    this.near = mb.done().map(a => this.buf(a));
    { const C = this.edifCerca(cx, cz, real).celdas(); this.bld = C.map(o => this.buf(o.a)); this.bldBB = C.map(o => o.bb); }   /* 3.9 (las dos ramas unidas): por celdas de 400 m con su caja, para el recorte por lo que ve la cámara (G3.vis) */
    this.win = { cx, cz, x0, z0, s: 2 * half }; if (real) this.buildFar(x0 + 40, z0 + 40, x0 + 2 * half - 40, z0 + 2 * half - 40);
  },
  /* 4.0 · los edificios y los árboles de la ventana cercana, aparte de buildNear para que 97d-cenital.js (Fase 2 del renacimiento
     cenital) los cambie solo en Ciudad Libre y Bus. Los demás modos dibujan exactamente lo mismo de antes */
  edifCerca(cx, cz, real) {
    // edificios: reales con techos hasta RR (700 m) + anillo real simplificado hasta R2 (1050 m) + siluetas lejanas hasta R (1250 m)
    const low = Save.d.settings.q === 'low' || this.liviano, R = low ? 600 : 1100,   /* 3.6: el regulador (96d-rendimiento.js) también lo pide */ bm = new MBC(400), RR = real && VC.ED ? (low ? 380 : 700) : 0, R2 = RR;
    if (RR) this.edifReales(bm, cx, cz, RR, R2);
    for (let bz = cz - R; bz < cz + R; bz += TM) for (let bx = cx - R; bx < cx + R; bx += TM) {
      const X = Math.floor(bx / TM) * TM, Z = Math.floor(bz / TM) * TM; if ((X - cx) ** 2 + (Z - cz) ** 2 > R * R || (R2 && (X - cx) ** 2 + (Z - cz) ** 2 < R2 * R2)) continue;
      const v = MAP.tileM(X + 10, Z + 10); if (v !== TT.BLDG && v !== TT.BRICK) continue; if (this.railMask().has((Z / TM | 0) * MW + (X / TM | 0))) continue;
      const r = h2(X, Z, 5), brick = v === TT.BRICK, hgt = brick ? 4 + r * 6 : MAP.bHeight(X + 10, Z + 10, X ^ Z), w = 11 + r * 4, l = 12 + h2(X, Z, 6) * 5, y = MAP.elevM(X + 10, Z + 10) - 2, a = h2(X, Z, 9) < .5 ? 0 : Math.PI / 2;
      const wall = brick ? (r < .55 ? (r < .3 ? [.71, .35, .23] : [.62, .3, .2]) : HOUSE_COL[(r * 97 | 0) % HOUSE_COL.length]) : [[.55, .59, .64], [.64, .66, .69], [.72, .69, .63], [.85, .8, .68], [.62, .72, .8]][(r * 5) | 0];
      if (brick) { bm.box(X + 10, y, Z + 10, a, l, w, hgt + 2, wall, wall, 1, 0); bm.roof(X + 10, y + hgt + 2, Z + 10, a, l, w, w * .32, ROOF_COL[(r * 31 | 0) % ROOF_COL.length]); if (r < .3) bm.box(X + 10 + l * .3, y + hgt + 2 + w * .1, Z + 10, 0, 1.2, 1.2, 2.2, [.5, .3, .22], [.3, .2, .15]); }
      else {
        const com = MAP.comunaAt(X, Z), glass = (/Candelaria|Poblado|Laureles/.test(com) && hgt > 22 && r > .35), wc = glass ? [[.55, .68, .8], [.62, .74, .78], [.5, .6, .72]][(r * 3) | 0] : wall;
        bm.box(X + 10, y, Z + 10, 0, l + 4, w + 4, 3.6, [.36, .33, .3], [.42, .4, .38], 0, 0);   // zócalo comercial
        bm.box(X + 10, y + 3.6, Z + 10, 0, l + 3, w + 3, hgt - 1.6, wc, [.5, .53, .57], 1, 0);
        bm.box(X + 10, y + hgt + 2, Z + 10, 0, l + 3.6, w + 3.6, .6, [.42, .44, .48], [.42, .44, .48]);   // remate
        if (hgt > 25 && r > .5) bm.box(X + 12, y + hgt + 2.6, Z + 8, 0, 4, 4, 2.5, [.8, .8, .82], [.3, .3, .32]); if (hgt > 40 && r > .6) bm.box(X + 10, y + hgt + 2.6, Z + 10, 0, .4, .4, 6, [.9, .2, .2], [.9, .2, .2], 4, 4);
      }
    }
    this.arboles3D(bm, cx, cz, low);
    return bm;
  },
  /* árboles en parques y montes cercanos (respetando canchas y plazas duras, con guayacanes florecidos) */
  arboles3D(bm, cx, cz, low) {
    const RT = low ? 350 : 750;
    for (let bz = cz - RT; bz < cz + RT; bz += TM) for (let bx = cx - RT; bx < cx + RT; bx += TM) {
      const X = Math.floor(bx / TM) * TM, Z = Math.floor(bz / TM) * TM; if ((X - cx) ** 2 + (Z - cz) ** 2 > RT * RT) continue;
      const v = MAP.tileM(X + 10, Z + 10), r = h2(X, Z, 13); if (!((v === TT.GRASS && r < .32) || (v === TT.MOUNT && r < .6))) continue;
      const tx = X + 3 + h2(X, Z, 14) * 14, tz = Z + 3 + h2(X, Z, 15) * 14;
      if (typeof VC !== 'undefined' && VC.on && VC.sembrable && !VC.sembrable(tx, tz, VC.suelosEn(tx - 2, tz - 2, tx + 2, tz + 2))) continue;
      const tci = v === TT.GRASS && h2(X, Z, 71) < .16 ? (h2(X, Z, 73) < .55 ? 5 : 6) : ((r * 53 | 0) % 5);
      bm.tree(tx, MAP.elevM(tx, tz) - .5, tz, 4 + r * 5, TREE_COL[tci]);
    }
  },
  /* las casas y los edificios reales en 3D (1.5.0–3.2.0):
     · Dentro de R (700 m): techos a dos aguas en teja de barro, terrazas en plancha con tanque de agua azul/negro en las laderas,
       remates arquitectónicos en edificios medianos y coronas escalonadas con baliza roja nocturna en las torres altas.
     · Entre R y R2 (700–1050 m): anillo exterior de edificios reales simplificados para ampliar el horizonte urbano sin perder fluidez. */
  edifReales(bm, cx, cz, R, R2 = R) {
    const RG = VC.R, Rmax = Math.max(R, R2), R2sq = Rmax * Rmax, Rsq = R * R, cols = new Map(), C = h => { let c = cols.get(h); if (!c) cols.set(h, c = rgb(h)); return c; };
    for (let ry = Math.floor((cz - Rmax) / RG); ry <= Math.floor((cz + Rmax) / RG); ry++) for (let rx = Math.floor((cx - Rmax) / RG); rx <= Math.floor((cx + Rmax) / RG); rx++) {
      const Rg = VC.reg.get(rx * 4096 + ry), L = Rg ? Rg.bs : VC.edifDe(rx, ry);
      for (const b of L) {
        const d2 = (b.x - cx) ** 2 + (b.y - cz) ** 2;
        if (b.rec === false || d2 > R2sq || (d2 > Rsq && b.h < 5.5)) continue;
        if (!Rg && b.rec === undefined && VC.enSegs(VC.segsCerca(b.x, b.y, 1), b.x, b.y)) continue;
        VC.estilo(b); const y = MAP.elevM(b.x, b.y) - 1.2, a = Math.atan2(b.uy, b.ux), Lx = b.hw * 2, Wz = b.hd * 2, H = Math.max(2.6, b.h) + 1.2;
        const cw = C(b.cw && b.cw[0] === '#' ? b.cw : '#d9d2c3'), cr = C(b.cr && b.cr[0] === '#' ? b.cr : '#b4583a');
        bm.box(b.x, y, b.y, a, Lx, Wz, H, cw, cr, 1, 0);
        if (d2 > Rsq) continue;   // anillo exterior (700–1050 m): caja limpia sin sub-mallas de techo
        const yt = y + H;
        const tq = h2(b.x | 0, b.y | 0, 41);
        if (b.rt === 'teja' && b.h < 11 && Lx < 22 && Wz < 22) {
          bm.roof(b.x, yt, b.y, a, Lx * .94, Wz * .94, Math.min(2.1, Math.min(Lx, Wz) * .26), cr);
        } else if (b.h < 12 && b.z === 'ladera' && (b.rt === 'plancha' || b.rt === 'azotea') && tq < .55 && Lx >= 4.5 && Wz >= 4.5) {
          // terraza o plancha de ladera con tanque de agua elevado
          const tc = tq < .2 ? [.16, .34, .58] : [.18, .19, .22];
          bm.box(b.x + b.ux * Lx * .22, yt, b.y + b.uy * Lx * .22, a, .95, .95, 1.15, tc, tc, 0, 0);
        } else if (b.h >= 26) {
          // cornisa + torre escalonada con cuarto de máquinas y baliza nocturna en las más altas
          bm.box(b.x, yt - .15, b.y, a, Lx + .45, Wz + .45, .55, cr, cr, 0, 0);
          bm.box(b.x, yt + .4, b.y, a, Lx * .62, Wz * .62, 2.8, cw, cr, 1, 0);
          if (b.h >= 42) bm.box(b.x, yt + 3.2, b.y, 0, .5, .5, 4.5, [.92, .2, .18], [.92, .2, .18], 4, 4);
        } else if (b.h >= 12 && d2 < Rsq * .55) {
          // remate superior de parapeto en edificios medianos cercanos
          bm.box(b.x, yt - .1, b.y, a, Lx + .3, Wz + .3, .45, cr, cr, 0, 0);
        }
      }
    }
    this.hitos3D(bm, cx, cz, Rmax); this.puentes3D(bm, cx, cz, R);
  },
  /* arquitectura icónica: muros por cada lado de su planta y tapa en abanico */
  hitos3D(bm, cx, cz, Rmax) {
    const HC = { aguja: '#d9dde2', basilica: '#a65a3c', iglesia: '#ece2cf', palacio: '#eeeeea', estadio: '#d7d3cb', rocas: '#2c2e33', vidrio: '#9fb7c9', ladrillo: '#a85b3d', republicano: '#e9dfc6', moderno: '#d0d4d8', cupula: '#e3ddd0', cubos: '#c9c3b6', luces: '#cfd2d6', botero: '#d8cfbd', pies: '#d8cfbd', alpujarra: '#e4e4e0' };
    for (const H of VC.HT || []) { if ((H.cx - cx) ** 2 + (H.cy - cz) ** 2 > (Rmax + 300) ** 2 || H.libre) continue; const col = rgb(HC[H.k] || '#e2dccf'), top = rgb('#8f8a80'), y0 = MAP.elevM(H.cx, H.cy) - 1.2, h = Math.max(4, H.h || 12);
      for (const Q of H.P) { const n = Q.length / 2; let sx = 0, sy = 0; for (let i = 0; i < n; i++) { sx += Q[2 * i]; sy += Q[2 * i + 1]; } const ox = sx / n, oy = sy / n;
        for (let i = 0; i < n; i++) { const j = (i + 1) % n, ax = Q[2 * i], ay = Q[2 * i + 1], bx = Q[2 * j], by = Q[2 * j + 1]; bm.quad([ax, y0, ay], [bx, y0, by], [bx, y0 + h, by], [ax, y0 + h, ay], col, 1); bm.tri([ox, y0 + h, oy], [bx, y0 + h, by], [ax, y0 + h, ay], top, 0); } } }
  },
  /* puentes y deprimidos: tablero por tramos a la altura de su rampa con pretiles, o muros de portal en los deprimidos */
  puentes3D(bm, cx, cz, R) {
    if (VC.puentesEn) for (const B of VC.puentesEn(cx - R, cz - R, cx + R, cz + R)) { const P = B.P, col = rgb(B.pe ? '#b9b3a7' : '#8d8a84');
      for (let i = 1; i < P.length / 2; i++) { const ax = P[2 * i - 2], ay = P[2 * i - 1], bx = P[2 * i], by = P[2 * i + 1], L = Math.hypot(bx - ax, by - ay); if (L < .5) continue; const mx = (ax + bx) / 2, my = (ay + by) / 2, s = VC.puProy(B, mx, my).s, h = VC.puAlto(B, s); if (h < .6) continue;
        const an = Math.atan2(by - ay, bx - ax), nx = -Math.sin(an) * (B.w / 2 + .2), ny = Math.cos(an) * (B.w / 2 + .2), zm = MAP.elevM(mx, my);
        if (B.is_tunnel) { bm.box(mx + nx, zm - h, my + ny, an, L + .3, .7, h + .8, col, col); bm.box(mx - nx, zm - h, my - ny, an, L + .3, .7, h + .8, col, col); }
        else { bm.box(mx, zm + h - .9, my, an, L + .4, B.w, .9, col, rgb('#5d5d5d'), 0, 0); bm.box(mx + nx, zm + h, my + ny, an, L + .3, .28, .75, col, col); bm.box(mx - nx, zm + h, my - ny, an, L + .3, .28, .75, col, col); } } }
  },
  /* red de transporte estática: viaductos, rieles, postes, estaciones con interior (andén, línea amarilla, torniquetes y escaleras), torres de cable y carriles de bus */
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
    const mb = new MBC(800), lines = [];   // 3.6: por celdas
    for (const l of NET.lines) {
      const col = rgb(l.color), K = l.kind;
      if (K === 'metro' || K === 'tram' || (K === 'future' && !/cable/i.test(l.name))) {
        const T = this.trackZ(l), dk = K === 'metro';
        for (let i = 0; i < T.n - 1; i++) {
          const a = NET.at(l.P, i * 12), b = NET.at(l.P, (i + 1) * 12), za = T.z[i], zb = T.z[i + 1], sa = [-Math.sin(a.a), Math.cos(a.a)], sb = [-Math.sin(b.a), Math.cos(b.a)], hw = dk ? 4.6 : 3.2;
          const E = (p, s, o, z) => [p.x + s[0] * o, z, p.y + s[1] * o];
          mb.quad(E(a, sa, -hw, za), E(a, sa, hw, za), E(b, sb, hw, zb), E(b, sb, -hw, zb), dk ? [.58, .57, .55] : [.42, .44, .47]);
          if (dk) { mb.quad(E(a, sa, hw, za), E(a, sa, hw, za - 1.4), E(b, sb, hw, zb - 1.4), E(b, sb, hw, zb), [.52, .51, .49]); mb.quad(E(a, sa, -hw, za - 1.4), E(a, sa, -hw, za), E(b, sb, -hw, zb), E(b, sb, -hw, zb - 1.4), [.52, .51, .49]);
            // pretiles a lado y lado del tablero
            mb.quad(E(a, sa, hw - .25, za + .95), E(a, sa, hw - .25, za), E(b, sb, hw - .25, zb), E(b, sb, hw - .25, zb + .95), [.66, .65, .62]); mb.quad(E(a, sa, -hw + .25, za), E(a, sa, -hw + .25, za + .95), E(b, sb, -hw + .25, zb + .95), E(b, sb, -hw + .25, zb), [.66, .65, .62]); }
          // balasto bajo cada vía y rieles de acero claros
          for (const c of [-1.7, 1.7]) mb.quad(E(a, sa, c - 1.25, za + .05), E(a, sa, c + 1.25, za + .05), E(b, sb, c + 1.25, zb + .05), E(b, sb, c - 1.25, zb + .05), dk ? [.4, .37, .34] : [.33, .32, .31]);
          for (const o of [-2.3, -1.1, 1.1, 2.3]) mb.quad(E(a, sa, o - .09, za + .16), E(a, sa, o + .09, za + .16), E(b, sb, o + .09, zb + .16), E(b, sb, o - .09, zb + .16), [.66, .67, .7]);
          if (dk && i % 3 === 0) mb.box(a.x, T.g[i] - 2, a.y, a.a, 1.8, 2.2, za - T.g[i] + .6, [.68, .65, .58], [.68, .65, .58]);
          if (i % 4 === 0) { const q = E(a, sa, hw - .4, za); mb.box(q[0], za, q[2], a.a, .35, .35, 6.5, [.35, .37, .4], [.35, .37, .4]); const q2 = E(a, sa, 0, za); mb.box((q[0] + q2[0]) / 2, za + 6, (q[2] + q2[2]) / 2, a.a + Math.PI / 2, hw, .2, .25, [.35, .37, .4], [.35, .37, .4]); }
        }
        const K2 = KIND[K === 'future' ? 'tram' : K];
        for (const s of l.st) {
          const p = NET.at(l.P, s.s), z = this.zOn(l, s.s), ca = Math.cos(p.a), sa = Math.sin(p.a), nx = -sa, ny = ca, gz = MAP.elevM(p.x, p.y);
          for (const sd of [-1, 1]) {
            const o = sd * (dk ? 7.5 : 5.5), x = p.x + nx * o, y = p.y + ny * o, zp = z + (dk ? 1 : .9);
            // andén con su franja amarilla táctil de seguridad, columnas de cubierta y marquesina
            mb.box(x, z - (dk ? 1.2 : .2), y, p.a, K2.plat, dk ? 5 : 3, dk ? 2.2 : 1.1, [.85, .8, .7], [.88, .84, .74]);
            const yo = sd * (dk ? 5.35 : 4.25); mb.box(p.x + nx * yo, zp, p.y + ny * yo, p.a, K2.plat * .96, .32, .06, [.96, .77, .22], [.96, .77, .22], 4, 4);
            mb.box(x, z + 4.6, y, p.a, K2.plat * .9, dk ? 6 : 3.6, .6, col, col, .4, .4);   // marquesina (k + 0,4: techo de estación; 97d-cenital.js lo abre si vas debajo)
            for (let u = -K2.plat * .38; u <= K2.plat * .38; u += K2.plat * .38) mb.box(x + ca * u, zp, y + sa * u, p.a, .35, .35, 3.6, [.38, .42, .46], [.38, .42, .46]);
          }
          if (dk) {
            // escaleras de acceso de la calle a cada andén (el vestíbulo a ras de piso se quitó: quedaba enterrado y tapaba la calle de abajo)
            for (const sd of [-1, 1]) for (let k = 0; k < 5; k++) { const f = (k + .5) / 5, sx = p.x + ca * (14 + k * 2.2) + nx * sd * 7.5, sy = p.y + sa * (14 + k * 2.2) + ny * sd * 7.5; mb.box(sx, gz - .4 + f * (z - gz), sy, p.a, 2.4, 2.2, .5, [.78, .75, .68], [.88, .84, .74]); }
          }
        }
      } else if (K === 'cable' || (K === 'future' && /cable/i.test(l.name))) {
        const C = this.cableGeo(l);
        for (const p of C.pts) { const gz = MAP.elevM(p.x, p.y); if (p.st) { mb.box(p.x, gz - 2, p.y, 0, 34, 22, p.z - gz + 2, [.86, .84, .8], col, 1.4, .4); mb.box(p.x, p.z + 2, p.y, 0, 38, 26, 1.2, col, col, .4, .4); } else { mb.box(p.x, gz - 1, p.y, Math.PI / 4, 3.4, 3.4, p.z - gz + 3, [.72, .74, .78], [.72, .74, .78]); mb.box(p.x, p.z + 1.5, p.y, 0, 6, 9, 1, [.5, .52, .56], [.5, .52, .56]); } }
        const seg = []; for (let s = 0; s <= C.P.len; s += 14) { const q = NET.at(C.P, s); seg.push([q.x, C.zAt(s) + 2, q.y]); } lines.push({ pts: seg, c: [.12, .12, .14] });
      } else if (K === 'brt' || K === 'feeder') {
        const w = K === 'brt' ? 3.2 : 1.6, dark = col.map(v => v * .85);
        for (let s = 0; s < l.P.len - 10; s += 10) { const a = NET.at(l.P, s), b = NET.at(l.P, s + 10), za = MAP.elevM(a.x, a.y) + .45, zb = MAP.elevM(b.x, b.y) + .45, sa = [-Math.sin(a.a), Math.cos(a.a)]; mb.quad([a.x + sa[0] * -w, za, a.y + sa[1] * -w], [a.x + sa[0] * w, za, a.y + sa[1] * w], [b.x + sa[0] * w, zb, b.y + sa[1] * w], [b.x + sa[0] * -w, zb, b.y + sa[1] * -w], dark, 4); }
        for (const s of l.st) { const z = MAP.elevM(s.x, s.y), an = NET.at(l.P, s.s).a; mb.box(s.x, z, s.y, an, K === 'brt' ? 24 : 6, K === 'brt' ? 4 : 2.4, 3.2, [.85, .85, .82], col, .4, .4); if (K === 'brt') mb.box(s.x, z + .55, s.y, an, 23, 4.15, .08, [.96, .77, .22], [.96, .77, .22], 4, 4); }
      }
    }
    this.decor(mb);
    if (this.stat) for (const q of this.stat) this.gl.deleteBuffer(q); const C = mb.celdas(); this.stat = C.map(o => this.buf(o.a)); this.statXY = C.map(o => o.cx == null ? null : [o.cx, o.cz]); this.statBB = C.map(o => o.bb);
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
    const gl = this.gl, cv = this.cv, q = Save.d.settings.q === 'low' ? .45 : (Save.d.settings.px3d === 'fino' ? Math.min(1.5, window.devicePixelRatio || 1) : opts.escala || .82), ir = opts.suave === false ? 'pixelated' : 'auto'; if (cv.style.imageRendering !== ir) cv.style.imageRendering = ir;
    const w = Math.max(64, Math.round(cv.clientWidth * q)), h = Math.max(64, Math.round(cv.clientHeight * q)); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    if (!this.win || dist(cam.eye[0], cam.eye[2], this.win.cx, this.win.cz) > Math.min(1000, this.win.s * .2)) this.buildNear(cam.eye[0], cam.eye[2]);
    const sky = SKY.at(opts.hour != null ? opts.hour : 12), V = M4.look(cam.eye, cam.at), Pm = M4.persp(cam.fov || 1.05, w / h, opts.cerca || 1.2, 26000), VP = M4.mul(Pm, V); this.VP = VP; this.vw = w; this.vh = h;
    gl.viewport(0, 0, w, h); gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
    // cielo con gradiente y sol
    const S = this.S, sd = sky.sun.dir, sp = M4.xf(VP, cam.eye[0] + sd[0] * 2e4, cam.eye[1] + sd[1] * 2e4, cam.eye[2] + sd[2] * 2e4);
    for (const k in this.P.a) if (this.P.a[k] >= 0) gl.disableVertexAttribArray(this.P.a[k]);
    const sl = gl.getAttribLocation(S.p, 'p'); gl.useProgram(S.p); gl.bindBuffer(gl.ARRAY_BUFFER, this.quadB); gl.enableVertexAttribArray(sl); gl.vertexAttribPointer(sl, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(S.u.top, sky.top); gl.uniform3fv(S.u.bot, sky.bot); gl.uniform3fv(S.u.sp, [sp[3] > 0 ? sp[0] : 9, sp[3] > 0 ? sp[1] : 9, w / h]); gl.uniform3fv(S.u.sc, sky.sun.el > -.05 ? [1, .85 * (.6 + .4 * sky.day), .6 * sky.day + .2] : [.5, .55, .7]);
    gl.drawArrays(gl.TRIANGLES, 0, 3); gl.disableVertexAttribArray(sl);
    gl.enable(gl.DEPTH_TEST); gl.clear(gl.DEPTH_BUFFER_BIT);
    const P = this.P; gl.useProgram(P.p); const u = P.u;
    gl.uniformMatrix4fv(u.VP, false, VP); gl.uniform3fv(u.sun, sky.sun.el > 0 ? sd : [-sd[0], .3, -sd[2]]); gl.uniform3fv(u.amb, sky.amb); gl.uniform3fv(u.sunc, sky.sunc); gl.uniform3fv(u.fogc, opts.fog || sky.fog); if (u.camPos) gl.uniform3fv(u.camPos, cam.eye); if (u.uReal) gl.uniform1f(u.uReal, (G3.simple || (Save.d && Save.d.settings && Save.d.settings.realismo === 0)) ? 0 : 1);   // 3.6: el regulador de 96d-rendimiento.js también lo apaga
    gl.uniform1f(u.fogd, (opts.fogd || 1 / 9000) * (opts.rain ? 2.2 : 1)); gl.uniform1f(u.night, sky.night); gl.uniform1f(u.time, now()); gl.uniform4fv(u.tint, [0, 0, 0, 0]); gl.uniform1i(u.T, 0); gl.activeTexture(gl.TEXTURE0);
    const I = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); gl.uniformMatrix4fv(u.M, false, I);
    const run = (b, mode = gl.TRIANGLES) => { gl.bindBuffer(gl.ARRAY_BUFFER, b); const st = 40; gl.enableVertexAttribArray(P.a.p); gl.vertexAttribPointer(P.a.p, 3, gl.FLOAT, false, st, 0); gl.enableVertexAttribArray(P.a.n); gl.vertexAttribPointer(P.a.n, 3, gl.FLOAT, false, st, 12); gl.enableVertexAttribArray(P.a.c); gl.vertexAttribPointer(P.a.c, 3, gl.FLOAT, false, st, 24); gl.enableVertexAttribArray(P.a.k); gl.vertexAttribPointer(P.a.k, 1, gl.FLOAT, false, st, 36); gl.drawArrays(mode, 0, b.n); };
    /* 3.9 (Claude) · recorte por lo que ve la cámara (G3.vis) y orden de adelante hacia atrás: primero lo que se levanta (la red y los
       edificios), después el piso cercano y al final el lejano. Así la tarjeta descarta sin pintarlos los píxeles que ya quedaron tapados
       (antes el piso lejano se pintaba entero y encima todo lo demás). El piso sigue un poco atrás (polygonOffset): nada parpadea */
    const W = this.win, vis = (B, i) => !B || !B[i] || this.vis(VP, B[i]), K = this._cull = { far: 0, bld: 0, stat: 0 };
    gl.bindTexture(gl.TEXTURE_2D, this.texNear); gl.uniform4fv(u.R, [W.x0, W.z0, W.s, W.s]); gl.uniform4fv(u.Rv, [W.x0, W.z0, W.s, W.s]); gl.uniform4fv(u.hole, [0, 0, 0, 0]); gl.uniform4fv(u.Hv, [0, 0, 0, 0]);
    { const ex = cam.eye[0], ez = cam.eye[2], alto = Math.max(0, cam.eye[1] - (MAP.ready ? MAP.elevM(ex, ez) : 1500)), Rd = (this.liviano ? 1300 : 2400) + 2 * alto, R2 = Rd * Rd;   // 3.6: solo las celdas cercanas (más lejos si la cámara va alta)
      for (let i = 0; i < this.stat.length; i++) { const c = this.statXY && this.statXY[i]; if ((!c || (c[0] - ex) ** 2 + (c[1] - ez) ** 2 < R2) && vis(this.statBB, i)) { run(this.stat[i]); K.stat++; } } }
    for (let i = 0; i < this.bld.length; i++) if (vis(this.bldBB, i)) { run(this.bld[i]); K.bld++; }
    gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1.5, 6);   // el piso un poco atrás: lo que va pegado encima (andenes, plazas, carriles) no parpadea
    for (const b of this.near) run(b);
    gl.bindTexture(gl.TEXTURE_2D, this.texFar); gl.uniform4fv(u.R, [0, 0, MW * TM, MH * TM]); gl.uniform4fv(u.Rv, [0, 0, MW * TM, MH * TM]); gl.uniform4fv(u.hole, [W.x0 + 40, W.z0 + 40, W.x0 + W.s - 40, W.z0 + W.s - 40]); gl.uniform4fv(u.Hv, [W.x0 + 40, W.z0 + 40, W.x0 + W.s - 40, W.z0 + W.s - 40]);
    for (let i = 0; i < this.far.length; i++) if (vis(this.farBB, i)) { run(this.far[i]); K.far++; }
    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.bindTexture(gl.TEXTURE_2D, this.texNear); gl.uniform4fv(u.R, [W.x0, W.z0, W.s, W.s]); gl.uniform4fv(u.Rv, [W.x0, W.z0, W.s, W.s]); gl.uniform4fv(u.hole, [0, 0, 0, 0]); gl.uniform4fv(u.Hv, [0, 0, 0, 0]);   // lo dinámico, con el estado de siempre
    if (this.wires) run(this.wires, gl.LINES);
    this._run = run; this._I = I;
    if (opts.dyn) opts.dyn(this);
  },
  /* 3.9 (Claude) · ¿la caja bb = [x0, y0, z0, x1, y1, z1] cae dentro de lo que ve la cámara? Se descarta solo si sus 8 esquinas quedan
     del lado de afuera del mismo plano (izquierda, derecha, abajo, arriba, cerca o lejos), en coordenadas de recorte: así nunca se
     pierde algo visible, ni siquiera con esquinas detrás de la cámara */
  vis(m, bb) {
    let o = 0, a = 63;
    for (let i = 0; i < 8; i++) {
      const x = i & 1 ? bb[3] : bb[0], y = i & 2 ? bb[4] : bb[1], z = i & 4 ? bb[5] : bb[2], w = m[3] * x + m[7] * y + m[11] * z + m[15], cx = m[0] * x + m[4] * y + m[8] * z + m[12], cy = m[1] * x + m[5] * y + m[9] * z + m[13], cz = m[2] * x + m[6] * y + m[10] * z + m[14];
      o = (cx < -w ? 1 : 0) | (cx > w ? 2 : 0) | (cy < -w ? 4 : 0) | (cy > w ? 8 : 0) | (cz < -w ? 16 : 0) | (cz > w ? 32 : 0); a &= o; if (!a) return true;
    }
    return false;
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
  /* gente esperando en los andenes y paradas cercanas */
  people(cam, t) {
    const n = Save.d.settings.q === 'low' ? 3 : 6;
    for (const l of NET.lines) { if (l.kind === 'future') continue; for (const s of l.st) { if (Math.abs(s.x - cam.eye[0]) > 900 || Math.abs(s.y - cam.eye[2]) > 900) continue; const p = NET.at(l.P, s.s), z = l.kind === 'metro' || l.kind === 'tram' ? this.zOn(l, s.s) : MAP.elevM(s.x, s.y), K = KIND[l.kind], sx = -Math.sin(p.a), sy = Math.cos(p.a);
      for (let i = 0; i < n; i++) { const r = h2(s.i, i, hashStr(l.id)), r2 = h2(i, s.i, 5), u = (r - .5) * K.plat * .8, sd = r2 < .5 ? -1 : 1, o = sd * (l.kind === 'metro' ? 8.4 : l.kind === 'tram' ? 6.4 : 3) + Math.sin(t * .4 + i) * .4, px = p.x + Math.cos(p.a) * u + sx * o, py = p.y + Math.sin(p.a) * u + sy * o, zz = z + (l.kind === 'metro' ? 1 : l.kind === 'tram' ? .9 : 0);
        const col = PED_COL[(r * 97 | 0) % PED_COL.length]; this.box(px, zz, py, p.a, .55, .5, 1.1, rgb(col)); this.box(px, zz + 1.1, py, p.a, .4, .4, .4, rgb(SKIN[(r2 * 5) | 0])); } } }
  },
  vehicle(x, z, y, a, len, kind, c) {
    const ca = Math.cos(a), sa = Math.sin(a);
    if (kind === 'scooter' || kind === 'monopatin') {
      this.box(x, z + .14, y, a, 1.15, .28, .08, kind === 'monopatin' ? [.18, .2, .24] : [.75, .78, .82]);
      this.box(x + ca * .44, z + .18, y + sa * .44, a, .08, .08, .86, c);
      this.box(x + ca * .44, z + 1.02, y + sa * .44, a, .08, .54, .07, [.18, .18, .2]);
      for (const u of [-.46, .46]) this.box(x + ca * u, z + .04, y + sa * u, a, .22, .12, .22, [.14, .14, .16]);
      return;
    }
    if (kind === 'skate') {
      this.box(x, z + .14, y, a, .88, .26, .06, c);
      for (const u of [-.28, .28]) this.box(x + ca * u, z + .04, y + sa * u, a, .12, .32, .12, [.92, .38, .18]);
      return;
    }
    if (kind === 'patines') {
      for (const v of [-.14, .14]) this.box(x - sa * v, z + .06, y + ca * v, a, .38, .12, .14, c);
      return;
    }
    if (kind === 'bici') {
      this.box(x, z + .35, y, a, 1.7, .14, .58, c);
      this.box(x + ca * .58, z + .62, y + sa * .58, a, .1, .58, .08, [.2, .2, .22]);
      for (const u of [-.56, .56]) this.box(x + ca * u, z + .05, y + sa * u, a, .52, .09, .52, [.15, .15, .18]);
      return;
    }
    if (kind === 'moto') {
      this.box(x, z + .28, y, a, 1.95, .58, .65, c);
      this.box(x + ca * .55, z + .72, y + sa * .55, a, .18, .74, .32, [.16, .18, .22]);
      return;
    }
    if (kind === 'carro' || kind === 'taxi') {
      this.box(x, z + .28, y, a, len || 4.4, 1.82, .76, c);
      this.box(x - ca * .2, z + 1.04, y - sa * .2, a, (len || 4.4) * .54, 1.66, .56, [.15, .22, .3]);
      return;
    }
    const body = kind === 'metro' || kind === 'tram' ? [.86, .88, .9] : c, H = kind === 'metro' ? 3.7 : 3.2, W = kind === 'metro' ? 2.9 : 2.55;
    this.box(x, z + .5, y, a, len, W, H * .55, body); this.box(x, z + .5 + H * .55, y, a, len * .98, W * .98, H * .3, [.12, .2, .28]); this.box(x, z + .5 + H * .85, y, a, len, W, H * .15, kind === 'metro' || kind === 'tram' ? c : [.95, .95, .93]);
  },
  /* de mundo a pantalla (para letreros 2D sobre el 3D) */
  toScreen(x, y, z, W, H) { const q = M4.xf(this.VP, x, y, z); if (q[3] <= 0 || q[2] > 1) return null; return { x: (q[0] * .5 + .5) * W, y: (1 - (q[1] * .5 + .5)) * H, d: q[3] }; },
  show(on) { if (this.cv) this.cv.style.display = on ? 'block' : 'none'; }
};
