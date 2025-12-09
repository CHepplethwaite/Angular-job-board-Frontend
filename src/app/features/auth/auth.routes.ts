import { Routes } from '@angular/router';
import { LoginPage } from './login.page';
import { RegisterPage } from './register.page';
import { ForgotPasswordPage } from '././forgot-password.page';
import { ResetPasswordPage } from '././reset-password.page';
import { VerifyEmailPage } from '././verify-email.page';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login.page').then(m => m.LoginPage),
    title: 'Login - Zizo'
  },
  {
    path: 'register',
    loadComponent: () => import('./register.page').then(m => m.RegisterPage),
    title: 'Register - Zizo'
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password.page').then(m => m.ForgotPasswordPage),
    title: 'Forgot Password - Zizo'
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./reset-password.page').then(m => m.ResetPasswordPage),
    title: 'Reset Password - Zizo'
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./verify-email.page').then(m => m.VerifyEmailPage),
    title: 'Verify Email - Zizo'
  },
  {
    path: 'logout',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  }
];