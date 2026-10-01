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
import { VoucherComponent } from './voucher/voucher.component';
import { VoucherFeeComponent } from './voucher-fee/voucher-fee.component';
import { PeriodComponent } from './period/period.component';
import { PaymentPeriodComponent } from './payment-period/payment-period.component';
import { BrandCardComponent } from './brand-card/brand-card.component';
import { TypeCardComponent } from './type-card/type-card.component';
import { PaymentMethodComponent } from './payment-method/payment-method.component';
import { TypeOperationComponent } from './type-operation/type-operation.component';
import { VoucherStateComponent } from './voucher-state/voucher-state.component';
import { StatusPeriodComponent } from './status-period/status-period.component';
import { PaymentPeriodStatusComponent } from './payment-period-status/payment-period-status.component';
import { VoucherFeeStatusComponent } from './voucher-fee-status/voucher-fee-status.component';

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
            { path: 'type-card/new', component: TypeCardComponent },
            { path: 'type-card/edit/:tycrd_uuid', component: TypeCardComponent },
            { path: 'brand-cards', component: BrandCardsComponent},
            { path: 'brand-card/new', component: BrandCardComponent },
            { path: 'brand-card/edit/:brcrd_uuid', component: BrandCardComponent },
            { path: 'cards', component: CardsComponent},
            { path: 'card/new', component: CardComponent },
            { path: 'card/edit/:crd_uuid', component: CardComponent },
            { path: 'status-periods', component: StatusPeriodsComponent},
            { path: 'status-period/new', component: StatusPeriodComponent },
            { path: 'status-period/edit/:sper_uuid', component: StatusPeriodComponent },
            { path: 'periods', component: PeriodsComponent},
            { path: 'period/new', component: PeriodComponent },
            { path: 'period/edit/:crd_uuid/:per_uuid', component: PeriodComponent },
            { path: 'type-operations', component: TypeOperationsComponent},
            { path: 'type-operation/new', component: TypeOperationComponent },
            { path: 'type-operation/edit/:tyop_uuid', component: TypeOperationComponent },
            { path: 'vouchers-states', component: VouchersStatesComponent},
            { path: 'voucher-state/new', component: VoucherStateComponent },
            { path: 'voucher-state/edit/:vous_uuid', component: VoucherStateComponent },
            { path: 'vouchers', component: VouchersComponent},
            { path: 'voucher/new', component: VoucherComponent },
            { path: 'voucher/edit/:vou_uuid', component: VoucherComponent },
            { path: 'vouchers-fee-status', component: VouchersFeeStatusComponent},
            { path: 'voucher-fee-status/new', component: VoucherFeeStatusComponent },
            { path: 'voucher-fee-status/edit/:voufs_uuid', component: VoucherFeeStatusComponent },
            { path: 'vouchers-fees', component: VouchersFeesComponent},
            { path: 'voucher-fee/new', component: VoucherFeeComponent },
            { path: 'voucher-fee/edit/:crd_uuid/:per_uuid/:vou_uuid/:vouf_uuid', component: VoucherFeeComponent },
            { path: 'payment-periods-status', component: PaymentPeriodsStatusComponent},
            { path: 'payment-period-status/new', component: PaymentPeriodStatusComponent },
            { path: 'payment-period-status/edit/:payps_uuid', component: PaymentPeriodStatusComponent },
            { path: 'payment-methods', component: PaymentMethodsComponent},
            { path: 'payment-method/new', component: PaymentMethodComponent },
            { path: 'payment-method/edit/:paym_uuid', component: PaymentMethodComponent },
            { path: 'payment-periods', component: PaymentPeriodsComponent},
            { path: 'payment-period/new', component: PaymentPeriodComponent },
            { path: 'payment-period/edit/:crd_uuid/:per_uuid/:payp_uuid', component: PaymentPeriodComponent }
        ]
    }
];