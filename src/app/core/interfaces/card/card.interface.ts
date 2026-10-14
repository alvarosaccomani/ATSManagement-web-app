import { TypeCardInterface } from "../type-card";
import { BrandCardInterface } from "../brand-card";
import { BankInterface } from "../bank";
import { ScopeInterface } from "../scope.interface";

export interface CardInterface {
  usr_uuid: string;
  crd_uuid: string;
  scp_uuid?: string | null;
  scp?: ScopeInterface;
  crd_alias?: string | null;
  crd_cardholdername?: string | null;
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
  crd_allowdelegation?: boolean;
  crd_createdat: string;
  crd_updatedat: string;
}
