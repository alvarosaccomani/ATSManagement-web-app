import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardResults } from '../interfaces/dashboard.interface';

/**
 * Servicio para obtener resúmenes de indicadores financieros (KPI), balances por ámbito y transacciones recientes para el panel principal.
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  /**
   * Inicializa el servicio del panel principal.
   *
   * @param _http Instancia de `HttpClient` de Angular.
   */
  constructor(private _http: HttpClient) { }

  /**
   * Obtiene el resumen financiero consolidado para un usuario, opcionalmente filtrado por ámbito.
   *
   * @param usr_uuid Identificador único del usuario.
   * @param scp_uuid Filtro opcional de UUID de ámbito (`'ALL'` o UUID de un ámbito específico).
   * @returns Un observable que emite {@link DashboardResults}.
   */
  public getSummary(usr_uuid: string, scp_uuid?: string): Observable<DashboardResults> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    let params = new HttpParams();
    if (scp_uuid && scp_uuid !== 'ALL') {
      params = params.set('scp_uuid', scp_uuid);
    }
    return this._http.get<DashboardResults>(`${environment.apiUrl}dashboard/summary/${usr_uuid}`, { headers, params });
  }
}
