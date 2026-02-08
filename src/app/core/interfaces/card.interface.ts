import { TypeCardInterface } from "./type-card.interface";
import { BrandCardInterface } from "./brand-card.interface";
import { BankInterface } from "./bank.interface";

export interface CardInterface {
  usr_uuid: string;
  crd_uuid: string;
  crd_maskedcardnumber: string;
  crd_last4digits: string;
  tycrd_uuid: string;
  tycrd: TypeCardInterface;
  brcrd_uuid: string;
  brcrd: BrandCardInterface;
  ban_uuid: string;
  ban: BankInterface;
  crd_expirationdate: string;
  crd_creditlimit: number | null;
  crd_active: boolean;
  crd_createdat: string;
  crd_updatedat: string;
}
