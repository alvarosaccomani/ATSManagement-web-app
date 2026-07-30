import { Routes } from '@angular/router';

import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { SsoCallbackComponent } from './sso-callback/sso-callback.component';

export const AUTH_ROUTES: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            { path: 'login', component: LoginComponent},
            { path: 'register', component: RegisterComponent },
            { path: 'sso', component: SsoCallbackComponent }
        ]
    }
];