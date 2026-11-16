pluginManagement {
    repositories {
        google()
        mavenCentral()
    }
    plugins {
        // AGP 8.13.x es la última línea compatible con Gradle 8.14 (wrapper).
        id("com.android.application") version "8.13.2"
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "ElMetro"
include(":app")
