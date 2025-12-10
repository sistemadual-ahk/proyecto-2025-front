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
  // Plugin de Auth0 (si lo estás usando)
  plugins: {
        Auth0: {
            // TU DOMINIO DE AUTH0 DEBE IR AQUÍ (DEV-...)
            domain: 'dev-zztl4usqwhq2jl2.us.auth0.com',
            clientId: '17HyCTqd1XCr5uGcMCMJlmTQmUwz8clj', // Asegúrate de rellenar esto
            urlScheme: 'gastifyapp', // <--- CORRECTO: AQUÍ VA EL ESQUEMA
        },
    },
};

export default config;
