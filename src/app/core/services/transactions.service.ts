import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TransactionResults } from '../interfaces/transaction.interface';

/**
 * Service for managing cash-flow transactions (`INGRESO`, `EGRESO`, `TRANSFERENCIA`).
 */
@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  /**
   * Initializes the transactions service.
   *
   * @param _http Angular `HttpClient` instance.
   */
  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Retrieves transactions for a user within an authorized scope (or `'ALL'` authorized scopes),
   * optionally filtered by movement type.
   *
   * @param usr_uuid Unique identifier of the user.
   * @param scp_uuid Unique identifier of the scope (or `'ALL'`).
   * @param trx_type Optional movement type filter (`'INGRESO' | 'EGRESO' | 'TRANSFERENCIA'`).
   * @returns An observable emitting {@link TransactionResults}.
   */
  public getTransactions(usr_uuid: string, scp_uuid: string, trx_type?: string): Observable<TransactionResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    let params = new HttpParams();
    if (trx_type) {
      params = params.set('trx_type', trx_type);
    }
    return this._http.get<TransactionResults>(`${environment.apiUrl}transactions/${usr_uuid}/${scp_uuid}`, { headers, params });
  }

  /**
   * Retrieves a single transaction by its UUID.
   *
   * @param trx_uuid Unique identifier of the transaction.
   * @returns An observable emitting the requested transaction record.
   */
  public getTransactionById(trx_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}transaction/${trx_uuid}`, { headers });
  }

  /**
   * Creates a new cash-flow transaction record.
   *
   * @param transaction Transaction payload to persist.
   * @returns An observable emitting the created transaction record.
   */
  public saveTransaction(transaction: any): Observable<any> {
    const params = JSON.stringify(transaction);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}transaction`, params, { headers });
  }

  /**
   * Persists a batch of transactions in a single atomic database operation.
   *
   * @param transactions Array of transaction payloads to create in bulk.
   * @returns An observable emitting the bulk creation response with created records and count.
   */
  public saveBulkTransactions(transactions: any[]): Observable<any> {
    const params = JSON.stringify({ transactions });
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}transactions/bulk`, params, { headers });
  }

  /**
   * Updates an existing cash-flow transaction record.
   *
   * @param trx_uuid Unique identifier of the transaction to update.
   * @param transaction Updated transaction payload.
   * @returns An observable emitting the updated transaction record.
   */
  public updateTransaction(trx_uuid: string, transaction: any): Observable<any> {
    const params = JSON.stringify(transaction);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}transaction/${trx_uuid}`, params, { headers });
  }

  /**
   * Deletes a cash-flow transaction record by its UUID.
   *
   * @param trx_uuid Unique identifier of the transaction to delete.
   * @returns An observable emitting the deletion response.
   */
  public deleteTransaction(trx_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}transaction/${trx_uuid}`, { headers });
  }
}
