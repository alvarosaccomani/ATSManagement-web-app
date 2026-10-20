import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { PersonInterface } from '../interfaces/person.interface';
import { ScopeInterface } from '../interfaces/scope.interface';
import { TransactionInterface } from '../interfaces/transaction.interface';

/**
 * Representa una fila individual procesada a partir de una planilla Excel de gastos.
 */
export interface ParsedExpenseRow {
  /** Número de fila en el archivo Excel (1-indexed considerando encabezado). */
  rowIndex: number;
  /** Indica si la fila posee todos los datos obligatorios para ser importada. */
  isValid: boolean;
  /** Lista de mensajes de error o advertencias detectadas en la fila. */
  errors: string[];
  /** Tipo de movimiento resuelto (`EGRESO` para gastos, `INGRESO` para ventas). */
  trx_type: 'EGRESO' | 'INGRESO';
  /** Texto original del tipo tal cual figuraba en el archivo Excel. */
  rawType?: string;
  /** Objeto de fecha de la transacción procesada. */
  date: Date;
  /** Fecha en formato legible para visualización (`DD/MM/AAAA`). */
  dateFormatted: string;
  /** Concepto o descripción del gasto o venta. */
  concept: string;
  /** Monto numérico del movimiento. */
  amount: number;
  /** Texto original del comprador/pagador o vendedor tal cual figuraba en el archivo. */
  rawBuyer: string;
  /** UUID de la persona identificada como actor interno (pagador en gasto o vendedor en venta), o `null`. */
  prs_uuidactor: string | null;
  /** Nombre resuelto del socio o pagador/vendedor en el sistema. */
  actorName: string;
  /** Texto original del proveedor/comercio o cliente tal cual figuraba en el archivo. */
  rawSupplier?: string;
  /** UUID de la persona identificada como contraparte externa (proveedor o cliente), o `null`. */
  prs_uuid: string | null;
  /** Nombre resuelto del proveedor o cliente en el sistema. */
  supplierName: string;
  /** Texto original de la cuenta o medio de pago. */
  rawAccount?: string;
  /** UUID de la cuenta o tarjeta resuelta, o `null` si no se especificó. */
  crd_uuid: string | null;
  /** Nombre resuelto de la cuenta en el sistema. */
  accountName: string;
  /** Notas u observaciones asociadas a la transacción. */
  notes: string;
}

/**
 * Resultado completo del análisis y parseo de una planilla Excel de transacciones.
 */
export interface ExcelParseResult {
  /** Nombre del archivo analizado. */
  fileName: string;
  /** Total de filas con contenido leídas. */
  totalRows: number;
  /** Cantidad de filas válidas listas para importar. */
  validRowsCount: number;
  /** Cantidad de filas con observaciones o datos faltantes. */
  invalidRowsCount: number;
  /** Suma acumulada de los importes de todas las filas válidas. */
  totalAmount: number;
  /** Suma acumulada de los gastos (Egresos). */
  totalExpenseAmount: number;
  /** Suma acumulada de las ventas (Ingresos). */
  totalIncomeAmount: number;
  /** Arreglo detallado de filas parseadas para previsualización. */
  rows: ParsedExpenseRow[];
  /** Lista de compradores presentes en el Excel que no fueron encontrados en el ámbito. */
  unmatchedBuyers: string[];
}

/**
 * Servicio utilitario para la generación de plantillas Excel de carga masiva
 * y la lectura, validación y normalización de planillas de gastos.
 */
@Injectable({
  providedIn: 'root'
})
export class ExcelTransactionsService {

