import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gastify.app',
  appName: 'Gastify',
  webDir: 'dist/gastify-frontend',
  // Comentado para producción - la APK usará los archivos locales
  // Para desarrollo local, descomenta esto y ejecuta: ng serve
  // server: {
  //   url: 'localhost:4200',
  //   cleartext: true
  // }
};

export default config;
