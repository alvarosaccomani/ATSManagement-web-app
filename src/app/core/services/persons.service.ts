import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PersonResults } from '../interfaces/person.interface';

/**
 * Service for managing contacts and persons (sellers, clients, partners, suppliers) within scopes.
 */
@Injectable({
  providedIn: 'root'
})
export class PersonsService {

  /**
   * Initializes the persons service.
   *
   * @param _http Angular `HttpClient` instance.
   */
  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Retrieves all person records associated with a specific scope.
   *
   * @param scp_uuid Unique identifier of the scope.
   * @returns An observable emitting {@link PersonResults}.
   */
  public getPersons(scp_uuid: string): Observable<PersonResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<PersonResults>(`${environment.apiUrl}persons/${scp_uuid}`, { headers });
  }

  /**
   * Retrieves a single person record by its UUID.
   *
   * @param prs_uuid Unique identifier of the person.
   * @returns An observable emitting the requested person record.
   */
  public getPersonById(prs_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}person/${prs_uuid}`, { headers });
  }

  /**
   * Creates a new person/contact record.
   *
   * @param person Person payload to persist.
   * @returns An observable emitting the created person record.
   */
  public savePerson(person: any): Observable<any> {
    const params = JSON.stringify(person);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}person`, params, { headers });
  }

  /**
   * Updates an existing person/contact record.
   *
   * @param prs_uuid Unique identifier of the person to update.
   * @param person Updated person payload.
   * @returns An observable emitting the updated person record.
   */
  public updatePerson(prs_uuid: string, person: any): Observable<any> {
    const params = JSON.stringify(person);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}person/${prs_uuid}`, params, { headers });
  }

  /**
   * Deletes a person/contact record by its UUID.
   *
   * @param prs_uuid Unique identifier of the person to delete.
   * @returns An observable emitting the deletion response.
   */
  public deletePerson(prs_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}person/${prs_uuid}`, { headers });
  }
}
