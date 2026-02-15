import { VoucherFeeInterface } from "./voucher-fee.interface";

export interface VoucherFeeResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: VoucherFeeInterface[]
}