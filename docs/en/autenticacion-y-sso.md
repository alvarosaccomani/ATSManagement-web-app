# User Manual: Authentication and SSO Access

This document describes in detail the authentication flows, unified Single Sign-On (SSO), new user registration, account activation, and credential recovery implemented in **ATSManagement Web App**.

---

## 1. Login (`/auth/login`) and Central SSO Delegation

The main entry point for users is the `/auth/login` route. The behavior of the login module depends on the environment configuration defined in the `app_login_mode` property:

### 1.1. Centralized Authentication Mode (`app_login_mode === 'central'`)
When the application is configured in `'central'` mode, the `LoginComponent` automatically delegates login to the centralized authentication portal during initialization (`ngOnInit`):
1. The system builds a return URL (`returnUrl`) pointing to the local receiver `/auth/sso` (for example: `http://localhost:4201/auth/sso`).
2. It redirects the browser to the URL configured in `environment.central_login_url`, appending the `?returnUrl=...` parameter.

### 1.2. SSO Session Reception and Validation (`/auth/sso`)
Once the user authenticates on the central portal, they are redirected back to the `/auth/sso?token=<JWT>` route. The `SsoReceiverComponent` manages three visual states during processing:
- **`loading` ("Iniciando sesión con tu cuenta central...")**: Initial state while reading the `token` parameter from the URL and invoking the `verifySsoToken(token)` method of `AuthService` (`POST /auth/sso-verify`).
- **`success` ("¡Autenticado! Redirigiendo a tu espacio de trabajo...")**: When the backend validates the token signature and returns the session data. The system stores the session in `SessionStorageService` and automatically redirects to `/admin/user/dashboard`.
- **`error`**: If no token is received in the URL or if the token is invalid or expired, a descriptive error message is displayed along with the **"Intentar de nuevo"** button, which restarts the flow toward `/auth/login`.

### 1.3. Local Authentication Mode (`app_login_mode === 'local'`)
If the operating mode is local, the user sees the traditional login form:
- **Email (`usr_email`)**: Required field with email format validation.
- **Password (`usr_password`)**: Required password field.
- **Remember me (`remember`)**: Checkbox to persist the login preference.
- **Support links**: Direct access to **Forgot your password?** (`/auth/forgot-password`) and **Register now** (`/auth/register`).

---

## 2. New User Registration (`/auth/register`)

The account creation form at `/auth/register` allows registering a new user on the platform while validating both data integrity and password security.

### 2.1. Form Fields
| Field | Identifier | Validations |
| :--- | :--- | :--- |
| **First Name** | `usr_name` | Required, minimum 2 characters. |
| **Last Name** | `usr_surname` | Required, minimum 2 characters. |
| **Username (Nick)** | `usr_nick` | Required, minimum 3 characters. |
| **Email** | `usr_email` | Required, valid email format. |
| **Password** | `usr_password` | Required, minimum 8 characters and custom `passwordStrengthValidator`. |
| **Confirm Password** | `confirmPassword` | Required, cross-field `confirmationValidator` verifying exact match with `usr_password`. |

### 2.2. Password Strength Validator and Visual Indicator
As the user types their password, the component evaluates 5 security requirements in real time:
1. **At least one uppercase letter** (`/[A-Z]/`)
2. **At least one lowercase letter** (`/[a-z]/`)
3. **At least one number** (`/[0-9]/`)
4. **At least one special character** (`/[!@#$%^&*(),.?":{}|<>]/`)
5. **Minimum 8 characters in length** (`length >= 8`)

Below the password field, a percentage progress bar and an interactive color-coded checklist are displayed according to the score achieved (`passwordStrength`):
- **Weak (`< 50%`)**: Red progress bar (`#dc3545`).
- **Medium (`50% - 79%`)**: Yellow/amber progress bar (`#ffc107`).
- **Strong (`>= 80%`)**: Green progress bar (`#28a745`). The password is only accepted by the form when all 5 requirements are fully met (`100%`).

---

## 3. Account Confirmation and Activation

After successfully completing the registration form:
1. **Account Created Notification (`/auth/account-created/:usr_email`)**: The user is redirected to an informational screen showing the registered email address (`usr_email`) and instructions to check their inbox (and spam folder) to activate the account. Includes a direct shortcut to return to `/auth/login`.
2. **Confirmation via Token (`/auth/account-confirmed/:usr_ConfirmationToken`)**: Upon opening the link sent by email, the `AccountConfirmedComponent` captures the `usr_ConfirmationToken` route parameter and executes `UsersService.confirmAccount()` (`PUT /user-confirmation`).
   - While the request is processed, a loading indicator is displayed (*"Confirmando tu cuenta..."*).
   - If the token is valid, it shows the success message **¡Cuenta Confirmada!** and enables the **Iniciar Sesión** button.
   - If the token is invalid or has already been used, it displays the error on screen.

---

## 4. Password Recovery and Reset

The credential recovery flow is divided into two stages:

### 4.1. Recovery Request (`/auth/forgot-password`)
1. The user enters their registered email address in the `usr_email` field.
2. Submitting the form invokes `UsersService.forgotPassword(email)` (`POST /forgot-password`).
3. The system displays an on-screen confirmation indicating that, if the email is registered, they will receive a message with instructions and a temporary reset link.

### 4.2. Password Reset (`/auth/reset-password/:usr_ResetPasswordToken`)
1. The user opens the link received by email, which contains the security token `usr_ResetPasswordToken`.
2. On the reset screen, the user must enter:
   - **New Password (`usr_password`)**: Subject to the exact same 5 strength rules and color indicators (`#dc3545`, `#ffc107`, `#28a745`) as user registration.
   - **Confirm Password (`confirmPassword`)**: Validation matching the new password.
3. Upon confirmation, the request is sent via `UsersService.resetPassword()` (`PUT /reset-password`). Once the credential is updated, the system displays a confirmation and allows returning to `/auth/login`.
