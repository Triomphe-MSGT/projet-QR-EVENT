# Tests Unitaires du Backend QR-Event

Ce dossier contient tous les tests unitaires pour le backend de l'application QR-Event.

## 📋 Fichiers de Tests

### Controllers
- **auth.test.js** - Tests pour l'authentification (register, login, Google OAuth)
- **categories.test.js** - Tests pour la gestion des catégories (CRUD)
- **events.test.js** - Tests pour la gestion des événements (CRUD, inscriptions, QR codes)
- **users.test.js** - Tests pour la gestion des utilisateurs (profils, rôles, mot de passe)
- **notifications.test.js** - Tests pour les notifications
- **dashboard.test.js** - Tests pour les statistiques du tableau de bord

### Services
- **qrCodeService.test.js** - Tests pour le service de génération de QR codes
- **emailService.test.js** - Tests pour le service d'envoi d'emails

## 🚀 Exécution des Tests

### Tous les tests
```bash
npm test
```

### Un fichier spécifique
```bash
npm test -- auth.test.js
```

### Avec couverture de code
```bash
npm test -- --coverage
```

### En mode watch
```bash
npm test -- --watch
```

## 🔧 Configuration

Les tests utilisent:
- **Jest** - Framework de test
- **Supertest** - Tests d'API HTTP
- **MongoDB Memory Server** (recommandé) - Base de données en mémoire pour les tests

### Variables d'environnement pour les tests

Créez un fichier `.env.test` avec:
```env
MONGODB_URI=mongodb://localhost:27017/qrevent-test
JWT_SECRET=test-secret-key
GOOGLE_CLIENT_ID=test-google-client-id
```

## 📊 Couverture des Tests

Les tests couvrent:
- ✅ Tous les endpoints de l'API
- ✅ Validation des données
- ✅ Authentification et autorisation
- ✅ Gestion des erreurs
- ✅ Logique métier
- ✅ Services externes (QR codes, emails)

## 🎯 Bonnes Pratiques

1. **Isolation** - Chaque test est indépendant
2. **Nettoyage** - La base de données est nettoyée avant chaque test
3. **Mocking** - Les services externes sont mockés quand nécessaire
4. **Assertions claires** - Chaque test vérifie un comportement précis

## 📝 Structure d'un Test

```javascript
describe('Nom du Controller/Service', () => {
  beforeEach(async () => {
    // Préparation avant chaque test
  });

  describe('Nom de la fonctionnalité', () => {
    it('devrait faire quelque chose de spécifique', async () => {
      // Arrange - Préparer les données
      // Act - Exécuter l'action
      // Assert - Vérifier le résultat
    });
  });
});
```

## 🐛 Debugging

Pour débugger un test spécifique:
```bash
node --inspect-brk node_modules/.bin/jest --runInBand auth.test.js
```

## 📚 Ressources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
