# User Manual: Cards, Vouchers, Installments and Parameters

This manual documents the modules for bank card administration, purchase receipt (voucher) registration with financial installment calculation, installment due date tracking, billing period closures, statement payments, and parametric catalog maintenance.

---

## 1. Card Administration (`/admin/user/cards` and `/admin/user/card/new`)

The **Cards** module manages credit and debit cards associated with the banks, brands, and card types configured in the system.

### 1.1. Listing Features (`/admin/user/cards`)
- **Security Masking (`maskCardNumber`)**: Card numbers are displayed masked in `**** **** **** 1234` format, exposing only the last 4 digits.
- **Expiration Alerts (`isExpired`)**: The system compares the expiration date (`crd_expirationdate`) against the current date and visually highlights expired cards.
- **Credit Limit Display**: Shows the assigned credit limit (`crd_creditlimit`) for credit cards.

### 1.2. Creation and Editing Form (`/admin/user/card/new` and `/admin/user/card/edit/:crd_uuid`)
- **Automatic Last 4 Digits Extraction**: As the user types the full card number (`crd_maskednumber`, between 13 and 19 numeric digits), the form automatically extracts and populates the read-only **Last 4 digits (`crd_last4digits`)** field.
- **Business Rule for Debit Cards (`tycrd_uuid === '1'`)**: When the **Debit** card type (`tycrd_uuid === '1'`) is selected, the form automatically sets the **Credit Limit (`crd_creditlimit`)** to `0` and disables the control to prevent assigning debt limits to a debit card. Selecting **Credit** re-enables the field.
- **Associations**: Selection of **Card Type (`tycrd_uuid`)**, **Brand (`brcrd_uuid`)**, **Issuing Bank (`ban_uuid`)**, expiration date, and active/inactive status.

---

## 2. Voucher Administration (`/admin/user/vouchers` and `/admin/user/voucher/new`)

The **Vouchers** module allows registering and auditing every card purchase slip or transaction receipt.

### 2.1. Management and Quick Actions (`/admin/user/vouchers`)
- Displays authorization number, transaction number, amount, merchant, Tax ID (CUIT), installment count, billing period, and status indicators (*Pending*, *Confirmed*, *Rejected*).
- **In-Row Quick Actions**: For vouchers in *Pending* status (`stovou_uuid === '1'`), the list provides direct action buttons to **Confirm Voucher (`confirmVoucher`)** (changes status to `'2'`) or **Reject Voucher (`rejectVoucher`)** (changes status to `'3'`) without opening the edit form.

### 2.2. Voucher Form and Financial Calculator (`/admin/user/voucher/new`)
The voucher creation/editing form includes:
- **Receipt Data**: Authorization number (`vou_authorizationnumber`), transaction number (`vou_transactionnumber`), date and time (`vou_datetime`), base amount (`vou_amount`), merchant name (`vou_commerce`), CUIT (`vou_cuit`, validated with 11-digit `XX-XXXXXXXX-X` format), image reference (`vou_imagereference`), and notes (`vou_notes`).
- **Classification**: Billing period (`per_uuid`), Operation Type (`tyop_uuid`), Payment Method (`paym_uuid`), and Voucher Status (`stovou_uuid`).
- **Installments Switch (`vou_installments`)**: Enabling the installment payment switch:
  - Enables the **Installment Count (`vou_installmentcount`)** (from 2 to 60 installments) and **Interest Rate (`vou_interestrate`)** (`0%` to `100%`) controls.
  - **Live Installment and Interest Calculator**: The form displays a financial summary panel that calculates in real time:
    - **Installment Amount (`calculateInstallmentAmount`)**:
      $$\text{Installment Amount} = \frac{\text{Base Amount} \times \left(1 + \frac{\text{Interest Rate}}{100}\right)}{\text{Installment Count}}$$
    - **Total with Interest (`calculateTotalWithInterest`)**: Final financed amount including the percentage surcharge.
- **Automatic Installment Schedule Generation (`fees`)**: When saving a new voucher with the installments switch active (`vou_installments && vou_installmentcount > 1`), the component automatically generates the monthly installment array (`fees`), assigning each installment its sequential number (`vf_quotanumber`), calculated amount (`vf_quotaamount`), month-by-month staggered due date (`vf_expirationdate`), and initial *Pending* status (`stovf_uuid: '1'`).

---

## 3. Voucher Installments (`/admin/user/vouchers-fees` and `/admin/user/voucher-fee/new`)

The **Voucher Installments** module provides detailed tracking of the due date schedule for every financed purchase.

