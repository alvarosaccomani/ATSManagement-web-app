# User Manual: Dashboard, Cash Flow, Scopes and Commissions

This manual details the financial operations management in **ATSManagement Web App**, covering the main control dashboard, accounting separation by scopes (contexts), the persons/contacts directory, cash flow transaction recording, and seller commission settlement.

---

## 1. Financial Dashboard (`/admin/user/dashboard`)

The **Financial and Management Dashboard** offers a real-time consolidated view of cash status and recent user activity.

### 1.1. Scope Filter and Quick Actions
At the top of the dashboard:
- **Scope Selector (`selectedScopeUuid`)**: Allows switching between **"All Scopes (Global)"** (`ALL`) or filtering metrics exclusively for a specific scope (for example: *Personal*, *Home*, *Project*).
- **`+ Create Scope` Button**: Navigates directly to the context creation form (`/admin/user/scope/new`).
- **`+ New Transaction` Button**: Opens the form to record income, expenses, or transfers (`/admin/user/transaction/new`).

### 1.2. Key Performance Indicators (KPIs)
The upper panel displays 4 financial summary cards dynamically calculated according to the selected filter:
1. **Total Income**: Sum of all transactions of type `INGRESO` (highlighted in green `#28a745`).
2. **Total Expenses**: Sum of all transactions of type `EGRESO` (highlighted in red `#dc3545`).
3. **Net Balance (Current Cash)**: Net difference between income and expenses (`totalIncome - totalExpense`), visually highlighting whether the overall balance is positive (`#28a745`) or negative (`#dc3545`).
4. **Total Recorded Transactions**: Total counter of operations accounted for in the active view.

### 1.3. Operational Summary Tables
Below the KPIs, two complementary panels are displayed:
- **Balances by Scope (Contexts)**: Comparative table breaking down each scope's color tag (`scp_color`), total **Income**, total **Expenses**, and its individual **Net Balance**.
- **Latest Recorded Transactions**: List of the 10 most recent transactions ordered chronologically, showing date, concept/associated person, amount, and a color-coded type badge:
  - `INGRESO` (Income): Green badge (`#d4edda` / text `#155724`).
  - `EGRESO` (Expense): Red badge (`#f8d7da` / text `#721c24`).
  - `TRANSFERENCIA` (Transfer): Blue badge (`#cce5ff` / text `#004085`).

---

## 2. Scopes Management (`/admin/user/scopes`)

**Scopes** allow separating the accounting of different financial environments within the same user account (for example, personal finances, a commercial venture, or shared household expenses).

### 2.1. Listing and Actions (`/admin/user/scopes`)
Displays a grid with all created scopes, including visual color swatch, name, description, shared indicator (`Yes` / `No`), status (`Active` / `Inactive`), and creation date. Allows editing each record or deleting it after modal confirmation.

### 2.2. Creation and Editing (`/admin/user/scope/new` and `/admin/user/scope/edit/:scp_uuid`)
The scope form includes the following controls:
- **Scope Name (`scp_name`)**: Required (for example: *Personal*, *Home*, *Project A*).
- **Description (`scp_description`)**: Optional explanation of the context's purpose.
- **Identifying Color (`scp_color`)**: Native color picker (`input type="color"`, default `#1890ff`) used in Dashboard badges and listings.
- **Is Shared? (`scp_isshared`)**: Toggle switch to indicate whether multiple users or collaborators participate in this scope.
- **Status (`scp_active`)**: Toggle switch to enable or disable the scope without losing its accounting history.

---

## 3. Persons and Contacts Management (`/admin/user/persons`)

The **Persons and Contacts** module centralizes the directory of third parties linked to the operations of each scope (sellers, clients, partners, suppliers, etc.).

### 3.1. Directory Filters (`/admin/user/persons`)
The main view includes two real-time combinable filters:
- **Filter by Scope (`selectedScope`)**: Filters contacts belonging to a specific scope or shows `ALL`.
- **Filter by Role (`selectedRole`)**: Quickly isolates contacts by classification (`VENDEDOR`, `SOCIO`, `CLIENTE`, `PROVEEDOR`, `AMIGO`, `OTRO`).

