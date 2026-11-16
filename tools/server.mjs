#!/usr/bin/env node
/* =====================================================================
   EL METRO · servidor local para jugar en grupo SIN internet (casa, colegio, biblioteca).
   Requisitos: Node.js 18+ (sin dependencias). Uso: node server.mjs [puerto]
   1) Ponlo en la misma carpeta del juego (index.html). 2) Ejecuta: node server.mjs
   3) En cada celular, conectado a la misma Wi‑Fi, abre la dirección que aparece (http://IP:8080).
   Sirve los archivos del juego y retransmite los mensajes de cada sala (WebSocket en /em-ws).
   ===================================================================== */
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import os from 'node:os';
const PORT = +process.argv[2] || 8080, here = path.dirname(new URL(import.meta.url).pathname);
const dir = fs.existsSync(path.join(here, 'index.html')) ? here : path.join(here, '..', 'dist');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.apk': 'application/vnd.android.package-archive' };
const rooms = new Map(); // sala -> {host, peers: Map(id -> socket), next}
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x'); let p = decodeURIComponent(u.pathname);
  if (p.endsWith('/em-server.json')) { res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify({ app: 'el-metro', rooms: [...rooms.keys()] })); return; }
  if (p === '/' || p.endsWith('/')) p += 'index.html';
  const f = path.join(dir, path.normalize(p).replace(/^(\.\.[/\\])+/, ''));
  if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('No encontrado'); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
/* --- WebSocket mínimo (RFC 6455, solo texto) --- */
function frame(txt) { const b = Buffer.from(txt), n = b.length, h = n < 126 ? Buffer.from([0x81, n]) : n < 65536 ? Buffer.from([0x81, 126, n >> 8, n & 255]) : Buffer.concat([Buffer.from([0x81, 127, 0, 0, 0, 0]), Buffer.from([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255])]); return Buffer.concat([h, b]); }
server.on('upgrade', (req, sock) => {
  const u = new URL(req.url, 'http://x'); if (!u.pathname.endsWith('/em-ws')) { sock.destroy(); return; }
  const key = req.headers['sec-websocket-key']; if (!key) { sock.destroy(); return; }
  const acc = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + acc + '\r\n\r\n');
  const name = (u.searchParams.get('sala') || 'sala1').slice(0, 24), wantHost = u.searchParams.get('host') === '1';
  let R = rooms.get(name); if (!R) { R = { peers: new Map(), next: 1 }; rooms.set(name, R); }
  const id = wantHost && !R.peers.has(0) ? 0 : R.next++; R.peers.set(id, sock);
  const send = (s, o) => { try { s.write(frame(JSON.stringify(o))); } catch (e) { } };
  send(sock, { t: 'id', id }); console.log(`[${name}] entra jugador ${id} (${R.peers.size} en la sala)`);
  let buf = Buffer.alloc(0);
  sock.on('data', d => {
    buf = Buffer.concat([buf, d]);
    while (buf.length >= 2) {
      const op = buf[0] & 15, masked = buf[1] & 128; let len = buf[1] & 127, o = 2;
      if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); o = 4; } else if (len === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); o = 10; }
      const mk = masked ? buf.slice(o, o + 4) : null; o += masked ? 4 : 0; if (buf.length < o + len) return;
      let pl = buf.slice(o, o + len); if (mk) { pl = Buffer.from(pl); for (let i = 0; i < pl.length; i++) pl[i] ^= mk[i & 3]; } buf = buf.slice(o + len);
      if (op === 8) { sock.end(); return; } if (op === 9) { sock.write(Buffer.from([0x8a, 0])); continue; } if (op !== 1) continue;
      let m; try { m = JSON.parse(pl.toString()); } catch (e) { continue; } m.from = id;
      for (const [pid, s] of R.peers) if (pid !== id) send(s, m);   // retransmite a todos los demás
    }
  });
  const bye = () => { if (R.peers.get(id) !== sock) return; R.peers.delete(id); for (const s of R.peers.values()) send(s, { t: 'bye', from: id }); console.log(`[${name}] sale jugador ${id}`); if (!R.peers.size) rooms.delete(name); };
  sock.on('close', bye); sock.on('error', bye);
});
server.listen(PORT, '0.0.0.0', () => {
  console.log('\n  EL METRO · servidor local listo (sin internet)\n  Abre en los celulares conectados a esta misma red:');
  for (const l of Object.values(os.networkInterfaces()).flat()) if (l && l.family === 'IPv4' && !l.internal) console.log('   → http://' + l.address + ':' + PORT);
  console.log('   (en este PC: http://localhost:' + PORT + ')\n  Ctrl+C para cerrar.\n');
});
