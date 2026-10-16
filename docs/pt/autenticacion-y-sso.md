# Manual do Usuário: Autenticação e Acesso SSO

Este documento descreve em detalhes os fluxos de autenticação, login único (SSO), cadastro de novos usuários, ativação de contas e recuperação de credenciais implementados no **ATSManagement Web App**.

---

## 1. Login (`/auth/login`) e Delegação ao SSO Central

O ponto de entrada principal para os usuários é a rota `/auth/login`. O comportamento do módulo de login depende da configuração de ambiente definida na propriedade `app_login_mode`:

### 1.1. Modo de Autenticação Centralizada (`app_login_mode === 'central'`)
Quando a aplicação está configurada no modo `'central'`, o componente `LoginComponent` delega automaticamente o login ao portal de autenticação centralizado durante sua inicialização (`ngOnInit`):
1. O sistema constrói uma URL de retorno (`returnUrl`) apontando para o receptor local `/auth/sso` (por exemplo: `http://localhost:4201/auth/sso`).
2. Redireciona o navegador para a URL configurada em `environment.central_login_url` anexando o parâmetro `?returnUrl=...`.

### 1.2. Recepção e Validação de Sessão SSO (`/auth/sso`)
Assim que o usuário se autentica no portal central, ele é redirecionado de volta para a rota `/auth/sso?token=<JWT>`. O componente `SsoReceiverComponent` gerencia três estados visuais durante o processamento:
- **`loading` ("Iniciando sesión con tu cuenta central...")**: Estado inicial enquanto lê o parâmetro `token` da URL e invoca o método `verifySsoToken(token)` do serviço `AuthService` (`POST /auth/sso-verify`).
- **`success` ("¡Autenticado! Redirigiendo a tu espacio de trabajo...")**: Quando o backend valida a assinatura do token e retorna os dados da sessão. O sistema armazena a sessão no `SessionStorageService` e redireciona automaticamente para `/admin/user/dashboard`.
- **`error`**: Caso nenhum token seja recebido na URL ou o token seja inválido ou expirado, uma mensagem descritiva do problema é exibida junto com o botão **"Intentar de nuevo"**, que reinicia o fluxo para `/auth/login`.

### 1.3. Modo de Autenticação Local (`app_login_mode === 'local'`)
Se o modo de operação for local, o usuário visualiza o formulário de acesso tradicional:
- **E-mail (`usr_email`)**: Campo obrigatório com validação de formato de e-mail.
- **Senha (`usr_password`)**: Campo obrigatório de senha.
- **Lembrar-me (`remember`)**: Caixa de seleção para persistir a preferência de acesso.
- **Links de suporte**: Acesso direto para **Esqueceu sua senha?** (`/auth/forgot-password`) e **Cadastre-se agora** (`/auth/register`).

---

## 2. Cadastro de Novos Usuários (`/auth/register`)

O formulário de criação de conta em `/auth/register` permite cadastrar um novo usuário na plataforma validando tanto a integridade dos dados quanto a segurança da senha escolhida.

### 2.1. Campos do Formulário
| Campo | Identificador | Validações |
| :--- | :--- | :--- |
| **Nome** | `usr_name` | Obrigatório, mínimo de 2 caracteres. |
| **Sobrenome** | `usr_surname` | Obrigatório, mínimo de 2 caracteres. |
| **Usuário (Nick)** | `usr_nick` | Obrigatório, mínimo de 3 caracteres. |
| **E-mail** | `usr_email` | Obrigatório, formato de e-mail válido. |
| **Senha** | `usr_password` | Obrigatório, mínimo de 8 caracteres e validador personalizado `passwordStrengthValidator`. |
| **Confirmar Senha** | `confirmPassword` | Obrigatório, validador cruzado `confirmationValidator` que verifica correspondência exata com `usr_password`. |

### 2.2. Validador de Força de Senha e Indicador Visual
À medida que o usuário digita sua senha, o componente avalia em tempo real 5 requisitos de segurança:
1. **Pelo menos uma letra maiúscula** (`/[A-Z]/`)
2. **Pelo menos uma letra minúscula** (`/[a-z]/`)
3. **Pelo menos um número** (`/[0-9]/`)
4. **Pelo menos um caractere especial** (`/[!@#$%^&*(),.?":{}|<>]/`)
5. **Mínimo de 8 caracteres de comprimento** (`length >= 8`)

Abaixo do campo de senha, é exibida uma barra de progresso percentual e uma lista interativa de verificação codificada por cores conforme a pontuação alcançada (`passwordStrength`):
- **Fraca (`< 50%`)**: Barra na cor vermelha (`#dc3545`).
- **Média (`50% - 79%`)**: Barra na cor amarela/âmbar (`#ffc107`).
- **Forte (`>= 80%`)**: Barra na cor verde (`#28a745`). A senha só é aceita pelo formulário quando todos os 5 requisitos são integralmente cumpridos (`100%`).

---

## 3. Confirmação e Ativação de Conta

Após concluir o formulário de cadastro com sucesso:
1. **Notificação de Conta Criada (`/auth/account-created/:usr_email`)**: O usuário é redirecionado para uma tela informativa exibindo o endereço de e-mail cadastrado (`usr_email`) e indicando os passos para verificar sua caixa de entrada (e pasta de spam) para ativar a conta. Inclui um atalho direto para voltar a `/auth/login`.
2. **Confirmação via Token (`/auth/account-confirmed/:usr_ConfirmationToken`)**: Ao abrir o link enviado por e-mail, o componente `AccountConfirmedComponent` captura o parâmetro `usr_ConfirmationToken` da rota e executa `UsersService.confirmAccount()` (`PUT /user-confirmation`).
   - Enquanto a solicitação é processada, exibe um indicador de carregamento (*"Confirmando tu cuenta..."*).
   - Se o token for válido, exibe a mensagem de sucesso **¡Cuenta Confirmada!** e habilita o botão para **Iniciar Sesión**.
   - Se o token for inválido ou já tiver sido utilizado, informa o erro na tela.

---

## 4. Recuperação e Redefinição de Senha

O fluxo de recuperação de credenciais divide-se em duas etapas:

### 4.1. Solicitação de Recuperação (`/auth/forgot-password`)
1. O usuário informa seu endereço de e-mail cadastrado no campo `usr_email`.
2. Ao enviar o formulário, invoca-se `UsersService.forgotPassword(email)` (`POST /forgot-password`).
3. O sistema exibe uma confirmação na tela indicando que, caso o e-mail esteja cadastrado, receberá uma mensagem com as instruções e o link temporário de redefinição.

### 4.2. Redefinição de Senha (`/auth/reset-password/:usr_ResetPasswordToken`)
1. O usuário acessa o link recebido por e-mail, o qual contém o token de segurança `usr_ResetPasswordToken`.
2. Na tela de redefinição deve informar:
   - **Nova Senha (`usr_password`)**: Sujeita exatamente às mesmas 5 regras de força e indicadores de cor (`#dc3545`, `#ffc107`, `#28a745`) do cadastro de usuários.
   - **Confirmar Senha (`confirmPassword`)**: Validação de correspondência com a nova senha.
3. Ao confirmar, a requisição é enviada via `UsersService.resetPassword()` (`PUT /reset-password`). Uma vez atualizada a credencial, o sistema exibe uma confirmação e permite retornar a `/auth/login`.