  /**
   * Genera y dispara la descarga en el navegador de una plantilla Excel modelo (`.xlsx`)
   * preconfigurada para la carga de gastos, incluyendo datos de referencia del ámbito activo.
   *
   * @param scope Ámbito contable actualmente seleccionado.
   * @param persons Lista de personas y contactos del ámbito para referencia en la plantilla.
   * @param cards Lista de cuentas y medios de pago disponibles del usuario.
   */
  public downloadExpenseTemplate(
    scope: ScopeInterface | null,
    persons: PersonInterface[],
    cards: any[]
  ): void {
    const wb = XLSX.utils.book_new();

    // 1. Hoja Principal: Gastos y Ventas
    const templateData = [
      ['Fecha', 'Tipo', 'Descripcion', 'Importe', 'Socio / Vendedor', 'Proveedor / Cliente', 'Cuenta', 'Observaciones'],
      ['15/04/2026', 'GASTO', 'Compra Filamento Madera y Caoba', 47500.00, persons[0]?.prs_name || 'Alvaro', 'Filamentos 3D', cards[0]?.label || 'Efectivo', 'Pago con transferencia'],
      ['16/04/2026', 'VENTA', 'Venta Pack Llaveros Nova', 65000.00, persons[1]?.prs_name || 'Santiago', 'Empresa Nova', cards[0]?.label || 'Efectivo', 'Facturado']
    ];

    const wsGastos = XLSX.utils.aoa_to_sheet(templateData);

    // Ajustar anchos de columnas en hoja Gastos
    wsGastos['!cols'] = [
      { wch: 14 }, // Fecha
      { wch: 12 }, // Tipo (GASTO / VENTA)
      { wch: 35 }, // Descripcion
      { wch: 16 }, // Importe
      { wch: 25 }, // Comprador / Vendedor
      { wch: 25 }, // Proveedor / Cliente
      { wch: 25 }, // Cuenta
      { wch: 35 }  // Observaciones
    ];

    XLSX.utils.book_append_sheet(wb, wsGastos, 'Movimientos');

    // 2. Hoja de Ayuda / Referencias Válidas
    const referenceData: any[][] = [
      ['VALORES PERMITIDOS DE TIPO', 'PERSONAS / SOCIOS DEL AMBITO', 'CUENTAS / FUENTES DE DINERO', 'INSTRUCCIONES DE USO'],
      ['GASTO (para egresos o compras)', '(Utilizar en Comprador / Vendedor o Proveedor)', '(Opcional: asociar a cuenta)', ''],
      ['VENTA (para ingresos o cobros)', '', '', '']
    ];

    const maxRows = Math.max(persons.length, cards.length, 6);
    const instructions = [
      '1. Fecha: Admite formato DD/MM/AAAA, AAAA-MM-DD o fecha directa de Excel.',
      '2. Tipo: "GASTO" o "VENTA". Si no se indica, toma el valor por defecto configurado.',
      '3. Descripcion: Concepto o detalle de la operación (obligatorio).',
      '4. Importe: Monto numérico sin signo pesos (ej: 15400 o 15400.50).',
      '5. Socio / Vendedor: Socio que pagó el gasto de su dinero, o socio/vendedor que realizó la venta.',
      '6. Proveedor / Cliente: Comercio al que se compró, o cliente que compró.'
    ];

    for (let i = 0; i < maxRows; i++) {
      const typeRef = i === 0 ? 'GASTO' : (i === 1 ? 'VENTA' : '');
      const personName = persons[i] ? `${persons[i].prs_name} (${persons[i].prs_type})` : '';
      const cardLabel = cards[i] ? cards[i].label : '';
      const instruction = instructions[i] || '';
      referenceData.push([typeRef, personName, cardLabel, instruction]);
    }

    const wsReferencias = XLSX.utils.aoa_to_sheet(referenceData);
    wsReferencias['!cols'] = [
      { wch: 25 },
      { wch: 35 },
      { wch: 35 },
      { wch: 80 }
    ];

    XLSX.utils.book_append_sheet(wb, wsReferencias, 'Referencias');

    // Nombre de archivo contextual
    const scopeSuffix = scope?.scp_name ? `_${scope.scp_name.toLowerCase().replace(/\s+/g, '_')}` : '';
    const fileName = `plantilla_gastos${scopeSuffix}.xlsx`;

    XLSX.writeFile(wb, fileName);
  }

