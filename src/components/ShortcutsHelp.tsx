import React, { useState } from 'react';

const shortcuts = [
  { keys: 'Ctrl/Cmd + Z', action: 'Undo' },
  { keys: 'Ctrl/Cmd + Shift + Z', action: 'Redo' },
  { keys: 'Delete / Backspace', action: 'Delete selected node' },
  { keys: 'Enter', action: 'Edit selected node value' },
  { keys: 'Escape', action: 'Deselect' },
  { keys: 'Arrow Keys', action: 'Navigate between nodes' },
];

const ShortcutsHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="btn btn-help" onClick={() => setIsOpen(true)} title="Keyboard shortcuts">
        ?
      </button>
      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content shortcuts-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Keyboard Shortcuts</h3>
              <button className="btn-close" onClick={() => setIsOpen(false)}>x</button>
            </div>
            <div className="shortcuts-list">
              {shortcuts.map((s) => (
                <div key={s.keys} className="shortcut-row">
                  <kbd className="shortcut-keys">{s.keys}</kbd>
                  <span className="shortcut-action">{s.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShortcutsHelp;
