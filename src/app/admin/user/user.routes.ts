import { Routes } from '@angular/router';

import { UserLayoutComponent } from './user-layout/user-layout.component';
import { DocumentsComponent } from './documents/documents.component';

export const USER_ROUTES: Routes = [
    {
        path: '',
        component: UserLayoutComponent,
        children: [
            { path: 'documents', component: DocumentsComponent}
        ]
    }
];