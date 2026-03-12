import React from 'react';

interface ToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenCodeGen: () => void;
  onOpenExport: () => void;
  onOpenRandom: () => void;
  hasTree: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenCodeGen,
  onOpenExport,
  onOpenRandom,
  hasTree,
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button className="btn btn-toolbar" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          Undo
        </button>
        <button className="btn btn-toolbar" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
          Redo
        </button>
      </div>
      <div className="toolbar-group">
        <button className="btn btn-toolbar" onClick={onOpenRandom}>
          Generate
        </button>
        <button className="btn btn-toolbar" onClick={onOpenCodeGen} disabled={!hasTree}>
          Code
        </button>
        <button className="btn btn-toolbar" onClick={onOpenExport} disabled={!hasTree}>
          Export
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
