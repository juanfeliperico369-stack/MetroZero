# Auditoría recibida · servidor local (v0.5.0)

> **Verificación (Claude Code, 17-nov-2026, v0.6.0).**
> - **Confirmado:** con el `tools/server.mjs` de v0.5.0, una petición como `GET /%E0%A4%A` lanza `URIError` y **tumba el proceso**; la siguiente petición ya no responde.
> - **Corregido** en `tools/server.mjs` (no se copió el parche literal): errores de URL → 400; byte nulo → 400; rutas resueltas contra la carpeta del juego (403 si se sale); solo archivos normales; llave WebSocket validada; **máximo 4 jugadores por sala** (como dice el juego); tramas sin máscara o gigantes → se cierra la conexión; búfer acotado; aviso claro si el puerto está ocupado.
> - Se mantuvo `endsWith('/em-server.json')` y `endsWith('/em-ws')` (el parche los volvía exactos y podía romper el juego servido desde una subcarpeta).
> - **Prueba de regresión:** `node tools/test-servidor.mjs` (16 comprobaciones; con el servidor viejo fallan 11). También corre dentro de `node tools/test.mjs`.
> - **Pendiente (P0 de la auditoría):** la APK se firma con la clave de desarrollo del repositorio. No se cambió: cambiar la firma impide actualizar las APK ya instaladas. Queda en el plan como decisión del autor.

---

# EL METRO · Diagnóstico y primera corrección verificable

**Fecha:** 17 de noviembre de 2026  
**Fuente principal:** `EL-METRO-TODO.md` (v0.5.0); comparación con repositorio público `juanfeliperico369-stack/MetroZero`.  
**Estado:** auditoría técnica inicial, parche local y pruebas de regresión. **No** se modificó GitHub, GitHub Pages ni la APK.

## 1. La identidad que hay que preservar

**Misión.** Que niños, familias, residentes y visitantes conozcan y cuiden Medellín y su red de transporte a través de un videojuego entretenido y accesible.  
**Visión.** Mundo abierto + arcade, con Medellín fiel al territorio, un solo juego integrado, para móviles modestos y sin conexión. El centro de la experiencia es **Ciudad Libre**; las operaciones de tren, bus, tranvía y cable, junto con la historia de Rosalba, salen de ese mundo y regresan a él.

**No alterar:** español, público familiar, Cultura Metro, guardado `elmetro.v1`, funcionamiento sin Internet, arte original y ausencia de librerías externas en ejecución. Mantener los sprites procedurales mientras se integran nuevos atlas.

## 2. Estado del material inspeccionado

- Documento adjunto: aproximadamente 9.914 líneas y 959 KiB. Contiene protocolo, roles, encargos, bitácora, arte, geografía, historia, diseño y fuente de aproximadamente 59 archivos de texto extraíbles.
- Componentes reconstruidos desde el documento para auditoría: 31 módulos `src/js/*.js`, tres archivos de estructura/estilo, datos de red y rutas, 9 herramientas `tools/*.mjs` y archivos Android.
- La versión de trabajo v0.5.0 está en la rama `ccr-2a67f935-oat714`. La rama `main` conserva v0.2.0. **No fusionar a ciegas** ni basar una edición en `main`.
- El documento deliberadamente **no incluye** el contenido completo de `src/data/valle.js` (mapa comprimido ~1 MB). Para compilar y ejecutar el juego real, debe obtenerse del repositorio.
- Se verificó que los 31 módulos y los scripts `tools/*.mjs` extraídos pasan `node --check` individualmente. Esto solo verifica **sintaxis**, no funcionamiento integral ni rendimiento.
- En este entorno no está disponible el paquete npm `playwright` y falta el mapa comprimido: **no ejecuté las 100 partidas completas ni probé la APK en dispositivo real**.

## 3. Hallazgo crítico reproducido y reparado localmente

### Servidor de juego local: caída ante solicitudes HTTP malformadas

En la versión original, `decodeURIComponent(u.pathname)` se ejecuta sin manejo de excepciones. Una solicitud cuya ruta tenga codificación percent inválida lanza `URIError: URI malformed` y finaliza el proceso Node. En un servidor abierto a la red doméstica o escolar, un cliente puede provocar accidental o deliberadamente esa caída.

