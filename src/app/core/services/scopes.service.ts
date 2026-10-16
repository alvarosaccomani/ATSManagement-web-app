import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ScopeResults } from '../interfaces/scope.interface';

/**
 * Service for managing accounting scopes (contexts such as Personal, Home, Business).
 */
@Injectable({
  providedIn: 'root'
})
export class ScopesService {

  /**
   * Initializes the scopes service.
   *
   * @param _http Angular `HttpClient` instance.
   */
  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Retrieves all scopes belonging to or shared with a specific user.
   *
   * @param usr_uuid Unique identifier of the user.
   * @returns An observable emitting {@link ScopeResults}.
   */
  public getScopes(usr_uuid: string): Observable<ScopeResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<ScopeResults>(`${environment.apiUrl}scopes/${usr_uuid}`, { headers });
  }

  /**
   * Retrieves a single scope record by its UUID.
   *
   * @param scp_uuid Unique identifier of the scope.
   * @returns An observable emitting the requested scope record.
   */
  public getScopeById(scp_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}scope/${scp_uuid}`, { headers });
  }

  /**
   * Creates a new accounting scope.
   *
   * @param scope Scope payload to persist.
   * @returns An observable emitting the created scope record.
   */
  public saveScope(scope: any): Observable<any> {
    const params = JSON.stringify(scope);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}scope`, params, { headers });
  }

  /**
   * Updates an existing accounting scope.
   *
   * @param scp_uuid Unique identifier of the scope to update.
   * @param scope Updated scope payload.
   * @returns An observable emitting the updated scope record.
   */
  public updateScope(scp_uuid: string, scope: any): Observable<any> {
    const params = JSON.stringify(scope);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}scope/${scp_uuid}`, params, { headers });
  }

  /**
   * Deletes an accounting scope by its UUID.
   *
   * @param scp_uuid Unique identifier of the scope to delete.
   * @returns An observable emitting the deletion response.
   */
  public deleteScope(scp_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}scope/${scp_uuid}`, { headers });
  }
}
