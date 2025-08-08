import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gastify.app',
  appName: 'Gastify',
  webDir: 'dist/gastify-frontend',
  server: {
    url: 'http://192.168.3.186:4200',
    cleartext: true
  }
};

export default config;
