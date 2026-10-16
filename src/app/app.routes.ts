import { Routes } from '@angular/router';
import { authGuard } from './core/guard/auth.guard';

/**
 * Rutas de nivel superior de la aplicación.
 * @description Define las rutas de carga diferida (lazy-loaded) para los módulos de autenticación (`auth`) y de administración protegida (`admin`).
 */
export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES),
    },
    { 
        path: 'admin',
        loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
        canActivate: [authGuard]
    },
    { path: '**', redirectTo: 'auth/login'}
];
