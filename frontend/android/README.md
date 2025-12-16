# Configuration Android pour QR Event

Ce dossier contient le projet Android natif généré par Capacitor.

## 🎯 Génération rapide de l'APK

### Méthode rapide avec le script automatisé

Depuis le dossier `frontend`, exécutez :

```bash
./build-apk.sh
```

Ce script va :
1. Vérifier que Java est installé
2. Builder l'application React
3. Synchroniser les fichiers
4. Générer l'APK de debug

### Méthode manuelle

1. **Installer Java JDK 17** (si pas déjà fait) :
```bash
sudo apt update
sudo apt install openjdk-17-jdk
```

2. **Configurer JAVA_HOME** :
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin
```

3. **Générer l'APK** :
```bash
cd android
./gradlew assembleDebug
```

4. **Trouver l'APK** :
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## 📱 Types d'APK

### APK Debug
- Pour les tests et le développement
- Non optimisé, taille plus importante
- Génération : `./gradlew assembleDebug`

### APK Release
- Pour la production
- Optimisé et signé
- Génération : `./gradlew assembleRelease`
- Nécessite une clé de signature

## 🔑 Signature de l'APK (Production)

Pour créer un APK signé pour la production :

1. **Créer un keystore** :
```bash
keytool -genkey -v -keystore qrevent-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias qrevent
```

2. **Créer `key.properties`** dans le dossier `android` :
```properties
storePassword=VOTRE_MOT_DE_PASSE
keyPassword=VOTRE_MOT_DE_PASSE
keyAlias=qrevent
storeFile=../qrevent-release-key.jks
```

3. **Modifier `app/build.gradle`** pour inclure la configuration de signature

4. **Générer l'APK signé** :
```bash
./gradlew assembleRelease
```

## 🛠️ Ouvrir dans Android Studio

```bash
# Depuis le dossier frontend
npm run cap:open:android
```

Dans Android Studio, vous pouvez :
- Déboguer l'application
- Utiliser l'émulateur Android
- Générer l'APK via l'interface graphique
- Analyser les performances

## 📋 Commandes Gradle utiles

```bash
# Nettoyer le build
./gradlew clean

# Générer APK debug
./gradlew assembleDebug

# Générer APK release
./gradlew assembleRelease

# Lister toutes les tâches
./gradlew tasks

# Voir les dépendances
./gradlew dependencies
```

## 🔄 Workflow de mise à jour

Après avoir modifié le code React :

```bash
# Depuis le dossier frontend
npm run build
npm run cap:sync

# Puis regénérer l'APK
cd android
./gradlew assembleDebug
```

## 📦 Installation de l'APK

### Sur un appareil physique

1. Activez le mode développeur sur votre appareil Android
2. Activez "Sources inconnues" ou "Installer des applications inconnues"
3. Transférez l'APK sur votre appareil
4. Ouvrez le fichier APK pour l'installer

### Avec ADB (Android Debug Bridge)

```bash
# Installer l'APK
adb install app/build/outputs/apk/debug/app-debug.apk

# Désinstaller l'application
adb uninstall com.qrevent.app

# Voir les logs
adb logcat
```

## ⚠️ Problèmes courants

### "JAVA_HOME is not set"
Installez Java JDK et configurez la variable d'environnement JAVA_HOME

### "SDK location not found"
Créez le fichier `local.properties` avec :
```properties
sdk.dir=/chemin/vers/android/sdk
```

### Erreur de build Gradle
Nettoyez le cache :
```bash
./gradlew clean
rm -rf .gradle
./gradlew assembleDebug
```

## 📚 Ressources

- [Documentation Capacitor](https://capacitorjs.com/docs/android)
- [Documentation Android](https://developer.android.com/studio/build)
- [Guide de signature d'APK](https://developer.android.com/studio/publish/app-signing)

---

**Note** : Ne commitez jamais vos fichiers de clés (`.jks`) ou `key.properties` dans Git !
