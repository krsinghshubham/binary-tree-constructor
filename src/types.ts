export interface TreeNode {
  id: string;
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export interface LayoutNode {
  id: string;
  val: number;
  x: number;
  y: number;
  parentX?: number;
  parentY?: number;
  hasLeft: boolean;
  hasRight: boolean;
}

export interface DragPayload {
  nodeId: string | null; // null = new node from source
  val: number;
  subtree: TreeNode | null;
}

export interface DropTarget {
  parentId: string;
  side: 'left' | 'right';
}

export type ThemeId = 'dark' | 'light' | 'leetcode';

export interface AppConfig {
  defaultNodeValue: number;
  theme: ThemeId;
}

/** Top-level mode: binary tree vs general graph visualization */
export type StructureKind = 'tree' | 'graph';

export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
}

export interface GraphData {
  /** Sorted unique vertex labels */
  nodes: string[];
  edges: GraphEdge[];
}
