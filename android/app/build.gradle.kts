import java.awt.AlphaComposite
import java.awt.BasicStroke
import java.awt.Color
import java.awt.Graphics2D
import java.awt.Shape
import java.awt.Polygon
import java.awt.RenderingHints
import java.awt.geom.AffineTransform
import java.awt.geom.Ellipse2D
import java.awt.geom.RoundRectangle2D
import java.awt.image.BufferedImage
import javax.imageio.ImageIO
import javax.inject.Inject

plugins {
    id("com.android.application")
}

fun prop(name: String, default: String): String = providers.gradleProperty(name).orNull ?: default

/** Gradle property -> variable de entorno -> valor por defecto. */
fun setting(name: String, env: String, default: String): String =
    providers.gradleProperty(name).orNull ?: providers.environmentVariable(env).orNull ?: default

// Juego web ya construido (index.html, manifest, iconos...). Por defecto ../../dist.
val distDir: Directory = rootProject.layout.projectDirectory.dir(prop("elmetro.distDir", "../dist"))
val webExcludes = listOf("**/*.apk", "**/*.apk.idsig", "**/.DS_Store", "**/Thumbs.db")

android {
    namespace = "co.metrozero.elmetro"
    compileSdk = prop("elmetro.compileSdk", "36").toInt()
    buildToolsVersion = prop("elmetro.buildTools", "35.0.0")

    defaultConfig {
        applicationId = "co.metrozero.elmetro"
        minSdk = 24
        targetSdk = prop("elmetro.targetSdk", "36").toInt()
        versionCode = prop("elmetro.versionCode", "1").toInt()
        versionName = prop("elmetro.versionName", "0.1.0")
        buildConfigField("boolean", "WEBVIEW_DEBUG", prop("elmetro.webviewDebug", "false").toBoolean().toString())
    }

    signingConfigs {
        create("release") {
            // Clave de DESARROLLO incluida en el repo (ver android/README.md).
            // Para usar otra: -Pelmetro.keystore=... o ELMETRO_KEYSTORE, etc.
            val storePass = setting("elmetro.storePassword", "ELMETRO_STORE_PASSWORD", "elmetro-dev")
            storeFile = rootProject.file(setting("elmetro.keystore", "ELMETRO_KEYSTORE", "keystore/elmetro-dev.jks"))
            storePassword = storePass
            keyAlias = setting("elmetro.keyAlias", "ELMETRO_KEY_ALIAS", "elmetro")
            keyPassword = setting("elmetro.keyPassword", "ELMETRO_KEY_PASSWORD", storePass)
        }
    }

    buildTypes {
        release {
            // R8 reduce el APK de ~2 MB a ~0.3 MB. Desactívalo con -Pelmetro.minify=false si sospechas de él.
            isMinifyEnabled = prop("elmetro.minify", "true").toBoolean()
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            signingConfig = signingConfigs.getByName("release")
        }
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        buildConfig = true
    }
}

dependencies {
    implementation("androidx.activity:activity:1.13.0")
    implementation("androidx.webkit:webkit:1.18.0")
    // Lector QR nativo offline (ZXing + cámara clásica; sin Play Services). Sólo depende de zxing:core.
    implementation("com.journeyapps:zxing-android-embedded:4.3.0")
}

// Copia dist/ -> assets/www/ y genera los iconos del lanzador en cada build.
androidComponents {
    onVariants { variant ->
        val cap = variant.name.replaceFirstChar { it.uppercase() }

        val sync = tasks.register<SyncWebAssets>("sync${cap}WebAssets") {
            distDirectory.set(distDir)
            excludePatterns.set(webExcludes)
            webFiles.from(fileTree(distDir) { exclude(webExcludes) })
        }
        variant.sources.assets?.addGeneratedSourceDirectory(sync, SyncWebAssets::outputDir)

        val icons = tasks.register<GenerateLauncherIcons>("generate${cap}LauncherIcons") {
            anyIcon.from(distDir.file("icon-512.png"))
            maskableIcon.from(distDir.file("icon-maskable-512.png"))
            fallbackColor.set("#0c2533")
        }
        variant.sources.res?.addGeneratedSourceDirectory(icons, GenerateLauncherIcons::outputDir)
    }
}

