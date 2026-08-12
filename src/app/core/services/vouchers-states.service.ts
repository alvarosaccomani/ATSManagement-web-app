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

  public getVoucherStateById(vous_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}voucher-state/${vous_uuid}`, { headers });
  }

  public saveVoucherState(voucherState: any): Observable<any> {
    const params = JSON.stringify(voucherState);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}voucher-state`, params, { headers });
  }

  public updateVoucherState(vous_uuid: string, voucherState: any): Observable<any> {
    const params = JSON.stringify(voucherState);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}voucher-state/${vous_uuid}`, params, { headers });
  }

  public deleteVoucherState(vous_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}voucher-state/${vous_uuid}`, { headers });
  }
}
