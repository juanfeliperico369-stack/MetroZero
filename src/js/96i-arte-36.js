/* =====================================================================
   GA-36-4 · INTEGRACIÓN DE ARTE G-110 A G-112 CON RESPALDO PROCEDURAL (Antigravity, 3.7)
   - G-110 «Domingo zen»: 4 capas de paralaje al amanecer (g110_zen_cielo, g110_zen_montana,
     g110_zen_ciudad, g110_zen_frente) en el modo zen del corredor (cr:zen), con respaldo
     procedural en la paleta oficial del amanecer (#F6C538, #E38835, #8fb8d8, #59AB42).
   - G-111: 6 escenas de subtramas (esc_sub_pico_sa, esc_sub_ciclo_rio, esc_sub_niebla_arvi,
     esc_sub_guitarra_t, esc_sub_cruce_ind, esc_sub_bici_estadio), con ilustración plana
     procedural de Medellín en SVG cuando aún no llega el PNG.
   - G-112: 6 plantas cenitales de zonas de skate (tex_skate_parques_rio, tex_skate_ciudad_rio,
     tex_skate_atanasio, tex_skate_pies_descalzos, tex_skate_explora, tex_skate_ayacucho)
     en 2D y 3D con respaldo procedural (0 llamadas extra al 3D si aún no llegó el PNG).
   ===================================================================== */
