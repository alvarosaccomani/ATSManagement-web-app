# Manual do Usuário: Cartões, Vouchers, Parcelas e Parâmetros

Este manual documenta os módulos de administração de cartões bancários, registro de comprovantes de compra (vouchers) com cálculo financeiro de parcelas, acompanhamento de vencimentos de parcelas, fechamento de períodos de faturamento, pagamentos de faturas e manutenção de catálogos paramétricos.

---

## 1. Administração de Cartões (`/admin/user/cards` e `/admin/user/card/new`)

O módulo de **Cartões** gerencia os cartões de crédito e débito associados aos bancos, bandeiras e tipos configurados no sistema.

### 1.1. Funcionalidades da Listagem (`/admin/user/cards`)
- **Mascaramento de Segurança (`maskCardNumber`)**: Os números de cartão são exibidos mascarados no formato `**** **** **** 1234`, expondo apenas os últimos 4 dígitos.
- **Alertas de Vencimento (`isExpired`)**: O sistema compara a data de expiração (`crd_expirationdate`) com a data atual e destaca visualmente os cartões vencidos.
- **Exibição de Limite de Crédito**: Mostra o limite atribuído (`crd_creditlimit`) para cartões de crédito.

### 1.2. Formulário de Criação e Edição (`/admin/user/card/new` e `/admin/user/card/edit/:crd_uuid`)
- **Extração Automática dos Últimos 4 Dígitos**: À medida que o usuário digita o número completo do cartão (`crd_maskednumber`, entre 13 e 19 dígitos numéricos), o formulário extrai e preenche automaticamente o campo somente leitura **Últimos 4 dígitos (`crd_last4digits`)**.
- **Regra de Negócio para Cartões de Débito (`tycrd_uuid === '1'`)**: Quando o tipo de cartão **Débito** (`tycrd_uuid === '1'`) é selecionado, o formulário define automaticamente o **Limite de Crédito (`crd_creditlimit`)** como `0` e desabilita o controle para evitar atribuir limites de crédito a um cartão de débito. Ao selecionar **Crédito**, o campo é habilitado novamente.
- **Associações**: Seleção de **Tipo de Cartão (`tycrd_uuid`)**, **Bandeira (`brcrd_uuid`)**, **Banco Emissor (`ban_uuid`)**, data de validade e status ativo/inativo.

---

## 2. Administração de Vouchers (`/admin/user/vouchers` e `/admin/user/voucher/new`)

O módulo de **Vouchers** permite registrar e auditar cada comprovante de operação realizado com cartão.

### 2.1. Gestão e Ações Rápidas (`/admin/user/vouchers`)
- Permite visualizar o número de autorização, transação, valor, estabelecimento, CUIT, quantidade de parcelas, período e indicadores de status (*Pendente*, *Confirmado*, *Rejeitado*).
- **Ações Rápidas na Linha**: Para os vouchers com status *Pendente* (`stovou_uuid === '1'`), a listagem oferece botões de ação direta para **Confirmar Voucher (`confirmVoucher`)** (altera o status para `'2'`) ou **Rejeitar Voucher (`rejectVoucher`)** (altera o status para `'3'`) sem necessidade de abrir o formulário de edição.

### 2.2. Formulário de Voucher e Calculadora Financeira (`/admin/user/voucher/new`)
O formulário de criação/edição de voucher inclui:
- **Dados do Comprovante**: Número de autorização (`vou_authorizationnumber`), número de transação (`vou_transactionnumber`), data e hora (`vou_datetime`), valor base (`vou_amount`), nome do estabelecimento (`vou_commerce`), CUIT (`vou_cuit`, validado com formato `XX-XXXXXXXX-X` de 11 dígitos), referência de imagem (`vou_imagereference`) e notas (`vou_notes`).
- **Classificação**: Período de faturamento (`per_uuid`), Tipo de Operação (`tyop_uuid`), Método de Pagamento (`paym_uuid`) e Status do Voucher (`stovou_uuid`).
- **Switch de Parcelas (`vou_installments`)**: Ao ativar o interruptor de pagamento parcelado:
  - São habilitados os controles **Quantidade de Parcelas (`vou_installmentcount`)** (de 2 a 60 parcelas) e **Taxa de Juros (`vou_interestrate`)** (`0%` a `100%`).
  - **Calculadora ao Vivo de Parcelas e Juros**: O formulário exibe um painel de resumo financeiro que calcula em tempo real:
    - **Valor por Parcela (`calculateInstallmentAmount`)**:
      $$\text{Valor da Parcela} = \frac{\text{Valor Base} \times \left(1 + \frac{\text{Taxa de Juros}}{100}\right)}{\text{Quantidade de Parcelas}}$$
    - **Total com Juros (`calculateTotalWithInterest`)**: Valor final financiado somando o acréscimo percentual.
- **Geração Automática de Parcelas (`fees`)**: Ao salvar um novo voucher com o switch de parcelas ativo (`vou_installments && vou_installmentcount > 1`), o componente gera automaticamente a lista de parcelas mensais (`fees`), atribuindo a cada parcela seu número sequencial (`vf_quotanumber`), seu valor calculado (`vf_quotaamount`), sua data de vencimento escalonada mês a mês (`vf_expirationdate`) e o status inicial *Pendente* (`stovf_uuid: '1'`).

---

## 3. Parcelas de Vouchers (`/admin/user/vouchers-fees` e `/admin/user/voucher-fee/new`)

O módulo de **Parcelas de Vouchers** permite acompanhar detalhadamente o cronograma de vencimentos de cada compra financiada.

