import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AIChatInterface } from '../interfaces/aiChat.interface';

/**
 * Servicio responsable de interactuar con el endpoint del backend de IA (integración con OpenRouter).
 *
 * @description Envía texto OCR o prompts de chat al modelo LLM configurado (como `qwen/qwen3-4b:free`)
 * para extraer información estructurada de comprobantes en formato JSON.
 */
@Injectable({
  providedIn: 'root'
})
export class AiService {

  /**
   * Inicializa el servicio de IA con el cliente HTTP de Angular.
   *
   * @param _http Instancia de `HttpClient` de Angular.
   */
  constructor(
    private _http: HttpClient
  ) { }

  /**
   * Envía una carga útil de prompt al endpoint del modelo de chat de OpenRouter.
   *
   * @param chat Solicitud de chat de IA que contiene el modelo (`model`) de destino y el prompt (`message`).
   * @returns Un observable que emite la respuesta de completado de la IA.
   */
  public chatModel(chat: AIChatInterface): Observable<any> {
    let params = JSON.stringify(chat);
    let headers = new HttpHeaders().set('content-type','application/json');

    return this._http.post(environment.apiAI + 'open-router/chat-model', params, {headers:headers});
  }
}
