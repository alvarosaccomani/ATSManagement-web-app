import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VoucherStateResults } from '../interfaces/voucher-state';

/**
 * Service for managing voucher states/statuses in the parametric catalog.
 */
@Injectable({
  providedIn: 'root'
})
export class VouchersStatesService {

  /**
   * Initializes the voucher states service.
   *
   * @param _http Angular `HttpClient` instance.
   */
  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Retrieves a paginated list of voucher states.
   *
   * @param page Optional page number.
   * @param perPage Optional number of items per page.
   * @param field_order Optional field name to sort by.
   * @param vous_order Optional sort direction (`ASC` or `DESC`).
   * @returns An observable emitting paginated {@link VoucherStateResults}.
   */
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

  /**
   * Retrieves a single voucher state by its UUID.
   *
   * @param vous_uuid Unique identifier of the voucher state.
   * @returns An observable emitting the requested voucher state record.
   */
  public getVoucherStateById(vous_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}voucher-state/${vous_uuid}`, { headers });
  }

  /**
   * Creates a new voucher state record.
   *
   * @param voucherState Voucher state payload to persist.
   * @returns An observable emitting the created voucher state record.
   */
  public saveVoucherState(voucherState: any): Observable<any> {
    const params = JSON.stringify(voucherState);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}voucher-state`, params, { headers });
  }

  /**
   * Updates an existing voucher state record.
   *
   * @param vous_uuid Unique identifier of the voucher state to update.
   * @param voucherState Updated voucher state payload.
   * @returns An observable emitting the updated voucher state record.
   */
  public updateVoucherState(vous_uuid: string, voucherState: any): Observable<any> {
    const params = JSON.stringify(voucherState);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}voucher-state/${vous_uuid}`, params, { headers });
  }

  /**
   * Deletes a voucher state record by its UUID.
   *
   * @param vous_uuid Unique identifier of the voucher state to delete.
   * @returns An observable emitting the deletion response.
   */
  public deleteVoucherState(vous_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}voucher-state/${vous_uuid}`, { headers });
  }
}
