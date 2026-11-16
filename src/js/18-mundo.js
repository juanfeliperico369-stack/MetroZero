/* =====================================================================
   EL MUNDO: reloj del juego (ciclo día/noche), clima de Medellín y fechas especiales.
   · Reloj: parte de la hora real del dispositivo; en el juego corre ×30 (1 min real = 30 min),
     o real, o fijo de día / de noche (Ajustes).
   · Clima: despejado, nubes, lluvia, tormenta o niebla según la temporada (lluvias de mar–may y sep–nov),
     la hora (aguaceros por la tarde, neblina al amanecer) y una semilla del día: todos los modos ven el mismo cielo.
   · Fechas: cumpleaños del Metro (30 nov), Alumbrados, Velitas, Navidad, Año Nuevo, Feria de las Flores,
     20 de julio, 7 de agosto, Amor y Amistad, Halloween, Semana Santa… con adornos en los escenarios.
   ===================================================================== */
const Mundo = EM.mundo = {
  t0: now(), h0: null,
  speed() { const c = (Save.d && Save.d.settings.ciclo) || 'rapido'; return c === 'real' ? 1 : c === 'rapido' ? 30 : 0; },
  /* hora del juego (0–24, fraccional) */
  hour() {
    const c = (Save.d && Save.d.settings.ciclo) || 'rapido'; if (c === 'dia') return 11.2; if (c === 'noche') return 21.3;
    const d = new Date(); if (this.h0 == null) this.h0 = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
    if (c === 'real') return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
    return (this.h0 + (now() - this.t0) * 30 / 3600) % 24;
  },
  date() { return new Date(); },
  doy(d = new Date()) { return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5); },
  /* ---------- clima ---------- */
  weather(h = this.hour()) {
    const d = new Date(), m = d.getMonth() + 1, wet = [3, 4, 5, 9, 10, 11].includes(m) ? 1 : m === 12 || m === 6 ? .5 : .25, blk = Math.floor(h / .75), seed = hashStr(this.dayKey() + ':' + blk);
    const r = h2(seed, 1, 7), aft = h >= 13 && h < 19 ? 1 : h >= 19 || h < 1 ? .45 : .2, dawn = h >= 4.5 && h < 8.5 ? 1 : 0;
    let k = 'despejado'; const pR = .1 + .45 * wet * aft, pT = .12 * wet * aft, pF = .25 * dawn + .05, pN = .3;
    if (r < pT) k = 'tormenta'; else if (r < pT + pR) k = 'lluvia'; else if (r < pT + pR + pF) k = 'niebla'; else if (r < pT + pR + pF + pN) k = 'nubes';
    const f = (h / .75) % 1, nk = this._wk(seed, h);  // transición suave al siguiente bloque
    return { k, rain: k === 'lluvia' || k === 'tormenta', storm: k === 'tormenta', fog: k === 'niebla', clouds: k === 'nubes' || k === 'lluvia' || k === 'tormenta' ? 1 : .35, mix: f, icon: { despejado: h >= 6 && h < 18.3 ? '☀' : '☾', nubes: '⛅', lluvia: '🌧', tormenta: '⛈', niebla: '🌫' }[k], name: { despejado: 'Despejado', nubes: 'Nublado', lluvia: 'Lluvia', tormenta: 'Tormenta eléctrica', niebla: 'Neblina' }[k] };
  },
  _wk() { return null; },
  dayKey(d = new Date()) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); },
  /* temperatura (°C): eterna primavera, más fresco en las lomas (−6,5 °C por km de altura) */
  temp(h = this.hour(), elev = 1495) { const w = this.weather(h); return Math.round(22 + 5.5 * Math.sin((h - 9) / 24 * TAU) - (w.rain ? 3 : 0) - (elev - 1495) * .0065); },
  /* ---------- fechas especiales ---------- */
  fiestas(d = new Date()) {
    const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate(), wd = d.getDay(), out = [], nth = (mo, wdT, n) => { let c = 0; for (let i = 1; i <= 31; i++) { const q = new Date(y, mo - 1, i); if (q.getMonth() !== mo - 1) break; if (q.getDay() === wdT && ++c === n) return i; } return -1; };
    const add = (k, t, deco) => out.push({ k, t, deco });
    const aniv = new Date(y, 10, 30), faltan = Math.ceil((aniv - new Date(y, m - 1, day)) / 864e5), años = y - 1995;
    if (faltan === 0) add('aniv', '¡Hoy el Metro cumple ' + años + ' años! Abrió el 30 de noviembre de 1995 · pasajes ×2', 'fuegos');
    else if (faltan > 0 && faltan <= 21) add('pre', 'Faltan ' + faltan + ' días para que el Metro cumpla ' + años + ' años (30 de noviembre)', 'banderines');
    if (m === 12 && day === 7) add('velitas', 'Noche de Velitas: faroles y velas en andenes y balcones', 'velas');
    if (m === 12 && day >= 16 && day <= 24) add('novena', 'Novena de aguinaldos: buñuelos, natilla y villancicos en las estaciones', 'luces');
    if (m === 12 && (day === 24 || day === 25)) add('navidad', '¡Feliz Navidad! El último tren sale más temprano en Nochebuena', 'luces');
    if ((m === 12 && day >= 31) || (m === 1 && day === 1)) add('anonuevo', '¡Feliz año nuevo! Pólvora no, abrazos sí', 'fuegos');
    if (m === 12 || (m === 1 && day <= 10) || (m === 11 && day >= 28)) add('alumbrados', 'Alumbrados navideños: el río y los barrios se llenan de luces', 'luces');
    if (m === 8 && day <= 12) add('feria', 'Feria de las Flores: los silleteros bajan de Santa Elena · flores en las estaciones', 'flores');
    if (m === 8 && day === nth(8, 0, 2)) add('silleteros', 'Hoy es el Desfile de Silleteros', 'flores');
    if (m === 7 && day === 20) add('julio20', '20 de julio: Día de la Independencia · banderas en las estaciones', 'banderas');
    if (m === 8 && day === 7) add('boyaca', '7 de agosto: Batalla de Boyacá', 'banderas');
    if (m === 8 && day === 11) add('antioquenidad', 'Día de la Antioqueñidad', 'banderas');
    if (m === 9 && (day === nth(9, 6, 3) || day === nth(9, 6, 3) + 1)) add('amor', 'Amor y Amistad: comparte el viaje (y el tinto)', 'corazones');
    if (m === 10 && day === 31) add('halloween', 'Día de los niños: disfraces en los vagones', 'calabazas');
    if (m === 5 && day === nth(5, 0, 2)) add('madre', 'Día de la Madre: ¡a llamar a la mamá!', 'flores');
    const P = pascua(y), dp = Math.round((new Date(y, m - 1, day) - P) / 864e5); if (dp >= -7 && dp <= 0) add('santa', 'Semana Santa: horario especial y muchos viajeros hacia las terminales', 'morado');
    return out;
  },
  deco() { const f = this.fiestas(); return f.length ? f[0].deco : ''; },
  has(k) { return this.fiestas().some(f => f.k === k); },
  /* ambiente de luz para los lienzos 2D: tinte multiplicativo, luces y oscuridad */
  light(h = this.hour()) { const s = SKY.at(h), w = this.weather(h); return { night: s.night, day: s.day, tint: s.night > .05 ? 'rgba(20,32,80,' + (s.night * .55) + ')' : null, golden: clamp(1 - Math.abs(h - 17.6) / .9, 0, 1) * .3 + clamp(1 - Math.abs(h - 6.2) / .7, 0, 1) * .25, w }; },
  chip() { const h = this.hour(), w = this.weather(h); return w.icon + ' ' + pad2(Math.floor(h)) + ':' + pad2(Math.floor((h % 1) * 60)) + ' · ' + this.temp(h) + '°'; },
  /* capa de clima y luz para cualquier lienzo 2D (lluvia, niebla, noche, hora dorada, grano) */
  overlay(g, W, H, t, opts = {}) {
    const L = this.light(), w = L.w;
    if (L.tint && !opts.noNight) { const q = opts.soft ? .45 : 1; g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgb(' + Math.round(255 - 170 * L.night * q) + ',' + Math.round(255 - 150 * L.night * q) + ',' + Math.round(255 - 80 * L.night * q) + ')'; g.fillRect(0, 0, W, H); g.restore(); }
    if (L.golden > .02) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(255,150,60,' + L.golden + ')'; g.fillRect(0, 0, W, H); g.restore(); }
    if (w.fog) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(225,230,235,.5)'); gr.addColorStop(1, 'rgba(225,230,235,.15)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
    if (w.rain && !opts.noRain) { g.strokeStyle = 'rgba(210,228,240,.42)'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i < 90; i++) { const x = (h2(i, 3, 3) * W + t * 80) % W, y = (h2(i, 4, 3) * H + t * 650 * (1 + h2(i, 5, 3))) % H; g.moveTo(x, y); g.lineTo(x - 4, y + 13); } g.stroke(); if (w.storm && (t % 9) < .12) { g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(0, 0, W, H); } }
    if (!opts.noGrain) this.grain(g, W, H);
    this.decoOverlay(g, W, H, t, L);
  },
  /* grano de película y viñeta (estilo arte de concepto cinematográfico) */
  grain(g, W, H) {
    if (!this._gr) { const c = mkCanvas(128, 128), q = c.getContext('2d'), im = q.createImageData(128, 128); for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 14; } q.putImageData(im, 0, 0); this._gr = c; }
    g.save(); g.fillStyle = g.createPattern(this._gr, 'repeat'); g.translate((Math.random() * 128) | 0, (Math.random() * 128) | 0); g.fillRect(-128, -128, W + 256, H + 256); g.restore();
    const v = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,14,30,.32)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  },
  /* adornos de fecha en 2D: fuegos artificiales, corazones, banderines… */
  decoOverlay(g, W, H, t, L) {
    const d = this.deco(); if (!d) return;
    if (d === 'fuegos' && L.night > .4) for (let i = 0; i < 3; i++) { const p = (t * .35 + i * .37) % 1, x = W * (.2 + .6 * h2(i, Math.floor(t * .35 + i * .37), 1)), y = H * (.12 + .2 * h2(i, 2, Math.floor(t * .35))), r = p * Math.min(W, H) * .12; for (let k = 0; k < 14; k++) { const a = k / 14 * TAU; g.fillStyle = ['#EC343A', '#F6C538', '#59AB42', '#1C5C9C', '#EB318E'][(i + k) % 5]; g.globalAlpha = 1 - p; g.fillRect(x + Math.cos(a) * r, y + Math.sin(a) * r, 3, 3); } g.globalAlpha = 1; }
    if (d === 'corazones') for (let i = 0; i < 8; i++) { const x = h2(i, 1, 4) * W, y = H - ((t * 30 + h2(i, 2, 4) * H) % H); g.fillStyle = 'rgba(236,52,58,.55)'; g.font = '16px sans-serif'; g.fillText('❤', x, y); }
    if (d === 'banderines') { const n = 18; for (let i = 0; i < n; i++) { const x = W * i / n, y = 4 + Math.sin(i * 1.3) * 3; g.fillStyle = ['#1C5C9C', '#E38835', '#59AB42', '#F6C538', '#EB318E', '#743D90', '#EC343A'][i % 7]; g.beginPath(); g.moveTo(x, y); g.lineTo(x + W / n * .8, y); g.lineTo(x + W / n * .4, y + 12); g.fill(); } }
  }
};
