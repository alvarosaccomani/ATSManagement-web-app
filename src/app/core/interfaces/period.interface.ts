import { StatusPeriodInterface } from "./status-period";

export interface PeriodInterface {
  usr_uuid: string;
  crd_uuid: string;
  per_uuid: string;
  per_periodnumber: number;
  per_startdate: string;
  per_enddate: string;
  per_duedate: string;
  sper_uuid: string;
  sper: StatusPeriodInterface;
  per_previousbalance: number;
  per_interest: number;
  per_createdat: string;
  per_updatedat: string;
}