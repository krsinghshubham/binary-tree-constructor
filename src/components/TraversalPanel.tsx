import React from 'react';
import type { TreeNode } from '../types';
import {
  getInorderValues,
  getPreorderValues,
  getPostorderValues,
} from '../utils/treeTraversal';

export type TraversalType = 'inorder' | 'preorder' | 'postorder';

export interface TraversalPanelProps {
  root: TreeNode | null;
  highlightedId: string | null;
  onTraversalClick: (type: TraversalType) => void;
  /** Pre-computed traversal values; if not provided, values are derived from root and activeTraversalType */
  traversalResult?: number[];
  /** Which traversal was last run; used to derive display when traversalResult is not provided */
  activeTraversalType?: TraversalType | null;
}

function getValuesForType(
  root: TreeNode | null,
  type: TraversalType
): number[] {
  if (root === null) return [];
  switch (type) {
    case 'inorder':
      return getInorderValues(root);
    case 'preorder':
      return getPreorderValues(root);
    case 'postorder':
      return getPostorderValues(root);
  }
}

const TraversalPanel: React.FC<TraversalPanelProps> = ({
  root,
  highlightedId: _highlightedId, // reserved for integration (e.g. highlight current node)
  onTraversalClick,
  traversalResult,
  activeTraversalType = null,
}) => {
  const displayValues =
    traversalResult ??
    (activeTraversalType ? getValuesForType(root, activeTraversalType) : []);
  const hasResult = displayValues.length > 0;

  return (
    <div className="traversal-panel">
      <label className="input-label">Traversal</label>
      <div className="input-row">
        <button
          type="button"
          className="btn"
          onClick={() => onTraversalClick('inorder')}
        >
          Inorder
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => onTraversalClick('preorder')}
        >
          Preorder
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => onTraversalClick('postorder')}
        >
          Postorder
        </button>
      </div>
      {hasResult && (
        <div className="traversal-result" style={{ marginTop: '0.5rem' }}>
          <span className="input-label" style={{ display: 'block', marginBottom: '0.25rem' }}>
            Result
          </span>
          <div
            className="traversal-values"
            style={{
              padding: '0.5rem 0.75rem',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
              fontSize: '0.9rem',
            }}
          >
            {displayValues.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

export default TraversalPanel;