**Reproducción previa al arreglo:**

1. Servidor local accesible en `/`: **200 OK**.
2. Solicitud con una ruta mal codificada: el proceso Node termina con `URIError`.
3. Nueva solicitud a `/`: conexión rechazada; el servidor ya no responde.

**Correcciones incluidas en el parche adjunto:**

- Capturar errores al interpretar la URL, devolver **400** sin terminar el proceso.
- Rechazar bytes nulos en rutas.
- Normalizar y resolver caminos contra la carpeta `dist` usando un límite de ruta real, en lugar de comparar prefijos ambiguos.
- Verificar que el archivo solicitado existe y es un archivo normal.
- Exigir la máscara obligatoria de tramas WebSocket desde clientes y acotar mensajes/búfer para evitar acumulación sin límite.
- Aplicar el máximo de **cuatro jugadores** por sala que describe el diseño.

**Prueba posterior:** `node tools/test-server-hardening.mjs` → **13 comprobaciones satisfactorias**. Incluye respuestas 200/400/403, persistencia del proceso, cuatro conexiones WebSocket válidas, rechazo de una quinta y desconexión de trama no enmascarada.

El parche solo afecta `tools/server.mjs`; **no toca lógica de conducción, mapa, partidas, guardados, arte ni APK**. Antes de integrarlo en el repositorio se deben ejecutar también los tests generales y probar una partida multijugador auténtica.

## 4. Otras prioridades

### P0 — Seguridad y publicación

**Firmas Android.** El código de Gradle permite firmar `release` con la clave de desarrollo `android/keystore/elmetro-dev.jks` y credenciales de desarrollo definidas en el repositorio. Si la APK distribuida se firmó con esa clave, su procedencia no se puede tratar como segura. Separar inmediatamente las firmas de producción y desarrollo, revisar la estrategia de actualización de instalaciones existentes y no publicar secretos de producción. **No cambié la firma:** hacerlo sin un plan puede impedir actualizar la APK ya instalada.

**Separación de ramas.** Documentar una única rama de desarrollo y un proceso de versión verificable entre ella, `main` y `gh-pages`; automatizar revisión de hash, versión y artefactos antes de la publicación.

### P1 — Fiabilidad del juego y de la experiencia

- Ejecutar `node tools/build.mjs` y `node tools/test.mjs 100` **sobre el repositorio completo** con el archivo binario de mapa; guardar reporte, capturas y errores.
- Probar en **móvil Android real de gama modesta**: FPS medio, p95 de tiempo por cuadro, memoria, tiempo de carga y cambios entre módulos.
- Verificar que el guardado existente se conserva a través de importaciones, actualizaciones del service worker y cambios de versión.
- Hacer una prueba de usuario inicial: tocar **Jugar**, aprender a moverse, coger un transporte, terminar un viaje, volver a Ciudad Libre y continuar después de cerrar la app.

### P2 — Arte y jugabilidad

- Terminar el **G-00** de Gemini como ancla visual antes de aprobar una gran cantidad de imágenes.
- ChatGPT produce los recursos **C-**: sprites cenitales, iconografía, paneles, señalética, portadas, fiestas y texturas, manteniendo alfa y la paleta establecida.
- Integrar con atlas livianos y respaldo procedural; hacer comparaciones de legibilidad en las dimensiones finales, no únicamente al ampliar a 1024 px.
- Primero pulir un corredor **Niquía–San Antonio–Acevedo–Santo Domingo**, en vez de expandir simultáneamente todo el Valle. Validar después el proceso de extender un área sin romper controles, estaciones ni rendimiento.

### P3 — Fidelidad geográfica e isométrica

- Construir mosaicos dimétricos 2:1 desde datos abiertos comprobables; no usar pantallazos de Google Maps o Earth como textura ni base.
- Comprobar geometría y altura de vías, viaductos, relieve y estaciones *antes* de repintar. El arte no debe mover la topografía ni las estructuras.

## 5. Protocolo de comprensión: respuestas

