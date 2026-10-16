import { TypeCardInterface } from "../type-card";
import { BrandCardInterface } from "../brand-card";
import { BankInterface } from "../bank";
import { ScopeInterface } from "../scope.interface";

/**
 * Representa una tarjeta de crédito o débito registrada por un usuario.
 */
export interface CardInterface {
  /** Identificador único del usuario propietario de la tarjeta. */
  usr_uuid: string;
  /** Identificador único de la tarjeta. */
  crd_uuid: string;
  /** UUID opcional del ámbito al que está asignada esta tarjeta. */
  scp_uuid?: string | null;
  /** Relación de ámbito poblada opcionalmente. */
  scp?: ScopeInterface;
  /** Alias descriptivo opcional para la tarjeta. */
  crd_alias?: string | null;
  /** Nombre del titular impreso en la tarjeta opcional. */
  crd_cardholdername?: string | null;
  /** Representación enmascarada del número de la tarjeta. */
  crd_maskedcardnumber: string;
  /** Últimos 4 dígitos del número de la tarjeta. */
  crd_last4digits: string;
  /** UUID del tipo de tarjeta (por ejemplo, `'1'` para Débito, `'2'` para Crédito). */
  tycrd_uuid: string;
  /** Entidad poblada del tipo de tarjeta. */
  tycrd: TypeCardInterface;
  /** UUID de la marca de la tarjeta. */
  brcrd_uuid: string;
  /** Entidad poblada de la marca de la tarjeta. */
  brcrd: BrandCardInterface;
  /** UUID del banco emisor. */
  ban_uuid: string;
  /** Entidad poblada del banco emisor. */
  ban: BankInterface;
  /** Fecha de vencimiento de la tarjeta (cadena de fecha ISO). */
  crd_expirationdate: string;
  /** Límite de crédito asignado a la tarjeta (o `0`/`null` para tarjetas de débito). */
  crd_creditlimit: number | null;
  /** Indica si la tarjeta se encuentra actualmente activa. */
  crd_active: boolean;
  /** Indica si la tarjeta puede delegarse a otros usuarios en un ámbito compartido. */
  crd_allowdelegation?: boolean;
  /** Marca de tiempo ISO de cuando se creó el registro de la tarjeta. */
  crd_createdat: string;
  /** Marca de tiempo ISO de la última actualización del registro de la tarjeta. */
  crd_updatedat: string;
}
