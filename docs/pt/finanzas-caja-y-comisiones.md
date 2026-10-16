# Manual do Usuário: Dashboard, Caixa, Escopos e Comissões

Este manual detalha a gestão operacional financeira no **ATSManagement Web App**, abrangendo o painel de controle principal, a separação contábil por escopos (contextos), o diretório de pessoas/contatos, o registro de movimentações de caixa e a liquidação de comissões de vendedores.

---

## 1. Dashboard Financeiro (`/admin/user/dashboard`)

O **Dashboard Financeiro e de Gestão** oferece uma visão consolidada em tempo real do estado de caixa e da atividade recente do usuário.

### 1.1. Filtro por Escopo e Ações Rápidas
No cabeçalho do painel encontram-se:
- **Seletor de Escopo (`selectedScopeUuid`)**: Permite alternar entre **"Todos os Escopos (Global)"** (`ALL`) ou filtrar as métricas exclusivamente para um escopo específico (por exemplo: *Pessoal*, *Casa*, *Projeto*).
- **Botão `+ Criar Escopo`**: Navega diretamente para o formulário de criação de contextos (`/admin/user/scope/new`).
- **Botão `+ Nova Movimentação`**: Abre o formulário de registro de receitas, despesas ou transferências (`/admin/user/transaction/new`).

### 1.2. Indicadores-Chave (KPIs)
O painel superior apresenta 4 cartões de resumo financeiro calculados dinamicamente conforme o filtro selecionado:
1. **Total de Receitas**: Somatório de todas as movimentações do tipo `INGRESO` (destacado em verde `#28a745`).
2. **Total de Despesas**: Somatório de todas as movimentações do tipo `EGRESO` (destacado em vermelho `#dc3545`).
3. **Saldo Líquido (Caixa Atual)**: Diferença líquida entre receitas e despesas (`totalIncome - totalExpense`), destacando visualmente se o saldo global é positivo (`#28a745`) ou negativo (`#dc3545`).
4. **Total de Movimentações Registradas**: Contador total de operações contabilizadas na visualização ativa.

### 1.3. Tabelas de Resumo Operacional
Abaixo dos KPIs encontram-se dois painéis complementares:
- **Saldos por Escopo (Contextos)**: Tabela comparativa que detalha para cada escopo sua etiqueta de cor (`scp_color`), total de **Receitas**, total de **Despesas** e seu **Saldo Líquido** individual.
- **Últimas Movimentações Registradas**: Lista das 10 transações mais recentes ordenadas cronologicamente, exibindo data, conceito/pessoa associada, valor e uma *badge* de tipo codificada por cores:
  - `INGRESO` (Receita): Etiqueta verde (`#d4edda` / texto `#155724`).
  - `EGRESO` (Despesa): Etiqueta vermelha (`#f8d7da` / texto `#721c24`).
  - `TRANSFERENCIA` (Transferência): Etiqueta azul (`#cce5ff` / texto `#004085`).

---

## 2. Gestão de Escopos (`/admin/user/scopes`)

Os **Escopos** permitem separar a contabilidade de diferentes ambientes financeiros dentro de uma mesma conta de usuário (por exemplo, finanças pessoais, um empreendimento comercial ou despesas compartilhadas da residência).

### 2.1. Listagem e Ações (`/admin/user/scopes`)
Exibe uma grade com todos os escopos criados, incluindo amostra visual de cor, nome, descrição, indicador de compartilhamento (`Sim` / `Não`), status (`Ativo` / `Inativo`) e data de criação. Permite editar cada registro ou excluí-lo após confirmação em modal.

### 2.2. Criação e Edição (`/admin/user/scope/new` e `/admin/user/scope/edit/:scp_uuid`)
O formulário de escopo conta com os seguintes controles:
- **Nome do Escopo (`scp_name`)**: Obrigatório (por exemplo: *Pessoal*, *Casa*, *Projeto A*).
- **Descrição (`scp_description`)**: Explicação opcional da finalidade do contexto.
- **Cor Identificadora (`scp_color`)**: Seletor nativo de cor (`input type="color"`, padrão `#1890ff`) utilizado nas etiquetas do Dashboard e nas listagens.
- **É Compartilhado? (`scp_isshared`)**: Interruptor (*switch*) para indicar se múltiplos usuários ou colaboradores participam deste escopo.
- **Status (`scp_active`)**: Interruptor para habilitar ou desabilitar o escopo sem perder seu histórico contábil.

---

## 3. Gestão de Pessoas e Contatos (`/admin/user/persons`)

O módulo de **Pessoas e Contatos** centraliza o cadastro de terceiros vinculados às operações de cada escopo (vendedores, clientes, sócios, fornecedores, etc.).

### 3.1. Filtros do Diretório (`/admin/user/persons`)
A visualização principal inclui dois filtros combináveis em tempo real:
- **Filtrar por Escopo (`selectedScope`)**: Filtra contatos pertencentes a um escopo específico ou exibe `ALL`.
- **Filtrar por Papel (`selectedRole`)**: Permite isolar rapidamente contatos conforme sua classificação (`VENDEDOR`, `SOCIO`, `CLIENTE`, `PROVEEDOR`, `AMIGO`, `OTRO`).

