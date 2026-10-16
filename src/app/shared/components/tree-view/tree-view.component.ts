import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { NzTreeModule, NzTreeNode, NzFormatEmitEvent, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid'; // Agregado para nz-row y nz-col
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Componente reutilizable de navegación jerárquica en árbol (`<app-tree-view>`) construido sobre `nz-tree` de Ng-Zorro.
 *
 * @description Muestra jerarquías multinivel (como Tarjeta -> Período -> Comprobante) con
 * búsqueda de texto en tiempo real, controles de expandir/contraer, selección de nodos y soporte para casillas de verificación.
 */
@Component({
  selector: 'app-tree-view',
  standalone: true,
  imports: [
    NzTreeModule,
    NzIconModule,
    NzButtonModule,
    NzCardModule,
    NzTagModule,
    NzDividerModule,
    NzInputModule,
    NzGridModule, // Importante para nz-row y nz-col
    CommonModule,
    FormsModule
  ],
  templateUrl: './tree-view.component.html',
  styleUrl: './tree-view.component.scss'
})
export class TreeViewComponent {
  /** Título del encabezado de la tarjeta del árbol. */
  @Input() title: string = 'Árbol de Navegación';
  /** Subtítulo o texto descriptivo opcional. */
  @Input() description: string = '';
  /** Arreglo de opciones de nodos raíz del árbol a renderizar. */
  @Input() nodes: NzTreeNodeOptions[] = [];
  /** Indica si se debe mostrar el cuadro de entrada de búsqueda. */
  @Input() showSearch: boolean = true;
  /** Indica si se debe mostrar la barra de herramientas de acciones para expandir/contraer/marcar. */
  @Input() showToolbar: boolean = true;
  /** Indica si los nodos del árbol pueden filtrarse mediante búsqueda de texto. */
  @Input() searchable: boolean = true;
  /** Indica si los nodos padre pueden expandirse/contraerse. */
  @Input() expandable: boolean = true;
  /** Indica si los nodos muestran casillas de verificación de selección. */
  @Input() checkable: boolean = true;
  /** Indica si se pueden seleccionar múltiples nodos simultáneamente. */
  @Input() multiple: boolean = true;
  /** Indica si los nodos pueden reordenarse mediante arrastrar y soltar. */
  @Input() draggable: boolean = false;
  /** Indica si los nodos del árbol ocupan todo el ancho horizontal de su contenedor. */
  @Input() blockNode: boolean = true;
  /** Indica si se muestran iconos de nodo junto a los títulos. */
  @Input() showIcon: boolean = true;
  /** Indica si se debe mostrar el panel inferior de resumen/información para los nodos seleccionados y marcados. */
  @Input() showInfoPanel: boolean = true;
  /** Claves de los nodos expandidos por defecto. */
  @Input() defaultExpandedKeys: string[] = [];
  /** Claves de los nodos marcados por defecto. */
  @Input() defaultCheckedKeys: string[] = [];
  /** Claves de los nodos seleccionados por defecto. */
  @Input() defaultSelectedKeys: string[] = [];

  /** Emite el `NzTreeNode` pulsado cuando un usuario selecciona un nodo. */
  @Output() nodeClick = new EventEmitter<NzTreeNode>();
  /** Emite el estado de marcado del nodo y todas las claves marcadas actualmente cuando se alterna una casilla de verificación. */
  @Output() nodeCheck = new EventEmitter<{ node: NzTreeNode; checked: boolean; checkedKeys: string[] }>();
  /** Emite el arreglo actualizado de claves de nodos expandidos cuando se expande o contrae una rama. */
  @Output() nodeExpand = new EventEmitter<string[]>();

  /** Arreglo interno de objetos `NzTreeNode` instanciados. */
  treeNodes: NzTreeNode[] = [];
  /** Subconjunto filtrado de `treeNodes` que coincide con la consulta de búsqueda activa. */
  filteredNodes: NzTreeNode[] = [];
  /** Claves de los nodos actualmente expandidos. */
  expandedKeys: string[] = [];
  /** Claves de los nodos actualmente seleccionados. */
  selectedKeys: string[] = [];
  /** Claves de los nodos actualmente marcados. */
  checkedKeys: string[] = [];
  /** Referencia al nodo activo/seleccionado actualmente. */
  selectedNode: NzTreeNode | null = null;
  /** Cadena de consulta de búsqueda actual. */
  searchText: string = '';
  /** Indica si hay un filtro de búsqueda activo actualmente. */
  isSearching: boolean = false;

  /**
   * Inicializa la estructura del árbol al iniciar el componente.
   */
  ngOnInit() {
    this.initializeTree();
  }

  /**
   * Reinicializa o actualiza el estado del árbol cuando cambian las propiedades de entrada.
   *
   * @param changes Mapa `SimpleChanges` de Angular.
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['nodes'] && !changes['nodes'].firstChange) {
      this.initializeTree();
    }
    if (changes['defaultExpandedKeys']) {
      this.expandedKeys = [...this.defaultExpandedKeys];
    }
    if (changes['defaultCheckedKeys']) {
      this.checkedKeys = [...this.defaultCheckedKeys];
    }
    if (changes['defaultSelectedKeys']) {
      this.selectedKeys = [...this.defaultSelectedKeys];
      if (this.selectedKeys.length > 0) {
        this.selectedNode = this.findNodeByKey(this.treeNodes, this.selectedKeys[0]);
      }
    }
  }

  /**
   * Convierte los `nodes` de entrada sin procesar en instancias de `NzTreeNode` y aplica las claves expandidas/marcadas/seleccionadas por defecto.
   */
  initializeTree(): void {
    this.treeNodes = this.nodes.map(node => new NzTreeNode(node));
    this.filteredNodes = [...this.treeNodes];
    
    // Establecer estados por defecto
    this.expandedKeys = [...this.defaultExpandedKeys];
    this.checkedKeys = [...this.defaultCheckedKeys];
    this.selectedKeys = [...this.defaultSelectedKeys];
    
    if (this.selectedKeys.length > 0) {
      this.selectedNode = this.findNodeByKey(this.treeNodes, this.selectedKeys[0]);
    }
  }

  /**
   * Maneja los eventos de clic en un nodo y emite el `NzTreeNode` seleccionado mediante `nodeClick`.
   *
   * @param event Evento de clic en el árbol de Ng-Zorro.
   */
  onNodeClick(event: NzFormatEmitEvent): void {
    const node = event.node;
    if (node) {
      this.selectedNode = node;
      this.selectedKeys = [node.key!];
      this.nodeClick.emit(node);
      console.log('Nodo seleccionado:', node);
    }
  }

  /**
   * Maneja los eventos de alternancia de casillas de verificación de nodos y emite la selección actualizada mediante `nodeCheck`.
   *
   * @param event Evento de marcado en el árbol de Ng-Zorro.
   */
  onNodeCheck(event: any): void {
    const node = event.node;
    
    // En NG-ZORRO v19, usamos event.checkedNodes para obtener los nodos checkeados
    const checkedNodes = event.checkedKeys as NzTreeNode[] || [];
    this.checkedKeys = checkedNodes.map(n => n.key!).filter(k => k !== undefined);
    
    // Obtener el estado checked del nodo
    const checked = node?.isChecked || false;
    
    this.nodeCheck.emit({
      node: node!,
      checked: checked,
      checkedKeys: this.checkedKeys
    });
    
    console.log('Nodo checkeado:', { 
      node: node?.title, 
      checked: checked, 
      checkedKeys: this.checkedKeys 
    });
  }

  /**
   * Actualiza `expandedKeys` y emite `nodeExpand` cuando las ramas se expanden o contraen.
   *
   * @param expandedKeys Arreglo de claves de los nodos actualmente expandidos.
   */
  onExpandChange(expandedKeys: string[]): void {
    this.expandedKeys = expandedKeys;
    this.nodeExpand.emit(expandedKeys);
  }

  /**
   * Filtra los nodos del árbol en tiempo real según la consulta de búsqueda del usuario y expande las ramas coincidentes.
   *
   * @param value Cadena de entrada de búsqueda.
   */
  onSearchChange(value: string): void {
    this.searchText = value.trim();
    
    if (this.searchText === '') {
      this.filteredNodes = [...this.treeNodes];
      this.isSearching = false;
      return;
    }
    
    this.isSearching = true;
    this.filteredNodes = this.filterNodes(this.treeNodes, this.searchText);
    
    // Expandir nodos que coincidan con la búsqueda
    this.expandedKeys = this.getExpandedKeysForSearch(this.treeNodes, this.searchText);
  }

  /**
   * Filtra recursivamente una lista de nodos del árbol, preservando los nodos padre cuyos descendientes coincidan con `searchText`.
   *
   * @param nodes Nodos del árbol de origen a filtrar.
   * @param searchText Consulta de búsqueda insensible a mayúsculas y minúsculas.
   * @returns Arreglo filtrado de instancias de `NzTreeNode`.
   */
  private filterNodes(nodes: NzTreeNode[], searchText: string): NzTreeNode[] {
    const result: NzTreeNode[] = [];
    
    nodes.forEach(node => {
      const matchTitle = node.title.toLowerCase().includes(searchText.toLowerCase());
      const childrenMatch = node.children ? this.filterNodes(node.children, searchText) : [];
      
      if (matchTitle || childrenMatch.length > 0) {
        const newNode = new NzTreeNode({
          ...node.origin,
          title: node.title,
          key: node.key,
          icon: node.icon,
          isLeaf: node.isLeaf,
          children: childrenMatch.length > 0 ? childrenMatch : undefined
        });
        result.push(newNode);
      }
    });
    
    return result;
  }

  /**
   * Recopila las claves de todos los nodos que deben expandirse para mostrar las coincidencias de búsqueda.
   *
   * @param nodes Nodos del árbol a inspeccionar.
   * @param searchText Consulta de búsqueda activa.
   * @returns Arreglo de claves de nodos a expandir.
   */
  private getExpandedKeysForSearch(nodes: NzTreeNode[], searchText: string): string[] {
    const keys: string[] = [];
    
    nodes.forEach(node => {
      const matchTitle = node.title.toLowerCase().includes(searchText.toLowerCase());
      const childrenMatch = node.children ? this.getExpandedKeysForSearch(node.children, searchText) : [];
      
      if (matchTitle || childrenMatch.length > 0) {
        keys.push(node.key!);
        keys.push(...childrenMatch);
      }
    });
    
    return keys;
  }

  /**
   * Expande todos los nodos del árbol.
   */
  expandAll(): void {
    this.expandedKeys = this.getAllKeys(this.treeNodes);
  }

  /**
   * Contrae todos los nodos del árbol.
   */
  collapseAll(): void {
    this.expandedKeys = [];
  }

  /**
   * Marca todos los nodos del árbol.
   */
  checkAll(): void {
    this.checkedKeys = this.getAllKeys(this.treeNodes);
  }

  /**
   * Desmarca todos los nodos del árbol.
   */
  uncheckAll(): void {
    this.checkedKeys = [];
  }

  /**
   * Limpia la selección de nodos actual.
   */
  clearSelection(): void {
    this.selectedKeys = [];
    this.selectedNode = null;
  }

  /**
   * Recopila recursivamente todas las claves de los nodos en la lista de nodos proporcionada.
   *
   * @param nodes Nodos del árbol a recorrer.
   * @returns Arreglo plano de todas las claves de los nodos.
   */
  getAllKeys(nodes: NzTreeNode[]): string[] {
    const keys: string[] = [];
    nodes.forEach(node => {
      keys.push(node.key!);
      if (node.children) {
        keys.push(...this.getAllKeys(node.children));
      }
    });
    return keys;
  }

  /**
   * Busca el título de visualización de un nodo mediante su clave única.
   *
   * @param key Clave del nodo a buscar.
   * @returns El título del nodo, o la propia clave si no se encuentra.
   */
  getNodeTitleByKey(key: string): string {
    return this.findNodeByKey(this.treeNodes, key)?.title || key;
  }

  /**
   * Busca recursivamente un nodo del árbol que coincida con la clave proporcionada.
   *
   * @param nodes Nodos del árbol donde buscar.
   * @param key Clave del nodo de destino.
   * @returns El `NzTreeNode` coincidente o `null`.
   */
  findNodeByKey(nodes: NzTreeNode[], key: string): NzTreeNode | null {
    for (const node of nodes) {
      if (node.key === key) {
        return node;
      }
      if (node.children) {
        const found = this.findNodeByKey(node.children, key);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Devuelve todas las instancias de `NzTreeNode` marcadas actualmente.
   *
   * @returns Arreglo de nodos del árbol marcados.
   */
  getCheckedNodes(): NzTreeNode[] {
    const nodes: NzTreeNode[] = [];
    this.getCheckedNodesRecursive(this.treeNodes, nodes);
    return nodes;
  }

  /**
   * Devuelve únicamente los nodos hoja terminales (`isLeaf === true`) que están marcados actualmente.
   *
   * @returns Arreglo de nodos hoja marcados.
   */
  getCheckedLeafNodes(): NzTreeNode[] {
    return this.getCheckedNodes().filter(node => node.isLeaf);
  }

  /**
   * Función auxiliar que puebla recursivamente `result` con los nodos marcados.
   *
   * @param treeNodes Nodos a recorrer.
   * @param result Arreglo acumulador de nodos marcados.
   */
  private getCheckedNodesRecursive(treeNodes: NzTreeNode[], result: NzTreeNode[]): void {
    treeNodes.forEach(node => {
      if (node.isChecked) {
        result.push(node);
      }
      if (node.children) {
        this.getCheckedNodesRecursive(node.children, result);
      }
    });
  }

  /**
   * Devuelve el `NzTreeNode` seleccionado actualmente o `null`.
   *
   * @returns Nodo del árbol seleccionado o `null`.
   */
  getSelectedNode(): NzTreeNode | null {
    return this.selectedNode;
  }

  /**
   * Devuelve una copia superficial de las claves de los nodos marcados actualmente.
   *
   * @returns Arreglo de claves de los nodos marcados.
   */
  getCheckedKeys(): string[] {
    return [...this.checkedKeys];
  }

  /**
   * Devuelve una copia superficial de las claves de los nodos expandidos actualmente.
   *
   * @returns Arreglo de claves de los nodos expandidos.
   */
  getExpandedKeys(): string[] {
    return [...this.expandedKeys];
  }

  /**
   * Selecciona programáticamente un nodo del árbol mediante su clave.
   *
   * @param key Clave del nodo a seleccionar.
   */
  setSelectedNodeByKey(key: string): void {
    const node = this.findNodeByKey(this.treeNodes, key);
    if (node) {
      this.selectedNode = node;
      this.selectedKeys = [key];
    }
  }

  /**
   * Establece programáticamente las claves de los nodos marcados.
   *
   * @param keys Arreglo de claves de nodos a marcar.
   */
  setCheckedKeys(keys: string[]): void {
    this.checkedKeys = [...keys];
  }

  /**
   * Establece programáticamente las claves de los nodos expandidos.
   *
   * @param keys Arreglo de claves de nodos a expandir.
   */
  setExpandedKeys(keys: string[]): void {
    this.expandedKeys = [...keys];
  }

  /**
   * Reconstruye el árbol a partir de los `nodes` de entrada actuales.
   */
  refreshTree(): void {
    this.initializeTree();
  }
}
