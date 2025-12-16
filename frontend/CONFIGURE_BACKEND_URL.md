# 📱 Configuration de l'URL Backend pour Mobile

## 🎯 Problème

Quand vous compilez votre application en APK et l'installez sur un téléphone, `localhost` ne fonctionnera pas car il fait référence au téléphone lui-même, pas à votre ordinateur.

## ✅ Solution

J'ai créé un fichier de configuration qui détecte automatiquement l'environnement : `src/config/environment.js`

### Option 1 : Utiliser votre IP locale (Développement)

1. **Trouvez votre adresse IP locale** :
```bash
# Sur Linux
hostname -I
# ou
ip addr show | grep "inet " | grep -v 127.0.0.1
```

Vous obtiendrez quelque chose comme : `192.168.1.100`

2. **Mettez à jour le fichier de configuration** :

Ouvrez `src/config/environment.js` et remplacez :
```javascript
mobile: {
  apiUrl: 'http://192.168.1.X:3001/api', // TODO: Remplacer par votre IP locale
  socketUrl: 'http://192.168.1.X:3001'
}
```

Par votre IP réelle :
```javascript
mobile: {
  apiUrl: 'http://192.168.1.100:3001/api', // Votre IP locale
  socketUrl: 'http://192.168.1.100:3001'
}
```

3. **Configurez votre backend pour écouter sur toutes les interfaces** :

Dans `qrevent-backend`, assurez-vous que le serveur écoute sur `0.0.0.0` :

```javascript
// Dans votre fichier server.js ou app.js
app.listen(3001, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:3001');
});
```

4. **Autorisez les connexions sur votre firewall** :
```bash
sudo ufw allow 3001/tcp
```

### Option 2 : Utiliser l'URL de production

Si votre backend est déjà déployé sur Render (comme indiqué dans le code), vous pouvez simplement utiliser l'URL de production :

1. Ouvrez `src/config/environment.js`

2. Modifiez la section `mobile` pour utiliser l'URL de production :
```javascript
mobile: {
  apiUrl: 'https://projet-qr-event-uzrp.onrender.com/api',
  socketUrl: 'https://projet-qr-event-uzrp.onrender.com'
}
```

### Option 3 : Utiliser ngrok (Tunnel temporaire)

Pour tester rapidement sans configuration réseau :

1. **Installez ngrok** :
```bash
sudo snap install ngrok
```

2. **Créez un tunnel vers votre backend** :
```bash
ngrok http 3001
```

3. **Copiez l'URL générée** (ex: `https://abc123.ngrok.io`)

4. **Mettez à jour la configuration** :
```javascript
mobile: {
  apiUrl: 'https://abc123.ngrok.io/api',
  socketUrl: 'https://abc123.ngrok.io'
}
```

## 🔄 Workflow complet

### Pour tester sur mobile en développement :

1. **Trouvez votre IP locale** :
```bash
hostname -I
```

2. **Mettez à jour `src/config/environment.js`** avec votre IP

3. **Démarrez le backend sur 0.0.0.0** :
```bash
cd qrevent-backend
npm start
```

4. **Vérifiez que le backend est accessible** depuis votre téléphone :
   - Ouvrez le navigateur de votre téléphone
   - Allez sur `http://VOTRE_IP:3001/api`
   - Vous devriez voir une réponse du serveur

5. **Compilez et synchronisez l'application** :
```bash
cd frontend
npm run build
npm run cap:sync
```

6. **Générez l'APK** :
```bash
./build-apk.sh
```

7. **Installez l'APK sur votre téléphone**

### Pour déployer en production :

1. **Utilisez l'URL de production** dans la config mobile

2. **Compilez pour la production** :
```bash
npm run build
npm run cap:sync
cd android
./gradlew assembleRelease
```

## 🧪 Tester la connexion

Avant de générer l'APK, testez que votre téléphone peut accéder au backend :

### Depuis le navigateur de votre téléphone :
```
http://VOTRE_IP:3001/api
```

### Depuis votre ordinateur :
```bash
# Vérifiez que le serveur écoute sur toutes les interfaces
netstat -tuln | grep 3001
# Vous devriez voir 0.0.0.0:3001 ou :::3001
```

## 📋 Checklist

- [ ] J'ai trouvé mon adresse IP locale
- [ ] J'ai mis à jour `src/config/environment.js` avec mon IP
- [ ] Mon backend écoute sur `0.0.0.0:3001`
- [ ] Mon firewall autorise les connexions sur le port 3001
- [ ] Je peux accéder au backend depuis le navigateur de mon téléphone
- [ ] J'ai compilé et synchronisé l'application
- [ ] J'ai généré l'APK

## ⚠️ Notes importantes

### Sécurité
- En développement, utiliser votre IP locale est OK
- En production, utilisez TOUJOURS HTTPS
- Ne hardcodez jamais de tokens ou clés API dans le code

### Réseau
- Votre téléphone et votre ordinateur doivent être sur le même réseau WiFi
- Certains réseaux publics bloquent les connexions entre appareils
- Si ça ne fonctionne pas, essayez de désactiver temporairement le firewall

### Performance
- L'URL de production peut être plus lente si le serveur est loin
- L'URL locale est plus rapide mais nécessite que votre ordinateur soit allumé

## 🔧 Dépannage

### "Network Error" dans l'app mobile
→ Vérifiez que le backend est accessible depuis le navigateur du téléphone
→ Vérifiez que vous êtes sur le même réseau WiFi

### "Connection Refused"
→ Vérifiez que le backend écoute sur 0.0.0.0 et pas seulement localhost
→ Vérifiez le firewall

### "CORS Error"
→ Configurez CORS dans votre backend pour accepter toutes les origines en dev :
```javascript
app.use(cors({ origin: '*' }));
```

## 📚 Fichiers concernés

- `src/config/environment.js` - Configuration des URLs
- `src/slices/axiosInstance.js` - Instance Axios (peut être mis à jour pour utiliser la config)

---

**Conseil** : Pour le développement, utilisez votre IP locale. Pour les tests avec d'autres personnes ou la production, utilisez l'URL de production.
