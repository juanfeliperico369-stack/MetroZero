/* =====================================================================
   JUGAR JUNTOS: duelo de mesa (mismo celular), Wi‑Fi sin internet (QR) y servidor local.
   Cooperativo: el anfitrión simula y envía el estado 8 veces por segundo; los invitados mandan toques.
   Duelo en red: misma semilla para todos, cada uno juega su tablero y se comparten los puntajes.
   ===================================================================== */
const NETMODES = ['despacho', 'alim', 'metroplus', 'cable'];
const Multi = EM.multi = {
  players: {}, sel: { mode: 'despacho', lv: 'despacho0', kind: 'coop' },
  open() { UI.show('multi'); this.home(); },
  stat() { const n = Object.keys(this.players).length; $('#nStat').textContent = Net.connected() ? (Net.role === 'host' ? 'Anfitrión · ' : 'Invitado · ') + (n + 1) + ' jugadores' : 'Sin conexión'; },
  home() {
    this.stat();
    $('#nBody').innerHTML = `<div class="pag">Est. 08 · Multijugador</div><div class="mega" style="font-size:56px;margin-bottom:12px">Juntos</div>
      <div class="boxed" style="margin-bottom:12px"><div class="spaced" style="font-size:12px">1 · En este celular</div><p class="m">Pongan el celular en la mesa, uno frente al otro. Mismo tablero para los dos: gana quien haga más puntos.</p><div class="row">${NETMODES.map(m => `<button class="btn sm" data-d="${m}">${esc(EM.modes[m].name)}</button>`).join('')}</div></div>
      <div class="boxed" style="margin-bottom:12px"><div class="spaced" style="font-size:12px">2 · Wi‑Fi sin internet</div><p class="m">Conecten los celulares a la misma red Wi‑Fi o al punto de acceso de uno de ellos (no gasta datos). Se enlazan con un código QR: hasta 4 jugadores.</p>${Net.supported() ? '<div class="row"><button class="btn sm tin" id="nHost">Crear sala</button><button class="btn sm" id="nJoin">Unirme con código</button></div>' : '<p class="bad">Este navegador no soporta WebRTC.</p>'}</div>
      <div class="boxed" style="margin-bottom:12px"><div class="spaced" style="font-size:12px">3 · Servidor local (PC)</div><p class="m" id="nSrv">Buscando servidor…</p></div>
      <div class="boxed dash" style="margin-bottom:12px"><div class="spaced" style="font-size:12px">4 · Bluetooth</div><p class="m">Los navegadores no permiten jugar por Bluetooth entre celulares. En la app Android llegará un modo “Cerca” (Bluetooth + Wi‑Fi directo, sin internet). Mientras tanto usa el punto de acceso del celular: funciona igual y sin datos.</p></div>
      <details><summary class="pag">Avanzado · probar en dos pestañas</summary><div class="row" style="margin-top:8px"><button class="btn sm" id="nBcH">Pestaña anfitriona</button><button class="btn sm" id="nBcJ">Pestaña invitada</button></div></details>
      ${Net.connected() ? '<div style="margin-top:14px"><button class="btn pri" id="nLobby">Volver a la sala ▶</button></div>' : ''}`;
    $$('#nBody [data-d]').forEach(b => b.onclick = () => { Menu.levels(b.dataset.d); setTimeout(() => { const d = $('#lDuel'); if (d) d.click(); }, 30); });
    const h = $('#nHost'); if (h) h.onclick = () => this.hostFlow();
    const j = $('#nJoin'); if (j) j.onclick = () => this.joinFlow();
    $('#nBcH').onclick = () => { this.wire(); Net.bcOpen('prueba', true); this.lobby(); };
    $('#nBcJ').onclick = () => { this.wire(); Net.bcOpen('prueba', false); this.hello(); this.lobby(); };
    const lb = $('#nLobby'); if (lb) lb.onclick = () => this.lobby();
    Net.hasServer().then(ok => { const el = $('#nSrv'); if (!el) return; if (ok) { el.innerHTML = '¡Hay un servidor de El Metro en esta red! <div class="row" style="margin-top:8px"><input id="nRoom" value="sala1" maxlength="12" style="border:3px solid var(--negro);padding:6px;width:110px"><button class="btn sm tin" id="nSH">Crear</button><button class="btn sm" id="nSJ">Entrar</button></div>'; const go = host => { this.wire(); Net.wsConnect(($('#nRoom').value || 'sala1').trim(), host).then(() => { if (!host) this.hello(); this.lobby(); }, e => UI.toast(e.message)); }; $('#nSH').onclick = () => go(true); $('#nSJ').onclick = () => go(false); } else el.innerHTML = 'Para jugar con un PC como servidor (casa, colegio, biblioteca): en el PC ejecuta <b>node server.mjs</b> (viene con el juego) y abre en cada celular la dirección que muestra, por ejemplo <b>http://192.168.1.10:8080</b>. Todo queda dentro de la red local.'; });
  },
  wire() { Net.onmsg = m => this.onmsg(m); Net.onstatus = s => { this.stat(); if (s === 'open' && UI.cur === 'multi' && this._wait) { this._wait = false; UI.close(); if (Net.role === 'guest') this.hello(); this.lobby(); } }; },
  async hostFlow() {
    this.wire();
    try {
      const code = await Net.host(); this._wait = true;
      this.showCode('Paso 1 · El invitado escanea este código', code, 'Paso 2 · Escanea o pega la respuesta del invitado', async ans => { await Net.accept(ans); UI.toast('Conectando…'); });
    } catch (e) { UI.toast(e.message); }
  },
  joinFlow() {
    this.wire();
    this.askCode('Escanea o pega el código del anfitrión', async c => { try { const ans = await Net.join(c); this._wait = true; this.showCode('Muestra esta respuesta al anfitrión', ans, null, null); } catch (e) { UI.toast(e.message); } });
  },
  showCode(title, code, nextTitle, onAns) {
    let qr = ''; try { qr = QR.canvas(code, 3, 3, '#141414', '#ffffff').toDataURL(); } catch (e) { qr = ''; }
    UI.modal(`<div class="pag">Sala local</div><h2>${esc(title)}</h2>${qr ? `<div class="qr"><img src="${qr}" alt="código QR" style="width:min(70vw,260px);image-rendering:pixelated"></div>` : ''}<textarea class="code" readonly>${esc(code)}</textarea>
      <div class="row" style="margin:8px 0"><button class="btn sm" id="qCopy">Copiar</button>${(window.AndroidBridge && AndroidBridge.share) || navigator.share ? '<button class="btn sm" id="qShare">Compartir</button>' : ''}</div>
      ${nextTitle ? `<div class="pag">${esc(nextTitle)}</div><div class="row" style="margin-top:6px"><button class="btn sm tin" id="qScan">📷 Escanear</button><button class="btn sm" id="qPaste">Pegar</button></div><textarea class="code" id="qIn" placeholder="Respuesta EM…"></textarea><button class="btn sm pri" id="qOk" style="margin-top:6px">Conectar</button>` : '<p class="m">Esperando a que el anfitrión lea tu respuesta…</p>'}<button class="btn sm gh" id="qX" style="margin-top:8px">Cancelar</button>`);
    $('#qCopy').onclick = () => { try { navigator.clipboard.writeText(code); UI.toast('Copiado'); } catch (e) { } };
    const sh = $('#qShare'); if (sh) sh.onclick = () => { if (window.AndroidBridge && AndroidBridge.share) AndroidBridge.share(code); else navigator.share({ text: code }).catch(() => { }); };
    $('#qX').onclick = () => { this._wait = false; UI.close(); };
    if (nextTitle) {
      const done = async t => { try { await onAns(t.trim()); } catch (e) { UI.toast(e.message); } };
      $('#qScan').onclick = () => QR.startScan(t => { $('#qIn').value = t; done(t); }, msg => UI.toast(msg));
      $('#qPaste').onclick = async () => { try { $('#qIn').value = await navigator.clipboard.readText(); } catch (e) { UI.toast('Pega el código en el cuadro'); } };
      $('#qOk').onclick = () => done($('#qIn').value);
    }
  },
  askCode(title, cb) {
    UI.modal(`<div class="pag">Unirme</div><h2>${esc(title)}</h2><div class="row"><button class="btn sm tin" id="aScan">📷 Escanear</button><button class="btn sm" id="aPaste">Pegar</button></div><textarea class="code" id="aIn" placeholder="Código EM…"></textarea><div class="row" style="margin-top:8px"><button class="btn pri" id="aOk">Continuar</button><button class="btn sm gh" id="aX">Cancelar</button></div>`);
    $('#aScan').onclick = () => QR.startScan(t => { $('#aIn').value = t; cb(t); }, m => UI.toast(m));
    $('#aPaste').onclick = async () => { try { $('#aIn').value = await navigator.clipboard.readText(); } catch (e) { UI.toast('Pega el código en el cuadro'); } };
    $('#aOk').onclick = () => cb($('#aIn').value); $('#aX').onclick = () => UI.close();
  },
  hello() { Net.send({ t: 'hello', name: Save.d.name }); },
  lobby() {
    this.stat(); const host = Net.role === 'host', S = this.sel, M = EM.modes[S.mode];
    $('#nBody').innerHTML = `<div class="pag">Sala</div><div class="mega" style="font-size:52px">${host ? 'Tu sala' : 'En la sala'}</div>
      <div class="boxed" style="margin:10px 0"><b>${esc(Save.d.name)}</b> (tú)${Object.values(this.players).map(p => '<br>' + esc(p.name)).join('')}</div>
      ${host ? `<div class="pag">Modo</div><div class="tg" id="lMode">${NETMODES.map(m => `<button data-m="${m}" class="${S.mode === m ? 'on' : ''}">${esc(EM.modes[m].name)}</button>`).join('')}</div>
      <div class="pag" style="margin-top:8px">Nivel</div><select id="lLv" style="border:3px solid var(--negro);padding:6px;font-size:15px;max-width:100%">${M.levels().map(l => `<option value="${esc(l.id)}" ${l.id === S.lv ? 'selected' : ''}>${esc(l.name)}</option>`).join('')}</select>
      <div class="pag" style="margin-top:8px">Forma de jugar</div><div class="tg" id="lKind"><button data-k="coop" class="${S.kind === 'coop' ? 'on' : ''}">Cooperativo (mismo tablero)</button><button data-k="duelo" class="${S.kind === 'duelo' ? 'on' : ''}">Duelo (misma partida, cada uno la suya)</button></div>
      <div class="row" style="margin-top:12px"><button class="btn pri" id="lGo">▶ Empezar</button>${Net.kind === 'rtc' ? '<button class="btn sm" id="lMore">+ Invitar otro</button>' : ''}<button class="btn sm gh" id="lOut">Salir de la sala</button></div>` : '<p class="m">Esperando a que el anfitrión elija el juego…</p><button class="btn sm gh" id="lOut">Salir de la sala</button>'}`;
    if (host) {
      $$('#lMode button').forEach(b => b.onclick = () => { S.mode = b.dataset.m; S.lv = EM.modes[S.mode].levels()[0].id; this.lobby(); });
      $('#lLv').onchange = e => S.lv = e.target.value;
      $$('#lKind button').forEach(b => b.onclick = () => { S.kind = b.dataset.k; this.lobby(); });
      $('#lGo').onclick = () => { const seed = (Math.random() * 1e9) | 0; Net.send({ t: 'start', mode: S.mode, lv: S.lv, kind: S.kind, seed }); this.begin(S.mode, S.lv, S.kind, seed, true); };
      const mo = $('#lMore'); if (mo) mo.onclick = () => this.hostFlow();
    }
    $('#lOut').onclick = () => { Net.reset(); this.players = {}; this.home(); };
  },
  begin(mode, lv, kind, seed, host) {
    const guest = kind === 'coop' && !host, rival = {};
    Game.start(mode, lv, { seed, back: 'multi', onEnd: kind === 'duelo' ? r => this.duelEnd(r, rival) : null });
    const M = EM.modes[mode]; let acc = 0;
    Game.net = {
      guest, kind,
      sendAct: a => Net.send({ t: 'act', a }),
      tick: dt => { acc += dt; if (kind === 'coop' && host && acc > .125) { acc = 0; Net.send({ t: 'st', s: JSON.parse(JSON.stringify(Game.st, (k, v) => k[0] === '_' ? undefined : v)) }); } if (kind === 'duelo' && acc > 1) { acc = 0; const r = M.result(Game.st); Net.send({ t: 'sc', score: r.score, done: r.done, name: Save.d.name }); } },
      chips: () => kind === 'duelo' ? Object.values(rival).map(p => [p.name.slice(0, 8), (p.score | 0) + (p.done ? '✓' : '')]) : [['👥', Object.keys(this.players).length + 1]],
      onEnd: r => { if (kind === 'coop' && host) Net.send({ t: 'end', r: { score: r.score, stars: r.stars, win: r.win } }); },
      leave: () => { },
      rival
    };
  },
  duelEnd(r, rival) {
    Net.send({ t: 'sc', score: r.score, done: true, name: Save.d.name }); const earn = Save.record(Game.mode.id, Game.lv, r);
    const all = [[Save.d.name + ' (tú)', r.score | 0], ...Object.values(rival).map(p => [p.name, p.score | 0])].sort((a, b) => b[1] - a[1]);
    UI.modal(`<div class="pag">Duelo en red</div><h2>${all[0][0].includes('(tú)') ? '¡Ganaste!' : 'Gana ' + esc(all[0][0])}</h2><div class="kv">${all.map(([n, s]) => `<b>${esc(n)}</b><span>${fmt(s)}</span>`).join('')}</div><p class="m">+${earn} 🎫 · los puntajes de los demás se actualizan cuando terminan.</p><button class="btn pri" id="dOk">Volver a la sala</button>`);
    $('#dOk').onclick = () => { UI.close(); Game.exit(); this.lobby(); };
  },
  onmsg(m) {
    const from = m.from;
    switch (m.t) {
      case 'hello': this.players[from] = { name: String(m.name || 'Jugador').slice(0, 16) }; if (Net.role === 'host') Net.send({ t: 'roster', p: this.players, host: Save.d.name }); this.stat(); if (UI.cur === 'multi') this.lobby(); UI.toast((m.name || 'Alguien') + ' entró a la sala'); break;
      case 'roster': if (Net.role !== 'host') { this.players = {}; this.players[0] = { name: m.host }; for (const k in m.p) if (+k !== Net.myId) this.players[k] = m.p[k]; this.stat(); if (UI.cur === 'multi') this.lobby(); } break;
      case 'bye': delete this.players[from]; this.stat(); if (UI.cur === 'multi') this.lobby(); break;
      case 'start': if (Net.role !== 'host') this.begin(m.mode, m.lv, m.kind, m.seed, false); break;
      case 'act': if (Net.role === 'host' && Game.net && Game.net.kind === 'coop' && Game.mode) Game.mode.act(Game.st, m.a); break;
      case 'st': if (Game.net && Game.net.guest && m.s) { Game.st = m.s; } break;
      case 'sc': if (Game.net && Game.net.rival) Game.net.rival[from] = { name: String(m.name || 'Rival'), score: m.score | 0, done: !!m.done }; break;
      case 'end': if (Game.net && Game.net.guest) { Game.ended = true; const r = Object.assign(Game.mode.result(Game.st), m.r || {}); Snd.play('win'); UI.modal(`<div class="pag">Cooperativo</div><h2>${r.win ? '¡Lo lograron!' : 'Fin'}</h2><div style="font-size:30px;color:var(--mostaza)">${'★'.repeat(r.stars | 0)}</div><p>Puntaje del equipo: <b>${fmt(r.score)}</b></p><button class="btn pri" id="eOk">Volver a la sala</button>`); $('#eOk').onclick = () => { UI.close(); Game.exit(); this.lobby(); }; } break;
    }
  },
  bind() { $('#nBack').onclick = () => UI.back(); UI.onshow.multi = () => { if (Net.connected()) this.lobby(); else this.home(); }; }
};
