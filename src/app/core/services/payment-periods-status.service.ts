import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaymentPeriodStatusResults } from '../interfaces/payment-period-status';

@Injectable({
  providedIn: 'root'
})
export class PaymentPeriodsStatusService {

  constructor(
    private _http: HttpClient
  ) { }
  
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

  public getPaymentPeriodStatusById(payps_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}payment-period-status/${payps_uuid}`, { headers });
  }

  public savePaymentPeriodStatus(paymentPeriodStatus: any): Observable<any> {
    const params = JSON.stringify(paymentPeriodStatus);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}payment-period-status`, params, { headers });
  }

  public updatePaymentPeriodStatus(payps_uuid: string, paymentPeriodStatus: any): Observable<any> {
    const params = JSON.stringify(paymentPeriodStatus);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}payment-period-status/${payps_uuid}`, params, { headers });
  }

  public deletePaymentPeriodStatus(payps_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}payment-period-status/${payps_uuid}`, { headers });
  }
}
