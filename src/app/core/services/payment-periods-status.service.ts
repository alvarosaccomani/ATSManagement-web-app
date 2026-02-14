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
}
