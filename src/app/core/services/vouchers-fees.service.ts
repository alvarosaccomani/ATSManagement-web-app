import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VoucherFeeResults } from '../interfaces/voucher-fee';

/**
 * Service for managing individual voucher installments (fees/quotas).
 */
@Injectable({
  providedIn: 'root'
})
export class VouchersFeesService {

  /**
   * Initializes the voucher fees service.
   *
   * @param _http Angular `HttpClient` instance.
   */
  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Retrieves a paginated list of installments for a specific user, card, billing period, and voucher.
   *
   * @param usr_uuid Unique identifier of the user.
   * @param crd_uuid Unique identifier of the card.
   * @param per_uuid Unique identifier of the billing period.
   * @param vou_uuid Unique identifier of the voucher.
   * @param page Optional page number.
   * @param perPage Optional number of items per page.
   * @param field_order Optional field name to sort by.
   * @param vouf_order Optional sort direction (`ASC` or `DESC`).
   * @returns An observable emitting paginated {@link VoucherFeeResults}.
   */
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

  /**
   * Retrieves a single voucher installment by its composite identifiers.
   *
   * @param usr_uuid Unique identifier of the user.
   * @param crd_uuid Unique identifier of the card.
   * @param per_uuid Unique identifier of the billing period.
   * @param vou_uuid Unique identifier of the voucher.
   * @param vouf_uuid Unique identifier of the voucher installment.
   * @returns An observable emitting the requested installment record.
   */
  public getVoucherFeeById(usr_uuid: string, crd_uuid: string, per_uuid: string, vou_uuid: string, vouf_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}voucher-fee/${usr_uuid}/${crd_uuid}/${per_uuid}/${vou_uuid}/${vouf_uuid}`, { headers });
  }

  /**
   * Creates a new voucher installment record.
   *
   * @param voucherFee Voucher installment payload to persist.
   * @returns An observable emitting the created installment record.
   */
  public saveVoucherFee(voucherFee: any): Observable<any> {
    const params = JSON.stringify(voucherFee);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}voucher-fee`, params, { headers });
  }

  /**
   * Updates an existing voucher installment record.
   *
   * @param usr_uuid Unique identifier of the user.
   * @param crd_uuid Unique identifier of the card.
   * @param per_uuid Unique identifier of the billing period.
   * @param vou_uuid Unique identifier of the voucher.
   * @param vouf_uuid Unique identifier of the installment to update.
   * @param voucherFee Updated installment payload.
   * @returns An observable emitting the updated installment record.
   */
  public updateVoucherFee(usr_uuid: string, crd_uuid: string, per_uuid: string, vou_uuid: string, vouf_uuid: string, voucherFee: any): Observable<any> {
    const params = JSON.stringify(voucherFee);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}voucher-fee/${usr_uuid}/${crd_uuid}/${per_uuid}/${vou_uuid}/${vouf_uuid}`, params, { headers });
  }

  /**
   * Deletes a voucher installment record by its composite identifiers.
   *
   * @param usr_uuid Unique identifier of the user.
   * @param crd_uuid Unique identifier of the card.
   * @param per_uuid Unique identifier of the billing period.
   * @param vou_uuid Unique identifier of the voucher.
   * @param vouf_uuid Unique identifier of the installment to delete.
   * @returns An observable emitting the deletion response.
   */
  public deleteVoucherFee(usr_uuid: string, crd_uuid: string, per_uuid: string, vou_uuid: string, vouf_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}voucher-fee/${usr_uuid}/${crd_uuid}/${per_uuid}/${vou_uuid}/${vouf_uuid}`, { headers });
  }
}
