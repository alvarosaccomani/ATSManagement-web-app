import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VoucherStateResults } from '../interfaces/voucher-state';

@Injectable({
  providedIn: 'root'
})
export class VouchersStatesService {

  constructor(
    private _http: HttpClient
  ) { }

  public getVoucherStates(page?: number, perPage?: number, field_order?: string, vous_order?: string): Observable<VoucherStateResults> {
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
    
        if(vous_order) {
          params = params.set('vous_order', vous_order);
        }
    
        return this._http.get<VoucherStateResults>(`${environment.apiUrl}voucher-states`, { headers, params });
      }
}
