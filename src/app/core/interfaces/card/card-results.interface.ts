import { CardInterface } from "./card.interface";

export interface CardResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: CardInterface[]
}