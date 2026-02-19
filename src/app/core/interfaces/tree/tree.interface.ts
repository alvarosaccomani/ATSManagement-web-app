export interface TreeInterface {
  title: string;
  key: string;
  icon: string;
  isLeaf?: boolean;
  children?: TreeInterface[];
}
