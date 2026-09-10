# APK bajo prueba

El binario **no se versiona** (ver `.gitignore`). Descárgalo desde las *releases*
oficiales de la aplicación:

<https://github.com/saucelabs/my-demo-app-android/releases>

Coloca el `.apk` en esta carpeta y, si el nombre difiere del valor por defecto,
apunta a él con la variable de entorno:

```bash
APP_PATH=$PWD/apps/mda-2.2.0-25.apk npm test
```

En el workflow `nightly.yml` la descarga es automática: se toma el APK de la última
release publicada.
