package co.metrozero.elmetro;

import android.content.ActivityNotFoundException;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.provider.MediaStore;
import android.util.Base64;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.MimeTypeMap;
import android.widget.Toast;

import androidx.annotation.RequiresApi;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Puente JS expuesto como window.AndroidBridge. Los métodos se ejecutan en un hilo
 * del WebView (no el de UI): todo lo visual se envía con runOnUiThread.
 */
final class AndroidBridge {
    private final MainActivity activity;

    AndroidBridge(MainActivity activity) {
        this.activity = activity;
    }

    /** Guarda texto (UTF-8) en Descargas. Devuelve true si se guardó. */
    @JavascriptInterface
    public boolean saveFile(String name, String mime, String text) {
        byte[] data = (text == null ? "" : text).getBytes(StandardCharsets.UTF_8);
        return save(name, mime, data);
    }

    /** Igual que saveFile pero con contenido binario en base64 (sin prefijo "data:"). */
    @JavascriptInterface
    public boolean saveBase64(String name, String mime, String base64) {
        if (base64 == null) {
            toast("No se pudo guardar el archivo");
            return false;
        }
        try {
            return save(name, mime, Base64.decode(base64, Base64.DEFAULT));
        } catch (IllegalArgumentException e) {
            toast("No se pudo guardar el archivo");
            return false;
        }
    }

    /** Abre el selector de "Compartir" de Android con un texto. */
    @JavascriptInterface
    public void share(String text) {
        activity.runOnUiThread(() -> {
            Intent send = new Intent(Intent.ACTION_SEND)
                    .setType("text/plain")
                    .putExtra(Intent.EXTRA_TEXT, text == null ? "" : text);
            try {
                activity.startActivity(Intent.createChooser(send, null));
            } catch (ActivityNotFoundException e) {
                Toast.makeText(activity, "No hay apps para compartir", Toast.LENGTH_SHORT).show();
            }
        });
    }

    /** Vibra ms milisegundos (máx. 5000; 0 cancela). */
    @JavascriptInterface
    @SuppressWarnings("deprecation") // Vibrator.vibrate(long) para API < 26
    public void vibrate(int ms) {
        Vibrator v;
        if (Build.VERSION.SDK_INT >= 31) {
            VibratorManager vm = activity.getSystemService(VibratorManager.class);
            v = vm == null ? null : vm.getDefaultVibrator();
        } else {
            v = (Vibrator) activity.getSystemService(Context.VIBRATOR_SERVICE);
        }
        if (v == null || !v.hasVibrator()) return;
        if (ms <= 0) {
            v.cancel();
            return;
        }
        long dur = Math.min(ms, 5000);
        if (Build.VERSION.SDK_INT >= 26) {
            v.vibrate(VibrationEffect.createOneShot(dur, VibrationEffect.DEFAULT_AMPLITUDE));
        } else {
            v.vibrate(dur);
        }
    }

    /** Abre el lector QR nativo; el resultado llega con window.EMqrResult(texto) o EMqrResult(null). */
    @JavascriptInterface
    public void scanQR() {
        activity.runOnUiThread(activity::startQrScan);
    }

    /** versionName del APK (p. ej. "0.1.0"). */
    @JavascriptInterface
    public String version() {
        return BuildConfig.VERSION_NAME;
    }

    // ------------------------------------------------------------------------

    private synchronized boolean save(String rawName, String rawMime, byte[] data) {
        String mime = rawMime == null || rawMime.trim().isEmpty() ? "application/octet-stream" : rawMime.trim();
        String name = cleanName(rawName, mime);
        // MediaStore cambia la extensión si no cuadra con el MIME: lo deducimos del nombre.
        String ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        String byExt = MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext);
        String effectiveMime = byExt != null ? byExt : "application/octet-stream";
        try {
            String saved = Build.VERSION.SDK_INT >= 29
                    ? saveToMediaStore(name, effectiveMime, data)
                    : saveToAppDownloads(name, data);
            toast("Guardado en Descargas: " + saved);
            return true;
        } catch (IOException | RuntimeException e) {
            Log.e(MainActivity.TAG, "saveFile " + name, e);
            toast("No se pudo guardar: " + name);
            return false;
        }
    }

    @RequiresApi(29)
    private String saveToMediaStore(String name, String mime, byte[] data) throws IOException {
        ContentResolver cr = activity.getContentResolver();
        ContentValues values = new ContentValues();
        values.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
        values.put(MediaStore.MediaColumns.MIME_TYPE, mime);
        values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
        values.put(MediaStore.MediaColumns.IS_PENDING, 1);
        Uri uri = cr.insert(MediaStore.Downloads.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY), values);
        if (uri == null) throw new IOException("MediaStore insert failed");
        try (OutputStream os = cr.openOutputStream(uri)) {
            if (os == null) throw new IOException("openOutputStream failed");
            os.write(data);
        } catch (IOException | RuntimeException e) {
            cr.delete(uri, null, null);
            throw e;
        }
        values.clear();
        values.put(MediaStore.MediaColumns.IS_PENDING, 0);
        cr.update(uri, values, null, null);
        // Si ya existía, MediaStore lo renombra ("partida (1).json").
        try (Cursor c = cr.query(uri, new String[]{MediaStore.MediaColumns.DISPLAY_NAME}, null, null, null)) {
            if (c != null && c.moveToFirst() && c.getString(0) != null) return c.getString(0);
        }
        return name;
    }

    /** Android 7-9: carpeta Download propia de la app (Android/data/co.metrozero.elmetro/files/Download). */
    private String saveToAppDownloads(String name, byte[] data) throws IOException {
        File dir = activity.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
        if (dir == null) dir = new File(activity.getFilesDir(), Environment.DIRECTORY_DOWNLOADS);
        if (!dir.isDirectory() && !dir.mkdirs()) throw new IOException("mkdirs " + dir);
        File f = new File(dir, name);
        int dot = name.lastIndexOf('.');
        String base = dot > 0 ? name.substring(0, dot) : name;
        String ext = dot > 0 ? name.substring(dot) : "";
        for (int i = 1; f.exists(); i++) f = new File(dir, base + " (" + i + ")" + ext);
        try (FileOutputStream os = new FileOutputStream(f)) {
            os.write(data);
        }
        return f.getName();
    }

    private static String cleanName(String raw, String mime) {
        String name = raw == null ? "" : raw.replaceAll("[\\\\/:*?\"<>|\\p{Cntrl}]", "_").trim();
        while (name.startsWith(".")) name = name.substring(1);
        if (name.isEmpty()) {
            name = "el-metro-" + new SimpleDateFormat("yyyyMMdd-HHmmss", Locale.ROOT).format(new Date());
        }
        if (name.lastIndexOf('.') <= 0) {
            String ext = MimeTypeMap.getSingleton().getExtensionFromMimeType(mime);
            if (ext == null && mime.startsWith("text/")) ext = "txt";
            if (ext != null) name = name + "." + ext;
        }
        if (name.length() > 120) {
            int dot = name.lastIndexOf('.');
            String ext = dot > 0 && name.length() - dot <= 10 ? name.substring(dot) : "";
            name = name.substring(0, 120 - ext.length()) + ext;
        }
        return name;
    }

    private void toast(String msg) {
        activity.runOnUiThread(() -> Toast.makeText(activity, msg, Toast.LENGTH_SHORT).show());
    }
}
