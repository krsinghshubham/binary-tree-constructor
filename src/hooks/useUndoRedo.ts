import { useCallback, useRef, useState } from 'react';

const MAX_HISTORY = 50;

export function useUndoRedo<T>(initial: T): {
  state: T;
  setState: (s: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
} {
  const [state, setStateInternal] = useState<T>(initial);
  const [historySizes, setHistorySizes] = useState({ past: 0, redo: 0 });
  const pastRef = useRef<T[]>([]);
  const redoRef = useRef<T[]>([]);

  const setState = useCallback((next: T) => {
    setStateInternal((current) => {
      pastRef.current.push(current);
      if (pastRef.current.length > MAX_HISTORY) pastRef.current.shift();
      redoRef.current = [];
      setHistorySizes((s) => ({ past: Math.min(MAX_HISTORY, s.past + 1), redo: 0 }));
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setStateInternal((current) => {
      if (pastRef.current.length === 0) return current;
      const prev = pastRef.current.pop()!;
      redoRef.current.push(current);
      setHistorySizes((s) => ({ past: s.past - 1, redo: s.redo + 1 }));
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setStateInternal((current) => {
      if (redoRef.current.length === 0) return current;
      const next = redoRef.current.pop()!;
      pastRef.current.push(current);
      setHistorySizes((s) => ({ past: s.past + 1, redo: s.redo - 1 }));
      return next;
    });
  }, []);

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: historySizes.past > 0,
    canRedo: historySizes.redo > 0,
  };
}
