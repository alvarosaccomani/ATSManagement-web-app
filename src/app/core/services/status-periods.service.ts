import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StatusPeriodResults } from '../interfaces/status-period';

/**
 * Service for managing billing period statuses in the parametric catalog.
 */
@Injectable({
  providedIn: 'root'
})
export class StatusPeriodsService {

  /**
   * Initializes the status periods service.
   *
   * @param _http Angular `HttpClient` instance.
   */
  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Retrieves a paginated list of billing period statuses.
   *
   * @param page Optional page number.
   * @param perPage Optional number of items per page.
   * @param field_order Optional field name to sort by.
   * @param sper_order Optional sort direction (`ASC` or `DESC`).
   * @returns An observable emitting paginated {@link StatusPeriodResults}.
   */
  public getStatusPeriods(page?: number, perPage?: number, field_order?: string, sper_order?: string): Observable<StatusPeriodResults> {
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
    
        if(sper_order) {
          params = params.set('sper_order', sper_order);
        }
    
        return this._http.get<StatusPeriodResults>(`${environment.apiUrl}status-periods`, { headers, params });
      }

  /**
   * Retrieves a single billing period status by its UUID.
   *
   * @param sper_uuid Unique identifier of the period status.
   * @returns An observable emitting the requested status record.
   */
  public getStatusPeriodById(sper_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}status-period/${sper_uuid}`, { headers });
  }

  /**
   * Creates a new billing period status record.
   *
   * @param statusPeriod Period status payload to persist.
   * @returns An observable emitting the created status record.
   */
  public saveStatusPeriod(statusPeriod: any): Observable<any> {
    const params = JSON.stringify(statusPeriod);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}status-period`, params, { headers });
  }

  /**
   * Updates an existing billing period status record.
   *
   * @param sper_uuid Unique identifier of the status to update.
   * @param statusPeriod Updated period status payload.
   * @returns An observable emitting the updated status record.
   */
  public updateStatusPeriod(sper_uuid: string, statusPeriod: any): Observable<any> {
    const params = JSON.stringify(statusPeriod);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}status-period/${sper_uuid}`, params, { headers });
  }

  /**
   * Deletes a billing period status record by its UUID.
   *
   * @param sper_uuid Unique identifier of the status to delete.
   * @returns An observable emitting the deletion response.
   */
  public deleteStatusPeriod(sper_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}status-period/${sper_uuid}`, { headers });
  }
}
