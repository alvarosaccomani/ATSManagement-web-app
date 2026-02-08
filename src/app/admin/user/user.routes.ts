import { Routes } from '@angular/router';

import { UserLayoutComponent } from './user-layout/user-layout.component';
import { DocumentsComponent } from './documents/documents.component';
import { BanksComponent } from './banks/banks.component';
import { TypeCardsComponent } from './type-cards/type-cards.component';
import { BrandCardsComponent } from './brand-cards/brand-cards.component';
import { CardsComponent } from './cards/cards.component';

export const USER_ROUTES: Routes = [
    {
        path: '',
        component: UserLayoutComponent,
        children: [
            { path: 'documents', component: DocumentsComponent},
            { path: 'banks', component: BanksComponent},
            { path: 'type-cards', component: TypeCardsComponent},
            { path: 'brand-cards', component: BrandCardsComponent},
            { path: 'cards', component: CardsComponent}
        ]
    }
];