import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VoucherResults } from '../interfaces/voucher';

/**
 * Service for managing card purchase vouchers.
 */
@Injectable({
  providedIn: 'root'
})
export class VouchersService {

  /**
   * Initializes the vouchers service.
   *
   * @param _http Angular `HttpClient` instance.
   */
  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Retrieves a paginated list of vouchers for a specific user, card, and billing period.
   *
   * @param usr_uuid Unique identifier of the user.
   * @param crd_uuid Unique identifier of the card.
   * @param per_uuid Unique identifier of the billing period.
   * @param page Optional page number.
   * @param perPage Optional number of items per page.
   * @param field_order Optional field name to sort by.
   * @param crd_order Optional sort direction (`ASC` or `DESC`).
   * @returns An observable emitting paginated {@link VoucherResults}.
   */
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

  /**
   * Retrieves a single voucher by its composite identifiers.
   *
   * @param usr_uuid Unique identifier of the user.
   * @param crd_uuid Unique identifier of the card.
   * @param per_uuid Unique identifier of the billing period.
   * @param vou_uuid Unique identifier of the voucher.
   * @returns An observable emitting the requested voucher record.
   */
  public getVocuherById(usr_uuid: string, crd_uuid: string, per_uuid: string, vou_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.get(`${environment.apiUrl}voucher/${usr_uuid}/${crd_uuid}/${per_uuid}/${vou_uuid}`, {headers:headers});
  }

  /**
   * Creates a new voucher record.
   *
   * @param voucher Voucher payload to persist.
   * @returns An observable emitting the created voucher record.
   */
  public saveVoucher(voucher: any): Observable<any> {
    let params = JSON.stringify(voucher);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(`${environment.apiUrl}voucher`, params, {headers:headers});
  }

  /**
   * Updates an existing voucher record.
   *
   * @param voucher Updated voucher payload containing composite identifiers.
   * @returns An observable emitting the updated voucher record.
   */
  public updateVoucher(voucher: any): Observable<any> {
    let params = JSON.stringify(voucher);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.put(`${environment.apiUrl}voucher/${voucher.usr_uuid}/${voucher.crd_uuid}/${voucher.per_uuid}/${voucher.vou_uuid}`, params, {headers:headers});
  }

  /**
   * Deletes a voucher record by its composite identifiers.
   *
   * @param usr_uuid Unique identifier of the user.
   * @param crd_uuid Unique identifier of the card.
   * @param per_uuid Unique identifier of the billing period.
   * @param vou_uuid Unique identifier of the voucher to delete.
   * @returns An observable emitting the deletion response.
   */
  public deleteVoucher(usr_uuid: string, crd_uuid: string, per_uuid: string, vou_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.delete(`${environment.apiUrl}voucher/${usr_uuid}/${crd_uuid}/${per_uuid}/${vou_uuid}`, {headers:headers});
  }
}
