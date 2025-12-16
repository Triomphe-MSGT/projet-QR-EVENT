# Configuration Backend pour l'Application Mobile

## ⚠️ Important : Configuration de l'URL du Backend

Lorsque vous compilez votre application en APK, vous devez vous assurer que l'URL du backend est correctement configurée pour être accessible depuis un appareil mobile.

## 🔍 Problèmes courants

### 1. localhost ne fonctionne pas sur mobile
- `localhost` ou `127.0.0.1` fait référence à l'appareil mobile lui-même
- Votre backend doit être accessible via une adresse réseau

### 2. Solutions possibles

#### Option A : Utiliser l'adresse IP locale (Développement)

1. Trouvez votre adresse IP locale :
```bash
# Sur Linux
ip addr show | grep "inet "
# ou
hostname -I
```

2. Votre backend doit écouter sur `0.0.0.0` au lieu de `localhost` :
```javascript
// Dans votre backend (qrevent-backend)
app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:3000');
});
```

3. Mettez à jour l'URL dans votre application React :
```javascript
// Exemple : au lieu de
const API_URL = 'http://localhost:3000';

// Utilisez votre IP locale
const API_URL = 'http://192.168.1.X:3000';
```

#### Option B : Utiliser ngrok (Développement/Test)

ngrok crée un tunnel public vers votre serveur local :

```bash
# Installer ngrok
sudo snap install ngrok

# Créer un tunnel vers votre backend
ngrok http 3000
```

Vous obtiendrez une URL comme : `https://abc123.ngrok.io`

Utilisez cette URL dans votre application mobile.

#### Option C : Déployer le backend (Production)

Pour une application en production, déployez votre backend sur :
- Heroku
- Vercel
- Railway
- DigitalOcean
- AWS
- Google Cloud

Puis utilisez l'URL de production dans votre application.

## 🔧 Configuration recommandée

Créez un fichier de configuration pour gérer les différents environnements :

```javascript
// src/config/api.js
const API_URLS = {
  development: 'http://localhost:3000',
  staging: 'http://192.168.1.X:3000', // Votre IP locale
  production: 'https://votre-backend.com'
};

// Détection automatique de l'environnement
const getApiUrl = () => {
  // Si l'app tourne sur mobile (Capacitor)
  if (window.Capacitor) {
    // Utilisez l'URL de staging ou production
    return API_URLS.staging; // ou API_URLS.production
  }
  // Si l'app tourne dans le navigateur
  return API_URLS.development;
};

export const API_URL = getApiUrl();
```

## 📱 Vérifier si l'app tourne sur mobile

```javascript
import { Capacitor } from '@capacitor/core';

// Vérifier si l'app tourne sur une plateforme native
const isNative = Capacitor.isNativePlatform();

// Obtenir la plateforme
const platform = Capacitor.getPlatform(); // 'web', 'ios', ou 'android'

// Exemple d'utilisation
if (isNative) {
  console.log('App running on mobile');
} else {
  console.log('App running in browser');
}
```

## 🔐 CORS (Cross-Origin Resource Sharing)

Assurez-vous que votre backend accepte les requêtes depuis l'application mobile :

```javascript
// Dans votre backend
const cors = require('cors');

app.use(cors({
  origin: '*', // En développement
  // En production, spécifiez les origines autorisées
  // origin: ['https://votre-domaine.com', 'capacitor://localhost']
}));
```

## 📝 Checklist avant de générer l'APK

- [ ] Le backend est accessible depuis le réseau (pas seulement localhost)
- [ ] L'URL du backend est correctement configurée dans l'application
- [ ] CORS est configuré pour accepter les requêtes mobiles
- [ ] Les variables d'environnement sont correctement définies
- [ ] L'application gère les erreurs réseau (pas de connexion, timeout, etc.)

## 🧪 Tester la connexion

Avant de générer l'APK, testez la connexion :

```javascript
// Test de connexion au backend
fetch('http://VOTRE_IP:3000/api/test')
  .then(response => response.json())
  .then(data => console.log('Backend accessible:', data))
  .catch(error => console.error('Erreur de connexion:', error));
```

## 🌐 Configuration réseau pour le développement

### Autoriser les connexions sur votre firewall

```bash
# Ubuntu/Debian
sudo ufw allow 3000/tcp

# Vérifier le statut
sudo ufw status
```

### Redémarrer le backend avec la bonne configuration

```bash
cd qrevent-backend
# Assurez-vous que le serveur écoute sur 0.0.0.0
npm start
```

## 📋 Exemple de configuration complète

```javascript
// src/config/environment.js
import { Capacitor } from '@capacitor/core';

export const config = {
  // URL du backend
  apiUrl: Capacitor.isNativePlatform() 
    ? 'http://192.168.1.100:3000' // IP locale pour dev mobile
    : 'http://localhost:3000',     // localhost pour dev web
  
  // Timeout des requêtes
  requestTimeout: 10000,
  
  // Autres configurations
  enableLogging: true,
  version: '1.0.0'
};

// Utilisation dans votre code
import { config } from './config/environment';
import axios from 'axios';

const api = axios.create({
  baseURL: config.apiUrl,
  timeout: config.requestTimeout
});

export default api;
```

## 🚨 Erreurs courantes et solutions

### "Network Error" ou "Failed to fetch"
→ Vérifiez que le backend est accessible depuis votre appareil mobile
→ Testez l'URL dans le navigateur de votre téléphone

### "CORS Error"
→ Configurez CORS dans votre backend pour accepter les requêtes

### "Connection Timeout"
→ Vérifiez votre firewall
→ Assurez-vous que le backend écoute sur 0.0.0.0

## 📚 Ressources

- [Capacitor Network Plugin](https://capacitorjs.com/docs/apis/network)
- [Capacitor HTTP Plugin](https://capacitorjs.com/docs/apis/http)
- [ngrok Documentation](https://ngrok.com/docs)

---

**Note** : Pour la production, utilisez toujours HTTPS et ne hardcodez jamais les URLs sensibles dans le code !
