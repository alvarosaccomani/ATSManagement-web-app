import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TransactionResults } from '../interfaces/transaction.interface';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  constructor(
    private _http: HttpClient
  ) { }

  public getTransactions(scp_uuid: string, trx_type?: string): Observable<TransactionResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    let params = new HttpParams();
    if (trx_type) {
      params = params.set('trx_type', trx_type);
    }
    return this._http.get<TransactionResults>(`${environment.apiUrl}transactions/${scp_uuid}`, { headers, params });
  }

  public getTransactionById(trx_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.get<any>(`${environment.apiUrl}transaction/${trx_uuid}`, { headers });
  }

  public saveTransaction(transaction: any): Observable<any> {
    const params = JSON.stringify(transaction);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.post(`${environment.apiUrl}transaction`, params, { headers });
  }

  public updateTransaction(trx_uuid: string, transaction: any): Observable<any> {
    const params = JSON.stringify(transaction);
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.put(`${environment.apiUrl}transaction/${trx_uuid}`, params, { headers });
  }

  public deleteTransaction(trx_uuid: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this._http.delete(`${environment.apiUrl}transaction/${trx_uuid}`, { headers });
  }
}
