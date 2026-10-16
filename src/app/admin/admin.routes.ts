import { Routes } from '@angular/router';

/**
 * Rutas del módulo de administración.
 * @description Carga de forma diferida las rutas hijas del espacio de trabajo del usuario bajo `/admin/user`.
 */
export const ADMIN_ROUTES: Routes = [
    {
        path: 'user',
        loadChildren: () => import('./user/user.routes').then(m => m.USER_ROUTES),
    }
];