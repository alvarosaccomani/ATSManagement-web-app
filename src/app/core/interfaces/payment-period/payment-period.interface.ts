import { PaymentMethodInterface } from "../payment-method";
import { PaymentPeriodStatusInterface } from "../payment-period-status";

export interface PaymentPeriodInterface {
  usr_uuid: string;
  crd_uuid: string;
  per_uuid: string;
  payp_uuid: string;
  payp_paymentdate: string;
  payp_amountpaid: string;
  paym_uuid: string;
  paym: PaymentMethodInterface;
  payp_paymentreference: string | null;
  payps_uuid: string;
  payps: PaymentPeriodStatusInterface;
  payp_createdat: string;
  payp_updatedat: string;
}
