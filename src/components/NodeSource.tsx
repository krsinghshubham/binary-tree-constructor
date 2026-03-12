import React, { useState, useRef, useCallback } from 'react';

interface NodeSourceProps {
  defaultValue: number;
  onDragStart: (val: number, clientX: number, clientY: number) => void;
  onDragMove: (clientX: number, clientY: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

const NodeSource: React.FC<NodeSourceProps> = ({
  defaultValue,
  onDragStart,
  onDragMove,
  onDragEnd,
  isDragging,
}) => {
  const [nodeVal, setNodeVal] = useState(String(defaultValue));
  const chipRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const parsed = Number(nodeVal);
      const val = isNaN(parsed) ? defaultValue : parsed;
      onDragStart(val, e.clientX, e.clientY);

      const handleMove = (moveEvt: PointerEvent) => {
        onDragMove(moveEvt.clientX, moveEvt.clientY);
      };

      const handleUp = () => {
        onDragEnd();
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      };

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    },
    [nodeVal, defaultValue, onDragStart, onDragMove, onDragEnd],
  );

  return (
    <div className="node-source">
      <label className="input-label">New Node</label>
      <div className="node-source-row">
        <input
          type="number"
          className="node-value-input"
          value={nodeVal}
          onChange={(e) => setNodeVal(e.target.value)}
          placeholder={String(defaultValue)}
        />
        <div
          ref={chipRef}
          className={`node-chip ${isDragging ? 'node-chip-dragging' : ''}`}
          onPointerDown={handlePointerDown}
          style={{ touchAction: 'none' }}
        >
          <span className="node-chip-circle">
            {isNaN(Number(nodeVal)) ? defaultValue : nodeVal || defaultValue}
          </span>
          <span className="node-chip-label">Drag me</span>
        </div>
      </div>
    </div>
  );
};

export default NodeSource;
