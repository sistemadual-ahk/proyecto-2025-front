import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { SavingGoalsComponent } from './pages/saving-goals/saving-goals.component';
import { WalletsComponent } from './pages/wallets/wallets.component';
import { ActivityComponent } from './pages/activity/activity.component';
import { AnalysisComponent } from './pages/analysis/analysis.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { AuthGuard } from './guards/auth.guard';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  // Rutas públicas (sin autenticación)
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Rutas protegidas (requieren autenticación)
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'saving-goals', component: SavingGoalsComponent, canActivate: [AuthGuard] },
  { path: 'wallets', component: WalletsComponent, canActivate: [AuthGuard] },
  { path: 'activity', component: ActivityComponent, canActivate: [AuthGuard] },
  { path: 'analysis', component: AnalysisComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'categories', component: CategoriesComponent, canActivate: [AuthGuard] },

  // Ruta wildcard - redirige al login si la ruta no existe
  { path: '**', redirectTo: '' },
];
