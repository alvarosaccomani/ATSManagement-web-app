import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VoucherFeeStatusInterfaceResults } from '../interfaces/voucher-fee-status';

/**
 * Service for managing voucher installment (fee) statuses in the parametric catalog.
 */
@Injectable({
  providedIn: 'root'
})
export class VouchersFeeStatusService {

  /**
   * Initializes the voucher fee statuses service.
   *
   * @param _http Angular `HttpClient` instance.
   */
  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Retrieves a paginated list of voucher installment statuses.
   *
   * @param page Optional page number.
   * @param perPage Optional number of items per page.
   * @param field_order Optional field name to sort by.
   * @param voufs_order Optional sort direction (`ASC` or `DESC`).
   * @returns An observable emitting paginated {@link VoucherFeeStatusInterfaceResults}.
   */
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

  /**
   * Retrieves a single voucher installment status by its UUID.
   *
   * @param voufs_uuid Unique identifier of the installment status.
   * @returns An observable emitting the requested installment status record.
   */
  public getVoucherFeeStatusById(voufs_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}voucher-fee-status/${voufs_uuid}`, { headers });
  }

  /**
   * Creates a new voucher installment status record.
   *
   * @param voucherFeeStatus Installment status payload to persist.
   * @returns An observable emitting the created installment status record.
   */
  public saveVoucherFeeStatus(voucherFeeStatus: any): Observable<any> {
    const params = JSON.stringify(voucherFeeStatus);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}voucher-fee-status`, params, { headers });
  }

  /**
   * Updates an existing voucher installment status record.
   *
   * @param voufs_uuid Unique identifier of the status to update.
   * @param voucherFeeStatus Updated installment status payload.
   * @returns An observable emitting the updated installment status record.
   */
  public updateVoucherFeeStatus(voufs_uuid: string, voucherFeeStatus: any): Observable<any> {
    const params = JSON.stringify(voucherFeeStatus);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}voucher-fee-status/${voufs_uuid}`, params, { headers });
  }

  /**
   * Deletes a voucher installment status record by its UUID.
   *
   * @param voufs_uuid Unique identifier of the status to delete.
   * @returns An observable emitting the deletion response.
   */
  public deleteVoucherFeeStatus(voufs_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}voucher-fee-status/${voufs_uuid}`, { headers });
  }
}
