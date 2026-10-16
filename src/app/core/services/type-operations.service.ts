import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TypeOperationResults } from '../interfaces/type-operation';

/**
 * Service for managing voucher operation types in the parametric catalog.
 */
@Injectable({
  providedIn: 'root'
})
export class TypeOperationsService {

  /**
   * Initializes the operation types service.
   *
   * @param _http Angular `HttpClient` instance.
   */
  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Retrieves a paginated list of operation types.
   *
   * @param page Optional page number.
   * @param perPage Optional number of items per page.
   * @param field_order Optional field name to sort by.
   * @param tyop_order Optional sort direction (`ASC` or `DESC`).
   * @returns An observable emitting paginated {@link TypeOperationResults}.
   */
  public getTypeOperations(page?: number, perPage?: number, field_order?: string, tyop_order?: string): Observable<TypeOperationResults> {
    const headers = new HttpHeaders().set('content-type','application/json');

    let params = new HttpParams();

    if (page) {
      params = params.set('page', page.toString());
    }

    if (perPage) {
      params = params.set('perPage', perPage.toString());
    }

    if(field_order) {
      params = params.set('field_order', field_order);
    }

    if(tyop_order) {
      params = params.set('tyop_order', tyop_order);
    }

    return this._http.get<TypeOperationResults>(`${environment.apiUrl}type-operations`, { headers, params });
  }

  /**
   * Retrieves a single operation type by its UUID.
   *
   * @param tyop_uuid Unique identifier of the operation type.
   * @returns An observable emitting the requested operation type record.
   */
  public getTypeOperationById(tyop_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}type-operation/${tyop_uuid}`, { headers });
  }

  /**
   * Creates a new operation type record.
   *
   * @param typeOperation Operation type payload to persist.
   * @returns An observable emitting the created operation type record.
   */
  public saveTypeOperation(typeOperation: any): Observable<any> {
    const params = JSON.stringify(typeOperation);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}type-operation`, params, { headers });
  }

  /**
   * Updates an existing operation type record.
   *
   * @param tyop_uuid Unique identifier of the operation type to update.
   * @param typeOperation Updated operation type payload.
   * @returns An observable emitting the updated operation type record.
   */
  public updateTypeOperation(tyop_uuid: string, typeOperation: any): Observable<any> {
    const params = JSON.stringify(typeOperation);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}type-operation/${tyop_uuid}`, params, { headers });
  }

  /**
   * Deletes an operation type record by its UUID.
   *
   * @param tyop_uuid Unique identifier of the operation type to delete.
   * @returns An observable emitting the deletion response.
   */
  public deleteTypeOperation(tyop_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}type-operation/${tyop_uuid}`, { headers });
  }
}
