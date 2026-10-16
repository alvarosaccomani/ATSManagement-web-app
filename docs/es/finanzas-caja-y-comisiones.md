# Manual de Usuario: Dashboard, Caja, Ámbitos y Comisiones

Este manual detalla la gestión operativa financiera en **ATSManagement Web App**, abarcando el tablero de control principal, la separación contable por ámbitos (contextos), la agenda de personas/contactos, el registro de movimientos de caja y la liquidación de comisiones de vendedores.

---

## 1. Dashboard Financiero (`/admin/user/dashboard`)

El **Dashboard Financiero y de Gestión** ofrece una vista consolidada en tiempo real del estado de caja y la actividad reciente del usuario.

### 1.1. Filtro por Ámbito y Accesos Rápidos
En la cabecera del tablero se encuentran:
- **Selector de Ámbito (`selectedScopeUuid`)**: Permite alternar entre **"Todos los Ámbitos (Global)"** (`ALL`) o filtrar las métricas exclusivamente para un ámbito específico (por ejemplo: *Personal*, *Hogar*, *Proyecto*).
- **Botón `+ Crear Ámbito`**: Navega directamente al formulario de creación de contextos (`/admin/user/scope/new`).
- **Botón `+ Nuevo Movimiento`**: Abre el formulario de registro de ingresos, egresos o transferencias (`/admin/user/transaction/new`).

### 1.2. Indicadores Clave (KPIs)
El panel superior presenta 4 tarjetas de resumen financiero calculadas dinámicamente según el filtro seleccionado:
1. **Total Ingresos**: Sumatoria de todos los movimientos de tipo `INGRESO` (destacado en verde `#28a745`).
2. **Total Egresos**: Sumatoria de todos los movimientos de tipo `EGRESO` (destacado en rojo `#dc3545`).
3. **Balance Neto (Caja Actual)**: Diferencia neta entre ingresos y egresos (`totalIncome - totalExpense`), resaltando visualmente si el saldo global es positivo (`#28a745`) o negativo (`#dc3545`).
4. **Total Movimientos Registrados**: Contador total de operaciones contabilizadas en la vista activa.

### 1.3. Tablas de Resumen Operativo
Debajo de los KPIs se disponen dos paneles complementarios:
- **Saldos por Ámbito (Contextos)**: Tabla comparativa que desglosa para cada ámbito su etiqueta de color (`scp_color`), total de **Ingresos**, total de **Egresos** y su **Saldo Neto** individual.
- **Últimos Movimientos Registrados**: Listado de las 10 transacciones más recientes ordenadas cronológicamente, mostrando fecha, concepto/persona asociada, monto y un *badge* de tipo codificado por colores:
  - `INGRESO`: Etiqueta verde (`#d4edda` / texto `#155724`).
  - `EGRESO`: Etiqueta roja (`#f8d7da` / texto `#721c24`).
  - `TRANSFERENCIA`: Etiqueta azul (`#cce5ff` / texto `#004085`).

---

## 2. Gestión de Ámbitos (`/admin/user/scopes`)

Los **Ámbitos** permiten independizar la contabilidad de distintos entornos financieros dentro de una misma cuenta de usuario (por ejemplo, finanzas personales, un emprendimiento comercial o gastos compartidos del hogar).

### 2.1. Listado y Acciones (`/admin/user/scopes`)
Muestra una grilla con todos los ámbitos creados, incluyendo muestra visual de color, nombre, descripción, indicador de si es compartido (`Sí` / `No`), estado (`Activo` / `Inactivo`) y fecha de alta. Permite editar cada registro o eliminarlo previa confirmación modal.

### 2.2. Creación y Edición (`/admin/user/scope/new` y `/admin/user/scope/edit/:scp_uuid`)
El formulario de ámbito cuenta con los siguientes controles:
- **Nombre del Ámbito (`scp_name`)**: Obligatorio (por ejemplo: *Personal*, *Hogar*, *Proyecto A*).
- **Descripción (`scp_description`)**: Explicación opcional del propósito del contexto.
- **Color Identificativo (`scp_color`)**: Selector nativo de color (`input type="color"`, por defecto `#1890ff`) que se utiliza en las etiquetas del Dashboard y listados.
- **¿Es Compartido? (`scp_isshared`)**: Interruptor (*switch*) para indicar si múltiples usuarios o colaboradores participan en este ámbito.
- **Estado (`scp_active`)**: Interruptor para habilitar o deshabilitar el ámbito sin perder su historial contable.

---

## 3. Gestión de Personas y Contactos (`/admin/user/persons`)

El módulo de **Personas y Contactos** centraliza el padrón de terceros vinculados a las operaciones de cada ámbito (vendedores, clientes, socios, proveedores, etc.).

### 3.1. Filtros del Padrón (`/admin/user/persons`)
La vista principal incluye dos filtros combinables en tiempo real:
- **Filtrar por Ámbito (`selectedScope`)**: Filtra contactos pertenecientes a un ámbito específico o muestra `ALL`.
- **Filtrar por Rol (`selectedRole`)**: Permite aislar rápidamente contactos según su clasificación (`VENDEDOR`, `SOCIO`, `CLIENTE`, `PROVEEDOR`, `AMIGO`, `OTRO`).

