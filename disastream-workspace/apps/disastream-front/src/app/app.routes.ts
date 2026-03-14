import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LandingPageView } from './Pages/LandingPage/LandingPage.view';
import { AuthenticationView } from './Pages/Authentification/Authentification.view';
import { ForgotPasswordView } from './Pages/ForgotPassword/ForgotPassword.view';
import { PageNotFoundView } from './Pages/PageNotFoundView/PageNotFound.view';
import { LoginView } from './Pages/Login/Login.view';
import { DashboardView } from './Pages/Dashboard/Dashboard.view';
import { NewAlertView } from './Pages/NewAlert/NewAlert.component';
import { ManageAlertsView } from './Pages/ManageAlerts/ManageAlerts.view';
import { UserProfileComponent } from './Pages/UserProfile/user-profile.component';
import { IsUserSignedIn } from './Helpers/auth.guard';
import { FinalScreenView } from './Pages/FinalScreen/FinalScreen.component';
import { ConfirmEmailView } from './Pages/ConfirmEmail/ConfirmEmail.view';
import { ConfirmAssociationView } from './Pages/ConfirmAssociation/ConfirmAssociation.view';
import { DisasterView } from './Pages/DisasterView/disaster.view';
import { PricingView } from './Pages/Pricing/Pricing.view';
import { FAQView } from './Pages/FAQ/FAQ.view';
import { ChangePasswordView } from './Pages/ChangePassword/ChangePassword.view';
import { AdminView } from './Pages/Admin/Admin.view';
import { AdminCitiesView } from './Pages/Admin/admin-cities/admin-cities.component';
import { IsAdminGuard } from './Helpers/admin.guard';
import { GoogleRegisterView } from './Pages/GoogleRegister/GoogleRegister.view';
import { DisasterDetailView } from './Pages/DisasterMapDetail/DisasterDetail.view';

export const routes: Routes = [
  { path: '', component: LandingPageView },
  { path: 'auth', component: AuthenticationView },
  { path: 'google-register', component: GoogleRegisterView },
  { path: 'login', component: LoginView },
  // { path: 'price', component: PricingView },
  // { path: 'faq', component: FAQView },
  { path: 'forgot-password', component: ForgotPasswordView },
  { path: 'change-password', component: ChangePasswordView },
  { path: 'profile', component: UserProfileComponent, canActivate: [IsUserSignedIn] },
  { path: 'confirm-email', component: ConfirmEmailView },
  { path: 'confirm-association', component: ConfirmAssociationView },
  { path: 'dashboard', component: DashboardView, canActivate: [IsUserSignedIn] },
  // { path: 'dashboard/alert/success', component: FinalScreenView, canActivate: [IsUserSignedIn] },
  { path: 'dashboard/alert/new', component: NewAlertView, canActivate: [IsUserSignedIn] },
  { path: 'dashboard/alert/edit', component: NewAlertView, canActivate: [IsUserSignedIn] },
  // { path: 'dashboard/alerts/manage', component: ManageAlertsView, canActivate: [IsUserSignedIn] },
  { path: 'dashboard/map', component: DisasterView, canActivate: [IsUserSignedIn] },
  { path: 'dashboard/:alea/:id', component: DisasterDetailView, canActivate: [IsUserSignedIn] },
  { path: 'admin', component: AdminView, canActivate: [IsUserSignedIn, IsAdminGuard] },
  { path: 'admin/cities', component: AdminCitiesView, canActivate: [IsUserSignedIn, IsAdminGuard] },
  { path: '**', pathMatch: 'full', component: PageNotFoundView },
];