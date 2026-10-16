/**
 * Representa un nodo en el árbol jerárquico de navegación de documentos y comprobantes (`<app-tree-view>`).
 */
export interface TreeInterface {
  /** Etiqueta visible del nodo del árbol. */
  title: string;
  /** Clave única que identifica al nodo en la jerarquía. */
  key: string;
  /** Nombre del ícono asociado al nodo. */
  icon: string;
  /** Indica si el nodo es un nodo hoja terminal (elemento de comprobante). */
  isLeaf?: boolean;
  /** Arreglo opcional de nodos hijos del árbol. */
  children?: TreeInterface[];
}
