import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaymentPeriodResults } from '../interfaces/payment-period';

@Injectable({
  providedIn: 'root'
})
export class PaymentPeriodsService {

  constructor(
      private _http: HttpClient
    ) { }
        
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

  public getPaymentPeriodById(usr_uuid: string, crd_uuid: string, per_uuid: string, payp_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}payment-period/${usr_uuid}/${crd_uuid}/${per_uuid}/${payp_uuid}`, { headers });
  }

  public savePaymentPeriod(paymentPeriod: any): Observable<any> {
    const params = JSON.stringify(paymentPeriod);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}payment-period`, params, { headers });
  }

  public updatePaymentPeriod(usr_uuid: string, crd_uuid: string, per_uuid: string, payp_uuid: string, paymentPeriod: any): Observable<any> {
    const params = JSON.stringify(paymentPeriod);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}payment-period/${usr_uuid}/${crd_uuid}/${per_uuid}/${payp_uuid}`, params, { headers });
  }

  public deletePaymentPeriod(usr_uuid: string, crd_uuid: string, per_uuid: string, payp_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}payment-period/${usr_uuid}/${crd_uuid}/${per_uuid}/${payp_uuid}`, { headers });
  }
}
