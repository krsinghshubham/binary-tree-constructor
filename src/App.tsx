import { useState, useCallback, useRef, useEffect } from 'react';
import type { AppConfig, DragPayload, DropTarget, StructureKind } from './types';
import type { GraphBuildMode } from './hooks/useGraphState';
import { useTreeState } from './hooks/useTreeState';
import { useGraphState } from './hooks/useGraphState';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useTreeKeyboard, isTypingInField } from './hooks/useTreeKeyboard';
import TreeCanvas from './components/TreeCanvas';
import GraphCanvas from './components/GraphCanvas';
import InputPanel from './components/InputPanel';
import GraphInputPanel from './components/GraphInputPanel';
import NodeSource from './components/NodeSource';
import ConfigPanel from './components/ConfigPanel';
import TraversalPanel from './components/TraversalPanel';
import type { TraversalType } from './components/TraversalPanel';
import ValidationPanel from './components/ValidationPanel';
import { ExportPanel } from './components/ExportPanel';
import SampleTrees from './components/SampleTrees';
import { StructureSwitcher } from './components/StructureSwitcher';
import { GraphBuildToolbar } from './components/GraphBuildToolbar';
import {
  getInorderIds,
  getPreorderIds,
  getPostorderIds,
  getInorderValues,
  getPreorderValues,
  getPostorderValues,
} from './utils/treeTraversal';
import { treeToPlainObject } from './utils/treeParser';
import { graphToJson } from './utils/graphParser';
import './App.css';

const TRAVERSAL_STEP_MS = 400;

