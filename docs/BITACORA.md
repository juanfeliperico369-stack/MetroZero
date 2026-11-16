# Bitácora · El Metro

## v0.1.0 (2026-11-16)
1. Creado el proyecto: un solo HTML offline (~1,5 MB) con fuentes, mapa real del Valle (EnCicla) y red completa (31 líneas, 160 estaciones únicas; `src/data/red.js`).
2. Modos: Conduce (física, ATP, horario, cabina 1ª/3ª persona, cenital, panorámica con relieve real), Despacho y Alimentadores (motor de agujas generado y verificado), Metroplús (semáforos), Metrocable (puzle de giros), La Red (mapa + flota idle).
3. Historia "La última vuelta" (9 capítulos) + misiones del día, racha, 18 logros, noticias con calendario real (aniversario 30/11, Alumbrados, Feria, Semana Santa), temas Revista/Noche/Contraste y modo daltónico (estilo Industry Art).
4. Multijugador sin servidores externos: duelo de mesa (mismo celular), WebRTC por QR en Wi‑Fi local, servidor local `server.mjs` (WebSocket propio), y pestañas (BroadcastChannel).
5. APK Android (WebView + lector QR nativo ZXing offline) con `tools/apk.sh`; firma de desarrollo en `android/keystore/` (ver android/README.md).
6. PWA en GitHub Pages (rama gh-pages): manifest, sw.js con caché por versión, íconos 192/512/maskable, apple-touch 180, OG compartir.png 1200×630, exportar/importar partidas (JSON).
7. Probado: `node tools/test.mjs 100` → selfTest 0 errores (138 tramos, 21 tableros, 30 puzles), 100 partidas simuladas 0 errores, 0 errores de consola.
8. Bot interno (menú → 🤖): valida datos, solubilidad de niveles y juega partidas automáticas.
9. Falta: modo Bluetooth/“Cerca” nativo en el APK, lector QR JS para iPhone/Firefox, giros en los cruces de Metroplús, modo laberinto (transbordos), más alimentadores (Itagüí, Envigado, Sabaneta, Bello), arte/música generados con IA externa.
10. Pendiente de verificar en teléfonos reales: rendimiento 3D en gama baja, WebRTC entre dos Android sin internet, escáner QR del APK.