### 3.2. Formulario de Persona (`/admin/user/person/new` y `/admin/user/person/edit/:prs_uuid`)
- **Ámbito (`scp_uuid`)**: Contexto al que pertenece el contacto.
- **Nombre (`prs_name`)** y **Apellido (`prs_surname`)**: Nombre obligatorio y apellido opcional (por si se registra una razón social o entidad).
- **CUIT / CUIL / DNI (`prs_taxid`)**: Identificador tributario o documento de identidad.
- **Roles (`prs_roles`)**: Selector múltiple (`nzMode="multiple"`) que permite asignar uno o varios roles simultáneos a la misma persona:
  - `VENDEDOR`, `SOCIO`, `CLIENTE`, `PROVEEDOR`, `AMIGO`, `OTRO`.
- **% Comisión por Venta (`prs_commissionrate`)**: Porcentaje numérico (`0` a `100`, con paso `0.5`). Si la persona actúa como vendedor, este valor se aplicará automáticamente al registrar ingresos asociados a ella.
- **Teléfono (`prs_phone`)**, **Email (`prs_email`)**, **Notas (`prs_notes`)** y **Estado (`prs_active`)**.

---

## 4. Movimientos de Caja (`/admin/user/transactions`)

El módulo de **Movimientos de Caja (Libro Mayor)** registra todas las entradas, salidas y transferencias de dinero.

### 4.1. Búsqueda y Filtrado Combinado (`/admin/user/transactions`)
Permite auditar el historial combinando tres criterios simultáneos:
1. **Ámbito**: Todos o un contexto puntual.
2. **Tipo de Movimiento**: `INGRESO`, `EGRESO` o `TRANSFERENCIA`.
3. **Buscador de Texto**: Filtra instantáneamente coincidencias en el concepto (`trx_concept`), notas (`trx_notes`) o nombre/apellido de la persona asociada.

### 4.2. Registro y Edición de Movimientos (`/admin/user/transaction/new` y `/admin/user/transaction/edit/:trx_uuid`)
El formulario adapta sus validaciones y cálculos de manera reactiva según los datos ingresados:
- **Ámbito (`scp_uuid`)**: Al seleccionar un ámbito, el sistema filtra automáticamente el listado de personas disponibles para mostrar únicamente los contactos de ese ámbito.
- **Tipo de Movimiento (`trx_type`)**:
  - `INGRESO` (Entrada de dinero)
  - `EGRESO` (Salida / Gasto / Pago)
  - `TRANSFERENCIA` (Entre cuentas propias)
- **Validación Dinámica en Transferencias**: Cuando el usuario selecciona `TRANSFERENCIA`, el formulario despliega la sección de cuentas bancarias/tarjetas y hace **obligatorio** el campo **Cuenta / Tarjeta Destino (`target_crduuid`)** mediante validadores dinámicos, permitiendo además indicar la **Cuenta / Tarjeta Origen (`source_crduuid`)**.
- **Cálculo Automático de Comisión**: Cuando el movimiento es de tipo `INGRESO` y se selecciona una **Persona Asociada (`prs_uuid`)** que posee porcentaje de comisión configurado (`prs_commissionrate > 0`), el sistema calcula automáticamente la comisión al ingresar el monto:
  $$\text{Comisión Calculada} = \frac{\text{Monto} \times \text{\% Comisión}}{100}$$
  Además, muestra un aviso informativo indicando el porcentaje y el importe exacto de comisión que se generará, permitiendo ajustar manualmente el campo `trx_commissionamount` si fuera necesario.
- **Modos de Guardado Rápido**:
  - **Guardar y Cargar Otro (Modo Rápido Excel)**: Registra la transacción en el servidor y mantiene al usuario en la misma pantalla, conservando el **Ámbito**, **Tipo de Movimiento**, **Método de Pago** y **Fecha** seleccionados, limpiando únicamente el concepto, monto, persona y notas. Ideal para cargar planillas extensas de movimientos sin cambiar de pantalla.
  - **Guardar y Finalizar**: Registra la operación y regresa al listado general `/admin/user/transactions`.

---

## 5. Comisiones de Vendedores (`/admin/user/seller-commissions`)

El módulo de **Liquidación y Control de Comisiones de Vendedores** consolida todas las ventas (`INGRESO`) que tienen una comisión devengada (`trx_commissionamount > 0`).

### 5.1. Filtros de Liquidación
- **Filtrar por Ámbito**: Permite segmentar las ventas por unidad de negocio o contexto.
- **Filtrar por Vendedor**: Lista automáticamente todas las personas que poseen el rol `VENDEDOR` o una tasa de comisión mayor a `0%`.

### 5.2. KPIs de Rendimiento Comercial
Presenta 3 indicadores clave en tiempo real según el filtro activo:
1. **Total en Ventas Realizadas (`totalSales`)**: Suma total de los importes de venta brutos (`trx_amount`) generados por los vendedores filtrados.
2. **Total Comisiones Ganadas (`totalCommissions`)**: Suma total a liquidar/pagar en concepto de comisiones (`trx_commissionamount`).
3. **Cantidad de Ventas (`salesCount`)**: Número total de operaciones comisionables cerradas.

### 5.3. Tabla Detallada de Liquidación
Desglosa cada operación comisionable mostrando:
- **Fecha de Venta (`trx_date`)**
- **Ámbito (`scp_name`)** con su etiqueta de color correspondiente
- **Vendedor** (nombre completo)
- **Concepto / Detalle de Venta (`trx_concept`)**
- **Monto de Venta (`trx_amount`)**
- **% Aplicado (`prs_commissionrate`)**
- **Comisión Ganada (`trx_commissionamount`)** destacada en una insignia verde para facilitar el control de pago.
