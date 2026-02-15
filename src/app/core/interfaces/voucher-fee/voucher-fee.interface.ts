import { VoucherFeeStatusInterface } from "../voucher-fee-status";

export interface VoucherFeeInterface {
  usr_uuid: string;
  crd_uuid: string;
  per_uuid: string;
  vou_uuid: string;
  vouf_uuid: string;
  vouf_quotanumber: number;
  vouf_quotaamount: number;
  vouf_quotaduedate: string;
  voufs_uuid: string;
  voufs: VoucherFeeStatusInterface;
  vouf_createdat: string;
  vouf_updatedat: string;
}
