# Los métodos del puente JS se llaman por nombre desde JavaScript (window.AndroidBridge.*).
-keepclassmembers class co.metrozero.elmetro.AndroidBridge {
    @android.webkit.JavascriptInterface public *;
}
