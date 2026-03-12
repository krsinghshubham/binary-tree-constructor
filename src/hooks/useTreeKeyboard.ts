import { useEffect } from 'react';

interface UseTreeKeyboardOptions {
  selectedNodeId: string | null;
  onDelete: (id: string) => void;
  onClearSelection: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

function isInputTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  const role = target.getAttribute('contenteditable');
  return tag === 'input' || tag === 'textarea' || role === 'true';
}

export function useTreeKeyboard(options: UseTreeKeyboardOptions): void {
  const {
    selectedNodeId,
    onDelete,
    onClearSelection,
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false,
  } = options;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const inInput = isInputTarget(e.target);

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId && !inInput) {
          e.preventDefault();
          onDelete(selectedNodeId);
        }
        return;
      }
      if (e.key === 'Escape') {
        if (!inInput) {
          e.preventDefault();
          onClearSelection();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (inInput) return;
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo && onRedo) onRedo();
        } else {
          if (canUndo && onUndo) onUndo();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    selectedNodeId,
    onDelete,
    onClearSelection,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
  ]);
}
