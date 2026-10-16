import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PendingVoucherResults } from '../interfaces/pending-voucher';

/**
 * Service for managing uploaded or photographed pending vouchers awaiting processing.
 */
@Injectable({
  providedIn: 'root'
})
export class PendingVouchersService {

  /**
   * Initializes the pending vouchers service.
   *
   * @param _http Angular `HttpClient` instance.
   */
  constructor(
      private _http: HttpClient
    ) { }

  /**
   * Retrieves a paginated list of pending vouchers for a user.
   *
   * @param usr_uuid Unique identifier of the user.
   * @param page Optional page number.
   * @param perPage Optional number of items per page.
   * @param field_order Optional field name to sort by.
   * @param per_order Optional sort direction (`ASC` or `DESC`).
   * @returns An observable emitting paginated {@link PendingVoucherResults}.
   */
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

  /**
   * Saves a newly uploaded or captured pending voucher image.
   *
   * @param pendingVoucher Pending voucher payload containing the Base64 image and metadata.
   * @returns An observable emitting the created pending voucher record.
   */
  public savePendingVoucher(pendingVoucher: any): Observable<any> {
    let params = JSON.stringify(pendingVoucher);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(`${environment.apiUrl}pending-voucher`, params, {headers:headers});
  }

  /**
   * Deletes a pending voucher record by its UUID.
   *
   * @param usr_uuid Unique identifier of the user.
   * @param pevou_uuid Unique identifier of the pending voucher to delete.
   * @returns An observable emitting the deletion response.
   */
  public deletePendingVoucher(usr_uuid: string, pevou_uuid: string): Observable<any> {
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.delete(`${environment.apiUrl}pending-voucher/${usr_uuid}/${pevou_uuid}`, {headers:headers});
  }
}