### 3.2. Person Form (`/admin/user/person/new` and `/admin/user/person/edit/:prs_uuid`)
- **Scope (`scp_uuid`)**: Context to which the contact belongs.
- **First Name (`prs_name`)** and **Last Name (`prs_surname`)**: Required first name and optional last name (in case a legal entity or company name is registered).
- **Tax ID / National ID (`prs_taxid`)**: Tax identifier (CUIT/CUIL) or identity document (DNI).
- **Roles (`prs_roles`)**: Multi-select control (`nzMode="multiple"`) allowing one or multiple simultaneous roles to be assigned to the same person:
  - `VENDEDOR` (Seller), `SOCIO` (Partner), `CLIENTE` (Client), `PROVEEDOR` (Supplier), `AMIGO` (Friend), `OTRO` (Other).
- **Sales Commission % (`prs_commissionrate`)**: Numeric percentage (`0` to `100`, step `0.5`). If the person acts as a seller, this rate is automatically applied when recording income associated with them.
- **Phone (`prs_phone`)**, **Email (`prs_email`)**, **Notes (`prs_notes`)**, and **Status (`prs_active`)**.

---

## 4. Cash Flow Transactions (`/admin/user/transactions`)

The **Cash Flow Transactions (General Ledger)** module records all money inflows, outflows, and transfers.

### 4.1. Combined Search and Filtering (`/admin/user/transactions`)
Allows auditing history by combining three simultaneous criteria:
1. **Scope**: All or a specific context.
2. **Transaction Type**: `INGRESO`, `EGRESO`, or `TRANSFERENCIA`.
3. **Text Search**: Instantly filters matches in concept (`trx_concept`), notes (`trx_notes`), or associated person's first/last name.

### 4.2. Recording and Editing Transactions (`/admin/user/transaction/new` and `/admin/user/transaction/edit/:trx_uuid`)
The form reactively adapts its validations and calculations according to the entered data:
- **Scope (`scp_uuid`)**: Selecting a scope automatically filters the available persons list to show only contacts belonging to that scope.
- **Transaction Type (`trx_type`)**:
  - `INGRESO` (Money inflow / Income)
  - `EGRESO` (Outflow / Expense / Payment)
  - `TRANSFERENCIA` (Between own accounts)
- **Dynamic Validation on Transfers**: When the user selects `TRANSFERENCIA`, the form displays the bank accounts/cards section and makes the **Target Account / Card (`target_crduuid`)** field **required** via dynamic validators, while also allowing the **Source Account / Card (`source_crduuid`)** to be specified.
- **Automatic Commission Calculation**: When the transaction type is `INGRESO` and an **Associated Person (`prs_uuid`)** with a configured commission rate (`prs_commissionrate > 0`) is selected, the system automatically calculates the commission upon entering the amount:
  $$\text{Calculated Commission} = \frac{\text{Amount} \times \text{Commission \%}}{100}$$
  It also displays an informational notice indicating the exact percentage and commission amount to be generated, while allowing manual adjustment of the `trx_commissionamount` field if needed.
- **Quick Save Modes**:
  - **Save and Add Another (Excel Fast Mode)**: Saves the transaction on the server and keeps the user on the same screen, preserving the selected **Scope**, **Transaction Type**, **Payment Method**, and **Date**, clearing only the concept, amount, person, and notes. Ideal for entering long spreadsheets of transactions without leaving the screen.
  - **Save and Finish**: Saves the operation and returns to the general listing `/admin/user/transactions`.

---

## 5. Seller Commissions (`/admin/user/seller-commissions`)

The **Seller Commission Settlement and Control** module consolidates all sales (`INGRESO`) that have an accrued commission (`trx_commissionamount > 0`).

### 5.1. Settlement Filters
- **Filter by Scope**: Segments sales by business unit or context.
- **Filter by Seller**: Automatically lists all persons holding the `VENDEDOR` role or a commission rate greater than `0%`.

### 5.2. Commercial Performance KPIs
Presents 3 real-time key indicators according to the active filter:
1. **Total Sales Made (`totalSales`)**: Total sum of gross sale amounts (`trx_amount`) generated by the filtered sellers.
2. **Total Commissions Earned (`totalCommissions`)**: Total sum to settle/pay in commissions (`trx_commissionamount`).
3. **Number of Sales (`salesCount`)**: Total number of closed commissionable operations.

### 5.3. Detailed Settlement Table
Breaks down each commissionable operation showing:
- **Sale Date (`trx_date`)**
- **Scope (`scp_name`)** with its corresponding color tag
- **Seller** (full name)
- **Sale Concept / Detail (`trx_concept`)**
- **Sale Amount (`trx_amount`)**
- **Applied % (`prs_commissionrate`)**
- **Commission Earned (`trx_commissionamount`)** highlighted in a green badge to facilitate payment control.