/** Sincroniza el juego web construido (dist/) en assets/www del APK. */
abstract class SyncWebAssets : DefaultTask() {
    @get:InputFiles
    @get:PathSensitive(PathSensitivity.RELATIVE)
    abstract val webFiles: ConfigurableFileCollection

    @get:Internal
    abstract val distDirectory: DirectoryProperty

    @get:Input
    abstract val excludePatterns: ListProperty<String>

    @get:OutputDirectory
    abstract val outputDir: DirectoryProperty

    @get:Inject
    abstract val fs: FileSystemOperations

    @TaskAction
    fun run() {
        val dist = distDirectory.get().asFile
        if (!dist.resolve("index.html").isFile) {
            throw GradleException(
                "Falta ${dist.resolve("index.html")} — construye primero el juego (dist/) " +
                    "o indica otra carpeta con -Pelmetro.distDir=..."
            )
        }
        fs.sync {
            val patterns = excludePatterns.get()
            from(dist) { exclude(patterns) }
            into(outputDir.dir("www"))
        }
    }
}

/**
 * Genera icono adaptativo (API 26+) e iconos clásicos (API 24-25) a partir de
 * dist/icon-maskable-512.png y dist/icon-512.png. Sin iconos, dibuja uno provisional.
 */
abstract class GenerateLauncherIcons : DefaultTask() {
    @get:InputFiles
    @get:PathSensitive(PathSensitivity.NAME_ONLY)
    abstract val anyIcon: ConfigurableFileCollection

    @get:InputFiles
    @get:PathSensitive(PathSensitivity.NAME_ONLY)
    abstract val maskableIcon: ConfigurableFileCollection

    @get:Input
    abstract val fallbackColor: Property<String>

    @get:OutputDirectory
    abstract val outputDir: DirectoryProperty

    private val densities = listOf("mdpi" to 1.0, "hdpi" to 1.5, "xhdpi" to 2.0, "xxhdpi" to 3.0, "xxxhdpi" to 4.0)

    @TaskAction
    fun generate() {
        val out = outputDir.get().asFile
        out.deleteRecursively()
        val fallback = Color.decode(fallbackColor.get())
        val any = anyIcon.files.firstOrNull { it.isFile }?.let { ImageIO.read(it) }?.let(::argb)
        val maskable = maskableIcon.files.firstOrNull { it.isFile }?.let { ImageIO.read(it) }?.let(::argb)
        if (any == null && maskable == null) logger.quiet("El Metro: sin iconos en dist/, se usa un icono provisional")

        // Fuente "maskable": imagen a sangre completa con el motivo dentro del círculo central del 80%.
        val maskSrc = maskable ?: any?.let { padOnSquare(it, cornerColor(it) ?: fallback, 0.62) } ?: placeholder(512, fallback)
        val anySrc = any ?: clip(maskSrc, RoundRectangle2D.Double(0.0, 0.0, 1.0, 1.0, 0.36, 0.36))
        val bg = cornerColor(maskSrc) ?: fallback

        for ((dpi, f) in densities) {
            val dir = out.resolve("mipmap-$dpi").apply { mkdirs() }
            val legacy = (48 * f).toInt()
            ImageIO.write(scale(anySrc, legacy), "png", dir.resolve("ic_launcher.png"))
            ImageIO.write(clip(scale(maskSrc, legacy), Ellipse2D.Double(0.0, 0.0, 1.0, 1.0)), "png", dir.resolve("ic_launcher_round.png"))
            // Capa frontal 108dp: el área segura del maskable (80%) coincide con la zona segura de 66dp.
            val layer = (108 * f).toInt()
            val inner = Math.round(82.5 * f).toInt()
            val fg = BufferedImage(layer, layer, BufferedImage.TYPE_INT_ARGB)
            fg.createGraphics().apply {
                hints()
                drawImage(scale(maskSrc, inner), (layer - inner) / 2, (layer - inner) / 2, null)
                dispose()
            }
            ImageIO.write(fg, "png", dir.resolve("ic_launcher_foreground.png"))
        }
        val adaptive = """<?xml version="1.0" encoding="utf-8"?>
            |<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
            |    <background android:drawable="@color/ic_launcher_background" />
            |    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
            |</adaptive-icon>
            |""".trimMargin()
        out.resolve("mipmap-anydpi-v26").apply { mkdirs() }.let {
            it.resolve("ic_launcher.xml").writeText(adaptive)
            it.resolve("ic_launcher_round.xml").writeText(adaptive)
        }
        out.resolve("values").apply { mkdirs() }.resolve("ic_launcher_background.xml").writeText(
            """<?xml version="1.0" encoding="utf-8"?>
            |<resources>
            |    <color name="ic_launcher_background">#%06X</color>
            |</resources>
            |""".trimMargin().format(bg.rgb and 0xFFFFFF)
        )
    }

