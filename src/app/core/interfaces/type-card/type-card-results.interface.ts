import { TypeCardInterface } from "./type-card.interface";

export interface TypeCardResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: TypeCardInterface[]
}