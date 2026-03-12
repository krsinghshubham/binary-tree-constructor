import React, { useMemo } from 'react';
import type { TreeNode } from '../types';
import { computeStats } from '../utils/treeStats';

interface StatsBarProps {
  root: TreeNode | null;
  onShowViolations: (violations: string[]) => void;
}

const StatsBar: React.FC<StatsBarProps> = ({ root, onShowViolations }) => {
  const stats = useMemo(() => computeStats(root), [root]);

  if (!root) return null;

  return (
    <div className="stats-bar">
      <div className="stat-item">
        <span className="stat-label">Nodes</span>
        <span className="stat-value">{stats.nodeCount}</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span className="stat-label">Height</span>
        <span className="stat-value">{stats.height}</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span className="stat-label">Balanced</span>
        <span className={`stat-value ${stats.balanced ? 'stat-yes' : 'stat-no'}`}>
          {stats.balanced ? 'Yes' : 'No'}
        </span>
      </div>
      <div className="stat-divider" />
      <div
        className="stat-item stat-clickable"
        onClick={() => {
          if (!stats.bst.isBST) {
            onShowViolations(stats.bst.violations);
          } else {
            onShowViolations([]);
          }
        }}
        title={stats.bst.isBST ? 'Valid BST' : 'Click to highlight BST violations'}
      >
        <span className="stat-label">BST</span>
        <span className={`stat-value ${stats.bst.isBST ? 'stat-yes' : 'stat-no'}`}>
          {stats.bst.isBST ? 'Yes' : 'No'}
        </span>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span className="stat-label">Complete</span>
        <span className={`stat-value ${stats.complete ? 'stat-yes' : 'stat-no'}`}>
          {stats.complete ? 'Yes' : 'No'}
        </span>
      </div>
    </div>
  );
};

export default StatsBar;
