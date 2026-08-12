import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VouchersParserService {

  constructor() { }

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

  private matchPattern(text: string, regex: RegExp): string | null {
    const match = text.match(regex);
    return match ? match[1] || match[0] : null;
  }

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