- **Indicador de Atraso (`isOverdue`)**: Identifica automaticamente as parcelas cuja data de vencimento (`vf_expirationdate`) já passou e que ainda permanecem com status *Pendente* (`stovf_uuid === '1'`).
- **Cálculo de Dias Restantes (`getDaysLeft`)**: Calcula a diferença em dias corridos entre a data atual e o vencimento da parcela para alertar sobre vencimentos próximos.
- **Ações Rápidas de Pagamento e Estorno**:
  - **Pagar Parcela (`payQuota`)**: Marca instantaneamente uma parcela pendente ou vencida como **Paga** (`stovf_uuid = '2'`) e registra a data atual como data efetiva de pagamento (`vf_paymentdate`).
  - **Reverter Pagamento (`revertPayment`)**: Caso uma parcela tenha sido marcada como paga por engano, permite restituí-la ao status **Pendente** (`stovf_uuid = '1'`) limpando sua data de pagamento.

---

## 4. Períodos de Faturamento (`/admin/user/periods` e `/admin/user/period/new`)

Os **Períodos** representam os ciclos mensais de faturamento ou faturas de cada cartão bancário.

- **Validação Cronológica Estrita (`validatePeriodDates`)**: No formulário de criação e edição (`/admin/user/period/new`), o sistema valida em tempo real a coerência temporal das três datas do ciclo:
  1. A **Data de Início (`per_startdate`)** deve ser estritamente anterior à **Data de Fim / Fechamento (`per_enddate`)** (`startDate < endDate`).
  2. A **Data de Fim / Fechamento (`per_enddate`)** deve ser estritamente anterior à **Data de Vencimento (`per_duedate`)** (`endDate < dueDate`).
- **Fechamento Rápido de Período (`closePeriod`)**: Na listagem de períodos (`/admin/user/periods`), os ciclos que se encontram com status *Aberto* (`stoper_uuid === '1'`) dispõem de um botão de ação direta para fechar a fatura, alterando seu status para *Fechado* (`stoper_uuid = '2'`).

---

## 5. Períodos de Pagamento (`/admin/user/payment-periods` e `/admin/user/payment-period/new`)

O módulo de **Períodos de Pagamento** registra os desembolsos realizados para quitar total ou parcialmente as faturas dos cartões.

- Registra a data de pagamento (`payp_paymentdate`), o valor pago (`payp_amountpaid`), o método de pagamento utilizado (`paym_uuid`), a referência ou comprovante bancário (`payp_paymentreference`), notas e o status do pagamento (`stopayp_uuid`).
- **Confirmação e Rejeição Rápida na Listagem**: Quando um pagamento se encontra com status *Processando* (`stopayp_uuid === '1'`), a tabela oferece ações diretas para:
  - **Confirmar Pagamento (`confirmPayment`)**: Atualiza o status para *Confirmado* (`stopayp_uuid = '2'`).
  - **Rejeitar Pagamento (`rejectPayment`)**: Atualiza o status para *Rejeitado* (`stopayp_uuid = '3'`).

---

## 6. Catálogos Paramétricos (Submenu Parâmetros)

Sob o submenu **Parâmetros** da barra lateral encontram-se os **9 módulos mestres** que alimentam as listas suspensas e regras de classificação de toda a plataforma. Todos eles contam com operações completas de listagem, criação, edição e exclusão com confirmação:

| # | Módulo Paramétrico | Rota de Listagem | Rota de Criação / Edição | Finalidade Principal |
| :- | :--- | :--- | :--- | :--- |
| 1 | **Bancos** | `/admin/user/banks` | `/admin/user/bank/new` | Instituições financeiras emissoras de cartões (`ban_name`, `ban_code`, `ban_active`). |
| 2 | **Tipos de Cartões** | `/admin/user/types-cards` | `/admin/user/type-card/new` | Classificação operacional de cartões, como *Débito* ou *Crédito* (`tycrd_name`). |
| 3 | **Bandeiras de Cartões** | `/admin/user/brands-cards` | `/admin/user/brand-card/new` | Redes e bandeiras emissoras como *Visa*, *Mastercard*, *American Express* (`brcrd_name`). |
| 4 | **Métodos de Pagamento** | `/admin/user/payment-methods` | `/admin/user/payment-method/new` | Meios de quitação habilitados como *Dinheiro*, *Transferência*, *Débito Automático* (`paym_name`). |
| 5 | **Tipos de Operações** | `/admin/user/type-operations` | `/admin/user/type-operation/new` | Natureza da transação do voucher, como *Compra em Estabelecimento*, *Assinatura*, *Estorno* (`tyop_name`). |
| 6 | **Status de Períodos** | `/admin/user/status-periods` | `/admin/user/status-period/new` | Estados do ciclo de faturamento: *Aberto*, *Fechado*, *Pago*, *Vencido* (`stoper_name`). |
| 7 | **Status de Vouchers** | `/admin/user/status-vouchers` | `/admin/user/status-voucher/new` | Estados de auditoria do comprovante: *Pendente*, *Confirmado*, *Rejeitado*, *Conciliado* (`stovou_name`). |
| 8 | **Status de Parcelas** | `/admin/user/status-vouchers-fees` | `/admin/user/status-voucher-fee/new` | Estados de cada parcela individual: *Pendente*, *Paga*, *Vencida*, *Cancelada* (`stovf_name`). |
| 9 | **Status de Períodos de Pagamento** | `/admin/user/status-payment-periods` | `/admin/user/status-payment-period/new` | Estados dos pagamentos de fatura: *Processando*, *Confirmado*, *Rejeitado*, *Reembolsado* (`stopayp_name`). |
