import type { TreeNode } from '../types';

/**
 * Height of tree: 0 for null, else 1 + max(left, right).
 */
export function getHeight(root: TreeNode | null): number {
  if (!root) return 0;
  return 1 + Math.max(getHeight(root.left), getHeight(root.right));
}

/**
 * BST with left <= val < right: all left descendants <= node.val, all right descendants > node.val.
 */
export function isBST(root: TreeNode | null): boolean {
  function check(node: TreeNode | null, min: number, max: number, rightStrict: boolean): boolean {
    if (!node) return true;
    if (rightStrict) {
      if (node.val <= min || node.val > max) return false;
    } else {
      if (node.val < min || node.val > max) return false;
    }
    return (
      check(node.left, min, node.val, false) && check(node.right, node.val, max, true)
    );
  }
  return check(root, -Infinity, Infinity, false);
}

/**
 * Balanced: height of left and right differ by at most 1.
 */
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
