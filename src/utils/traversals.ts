import type { TreeNode } from '../types';

export type TraversalType = 'inorder' | 'preorder' | 'postorder' | 'levelorder';

export function getTraversalOrder(root: TreeNode | null, type: TraversalType): string[] {
  if (!root) return [];
  switch (type) {
    case 'inorder':
      return inorder(root);
    case 'preorder':
      return preorder(root);
    case 'postorder':
      return postorder(root);
    case 'levelorder':
      return levelorder(root);
  }
}

function inorder(node: TreeNode | null): string[] {
  if (!node) return [];
  return [...inorder(node.left), node.id, ...inorder(node.right)];
}

function preorder(node: TreeNode | null): string[] {
  if (!node) return [];
  return [node.id, ...preorder(node.left), ...preorder(node.right)];
}

function postorder(node: TreeNode | null): string[] {
  if (!node) return [];
  return [...postorder(node.left), ...postorder(node.right), node.id];
}

function levelorder(root: TreeNode): string[] {
  const result: string[] = [];
  const queue: TreeNode[] = [root];
  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node.id);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return result;
}

export function getNodeValue(root: TreeNode | null, nodeId: string): number | null {
  if (!root) return null;
  if (root.id === nodeId) return root.val;
  return getNodeValue(root.left, nodeId) ?? getNodeValue(root.right, nodeId);
}
