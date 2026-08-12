import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VoucherFeeResults } from '../interfaces/voucher-fee';

@Injectable({
  providedIn: 'root'
})
export class VouchersFeesService {

  constructor(
    private _http: HttpClient
  ) { }

  public getVoucherFees(usr_uuid: string, crd_uuid: string, per_uuid: string, vou_uuid: string, page?: number, perPage?: number, field_order?: string, vouf_order?: string): Observable<VoucherFeeResults> {
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

    if(vouf_order) {
      params = params.set('vouf_order', vouf_order);
    }

    return this._http.get<VoucherFeeResults>(`${environment.apiUrl}voucher-fees/${usr_uuid}/${crd_uuid}/${per_uuid}/${vou_uuid}`, { headers, params });
  }

  public getVoucherFeeById(usr_uuid: string, crd_uuid: string, per_uuid: string, vou_uuid: string, vouf_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}voucher-fee/${usr_uuid}/${crd_uuid}/${per_uuid}/${vou_uuid}/${vouf_uuid}`, { headers });
  }

  public saveVoucherFee(voucherFee: any): Observable<any> {
    const params = JSON.stringify(voucherFee);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}voucher-fee`, params, { headers });
  }

  public updateVoucherFee(usr_uuid: string, crd_uuid: string, per_uuid: string, vou_uuid: string, vouf_uuid: string, voucherFee: any): Observable<any> {
    const params = JSON.stringify(voucherFee);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}voucher-fee/${usr_uuid}/${crd_uuid}/${per_uuid}/${vou_uuid}/${vouf_uuid}`, params, { headers });
  }

  public deleteVoucherFee(usr_uuid: string, crd_uuid: string, per_uuid: string, vou_uuid: string, vouf_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}voucher-fee/${usr_uuid}/${crd_uuid}/${per_uuid}/${vou_uuid}/${vouf_uuid}`, { headers });
  }
}
