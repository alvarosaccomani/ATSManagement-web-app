import { PeriodInterface } from "./period.interface";

export interface PeriodResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: PeriodInterface[]
}