### 3.2. Formulário de Pessoa (`/admin/user/person/new` e `/admin/user/person/edit/:prs_uuid`)
- **Escopo (`scp_uuid`)**: Contexto ao qual o contato pertence.
- **Nome (`prs_name`)** e **Sobrenome (`prs_surname`)**: Nome obrigatório e sobrenome opcional (caso seja cadastrada uma razão social ou entidade).
- **CUIT / CUIL / DNI (`prs_taxid`)**: Identificador fiscal ou documento de identidade.
- **Papéis (`prs_roles`)**: Seletor múltiplo (`nzMode="multiple"`) que permite atribuir um ou vários papéis simultâneos à mesma pessoa:
  - `VENDEDOR`, `SOCIO`, `CLIENTE`, `PROVEEDOR`, `AMIGO`, `OTRO`.
- **% Comissão por Venda (`prs_commissionrate`)**: Percentual numérico (`0` a `100`, com passo `0.5`). Se a pessoa atuar como vendedor, esse valor será aplicado automaticamente ao registrar receitas associadas a ela.
- **Telefone (`prs_phone`)**, **E-mail (`prs_email`)**, **Notas (`prs_notes`)** e **Status (`prs_active`)**.

---

## 4. Movimentações de Caixa (`/admin/user/transactions`)

O módulo de **Movimentações de Caixa (Livro Razão)** registra todas as entradas, saídas e transferências de dinheiro.

### 4.1. Busca e Filtragem Combinada (`/admin/user/transactions`)
Permite auditar o histórico combinando três critérios simultâneos:
1. **Escopo**: Todos ou um contexto específico.
2. **Tipo de Movimentação**: `INGRESO`, `EGRESO` ou `TRANSFERENCIA`.
3. **Busca por Texto**: Filtra instantaneamente correspondências no conceito (`trx_concept`), notas (`trx_notes`) ou nome/sobrenome da pessoa associada.

### 4.2. Registro e Edição de Movimentações (`/admin/user/transaction/new` e `/admin/user/transaction/edit/:trx_uuid`)
O formulário adapta suas validações e cálculos de forma reativa conforme os dados inseridos:
- **Escopo (`scp_uuid`)**: Ao selecionar um escopo, o sistema filtra automaticamente a lista de pessoas disponíveis para exibir apenas os contatos daquele escopo.
- **Tipo de Movimentação (`trx_type`)**:
  - `INGRESO` (Entrada de dinheiro / Receita)
  - `EGRESO` (Saída / Despesa / Pagamento)
  - `TRANSFERENCIA` (Entre contas próprias)
- **Validação Dinâmica em Transferências**: Quando o usuário seleciona `TRANSFERENCIA`, o formulário exibe a seção de contas bancárias/cartões e torna **obrigatório** o campo **Conta / Cartão de Destino (`target_crduuid`)** por meio de validadores dinâmicos, permitindo também indicar a **Conta / Cartão de Origem (`source_crduuid`)**.
- **Cálculo Automático de Comissão**: Quando a movimentação é do tipo `INGRESO` e é selecionada uma **Pessoa Associada (`prs_uuid`)** que possui percentual de comissão configurado (`prs_commissionrate > 0`), o sistema calcula automaticamente a comissão ao informar o valor:
  $$\text{Comissão Calculada} = \frac{\text{Valor} \times \text{\% Comissão}}{100}$$
  Além disso, exibe um aviso informativo indicando o percentual e o valor exato da comissão que será gerada, permitindo ajustar manualmente o campo `trx_commissionamount` se necessário.
- **Modos de Salvamento Rápido**:
  - **Salvar e Adicionar Outro (Modo Rápido Excel)**: Registra a transação no servidor e mantém o usuário na mesma tela, preservando o **Escopo**, **Tipo de Movimentação**, **Método de Pagamento** e **Data** selecionados, limpando apenas o conceito, valor, pessoa e notas. Ideal para lançar planilhas extensas de movimentações sem trocar de tela.
  - **Salvar e Finalizar**: Registra a operação e retorna à listagem geral `/admin/user/transactions`.

---

## 5. Comissões de Vendedores (`/admin/user/seller-commissions`)

O módulo de **Liquidação e Controle de Comissões de Vendedores** consolida todas as vendas (`INGRESO`) que possuem uma comissão apurada (`trx_commissionamount > 0`).

### 5.1. Filtros de Liquidação
- **Filtrar por Escopo**: Permite segmentar as vendas por unidade de negócio ou contexto.
- **Filtrar por Vendedor**: Lista automaticamente todas as pessoas que possuem o papel `VENDEDOR` ou uma taxa de comissão superior a `0%`.

### 5.2. KPIs de Desempenho Comercial
Apresenta 3 indicadores-chave em tempo real conforme o filtro ativo:
1. **Total em Vendas Realizadas (`totalSales`)**: Soma total dos valores brutos de venda (`trx_amount`) gerados pelos vendedores filtrados.
2. **Total de Comissões Ganhas (`totalCommissions`)**: Soma total a liquidar/pagar a título de comissões (`trx_commissionamount`).
3. **Quantidade de Vendas (`salesCount`)**: Número total de operações comissionáveis concluídas.

### 5.3. Tabela Detalhada de Liquidação
Detalha cada operação comissionável exibindo:
- **Data da Venda (`trx_date`)**
- **Escopo (`scp_name`)** com sua respectiva etiqueta de cor
- **Vendedor** (nome completo)
- **Conceito / Detalhe da Venda (`trx_concept`)**
- **Valor da Venda (`trx_amount`)**
- **% Aplicado (`prs_commissionrate`)**
- **Comissão Ganha (`trx_commissionamount`)** destacada em um selo verde para facilitar o controle de pagamento.
