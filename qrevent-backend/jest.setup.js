// Configuration initiale pour les tests
// Ce fichier est exécuté avant tous les tests

// Charger les variables d'environnement de test
require('dotenv').config({ path: '.env.test' });

// Si .env.test n'existe pas, utiliser .env par défaut
if (!process.env.MONGODB_URI) {
  require('dotenv').config();
}

// Définir des valeurs par défaut pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qrevent-test';

// Désactiver les logs pendant les tests (optionnel)
if (process.env.SILENT_TESTS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

// Augmenter le timeout global si nécessaire
jest.setTimeout(10000);

// Mock pour le logger (optionnel)
jest.mock('./utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));
