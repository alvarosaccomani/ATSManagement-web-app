import { BankInterface } from "./bank.interface";

export interface BankResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: BankInterface[]
}