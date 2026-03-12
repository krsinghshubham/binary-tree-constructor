import type { TreeNode } from '../types';

export type Language = 'python' | 'java' | 'cpp' | 'javascript';

export function generateCode(root: TreeNode | null, lang: Language): string {
  if (!root) return getEmptyTree(lang);
  switch (lang) {
    case 'python':
      return generatePython(root);
    case 'java':
      return generateJava(root);
    case 'cpp':
      return generateCpp(root);
    case 'javascript':
      return generateJavaScript(root);
  }
}

function getEmptyTree(lang: Language): string {
  switch (lang) {
    case 'python':
      return 'root = None';
    case 'java':
      return 'TreeNode root = null;';
    case 'cpp':
      return 'TreeNode* root = nullptr;';
    case 'javascript':
      return 'const root = null;';
  }
}

interface NodeVar {
  node: TreeNode;
  varName: string;
}

function collectNodes(root: TreeNode): NodeVar[] {
  const result: NodeVar[] = [];
  const queue: TreeNode[] = [root];
  let idx = 0;

  while (queue.length > 0) {
    const node = queue.shift()!;
    const varName = idx === 0 ? 'root' : `node${idx}`;
    result.push({ node, varName });
    idx++;
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return result;
}

function buildVarMap(nodes: NodeVar[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const nv of nodes) {
    map.set(nv.node.id, nv.varName);
  }
  return map;
}

function generatePython(root: TreeNode): string {
  const lines: string[] = [
    'class TreeNode:',
    '    def __init__(self, val=0, left=None, right=None):',
    '        self.val = val',
    '        self.left = left',
    '        self.right = right',
    '',
  ];

  const nodes = collectNodes(root);
  const varMap = buildVarMap(nodes);

  for (const { node, varName } of nodes) {
    lines.push(`${varName} = TreeNode(${node.val})`);
  }

  lines.push('');

  for (const { node, varName } of nodes) {
    if (node.left) {
      lines.push(`${varName}.left = ${varMap.get(node.left.id)}`);
    }
    if (node.right) {
      lines.push(`${varName}.right = ${varMap.get(node.right.id)}`);
    }
  }

  return lines.join('\n');
}

function generateJava(root: TreeNode): string {
  const lines: string[] = [
    'public class TreeNode {',
    '    int val;',
    '    TreeNode left;',
    '    TreeNode right;',
    '    TreeNode(int val) { this.val = val; }',
    '}',
    '',
    '// Build tree',
  ];

  const nodes = collectNodes(root);
  const varMap = buildVarMap(nodes);

  for (const { node, varName } of nodes) {
    lines.push(`TreeNode ${varName} = new TreeNode(${node.val});`);
  }

  lines.push('');

  for (const { node, varName } of nodes) {
    if (node.left) {
      lines.push(`${varName}.left = ${varMap.get(node.left.id)};`);
    }
    if (node.right) {
      lines.push(`${varName}.right = ${varMap.get(node.right.id)};`);
    }
  }

  return lines.join('\n');
}

function generateCpp(root: TreeNode): string {
  const lines: string[] = [
    'struct TreeNode {',
    '    int val;',
    '    TreeNode *left;',
    '    TreeNode *right;',
    '    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}',
    '};',
    '',
    '// Build tree',
  ];

  const nodes = collectNodes(root);
  const varMap = buildVarMap(nodes);

  for (const { node, varName } of nodes) {
    lines.push(`TreeNode* ${varName} = new TreeNode(${node.val});`);
  }

  lines.push('');

  for (const { node, varName } of nodes) {
    if (node.left) {
      lines.push(`${varName}->left = ${varMap.get(node.left.id)};`);
    }
    if (node.right) {
      lines.push(`${varName}->right = ${varMap.get(node.right.id)};`);
    }
  }

  return lines.join('\n');
}

function generateJavaScript(root: TreeNode): string {
  const lines: string[] = [
    'class TreeNode {',
    '  constructor(val, left = null, right = null) {',
    '    this.val = val;',
    '    this.left = left;',
    '    this.right = right;',
    '  }',
    '}',
    '',
  ];

  const nodes = collectNodes(root);
  const varMap = buildVarMap(nodes);

  for (const { node, varName } of nodes) {
    lines.push(`const ${varName} = new TreeNode(${node.val});`);
  }

  lines.push('');

  for (const { node, varName } of nodes) {
    if (node.left) {
      lines.push(`${varName}.left = ${varMap.get(node.left.id)};`);
    }
    if (node.right) {
      lines.push(`${varName}.right = ${varMap.get(node.right.id)};`);
    }
  }

  return lines.join('\n');
}
