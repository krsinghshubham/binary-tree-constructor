import React from 'react';
import { NODE_RADIUS } from '../utils/treeLayout';

interface DropGhostProps {
  x: number;
  y: number;
  side: 'left' | 'right';
  isValid: boolean;
}

const DropGhost: React.FC<DropGhostProps> = ({ x, y, isValid }) => {
  return (
    <g className="drop-ghost">
      <circle
        cx={x}
        cy={y}
        r={NODE_RADIUS}
        fill={isValid ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)'}
        stroke={isValid ? '#3b82f6' : '#ef4444'}
        strokeWidth={2}
        strokeDasharray="6 4"
        className="drop-ghost-circle"
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={isValid ? '#3b82f6' : '#ef4444'}
        fontSize={20}
        fontWeight="bold"
        pointerEvents="none"
      >
        +
      </text>
    </g>
  );
};

export default React.memo(DropGhost);
