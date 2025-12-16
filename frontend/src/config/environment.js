// Configuration de l'environnement pour l'application
// Ce fichier gère automatiquement les URLs selon l'environnement

// Fonction pour détecter si l'app tourne sur Capacitor (mobile)
const isCapacitor = () => {
  return window.Capacitor !== undefined;
};

// Configuration des URLs pour différents environnements
const config = {
  development: {
    apiUrl: 'http://localhost:3001/api',
    socketUrl: 'http://localhost:3001'
  },
  
  // Pour tester sur mobile en développement
  // Remplacez 192.168.1.X par votre IP locale
  mobile: {
    apiUrl: 'http://192.168.1.X:3001/api', // TODO: Remplacer par votre IP locale
    socketUrl: 'http://192.168.1.X:3001'
  },
  
  production: {
    apiUrl: 'https://projet-qr-event-uzrp.onrender.com/api',
    socketUrl: 'https://projet-qr-event-uzrp.onrender.com'
  }
};

// Déterminer l'environnement actuel
const getEnvironment = () => {
  // Si on est en production (déployé)
  if (import.meta.env.PROD) {
    return 'production';
  }
  
  // Si on est sur mobile (Capacitor)
  if (isCapacitor()) {
    return 'mobile';
  }
  
  // Sinon, on est en développement web
  return 'development';
};

// Exporter la configuration active
const currentEnv = getEnvironment();
export const API_BASE_URL = config[currentEnv].apiUrl;
export const SOCKET_URL = config[currentEnv].socketUrl;

// Exporter aussi l'environnement pour debug
export const CURRENT_ENV = currentEnv;

// Log pour debug (à retirer en production)
console.log(`🌍 Environment: ${currentEnv}`);
console.log(`🔗 API URL: ${API_BASE_URL}`);
console.log(`🔌 Socket URL: ${SOCKET_URL}`);
console.log(`📱 Is Capacitor: ${isCapacitor()}`);
