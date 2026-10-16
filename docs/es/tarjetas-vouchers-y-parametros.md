# Manual de Usuario: Tarjetas, Vouchers, Cuotas y Parámetros

Este manual documenta los módulos de administración de tarjetas bancarias, registro de comprobantes de compra (vouchers) con cálculo financiero de cuotas, seguimiento de vencimientos de cuotas, cierres de períodos de liquidación, pagos de resúmenes y mantenimiento de catálogos paramétricos.

---

## 1. Administración de Tarjetas (`/admin/user/cards` y `/admin/user/card/new`)

El módulo de **Tarjetas** gestiona las tarjetas de crédito y débito asociadas a los bancos, marcas y tipos configurados en el sistema.

### 1.1. Funcionalidades del Listado (`/admin/user/cards`)
- **Enmascaramiento de Seguridad (`maskCardNumber`)**: Los números de tarjeta se muestran enmascarados en formato `**** **** **** 1234`, exponiendo únicamente los últimos 4 dígitos.
- **Alertas de Vencimiento (`isExpired`)**: El sistema compara la fecha de expiración (`crd_expirationdate`) contra la fecha actual y resalta visualmente aquellas tarjetas que se encuentran vencidas.
- **Visualización de Límite de Crédito**: Muestra el cupo asignado (`crd_creditlimit`) para tarjetas de crédito.

### 1.2. Formulario de Alta y Edición (`/admin/user/card/new` y `/admin/user/card/edit/:crd_uuid`)
- **Extracción Automática de Últimos 4 Dígitos**: A medida que el usuario escribe el número completo de la tarjeta (`crd_maskednumber`, entre 13 y 19 dígitos numéricos), el formulario extrae y completa automáticamente el campo de solo lectura **Últimos 4 dígitos (`crd_last4digits`)**.
- **Regla de Negocio para Tarjetas de Débito (`tycrd_uuid === '1'`)**: Cuando se selecciona el tipo de tarjeta **Débito** (`tycrd_uuid === '1'`), el formulario establece automáticamente el **Límite de Crédito (`crd_creditlimit`)** en `0` y deshabilita el control para evitar asignar cupos de endeudamiento a una tarjeta de débito. Si se selecciona **Crédito**, el campo se habilita nuevamente.
- **Asociaciones**: Selección de **Tipo de Tarjeta (`tycrd_uuid`)**, **Marca (`brcrd_uuid`)**, **Banco Emisor (`ban_uuid`)**, fecha de vencimiento y estado activo/inactivo.

---

## 2. Administración de Vouchers (`/admin/user/vouchers` y `/admin/user/voucher/new`)

El módulo de **Vouchers** permite registrar y auditar cada cupón o comprobante de operación realizado con tarjeta.

### 2.1. Gestión y Acciones Rápidas (`/admin/user/vouchers`)
- Permite visualizar el número de autorización, transacción, monto, comercio, CUIT, cantidad de cuotas, período e indicadores de estado (*Pendiente*, *Confirmado*, *Rechazado*).
- **Acciones Rápidas en Fila**: Para los vouchers en estado *Pendiente* (`stovou_uuid === '1'`), el listado ofrece botones de acción directa para **Confirmar Voucher (`confirmVoucher`)** (cambia el estado a `'2'`) o **Rechazar Voucher (`rejectVoucher`)** (cambia el estado a `'3'`) sin necesidad de abrir el formulario de edición.

### 2.2. Formulario de Voucher y Calculadora Financiera (`/admin/user/voucher/new`)
El formulario de alta/edición de voucher incluye:
- **Datos del Comprobante**: Número de autorización (`vou_authorizationnumber`), número de transacción (`vou_transactionnumber`), fecha y hora (`vou_datetime`), importe base (`vou_amount`), nombre del comercio (`vou_commerce`), CUIT (`vou_cuit`, validado con formato `XX-XXXXXXXX-X` de 11 dígitos), referencia de imagen (`vou_imagereference`) y notas (`vou_notes`).
- **Clasificación**: Período de liquidación (`per_uuid`), Tipo de Operación (`tyop_uuid`), Método de Pago (`paym_uuid`) y Estado del Voucher (`stovou_uuid`).
- **Switch de Cuotas (`vou_installments`)**: Al activar el interruptor de pago en cuotas:
  - Se habilitan los controles **Cantidad de Cuotas (`vou_installmentcount`)** (de 2 a 60 cuotas) y **Tasa de Interés (`vou_interestrate`)** (`0%` a `100%`).
  - **Calculadora en Vivo de Cuotas e Intereses**: El formulario muestra un panel de resumen financiero que calcula en tiempo real:
    - **Monto por Cuota (`calculateInstallmentAmount`)**:
      $$\text{Monto Cuota} = \frac{\text{Importe Base} \times \left(1 + \frac{\text{Tasa Interés}}{100}\right)}{\text{Cantidad de Cuotas}}$$
    - **Total con Intereses (`calculateTotalWithInterest`)**: Importe final financiado sumando el recargo porcentual.
- **Generación Automática de Cuotas (`fees`)**: Al guardar un voucher nuevo con el switch de cuotas activo (`vou_installments && vou_installmentcount > 1`), el componente genera automáticamente el arreglo de cuotas mensuales (`fees`), asignando a cada cuota su número correlativo (`vf_quotanumber`), su importe calculado (`vf_quotaamount`), su fecha de vencimiento escalonada mes a mes (`vf_expirationdate`) y el estado inicial *Pendiente* (`stovf_uuid: '1'`).

---

## 3. Cuotas de Vouchers (`/admin/user/vouchers-fees` y `/admin/user/voucher-fee/new`)

El módulo de **Cuotas de Vouchers** permite hacer un seguimiento pormenorizado del cronograma de vencimientos de cada compra financiada.