1. **Misión:** que todos conozcan, recorran y cuiden Medellín y la red de transporte jugando.
2. **Reparto:** Gemini = Artista 1, encargos `G-`; ChatGPT = Artista 2, encargos `C-`. Los agentes de programación gestionan el código y las pruebas.
3. **Colores:** línea A `#1C5C9C`; Metroplús 1 `#0E6F76`.
4. **Fondo si no hay alfa:** magenta plano `#FF00FF`.
5. **Luz:** desde arriba a la izquierda; la sombra proyectada la añade el motor del juego.
6. **Sprites de vehículos:** escala 1 m = 8 px; todos miran a la derecha.
7. **Prohibiciones artísticas:** texto no pedido, marcas/logos reales, marcas de agua, armas, violencia, sustancias y estereotipos sobre narcotráfico, entre otras reglas de público familiar.
8. **Dimétrica 2:1:** dos píxeles en horizontal por uno de desplazamiento vertical; en `G-90`, `G-100` y la vista/mosaicos isométricos.
9. **Rosalba:** conductora veterana de unos 60 años, pelo canoso recogido, uniforme azul con franja de la línea A, pañoleta y termo de tinto.
10. **Primer encargo de producción:** `G-00`, tablero que fija el estilo para las dos IA; antes de producir en serie, ChatGPT prueba un único ícono de `C-10`.
11. **Skills:** `el-metro-arte` siempre; `medellin-fiel` para mapa, relieve, estructuras y encargos isométricos.
12. **Comandos:** `node tools/build.mjs`, `node tools/test.mjs 100`, `node tools/todo.mjs`; actualizar `docs/BITACORA.md` al terminar una intervención de código.
13. **Fuera del rol:** señalar al agente correspondiente, no suplantar su encargo de producción.

## 6. Reglas aprendidas para próximos trabajos

1. Confirmar la rama exacta antes de cualquier edición; el contenido publicado puede estar más adelantado que `main`.
2. Priorizar regresiones reproducibles sobre promesas de mejora.
3. No tocar firmas Android, formatos de guardado, geometrías reales ni misión/visión sin plan y autorización expresa.
4. Distinguir **sintaxis validada**, **test de componente ejecutado** y **partida real comprobada**: son evidencias diferentes.
5. Mantener el protocolo artístico G- / C- y la prueba de pequeña escala antes de producción masiva.

## 7. Entregables y límites

- `PARCHE-servidor-local.patch`: cambios propuestos para el servidor.
- `tools/server.mjs`: versión corregida, como **referencia**, para aplicar sobre la rama de trabajo y revisar el diff.
- `tools/test-server-hardening.mjs`: prueba de regresión sin librerías externas.
- Este informe.

No se ha publicado v0.5.1; no se ha modificado GitHub; no se ha sustituido la APK ni se han ejecutado las 100 partidas en la rama real.


## Parche propuesto (referencia, no aplicado literalmente)

