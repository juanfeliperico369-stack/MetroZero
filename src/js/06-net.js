/* =====================================================================
   RED LOCAL: salas de hasta 4 jugadores, SIN servidores externos.
   Transportes:
   · rtc: WebRTC con códigos QR (misma Wi‑Fi o punto de acceso del celular; sin internet, sin STUN).
   · ws:  servidor local en un PC de la casa/colegio (tools/server.mjs, Node sin dependencias).
   · bc:  BroadcastChannel (dos pestañas del mismo navegador; útil para probar).
   Topología en estrella: el anfitrión (id 0) reenvía a los demás.
   ===================================================================== */
const b64u = {
  enc(bytes) { let s = ''; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  dec(str) { str = str.replace(/-/g, '+').replace(/_/g, '/'); while (str.length % 4) str += '='; const s = atob(str), b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; }
};
const Net = EM.net = {
  kind: null, peers: [], role: null, myId: 0, status: 'off', pending: null, onmsg: null, onstatus: null, MAX: 3, ws: null, bc: null, lan: true,
  supported() { return !!window.RTCPeerConnection; },
  setStatus(s) { this.status = s; if (this.onstatus) this.onstatus(s); },
  connected() { return this.kind === 'ws' ? !!(this.ws && this.ws.readyState === 1) : this.kind === 'bc' ? !!this.bc : this.openCount() > 0; },
  openCount() { return this.peers.filter(p => p.open).length; },
  /* ---------------- WebRTC ---------------- */
  newPC(peer) {
    const pc = new RTCPeerConnection({ iceServers: [] });   // sin STUN: solo red local, funciona sin internet
    pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') { peer.open = false; this.setStatus(this.openCount() ? 'open' : pc.connectionState); } };
    return pc;
  },
  wire(peer, ch) {
    peer.ch = ch;
    ch.onopen = () => { peer.open = true; if (this.role === 'host') this.rawSend(peer, { t: 'id', id: peer.id }); this.setStatus('open'); };
    ch.onclose = () => { peer.open = false; this.setStatus(this.openCount() ? 'open' : 'closed'); if (this.onmsg) this.onmsg({ t: 'bye', from: this.role === 'host' ? peer.id : 0 }); };
    ch.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch (er) { return; } if (!m || typeof m !== 'object') return; this.recv(peer, m); };
  },
  recv(peer, m) {
    if (m.t === 'id' && this.role === 'guest') { this.myId = m.id | 0; }
    if (this.role === 'host') { m.from = peer.id; for (const q of this.peers) if (q !== peer && q.open) this.rawSend(q, m); }
    if (this.onmsg) this.onmsg(m);
  },
  ice(pc) { return new Promise(res => { if (pc.iceGatheringState === 'complete') return res(); const t = setTimeout(res, 3500); pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') { clearTimeout(t); res(); } }); }); },
  async host() {
    if (this.role !== 'host' || this.kind !== 'rtc') { this.reset(); this.kind = 'rtc'; this.role = 'host'; this.myId = 0; }
    if (this.peers.length >= this.MAX) throw new Error('La sala ya tiene 4 jugadores');
    const peer = { id: this.peers.length + 1, open: false }; peer.pc = this.newPC(peer); this.peers.push(peer);
    this.wire(peer, peer.pc.createDataChannel('em', { ordered: true }));
    await peer.pc.setLocalDescription(await peer.pc.createOffer()); await this.ice(peer.pc);
    this.pending = peer; this.setStatus('waiting');
    return this.pack({ t: 'o', s: peer.pc.localDescription.sdp });
  },
  async accept(code) {
    const o = await this.unpack(code); if (o.t !== 'a') throw new Error('Ese no es un código de respuesta');
    const p = this.pending; if (!p) throw new Error('Primero crea un código de invitación');
    await p.pc.setRemoteDescription({ type: 'answer', sdp: o.s }); this.pending = null;
  },
  async join(code) {
    const o = await this.unpack(code); if (o.t !== 'o') throw new Error('Ese no es un código de sala');
    this.reset(); this.kind = 'rtc'; this.role = 'guest'; const peer = { id: 0, open: false }; peer.pc = this.newPC(peer); this.peers = [peer];
    peer.pc.ondatachannel = e => this.wire(peer, e.channel);
    await peer.pc.setRemoteDescription({ type: 'offer', sdp: o.s }); await peer.pc.setLocalDescription(await peer.pc.createAnswer()); await this.ice(peer.pc); this.setStatus('waiting');
    return this.pack({ t: 'a', s: peer.pc.localDescription.sdp });
  },
  rawSend(peer, m) { if (peer.ch && peer.ch.readyState === 'open') { try { peer.ch.send(JSON.stringify(m)); } catch (e) { } } },
  async pack(o) {
    const txt = JSON.stringify(o);
    if (window.CompressionStream) { const cs = new Blob([txt]).stream().pipeThrough(new CompressionStream('deflate-raw')); return 'EM1' + o.t + b64u.enc(new Uint8Array(await new Response(cs).arrayBuffer())); }
    return 'EM0' + o.t + b64u.enc(new TextEncoder().encode(txt));
  },
  async unpack(code) {
    code = String(code || '').replace(/\s+/g, ''); const i = code.indexOf('EM'); if (i < 0) throw new Error('Código no válido'); code = code.slice(i);
    const v = code.slice(0, 3), body = code.slice(4), bytes = b64u.dec(body);
    if (v === 'EM1') {
      if (!window.DecompressionStream) throw new Error('Tu navegador no puede leer este código');
      const rd = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader(), parts = []; let n = 0;
      for (;;) { const { done, value } = await rd.read(); if (done) break; n += value.length; if (n > 65536) { rd.cancel(); throw new Error('Código no válido'); } parts.push(value); }
      const all = new Uint8Array(n); let o = 0; for (const p of parts) { all.set(p, o); o += p.length; } return JSON.parse(new TextDecoder().decode(all));
    }
    if (v === 'EM0') return JSON.parse(new TextDecoder().decode(bytes));
    throw new Error('Código no válido');
  },
  /* ---------------- servidor local (WebSocket) ---------------- */
  serverURL() { if (!/^https?:$/.test(location.protocol)) return null; return (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/em-ws'; },
  async hasServer() { if (!/^https?:$/.test(location.protocol)) return false; try { const r = await fetch('em-server.json', { cache: 'no-store' }); if (!r.ok) return false; const j = await r.json(); return j && j.app === 'el-metro'; } catch (e) { return false; } },
  wsConnect(room, asHost) {
    return new Promise((res, rej) => {
      this.reset(); this.kind = 'ws'; this.role = asHost ? 'host' : 'guest';
      let ws; try { ws = this.ws = new WebSocket(this.serverURL() + '?sala=' + encodeURIComponent(room) + '&host=' + (asHost ? 1 : 0)); } catch (e) { rej(e); return; }
      const to = setTimeout(() => rej(new Error('El servidor no responde')), 5000);
      ws.onopen = () => { clearTimeout(to); this.setStatus('open'); res(); };
      ws.onerror = () => { clearTimeout(to); rej(new Error('No se pudo conectar al servidor local')); };
      ws.onclose = () => { this.setStatus('closed'); if (this.onmsg) this.onmsg({ t: 'bye', from: -1 }); };
      ws.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch (er) { return; } if (!m || typeof m !== 'object') return; if (m.t === 'id') this.myId = m.id | 0; if (this.onmsg) this.onmsg(m); };
    });
  },
  /* ---------------- mismo navegador (pestañas) ---------------- */
  bcOpen(room, asHost) {
    this.reset(); if (!window.BroadcastChannel) throw new Error('Sin BroadcastChannel');
    this.kind = 'bc'; this.role = asHost ? 'host' : 'guest'; this.myId = asHost ? 0 : 1 + Math.floor(Math.random() * 999);
    this.bc = new BroadcastChannel('elmetro-' + room); this.bc.onmessage = e => { const m = e.data; if (m && typeof m === 'object' && m.from !== this.myId && this.onmsg) this.onmsg(m); }; this.setStatus('open');
  },
  /* ---------------- envío común ---------------- */
  send(m) {
    m.from = this.myId;
    if (this.kind === 'ws') { if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(m)); return; }
    if (this.kind === 'bc') { if (this.bc) this.bc.postMessage(m); return; }
    for (const p of this.peers) if (p.open) this.rawSend(p, m);
  },
  reset() {
    for (const p of this.peers) { try { if (p.ch) p.ch.close(); } catch (e) { } try { if (p.pc) p.pc.close(); } catch (e) { } }
    if (this.ws) { try { this.ws.onclose = null; this.ws.close(); } catch (e) { } } if (this.bc) { try { this.bc.close(); } catch (e) { } }
    this.ws = null; this.bc = null; this.peers = []; this.pending = null; this.role = null; this.kind = null; this.myId = 0; this.status = 'off';
  }
};
