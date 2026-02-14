import { PaymentPeriodStatusInterface } from "./payment-period-status.interface";

export interface PaymentPeriodStatusResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: PaymentPeriodStatusInterface[]
}