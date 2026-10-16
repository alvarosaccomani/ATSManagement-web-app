import { Injectable } from '@angular/core';

/**
 * Service that parses raw OCR text from receipts/vouchers using regular expressions
 * to extract key financial fields (CUIT, date, total amount, and card last 4 digits).
 */
@Injectable({
  providedIn: 'root'
})
export class VouchersParserService {

  constructor() { }

  /**
   * Parses raw OCR text and extracts structured receipt fields.
   *
   * @param text Raw text recognized from the receipt image.
   * @returns An object containing `cuit`, `fecha`, `monto`, `tarjeta_nro`, and `comercio`.
   */
  parseText(text: string): any {
    const cleanText = text.toUpperCase();
    
    const data = {
      // Busca 11 dígitos con o sin guiones
      cuit: this.matchPattern(cleanText, /\b(20|23|27|30|33)-?\d{8}-?\d\b/),
      
      // Busca fechas tipo DD/MM/AAAA o DD-MM-YY
      fecha: this.matchPattern(cleanText, /\b\d{2}[\/\-]\d{2}[\/\-]\d{2,4}\b/),
      
      // Busca montos (ej: $ 87.500,00 o TOTAL 1500.50)
      monto: this.parseAmount(cleanText),
      
      // Busca los últimos 4 dígitos de la tarjeta
      tarjeta_nro: this.matchPattern(cleanText, /(?:TARJETA|VISA|MASTER|MAESTRO|TERMINAL).*\b(\d{4})\b/),
      
      // Intenta identificar el comercio al inicio del texto
      comercio: null//this.detectMerchant(cleanText)
    };

    return data;
  }

  /**
   * Evaluates a regular expression against the normalized text and returns the first captured group or full match.
   *
   * @param text Uppercase normalized receipt text.
   * @param regex Regular expression pattern to match.
   * @returns The matched substring or `null` if not found.
   */
  private matchPattern(text: string, regex: RegExp): string | null {
    const match = text.match(regex);
    return match ? match[1] || match[0] : null;
  }

  /**
   * Extracts and normalizes the total monetary amount from the receipt text.
   *
   * @param text Uppercase normalized receipt text.
   * @returns The parsed numeric amount, or `null` if no amount pattern matched.
   */
  private parseAmount(text: string): number | null {
    // Buscamos el valor numérico después de palabras clave como TOTAL, IMPORTE o el signo $
    const regex = /(?:TOTAL|IMPORTE|[\$])\s*([\d\.\,]+)/;
    const match = text.match(regex);
    if (match) {
      let val = match[1].replace(/\./g, '').replace(',', '.');
      return parseFloat(val);
    }
    return null;
  }
}
