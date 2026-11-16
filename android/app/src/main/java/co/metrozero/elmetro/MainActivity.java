package co.metrozero.elmetro;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.PermissionRequest;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import androidx.activity.ComponentActivity;
import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.webkit.WebViewAssetLoader;

import com.journeyapps.barcodescanner.ScanContract;
import com.journeyapps.barcodescanner.ScanOptions;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/** Una sola Activity con un WebView que carga el juego desde assets/www. */
public class MainActivity extends ComponentActivity {
    static final String TAG = "ElMetro";
    static final String HOST = "appassets.androidplatform.net";
    static final String START_URL = "https://" + HOST + "/assets/www/index.html";
    static final int BG = 0xFF0C2533;

    private static final String BACK_JS = "(window.EM&&EM.back)?String(EM.back()):'false'";

    /** Recuerda el nombre (atributo download) y retiene el blob antes de que se revoque. */
    private static final String DOWNLOAD_HOOK_JS = "(function(){if(window.__emDlHook)return;window.__emDlHook=1;"
            + "function rec(a){try{var h=(a&&a.href)||'';if(/^(blob|data):/.test(h)){var d={href:h,name:a.getAttribute('download')||''};"
            + "d.p=fetch(h).then(function(r){return r.blob()});d.p.catch(function(){});window.__emDl=d;}}catch(e){}}"
            + "var c=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){rec(this);return c.apply(this,arguments)};"
            + "addEventListener('click',function(e){for(var t=e.target;t;t=t.parentNode){if(t.tagName==='A'){rec(t);break}}},true);})();";

    private WebView webView;
    private FrameLayout root;
    private WebViewAssetLoader assetLoader;
    private WifiManager.MulticastLock multicastLock;
    private PermissionRequest pendingPermission;
    private ValueCallback<Uri[]> fileCallback;

