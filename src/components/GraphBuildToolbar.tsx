import type { GraphBuildMode } from '../hooks/useGraphState';

interface GraphBuildToolbarProps {
  buildMode: GraphBuildMode;
  onBuildModeChange: (mode: GraphBuildMode) => void;
  edgeWeightDraft: string;
  onEdgeWeightDraftChange: (v: string) => void;
  onAddNode: () => void;
  onRemoveSelected: () => void;
  canRemove: boolean;
}

export function GraphBuildToolbar({
  buildMode,
  onBuildModeChange,
  edgeWeightDraft,
  onEdgeWeightDraftChange,
  onAddNode,
  onRemoveSelected,
  canRemove,
}: GraphBuildToolbarProps) {
  return (
    <div className="graph-build-toolbar">
      <div className="graph-build-toolbar-row">
        <span className="graph-build-label">Build</span>
        <div className="graph-mode-toggle" role="group" aria-label="Graph build mode">
          <button
            type="button"
            className={`graph-mode-btn${buildMode === 'connect' ? ' is-active' : ''}`}
            onClick={() => onBuildModeChange('connect')}
          >
            Connect
          </button>
          <button
            type="button"
            className={`graph-mode-btn${buildMode === 'select' ? ' is-active' : ''}`}
            onClick={() => onBuildModeChange('select')}
          >
            Select
          </button>
        </div>
        <button type="button" className="btn btn-copy" onClick={onAddNode}>
          Add node
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={onRemoveSelected}
          disabled={!canRemove}
          title="Remove selected node (or press Delete)"
        >
          Remove node
        </button>
      </div>
      <div className="graph-build-toolbar-row graph-weight-row">
        <label className="graph-weight-label" htmlFor="graph-edge-weight">
          Edge weight (Connect mode)
        </label>
        <input
          id="graph-edge-weight"
          type="text"
          inputMode="decimal"
          className="graph-weight-input"
          placeholder="empty = unweighted"
          value={edgeWeightDraft}
          onChange={(e) => onEdgeWeightDraftChange(e.target.value)}
          spellCheck={false}
        />
      </div>
      <p className="graph-build-hint">
        {buildMode === 'connect'
          ? 'Click one node, then another to add an edge. Click the same node again to cancel.'
          : 'Click a node to select it, then Remove node or Delete.'}
      </p>
    </div>
  );
}
