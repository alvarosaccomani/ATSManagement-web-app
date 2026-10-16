import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaymentPeriodResults } from '../interfaces/payment-period';

/**
 * Service for managing statement payment records (`PaymentPeriodInterface`) associated with card billing periods.
 */
@Injectable({
  providedIn: 'root'
})
export class PaymentPeriodsService {

  /**
   * Initializes the payment periods service.
   *
   * @param _http Angular `HttpClient` instance.
   */
  constructor(
      private _http: HttpClient
    ) { }
        
  /**
   * Retrieves a paginated list of payment records for a specific user, card, and billing period.
   *
   * @param usr_uuid Unique identifier of the user.
   * @param crd_uuid Unique identifier of the card.
   * @param per_uuid Unique identifier of the billing period.
   * @param page Optional page number.
   * @param perPage Optional number of items per page.
   * @param field_order Optional field name to sort by.
   * @param payp_order Optional sort direction (`ASC` or `DESC`).
   * @returns An observable emitting paginated {@link PaymentPeriodResults}.
   */
  public getPaymentPeriods(usr_uuid: string, crd_uuid: string, per_uuid: string, page?: number, perPage?: number, field_order?: string, payp_order?: string): Observable<PaymentPeriodResults> {
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

    if(payp_order) {
      params = params.set('payp_order', payp_order);
    }

    return this._http.get<PaymentPeriodResults>(`${environment.apiUrl}payment-periods/${usr_uuid}/${crd_uuid}/${per_uuid}`, { headers, params });
  }

  /**
   * Retrieves a single payment period record by its composite identifiers.
   *
   * @param usr_uuid Unique identifier of the user.
   * @param crd_uuid Unique identifier of the card.
   * @param per_uuid Unique identifier of the billing period.
   * @param payp_uuid Unique identifier of the payment period record.
   * @returns An observable emitting the requested payment period record.
   */
  public getPaymentPeriodById(usr_uuid: string, crd_uuid: string, per_uuid: string, payp_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}payment-period/${usr_uuid}/${crd_uuid}/${per_uuid}/${payp_uuid}`, { headers });
  }

  /**
   * Creates a new payment period record.
   *
   * @param paymentPeriod Payment period payload to persist.
   * @returns An observable emitting the created payment period record.
   */
  public savePaymentPeriod(paymentPeriod: any): Observable<any> {
    const params = JSON.stringify(paymentPeriod);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}payment-period`, params, { headers });
  }

  /**
   * Updates an existing payment period record.
   *
   * @param usr_uuid Unique identifier of the user.
   * @param crd_uuid Unique identifier of the card.
   * @param per_uuid Unique identifier of the billing period.
   * @param payp_uuid Unique identifier of the payment period record.
   * @param paymentPeriod Updated payment period payload.
   * @returns An observable emitting the updated payment period record.
   */
  public updatePaymentPeriod(usr_uuid: string, crd_uuid: string, per_uuid: string, payp_uuid: string, paymentPeriod: any): Observable<any> {
    const params = JSON.stringify(paymentPeriod);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}payment-period/${usr_uuid}/${crd_uuid}/${per_uuid}/${payp_uuid}`, params, { headers });
  }

  /**
   * Deletes a payment period record by its composite identifiers.
   *
   * @param usr_uuid Unique identifier of the user.
   * @param crd_uuid Unique identifier of the card.
   * @param per_uuid Unique identifier of the billing period.
   * @param payp_uuid Unique identifier of the payment period record to delete.
   * @returns An observable emitting the deletion response.
   */
  public deletePaymentPeriod(usr_uuid: string, crd_uuid: string, per_uuid: string, payp_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}payment-period/${usr_uuid}/${crd_uuid}/${per_uuid}/${payp_uuid}`, { headers });
  }
}
