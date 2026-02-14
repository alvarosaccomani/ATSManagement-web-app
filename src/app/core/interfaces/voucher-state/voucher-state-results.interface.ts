import { VoucherStateInterface } from "./voucher-state.interface";

export interface VoucherStateResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: VoucherStateInterface[]
}