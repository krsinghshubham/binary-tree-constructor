import { useState, useCallback, useRef, useEffect } from 'react';
import type { AppConfig, DragPayload, DropTarget } from './types';
import { useTreeState } from './hooks/useTreeState';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useTreeKeyboard } from './hooks/useTreeKeyboard';
import TreeCanvas from './components/TreeCanvas';
import InputPanel from './components/InputPanel';
import NodeSource from './components/NodeSource';
import ConfigPanel from './components/ConfigPanel';
import TraversalPanel from './components/TraversalPanel';
import type { TraversalType } from './components/TraversalPanel';
import ValidationPanel from './components/ValidationPanel';
import { ExportPanel } from './components/ExportPanel';
import SampleTrees from './components/SampleTrees';
import {
  getInorderIds,
  getPreorderIds,
  getPostorderIds,
  getInorderValues,
  getPreorderValues,
  getPostorderValues,
} from './utils/treeTraversal';
import { treeToPlainObject } from './utils/treeParser';
import './App.css';

const TRAVERSAL_STEP_MS = 400;

function App() {
  const [config, setConfig] = useState<AppConfig>({ defaultNodeValue: -1 });
  const undo = useUndoRedo<string>('[1,2,3]');
  const tree = useTreeState(config, { inputText: undo.state, setInputText: undo.setState });

  useTreeKeyboard({
    selectedNodeId: tree.selectedNodeId,
    onDelete: tree.deleteNode,
    onClearSelection: () => tree.setSelectedNodeId(null),
  });

  const [externalDragPayload, setExternalDragPayload] = useState<DragPayload | null>(null);
  const [isExternalDragging, setIsExternalDragging] = useState(false);
  const [dragGhostPos, setDragGhostPos] = useState<{ x: number; y: number } | null>(null);

  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [traversalResult, setTraversalResult] = useState<number[]>([]);
  const [activeTraversalType, setActiveTraversalType] = useState<TraversalType | null>(null);
  const traversalIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (traversalIntervalRef.current) clearInterval(traversalIntervalRef.current);
    };
  }, []);

  const handleTraversalClick = useCallback(
    (type: TraversalType) => {
      if (traversalIntervalRef.current) {
        clearInterval(traversalIntervalRef.current);
        traversalIntervalRef.current = null;
      }
      if (!tree.root) {
        setTraversalResult([]);
        setActiveTraversalType(null);
        setHighlightedNodeId(null);
        return;
      }
      const idFns = { inorder: getInorderIds, preorder: getPreorderIds, postorder: getPostorderIds };
      const valFns = {
        inorder: getInorderValues,
        preorder: getPreorderValues,
        postorder: getPostorderValues,
      };
      const ids = idFns[type](tree.root);
      const values = valFns[type](tree.root);
      setTraversalResult(values);
      setActiveTraversalType(type);
      if (ids.length === 0) {
        setHighlightedNodeId(null);
        return;
      }
      let step = 0;
      setHighlightedNodeId(ids[0]);
      traversalIntervalRef.current = setInterval(() => {
        step += 1;
        if (step >= ids.length) {
          if (traversalIntervalRef.current) clearInterval(traversalIntervalRef.current);
          traversalIntervalRef.current = null;
          setHighlightedNodeId(null);
          return;
        }
        setHighlightedNodeId(ids[step]);
      }, TRAVERSAL_STEP_MS);
    },
    [tree.root],
  );

  const handleExternalDragStart = useCallback((val: number, clientX: number, clientY: number) => {
    setExternalDragPayload({ nodeId: null, val, subtree: null });
    setIsExternalDragging(true);
    setDragGhostPos({ x: clientX, y: clientY });
  }, []);

  const handleExternalDragMove = useCallback((clientX: number, clientY: number) => {
    setDragGhostPos({ x: clientX, y: clientY });
  }, []);

  const handleExternalDragEnd = useCallback(() => {
    setIsExternalDragging(false);
    setExternalDragPayload(null);
    setDragGhostPos(null);
  }, []);

  const handleExternalDrop = useCallback(
    (target: DropTarget) => {
      if (!externalDragPayload) return;
      tree.addNode(target.parentId, target.side, externalDragPayload.val);
      setIsExternalDragging(false);
      setExternalDragPayload(null);
      setDragGhostPos(null);
    },
    [externalDragPayload, tree],
  );

  const handleSampleSelect = useCallback(
    (arrayString: string) => {
      undo.setState(arrayString);
    },
    [undo],
  );

  const treeJson = tree.root ? treeToPlainObject(tree.root) : null;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Binary Tree Constructor</h1>
        <p className="subtitle">Build, visualize, and export binary trees interactively</p>
      </header>

      <main className="app-main">
        <InputPanel
          value={tree.inputText}
          onChange={tree.updateTreeFromInput}
          onClear={tree.clearTree}
        />

        <div className="toolbar">
          <div className="toolbar-group">
            <button
              type="button"
              className="btn"
              onClick={undo.undo}
              disabled={!undo.canUndo}
              title="Undo"
            >
              Undo
            </button>
            <button
              type="button"
              className="btn"
              onClick={undo.redo}
              disabled={!undo.canRedo}
              title="Redo"
            >
              Redo
            </button>
          </div>
          <ExportPanel arrayString={tree.inputText} treeJson={treeJson ?? undefined} />
          <SampleTrees onSelectSample={handleSampleSelect} />
        </div>

        <div className="panels-row">
          <TraversalPanel
            root={tree.root}
            highlightedId={highlightedNodeId}
            onTraversalClick={handleTraversalClick}
            traversalResult={traversalResult}
            activeTraversalType={activeTraversalType}
          />
          <ValidationPanel root={tree.root} />
        </div>

        <TreeCanvas
          root={tree.root}
          selectedNodeId={tree.selectedNodeId}
          highlightedNodeId={highlightedNodeId}
          onSelect={tree.setSelectedNodeId}
          onDelete={tree.deleteNode}
          onEditValue={tree.editNodeValue}
          onAddNode={tree.addNode}
          onMoveNode={tree.moveNode}
          onSetRoot={tree.setRootNode}
          defaultNodeValue={config.defaultNodeValue}
          externalDragPayload={externalDragPayload}
          onExternalDrop={handleExternalDrop}
          isExternalDragging={isExternalDragging}
        />

        <div className="bottom-bar">
          <NodeSource
            defaultValue={config.defaultNodeValue}
            onDragStart={handleExternalDragStart}
            onDragMove={handleExternalDragMove}
            onDragEnd={handleExternalDragEnd}
            isDragging={isExternalDragging}
          />
          <ConfigPanel config={config} onConfigChange={setConfig} />
        </div>
      </main>

      {isExternalDragging && dragGhostPos && externalDragPayload && (
        <div
          className="floating-drag-ghost"
          style={{ left: dragGhostPos.x - 20, top: dragGhostPos.y - 20 }}
        >
          {externalDragPayload.val}
        </div>
      )}
    </div>
  );
}

export default App;
