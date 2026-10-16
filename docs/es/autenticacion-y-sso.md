# Manual de Usuario: Autenticación y Acceso SSO

Este documento describe en detalle los flujos de autenticación, inicio de sesión unificado (SSO), registro de nuevos usuarios, activación de cuentas y recuperación de credenciales implementados en **ATSManagement Web App**.

---

## 1. Inicio de Sesión (`/auth/login`) y Delegación al SSO Central

El punto de entrada principal para los usuarios es la ruta `/auth/login`. El comportamiento del módulo de inicio de sesión depende de la configuración de entorno definida en la propiedad `app_login_mode`:

### 1.1. Modo de Autenticación Centralizada (`app_login_mode === 'central'`)
Cuando la aplicación se encuentra configurada en modo `'central'`, el componente `LoginComponent` delega automáticamente el inicio de sesión al portal de autenticación centralizado durante su inicialización (`ngOnInit`):
1. El sistema construye una URL de retorno (`returnUrl`) apuntando al receptor local `/auth/sso` (por ejemplo: `http://localhost:4201/auth/sso`).
2. Redirige el navegador hacia la URL configurada en `environment.central_login_url` adjuntando el parámetro `?returnUrl=...`.

### 1.2. Recepción y Validación de Sesión SSO (`/auth/sso`)
Una vez que el usuario se autentica en el portal central, es redirigido de regreso a la ruta `/auth/sso?token=<JWT>`. El componente `SsoReceiverComponent` gestiona tres estados visuales durante el procesamiento:
- **`loading` ("Iniciando sesión con tu cuenta central...")**: Estado inicial mientras lee el parámetro `token` de la URL e invoca el método `verifySsoToken(token)` del servicio `AuthService` (`POST /auth/sso-verify`).
- **`success` ("¡Autenticado! Redirigiendo a tu espacio de trabajo...")**: Cuando el backend valida la firma del token y devuelve los datos de sesión. El sistema almacena la sesión en `SessionStorageService` y redirige automáticamente a `/admin/user/dashboard`.
- **`error`**: Si no se recibe un token en la URL o si el token es inválido o ha expirado, se muestra el mensaje descriptivo del problema junto con el botón **"Intentar de nuevo"**, el cual reinicia el flujo hacia `/auth/login`.

### 1.3. Modo de Autenticación Local (`app_login_mode === 'local'`)
Si el modo de operación es local, el usuario visualiza el formulario de acceso tradicional:
- **Correo electrónico (`usr_email`)**: Campo obligatorio con validación de formato de correo electrónico.
- **Contraseña (`usr_password`)**: Campo obligatorio de contraseña.
- **Recordarme (`remember`)**: Casilla de verificación para persistir la preferencia de acceso.
- **Enlaces de asistencia**: Acceso directo a **¿Olvidaste tu contraseña?** (`/auth/forgot-password`) y **Regístrate ahora** (`/auth/register`).

---

## 2. Registro de Nuevos Usuarios (`/auth/register`)

El formulario de alta de cuenta en `/auth/register` permite registrar un nuevo usuario en la plataforma validando tanto la integridad de los datos como la seguridad de la contraseña elegida.

### 2.1. Campos del Formulario
| Campo | Identificador | Validaciones |
| :--- | :--- | :--- |
| **Nombre** | `usr_name` | Obligatorio, mínimo 2 caracteres. |
| **Apellido** | `usr_surname` | Obligatorio, mínimo 2 caracteres. |
| **Usuario (Nick)** | `usr_nick` | Obligatorio, mínimo 3 caracteres. |
| **Correo Electrónico** | `usr_email` | Obligatorio, formato de email válido. |
| **Contraseña** | `usr_password` | Obligatorio, mínimo 8 caracteres y validador personalizado `passwordStrengthValidator`. |
| **Confirmar Contraseña** | `confirmPassword` | Obligatorio, validador cruzado `confirmationValidator` que verifica coincidencia exacta con `usr_password`. |

### 2.2. Validador de Fortaleza de Contraseña e Indicador Visual
A medida que el usuario escribe su contraseña, el componente evalúa en tiempo real 5 requisitos de seguridad:
1. **Al menos una letra mayúscula** (`/[A-Z]/`)
2. **Al menos una letra minúscula** (`/[a-z]/`)
3. **Al menos un número** (`/[0-9]/`)
4. **Al menos un carácter especial** (`/[!@#$%^&*(),.?":{}|<>]/`)
5. **Mínimo 8 caracteres de longitud** (`length >= 8`)

Debajo del campo de contraseña se despliega una barra de progreso porcentual y una lista interactiva de verificación codificada por colores según el puntaje alcanzado (`passwordStrength`):
- **Débil (`< 50%`)**: Barra en color rojo (`#dc3545`).
- **Media (`50% - 79%`)**: Barra en color amarillo/ámbar (`#ffc107`).
- **Fuerte (`>= 80%`)**: Barra en color verde (`#28a745`). La contraseña solo es aceptada por el formulario cuando los 5 requisitos se cumplen en su totalidad (`100%`).

---

## 3. Confirmación y Activación de Cuenta

Tras completar el formulario de registro con éxito:
1. **Notificación de Cuenta Creada (`/auth/account-created/:usr_email`)**: El usuario es redirigido a una pantalla informativa que muestra la dirección de correo electrónico registrada (`usr_email`) e indica los pasos para revisar su bandeja de entrada (y carpeta de correo no deseado) para activar la cuenta. Incluye un acceso directo para volver a `/auth/login`.
2. **Confirmación mediante Token (`/auth/account-confirmed/:usr_ConfirmationToken`)**: Al abrir el enlace enviado por correo electrónico, el componente `AccountConfirmedComponent` captura el parámetro `usr_ConfirmationToken` de la ruta y ejecuta `UsersService.confirmAccount()` (`PUT /user-confirmation`).
   - Mientras se procesa la solicitud, muestra un indicador de carga (*"Confirmando tu cuenta..."*).
   - Si el token es válido, muestra el mensaje de éxito **¡Cuenta Confirmada!** y habilita el botón para **Iniciar Sesión**.
   - Si el token es inválido o ya fue utilizado, informa el error en pantalla.

---

## 4. Recuperación y Restablecimiento de Contraseña

El flujo de recuperación de credenciales se divide en dos etapas:

### 4.1. Solicitud de Recuperación (`/auth/forgot-password`)
1. El usuario ingresa su dirección de correo electrónico registrada en el campo `usr_email`.
2. Al enviar el formulario, se invoca `UsersService.forgotPassword(email)` (`POST /forgot-password`).
3. El sistema muestra una confirmación en pantalla indicando que, si el correo se encuentra registrado, recibirá un mensaje con las instrucciones y el enlace temporal de restablecimiento.

### 4.2. Restablecimiento de Contraseña (`/auth/reset-password/:usr_ResetPasswordToken`)
1. El usuario accede al enlace recibido por correo, el cual contiene el token de seguridad `usr_ResetPasswordToken`.
2. En la pantalla de restablecimiento debe ingresar:
   - **Nueva Contraseña (`usr_password`)**: Sujeta a exactamente las mismas 5 reglas de fortaleza e indicadores de color (`#dc3545`, `#ffc107`, `#28a745`) que el registro de usuarios.
   - **Confirmar Contraseña (`confirmPassword`)**: Validación de coincidencia con la nueva contraseña.
3. Al confirmar, se envía la petición mediante `UsersService.resetPassword()` (`PUT /reset-password`). Una vez actualizada la credencial, el sistema muestra una confirmación y permite regresar a `/auth/login`.
