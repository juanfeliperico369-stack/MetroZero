/* =====================================================================
   ARTE C-70 Y C-71 EN LA INTERFAZ (3.9, Claude) · los íconos y las medallas de ChatGPT (GPT-6 Eón, 3.7), revisados e integrados con
   tools/arte_juego.py (WebP de 128 px). Las medallas (logro_*) y los íconos de modo (ico_modo_carrera, ico_modo_tranvia) los usa el
   juego solo, por el Atlas. Aquí van los que acompañan un texto: donde la interfaz escribe «⭐ Reto del día», «🌅 Domingo zen»,
   «📏 Medir mi celular», el corredor de 🎮 o una zona de skate, el emoji se cambia por su ícono. Si falta el arte, queda el emoji.
   Solo mira la portada, la lista de modos, la de niveles y las ventanas (no el HUD de las partidas, que cambia en cada cuadro).
   ===================================================================== */
(function () {
  if (typeof Atlas === 'undefined' || typeof document === 'undefined' || EM.headless || typeof MutationObserver === 'undefined') return;
  const REGLAS = [['⭐ Reto del día', '⭐', 'ico_reto'], ['🌅 Domingo zen', '🌅', 'ico_zen'], ['📏 Medir mi celular', '📏', 'ico_medir'], ['🛹 Corredor', '🛹', 'ico_ciclovia'], ['🛹 ', '🛹', 'ico_skate']];
  const img = id => { const i = document.createElement('img'); i.className = 'aico-l'; i.src = Atlas.url(id); i.alt = ''; i.draggable = false; return i; };
  const A = EM.arte37 = {
    REGLAS,
    cambiar(raiz) {
      if (!raiz || !raiz.nodeType) return 0; if (raiz.nodeType === 3) raiz = raiz.parentNode; if (!raiz || !raiz.ownerDocument) return 0;
      const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT), hits = [];
      for (let n = w.nextNode(); n; n = w.nextNode()) { const t = n.nodeValue; if (!t || t.length > 600) continue; for (const [pat, emo, id] of REGLAS) { const k = t.indexOf(pat); if (k >= 0 && Atlas.has(id)) { hits.push([n, k, emo, id]); break; } } }
      for (const [n, k, emo, id] of hits) { const resto = n.splitText(k); resto.nodeValue = resto.nodeValue.slice(emo.length); n.parentNode.insertBefore(img(id), resto); }
      return hits.length;
    }
  };
  const vigila = el => { if (!el) return; A.cambiar(el); new MutationObserver(ms => { for (const m of ms) for (const a of m.addedNodes) A.cambiar(a); }).observe(el, { childList: true, subtree: true }); };
  const arranca = () => { for (const id of ['cover', 'menu', 'levels', 'mBody']) vigila(document.getElementById(id)); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca); else arranca();
})();
