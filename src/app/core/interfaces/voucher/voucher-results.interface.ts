import { VoucherInterface } from "./voucher.interface";

export interface VoucherResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: VoucherInterface[]
}