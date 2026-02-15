import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaymentMethodResults } from '../interfaces/payment-method';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodsService {

  constructor(
    private _http: HttpClient
  ) { }

  public getPaymentMethods(page?: number, perPage?: number, field_order?: string, paym_order?: string): Observable<PaymentMethodResults> {
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

    if(paym_order) {
      params = params.set('paym_order', paym_order);
    }

    return this._http.get<PaymentMethodResults>(`${environment.apiUrl}payment-methods`, { headers, params });
  }
}
