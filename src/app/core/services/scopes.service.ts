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

  /**
   * Obtiene la lista de usuarios asignados/miembros de un ámbito con sus roles.
   *
   * @param scp_uuid UUID del ámbito.
   * @returns Observable con la lista de miembros del ámbito.
   */
  public getScopeUsers(scp_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get(`${environment.apiUrl}scope-users/${scp_uuid}`, { headers });
  }

  /**
   * Asigna o vincula un usuario a un ámbito con un rol específico.
   *
   * @param scp_uuid UUID del ámbito.
   * @param usr_uuid UUID del usuario a asignar.
   * @param scpu_role Rol a asignar ('ADMIN', 'MEMBER', 'VIEWER').
   * @returns Observable con el resultado de la asignación.
   */
  public addScopeUser(scp_uuid: string, usr_uuid: string, scpu_role: string = 'MEMBER'): Observable<any> {
    const params = JSON.stringify({ scp_uuid, usr_uuid, scpu_role });
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}scope-user`, params, { headers });
  }

  /**
   * Desvincula o remueve a un usuario de un ámbito.
   *
   * @param scp_uuid UUID del ámbito.
   * @param usr_uuid UUID del usuario a desvincular.
   * @returns Observable con el resultado de la eliminación.
   */
  public removeScopeUser(scp_uuid: string, usr_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}scope-user/${scp_uuid}/${usr_uuid}`, { headers });
  }

  /**
   * Obtiene la lista de todos los usuarios registrados en el sistema para poder agregarlos como miembros.
   *
   * @returns Observable con la lista de usuarios del sistema.
   */
  public getAllUsers(): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get(`${environment.apiUrl}users`, { headers });
  }
}
