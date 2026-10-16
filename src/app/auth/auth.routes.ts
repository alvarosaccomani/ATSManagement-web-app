import { Routes } from '@angular/router';

import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AccountCreatedComponent } from './account-created/account-created.component';
import { AccountConfirmedComponent } from './account-confirmed/account-confirmed.component';
import { SsoCallbackComponent } from './sso-callback/sso-callback.component';
import { unauthGuard } from '../core/guard/unauth.guard';

/**
 * Rutas del módulo de autenticación.
 * @description Define las rutas para el inicio de sesión, registro, recuperación de contraseña, confirmación de cuenta y callback de SSO.
 */
export const AUTH_ROUTES: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            { path: 'login', component: LoginComponent, canActivate: [unauthGuard] },
            { path: 'register', component: RegisterComponent, canActivate: [unauthGuard] },
            { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [unauthGuard] },
            { path: 'reset-password/:usr_ResetPasswordToken', component: ResetPasswordComponent, canActivate: [unauthGuard] },
            { path: 'account-created/:usr_email', component: AccountCreatedComponent, canActivate: [unauthGuard] },
            { path: 'account-confirmed/:usr_ConfirmationToken', component: AccountConfirmedComponent },
            { path: 'sso', component: SsoCallbackComponent }
        ]
    }
];