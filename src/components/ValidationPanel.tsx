import React, { useMemo } from 'react';
import type { TreeNode } from '../types';
import { isBST, isBalanced, getHeight } from '../utils/treeValidation';

interface ValidationPanelProps {
  root: TreeNode | null;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({ root }) => {
  const { bst, balanced, height } = useMemo(() => {
    return {
      bst: isBST(root),
      balanced: isBalanced(root),
      height: getHeight(root),
    };
  }, [root]);

  return (
    <div className="validation-panel">
      <div className="validation-item">
        <span className="input-label">BST</span>
        <span className="validation-value">{bst ? 'Yes' : 'No'}</span>
      </div>
      <div className="validation-item">
        <span className="input-label">Balanced</span>
        <span className="validation-value">{balanced ? 'Yes' : 'No'}</span>
      </div>
      <div className="validation-item">
        <span className="input-label">Height</span>
        <span className="validation-value">{height}</span>
      </div>
    </div>
  );
};

export default ValidationPanel;