```diff
--- a/tools/server.mjs
+++ b/tools/server.mjs
@@ -11,33 +11,54 @@
 const dir = fs.existsSync(path.join(here, 'index.html')) ? here : path.join(here, '..', 'dist');
 const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.apk': 'application/vnd.android.package-archive' };
 const rooms = new Map(); // sala -> {host, peers: Map(id -> socket), next}
+const MAX_PLAYERS = 4, MAX_WS_MESSAGE = 65536, MAX_WS_BUFFER = 131072;
+const baseDir = path.resolve(dir);
+const reject = (res, code, text) => { res.writeHead(code, { 'content-type': 'text/plain; charset=utf-8' }); res.end(text); };
 const server = http.createServer((req, res) => {
-  const u = new URL(req.url, 'http://x'); let p = decodeURIComponent(u.pathname);
-  if (p.endsWith('/em-server.json')) { res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify({ app: 'el-metro', rooms: [...rooms.keys()] })); return; }
+  let u, p;
+  try { u = new URL(req.url, 'http://x'); p = decodeURIComponent(u.pathname); }
+  catch { reject(res, 400, 'Ruta inválida'); return; }
+  if (p.includes('\0')) { reject(res, 400, 'Ruta inválida'); return; }
+  if (p === '/em-server.json') { res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify({ app: 'el-metro', rooms: [...rooms.keys()] })); return; }
   if (p === '/' || p.endsWith('/')) p += 'index.html';
-  const f = path.join(dir, path.normalize(p).replace(/^(\.\.[/\\])+/, ''));
-  if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('No encontrado'); return; }
-  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
+  const f = path.resolve(baseDir, p.replace(/^[/\\]+/, ''));
+  if (!f.startsWith(baseDir + path.sep)) { reject(res, 403, 'Acceso denegado'); return; }
+  let info;
+  try { info = fs.statSync(f); } catch { reject(res, 404, 'No encontrado'); return; }
+  if (!info.isFile()) { reject(res, 404, 'No encontrado'); return; }
+  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
+  const stream = fs.createReadStream(f);
+  stream.on('error', () => res.destroy());
+  stream.pipe(res);
 });
 /* --- WebSocket mínimo (RFC 6455, solo texto) --- */
 function frame(txt) { const b = Buffer.from(txt), n = b.length, h = n < 126 ? Buffer.from([0x81, n]) : n < 65536 ? Buffer.from([0x81, 126, n >> 8, n & 255]) : Buffer.concat([Buffer.from([0x81, 127, 0, 0, 0, 0]), Buffer.from([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255])]); return Buffer.concat([h, b]); }
 server.on('upgrade', (req, sock) => {
-  const u = new URL(req.url, 'http://x'); if (!u.pathname.endsWith('/em-ws')) { sock.destroy(); return; }
-  const key = req.headers['sec-websocket-key']; if (!key) { sock.destroy(); return; }
+  let u;
+  try { u = new URL(req.url, 'http://x'); } catch { sock.destroy(); return; }
+  if (u.pathname !== '/em-ws') { sock.destroy(); return; }
+  const key = req.headers['sec-websocket-key'];
+  if (typeof key !== 'string' || !/^[A-Za-z0-9+/]{22}==$/.test(key)) { sock.destroy(); return; }
+  const name = (u.searchParams.get('sala') || 'sala1').slice(0, 24), wantHost = u.searchParams.get('host') === '1';
+  let R = rooms.get(name);
+  if (R && R.peers.size >= MAX_PLAYERS) { sock.end('HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\nContent-Length: 0\r\n\r\n'); return; }
+  if (!R) { R = { peers: new Map(), next: 1 }; rooms.set(name, R); }
   const acc = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
   sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + acc + '\r\n\r\n');
-  const name = (u.searchParams.get('sala') || 'sala1').slice(0, 24), wantHost = u.searchParams.get('host') === '1';
-  let R = rooms.get(name); if (!R) { R = { peers: new Map(), next: 1 }; rooms.set(name, R); }
   const id = wantHost && !R.peers.has(0) ? 0 : R.next++; R.peers.set(id, sock);
   const send = (s, o) => { try { s.write(frame(JSON.stringify(o))); } catch (e) { } };
   send(sock, { t: 'id', id }); console.log(`[${name}] entra jugador ${id} (${R.peers.size} en la sala)`);
   let buf = Buffer.alloc(0);
   sock.on('data', d => {
+    if (buf.length + d.length > MAX_WS_BUFFER) { sock.destroy(); return; }
     buf = Buffer.concat([buf, d]);
     while (buf.length >= 2) {
       const op = buf[0] & 15, masked = buf[1] & 128; let len = buf[1] & 127, o = 2;
+      if (!masked) { sock.destroy(); return; } // RFC 6455: los clientes deben enmascarar
       if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); o = 4; } else if (len === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); o = 10; }
-      const mk = masked ? buf.slice(o, o + 4) : null; o += masked ? 4 : 0; if (buf.length < o + len) return;
+      if (!Number.isSafeInteger(len) || len > MAX_WS_MESSAGE) { sock.destroy(); return; }
+      if (buf.length < o + 4) return;
+      const mk = buf.subarray(o, o + 4); o += 4; if (buf.length < o + len) return;
       let pl = buf.slice(o, o + len); if (mk) { pl = Buffer.from(pl); for (let i = 0; i < pl.length; i++) pl[i] ^= mk[i & 3]; } buf = buf.slice(o + len);
       if (op === 8) { sock.end(); return; } if (op === 9) { sock.write(Buffer.from([0x8a, 0])); continue; } if (op !== 1) continue;
       let m; try { m = JSON.parse(pl.toString()); } catch (e) { continue; } m.from = id;
```
