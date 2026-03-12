import type { TreeNode } from '../types';

function collectInorder(node: TreeNode | null, ids: string[]): void {
  if (node === null) return;
  collectInorder(node.left, ids);
  ids.push(node.id);
  collectInorder(node.right, ids);
}

function collectPreorder(node: TreeNode | null, ids: string[]): void {
  if (node === null) return;
  ids.push(node.id);
  collectPreorder(node.left, ids);
  collectPreorder(node.right, ids);
}

function collectPostorder(node: TreeNode | null, ids: string[]): void {
  if (node === null) return;
  collectPostorder(node.left, ids);
  collectPostorder(node.right, ids);
  ids.push(node.id);
}

export function getInorderIds(root: TreeNode | null): string[] {
  const ids: string[] = [];
  collectInorder(root, ids);
  return ids;
}

export function getPreorderIds(root: TreeNode | null): string[] {
  const ids: string[] = [];
  collectPreorder(root, ids);
  return ids;
}

export function getPostorderIds(root: TreeNode | null): string[] {
  const ids: string[] = [];
  collectPostorder(root, ids);
  return ids;
}

function collectInorderValues(node: TreeNode | null, values: number[]): void {
  if (node === null) return;
  collectInorderValues(node.left, values);
  values.push(node.val);
  collectInorderValues(node.right, values);
}

function collectPreorderValues(node: TreeNode | null, values: number[]): void {
  if (node === null) return;
  values.push(node.val);
  collectPreorderValues(node.left, values);
  collectPreorderValues(node.right, values);
}

function collectPostorderValues(node: TreeNode | null, values: number[]): void {
  if (node === null) return;
  collectPostorderValues(node.left, values);
  collectPostorderValues(node.right, values);
  values.push(node.val);
}

export function getInorderValues(root: TreeNode | null): number[] {
  const values: number[] = [];
  collectInorderValues(root, values);
  return values;
}

export function getPreorderValues(root: TreeNode | null): number[] {
  const values: number[] = [];
  collectPreorderValues(root, values);
  return values;
}

export function getPostorderValues(root: TreeNode | null): number[] {
  const values: number[] = [];
  collectPostorderValues(root, values);
  return values;
}
