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
  // Inputs configurables
  @Input() title: string = 'Árbol de Navegación';
  @Input() description: string = '';
  @Input() nodes: NzTreeNodeOptions[] = [];
  @Input() showSearch: boolean = true;
  @Input() showToolbar: boolean = true;
  @Input() searchable: boolean = true;
  @Input() expandable: boolean = true;
  @Input() checkable: boolean = true;
  @Input() multiple: boolean = true;
  @Input() draggable: boolean = false;
  @Input() blockNode: boolean = true;
  @Input() showIcon: boolean = true;
  @Input() showInfoPanel: boolean = true;
  @Input() defaultExpandedKeys: string[] = [];
  @Input() defaultCheckedKeys: string[] = [];
  @Input() defaultSelectedKeys: string[] = [];

  // Outputs para eventos
  @Output() nodeClick = new EventEmitter<NzTreeNode>();
  @Output() nodeCheck = new EventEmitter<{ node: NzTreeNode; checked: boolean; checkedKeys: string[] }>();
  @Output() nodeExpand = new EventEmitter<string[]>();

  // Estado interno
  treeNodes: NzTreeNode[] = [];
  filteredNodes: NzTreeNode[] = [];
  expandedKeys: string[] = [];
  selectedKeys: string[] = [];
  checkedKeys: string[] = [];
  selectedNode: NzTreeNode | null = null;
  searchText: string = '';
  isSearching: boolean = false;

  ngOnInit() {
    this.initializeTree();
  }

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

  // Eventos del árbol
  onNodeClick(event: NzFormatEmitEvent): void {
    const node = event.node;
    if (node) {
      this.selectedNode = node;
      this.selectedKeys = [node.key!];
      this.nodeClick.emit(node);
      console.log('Nodo seleccionado:', node);
    }
  }

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

  onExpandChange(expandedKeys: string[]): void {
    this.expandedKeys = expandedKeys;
    this.nodeExpand.emit(expandedKeys);
  }

  // Métodos de búsqueda
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

  // Métodos de control
  expandAll(): void {
    this.expandedKeys = this.getAllKeys(this.treeNodes);
  }

  collapseAll(): void {
    this.expandedKeys = [];
  }

  checkAll(): void {
    this.checkedKeys = this.getAllKeys(this.treeNodes);
  }

  uncheckAll(): void {
    this.checkedKeys = [];
  }

  clearSelection(): void {
    this.selectedKeys = [];
    this.selectedNode = null;
  }

  // Métodos utilitarios
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

  getNodeTitleByKey(key: string): string {
    return this.findNodeByKey(this.treeNodes, key)?.title || key;
  }

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

  getCheckedNodes(): NzTreeNode[] {
    const nodes: NzTreeNode[] = [];
    this.getCheckedNodesRecursive(this.treeNodes, nodes);
    return nodes;
  }

  getCheckedLeafNodes(): NzTreeNode[] {
    return this.getCheckedNodes().filter(node => node.isLeaf);
  }

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

  // Métodos públicos para acceso externo
  getSelectedNode(): NzTreeNode | null {
    return this.selectedNode;
  }

  getCheckedKeys(): string[] {
    return [...this.checkedKeys];
  }

  getExpandedKeys(): string[] {
    return [...this.expandedKeys];
  }

  setSelectedNodeByKey(key: string): void {
    const node = this.findNodeByKey(this.treeNodes, key);
    if (node) {
      this.selectedNode = node;
      this.selectedKeys = [key];
    }
  }

  setCheckedKeys(keys: string[]): void {
    this.checkedKeys = [...keys];
  }

  setExpandedKeys(keys: string[]): void {
    this.expandedKeys = [...keys];
  }

  refreshTree(): void {
    this.initializeTree();
  }
}
