import { PaymentPeriodInterface } from "./payment-period.interface";

export interface PaymentPeriodResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: PaymentPeriodInterface[]
}