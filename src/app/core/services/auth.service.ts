import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private _http: HttpClient) { }

  public singup(user: any): Observable<any> {
    const userWithApp = { ...user, app_cod: 'Management' };
    const params = JSON.stringify(userWithApp);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}register`, params, { headers });
  }

  public login(user: any, gettoken: string | null = null): Observable<any> {
    if (gettoken != null) {
      user.gettoken = gettoken;
    }
    const params = JSON.stringify(user);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}login`, params, { headers });
  }

  public verifySSOToken(ssoToken: string): Observable<any> {
    const body = JSON.stringify({ sso_token: ssoToken });
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}auth/sso/verify`, body, { headers });
  }

  public getAppConfig(): Observable<any> {
    return this._http.get<any>(`${environment.apiUrl}auth/sso/config`);
  }

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
