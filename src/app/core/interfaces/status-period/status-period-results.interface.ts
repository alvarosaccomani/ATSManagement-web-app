import { StatusPeriodInterface } from "./status-period.interface";

export interface StatusPeriodResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: StatusPeriodInterface[]
}