import { Routes } from '@angular/router';

import { UserLayoutComponent } from './user-layout/user-layout.component';
import { DocumentsComponent } from './documents/documents.component';
import { BanksComponent } from './banks/banks.component';
import { TypeCardsComponent } from './type-cards/type-cards.component';

export const USER_ROUTES: Routes = [
    {
        path: '',
        component: UserLayoutComponent,
        children: [
            { path: 'documents', component: DocumentsComponent},
            { path: 'banks', component: BanksComponent},
            { path: 'type-cards', component: TypeCardsComponent}
        ]
    }
];