# 🚀 Guide Complet : De React à APK Android

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Configuration du Backend](#configuration-du-backend)
4. [Génération de l'APK](#génération-de-lapk)
5. [Installation sur Android](#installation-sur-android)
6. [Dépannage](#dépannage)

---

## 🎯 Vue d'ensemble

Votre application **QR Event** est maintenant configurée avec Capacitor pour être compilée en APK Android.

### ✅ Ce qui a été fait automatiquement

- ✅ Installation de Capacitor et du plugin Android
- ✅ Configuration de Capacitor (`capacitor.config.ts`)
- ✅ Création du projet Android natif
- ✅ Ajout de scripts NPM utiles
- ✅ Création de la documentation complète
- ✅ Création d'un script automatisé de build

### 📁 Fichiers créés

| Fichier | Description |
|---------|-------------|
| `capacitor.config.ts` | Configuration Capacitor |
| `android/` | Projet Android natif |
| `build-apk.sh` | Script automatisé pour générer l'APK |
| `cap-help.sh` | Aide rapide des commandes |
| `src/config/environment.js` | Configuration des URLs par environnement |
| `BUILD_APK_GUIDE.md` | Guide détaillé de génération d'APK |
| `CONFIGURE_BACKEND_URL.md` | Guide de configuration du backend |
| `CAPACITOR_SETUP_COMPLETE.md` | Résumé de la configuration |

---

## 🔧 Prérequis

### 1. Installer Java JDK 17

```bash
sudo apt update
sudo apt install openjdk-17-jdk
```

### 2. Configurer JAVA_HOME

Ajoutez ces lignes à votre `~/.bashrc` ou `~/.zshrc` :

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin
```

Rechargez la configuration :

```bash
source ~/.bashrc  # ou source ~/.zshrc
```

### 3. Vérifier l'installation

```bash
java -version
javac -version
```

Vous devriez voir Java 17.x.x

---

## 🌐 Configuration du Backend

### Option A : Utiliser l'URL de production (Recommandé pour commencer)

Si votre backend est déjà déployé sur Render :

1. Ouvrez `src/config/environment.js`
2. Vérifiez que la section `mobile` utilise l'URL de production :

```javascript
mobile: {
  apiUrl: 'https://projet-qr-event-uzrp.onrender.com/api',
  socketUrl: 'https://projet-qr-event-uzrp.onrender.com'
}
```

3. C'est tout ! Passez à la génération de l'APK.

### Option B : Utiliser votre serveur local (Pour le développement)

1. **Trouvez votre adresse IP locale** :
```bash
hostname -I
```
Exemple de résultat : `192.168.1.100`

2. **Mettez à jour `src/config/environment.js`** :
```javascript
mobile: {
  apiUrl: 'http://192.168.1.100:3001/api',
  socketUrl: 'http://192.168.1.100:3001'
}
```

3. **Configurez votre backend** pour écouter sur toutes les interfaces :

Dans `qrevent-backend/server.js` (ou équivalent) :
```javascript
app.listen(3001, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:3001');
});
```

4. **Autorisez les connexions** :
```bash
sudo ufw allow 3001/tcp
```

5. **Testez depuis le navigateur de votre téléphone** :
```
http://VOTRE_IP:3001/api
```

📖 **Guide détaillé** : Voir `CONFIGURE_BACKEND_URL.md`

---

## 📦 Génération de l'APK

### Méthode 1 : Script automatisé (Recommandé)

```bash
./build-apk.sh
```

Ce script va :
1. Vérifier que Java est installé
2. Compiler l'application React
3. Synchroniser avec Android
4. Générer l'APK

### Méthode 2 : Étape par étape

```bash
# 1. Compiler l'application React
npm run build

# 2. Synchroniser avec Android
npm run cap:sync

# 3. Générer l'APK
cd android
./gradlew assembleDebug
```

### Méthode 3 : Avec Android Studio

```bash
# Ouvrir Android Studio
npm run cap:open:android
```

Dans Android Studio :
1. Attendez que Gradle finisse de synchroniser
2. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**

---

## 📱 Localisation de l'APK

Après la génération, l'APK se trouve ici :

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Taille approximative : 20-50 MB (selon les dépendances)

---

## 📲 Installation sur Android

### Méthode 1 : Transfert manuel

1. **Copiez l'APK** sur votre téléphone (USB, email, cloud, etc.)
2. **Activez "Sources inconnues"** :
   - Paramètres → Sécurité → Sources inconnues
   - Ou : Paramètres → Applications → Accès spécial → Installer des apps inconnues
3. **Ouvrez le fichier APK** sur votre téléphone
4. **Appuyez sur "Installer"**

### Méthode 2 : Avec ADB (Android Debug Bridge)

```bash
# Connectez votre téléphone en USB avec le débogage USB activé
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Pour réinstaller (si déjà installé)
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔄 Workflow de développement

Après chaque modification de votre code React :

```bash
# Option 1 : Script automatisé
./build-apk.sh

# Option 2 : Commandes manuelles
npm run build
npm run cap:sync
cd android && ./gradlew assembleDebug
```

---

## 📋 Scripts NPM disponibles

| Script | Description |
|--------|-------------|
| `npm run build` | Compile l'application React |
| `npm run cap:sync` | Synchronise les fichiers avec Android |
| `npm run cap:build` | Build + Sync en une commande |
| `npm run cap:open:android` | Ouvre Android Studio |

---

## 🐛 Dépannage

### Erreur : "JAVA_HOME is not set"

**Solution** : Installez Java JDK 17 et configurez JAVA_HOME (voir section Prérequis)

### Erreur : "SDK location not found"

**Solution** : Installez Android Studio ou créez `android/local.properties` :
```properties
sdk.dir=/home/VOTRE_USER/Android/Sdk
```

### Erreur : "Network Error" dans l'app mobile

**Solutions** :
1. Vérifiez que le backend est accessible depuis le navigateur du téléphone
2. Vérifiez la configuration dans `src/config/environment.js`
3. Assurez-vous d'être sur le même réseau WiFi (si vous utilisez une IP locale)

### L'APK ne s'installe pas

**Solutions** :
1. Activez "Sources inconnues" dans les paramètres Android
2. Vérifiez que vous avez assez d'espace de stockage
3. Désinstallez l'ancienne version si elle existe

### L'application crash au démarrage

**Solutions** :
1. Vérifiez les logs avec : `adb logcat`
2. Vérifiez que l'URL du backend est correcte
3. Assurez-vous que le backend est accessible

---

## 🎯 Checklist complète

### Avant la première génération

- [ ] Java JDK 17 installé
- [ ] JAVA_HOME configuré
- [ ] Backend configuré (URL mise à jour dans `src/config/environment.js`)
- [ ] Backend accessible depuis le téléphone (si IP locale)

### Pour chaque nouvelle version

- [ ] Code React modifié et testé
- [ ] `npm run build` exécuté avec succès
- [ ] `npm run cap:sync` exécuté
- [ ] APK généré sans erreur
- [ ] APK testé sur un appareil Android

---

## 🚀 Commandes rapides

```bash
# Voir l'aide rapide
./cap-help.sh

# Générer l'APK
./build-apk.sh

# Installer sur téléphone connecté
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Voir les logs de l'app
adb logcat | grep QREvent
```

---

## 📚 Documentation complète

- **`BUILD_APK_GUIDE.md`** - Guide détaillé de génération d'APK
- **`CONFIGURE_BACKEND_URL.md`** - Configuration du backend pour mobile
- **`CAPACITOR_SETUP_COMPLETE.md`** - Résumé de la configuration
- **`BACKEND_MOBILE_CONFIG.md`** - Configuration réseau avancée
- **`android/README.md`** - Documentation du projet Android

---

## 🎓 Prochaines étapes

### Pour le développement
1. Générez un APK de debug
2. Testez sur votre appareil
3. Itérez sur votre code

### Pour la production
1. Créez une clé de signature (keystore)
2. Configurez la signature dans `android/app/build.gradle`
3. Générez un APK release : `./gradlew assembleRelease`
4. Ou générez un AAB pour Google Play Store : `./gradlew bundleRelease`

---

## 🆘 Besoin d'aide ?

1. Consultez les guides dans le dossier `frontend/`
2. Vérifiez les logs : `adb logcat`
3. Consultez la documentation Capacitor : https://capacitorjs.com/docs/android

---

## ⚙️ Configuration actuelle

```typescript
{
  appId: 'com.qrevent.app',
  appName: 'QR Event',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
}
```

---

**Félicitations ! 🎉** Vous êtes prêt à générer votre première APK Android !

**Commande pour commencer** :
```bash
./build-apk.sh
```
