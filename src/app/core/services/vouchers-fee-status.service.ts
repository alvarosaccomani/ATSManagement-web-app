import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VoucherFeeStatusInterfaceResults } from '../interfaces/voucher-fee-status';

@Injectable({
  providedIn: 'root'
})
export class VouchersFeeStatusService {

  constructor(
    private _http: HttpClient
  ) { }

  public getVoucherFeeStatus(page?: number, perPage?: number, field_order?: string, voufs_order?: string): Observable<VoucherFeeStatusInterfaceResults> {
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

    if(voufs_order) {
      params = params.set('voufs_order', voufs_order);
    }

    return this._http.get<VoucherFeeStatusInterfaceResults>(`${environment.apiUrl}voucher-fee-statuses`, { headers, params });
  }

  public getVoucherFeeStatusById(voufs_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}voucher-fee-status/${voufs_uuid}`, { headers });
  }

  public saveVoucherFeeStatus(voucherFeeStatus: any): Observable<any> {
    const params = JSON.stringify(voucherFeeStatus);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}voucher-fee-status`, params, { headers });
  }

  public updateVoucherFeeStatus(voufs_uuid: string, voucherFeeStatus: any): Observable<any> {
    const params = JSON.stringify(voucherFeeStatus);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}voucher-fee-status/${voufs_uuid}`, params, { headers });
  }

  public deleteVoucherFeeStatus(voufs_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}voucher-fee-status/${voufs_uuid}`, { headers });
  }
}
