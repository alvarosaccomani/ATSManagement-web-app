import { VoucherFeeStatusInterface } from "./voucher-fee-status.interface";

export interface VoucherFeeStatusInterfaceResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: VoucherFeeStatusInterface[]
}