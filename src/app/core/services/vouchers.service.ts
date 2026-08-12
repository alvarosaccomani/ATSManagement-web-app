import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VoucherResults } from '../interfaces/voucher';

@Injectable({
  providedIn: 'root'
})
export class VouchersService {

  constructor(
    private _http: HttpClient
  ) { }

  public getVouchers(usr_uuid: string, crd_uuid: string, per_uuid: string, page?: number, perPage?: number, field_order?: string, crd_order?: string): Observable<VoucherResults> {
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

    if(crd_order) {
      params = params.set('crd_order', crd_order);
    }

    return this._http.get<VoucherResults>(`${environment.apiUrl}vouchers/${usr_uuid}/${crd_uuid}/${per_uuid}`, { headers, params });
  }

  public getVocuherById(usr_uuid: string, crd_uuid: string, per_uuid: string, vou_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get(`${environment.apiUrl}voucher/${usr_uuid}/${crd_uuid}/${per_uuid}/${vou_uuid}`, {headers:headers});
  }

  public saveVoucher(voucher: any): Observable<any> {
    let params = JSON.stringify(voucher);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(`${environment.apiUrl}voucher`, params, {headers:headers});
  }

  public updateVoucher(voucher: any): Observable<any> {
    let params = JSON.stringify(voucher);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(`${environment.apiUrl}voucher/${voucher.usr_uuid}/${voucher.crd_uuid}/${voucher.per_uuid}/${voucher.vou_uuid}`, params, {headers:headers});
  }

  public deleteVoucher(usr_uuid: string, crd_uuid: string, per_uuid: string, vou_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.delete(`${environment.apiUrl}voucher/${usr_uuid}/${crd_uuid}/${per_uuid}/${vou_uuid}`, {headers:headers});
  }
}