- **Indicador de Mora (`isOverdue`)**: Identifica automáticamente las cuotas cuya fecha de vencimiento (`vf_expirationdate`) ya ha pasado y que aún permanecen en estado *Pendiente* (`stovf_uuid === '1'`).
- **Cálculo de Días Restantes (`getDaysLeft`)**: Calcula la diferencia en días corridos entre la fecha actual y el vencimiento de la cuota para alertar sobre vencimientos próximos.
- **Acciones Rápidas de Pago y Reversión**:
  - **Pagar Cuota (`payQuota`)**: Marca instantáneamente una cuota pendiente o vencida como **Pagada** (`stovf_uuid = '2'`) y registra la fecha actual como fecha efectiva de pago (`vf_paymentdate`).
  - **Revertir Pago (`revertPayment`)**: Si una cuota fue marcada como pagada por error, permite restituirla al estado **Pendiente** (`stovf_uuid = '1'`) limpiando su fecha de pago.

---

## 4. Períodos de Liquidación (`/admin/user/periods` y `/admin/user/period/new`)

Los **Períodos** representan los ciclos mensuales de facturación o resúmenes de cada tarjeta bancaria.

- **Validación Cronológica Estricta (`validatePeriodDates`)**: En el formulario de creación y edición (`/admin/user/period/new`), el sistema valida en tiempo real la coherencia temporal de las tres fechas del ciclo:
  1. La **Fecha de Inicio (`per_startdate`)** debe ser estrictamente anterior a la **Fecha de Fin / Cierre (`per_enddate`)** (`startDate < endDate`).
  2. La **Fecha de Fin / Cierre (`per_enddate`)** debe ser estrictamente anterior a la **Fecha de Vencimiento (`per_duedate`)** (`endDate < dueDate`).
- **Cierre Rápido de Período (`closePeriod`)**: En el listado de períodos (`/admin/user/periods`), aquellos ciclos que se encuentran en estado *Abierto* (`stoper_uuid === '1'`) disponen de un botón de acción directa para cerrar el resumen, cambiando su estado a *Cerrado* (`stoper_uuid = '2'`).

---

## 5. Períodos de Pago (`/admin/user/payment-periods` y `/admin/user/payment-period/new`)

El módulo de **Períodos de Pago** registra los desembolsos realizados para cancelar total o parcialmente los resúmenes de liquidación de las tarjetas.

- Registra la fecha de pago (`payp_paymentdate`), el importe abonado (`payp_amountpaid`), el método de pago utilizado (`paym_uuid`), la referencia o comprobante bancario (`payp_paymentreference`), notas y el estado del pago (`stopayp_uuid`).
- **Confirmación y Rechazo Rápido en Listado**: Cuando un pago se encuentra en estado *Procesando* (`stopayp_uuid === '1'`), la tabla ofrece acciones directas para:
  - **Confirmar Pago (`confirmPayment`)**: Actualiza el estado a *Confirmado* (`stopayp_uuid = '2'`).
  - **Rechazar Pago (`rejectPayment`)**: Actualiza el estado a *Rechazado* (`stopayp_uuid = '3'`).

---

## 6. Catálogos Paramétricos (Submenú Parámetros)

Bajo el submenú **Parámetros** de la barra lateral se encuentran los **9 módulos maestros** que alimentan las listas desplegables y reglas de clasificación de toda la plataforma. Todos ellos cuentan con operaciones completas de listado, alta, edición y baja con confirmación:

| # | Módulo Paramétrico | Ruta de Listado | Ruta de Creación / Edición | Propósito Principal |
| :- | :--- | :--- | :--- | :--- |
| 1 | **Bancos** | `/admin/user/banks` | `/admin/user/bank/new` | Entidades financieras emisoras de tarjetas (`ban_name`, `ban_code`, `ban_active`). |
| 2 | **Tipos de Tarjetas** | `/admin/user/types-cards` | `/admin/user/type-card/new` | Clasificación operativa de tarjetas, como *Débito* o *Crédito* (`tycrd_name`). |
| 3 | **Marcas de Tarjetas** | `/admin/user/brands-cards` | `/admin/user/brand-card/new` | Redes y franquicias emisoras como *Visa*, *Mastercard*, *American Express* (`brcrd_name`). |
| 4 | **Métodos de Pago** | `/admin/user/payment-methods` | `/admin/user/payment-method/new` | Medios de cancelación habilitados como *Efectivo*, *Transferencia*, *Débito Automático* (`paym_name`). |
| 5 | **Tipos de Operaciones** | `/admin/user/type-operations` | `/admin/user/type-operation/new` | Naturaleza de la transacción del voucher, como *Compra en Comercio*, *Suscripción*, *Devolución* (`tyop_name`). |
| 6 | **Estados de Períodos** | `/admin/user/status-periods` | `/admin/user/status-period/new` | Estados del ciclo de facturación: *Abierto*, *Cerrado*, *Pagado*, *Vencido* (`stoper_name`). |
| 7 | **Estados de Vouchers** | `/admin/user/status-vouchers` | `/admin/user/status-voucher/new` | Estados de auditoría del comprobante: *Pendiente*, *Confirmado*, *Rechazado*, *Conciliado* (`stovou_name`). |
| 8 | **Estados de Cuotas** | `/admin/user/status-vouchers-fees` | `/admin/user/status-voucher-fee/new` | Estados de cada cuota individual: *Pendiente*, *Pagada*, *Vencida*, *Cancelada* (`stovf_name`). |
| 9 | **Estados de Períodos de Pago** | `/admin/user/status-payment-periods` | `/admin/user/status-payment-period/new` | Estados de los pagos de resumen: *Procesando*, *Confirmado*, *Rechazado*, *Reembolsado* (`stopayp_name`). |
