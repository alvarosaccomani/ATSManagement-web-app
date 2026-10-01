import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ScopeResults } from '../interfaces/scope.interface';

@Injectable({
  providedIn: 'root'
})
export class ScopesService {

  constructor(
    private _http: HttpClient
  ) { }

  public getScopes(usr_uuid: string): Observable<ScopeResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<ScopeResults>(`${environment.apiUrl}scopes/${usr_uuid}`, { headers });
  }

  public getScopeById(scp_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}scope/${scp_uuid}`, { headers });
  }

  public saveScope(scope: any): Observable<any> {
    const params = JSON.stringify(scope);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}scope`, params, { headers });
  }

  public updateScope(scp_uuid: string, scope: any): Observable<any> {
    const params = JSON.stringify(scope);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}scope/${scp_uuid}`, params, { headers });
  }

  public deleteScope(scp_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}scope/${scp_uuid}`, { headers });
  }
}
