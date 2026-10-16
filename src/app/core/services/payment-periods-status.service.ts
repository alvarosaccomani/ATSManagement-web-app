import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaymentPeriodStatusResults } from '../interfaces/payment-period-status';

/**
 * Service for managing payment period statuses in the parametric catalog.
 */
@Injectable({
  providedIn: 'root'
})
export class PaymentPeriodsStatusService {

  /**
   * Initializes the payment period statuses service.
   *
   * @param _http Angular `HttpClient` instance.
   */
  constructor(
    private _http: HttpClient
  ) { }
  
  /**
   * Retrieves a paginated list of payment period statuses.
   *
   * @param page Optional page number.
   * @param perPage Optional number of items per page.
   * @param field_order Optional field name to sort by.
   * @param payps_order Optional sort direction (`ASC` or `DESC`).
   * @returns An observable emitting paginated {@link PaymentPeriodStatusResults}.
   */
  public getPaymentPeriodsStatus(page?: number, perPage?: number, field_order?: string, payps_order?: string): Observable<PaymentPeriodStatusResults> {
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

    if(payps_order) {
      params = params.set('payps_order', payps_order);
    }

    return this._http.get<PaymentPeriodStatusResults>(`${environment.apiUrl}payment-period-statuses`, { headers, params });
  }

  /**
   * Retrieves a single payment period status by its UUID.
   *
   * @param payps_uuid Unique identifier of the payment period status.
   * @returns An observable emitting the requested status record.
   */
  public getPaymentPeriodStatusById(payps_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}payment-period-status/${payps_uuid}`, { headers });
  }

  /**
   * Creates a new payment period status record.
   *
   * @param paymentPeriodStatus Status payload to persist.
   * @returns An observable emitting the created status record.
   */
  public savePaymentPeriodStatus(paymentPeriodStatus: any): Observable<any> {
    const params = JSON.stringify(paymentPeriodStatus);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}payment-period-status`, params, { headers });
  }

  /**
   * Updates an existing payment period status record.
   *
   * @param payps_uuid Unique identifier of the status to update.
   * @param paymentPeriodStatus Updated status payload.
   * @returns An observable emitting the updated status record.
   */
  public updatePaymentPeriodStatus(payps_uuid: string, paymentPeriodStatus: any): Observable<any> {
    const params = JSON.stringify(paymentPeriodStatus);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}payment-period-status/${payps_uuid}`, params, { headers });
  }

  /**
   * Deletes a payment period status record by its UUID.
   *
   * @param payps_uuid Unique identifier of the status to delete.
   * @returns An observable emitting the deletion response.
   */
  public deletePaymentPeriodStatus(payps_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}payment-period-status/${payps_uuid}`, { headers });
  }
}
