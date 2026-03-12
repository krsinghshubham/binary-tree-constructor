import React from 'react';

interface TreeEdgeProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const TreeEdge: React.FC<TreeEdgeProps> = ({ x1, y1, x2, y2 }) => {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="#64748b"
      strokeWidth={2}
      className="tree-edge"
    />
  );
};

export default React.memo(TreeEdge);
