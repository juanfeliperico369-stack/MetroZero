/* =====================================================================
   TUTORIAL OPCIONAL (motor 3.0, pedido del autor: «haz el tutorial opcional»)
   - Nunca sale solo ni bloquea: se abre con «❓ Cómo se juega» al final del menú (o con Tutorial.abrir(modo)).
   - La primera vez solo se ofrece con un aviso que se va solo; en Ajustes se apaga («Ofrecer “Cómo se juega”»).
   - Pasos cortos por modo, con Atrás, Siguiente y Saltar en cada paso.
   ===================================================================== */
const Tutorial = EM.tutorial = {
  PASOS: {
    general: [['Bienvenido a El Metro', 'Un juego sobre el Metro de Medellín y el Valle de Aburrá. Elige un modo en el menú: cada uno se juega solo, sin orden obligatorio.'],
      ['Moverse', 'En los modos con mapa: arrastra el dedo para moverte o usa los botones. Pellizca para acercar o alejar.'],
      ['Ayuda en el juego', 'En Ciudad Libre, 🆘 te lleva a una estación, a la calle o al inicio. Nunca quedas atrapado.'],
      ['Aprender del Metro', '«Aprende a usar el Metro» explica la Cívica, los transbordos, los horarios y la Cultura Metro.']],
    libre: [['Ciudad Libre', 'Recorre el valle real a pie, en bici, en patines o manejando. Los trabajos aparecen en la barra de arriba.'],
      ['Subir al metro', 'Acércate a una estación y toca el botón para entrar; te bajas en la próxima con ●.'],
      ['Si te pierdes', '🆘 Ayuda: vuelve a una estación, a la calle o al inicio, o pide un taxi.']],
    conduce: [['Conducir el metro', 'Acelera y frena para parar justo en el andén. Las señales en rojo obligan a esperar.'],
      ['Puntos', 'Ganas estrellas por llegar a tiempo, parar en la marca y no frenar en seco.']],
    bus: [['Metroplús y alimentadores', 'Conduce de estación en estación por las calles reales, recoge pasajeros y respeta los semáforos.']],
    cableviaje: [['Metrocable', 'Opera la línea sobre la loma. Con viento fuerte o tormenta, baja la velocidad.']],
    carrera: [['Carrera sin fin', 'Desliza para cambiar de carril y salta los obstáculos. 🧲 imán, ⚡ turbo y 🛡 escudo te ayudan.']],
    historia: [['La última vuelta', 'Rosalba y su nieta: la historia se juega en el mapa tomando el metro, los cables y los buses.']],
    red: [['La Red', 'La panorámica del valle: toca una línea para ver sus datos y tu flota.']]
  },
  abrir(modo = 'general') {
    const P = this.PASOS[modo] || this.PASOS.general; let i = 0;
    const pinta = () => {
      const [t, x] = P[i]; UI.modal(`<div class="pag">Cómo se juega · ${i + 1}/${P.length}</div><h2>${esc(t)}</h2><p>${esc(x)}</p><div class="row" style="gap:8px;margin-top:10px">${i > 0 ? '<button class="btn" id="tuAtras">Atrás</button>' : ''}<button class="btn pri" id="tuSig">${i < P.length - 1 ? 'Siguiente' : 'Listo'}</button></div>${i < P.length - 1 ? '<button class="btn" id="tuSaltar" style="margin-top:8px">Saltar</button>' : ''}`);
      const a = $('#tuAtras'), s = $('#tuSig'), k = $('#tuSaltar'); if (a) a.onclick = () => { i--; pinta(); }; if (s) s.onclick = () => { if (i < P.length - 1) { i++; pinta(); } else UI.close(); }; if (k) k.onclick = () => UI.close();
    };
    pinta(); return P.length;
  },
  /* se ofrece una sola vez, sin abrir nada */
  ofrecer() { const S = Save.d && Save.d.settings; if (!S || EM.headless) return; if (S.tuto == null) S.tuto = 1; if (!S.tuto || Save.d.tutoOfrecido) return; Save.d.tutoOfrecido = 1; Save.write(); UI.toast('¿Primera vez? Abajo en el menú está «❓ Cómo se juega» (opcional).'); }
};
/* el botón al final del menú y el aviso de la primera vez */
const _modes69 = Menu.modes;
Menu.modes = function () {
  const r = _modes69.apply(this, arguments), L = $('#mList');
  if (L && !L.querySelector('[data-tuto]')) { const b = document.createElement('button'); b.className = 'modo c-guia'; b.dataset.tuto = '1'; b.innerHTML = '<span class="nodo" style="font-size:30px;display:grid;place-items:center">❓</span><span class="tx"><b>Cómo se juega</b><small>Opcional: pasos cortos para cada modo. Se puede saltar.</small></span>'; b.onclick = () => Tutorial.abrir('general'); L.appendChild(b); }
  Tutorial.ofrecer(); return r;
};
/* Ajustes: ofrecer o no el «Cómo se juega» */
const _set69 = Menu.settings;
Menu.settings = function () {
  const r = _set69.apply(this, arguments), S = Save.d.settings, box = $('#mBody .col'); if (S.tuto == null) S.tuto = 1;
  if (box && !box.querySelector('[data-k="tuto"]')) { const lab = document.createElement('div'); lab.className = 'pag'; lab.textContent = 'Ofrecer «Cómo se juega» (nunca sale solo)'; const tg = document.createElement('div'); tg.className = 'tg'; tg.dataset.k = 'tuto'; tg.innerHTML = `<button data-v="1" class="${S.tuto ? 'on' : ''}">Sí</button><button data-v="0" class="${S.tuto ? '' : 'on'}">No</button>`; box.appendChild(lab); box.appendChild(tg); tg.querySelectorAll('button').forEach(b => b.onclick = () => { S.tuto = +b.dataset.v; Save.write(); tg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); }); }
  return r;
};