    private final ActivityResultLauncher<String> cameraPermission =
            registerForActivityResult(new ActivityResultContracts.RequestPermission(), granted -> {
                PermissionRequest req = pendingPermission;
                pendingPermission = null;
                if (req == null) return;
                if (granted) req.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE});
                else req.deny();
            });

    private boolean scanningQr;

    private final ActivityResultLauncher<ScanOptions> qrScanner =
            registerForActivityResult(new ScanContract(), r -> {
                scanningQr = false;
                deliverQr(r.getContents());
            });

    private final ActivityResultLauncher<String> qrCameraPermission =
            registerForActivityResult(new ActivityResultContracts.RequestPermission(), granted -> {
                if (granted) {
                    launchQrScanner();
                } else {
                    scanningQr = false;
                    deliverQr(null);
                }
            });

    private final ActivityResultLauncher<Intent> fileChooser =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), this::onFileChosen);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window window = getWindow();
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams lp = window.getAttributes();
            lp.layoutInDisplayCutoutMode = Build.VERSION.SDK_INT >= 30
                    ? WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS
                    : WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            window.setAttributes(lp);
        }
        WindowCompat.setDecorFitsSystemWindows(window, false);

        if (BuildConfig.DEBUG || BuildConfig.WEBVIEW_DEBUG) WebView.setWebContentsDebuggingEnabled(true);

        assetLoader = new WebViewAssetLoader.Builder()
                .setDomain(HOST)
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        root = new FrameLayout(this);
        root.setBackgroundColor(BG);
        setContentView(root);
        // Barras ocultas: sólo hay que esquivar el notch/recorte y el teclado.
        ViewCompat.setOnApplyWindowInsetsListener(root, (v, insets) -> {
            Insets i = insets.getInsets(WindowInsetsCompat.Type.displayCutout() | WindowInsetsCompat.Type.ime());
            v.setPadding(i.left, i.top, i.right, i.bottom);
            return WindowInsetsCompat.CONSUMED;
        });

        createWebView();
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                onBack();
            }
        });
        hideSystemBars();
        webView.loadUrl(START_URL);
    }

    @SuppressLint("SetJavaScriptEnabled")
    @SuppressWarnings("deprecation") // setDatabaseEnabled: inocuo, por compatibilidad
    private void createWebView() {
        webView = new WebView(this);
        webView.setBackgroundColor(BG);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);
        webView.setKeepScreenOn(true);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setUseWideViewPort(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setSupportMultipleWindows(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.addJavascriptInterface(new AndroidBridge(this), "AndroidBridge");
        webView.setWebViewClient(new Client());
        webView.setWebChromeClient(new Chrome());
        webView.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) -> onDownload(url, mimeType));
        root.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
    }

    // ---------------------------------------------------------------- back

    private void onBack() {
        if (webView == null) {
            finish();
            return;
        }
        webView.evaluateJavascript(BACK_JS, result -> {
            // evaluateJavascript devuelve JSON: un string JS "true" llega como "\"true\"".
            if (!"\"true\"".equals(result) && !"true".equals(result)) finish();
        });
    }

    // ---------------------------------------------------------------- pantalla completa

    private void hideSystemBars() {
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        c.hide(WindowInsetsCompat.Type.systemBars());
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    // ---------------------------------------------------------------- ciclo de vida

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
        acquireMulticastLock();
        hideSystemBars();
    }

    @Override
    protected void onPause() {
        if (webView != null) webView.onPause();
        releaseMulticastLock();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        destroyWebView();
        super.onDestroy();
    }

    private void destroyWebView() {
        if (webView == null) return;
        root.removeView(webView);
        webView.destroy();
        webView = null;
    }

    /** Algunos chips Wi-Fi filtran multicast sin este lock (mDNS de los candidatos ICE de WebRTC). */
    private void acquireMulticastLock() {
        try {
            if (multicastLock == null) {
                WifiManager wm = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
                if (wm == null) return;
                multicastLock = wm.createMulticastLock("elmetro-webrtc");
                multicastLock.setReferenceCounted(false);
            }
            if (!multicastLock.isHeld()) multicastLock.acquire();
        } catch (RuntimeException e) {
            Log.w(TAG, "multicast lock", e);
        }
    }

    private void releaseMulticastLock() {
        try {
            if (multicastLock != null && multicastLock.isHeld()) multicastLock.release();
        } catch (RuntimeException e) {
            Log.w(TAG, "multicast lock", e);
        }
    }

    // ---------------------------------------------------------------- lector QR nativo

    /** AndroidBridge.scanQR() (en el hilo de UI). Responde con window.EMqrResult(texto|null). */
    void startQrScan() {
        if (scanningQr) return;
        scanningQr = true;
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            launchQrScanner();
        } else {
            qrCameraPermission.launch(Manifest.permission.CAMERA);
        }
    }

    private void launchQrScanner() {
        ScanOptions options = new ScanOptions()
                .setDesiredBarcodeFormats(ScanOptions.QR_CODE)
                .setPrompt("Apunta la cámara al código QR")
                .setBeepEnabled(false)
                .setBarcodeImageEnabled(false)
                .setOrientationLocked(true)
                .setCaptureActivity(ScanActivity.class);
        try {
            qrScanner.launch(options);
        } catch (ActivityNotFoundException e) {
            scanningQr = false;
            deliverQr(null);
        }
    }

    private void deliverQr(String text) {
        if (webView == null) return;
        String arg = text == null ? "null"
                : JSONObject.quote(text).replace("\u2028", "\\u2028").replace("\u2029", "\\u2029");
        webView.evaluateJavascript("typeof window.EMqrResult==='function'&&window.EMqrResult(" + arg + ")", null);
    }

    // ---------------------------------------------------------------- descargas blob:/data:

    private void onDownload(String url, String mimeType) {
        if (webView == null || url == null) return;
        if (url.startsWith("blob:") || url.startsWith("data:")) {
            String js = "(function(u,m){var d=window.__emDl,n='',p;"
                    + "if(d&&d.href===u){n=d.name;p=d.p}else{p=fetch(u).then(function(r){return r.blob()})}"
                    + "p.then(function(b){return new Promise(function(res,rej){var f=new FileReader();"
                    + "f.onload=function(){res([b.type,String(f.result)])};f.onerror=rej;f.readAsDataURL(b)})})"
                    + ".then(function(x){var s=x[1];AndroidBridge.saveBase64(n,m||x[0],s.slice(s.indexOf(',')+1))})"
                    + ".catch(function(){AndroidBridge.saveBase64(n,m,null)});})("
                    + JSONObject.quote(url) + "," + JSONObject.quote(mimeType == null ? "" : mimeType) + ");";
            webView.evaluateJavascript(js, null);
        } else {
            openExternal(Uri.parse(url));
        }
    }

    private void openExternal(Uri uri) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (ActivityNotFoundException e) {
            Log.w(TAG, "No activity for " + uri);
        }
    }

    // ---------------------------------------------------------------- selector de archivos (<input type=file>)

    private void onFileChosen(ActivityResult result) {
        ValueCallback<Uri[]> cb = fileCallback;
        fileCallback = null;
        if (cb == null) return;
        Intent data = result.getData();
        List<Uri> uris = new ArrayList<>();
        if (result.getResultCode() == RESULT_OK && data != null) {
            ClipData clip = data.getClipData();
            if (clip != null) {
                for (int i = 0; i < clip.getItemCount(); i++) uris.add(clip.getItemAt(i).getUri());
            } else if (data.getData() != null) {
                uris.add(data.getData());
            }
        }
        cb.onReceiveValue(uris.isEmpty() ? null : uris.toArray(new Uri[0]));
    }

    // ---------------------------------------------------------------- clientes del WebView

    private final class Client extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            return assetLoader.shouldInterceptRequest(request.getUrl());
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            if (HOST.equals(uri.getHost())) return false;
            String scheme = uri.getScheme();
            if ("blob".equals(scheme) || "data".equals(scheme) || "about".equals(scheme)) return false;
            openExternal(uri); // enlaces externos: navegador / app correspondiente
            return true;
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            view.evaluateJavascript(DOWNLOAD_HOOK_JS, null);
        }

        @Override
        public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
            // El proceso del renderer murió (p. ej. falta de memoria): recrear en vez de cerrar la app.
            Log.e(TAG, "WebView renderer gone; recreating");
            if (view == webView) {
                destroyWebView();
                recreate();
            }
            return true;
        }
    }

    private final class Chrome extends WebChromeClient {
        @Override
        public void onPermissionRequest(PermissionRequest request) {
            runOnUiThread(() -> {
                boolean wantsCamera = Arrays.asList(request.getResources()).contains(PermissionRequest.RESOURCE_VIDEO_CAPTURE);
                if (!wantsCamera || !HOST.equals(request.getOrigin().getHost())) {
                    request.deny();
                    return;
                }
                if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.CAMERA)
                        == PackageManager.PERMISSION_GRANTED) {
                    request.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE});
                } else {
                    if (pendingPermission != null) pendingPermission.deny();
                    pendingPermission = request;
                    cameraPermission.launch(Manifest.permission.CAMERA);
                }
            });
        }

        @Override
        public void onPermissionRequestCanceled(PermissionRequest request) {
            if (pendingPermission == request) pendingPermission = null;
        }

        @Override
        public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
            if (fileCallback != null) fileCallback.onReceiveValue(null);
            fileCallback = callback;
            Intent intent = new Intent(Intent.ACTION_GET_CONTENT)
                    .addCategory(Intent.CATEGORY_OPENABLE)
                    .setType("*/*")
                    .putExtra(Intent.EXTRA_ALLOW_MULTIPLE, params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE);
            try {
                fileChooser.launch(intent);
            } catch (ActivityNotFoundException e) {
                fileCallback = null;
                callback.onReceiveValue(null);
            }
            return true;
        }

        @Override
        public Bitmap getDefaultVideoPoster() {
            // Evita el póster gris con "play" en <video> (vista previa de la cámara).
            return Bitmap.createBitmap(1, 1, Bitmap.Config.ARGB_8888);
        }

        @Override
        public boolean onConsoleMessage(ConsoleMessage m) {
            Log.d(TAG, m.message() + " (" + m.sourceId() + ":" + m.lineNumber() + ")");
            return true;
        }
    }
}
