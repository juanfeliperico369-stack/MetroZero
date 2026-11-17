#!/usr/bin/env node
/* Prueba de regresión del servidor local (tools/server.mjs), sin librerías.
   Comprueba que una petición mal formada NO tumba el servidor, que no se sale de la carpeta del juego
   y que las salas WebSocket respetan el máximo de 4 jugadores y las tramas enmascaradas.
   Uso: node tools/test-servidor.mjs   (lo llama también tools/test.mjs) */
import { spawn } from 'node:child_process'; import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
import net from 'node:net'; import http from 'node:http'; import crypto from 'node:crypto';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export async function probarServidor() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'em-srv-'));
  fs.copyFileSync(path.join(root, 'tools/server.mjs'), path.join(tmp, 'server.mjs'));
  fs.writeFileSync(path.join(tmp, 'index.html'), '<!DOCTYPE html><title>ok</title>');
  const port = 20000 + (process.pid % 20000);
  const srv = spawn(process.execPath, [path.join(tmp, 'server.mjs'), String(port)], { stdio: 'ignore' });
  const fallos = [], ok = (c, m) => { if (!c) fallos.push(m); };
  const get = p => new Promise(r => { const q = http.request({ host: '127.0.0.1', port, path: p, method: 'GET' }, s => { let b = ''; s.on('data', d => b += d); s.on('end', () => r({ code: s.statusCode, body: b })); }); q.on('error', e => r({ code: 0, body: e.code })); q.end(); });
  const vivo = async () => (await get('/')).code === 200;
  // cliente WebSocket mínimo: devuelve {sock, msgs, status}
  const ws = (sala, key) => new Promise(r => {
    const s = net.connect(port, '127.0.0.1'), msgs = []; let head = '', st = 0, buf = Buffer.alloc(0);
    key = key || crypto.randomBytes(16).toString('base64');
    s.on('connect', () => s.write(`GET /em-ws?sala=${sala} HTTP/1.1\r\nHost: x\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`));
    s.on('data', d => {
      if (!st) { head += d.toString('latin1'); const i = head.indexOf('\r\n\r\n'); if (i < 0) return; st = +head.split(' ')[1]; buf = Buffer.from(head.slice(i + 4), 'latin1'); r({ sock: s, msgs, status: st }); } else buf = Buffer.concat([buf, d]);
      while (buf.length >= 2) { let len = buf[1] & 127, o = 2; if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); o = 4; } if (buf.length < o + len) return; msgs.push(JSON.parse(buf.slice(o, o + len).toString())); buf = buf.slice(o + len); }
    });
    s.on('error', () => r({ sock: s, msgs, status: st || -1 })); s.on('close', () => { if (!st) r({ sock: s, msgs, status: -1 }); });
  });
  const trama = (obj, masked = true) => { const pl = Buffer.from(JSON.stringify(obj)), mk = crypto.randomBytes(4), h = Buffer.from([0x81, (masked ? 128 : 0) | pl.length]); if (!masked) return Buffer.concat([h, pl]); const x = Buffer.from(pl); for (let i = 0; i < x.length; i++) x[i] ^= mk[i & 3]; return Buffer.concat([h, mk, x]); };
  const espera = ms => new Promise(r => setTimeout(r, ms));
  try {
    for (let i = 0; i < 30 && !(await vivo()); i++) await espera(100);
    ok(await vivo(), 'el servidor no arrancó');
    ok((await get('/%E0%A4%A')).code === 400, 'ruta mal codificada: se esperaba 400');
    ok(await vivo(), 'el servidor se cayó con una ruta mal codificada');
    ok((await get('/a%00b')).code === 400, 'byte nulo: se esperaba 400');
    ok([403, 404].includes((await get('/../../../etc/passwd')).code), 'salida de carpeta con ../');
    ok([403, 404].includes((await get('/%2e%2e/%2e%2e/etc/passwd')).code), 'salida de carpeta con %2e%2e');
    ok((await get('/..%5c..%5cetc%5cpasswd')).code !== 200, 'salida de carpeta con barra invertida');
    const j = await get('/em-server.json'); ok(j.code === 200 && JSON.parse(j.body).app === 'el-metro', 'em-server.json');
    ok((await get('/no-existe.txt')).code === 404, 'archivo inexistente: 404');
    const c = []; for (let i = 0; i < 4; i++) c.push(await ws('prueba'));
    ok(c.every(x => x.status === 101), 'cuatro jugadores deben entrar a la sala');
    const quinto = await ws('prueba'); ok(quinto.status === 503, 'el quinto jugador debe recibir 503');
    c[0].sock.write(trama({ t: 'hola', n: 1 })); await espera(150);
    ok(c[1].msgs.some(m => m.t === 'hola' && m.from !== undefined), 'el mensaje enmascarado debe llegar a los demás');
    const malo = await ws('otra'); malo.sock.write(trama({ t: 'x' }, false)); await espera(150);
    ok(malo.sock.destroyed || malo.sock.readableEnded, 'una trama sin máscara debe cerrar la conexión');
    const grande = await ws('otra2'); grande.sock.write(Buffer.from([0x81, 0xff, 0, 0, 0, 0, 0x7f, 0xff, 0xff, 0xff])); await espera(150);
    ok(grande.sock.destroyed || grande.sock.readableEnded, 'una trama gigante debe cerrar la conexión');
    const llave = await ws('otra3', 'no-es-base64'); ok(llave.status !== 101, 'llave WebSocket inválida rechazada');
    ok(await vivo(), 'el servidor debe seguir vivo al final');
    for (const x of [...c, quinto, malo, grande, llave]) x.sock.destroy();
  } catch (e) { fallos.push('excepción: ' + e.message); }
  srv.kill(); fs.rmSync(tmp, { recursive: true, force: true });
  return { pruebas: 16, fallos };
}
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const r = await probarServidor();
  console.log(r.fallos.length ? 'servidor: ' + r.fallos.length + ' fallos ' + JSON.stringify(r.fallos) : 'servidor: OK, ' + r.pruebas + ' comprobaciones');
  process.exit(r.fallos.length ? 1 : 0);
}
