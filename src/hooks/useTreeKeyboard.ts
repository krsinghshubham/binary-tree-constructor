import { useEffect } from 'react';

interface UseTreeKeyboardOptions {
  selectedNodeId: string | null;
  onDelete: (id: string) => void;
  onClearSelection: () => void;
}

export function useTreeKeyboard(options: UseTreeKeyboardOptions): void {
  const { selectedNodeId, onDelete, onClearSelection } = options;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          e.preventDefault();
          onDelete(selectedNodeId);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onClearSelection();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNodeId, onDelete, onClearSelection]);
}
