# El Metro — APK Android

Envoltorio mínimo (Java, una sola `Activity` con `WebView`, sin Capacitor/Cordova) que
mete el juego ya construido (`dist/`) dentro del APK y lo sirve **sin conexión** desde
`https://appassets.androidplatform.net/assets/www/index.html` (contexto seguro:
localStorage, IndexedDB, `fetch`, WebRTC y cámara funcionan).

## Construir

```bash
tools/apk.sh                     # -> dist/el-metro.apk (release firmado)
tools/apk.sh -Pelmetro.versionName=0.2.0 -Pelmetro.versionCode=2   # args extra van a Gradle
```

El script (idempotente, no interactivo):

1. Instala, si faltan, las *command-line tools* del SDK en `$ANDROID_HOME`
   (por defecto `/opt/android-sdk`), acepta las licencias e instala
   `platforms;android-36`, `build-tools;35.0.0` y `platform-tools`.
2. Ejecuta Gradle (`$GRADLE`, o un Gradle 8.13+ instalado, o `android/gradlew`), que:
   - sincroniza `dist/` → `assets/www/` (excepto `*.apk`);
   - regenera los iconos (adaptativo + clásicos) desde `dist/icon-maskable-512.png`
     y `dist/icon-512.png` (si no existen, dibuja uno provisional);
   - compila y firma `assembleRelease` (R8 activado; `-Pelmetro.minify=false` lo desactiva).
3. Copia el resultado a `dist/el-metro.apk` y lo verifica con `apksigner`.

Requisitos: JDK 17+, `curl`, `unzip`. El proxy se toma de `JAVA_TOOL_OPTIONS` o de `HTTPS_PROXY`.

Instalar: `adb install -r dist/el-metro.apk`, o copiar el APK al móvil y abrirlo
(permitir «instalar apps desconocidas»). Android 7.0+ (API 24).

**CI:** `.github/workflows/apk.yml` (manual o al empujar un tag `v*`) hace lo mismo,
sube el APK como artefacto y, en tags, lo adjunta a la release
(`…/releases/latest/download/el-metro.apk`).

## Versiones

En `android/gradle.properties`:

```properties
elmetro.versionName=0.1.0   # lo que ve el usuario / AndroidBridge.version()
elmetro.versionCode=1       # entero; SUBIRLO en cada APK que se instale encima de otro
```

En un tag `vX.Y.Z` la CI usa `X.Y.Z` como versionName (el versionCode sale del archivo).

## Firma (clave de DESARROLLO)

`android/keystore/elmetro-dev.jks` — alias `elmetro`, contraseña (almacén y clave)
**`elmetro-dev`**. Es una clave **de desarrollo para instalar a mano (sideload), NO para
Google Play**: está en el repo, así que cualquiera puede firmar un APK que se haga pasar
por éste. Si algún día se cambia de clave, Android no deja actualizar: hay que desinstalar
(y se pierden las partidas guardadas). Para usar otra clave sin tocar el código:
`-Pelmetro.keystore=… -Pelmetro.storePassword=… -Pelmetro.keyAlias=… -Pelmetro.keyPassword=…`
(o variables `ELMETRO_KEYSTORE`, `ELMETRO_STORE_PASSWORD`, `ELMETRO_KEY_ALIAS`, `ELMETRO_KEY_PASSWORD`).

## Para el juego (API JS)

Detectar el APK: `if (window.AndroidBridge) { … }`

| Método | Qué hace |
|---|---|
| `AndroidBridge.saveFile(name, mime, text)` → `boolean` | Guarda texto UTF-8 en **Descargas** (MediaStore en Android 10+; en 7–9 en `Android/data/co.metrozero.elmetro/files/Download`). Muestra «Guardado en Descargas: name». Si existe, Android añade ` (1)`. El MIME real se deduce de la extensión del nombre. |
| `AndroidBridge.saveBase64(name, mime, base64)` → `boolean` | Igual, para binarios (base64 sin el prefijo `data:…,`). |
| `AndroidBridge.share(text)` | Hoja «Compartir» de Android (texto plano). |
| `AndroidBridge.vibrate(ms)` | Vibra `ms` ms (máx. 5000; `0` cancela). `navigator.vibrate` no funciona en WebView. |
| `AndroidBridge.scanQR()` | Abre el lector QR **nativo** (ZXing, offline, sin Play Services) a pantalla completa; pide CAMERA si falta. Responde llamando `window.EMqrResult(texto)` o `window.EMqrResult(null)` si se cancela/falla. `QR.startScan()` ya lo usa cuando no hay `BarcodeDetector` (WebView no lo tiene). |
| `AndroidBridge.version()` → `string` | versionName del APK. |

Los métodos son **síncronos** y se llaman desde el hilo de JS.

- **Botón atrás:** la app ejecuta `(window.EM&&EM.back)?String(EM.back()):'false'`.
  Si `EM.back()` devuelve `true`, el juego lo gestionó (cerrar menú, etc.); si no, se cierra la app.
- **Descargas** con `<a download href="blob:…|data:…">` también funcionan (respaldo), pero
  es mejor usar `saveFile`.
- **`<input type="file">`** abre el selector de archivos de Android (para importar partidas).
- **Cámara:** `getUserMedia({video:…})` pide el permiso CAMERA la primera vez. Sólo vídeo (sin micrófono).
- **WebRTC:** `RTCPeerConnection`/data channels en la Wi-Fi local; la app mantiene un
  *multicast lock* mientras está en primer plano (mDNS de candidatos ICE).
- **Service worker:** no se usa en el APK (los archivos ya están dentro); no registrarlo
  si `window.AndroidBridge` existe (o ignorar el error).
- **Pantalla:** inmersiva (barras ocultas), sin zoom, `textZoom` 100 %, ambas orientaciones,
  pantalla siempre encendida. El notch y el teclado se compensan con *padding* nativo,
  así que `env(safe-area-inset-*)` vale 0. Fondo `#0c2533` mientras carga.
- **Enlaces externos** (`http(s)` a otros dominios) se abren en el navegador.
- **Datos guardados** (localStorage/IndexedDB) dependen del origen
  `https://appassets.androidplatform.net`: no cambiarlo o se pierden las partidas.
- **Depurar:** builds `debug` (o `-Pelmetro.webviewDebug=true`) permiten `chrome://inspect`.
  Logs de consola en `adb logcat -s ElMetro`.

## Estructura

```
android/
  settings.gradle.kts, gradle.properties, gradlew (+ gradle/wrapper)
  keystore/elmetro-dev.jks
  app/build.gradle.kts            # config + tareas syncXxxWebAssets / generateXxxLauncherIcons
  app/src/main/AndroidManifest.xml
  app/src/main/java/co/metrozero/elmetro/{MainActivity,AndroidBridge,ScanActivity}.java
```