- **Overdue Indicator (`isOverdue`)**: Automatically identifies installments whose due date (`vf_expirationdate`) has passed while still in *Pending* status (`stovf_uuid === '1'`).
- **Remaining Days Calculation (`getDaysLeft`)**: Calculates the calendar day difference between the current date and the installment due date to alert on upcoming maturities.
- **Quick Payment and Reversal Actions**:
  - **Pay Installment (`payQuota`)**: Instantly marks a pending or overdue installment as **Paid** (`stovf_uuid = '2'`) and records the current date as the effective payment date (`vf_paymentdate`).
  - **Revert Payment (`revertPayment`)**: If an installment was marked as paid by mistake, restores it to **Pending** status (`stovf_uuid = '1'`) and clears its payment date.

---

## 4. Billing Periods (`/admin/user/periods` and `/admin/user/period/new`)

**Periods** represent the monthly billing cycles or statements for each bank card.

- **Strict Chronological Validation (`validatePeriodDates`)**: In the creation and editing form (`/admin/user/period/new`), the system validates the temporal consistency of the three cycle dates in real time:
  1. The **Start Date (`per_startdate`)** must be strictly earlier than the **End / Closing Date (`per_enddate`)** (`startDate < endDate`).
  2. The **End / Closing Date (`per_enddate`)** must be strictly earlier than the **Due Date (`per_duedate`)** (`endDate < dueDate`).
- **Quick Period Closure (`closePeriod`)**: In the periods list (`/admin/user/periods`), cycles in *Open* status (`stoper_uuid === '1'`) include a direct action button to close the statement, changing its status to *Closed* (`stoper_uuid = '2'`).

---

## 5. Payment Periods (`/admin/user/payment-periods` and `/admin/user/payment-period/new`)

The **Payment Periods** module records disbursements made to fully or partially pay off card billing statements.

- Records payment date (`payp_paymentdate`), amount paid (`payp_amountpaid`), payment method used (`paym_uuid`), bank reference or receipt (`payp_paymentreference`), notes, and payment status (`stopayp_uuid`).
- **Quick Confirmation and Rejection in List**: When a payment is in *Processing* status (`stopayp_uuid === '1'`), the table provides direct actions to:
  - **Confirm Payment (`confirmPayment`)**: Updates status to *Confirmed* (`stopayp_uuid = '2'`).
  - **Reject Payment (`rejectPayment`)**: Updates status to *Rejected* (`stopayp_uuid = '3'`).

---

## 6. Parametric Catalogs (Parameters Submenu)

Under the **Parameters** submenu in the sidebar are the **9 master modules** that feed the dropdown lists and classification rules across the platform. All of them feature full listing, creation, editing, and confirmed deletion operations:

| # | Parametric Module | List Route | Create / Edit Route | Primary Purpose |
| :- | :--- | :--- | :--- | :--- |
| 1 | **Banks** | `/admin/user/banks` | `/admin/user/bank/new` | Financial institutions issuing cards (`ban_name`, `ban_code`, `ban_active`). |
| 2 | **Card Types** | `/admin/user/types-cards` | `/admin/user/type-card/new` | Operational classification of cards, such as *Debit* or *Credit* (`tycrd_name`). |
| 3 | **Card Brands** | `/admin/user/brands-cards` | `/admin/user/brand-card/new` | Issuing networks and franchises such as *Visa*, *Mastercard*, *American Express* (`brcrd_name`). |
| 4 | **Payment Methods** | `/admin/user/payment-methods` | `/admin/user/payment-method/new` | Enabled settlement means such as *Cash*, *Bank Transfer*, *Automatic Debit* (`paym_name`). |
| 5 | **Operation Types** | `/admin/user/type-operations` | `/admin/user/type-operation/new` | Nature of the voucher transaction, such as *In-Store Purchase*, *Subscription*, *Refund* (`tyop_name`). |
| 6 | **Period Statuses** | `/admin/user/status-periods` | `/admin/user/status-period/new` | Billing cycle states: *Open*, *Closed*, *Paid*, *Overdue* (`stoper_name`). |
| 7 | **Voucher Statuses** | `/admin/user/status-vouchers` | `/admin/user/status-voucher/new` | Receipt audit states: *Pending*, *Confirmed*, *Rejected*, *Reconciled* (`stovou_name`). |
| 8 | **Installment Statuses** | `/admin/user/status-vouchers-fees` | `/admin/user/status-voucher-fee/new` | Individual installment states: *Pending*, *Paid*, *Overdue*, *Cancelled* (`stovf_name`). |
| 9 | **Payment Period Statuses** | `/admin/user/status-payment-periods` | `/admin/user/status-payment-period/new` | Statement payment states: *Processing*, *Confirmed*, *Rejected*, *Refunded* (`stopayp_name`). |
