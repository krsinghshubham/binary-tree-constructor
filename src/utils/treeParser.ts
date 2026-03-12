import type { TreeNode } from '../types';

let _idCounter = 0;
export function genId(): string {
  return `n${++_idCounter}`;
}
export function resetIdCounter(): void {
  _idCounter = 0;
}

export function parseArray(input: string): TreeNode | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const inner = trimmed.replace(/^\[/, '').replace(/\]$/, '').trim();
  if (!inner) return null;

  const tokens = inner.split(',').map((t) => t.trim());
  if (tokens.length === 0 || (tokens.length === 1 && tokens[0] === '')) return null;

  const values: (number | null)[] = tokens.map((t) => {
    if (t === 'null' || t === 'N' || t === '') return null;
    const n = Number(t);
    return isNaN(n) ? null : n;
  });

  if (values[0] === null) return null;

  resetIdCounter();
  const root: TreeNode = { id: genId(), val: values[0], left: null, right: null };
  const queue: TreeNode[] = [root];
  let i = 1;

  while (queue.length > 0 && i < values.length) {
    const current = queue.shift()!;

    if (i < values.length) {
      if (values[i] !== null) {
        current.left = { id: genId(), val: values[i]!, left: null, right: null };
        queue.push(current.left);
      }
      i++;
    }

    if (i < values.length) {
      if (values[i] !== null) {
        current.right = { id: genId(), val: values[i]!, left: null, right: null };
        queue.push(current.right);
      }
      i++;
    }
  }

  return root;
}

export function treeToPlainObject(node: TreeNode | null): { val: number; left?: unknown; right?: unknown } | null {
  if (!node) return null;
  return {
    val: node.val,
    left: treeToPlainObject(node.left),
    right: treeToPlainObject(node.right),
  };
}

export function serializeTree(root: TreeNode | null): string {
  if (!root) return '[]';

  const result: (number | null)[] = [];
  const queue: (TreeNode | null)[] = [root];

  while (queue.length > 0) {
    const node = queue.shift()!;
    if (node === null) {
      result.push(null);
    } else {
      result.push(node.val);
      queue.push(node.left);
      queue.push(node.right);
    }
  }

  while (result.length > 0 && result[result.length - 1] === null) {
    result.pop();
  }

  return '[' + result.map((v) => (v === null ? 'null' : String(v))).join(',') + ']';
}

export function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return {
    id: node.id,
    val: node.val,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
}

export function removeNode(root: TreeNode | null, nodeId: string): TreeNode | null {
  if (!root) return null;
  if (root.id === nodeId) return null;
  return {
    ...root,
    left: root.left?.id === nodeId ? null : removeNode(root.left, nodeId),
    right: root.right?.id === nodeId ? null : removeNode(root.right, nodeId),
  };
}

export function findNode(root: TreeNode | null, nodeId: string): TreeNode | null {
  if (!root) return null;
  if (root.id === nodeId) return root;
  return findNode(root.left, nodeId) || findNode(root.right, nodeId);
}

export function insertNode(
  root: TreeNode | null,
  parentId: string,
  side: 'left' | 'right',
  newNode: TreeNode,
): TreeNode | null {
  if (!root) return null;
  if (root.id === parentId) {
    return {
      ...root,
      [side]: newNode,
    };
  }
  return {
    ...root,
    left: insertNode(root.left, parentId, side, newNode),
    right: insertNode(root.right, parentId, side, newNode),
  };
}

export function updateNodeValue(
  root: TreeNode | null,
  nodeId: string,
  newVal: number,
): TreeNode | null {
  if (!root) return null;
  if (root.id === nodeId) {
    return { ...root, val: newVal };
  }
  return {
    ...root,
    left: updateNodeValue(root.left, nodeId, newVal),
    right: updateNodeValue(root.right, nodeId, newVal),
  };
}

export function assignNewIds(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return {
    id: genId(),
    val: node.val,
    left: assignNewIds(node.left),
    right: assignNewIds(node.right),
  };
}
