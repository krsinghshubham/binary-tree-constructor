import type { TreeNode } from '../types';

export function getHeight(root: TreeNode | null): number {
  if (!root) return 0;
  return 1 + Math.max(getHeight(root.left), getHeight(root.right));
}

export function getNodeCount(root: TreeNode | null): number {
  if (!root) return 0;
  return 1 + getNodeCount(root.left) + getNodeCount(root.right);
}

export function isBalanced(root: TreeNode | null): boolean {
  function check(node: TreeNode | null): number {
    if (!node) return 0;
    const l = check(node.left);
    if (l === -1) return -1;
    const r = check(node.right);
    if (r === -1) return -1;
    if (Math.abs(l - r) > 1) return -1;
    return 1 + Math.max(l, r);
  }
  return check(root) !== -1;
}

export interface BSTResult {
  isBST: boolean;
  violations: string[];
}

export function validateBST(root: TreeNode | null): BSTResult {
  const violations: string[] = [];

  function check(node: TreeNode | null, min: number, max: number): boolean {
    if (!node) return true;
    if (node.val <= min || node.val >= max) {
      violations.push(node.id);
      check(node.left, min, node.val);
      check(node.right, node.val, max);
      return false;
    }
    const leftOk = check(node.left, min, node.val);
    const rightOk = check(node.right, node.val, max);
    return leftOk && rightOk;
  }

  const isBST = check(root, -Infinity, Infinity);
  return { isBST, violations };
}

export function isComplete(root: TreeNode | null): boolean {
  if (!root) return true;
  const queue: (TreeNode | null)[] = [root];
  let foundNull = false;

  while (queue.length > 0) {
    const node = queue.shift()!;
    if (node === null) {
      foundNull = true;
    } else {
      if (foundNull) return false;
      queue.push(node.left);
      queue.push(node.right);
    }
  }
  return true;
}

export interface TreeStats {
  nodeCount: number;
  height: number;
  balanced: boolean;
  bst: BSTResult;
  complete: boolean;
}

export function computeStats(root: TreeNode | null): TreeStats {
  return {
    nodeCount: getNodeCount(root),
    height: getHeight(root),
    balanced: isBalanced(root),
    bst: validateBST(root),
    complete: isComplete(root),
  };
}
