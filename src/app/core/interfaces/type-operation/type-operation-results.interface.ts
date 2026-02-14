import { TypeOperationInterface } from "./type-operation.interface";

export interface TypeOperationResults {
  item: number;
  itemOf: number;
  numElements: number;
  totalPages: number;
  data: TypeOperationInterface[]
}