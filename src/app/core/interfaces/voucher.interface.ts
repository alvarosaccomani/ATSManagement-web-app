import { TypeOperationInterface } from "./type-operation.interface";
import { VoucherStateInterface } from "./voucher-state.interface";

export interface VoucherInterface {
  usr_uuid: string;
  crd_uuid: string;
  per_uuid: string;
  vou_uuid: string;
  vou_authorizationnumber: string;
  vou_transactionnumber: string;
  vou_datetime: string;
  vou_amount: string;
  vou_currency: string;
  vou_commercename: string;
  vou_commercecuit: string;
  vou_commercecategory: string;
  tyop_uuid: string;
  tyop: TypeOperationInterface;
  vou_installments: boolean;
  vou_installmentcount: number;
  vou_installmentinterest: string;
  vou_poscode: string | null;
  vou_reference: string | null;
  vous_uuid: string;
  vous: VoucherStateInterface;
  vou_image: string | null;
  vou_notes: string | null;
  vou_createdat: string;
  vou_updatedat: string;
}