function App() {
  const [structureKind, setStructureKind] = useState<StructureKind>('tree');
  const [config, setConfig] = useState<AppConfig>({ defaultNodeValue: -1, theme: 'leetcode' });

  const treeUndo = useUndoRedo<string>('[1,2,3]');
  const graphUndo = useUndoRedo<string>('');

  const tree = useTreeState(config, { inputText: treeUndo.state, setInputText: treeUndo.setState });
  const graph = useGraphState({ inputText: graphUndo.state, setInputText: graphUndo.setState });

  useTreeKeyboard({
    enabled: structureKind === 'tree',
    selectedNodeId: tree.selectedNodeId,
    onDelete: tree.deleteNode,
    onClearSelection: () => tree.setSelectedNodeId(null),
    onUndo: treeUndo.undo,
    onRedo: treeUndo.redo,
    canUndo: treeUndo.canUndo,
    canRedo: treeUndo.canRedo,
  });

  const graphUndoRef = useRef(graphUndo);
  graphUndoRef.current = graphUndo;

  useEffect(() => {
    if (structureKind !== 'graph') return;
    const handler = (e: KeyboardEvent) => {
      if (isTypingInField(e.target)) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        const u = graphUndoRef.current;
        if (e.shiftKey) {
          if (u.canRedo) u.redo();
        } else {
          if (u.canUndo) u.undo();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [structureKind]);

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

  const stopTraversal = useCallback(() => {
    if (traversalIntervalRef.current) {
      clearInterval(traversalIntervalRef.current);
      traversalIntervalRef.current = null;
    }
    setHighlightedNodeId(null);
    setTraversalResult([]);
    setActiveTraversalType(null);
  }, []);

  const handleStructureChange = useCallback(
    (next: StructureKind) => {
      if (next === structureKind) return;
      stopTraversal();
      tree.setSelectedNodeId(null);
      graph.clearNodeHighlight();
      graph.setBuildMode('connect');
      setStructureKind(next);
    },
    [structureKind, stopTraversal, tree, graph],
  );

  const handleGraphBuildModeChange = useCallback(
    (mode: GraphBuildMode) => {
      graph.setBuildMode(mode);
      graph.clearNodeHighlight();
    },
    [graph],
  );

  const graphRef = useRef(graph);
  graphRef.current = graph;

  useEffect(() => {
    if (structureKind !== 'graph') return;
    const handler = (e: KeyboardEvent) => {
      if (isTypingInField(e.target)) return;
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const g = graphRef.current;
      if (g.buildMode !== 'select' || !g.selectedNodeId) return;
      e.preventDefault();
      g.removeSelectedNode();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [structureKind]);

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
      treeUndo.setState(arrayString);
    },
    [treeUndo],
  );

  const treeJson = tree.root ? treeToPlainObject(tree.root) : null;
  const graphJson =
    structureKind === 'graph' && !graph.parseError ? graphToJson(graph.graph) : undefined;

  const activeUndo = structureKind === 'tree' ? treeUndo : graphUndo;

  return (
    <div className="app" data-theme={config.theme}>
      <header className="app-header">
        <h1>DS Visualizer</h1>
        <p className="subtitle">
          {structureKind === 'tree'
            ? 'Build, visualize, and export binary trees interactively'
            : 'LeetCode JSON [[u,v],[u,v,w]] or {"n","edges"} · text a-b · build with Add node + Connect'}
        </p>
        <StructureSwitcher value={structureKind} onChange={handleStructureChange} />
      </header>

      <main className="app-main">
        {structureKind === 'tree' ? (
          <InputPanel
            value={tree.inputText}
            onChange={tree.updateTreeFromInput}
            onClear={tree.clearTree}
          />
        ) : (
          <GraphInputPanel
            value={graph.inputText}
            onChange={graph.updateGraphFromInput}
            onClear={graph.clearGraph}
          />
        )}

        <div className="toolbar">
          <div className="toolbar-group">
            <button
              type="button"
              className="btn"
              onClick={activeUndo.undo}
              disabled={!activeUndo.canUndo}
              title="Undo"
            >
              Undo
            </button>
            <button
              type="button"
              className="btn"
              onClick={activeUndo.redo}
              disabled={!activeUndo.canRedo}
              title="Redo"
            >
              Redo
            </button>
          </div>
          <ExportPanel
            mode={structureKind}
            primaryText={structureKind === 'tree' ? tree.inputText : graph.inputText}
            treeJson={treeJson ?? undefined}
            graphJson={graphJson}
          />
          {structureKind === 'tree' && <SampleTrees onSelectSample={handleSampleSelect} />}
        </div>

        {structureKind === 'tree' ? (
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
        ) : (
          <>
            <GraphBuildToolbar
              buildMode={graph.buildMode}
              onBuildModeChange={handleGraphBuildModeChange}
              edgeWeightDraft={graph.edgeWeightDraft}
              onEdgeWeightDraftChange={graph.setEdgeWeightDraft}
              onAddNode={graph.addNode}
              onRemoveSelected={graph.removeSelectedNode}
              canRemove={graph.buildMode === 'select' && !!graph.selectedNodeId}
            />
            <p className="graph-mode-note">
              Pan: drag background · Zoom: pinch or <kbd>Ctrl</kbd> + scroll
            </p>
          </>
        )}

        {structureKind === 'tree' ? (
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
        ) : (
          <GraphCanvas
            graph={graph.parseError ? { nodes: [], edges: [] } : graph.graph}
            parseError={graph.parseError}
            highlightNodeId={
              graph.buildMode === 'connect' ? graph.connectAnchorId : graph.selectedNodeId
            }
            onNodeClick={graph.handleNodeClick}
            onClearHighlight={graph.clearNodeHighlight}
          />
        )}

        <div className="bottom-bar">
          {structureKind === 'tree' && (
            <NodeSource
              defaultValue={config.defaultNodeValue}
              onDragStart={handleExternalDragStart}
              onDragMove={handleExternalDragMove}
              onDragEnd={handleExternalDragEnd}
              isDragging={isExternalDragging}
            />
          )}
          {structureKind === 'graph' && <div className="bottom-bar-spacer" aria-hidden />}
          <ConfigPanel config={config} onConfigChange={setConfig} />
        </div>
      </main>

      {structureKind === 'tree' && isExternalDragging && dragGhostPos && externalDragPayload && (
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
