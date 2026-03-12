import React, { useState, useRef } from 'react';
import { NODE_RADIUS } from '../utils/treeLayout';

interface TreeNodeSVGProps {
  id: string;
  val: number;
  x: number;
  y: number;
  isSelected: boolean;
  isHighlighted?: boolean;
  onSelect: (id: string) => void;
  onDoubleClick: (id: string) => void;
  onDragStart: (id: string, clientX: number, clientY: number) => void;
  onEditComplete: (id: string, newVal: number) => void;
  isEditing: boolean;
}

const TreeNodeSVG: React.FC<TreeNodeSVGProps> = ({
  id,
  val,
  x,
  y,
  isSelected,
  isHighlighted = false,
  onSelect,
  onDoubleClick,
  onDragStart,
  onEditComplete,
  isEditing,
}) => {
  const [editVal, setEditVal] = useState(String(val));
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const didDrag = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    didDrag.current = false;

    const handlePointerMove = (moveEvt: PointerEvent) => {
      if (!dragStartPos.current) return;
      const dx = moveEvt.clientX - dragStartPos.current.x;
      const dy = moveEvt.clientY - dragStartPos.current.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        didDrag.current = true;
        onDragStart(id, dragStartPos.current.x, dragStartPos.current.y);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      }
    };

    const handlePointerUp = () => {
      if (!didDrag.current) {
        onSelect(id);
      }
      dragStartPos.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditVal(String(val));
    onDoubleClick(id);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const parsed = Number(editVal);
      onEditComplete(id, isNaN(parsed) ? val : parsed);
    } else if (e.key === 'Escape') {
      onEditComplete(id, val);
    }
  };

  const handleEditBlur = () => {
    const parsed = Number(editVal);
    onEditComplete(id, isNaN(parsed) ? val : parsed);
  };

  return (
    <g
      className={`tree-node-group ${isSelected ? 'tree-node-selected' : ''}`}
      style={{ cursor: 'grab' }}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
    >
      {isHighlighted && (
        <circle
          cx={x}
          cy={y}
          r={NODE_RADIUS + 5}
          fill="none"
          strokeWidth={3}
          className="traversal-highlight-ring"
          style={{ stroke: 'var(--traversal-ring)' }}
        />
      )}
      {isSelected && (
        <circle
          cx={x}
          cy={y}
          r={NODE_RADIUS + 4}
          fill="none"
          strokeWidth={3}
          className="selection-ring"
          style={{ stroke: 'var(--selection-ring)' }}
        />
      )}
      <circle
        cx={x}
        cy={y}
        r={NODE_RADIUS}
        strokeWidth={2}
        className="tree-node-circle"
      />
      {isEditing ? (
        <foreignObject
          x={x - NODE_RADIUS}
          y={y - 12}
          width={NODE_RADIUS * 2}
          height={24}
        >
          <input
            type="text"
            className="tree-node-edit-input"
            value={editVal}
            onChange={(e) => setEditVal(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={handleEditBlur}
            autoFocus
            style={{
              width: '100%',
              height: '100%',
              textAlign: 'center',
              background: 'transparent',
              border: 'none',
              fontSize: '14px',
              fontWeight: 'bold',
              outline: 'none',
            }}
          />
        </foreignObject>
      ) : (
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={14}
          fontWeight="bold"
          pointerEvents="none"
          className="tree-node-text"
          style={{ userSelect: 'none' }}
        >
          {val}
        </text>
      )}
    </g>
  );
};

export default React.memo(TreeNodeSVG);
