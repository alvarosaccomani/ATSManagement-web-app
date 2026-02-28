import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PendingVoucherResults } from '../interfaces/pending-voucher';

@Injectable({
  providedIn: 'root'
})
export class PendingVouchersService {

  constructor(
      private _http: HttpClient
    ) { }

  public getPendingVouchers(usr_uuid: string, page?: number, perPage?: number, field_order?: string, per_order?: string): Observable<PendingVoucherResults> {
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

    return this._http.get<PendingVoucherResults>(`${environment.apiUrl}pending-vouchers/${usr_uuid}`, { headers, params });
  }
}
