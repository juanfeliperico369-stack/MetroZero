/* OpenAI GPT-6 / Eón · estación → 🎮 Un día de operación.
   Se añade a la lista existente sin sustituir sus actividades. */
(() => {
  const A = EM.actividades, O = EM.modes.operacion;
  if (!A || !O || typeof A.aqui !== 'function') return;
  const prev = A.aqui;
  A.aqui = function (st) {
    const q = prev.call(this, st);
    if (!q || !q.h || !q.G) return q;
    if (!q.G.some(g => g.l && g.l.id === 'OP')) {
      q.G.push({
        l: { id: 'OP', name: 'Operación de la red', color: '#154a80' },
        it: [{ m: 'operacion', lv: 'op:red', ico: '🎮', n: 'Un día de operación',
          sub: 'Gestiona estaciones reales, horas pico y mejoras entre jornadas' }]
      });
    }
    return q;
  };
})();