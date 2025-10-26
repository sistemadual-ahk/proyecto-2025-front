import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: 'ebc602f7-4a32-42b1-9cb0-a1c48a0894d9',
  clientToken: 'pubd0a38645cda8d8a49d67bd1cd62786a5',
  site: 'datadoghq.com',
  service: 'proyecto-2025-front',
  env: 'production',
  sampleRate: 100,
  trackInteractions: true,
} as any);


bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
