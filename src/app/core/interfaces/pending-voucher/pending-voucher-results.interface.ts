import { PendingVoucherInterface } from "./pending-voucher.interface";

export interface PendingVoucherResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: PendingVoucherInterface[]
}