  /**
   * Exporta un listado de transacciones a una planilla Excel (.xlsx) estructurada y formateada.
   *
   * @param transactions Arreglo de transacciones a exportar.
   * @param scopeName Nombre del ámbito actual para el título y nombre de archivo.
   * @param cards Lista opcional de tarjetas/cuentas del usuario para resolver el nombre del medio de pago.
   */
  public exportTransactionsToExcel(
    transactions: TransactionInterface[],
    scopeName: string = 'Todos',
    cards: any[] = []
  ): void {
    const cardMap = new Map<string, string>();
    cards.forEach(c => {
      if (c.value && c.label) cardMap.set(c.value, c.label);
      if (c.crd_uuid && (c.crd_alias || c.label)) cardMap.set(c.crd_uuid, c.crd_alias || c.label);
    });

    const wb = XLSX.utils.book_new();

    const headers = [
      'Fecha',
      'Tipo',
      'Ámbito',
      'Concepto / Comercio',
      'Importe',
      'Moneda',
      'Cuenta / Fuente',
      'Proveedor / Cliente',
      'Socio / Vendedor',
      'Notas'
    ];

    const dataRows = transactions.map(t => {
      let dateFormatted = '';
      if (t.trx_datetime) {
        const d = new Date(t.trx_datetime);
        if (!isNaN(d.getTime())) {
          dateFormatted = this.formatDateDisplay(d);
        }
      }

      const accountLabel = t.crd_uuid ? (cardMap.get(t.crd_uuid) || '') : '';
      const scopeLabel = t.scp?.scp_name || '';
      const counterparty = t.prs?.prs_name || '';
      const actor = t.actor?.prs_name || '';

      return [
        dateFormatted,
        t.trx_type,
        scopeLabel,
        t.trx_concept,
        t.trx_amount,
        t.trx_currency || 'ARS',
        accountLabel,
        counterparty,
        actor,
        t.trx_notes || ''
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

    ws['!cols'] = [
      { wch: 14 }, // Fecha
      { wch: 16 }, // Tipo
      { wch: 20 }, // Ámbito
      { wch: 35 }, // Concepto
      { wch: 16 }, // Importe
      { wch: 10 }, // Moneda
      { wch: 25 }, // Cuenta
      { wch: 25 }, // Proveedor / Cliente
      { wch: 25 }, // Socio / Vendedor
      { wch: 40 }  // Notas
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Movimientos');

    const cleanScope = scopeName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const today = new Date();
    const dateSuffix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const fileName = `movimientos_${cleanScope}_${dateSuffix}.xlsx`;

    XLSX.writeFile(wb, fileName);
  }

  /**
   * Lee y analiza un archivo `.xlsx` subido por el usuario, transformando cada fila
   * en un registro de gasto con validaciones de fecha, importe y coincidencia de personas.
   *
   * @param file Archivo subido mediante input de tipo file o drag and drop.
   * @param scopeUuid UUID del ámbito contable al que se destinarán los gastos.
   * @param persons Contactos registrados en el ámbito para el mapeo inteligente de compradores.
   * @param cards Cuentas registradas para el mapeo opcional de fuentes de dinero.
   * @returns Promesa que resuelve en {@link ExcelParseResult}.
   */
  public async parseExpenseExcel(
    file: File,
    scopeUuid: string,
    persons: PersonInterface[],
    cards: any[],
    defaultMovementType: 'AUTO' | 'EGRESO' | 'INGRESO' = 'EGRESO'
  ): Promise<ExcelParseResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array', cellDates: false });

          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error('El archivo Excel no contiene hojas de datos.');
          }

          // Tomar la primera hoja (o la que se llame 'Gastos' o 'Movimientos')
          const sheetName = workbook.SheetNames.find(n => 
            n.toLowerCase().includes('gasto') || n.toLowerCase().includes('movimiento')
          ) || workbook.SheetNames[0];

          const worksheet = workbook.Sheets[sheetName];
          const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: '' });

          if (!rawRows || rawRows.length < 2) {
            throw new Error('La planilla no contiene filas de datos o está vacía.');
          }

          // Detectar la fila de encabezados
          let headerRowIndex = 0;
          for (let i = 0; i < Math.min(rawRows.length, 5); i++) {
            const rowStr = rawRows[i].map((c: any) => String(c).toLowerCase()).join(' ');
            if (rowStr.includes('fecha') || rowStr.includes('descripcion') || rowStr.includes('importe')) {
              headerRowIndex = i;
              break;
            }
          }

          const headers = rawRows[headerRowIndex].map((h: any) => String(h).trim().toLowerCase());
          const dateIdx = headers.findIndex(h => h.includes('fecha'));
          const typeIdx = headers.findIndex(h => h.includes('tipo') || h.includes('type') || h.includes('movimiento'));
          const descIdx = headers.findIndex(h => h.includes('descrip') || h.includes('concepto') || h.includes('detalle'));
          const amountIdx = headers.findIndex(h => h.includes('importe') || h.includes('monto') || h.includes('precio') || h.includes('total'));
          const buyerIdx = headers.findIndex(h => h.includes('comprador') || h.includes('vendedor') || h.includes('socio') || h.includes('pagador'));
          const supplierIdx = headers.findIndex(h => h.includes('proveedor') || h.includes('cliente') || h.includes('comercio'));
          const accountIdx = headers.findIndex(h => h.includes('cuenta') || h.includes('origen') || h.includes('tarjeta'));
          const notesIdx = headers.findIndex(h => h.includes('observ') || h.includes('nota') || h.includes('comentario'));

          const parsedRows: ParsedExpenseRow[] = [];
          const unmatchedBuyersSet = new Set<string>();
          let validCount = 0;
          let invalidCount = 0;
          let totalSum = 0;
          let totalExpense = 0;
          let totalIncome = 0;

          for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
            const row = rawRows[r];
            // Ignorar filas totalmente vacías
            if (!row || row.every((c: any) => c === '' || c == null)) {
              continue;
            }

            const errors: string[] = [];
            const rawDateVal = dateIdx !== -1 ? row[dateIdx] : '';
            const rawTypeVal = typeIdx !== -1 ? String(row[typeIdx] || '').trim().toUpperCase() : '';
            const rawDesc = descIdx !== -1 ? String(row[descIdx] || '').trim() : '';
            const rawAmount = amountIdx !== -1 ? row[amountIdx] : '';
            const rawBuyer = buyerIdx !== -1 ? String(row[buyerIdx] || '').trim() : '';
            const rawSupplier = supplierIdx !== -1 ? String(row[supplierIdx] || '').trim() : '';
            const rawAccount = accountIdx !== -1 ? String(row[accountIdx] || '').trim() : '';
            const rawNotes = notesIdx !== -1 ? String(row[notesIdx] || '').trim() : '';

            // 1. Determinar Tipo de Movimiento (EGRESO vs INGRESO)
            let trx_type: 'EGRESO' | 'INGRESO' = 'EGRESO';
            if (rawTypeVal.includes('VENTA') || rawTypeVal.includes('INGRESO') || rawTypeVal.includes('INCOME')) {
              trx_type = 'INGRESO';
            } else if (rawTypeVal.includes('GASTO') || rawTypeVal.includes('EGRESO') || rawTypeVal.includes('EXPENSE')) {
              trx_type = 'EGRESO';
            } else {
              if (defaultMovementType === 'INGRESO') {
                trx_type = 'INGRESO';
              } else if (defaultMovementType === 'EGRESO') {
                trx_type = 'EGRESO';
              } else {
                // Auto: inferir por texto de descripción
                const lower = rawDesc.toLowerCase();
                if (lower.startsWith('venta') || lower.startsWith('cobro') || lower.includes('venta de') || lower.includes('cobro de')) {
                  trx_type = 'INGRESO';
                } else {
                  trx_type = 'EGRESO';
                }
              }
            }

            // 2. Parsear Fecha
            const dateObj = this.parseExcelDate(rawDateVal);
            if (!dateObj) {
              errors.push('Fecha inválida o no reconocida.');
            }
            const finalDate = dateObj || new Date();
            const dateFormatted = this.formatDateDisplay(finalDate);

            // 3. Validar Descripción
            if (!rawDesc) {
              errors.push('El concepto o descripción es obligatorio.');
            }

            // 4. Parsear Importe
            const amountNum = this.parseExcelAmount(rawAmount);
            if (amountNum <= 0) {
              errors.push('El importe debe ser un número mayor a cero.');
            }

            // 5. Mapear Actor Interno (Socio Pagador en gasto o Vendedor en venta)
            let prs_uuidactor: string | null = null;
            let actorName = '';
            if (rawBuyer) {
              const matchedPerson = this.findPersonByName(rawBuyer, persons);
              if (matchedPerson) {
                prs_uuidactor = matchedPerson.prs_uuid;
                actorName = matchedPerson.prs_name;
              } else {
                unmatchedBuyersSet.add(rawBuyer);
                actorName = rawBuyer;
                errors.push(`Persona "${rawBuyer}" no existe en el ámbito (se conservará en notas).`);
              }
            }

            // 6. Mapear Contraparte Externa (Proveedor en gasto o Cliente en venta)
            let prs_uuid: string | null = null;
            let supplierName = '';
            if (rawSupplier) {
              const matchedSupplier = this.findPersonByName(rawSupplier, persons);
              if (matchedSupplier) {
                prs_uuid = matchedSupplier.prs_uuid;
                supplierName = matchedSupplier.prs_name;
              } else {
                supplierName = rawSupplier;
              }
            }

            // 7. Mapear Cuenta
            let crd_uuid: string | null = null;
            let accountName = '';
            if (rawAccount) {
              const matchedCard = cards.find(c =>
                c.label && c.label.toLowerCase().includes(rawAccount.toLowerCase())
              );
              if (matchedCard) {
                crd_uuid = matchedCard.value;
                accountName = matchedCard.label;
              } else {
                accountName = rawAccount;
              }
            }

            const isValid = errors.filter(e => !e.includes('se conservará en notas')).length === 0;
            if (isValid) {
              validCount++;
              totalSum += amountNum;
              if (trx_type === 'INGRESO') {
                totalIncome += amountNum;
              } else {
                totalExpense += amountNum;
              }
            } else {
              invalidCount++;
            }

            parsedRows.push({
              rowIndex: r + 1,
              isValid,
              errors,
              trx_type,
              rawType: rawTypeVal,
              date: finalDate,
              dateFormatted,
              concept: rawDesc,
              amount: amountNum,
              rawBuyer,
              prs_uuidactor,
              actorName,
              rawSupplier,
              prs_uuid,
              supplierName,
              rawAccount,
              crd_uuid,
              accountName,
              notes: rawNotes
            });
          }

