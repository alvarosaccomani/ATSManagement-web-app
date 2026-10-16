import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PeriodResults } from '../interfaces/period';

/**
 * Service for managing monthly card billing periods.
 */
@Injectable({
  providedIn: 'root'
})
export class PeriodsService {

  /**
   * Initializes the periods service.
   *
   * @param _http Angular `HttpClient` instance.
   */
  constructor(
      private _http: HttpClient
    ) { }
        
  /**
   * Retrieves a paginated list of billing periods for a specific user and card.
   *
   * @param usr_uuid Unique identifier of the user.
   * @param crd_uuid Unique identifier of the card.
   * @param page Optional page number.
   * @param perPage Optional number of items per page.
   * @param field_order Optional field name to sort by.
   * @param per_order Optional sort direction (`ASC` or `DESC`).
   * @returns An observable emitting paginated {@link PeriodResults}.
   */
  public getPedriods(usr_uuid: string, crd_uuid: string, page?: number, perPage?: number, field_order?: string, per_order?: string): Observable<PeriodResults> {
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

    if(per_order) {
      params = params.set('per_order', per_order);
    }

    return this._http.get<PeriodResults>(`${environment.apiUrl}periods/${usr_uuid}/${crd_uuid}`, { headers, params });
  }

  /**
   * Retrieves a single billing period by its composite identifiers.
   *
   * @param usr_uuid Unique identifier of the user.
   * @param crd_uuid Unique identifier of the card.
   * @param per_uuid Unique identifier of the billing period.
   * @returns An observable emitting the requested billing period record.
   */
  public getPeriodById(usr_uuid: string, crd_uuid: string, per_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get(`${environment.apiUrl}period/${usr_uuid}/${crd_uuid}/${per_uuid}`, {headers:headers});
  }

  /**
   * Creates a new billing period record.
   *
   * @param period Billing period payload to persist.
   * @returns An observable emitting the created billing period record.
   */
  public savePeriod(period: any): Observable<any> {
    let params = JSON.stringify(period);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(`${environment.apiUrl}period`, params, {headers:headers});
}

  /**
   * Updates an existing billing period record.
   *
   * @param period Updated billing period payload.
   * @returns An observable emitting the updated billing period record.
   */
  public updatePeriod(period: any): Observable<any> {
    let params = JSON.stringify(period);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(`${environment.apiUrl}period/${period.usr_uuid}/${period.crd_uuid}`, params, {headers:headers});
  }

  /**
   * Deletes a billing period record by its composite identifiers.
   *
   * @param usr_uuid Unique identifier of the user.
   * @param crd_uuid Unique identifier of the card.
   * @param per_uuid Unique identifier of the billing period to delete.
   * @returns An observable emitting the deletion response.
   */
  public deletePeriod(usr_uuid: string, crd_uuid: string, per_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.delete(`${environment.apiUrl}period/${usr_uuid}/${crd_uuid}/${per_uuid}`, {headers:headers});
  }
}
