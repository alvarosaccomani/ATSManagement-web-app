import { TreeInterface } from "./tree.interface";

/**
 * Contenedor de respuesta paginada de la API para consultas del árbol jerárquico.
 */
export interface TreeResults {
  /** Número de página actual o índice del elemento inicial. */
  item: number;
  /** Cantidad de elementos por página. */
  itemOf: number;
  /** Cantidad total de elementos que coinciden con la consulta. */
  numElements: number;
  /** Cantidad total de páginas disponibles. */
  totalPages: number;
  /** Arreglo de nodos raíz del árbol. */
  data: TreeInterface[]
}