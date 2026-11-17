/* =====================================================================
   SPRITES CENITALES: vehículos y peatones dibujados con detalle (contorno, techo,
   vidrios, luces, retrovisores, livery) para la vista desde arriba estilo GTA 1/2.
   Todo se dibuja centrado en el origen mirando hacia +x; el que llama rota y escala.
   ===================================================================== */
const Spr = EM.spr = {
  rr(g, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); if (g.roundRect) { g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); } else g.fillRect(x, y, w, h); },
  /* kind: car taxi moto bus brt metro tram cable camioneta · o: {end:'front'|'back'|'both'|'mid', lights, night, doors:'left'|'right', sign}
     L, W en píxeles */
  veh(g, kind, L, W, col, o = {}) {
    const dark = '#141414', glass = o.night ? '#263a4d' : '#1f2e3d', glassL = o.night ? '#355068' : '#2f4a60', R = this.rr.bind(this);
    if (kind === 'moto') {
      g.fillStyle = dark; g.fillRect(-L / 2, -W * .32, L * .28, W * .64); g.fillRect(L / 2 - L * .28, -W * .32, L * .28, W * .64);   // ruedas
      g.fillStyle = col; R(g, -L * .3, -W * .36, L * .6, W * .72, W * .2);
      g.fillStyle = o.rider || '#2b2b2b'; g.beginPath(); g.ellipse(-L * .04, 0, L * .2, W * .62, 0, 0, TAU); g.fill();            // hombros
      g.fillStyle = o.helmet || '#e8e8e8'; g.beginPath(); g.arc(L * .08, 0, W * .36, 0, TAU); g.fill();                              // casco
      g.fillStyle = o.lights ? '#fff6c0' : '#e8dcae'; g.fillRect(L / 2 - 2, -1, 2, 2); return;
    }
    if (kind === 'cable') {
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(-L / 2 + 3, -W / 2 + 4, L, W);
      g.fillStyle = dark; R(g, -L / 2 - 1, -W / 2 - 1, L + 2, W + 2, 3); g.fillStyle = col; R(g, -L / 2, -W / 2, L, W, 2);
      g.fillStyle = glassL; g.fillRect(-L * .34, -W * .34, L * .68, W * .68); g.fillStyle = col; g.fillRect(-L * .12, -W * .5, L * .24, W);
      g.fillStyle = dark; g.fillRect(-1.5, -1.5, 3, 3); return;
    }
    const bus = kind === 'bus' || kind === 'brt' || kind === 'feeder', rail = kind === 'metro' || kind === 'tram';
    // contorno y carrocería
    g.fillStyle = dark; R(g, -L / 2 - 1, -W / 2 - 1, L + 2, W + 2, bus || rail ? 2 : 3);
    const body = rail ? (kind === 'metro' ? '#e9ecef' : '#eef2ee') : col; g.fillStyle = body; R(g, -L / 2, -W / 2, L, W, bus || rail ? 1.5 : 2.5);
    if (kind === 'brt') { // articulado: dos secciones y fuelle
      const j = -L * .14; g.fillStyle = '#2a2a2a'; g.fillRect(j - L * .035, -W / 2 - 1, L * .07, W + 2); g.fillStyle = '#1a1a1a'; for (let x = j - L * .03; x < j + L * .035; x += 2) g.fillRect(x, -W / 2, 1, W);
    }
    if (bus) {
      g.fillStyle = Art.shade(body, 1.08); g.fillRect(-L / 2 + L * .06, -W * .18, L * .88, W * .36);                     // techo
      const stripe = kind === 'feeder' ? '#E38835' : kind === 'brt' ? '#f4f1ea' : '#59AB42'; g.fillStyle = stripe; g.fillRect(-L / 2 + 1, -W / 2 + 1, L - 2, Math.max(1, W * .1)); g.fillRect(-L / 2 + 1, W / 2 - 1 - Math.max(1, W * .1), L - 2, Math.max(1, W * .1));
      g.fillStyle = glass; const n = Math.max(3, Math.floor(L / 7)); for (let i = 0; i < n; i++) { const x = -L / 2 + L * .1 + i * (L * .82 / n); if (kind === 'brt' && Math.abs(x + L * .14) < L * .05) continue; g.fillRect(x, -W / 2 + 1, L * .82 / n * .62, Math.max(1, W * .12)); g.fillRect(x, W / 2 - 1 - Math.max(1, W * .12), L * .82 / n * .62, Math.max(1, W * .12)); }
      g.fillStyle = glass; g.fillRect(L / 2 - Math.max(2, L * .07), -W / 2 + 1, Math.max(2, L * .07), W - 2);                 // parabrisas
      g.fillStyle = glassL; g.fillRect(-L / 2 + 1, -W / 2 + 1, Math.max(1.5, L * .04), W - 2);                                // vidrio trasero
      g.fillStyle = '#9aa0a6'; g.fillRect(-L * .3, -W * .1, L * .08, W * .2); g.fillRect(L * .12, -W * .1, L * .08, W * .2);   // escotillas / aire
      if (o.doors) { const side = o.doors === 'left' ? -1 : 1; g.fillStyle = Art.shade(body, .82); for (const f of (kind === 'brt' ? [.3, .02, -.3] : [.3, -.2])) g.fillRect(f * L - L * .03, side < 0 ? -W / 2 : W / 2 - Math.max(1, W * .1), L * .06, Math.max(1, W * .1)); }
      if (o.sign) { g.fillStyle = '#ffb000'; g.fillRect(L / 2 - Math.max(2, L * .07) - 1, -W * .22, 1.5, W * .44); }
    } else if (rail) {
      g.fillStyle = col; g.fillRect(-L / 2 + 1, -W / 2 + 1, L - 2, Math.max(1, W * .14)); g.fillRect(-L / 2 + 1, W / 2 - 1 - Math.max(1, W * .14), L - 2, Math.max(1, W * .14));   // franja de la línea
      g.fillStyle = '#c9ced4'; g.fillRect(-L / 2 + L * .08, -W * .16, L * .84, W * .32);                                 // techo central (equipos)
      g.fillStyle = '#aeb4ba'; for (let i = 0; i < 3; i++) g.fillRect(-L * .3 + i * L * .3, -W * .1, L * .12, W * .2);
      g.fillStyle = glass; const n = Math.max(4, Math.floor(L / 5)); for (let i = 0; i < n; i++) { const x = -L / 2 + L * .06 + i * (L * .88 / n); g.fillRect(x, -W / 2 + 1 + Math.max(1, W * .14), L * .88 / n * .55, Math.max(1, W * .1)); g.fillRect(x, W / 2 - 1 - Math.max(1, W * .14) - Math.max(1, W * .1), L * .88 / n * .55, Math.max(1, W * .1)); }
      if (o.end === 'front' || o.end === 'both') { g.fillStyle = glass; g.fillRect(L / 2 - Math.max(2, L * .06), -W / 2 + 1, Math.max(2, L * .06), W - 2); g.fillStyle = '#fff6c0'; g.fillRect(L / 2 - 1.5, -W / 2 + 1, 1.5, Math.max(1, W * .18)); g.fillRect(L / 2 - 1.5, W / 2 - 1 - Math.max(1, W * .18), 1.5, Math.max(1, W * .18)); }
      if (o.end === 'back' || o.end === 'both') { g.fillStyle = glass; g.fillRect(-L / 2 + 1, -W / 2 + 1, Math.max(2, L * .06), W - 2); g.fillStyle = '#ff3b2f'; g.fillRect(-L / 2 + 1, -W / 2 + 1, 1.5, Math.max(1, W * .18)); g.fillRect(-L / 2 + 1, W / 2 - 1 - Math.max(1, W * .18), 1.5, Math.max(1, W * .18)); }
      if (kind === 'tram') { g.fillStyle = dark; g.fillRect(-L * .04, -W * .4, L * .08, W * .8); g.fillRect(-L * .02, -W * .5, L * .04, W); }   // pantógrafo
      return;
    } else {
      // carro, taxi, camioneta
      const pick = kind === 'camioneta';
      g.fillStyle = Art.shade(body, .92); g.fillRect(L / 2 - L * .3, -W / 2 + 1, L * .3 - 1, W - 2);                      // capó
      g.fillStyle = Art.shade(body, 1.1); R(g, -L * .32, -W * .38, L * .56, W * .76, 2);                                   // techo
      g.fillStyle = glass; g.fillRect(L * .16, -W * .38, L * .1, W * .76);                                                 // parabrisas
      g.fillStyle = glassL; g.fillRect(-L * .34, -W * .36, L * .06, W * .72);                                              // vidrio trasero
      g.fillStyle = glass; g.fillRect(-L * .26, -W / 2 + 1, L * .4, Math.max(1, W * .09)); g.fillRect(-L * .26, W / 2 - 1 - Math.max(1, W * .09), L * .4, Math.max(1, W * .09));   // ventanas laterales
      if (pick) { g.fillStyle = Art.shade(body, .7); g.fillRect(-L / 2 + 1, -W / 2 + 2, L * .22, W - 4); g.fillStyle = '#c9ced4'; g.fillRect(-L / 2 + 2, -W * .2, L * .2, W * .4); }   // platón
      g.fillStyle = dark; g.fillRect(L * .18, -W / 2 - 1.5, 2, 1.5); g.fillRect(L * .18, W / 2, 2, 1.5);                   // retrovisores
      g.fillStyle = o.lights ? '#fff6c0' : '#e8dcae'; g.fillRect(L / 2 - 1.5, -W / 2 + 1, 1.5, Math.max(1, W * .2)); g.fillRect(L / 2 - 1.5, W / 2 - 1 - Math.max(1, W * .2), 1.5, Math.max(1, W * .2));
      g.fillStyle = o.lights ? '#ff3b2f' : '#8a2a22'; g.fillRect(-L / 2 + 1, -W / 2 + 1, 1.5, Math.max(1, W * .2)); g.fillRect(-L / 2 + 1, W / 2 - 1 - Math.max(1, W * .2), 1.5, Math.max(1, W * .2));
      if (kind === 'taxi') { g.fillStyle = '#fff'; g.fillRect(-L * .08, -W * .22, L * .16, W * .44); g.fillStyle = dark; g.fillRect(-L * .03, -W * .08, L * .06, W * .16); }
      if (o.sign) { g.fillStyle = PAL.tinta; g.fillRect(-L * .3, -W * .14, L * .18, W * .28); g.fillStyle = '#fff'; g.fillRect(-L * .27, -W * .06, L * .12, W * .12); }
    }
  },
  /* peatón visto desde arriba: hombros, cabeza con pelo y cara, brazos al caminar; umb paraguas; stun tirado */
  /* perro cenital mirando a +x: cuerpo, cabeza con orejas, patas al trote y cola que se mueve */
  dog(g, s, p) {
    const c = p.col || '#8a5a32', dk = Art.shade(c, .7), ph = p.ph || 0, tr = Math.sin(ph * 2) * s * .18;
    g.fillStyle = dk; for (const [lx, ly, f] of [[.38, -.24, 1], [.38, .24, -1], [-.36, -.24, -1], [-.36, .24, 1]]) g.fillRect((lx + f * tr / s * .6) * s - s * .07, ly * s - s * .07, s * .14, s * .14);
    g.strokeStyle = dk; g.lineWidth = Math.max(1, s * .1); g.beginPath(); g.moveTo(-s * .55, 0); g.lineTo(-s * .85, Math.sin(ph * 3) * s * .22); g.stroke();
    g.fillStyle = '#141414'; g.beginPath(); g.ellipse(0, 0, s * .62, s * .3, 0, 0, TAU); g.fill();
    g.fillStyle = c; g.beginPath(); g.ellipse(0, 0, s * .56, s * .25, 0, 0, TAU); g.fill();
    if (p.seed % 3 === 0) { g.fillStyle = dk; g.beginPath(); g.ellipse(-s * .12, -s * .04, s * .18, s * .13, 0, 0, TAU); g.fill(); }
    g.fillStyle = '#141414'; g.beginPath(); g.arc(s * .62, 0, s * .27, 0, TAU); g.fill(); g.fillStyle = c; g.beginPath(); g.arc(s * .62, 0, s * .22, 0, TAU); g.fill();
    g.fillStyle = dk; g.fillRect(s * .5, -s * .3, s * .14, s * .12); g.fillRect(s * .5, s * .18, s * .14, s * .12); g.fillStyle = '#141414'; g.fillRect(s * .8, -s * .05, s * .08, s * .1);
    if (p.owner) { g.fillStyle = '#EC343A'; g.fillRect(s * .4, -s * .2, s * .06, s * .4); }
  },
  ped(g, s, p, o = {}) {
    const skin = p.skin || '#f1c9a5', col = p.col || '#1C5C9C', hair = p.hair || (h2(p.seed || 1, 2, 2) < .5 ? '#2a1a12' : '#5a3a22'), sw = Math.sin(p.ph || 0) * s * .55;
    if (p.stun > 0) { g.fillStyle = col; g.fillRect(-s * 1.4, -s * .7, s * 2.8, s * 1.4); g.fillStyle = skin; g.beginPath(); g.arc(s * 1.5, 0, s * .6, 0, TAU); g.fill(); return; }
    g.fillStyle = '#141414'; g.beginPath(); g.ellipse(0, 0, s * .95, s * 1.15, 0, 0, TAU); g.fill();
    g.fillStyle = col; g.beginPath(); g.ellipse(0, 0, s * .8, s * 1, 0, 0, TAU); g.fill();
    g.fillStyle = skin; g.fillRect(-s * .35 + sw, -s * 1.35, s * .55, s * .4); g.fillRect(-s * .35 - sw, s * .95, s * .55, s * .4);   // manos
    g.fillStyle = hair; g.beginPath(); g.arc(0, 0, s * .6, 0, TAU); g.fill(); g.fillStyle = skin; g.beginPath(); g.arc(s * .16, 0, s * .4, 0, TAU); g.fill();
    if (p.hat) { g.fillStyle = p.hat; g.beginPath(); g.arc(0, 0, s * .68, 0, TAU); g.fill(); g.fillStyle = Art.shade(p.hat, .85); g.beginPath(); g.arc(0, 0, s * .42, 0, TAU); g.fill(); }
    if (p.umb) { const uc = p.umbCol || PED_COL[((p.seed || 1) * 7) % PED_COL.length]; g.fillStyle = '#141414'; g.beginPath(); g.arc(0, 0, s * 1.55, 0, TAU); g.fill(); g.fillStyle = uc; g.beginPath(); g.arc(0, 0, s * 1.4, 0, TAU); g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g.moveTo(0, 0); g.lineTo(Math.cos(a) * s * 1.4, Math.sin(a) * s * 1.4); } g.stroke(); g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.arc(-s * .4, -s * .4, s * .35, 0, TAU); g.fill(); }
  },
  /* vendedor ambulante con carrito (frutas, tintos, chontaduro) */
  cart(g, s, col) { g.fillStyle = '#141414'; g.fillRect(-s * 1.6, -s * 1.1, s * 3.2, s * 2.2); g.fillStyle = col; g.fillRect(-s * 1.4, -s * .9, s * 2.8, s * 1.8); g.fillStyle = '#f4f1ea'; g.fillRect(-s * 1.2, -s * .7, s * 2.4, s * .5); for (let i = 0; i < 4; i++) { g.fillStyle = ['#F6C538', '#EC343A', '#59AB42', '#E38835'][i]; g.fillRect(-s * 1.1 + i * s * .6, -s * .1, s * .45, s * .45); } g.fillStyle = '#141414'; g.fillRect(-s * 1.7, -s * .6, s * .3, s * 1.2); g.fillRect(s * 1.4, -s * .6, s * .3, s * 1.2); }
};
