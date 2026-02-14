import { BrandCardInterface } from "./brand-card.interface";

export interface BrandCardResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: BrandCardInterface[]
}