    private fun Graphics2D.hints() {
        setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC)
        setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY)
        setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON)
    }

    private fun argb(src: BufferedImage): BufferedImage {
        val img = BufferedImage(src.width, src.height, BufferedImage.TYPE_INT_ARGB)
        img.createGraphics().apply { drawImage(src, 0, 0, null); dispose() }
        return img
    }

    /** Escalado por mitades (buena calidad al reducir) hasta el tamaño final. */
    private fun scale(src: BufferedImage, size: Int): BufferedImage {
        var img = src
        var w = src.width
        var h = src.height
        do {
            w = if (w / 2 >= size) w / 2 else size
            h = if (h / 2 >= size) h / 2 else size
            val next = BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB)
            next.createGraphics().apply { hints(); drawImage(img, 0, 0, w, h, null); dispose() }
            img = next
        } while (w != size || h != size)
        return img
    }

    /** Recorta con una forma expresada en coordenadas unitarias (0..1). */
    private fun clip(src: BufferedImage, unitShape: Shape): BufferedImage {
        val s = src.width.toDouble()
        val mask = BufferedImage(src.width, src.height, BufferedImage.TYPE_INT_ARGB)
        mask.createGraphics().apply {
            hints()
            color = Color.WHITE
            fill(AffineTransform.getScaleInstance(s, src.height.toDouble()).createTransformedShape(unitShape))
            composite = AlphaComposite.SrcIn
            drawImage(src, 0, 0, null)
            dispose()
        }
        return mask
    }

    private fun cornerColor(img: BufferedImage): Color? {
        val p = img.getRGB(img.width / 64, img.height / 64)
        return if ((p ushr 24) >= 200) Color(p and 0xFFFFFF) else null
    }

    private fun padOnSquare(src: BufferedImage, bg: Color, ratio: Double): BufferedImage {
        val size = 512
        val inner = (size * ratio).toInt()
        val img = BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB)
        img.createGraphics().apply {
            hints()
            color = bg
            fillRect(0, 0, size, size)
            drawImage(scale(src, inner), (size - inner) / 2, (size - inner) / 2, null)
            dispose()
        }
        return img
    }

    /** Icono provisional (sin fuentes tipográficas): círculo y una "M". */
    private fun placeholder(size: Int, bg: Color): BufferedImage {
        val img = BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB)
        img.createGraphics().apply {
            hints()
            color = bg
            fillRect(0, 0, size, size)
            color = Color(0xF2B134)
            stroke = BasicStroke(size * 0.045f)
            val r = size * 0.36
            draw(Ellipse2D.Double(size / 2 - r, size / 2 - r, 2 * r, 2 * r))
            color = Color.WHITE
            val pts = listOf(
                0.32 to 0.67, 0.32 to 0.33, 0.40 to 0.33, 0.50 to 0.47, 0.60 to 0.33, 0.68 to 0.33,
                0.68 to 0.67, 0.60 to 0.67, 0.60 to 0.46, 0.50 to 0.60, 0.40 to 0.46, 0.40 to 0.67,
            )
            fill(Polygon(pts.map { (it.first * size).toInt() }.toIntArray(), pts.map { (it.second * size).toInt() }.toIntArray(), pts.size))
            dispose()
        }
        return img
    }
}