          resolve({
            fileName: file.name,
            totalRows: parsedRows.length,
            validRowsCount: validCount,
            invalidRowsCount: invalidCount,
            totalAmount: Math.round(totalSum * 100) / 100,
            totalExpenseAmount: Math.round(totalExpense * 100) / 100,
            totalIncomeAmount: Math.round(totalIncome * 100) / 100,
            rows: parsedRows,
            unmatchedBuyers: Array.from(unmatchedBuyersSet)
          });
        } catch (error: any) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado.'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Intenta resolver una persona en la lista comparando nombres de forma insensible a mayúsculas y acentos.
   *
   * @param searchName Nombre buscado.
   * @param persons Lista de personas disponibles.
   * @returns La persona coincidente o `undefined`.
   */
  private findPersonByName(searchName: string, persons: PersonInterface[]): PersonInterface | undefined {
    const clean = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const query = clean(searchName);
    return persons.find(p => {
      const pName = clean(p.prs_name);
      return pName === query || pName.includes(query) || query.includes(pName);
    });
  }

  /**
   * Parsea un valor de fecha que puede venir como número de serie de Excel, objeto Date o cadena de texto.
   *
   * @param val Valor crudo de fecha de la celda.
   * @returns Objeto `Date` válido o `null`.
   */
  private parseExcelDate(val: any): Date | null {
    if (!val && val !== 0) return null;

    // 1. Si ya es una instancia de Date (generada por XLSX o JS)
    if (val instanceof Date && !isNaN(val.getTime())) {
      return new Date(val.getUTCFullYear(), val.getUTCMonth(), val.getUTCDate(), 12, 0, 0);
    }

    // 2. Si es número serial de Excel (ej: 46116)
    const num = Number(val);
    if (!isNaN(num) && num > 20000 && num < 80000) {
      try {
        const parsed = XLSX.SSF.parse_date_code(num);
        if (parsed && parsed.y && parsed.m && parsed.d) {
          return new Date(parsed.y, parsed.m - 1, parsed.d, 12, 0, 0);
        }
      } catch (err) {
        // continúa a string fallback
      }
    }

    // 3. Si es cadena de texto (ej: "15/04/2026", "4/15/2026", "2026-04-15", "15/04/26")
    const str = String(val).trim();
    if (str.includes('/') || str.includes('-') || str.includes('.')) {
      const parts = str.split(/[\/\-\.]/);
      if (parts.length === 3) {
        const p0 = parseInt(parts[0], 10);
        const p1 = parseInt(parts[1], 10);
        const p2 = parseInt(parts[2], 10);

        if (isNaN(p0) || isNaN(p1) || isNaN(p2)) return null;

        let year: number;
        let month: number;
        let day: number;

        // Caso A: AAAA-MM-DD o AAAA/MM/DD (año de 4 dígitos al inicio)
        if (parts[0].length === 4 || p0 > 1000) {
          year = p0;
          month = p1 - 1;
          day = p2;
        }
        // Caso B: DD/MM/AAAA o MM/DD/AAAA (año de 4 dígitos al final)
        else if (parts[2].length === 4 || p2 > 1000) {
          year = p2;
          if (p0 > 12 && p1 <= 12) {
            day = p0;
            month = p1 - 1;
          } else if (p1 > 12 && p0 <= 12) {
            month = p0 - 1;
            day = p1;
          } else {
            // Por defecto en Argentina y español: DD/MM/AAAA (primer número es el día)
            day = p0;
            month = p1 - 1;
          }
        }
        // Caso C: año de 2 dígitos (ej: 15/04/26 o 26/04/15)
        else {
          if (p0 <= 31 && p2 <= 99) {
            year = p2 < 100 ? (p2 < 50 ? 2000 + p2 : 1900 + p2) : p2;
            if (p0 > 12 && p1 <= 12) {
              day = p0;
              month = p1 - 1;
            } else if (p1 > 12 && p0 <= 12) {
              month = p0 - 1;
              day = p1;
            } else {
              day = p0;
              month = p1 - 1;
            }
          } else {
            year = p0 < 100 ? (p0 < 50 ? 2000 + p0 : 1900 + p0) : p0;
            month = p1 - 1;
            day = p2;
          }
        }

        const d = new Date(year, month, day, 12, 0, 0);
        if (!isNaN(d.getTime())) return d;
      }
    }

    const fallback = new Date(val);
    if (!isNaN(fallback.getTime())) {
      return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate(), 12, 0, 0);
    }
    return null;
  }

  /**
   * Limpia y convierte un valor crudo de celda de importe a número de punto flotante positivo.
   *
   * @param val Valor crudo que puede contener `$`, `,`, espacios o signo negativo.
   * @returns Monto numérico absoluto o 0.
   */
  private parseExcelAmount(val: any): number {
    if (typeof val === 'number') {
      return Math.abs(val);
    }
    if (!val) return 0;

    let str = String(val).trim();
    // Remover signo de moneda y espacios
    str = str.replace(/[$€\s]/g, '');

    // Si viene con formato argentino/europeo 1.000,50 o americano 1,000.50
    const hasComma = str.includes(',');
    const hasDot = str.includes('.');

    if (hasComma && hasDot) {
      if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
        // Formato 1.000,50
        str = str.replace(/\./g, '').replace(',', '.');
      } else {
        // Formato 1,000.50
        str = str.replace(/,/g, '');
      }
    } else if (hasComma && !hasDot) {
      // 1000,50
      str = str.replace(',', '.');
    }

    // Remover posibles signos negativos ya que estamos registrando egresos/gastos
    str = str.replace(/-/g, '');

    const parsed = parseFloat(str);
    return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
  }

  /**
   * Formatea un objeto Date al formato de visualización `DD/MM/AAAA`.
   *
   * @param d Objeto de fecha a formatear.
   * @returns Cadena formateada.
   */
  private formatDateDisplay(d: Date): string {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