(function () {
  const MAPA = {
    zen: ['g110_zen_cielo', 'g110_zen_montana', 'g110_zen_ciudad', 'g110_zen_frente'],
    subtramas: {
      'pico-sa': 'esc_sub_pico_sa',
      'ciclo-rio': 'esc_sub_ciclo_rio',
      'niebla-arvi': 'esc_sub_niebla_arvi',
      'guitarra-t': 'esc_sub_guitarra_t',
      'cruce-ind': 'esc_sub_cruce_ind',
      'bici-estadio': 'esc_sub_bici_estadio'
    },
    skate: {
      'parques-rio': 'tex_skate_parques_rio',
      'ciudad-rio': 'tex_skate_ciudad_rio',
      'atanasio': 'tex_skate_atanasio',
      'pies-descalzos': 'tex_skate_pies_descalzos',
      'explora': 'tex_skate_explora',
      'ayacucho': 'tex_skate_ayacucho'
    }
  };

  /* ---------- G-111: respaldo procedural plano y cálido (SVG ligero en caché) ---------- */
  const _svgCache = {};
  function svgEscena(subId) {
    if (_svgCache[subId]) return _svgCache[subId];
    let inner = '';
    if (subId === 'pico-sa') {
      inner = '<rect width="320" height="240" fill="#f4d9a8"/><path d="M0 110 Q90 70 180 96 T320 88 L320 240 L0 240Z" fill="#7f9fbf"/><rect x="0" y="136" width="320" height="104" fill="#a9a59b"/><rect x="0" y="136" width="320" height="10" fill="#1C5C9C"/><rect x="0" y="180" width="320" height="8" fill="#E38835"/><rect x="18" y="96" width="124" height="38" rx="6" fill="#faf6ec" stroke="#154a80" stroke-width="3"/><rect x="26" y="106" width="108" height="12" fill="#9fd3e6"/><rect x="18" y="124" width="124" height="6" fill="#1C5C9C"/><rect x="178" y="144" width="124" height="34" rx="6" fill="#faf6ec" stroke="#154a80" stroke-width="3"/><rect x="186" y="152" width="108" height="11" fill="#9fd3e6"/><rect x="178" y="169" width="124" height="6" fill="#E38835"/><rect x="0" y="206" width="320" height="6" fill="#F6C538"/><circle cx="72" cy="196" r="7" fill="#154a80"/><circle cx="96" cy="196" r="7" fill="#EC343A"/><circle cx="122" cy="196" r="7" fill="#59AB42"/><circle cx="150" cy="196" r="7" fill="#0E6F76"/>';
    } else if (subId === 'ciclo-rio') {
      inner = '<rect width="320" height="240" fill="#cfe6ef"/><path d="M0 112 Q110 74 220 96 T320 84 L320 240 L0 240Z" fill="#5f8f86"/><rect x="0" y="144" width="320" height="26" fill="#5f7f73"/><rect x="0" y="170" width="320" height="70" fill="#4f8a3c"/><rect x="0" y="182" width="320" height="30" fill="#59AB42"/><line x1="0" y1="197" x2="320" y2="197" stroke="#f1ece0" stroke-width="3" stroke-dasharray="14,10"/><circle cx="48" cy="154" r="22" fill="#2f6b35"/><circle cx="268" cy="150" r="24" fill="#2f6b35"/><circle cx="92" cy="196" r="10" fill="none" stroke="#154a80" stroke-width="3"/><circle cx="122" cy="196" r="10" fill="none" stroke="#154a80" stroke-width="3"/><path d="M92 196 L108 182 L122 196 M108 182 L104 172" stroke="#1C5C9C" stroke-width="3" fill="none"/><path d="M196 212 L248 212 L248 188 Z" fill="#a9a59b" stroke="#154a80" stroke-width="2"/><rect x="206" y="176" width="28" height="5" rx="2" fill="#E38835"/><circle cx="220" cy="166" r="6" fill="#F6C538"/>';
    } else if (subId === 'niebla-arvi') {
      inner = '<rect width="320" height="240" fill="#8fb8d8"/><path d="M0 148 Q84 94 172 124 T320 92 L320 240 L0 240Z" fill="#2f6b35"/><path d="M0 176 Q104 134 210 158 T320 132 L320 240 L0 240Z" fill="#3f7f4a"/><line x1="0" y1="138" x2="320" y2="62" stroke="#141414" stroke-width="3"/><rect x="234" y="76" width="12" height="122" fill="#9e9a92"/><rect x="218" y="74" width="44" height="7" fill="#5a6470"/><line x1="128" y1="108" x2="128" y2="124" stroke="#141414" stroke-width="3"/><rect x="110" y="124" width="36" height="28" rx="6" fill="#8E612A" stroke="#141414" stroke-width="2.5"/><rect x="116" y="130" width="24" height="11" rx="2" fill="#9fd3e6"/><ellipse cx="86" cy="168" rx="92" ry="18" fill="#f1ece0" opacity=".68"/><ellipse cx="236" cy="184" rx="105" ry="20" fill="#f1ece0" opacity=".62"/>';
    } else if (subId === 'guitarra-t') {
      inner = '<rect width="320" height="240" fill="#f4d9a8"/><rect x="0" y="148" width="320" height="92" fill="#c9c1ad"/><rect x="16" y="88" width="54" height="60" fill="#b4583a"/><rect x="74" y="78" width="58" height="70" fill="#E38835"/><rect x="136" y="92" width="52" height="56" fill="#9a4630"/><rect x="192" y="82" width="60" height="66" fill="#F6C538"/><rect x="256" y="90" width="54" height="58" fill="#b4583a"/><rect x="150" y="128" width="148" height="44" rx="8" fill="#59AB42" stroke="#141414" stroke-width="3"/><rect x="164" y="138" width="120" height="14" rx="2" fill="#9fd3e6"/><circle cx="78" cy="166" r="10" fill="#154a80"/><rect x="68" y="176" width="20" height="32" rx="4" fill="#1C5C9C"/><ellipse cx="94" cy="192" rx="11" ry="8" fill="#8E612A" stroke="#141414" stroke-width="2"/><line x1="94" y1="192" x2="118" y2="178" stroke="#141414" stroke-width="3"/>';
    } else if (subId === 'cruce-ind') {
      inner = '<rect width="320" height="240" fill="#5f7f96"/><rect x="0" y="138" width="320" height="102" fill="#3b3f45"/><line x1="0" y1="188" x2="320" y2="188" stroke="#F6C538" stroke-width="4" stroke-dasharray="16,12"/><rect x="18" y="148" width="112" height="34" rx="5" fill="#0E6F76" stroke="#141414" stroke-width="2.5"/><rect x="132" y="152" width="10" height="28" fill="#141414"/><rect x="142" y="148" width="70" height="34" rx="5" fill="#0E6F76" stroke="#141414" stroke-width="2.5"/><rect x="26" y="156" width="96" height="11" fill="#9fd3e6"/><rect x="148" y="156" width="56" height="11" fill="#9fd3e6"/><rect x="258" y="76" width="18" height="52" rx="4" fill="#141414"/><circle cx="267" cy="88" r="5" fill="#EC343A"/><circle cx="267" cy="102" r="5" fill="#F6C538"/><circle cx="267" cy="116" r="5" fill="#59AB42"/><rect x="265" y="128" width="4" height="62" fill="#5a6470"/>';
    } else {
      inner = '<rect width="320" height="240" fill="#cfe6ef"/><path d="M18 142 Q160 64 302 142 Z" fill="#a9a59b" stroke="#154a80" stroke-width="3"/><rect x="0" y="142" width="320" height="98" fill="#4f8a3c"/><rect x="0" y="172" width="320" height="46" fill="#c9c1ad"/><rect x="34" y="178" width="110" height="14" rx="3" fill="#154a80"/><rect x="44" y="170" width="8" height="16" fill="#9bd341"/><rect x="68" y="170" width="8" height="16" fill="#9bd341"/><rect x="92" y="170" width="8" height="16" fill="#9bd341"/><rect x="116" y="170" width="8" height="16" fill="#9bd341"/><circle cx="212" cy="198" r="13" fill="none" stroke="#154a80" stroke-width="3.5"/><circle cx="256" cy="198" r="13" fill="none" stroke="#154a80" stroke-width="3.5"/><path d="M212 198 L234 176 L256 198 M234 176 L228 164 M256 198 L248 168 L258 168" stroke="#59AB42" stroke-width="4" fill="none" stroke-linecap="round"/>';
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240">${inner}</svg>`;
    return (_svgCache[subId] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
  }

  /* ---------- G-110: panorámica de 4 capas en paralaje para «Domingo zen» ---------- */
  function dibujaCapaRep(g, img, offX, y, w, h) {
    const sw = Math.max(1, img.width * (h / Math.max(1, img.height)));
    let x = -((offX % sw) + sw) % sw;
    while (x < w) { g.drawImage(img, x, y, sw + 1, h); x += sw; }
  }
  function dibujaZenParalaje(g, st, W, H, en3D) {
    const dpr = Game.dpr || 1;
    const y0 = Math.round((H < 540 * dpr ? 40 : 48) * dpr);
    const banH = Math.round(Math.max(66 * dpr, (H - y0) * (en3D ? .15 : .27)));
    const s = st.s || 0;
    const imgs = MAPA.zen.map(id => Atlas.img(id));
    g.save();
    g.beginPath(); g.rect(0, y0, W, banH); g.clip();
    if (en3D) g.globalAlpha = .86;
    if (imgs[0]) {
      dibujaCapaRep(g, imgs[0], s * .4, y0, W, banH);
    } else {
      const gr = g.createLinearGradient(0, y0, 0, y0 + banH);
      gr.addColorStop(0, '#E38835'); gr.addColorStop(.55, '#F6C538'); gr.addColorStop(1, '#f1ece0');
      g.fillStyle = gr; g.fillRect(0, y0, W, banH);
      /* sol naciente sobre las montañas del oriente */
      g.fillStyle = 'rgba(255,247,214,.9)'; g.beginPath(); g.arc(W * .76, y0 + banH * .48, banH * .22, 0, TAU); g.fill();
    }
    if (imgs[1]) {
      dibujaCapaRep(g, imgs[1], s * 1.4, y0, W, banH);
    } else {
      /* montañas del oriente con niebla baja (#8fb8d8) */
      g.fillStyle = '#5f7f96'; g.beginPath(); g.moveTo(0, y0 + banH);
      for (let x = 0; x <= W + 40; x += 28) {
        const u = x + s * 1.1;
        const my = y0 + banH * (.48 + .14 * Math.sin(u * .014) + .08 * Math.cos(u * .031));
        g.lineTo(x, my);
      }
      g.lineTo(W, y0 + banH); g.closePath(); g.fill();
      g.fillStyle = 'rgba(143,184,216,.55)'; g.fillRect(0, y0 + banH * .64, W, banH * .22);
    }
    if (imgs[2]) {
      dibujaCapaRep(g, imgs[2], s * 3.1, y0, W, banH);
    } else {
      /* silueta de ciudad y río Medellín */
      g.fillStyle = '#3d586e';
      for (let i = -1; i < Math.ceil(W / 38) + 2; i++) {
        const bx = i * 38 - ((s * 2.8) % 38), bh = banH * (.14 + ((Math.abs(i * 17) % 5) * .045));
        g.fillRect(bx, y0 + banH * .76 - bh, 26, bh);
      }
      g.fillStyle = '#5f7f73'; g.fillRect(0, y0 + banH * .76, W, banH * .12);
    }
    if (imgs[3]) {
      dibujaCapaRep(g, imgs[3], s * 5.6, y0, W, banH);
    } else {
      /* árboles de la orilla (#59AB42) junto a la ciclorruta Las Vegas */
      const paso = 46;
      for (let i = -1; i < Math.ceil(W / paso) + 2; i++) {
        const tx = i * paso - ((s * 5.2) % paso), r = banH * (.11 + (Math.abs(i * 7) % 3) * .025);
        g.fillStyle = '#2f6b35'; g.beginPath(); g.arc(tx, y0 + banH * .88, r, 0, TAU); g.fill();
        g.fillStyle = '#59AB42'; g.beginPath(); g.arc(tx - r * .18, y0 + banH * .85, r * .76, 0, TAU); g.fill();
      }
    }
    if (en3D) {
      /* desvanecimiento suave hacia la pista 3D */
      const f = g.createLinearGradient(0, y0 + banH * .55, 0, y0 + banH);
      f.addColorStop(0, 'rgba(246,197,56,0)'); f.addColorStop(1, 'rgba(241,236,224,.28)');
      g.fillStyle = f; g.fillRect(0, y0 + banH * .55, W, banH * .45);
    }
    g.restore();
  }

  /* ---------- G-112: pisos de skate en 2D y 3D (con respaldo procedural) ---------- */
  const _glTex = new Map();
  let _glCtx = null;
  function texSkate3D(G, id, img) {
    if (!G || !G.gl || !img) return null;
    if (_glCtx !== G.gl) { _glCtx = G.gl; _glTex.clear(); }
    if (_glTex.has(id)) return _glTex.get(id);
    const gl = G.gl, t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    _glTex.set(id, t);
    return t;
  }

  /* ---------- API pública EM.arte36 ---------- */
  const A36 = EM.arte36 = {
    MAPA,
    escenaSubtrama(subId, titulo) {
      const id = MAPA.subtramas[subId];
      if (id && Atlas.has(id)) return Atlas.tag(id, 'sub-escena', titulo || subId);
      return `<img class="sub-escena" src="${svgEscena(subId)}" alt="${esc(titulo || subId)}" draggable="false">`;
    },
    dibujaZen: dibujaZenParalaje
  };

  /* enganche G-110 en Carrera: amanecer dorado en 3D y paralaje detrás del marcador en Domingo zen */
  const Cr = EM.modes.carrera;
  if (Cr && Cr.draw && !Cr._conZenArte) {
    Cr._conZenArte = 1;
    const drawCr0 = Cr.draw, marcCr0 = Cr.marcador;
    Cr.draw = function (g, st, vp) {
      if (!st || !st.zen) return drawCr0.apply(this, arguments);
      const hr0 = typeof Mundo !== 'undefined' ? Mundo.hour : null;
      if (hr0) Mundo.hour = () => 6.15;
      try { return drawCr0.apply(this, arguments); } finally { if (hr0) Mundo.hour = hr0; }
    };
    Cr.marcador = function (g, st, W, H) {
      if (st && st.zen) dibujaZenParalaje(g, st, W, H, this.gl(st));
      return marcCr0.call(this, g, st, W, H);
    };
  }

  /* enganche G-111 y G-112 en EM.mundoRPG */
  const Rpg = EM.mundoRPG;
  if (Rpg && !Rpg._conArte36) {
    Rpg._conArte36 = 1;
    const abrir0 = Rpg.abrir;
    Rpg.abrir = function (st, tab = 'modos') {
      abrir0.call(this, st, tab);
      if (EM.headless || tab !== 'sub') return;
      const cards = $$('#mBody .rpg-card');
      (Rpg.SUBTRAMAS || []).forEach((s, i) => {
        const card = cards[i]; if (!card || card.querySelector('.sub-escena')) return;
        const wrap = document.createElement('div');
        wrap.innerHTML = A36.escenaSubtrama(s.id, s.titulo);
        if (wrap.firstChild) card.insertBefore(wrap.firstChild, card.firstChild);
      });
    };

    const hayTexSkate = Object.values(MAPA.skate).some(id => Atlas.has(id));
    if (hayTexSkate) {
      const draw2D0 = Rpg.draw2D;
      Rpg.draw2D = function (g, st, S, k, x0, y0, x1, y1) {
        const Z = this.zonas ? this.zonas() : [];
        let usoTex = false;
        for (const z of Z) {
          if (z.x < x0 - 40 || z.x > x1 + 40 || z.y < y0 - 40 || z.y > y1 + 40) continue;
          const tid = MAPA.skate[z.id], im = tid ? Atlas.img(tid) : null;
          if (!im) continue;
          usoTex = true;
          const q = S(z.x, z.y), tam = Math.max(24, 24 * k);
          g.drawImage(im, q.x - tam / 2, q.y - tam / 2, tam, tam);
        }
        if (!usoTex) return draw2D0.call(this, g, st, S, k, x0, y0, x1, y1);
        for (const z of Z) {
          if (z.x < x0 - 40 || z.x > x1 + 40 || z.y < y0 - 40 || z.y > y1 + 40) continue;
          const q = S(z.x, z.y), r = Math.max(12, 13 * k);
          if (k > 1.2 && !st.far) {
            g.save(); g.font = '700 ' + Math.round(clamp(k * 4, 10, 13)) + 'px Cuerpo, sans-serif';
            g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.92)';
            g.strokeText('🛹 ' + z.n, q.x, q.y - r - 4);
            g.fillStyle = '#0E6F76'; g.fillText('🛹 ' + z.n, q.x, q.y - r - 4);
            g.restore();
          }
        }
      };

      const draw3D0 = Rpg.draw3D;
      Rpg.draw3D = function (G, st) {
        draw3D0.call(this, G, st);
        if (!G || !G.gl) return;
        const Z = this.zonas ? this.zonas() : [];
        let dibujo = false;
        for (const z of Z) {
          if (Math.abs(z.x - st.x) > 220 || Math.abs(z.y - st.y) > 220) continue;
          const tid = MAPA.skate[z.id], im = tid ? Atlas.img(tid) : null;
          if (!im) continue;
          const tex = texSkate3D(G, tid, im);
          if (!tex) continue;
          dibujo = true;
          const gl = G.gl, u = G.P.u, zz = MAP.elevM(z.x, z.y) + .18;
          if (!A36._qBuf || A36._qGl !== gl) {
            A36._qGl = gl;
            const mb = new MB();
            mb.quad([-11, 0, -9], [11, 0, -9], [11, 0, 9], [-11, 0, 9], [1, 1, 1], 2.01);
            A36._qBuf = G.buf(mb.done()[0]);
          }
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.uniform4fv(u.Rv, [z.x - 11, z.y - 9, 22, 18]);
          gl.uniform4fv(u.Hv, [0, 0, 0, 0]);
          gl.uniformMatrix4fv(u.M, false, M4.trs(z.x, zz, z.y, 0, 1, 1, 1));
          G._run(A36._qBuf);
          gl.uniformMatrix4fv(u.M, false, G._I);
        }
        if (dibujo && G.win) {
          G.gl.bindTexture(G.gl.TEXTURE_2D, G.texNear);
          G.gl.uniform4fv(G.P.u.Rv, [G.win.x0, G.win.z0, G.win.s, G.win.s]);
        }
      };
    }
  }
})();
