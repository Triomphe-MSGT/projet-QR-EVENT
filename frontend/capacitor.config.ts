import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qrevent.app',
  appName: 'QR Event',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
