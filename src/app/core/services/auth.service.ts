import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Servicio encargado de gestionar la autenticación, el registro, la recuperación de contraseña y la verificación de Central SSO.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /**
   * Inicializa el servicio de autenticación.
   *
   * @param _http Instancia de `HttpClient` de Angular.
   */
  constructor(private _http: HttpClient) { }

  /**
   * Registra una nueva cuenta de usuario asociada al código de aplicación `Management`.
   *
   * @param user Carga útil de registro con los datos del usuario y su contraseña.
   * @returns Un observable que emite la respuesta del registro.
   */
  public singup(user: any): Observable<any> {
    const userWithApp = { ...user, app_cod: 'Management' };
    const params = JSON.stringify(userWithApp);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}register`, params, { headers });
  }

  /**
   * Confirma y activa una cuenta de usuario recién creada utilizando su token de confirmación por correo electrónico.
   *
   * @param token Token de confirmación recibido por correo electrónico.
   * @returns Un observable que emite el resultado de la confirmación.
   */
  public confirmAccount(token: string): Observable<any> {
    const params = JSON.stringify({ token });
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}confirm-account`, params, { headers });
  }

  /**
   * Solicita un correo electrónico de restablecimiento de contraseña para la dirección de correo especificada.
   *
   * @param usr_email Dirección de correo electrónico registrada del usuario.
   * @returns Un observable que emite el estado de la solicitud de recuperación de contraseña.
   */
  public forgotPassword(usr_email: string): Observable<any> {
    const params = JSON.stringify({ usr_email, app_cod: 'Management' });
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}forgot-password`, params, { headers });
  }

  /**
   * Restablece la contraseña de un usuario utilizando un token válido de restablecimiento y la nueva contraseña.
   *
   * @param payload Objeto que contiene el token de restablecimiento y la nueva contraseña.
   * @returns Un observable que emite el resultado del restablecimiento de contraseña.
   */
  public resetPassword(payload: any): Observable<any> {
    const params = JSON.stringify(payload);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}reset-password`, params, { headers });
  }

  /**
   * Autentica a un usuario con credenciales locales (`usr_email` y `usr_password`).
   *
   * @param user Objeto de credenciales.
   * @param gettoken Indicador opcional para solicitar un token JWT firmado en la respuesta.
   * @returns Un observable que emite la identidad del usuario y el token de sesión.
   */
  public login(user: any, gettoken: string | null = null): Observable<any> {
    if (gettoken != null) {
      user.gettoken = gettoken;
    }
    const params = JSON.stringify(user);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}login`, params, { headers });
  }

  /**
   * Verifica un token de Central SSO con el backend y lo intercambia por una sesión local.
   *
   * @param ssoToken Token JWT recibido desde el portal de Central SSO.
   * @returns Un observable que emite la identidad del usuario verificada y el token de sesión.
   */
  public verifySSOToken(ssoToken: string): Observable<any> {
    const body = JSON.stringify({ sso_token: ssoToken });
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}auth/sso/verify`, body, { headers });
  }

  /**
   * Obtiene la configuración dinámica de SSO y autenticación desde el backend.
   *
   * @returns Un observable que emite la configuración de autenticación de la aplicación.
   */
  public getAppConfig(): Observable<any> {
    return this._http.get<any>(`${environment.apiUrl}auth/sso/config`);
  }

  /**
   * Registra una entrada de auditoría de autenticación en el backend.
   *
   * @param usr_uuid Identificador único del usuario autenticado.
   * @param app_cod Identificador del código de la aplicación.
   * @param action Tipo de evento de autenticación (por defecto `'LOGIN_SUCCESS'`).
   * @returns Un observable que emite el resultado de la creación del registro de auditoría.
   */
  public logAuth(usr_uuid: string, app_cod: string, action: string = 'LOGIN_SUCCESS'): Observable<any> {
    const body = {
      usr_uuid,
      app_cod,
      usraulo_action: action,
      usraulo_ipaddress: '0.0.0.0',
      usraulo_useragent: navigator.userAgent
    };
    return this._http.post<any>(`${environment.apiUrl}auth/sso/log-auth`, body);
  }
}
