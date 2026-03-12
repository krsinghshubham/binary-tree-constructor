import type { TreeNode, LayoutNode } from '../types';

const NODE_RADIUS = 24;
const VERTICAL_GAP = 80;
const MIN_HORIZONTAL_GAP = 20;

interface InternalNode {
  id: string;
  val: number;
  left: InternalNode | null;
  right: InternalNode | null;
  x: number;
  y: number;
}

function buildInternal(node: TreeNode | null, depth: number): InternalNode | null {
  if (!node) return null;
  return {
    id: node.id,
    val: node.val,
    left: buildInternal(node.left, depth + 1),
    right: buildInternal(node.right, depth + 1),
    x: 0,
    y: depth * VERTICAL_GAP + NODE_RADIUS + 20,
  };
}

function assignX(node: InternalNode | null, counter: { value: number }): void {
  if (!node) return;
  assignX(node.left, counter);
  node.x = counter.value * (NODE_RADIUS * 2 + MIN_HORIZONTAL_GAP) + NODE_RADIUS + 20;
  counter.value++;
  assignX(node.right, counter);
}

export function computeLayout(root: TreeNode | null): {
  nodes: LayoutNode[];
  width: number;
  height: number;
} {
  if (!root) return { nodes: [], width: 0, height: 0 };

  const internal = buildInternal(root, 0);
  if (!internal) return { nodes: [], width: 0, height: 0 };

  const counter = { value: 0 };
  assignX(internal, counter);

  const nodes: LayoutNode[] = [];
  let maxX = 0;
  let maxY = 0;

  function collect(
    node: InternalNode | null,
    parentX?: number,
    parentY?: number,
    originalNode?: TreeNode | null,
  ): void {
    if (!node || !originalNode) return;
    nodes.push({
      id: node.id,
      val: node.val,
      x: node.x,
      y: node.y,
      parentX,
      parentY,
      hasLeft: originalNode.left !== null,
      hasRight: originalNode.right !== null,
    });
    if (node.x > maxX) maxX = node.x;
    if (node.y > maxY) maxY = node.y;
    collect(node.left, node.x, node.y, originalNode.left);
    collect(node.right, node.x, node.y, originalNode.right);
  }

  collect(internal, undefined, undefined, root);

  return {
    nodes,
    width: maxX + NODE_RADIUS + 40,
    height: maxY + NODE_RADIUS + 40,
  };
}

export function getDropGhostPositions(
  parentX: number,
  parentY: number,
): { left: { x: number; y: number }; right: { x: number; y: number } } {
  const offset = NODE_RADIUS * 2 + MIN_HORIZONTAL_GAP;
  return {
    left: { x: parentX - offset * 0.7, y: parentY + VERTICAL_GAP },
    right: { x: parentX + offset * 0.7, y: parentY + VERTICAL_GAP },
  };
}

export { NODE_RADIUS, VERTICAL_GAP };
