/* =====================================================================
   ARRANQUE
   ===================================================================== */
async function boot() {
  Save.load(); Vida.apply();
  const play = $('#bPlay'), playTx = play.querySelector('small'); play.disabled = true; playTx.textContent = 'Cargando el valle…';
  Game.bind(); Menu.bind(); RedView.bind(); Story.bind(); Multi.bind();
  $('#gPause').onclick = () => Game.pause(true);
  Menu.cover();
  try { await MAP.load(); } catch (e) { EM.errors.push('mapa: ' + e.message); }
  try { NET.build(); } catch (e) { EM.errors.push('red: ' + e.message); console.error(e); }
  try { MAP.estaciones(); } catch (e) { EM.errors.push('estaciones: ' + e.message); console.error(e); }
  play.disabled = false; playTx.textContent = 'Ciudad Libre y todos los modos';
  history.pushState(null, '');
  document.addEventListener('pointerdown', () => { Snd.init(); Snd.resume(); }, { once: true });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !window.AndroidBridge) navigator.serviceWorker.register('sw.js').catch(() => { });
  EM.ready = true;
}
boot();
