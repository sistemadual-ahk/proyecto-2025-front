import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { SavingGoalsComponent } from './pages/saving-goals/saving-goals.component';
import { WalletsComponent } from './pages/wallets/wallets.component';
import { ActivityComponent } from './pages/activity/activity.component';
import { AnalysisComponent } from './pages/analysis/analysis.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'saving-goals', component: SavingGoalsComponent },
  { path: 'wallets', component: WalletsComponent },
  { path: 'activity', component: ActivityComponent },
  { path: 'analysis', component: AnalysisComponent },
];
