#!/usr/bin/env bash
# Construye el APK Android de "El Metro" a partir de dist/ y lo copia a dist/el-metro.apk.
#
#   tools/apk.sh                                  # build release firmado (clave DEV)
#   tools/apk.sh -Pelmetro.versionName=0.2.0 -Pelmetro.versionCode=2
#
# Instala (si faltan) las command-line tools del SDK de Android, la plataforma y las
# build-tools en $ANDROID_HOME (por defecto /opt/android-sdk), acepta las licencias,
# sincroniza dist/ -> assets/www, regenera los iconos y compila con Gradle.
# Idempotente y no interactivo. Los argumentos extra se pasan a Gradle.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$ROOT/android"
DIST="$ROOT/dist"
OUT_APK="$DIST/el-metro.apk"
CMDLINE_TOOLS_BUILD="${CMDLINE_TOOLS_BUILD:-13114758}" # cmdline-tools 19.0

log() { printf '\033[1;36m[apk]\033[0m %s\n' "$*" >&2; }
die() { printf '\033[1;31m[apk] ERROR:\033[0m %s\n' "$*" >&2; exit 1; }

gprop() { # lee una propiedad de android/gradle.properties
  sed -n "s/^$1=//p" "$ANDROID_DIR/gradle.properties" | tail -n1 | tr -d '[:space:]'
}

[ -f "$DIST/index.html" ] || die "Falta $DIST/index.html: construye primero el juego."
command -v java >/dev/null || die "Se necesita Java 17+ (JDK) en el PATH."

# --- Proxy: si HTTPS_PROXY está definido pero la JVM no lo conoce, pasárselo. ------------
SDK_PROXY_ARGS=()
if [ -n "${HTTPS_PROXY:-${https_proxy:-}}" ]; then
  p="${HTTPS_PROXY:-$https_proxy}"; p="${p#*://}"; p="${p#*@}"; p="${p%%/*}"
  PROXY_HOST="${p%:*}"; PROXY_PORT="${p##*:}"
  [ "$PROXY_PORT" = "$p" ] && PROXY_PORT=443
  SDK_PROXY_ARGS=(--proxy=http "--proxy_host=$PROXY_HOST" "--proxy_port=$PROXY_PORT")
  if [[ "${JAVA_TOOL_OPTIONS:-} ${GRADLE_OPTS:-}" != *https.proxyHost* ]]; then
    export GRADLE_OPTS="${GRADLE_OPTS:-} -Dhttps.proxyHost=$PROXY_HOST -Dhttps.proxyPort=$PROXY_PORT"
  fi
fi

# --- Android SDK -----------------------------------------------------------------------
export ANDROID_HOME="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-/opt/android-sdk}}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
COMPILE_SDK="$(gprop elmetro.compileSdk)"; COMPILE_SDK="${COMPILE_SDK:-36}"
BUILD_TOOLS="$(gprop elmetro.buildTools)"; BUILD_TOOLS="${BUILD_TOOLS:-35.0.0}"

SDKMANAGER="$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager"
if [ ! -x "$SDKMANAGER" ]; then
  case "$(uname -s)" in
    Linux) os=linux ;; Darwin) os=mac ;; *) die "SO no soportado: $(uname -s)" ;;
  esac
  url="https://dl.google.com/android/repository/commandlinetools-${os}-${CMDLINE_TOOLS_BUILD}_latest.zip"
  log "Instalando Android command-line tools en $ANDROID_HOME"
  mkdir -p "$ANDROID_HOME" || die "No se puede crear $ANDROID_HOME (¿permisos?)"
  tmp="$(mktemp -d)"
  curl -fsSL --retry 3 -o "$tmp/cmdline-tools.zip" "$url"
  unzip -q "$tmp/cmdline-tools.zip" -d "$tmp"
  rm -rf "$ANDROID_HOME/cmdline-tools/latest"
  mkdir -p "$ANDROID_HOME/cmdline-tools"
  mv "$tmp/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
  rm -rf "$tmp"
fi

sdk() { "$SDKMANAGER" --sdk_root="$ANDROID_HOME" ${SDK_PROXY_ARGS[@]+"${SDK_PROXY_ARGS[@]}"} "$@"; }
need=()
[ -f "$ANDROID_HOME/platforms/android-$COMPILE_SDK/android.jar" ] || need+=("platforms;android-$COMPILE_SDK")
[ -x "$ANDROID_HOME/build-tools/$BUILD_TOOLS/apksigner" ] || need+=("build-tools;$BUILD_TOOLS")
[ -d "$ANDROID_HOME/platform-tools" ] || need+=("platform-tools") # AGP la exige
if [ ${#need[@]} -gt 0 ]; then
  log "Aceptando licencias e instalando: ${need[*]}"
  { yes 2>/dev/null || true; } | sdk --licenses >/dev/null
  sdk --install "${need[@]}" >/dev/null
fi
[ -f "$ANDROID_HOME/platforms/android-$COMPILE_SDK/android.jar" ] || die "No se instaló platforms;android-$COMPILE_SDK"
BT="$ANDROID_HOME/build-tools/$BUILD_TOOLS"

# local.properties sólo si no existe (Android Studio la crea/gestiona).
[ -f "$ANDROID_DIR/local.properties" ] || printf 'sdk.dir=%s\n' "$ANDROID_HOME" > "$ANDROID_DIR/local.properties"

# --- Gradle ----------------------------------------------------------------------------
# $GRADLE > gradle 8.13+/8.x ya instalado (evita descargas) > wrapper (descarga 8.14.3).
gradle_ok() { "$1" --version 2>/dev/null | grep -Eq '^Gradle 8\.(1[3-9]|[2-9][0-9])'; }
if [ -n "${GRADLE:-}" ]; then
  GRADLE_CMD="$GRADLE"
elif command -v gradle >/dev/null && gradle_ok gradle; then
  GRADLE_CMD=gradle
elif [ -x /opt/gradle/bin/gradle ] && gradle_ok /opt/gradle/bin/gradle; then
  GRADLE_CMD=/opt/gradle/bin/gradle
else
  GRADLE_CMD="$ANDROID_DIR/gradlew"
fi
log "Gradle: $GRADLE_CMD — sincronizando dist/ -> assets/www, iconos y assembleRelease"
"$GRADLE_CMD" -p "$ANDROID_DIR" --console=plain -q :app:assembleRelease "$@"

APK="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
[ -f "$APK" ] || die "No se generó $APK"
cp -f "$APK" "$OUT_APK"

# --- Verificación ----------------------------------------------------------------------
"$BT/apksigner" verify "$OUT_APK" || die "Firma del APK inválida"
badging="$("$BT/aapt2" dump badging "$OUT_APK" 2>/dev/null | head -n1 || true)"
size="$(du -h "$OUT_APK" | cut -f1)"
log "OK: $OUT_APK ($size)"
[ -n "$badging" ] && log "$badging"
exit 0
