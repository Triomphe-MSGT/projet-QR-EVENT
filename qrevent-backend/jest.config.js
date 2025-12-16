module.exports = {
  // Environnement de test
  testEnvironment: 'node',

  // Dossiers de tests
  testMatch: [
    '**/requests/**/*.test.js',
    '**/tests/**/*.test.js'
  ],

  // Fichiers à ignorer
  testPathIgnorePatterns: [
    '/node_modules/',
    '/uploads/'
  ],

  // Couverture de code
  collectCoverageFrom: [
    'controllers/**/*.js',
    'services/**/*.js',
    'models/**/*.js',
    'utils/**/*.js',
    '!utils/config.js', // Exclure la config
    '!utils/logger.js', // Exclure le logger
    '!node_modules/**'
  ],

  // Seuils de couverture
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Timeout pour les tests (utile pour les tests de base de données)
  testTimeout: 10000,

  // Afficher les tests individuels
  verbose: true,

  // Nettoyer les mocks automatiquement
  clearMocks: true,

  // Variables d'environnement pour les tests
  setupFiles: ['<rootDir>/jest.setup.js'],

  // Format de sortie de la couverture
  coverageReporters: ['text', 'lcov', 'html'],

  // Dossier de sortie de la couverture
  coverageDirectory: 'coverage',

  // Transformations (si nécessaire pour ES6+)
  transform: {},

  // Extensions de fichiers
  moduleFileExtensions: ['js', 'json', 'node'],

  // Détection des fuites de mémoire
  detectLeaks: false,

  // Forcer la sortie après tous les tests
  forceExit: true,

  // Exécuter les tests en série (utile pour les tests de base de données)
  maxWorkers: 1
};
