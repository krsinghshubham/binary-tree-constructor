import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { TreeNode } from '../types';
import { getTraversalOrder, getNodeValue } from '../utils/traversals';
import type { TraversalType } from '../utils/traversals';

interface TraversalVisualizerProps {
  root: TreeNode | null;
  onHighlight: (currentId: string | null, visitedIds: string[]) => void;
}

const TRAVERSAL_TYPES: { value: TraversalType; label: string }[] = [
  { value: 'inorder', label: 'Inorder' },
  { value: 'preorder', label: 'Preorder' },
  { value: 'postorder', label: 'Postorder' },
  { value: 'levelorder', label: 'Level Order' },
];

const TraversalVisualizer: React.FC<TraversalVisualizerProps> = ({ root, onHighlight }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<TraversalType>('inorder');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [stepIndex, setStepIndex] = useState(-1);
  const [order, setOrder] = useState<string[]>([]);
  const [visitedValues, setVisitedValues] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setStepIndex(-1);
    setIsPlaying(false);
    setVisitedValues([]);
    onHighlight(null, []);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [onHighlight]);

  useEffect(() => {
    const newOrder = getTraversalOrder(root, type);
    setOrder(newOrder);
    reset();
  }, [root, type, reset]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const doStep = useCallback(
    (idx: number) => {
      if (idx >= order.length) {
        setIsPlaying(false);
        onHighlight(null, order);
        return;
      }
      setStepIndex(idx);
      const visited = order.slice(0, idx + 1);
      onHighlight(order[idx], visited);

      const val = getNodeValue(root, order[idx]);
      if (val !== null) {
        setVisitedValues((prev) => [...prev, val]);
      }
    },
    [order, root, onHighlight],
  );

  useEffect(() => {
    if (!isPlaying) return;
    const nextIdx = stepIndex + 1;
    timerRef.current = setTimeout(() => doStep(nextIdx), speed);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, stepIndex, speed, doStep]);

  const handlePlay = () => {
    if (stepIndex >= order.length - 1) {
      reset();
      setVisitedValues([]);
      setTimeout(() => {
        setIsPlaying(true);
        doStep(0);
      }, 50);
    } else {
      setIsPlaying(true);
    }
  };

  const handlePause = () => setIsPlaying(false);

  const handleStepForward = () => {
    if (isPlaying) setIsPlaying(false);
    const next = stepIndex + 1;
    if (next < order.length) {
      doStep(next);
    }
  };

  const handleReset = () => {
    reset();
    setVisitedValues([]);
  };

  if (!isOpen) {
    return (
      <button className="btn btn-toolbar" onClick={() => setIsOpen(true)}>
        Traversal
      </button>
    );
  }

  return (
    <div className="traversal-panel">
      <div className="traversal-header">
        <span className="traversal-title">Traversal</span>
        <button
          className="btn-close"
          onClick={() => {
            reset();
            setVisitedValues([]);
            setIsOpen(false);
          }}
        >
          x
        </button>
      </div>

      <div className="traversal-controls">
        <select
          className="traversal-select"
          value={type}
          onChange={(e) => setType(e.target.value as TraversalType)}
          disabled={isPlaying}
        >
          {TRAVERSAL_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <div className="traversal-buttons">
          {isPlaying ? (
            <button className="btn btn-sm" onClick={handlePause}>Pause</button>
          ) : (
            <button className="btn btn-sm btn-primary" onClick={handlePlay} disabled={!root}>
              Play
            </button>
          )}
          <button className="btn btn-sm" onClick={handleStepForward} disabled={isPlaying || !root || stepIndex >= order.length - 1}>
            Step
          </button>
          <button className="btn btn-sm" onClick={handleReset}>
            Reset
          </button>
        </div>

        <div className="speed-control">
          <label className="speed-label">Speed</label>
          <input
            type="range"
            min={50}
            max={2000}
            step={50}
            value={2050 - speed}
            onChange={(e) => setSpeed(2050 - Number(e.target.value))}
            className="speed-slider"
          />
        </div>
      </div>

      {visitedValues.length > 0 && (
        <div className="traversal-result">
          [{visitedValues.join(', ')}
          {stepIndex < order.length - 1 ? ', ...' : ''}]
        </div>
      )}
    </div>
  );
};

export default TraversalVisualizer;
