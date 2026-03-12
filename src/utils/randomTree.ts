import type { TreeNode } from '../types';
import { genId } from './treeParser';

export type PresetType =
  | 'random-bst'
  | 'random-general'
  | 'complete'
  | 'perfect'
  | 'left-skewed'
  | 'right-skewed'
  | 'zigzag';

export function generateRandomTree(
  preset: PresetType,
  size: number = 7,
  minVal: number = 1,
  maxVal: number = 100,
): TreeNode | null {
  switch (preset) {
    case 'random-bst':
      return randomBST(size, minVal, maxVal);
    case 'random-general':
      return randomGeneral(size, minVal, maxVal);
    case 'complete':
      return completeBinaryTree(size, minVal, maxVal);
    case 'perfect':
      return perfectBinaryTree(Math.min(size, 4), minVal, maxVal);
    case 'left-skewed':
      return skewedTree(size, 'left', minVal, maxVal);
    case 'right-skewed':
      return skewedTree(size, 'right', minVal, maxVal);
    case 'zigzag':
      return zigzagTree(size, minVal, maxVal);
  }
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBST(size: number, minVal: number, maxVal: number): TreeNode | null {
  const values = new Set<number>();
  while (values.size < size && values.size < maxVal - minVal + 1) {
    values.add(randInt(minVal, maxVal));
  }
  const sorted = [...values].sort((a, b) => a - b);

  function buildBalanced(arr: number[]): TreeNode | null {
    if (arr.length === 0) return null;
    const mid = Math.floor(arr.length / 2);
    return {
      id: genId(),
      val: arr[mid],
      left: buildBalanced(arr.slice(0, mid)),
      right: buildBalanced(arr.slice(mid + 1)),
    };
  }

  // Shuffle a bit for variety - don't always build perfectly balanced
  if (Math.random() > 0.5) {
    let root: TreeNode | null = null;
    const shuffled = [...values].sort(() => Math.random() - 0.5);
    for (const val of shuffled) {
      root = insertBST(root, val);
    }
    return root;
  }

  return buildBalanced(sorted);
}

function insertBST(root: TreeNode | null, val: number): TreeNode {
  if (!root) return { id: genId(), val, left: null, right: null };
  if (val < root.val) {
    return { ...root, left: insertBST(root.left, val) };
  } else {
    return { ...root, right: insertBST(root.right, val) };
  }
}

function randomGeneral(size: number, minVal: number, maxVal: number): TreeNode | null {
  if (size <= 0) return null;

  const nodes: TreeNode[] = [];
  for (let i = 0; i < size; i++) {
    nodes.push({ id: genId(), val: randInt(minVal, maxVal), left: null, right: null });
  }

  for (let i = 0; i < nodes.length; i++) {
    const leftIdx = 2 * i + 1;
    const rightIdx = 2 * i + 2;
    if (leftIdx < nodes.length) nodes[i].left = nodes[leftIdx];
    if (rightIdx < nodes.length) nodes[i].right = nodes[rightIdx];
  }

  return nodes[0];
}

function completeBinaryTree(size: number, minVal: number, maxVal: number): TreeNode | null {
  return randomGeneral(size, minVal, maxVal);
}

function perfectBinaryTree(depth: number, minVal: number, maxVal: number): TreeNode | null {
  const size = Math.pow(2, depth) - 1;
  return randomGeneral(size, minVal, maxVal);
}

function skewedTree(
  size: number,
  direction: 'left' | 'right',
  minVal: number,
  maxVal: number,
): TreeNode | null {
  if (size <= 0) return null;
  const root: TreeNode = { id: genId(), val: randInt(minVal, maxVal), left: null, right: null };
  let current = root;
  for (let i = 1; i < size; i++) {
    const newNode: TreeNode = { id: genId(), val: randInt(minVal, maxVal), left: null, right: null };
    current[direction] = newNode;
    current = newNode;
  }
  return root;
}

function zigzagTree(size: number, minVal: number, maxVal: number): TreeNode | null {
  if (size <= 0) return null;
  const root: TreeNode = { id: genId(), val: randInt(minVal, maxVal), left: null, right: null };
  let current = root;
  for (let i = 1; i < size; i++) {
    const newNode: TreeNode = { id: genId(), val: randInt(minVal, maxVal), left: null, right: null };
    if (i % 2 === 1) {
      current.right = newNode;
    } else {
      current.left = newNode;
    }
    current = newNode;
  }
  return root;
}
