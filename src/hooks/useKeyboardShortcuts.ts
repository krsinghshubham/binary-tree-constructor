import { useEffect } from 'react';

interface ShortcutActions {
  undo: () => void;
  redo: () => void;
  deleteSelected: () => void;
  editSelected: () => void;
  deselect: () => void;
  navigateLeft: () => void;
  navigateRight: () => void;
  navigateUp: () => void;
  navigateDown: () => void;
}

export function useKeyboardShortcuts(actions: ShortcutActions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        actions.undo();
        return;
      }
      if ((mod && e.key === 'z' && e.shiftKey) || (mod && e.key === 'y')) {
        e.preventDefault();
        actions.redo();
        return;
      }

      if (isInput) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        actions.deleteSelected();
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        actions.editSelected();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        actions.deselect();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        actions.navigateLeft();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        actions.navigateRight();
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        actions.navigateUp();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        actions.navigateDown();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [actions]);
}
