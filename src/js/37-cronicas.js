/* =====================================================================
   CRÓNICAS DEL SISTEMA (3.0, zona Z3 de docs/COORDINACION-IA.md) · narrativa aditiva para Ciudad Libre
   La primera vez que llegas a pie (o despacio) a una estación de una línea, alguien del barrio te cuenta la crónica de esa
   línea: cuándo abrió, por dónde va y lo que pocos saben. Los datos salen de src/data/red.js (LINE_META), los mismos que el
   juego ya cita con sus fuentes en docs/FUENTES.md; aquí no se inventa ninguno.
   - Quien cuenta: un personaje de la ciudad que viva en una estación de esa línea (Gente) o, si no hay, un vecino, con su
     rostro detallado (29-rostros.js).
   - Se guarda en Save.d.cronicas = { idDeLínea: 1 } (campo nuevo con su valor por defecto en newSave: elmetro.v1 no cambia).
   - +3 🎫 por cada crónica nueva; en el pie de la charla, cuántas llevas de cuántas.
   ===================================================================== */
(() => {
  if (typeof Libre === 'undefined' || typeof LINE_META === 'undefined' || typeof NET === 'undefined') return;
  const KINDS = { metro: 1, tram: 1, cable: 1, brt: 1 };
  const VECINOS = [['Doña Gladys', 'vecina'], ['Don Gustavo', 'vecino'], ['Doña Marina', 'vecina'], ['Don Rubén', 'vecino'], ['Doña Fabiola', 'vecina'], ['Don Alirio', 'vecino'], ['Doña Ofelia', 'vecina'], ['Don Ramiro', 'vecino']];
  const hash = s => { let h = 7; for (const c of String(s)) h = h * 31 + c.charCodeAt(0) | 0; return h >>> 0; };
  const Cronicas = EM.cronicas = {
    /* las líneas con crónica: las que están en el mapa del juego y traen al menos dos datos verificados */
    lista() { return LINE_META.lines.filter(l => { const L = NET.byId[l.id]; return L && (KINDS[L.kind] || l.id === 'ESC13') && (l.facts || []).length >= 2; }); },
    leidas() { const d = Save.d; if (!d.cronicas || typeof d.cronicas !== 'object') d.cronicas = {}; return d.cronicas; },
    /* quién la cuenta: alguien de la gente de la ciudad que viva en una estación de la línea; si no, un vecino de esa estación */
    narrador(l, est) {
      const L = NET.byId[l.id], G = typeof GENTE !== 'undefined' && GENTE.find(g => g.en && g.en[0] === 'est' && L.st.some(e => e.name === g.en[1]));
      if (G) return { G: { n: G.n, o: G.o }, look: Perfil.ped(G.look) };
      const h = hash(l.id), [n, o] = VECINOS[h % VECINOS.length]; let a = h; const r = () => ((a = (a * 1103515245 + 12345) >>> 0) % 1000) / 1000;
      return { G: { n, o: o + ' de ' + est }, look: Perfil.ped(Perfil.azar(r)) };
    },
    lineas(l) { const L = NET.byId[l.id]; return ['Le cuento la crónica de la ' + (l.name || L.name) + '.', ...l.facts.slice(0, 3)]; },
    contar(st, l, est) {
      const R = this.leidas(), nueva = !R[l.id]; if (nueva) { R[l.id] = 1; Save.d.wallet = (Save.d.wallet || 0) + 3; Save.write(); }
      const n = this.lista().filter(x => R[x.id]).length, total = this.lista().length;
      Gente.charla(st, this.narrador(l, est), this.lineas(l), null, '📜 Crónica ' + n + ' de ' + total + (nueva ? ' · +3 🎫' : ''));
    },
    /* cada 0,8 s: si vas a pie o despacio junto a una estación y no hay otra charla abierta, la primera crónica que te falte */
    mirar(st, dt) {
      if ((st._cr = (st._cr || 0) + dt) < .8) return; st._cr = 0; if (st._crEspera > 0) { st._crEspera -= .8; return; }
      if (st.charla || (st.trama && st.trama.talk) || st.mode === 'ride' || (st.mode === 'veh' && Math.abs(st.vf) > 1.2) || !$('#modal') || !$('#modal').hidden) return;
      const R = this.leidas(), L = this.lista(); let mejor = null, md = 28;
      for (const h of NET.stations) { const d = Math.hypot(h.x - st.x, h.y - st.y); if (d >= md) continue; const l = L.find(x => !R[x.id] && h.lines.some(y => y.id === x.id)); if (l) { md = d; mejor = [l, h.name]; } }
      if (mejor) { st._crEspera = 20; this.contar(st, mejor[0], mejor[1]); }
    }
  };
  const _step = Libre.step;
  Libre.step = function (st, dt) { const r = _step.apply(this, arguments); if (!st.auto && !EM.headless) try { Cronicas.mirar(st, dt); } catch (e) { EM.errors.push('crónicas: ' + e.message); } return r; };
})();
