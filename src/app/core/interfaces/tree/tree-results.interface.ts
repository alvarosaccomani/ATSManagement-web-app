import { TreeInterface } from "./tree.interface";

export interface TreeResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: TreeInterface[]
}