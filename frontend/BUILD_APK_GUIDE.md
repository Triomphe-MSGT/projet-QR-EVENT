# Guide pour générer l'APK avec Capacitor

Ce guide vous explique comment générer un fichier APK pour votre application QR Event.

## ✅ Étapes déjà complétées

1. ✅ Installation de Capacitor et du plugin Android
2. ✅ Configuration de Capacitor (`capacitor.config.ts`)
3. ✅ Build de l'application React
4. ✅ Ajout de la plateforme Android
5. ✅ Synchronisation des fichiers

## 📋 Prérequis à installer

### 1. Installer Java Development Kit (JDK)

Pour générer l'APK, vous devez installer Java JDK 17 ou supérieur :

```bash
sudo apt update
sudo apt install openjdk-17-jdk
```

Vérifiez l'installation :
```bash
java -version
javac -version
```

Configurez JAVA_HOME dans votre `~/.bashrc` ou `~/.zshrc` :
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin
```

Rechargez votre configuration :
```bash
source ~/.bashrc  # ou source ~/.zshrc
```

### 2. Installer Android SDK (Optionnel mais recommandé)

**Option A : Installer Android Studio (Recommandé)**
- Téléchargez Android Studio depuis : https://developer.android.com/studio
- Installez-le et configurez le SDK Android
- Ouvrez le projet Android avec : `npm run cap:open:android`

**Option B : Installer uniquement les outils en ligne de commande**
- Téléchargez les Android Command Line Tools
- Configurez les variables d'environnement ANDROID_HOME et ANDROID_SDK_ROOT

## 🚀 Méthodes pour générer l'APK

### Méthode 1 : Avec Android Studio (Plus facile)

1. Ouvrez Android Studio :
```bash
npm run cap:open:android
```

2. Dans Android Studio :
   - Attendez que Gradle finisse de synchroniser
   - Allez dans **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - L'APK sera généré dans : `android/app/build/outputs/apk/debug/app-debug.apk`

### Méthode 2 : En ligne de commande (Plus rapide)

1. Naviguez vers le dossier Android :
```bash
cd android
```

2. Générez l'APK de debug :
```bash
./gradlew assembleDebug
```

3. L'APK sera disponible dans :
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Méthode 3 : APK de production (Signé)

Pour générer un APK de production signé :

1. Créez un keystore (une seule fois) :
```bash
keytool -genkey -v -keystore qrevent-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias qrevent
```

2. Créez le fichier `android/key.properties` :
```properties
storePassword=VOTRE_MOT_DE_PASSE
keyPassword=VOTRE_MOT_DE_PASSE
keyAlias=qrevent
storeFile=../qrevent-release-key.jks
```

3. Modifiez `android/app/build.gradle` pour ajouter la configuration de signature (voir documentation Capacitor)

4. Générez l'APK de release :
```bash
cd android
./gradlew assembleRelease
```

5. L'APK signé sera dans :
```
android/app/build/outputs/apk/release/app-release.apk
```

## 📱 Scripts NPM disponibles

- `npm run build` - Compile l'application React
- `npm run cap:sync` - Synchronise les fichiers web avec Android
- `npm run cap:build` - Build + Sync en une commande
- `npm run cap:open:android` - Ouvre le projet dans Android Studio

## 🔄 Workflow de développement

Après chaque modification de votre code React :

1. Compilez l'application :
```bash
npm run build
```

2. Synchronisez avec Android :
```bash
npm run cap:sync
```

Ou utilisez la commande combinée :
```bash
npm run cap:build
```

## 📝 Notes importantes

- **APK Debug** : Pour les tests, non optimisé, plus gros
- **APK Release** : Pour la production, optimisé, signé, plus petit
- Le fichier APK peut être installé directement sur un appareil Android
- Pour publier sur Google Play Store, vous devez générer un **AAB** (Android App Bundle) au lieu d'un APK

## 🔧 Dépannage

### Erreur "JAVA_HOME is not set"
Installez Java JDK et configurez JAVA_HOME (voir section Prérequis)

### Erreur "SDK location not found"
Installez Android Studio ou configurez ANDROID_HOME

### L'application ne démarre pas
Vérifiez que l'URL du backend est correctement configurée dans votre code

## 📦 Configuration actuelle

- **App ID** : `com.qrevent.app`
- **App Name** : `QR Event`
- **Web Directory** : `dist`
- **Platform** : Android

## 🎯 Prochaines étapes

1. Installez Java JDK 17
2. Choisissez votre méthode de build (Android Studio ou ligne de commande)
3. Générez votre premier APK de debug
4. Testez l'APK sur un appareil Android
5. Si tout fonctionne, générez un APK de production signé

---

Pour plus d'informations, consultez la documentation officielle de Capacitor :
https://capacitorjs.com/docs/android
