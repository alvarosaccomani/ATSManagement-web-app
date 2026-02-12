import { Routes } from '@angular/router';

import { UserLayoutComponent } from './user-layout/user-layout.component';
import { DocumentsComponent } from './documents/documents.component';
import { BanksComponent } from './banks/banks.component';
import { BankComponent } from './bank/bank.component';
import { TypeCardsComponent } from './type-cards/type-cards.component';
import { BrandCardsComponent } from './brand-cards/brand-cards.component';
import { CardsComponent } from './cards/cards.component';
import { StatusPeriodsComponent } from './status-periods/status-periods.component';
import { PeriodsComponent } from './periods/periods.component';
import { TypeOperationsComponent } from './type-operations/type-operations.component';
import { VouchersStatesComponent } from './vouchers-states/vouchers-states.component';
import { VouchersComponent } from './vouchers/vouchers.component';
import { VouchersFeeStatusComponent } from './vouchers-fee-status/vouchers-fee-status.component';
import { VouchersFeesComponent } from './vouchers-fees/vouchers-fees.component';
import { PaymentPeriodsStatusComponent } from './payment-periods-status/payment-periods-status.component';
import { PaymentMethodsComponent } from './payment-methods/payment-methods.component';
import { PaymentPeriodsComponent } from './payment-periods/payment-periods.component';
import { CardComponent } from './card/card.component';

export const USER_ROUTES: Routes = [
    {
        path: '',
        component: UserLayoutComponent,
        children: [
            { path: 'documents', component: DocumentsComponent},
            { path: 'banks', component: BanksComponent},
            { path: 'bank/new', component: BankComponent },
            { path: 'bank/edit/:ban_uuid', component: BankComponent },
            { path: 'type-cards', component: TypeCardsComponent},
            { path: 'brand-cards', component: BrandCardsComponent},
            { path: 'cards', component: CardsComponent},
            { path: 'card/new', component: CardComponent },
            { path: 'card/edit/:crd_uuid', component: CardComponent },
            { path: 'status-periods', component: StatusPeriodsComponent},
            { path: 'periods', component: PeriodsComponent},
            { path: 'type-operations', component: TypeOperationsComponent},
            { path: 'vouchers-states', component: VouchersStatesComponent},
            { path: 'vouchers', component: VouchersComponent},
            { path: 'vouchers-fee-status', component: VouchersFeeStatusComponent},
            { path: 'vouchers-fees', component: VouchersFeesComponent},
            { path: 'payment-periods-status', component: PaymentPeriodsStatusComponent},
            { path: 'payment-methods', component: PaymentMethodsComponent},
            { path: 'payment-periods', component: PaymentPeriodsComponent}

        ]
    }
];