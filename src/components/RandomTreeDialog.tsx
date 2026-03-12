import React, { useState } from 'react';
import type { PresetType } from '../utils/randomTree';

interface RandomTreeDialogProps {
  onGenerate: (preset: PresetType, size: number, minVal: number, maxVal: number) => void;
  onClose: () => void;
}

const PRESETS: { value: PresetType; label: string; desc: string }[] = [
  { value: 'random-bst', label: 'Random BST', desc: 'Randomly ordered BST' },
  { value: 'random-general', label: 'Random Tree', desc: 'General binary tree' },
  { value: 'complete', label: 'Complete', desc: 'All levels filled except last' },
  { value: 'perfect', label: 'Perfect', desc: 'All leaves at same depth' },
  { value: 'left-skewed', label: 'Left Skewed', desc: 'Chain going left' },
  { value: 'right-skewed', label: 'Right Skewed', desc: 'Chain going right' },
  { value: 'zigzag', label: 'Zigzag', desc: 'Alternating left-right chain' },
];

const RandomTreeDialog: React.FC<RandomTreeDialogProps> = ({ onGenerate, onClose }) => {
  const [size, setSize] = useState(7);
  const [minVal, setMinVal] = useState(1);
  const [maxVal, setMaxVal] = useState(50);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content random-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Generate Tree</h3>
          <button className="btn-close" onClick={onClose}>x</button>
        </div>

        <div className="random-config">
          <div className="random-config-row">
            <label>Nodes</label>
            <input
              type="number"
              min={1}
              max={31}
              value={size}
              onChange={(e) => setSize(Math.min(31, Math.max(1, Number(e.target.value))))}
              className="config-input"
            />
          </div>
          <div className="random-config-row">
            <label>Min Value</label>
            <input
              type="number"
              value={minVal}
              onChange={(e) => setMinVal(Number(e.target.value))}
              className="config-input"
            />
          </div>
          <div className="random-config-row">
            <label>Max Value</label>
            <input
              type="number"
              value={maxVal}
              onChange={(e) => setMaxVal(Number(e.target.value))}
              className="config-input"
            />
          </div>
        </div>

        <div className="preset-grid">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              className="btn preset-btn"
              onClick={() => {
                onGenerate(p.value, size, minVal, maxVal);
                onClose();
              }}
            >
              <span className="preset-label">{p.label}</span>
              <span className="preset-desc">{p.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RandomTreeDialog;
