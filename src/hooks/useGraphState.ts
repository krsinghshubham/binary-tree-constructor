import { useState, useCallback, useMemo } from 'react';
import type { GraphData, GraphEdge } from '../types';
import {
  parseGraphInput,
  serializeGraphAfterEdit,
  type ParseGraphMeta,
} from '../utils/graphParser';

export type GraphBuildMode = 'connect' | 'select';

export interface UseGraphStateOptions {
  inputText: string;
  setInputText: (s: string) => void;
}

function edgePairKey(a: string, b: string): string {
  return a < b ? `${a}\0${b}` : `${b}\0${a}`;
}

function nextNumericNodeId(nodes: string[]): string {
  const used = new Set<number>();
  for (const id of nodes) {
    if (/^\d+$/.test(id)) used.add(Number(id));
  }
  let x = 0;
  while (used.has(x)) x += 1;
  return String(x);
}

function normalizeUndirected(from: string, to: string): [string, string] {
  const nf = Number(from);
  const nt = Number(to);
  if (
    /^\d+$/.test(from) &&
    /^\d+$/.test(to) &&
    Number.isInteger(nf) &&
    Number.isInteger(nt)
  ) {
    return nf <= nt ? [String(nf), String(nt)] : [String(nt), String(nf)];
  }
  return from <= to ? [from, to] : [to, from];
}

function mergeGraph(nodes: string[], edges: GraphEdge[]): GraphData {
  const set = new Set(nodes);
  edges.forEach((e) => {
    set.add(e.from);
    set.add(e.to);
  });
  const sorted = Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return { nodes: sorted, edges };
}

export function useGraphState(options?: UseGraphStateOptions) {
  const [internalInput, setInternalInput] = useState('');
  const inputText = options?.inputText ?? internalInput;
  const setInputText = options?.setInputText ?? setInternalInput;

  const parsed = useMemo(() => parseGraphInput(inputText), [inputText]);
  const graph: GraphData = parsed.ok ? parsed.graph : { nodes: [], edges: [] };
  const parseError = parsed.ok ? null : parsed.error;
  const meta: ParseGraphMeta | null = parsed.ok ? parsed.meta : null;

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectAnchorId, setConnectAnchorId] = useState<string | null>(null);
  const [buildMode, setBuildMode] = useState<GraphBuildMode>('connect');
  const [edgeWeightDraft, setEdgeWeightDraft] = useState('');

  const commit = useCallback(
    (g: GraphData) => {
      setInputText(serializeGraphAfterEdit(g, meta));
    },
    [setInputText, meta],
  );

  const updateGraphFromInput = useCallback(
    (text: string) => {
      setInputText(text);
    },
    [setInputText],
  );

  const clearGraph = useCallback(() => {
    setInputText('');
    setSelectedNodeId(null);
    setConnectAnchorId(null);
  }, [setInputText]);

  const parseWeight = useCallback((): number | undefined => {
    const t = edgeWeightDraft.trim();
    if (!t) return undefined;
    const w = Number(t);
    if (Number.isNaN(w)) return undefined;
    return w;
  }, [edgeWeightDraft]);

  const addNode = useCallback(() => {
    const id = nextNumericNodeId(graph.nodes);
    const next = mergeGraph([...graph.nodes, id], graph.edges);
    commit(next);
    setConnectAnchorId(null);
    setSelectedNodeId(id);
  }, [graph, commit]);

  const removeNode = useCallback(
    (nodeId: string) => {
      const nodes = graph.nodes.filter((n) => n !== nodeId);
      const edges = graph.edges.filter((e) => e.from !== nodeId && e.to !== nodeId);
      commit(mergeGraph(nodes, edges));
      setSelectedNodeId(null);
      setConnectAnchorId(null);
    },
    [graph, commit],
  );

  const addEdge = useCallback(
    (from: string, to: string) => {
      if (from === to) return;
      const [a, b] = normalizeUndirected(from, to);
      const w = parseWeight();
      const k = edgePairKey(a, b);
      const filtered = graph.edges.filter((e) => edgePairKey(e.from, e.to) !== k);
      const newEdge: GraphEdge = w !== undefined ? { from: a, to: b, weight: w } : { from: a, to: b };
      const next = mergeGraph(graph.nodes, [...filtered, newEdge]);
      commit(next);
    },
    [graph, commit, parseWeight],
  );

  const handleNodeClick = useCallback(
    (id: string) => {
      if (buildMode === 'select') {
        setSelectedNodeId((prev) => (prev === id ? null : id));
        setConnectAnchorId(null);
        return;
      }
      if (connectAnchorId === null) {
        setConnectAnchorId(id);
        setSelectedNodeId(id);
        return;
      }
      if (connectAnchorId === id) {
        setConnectAnchorId(null);
        setSelectedNodeId(null);
        return;
      }
      addEdge(connectAnchorId, id);
      setConnectAnchorId(null);
      setSelectedNodeId(null);
    },
    [buildMode, connectAnchorId, addEdge],
  );

  const removeSelectedNode = useCallback(() => {
    if (selectedNodeId) removeNode(selectedNodeId);
  }, [selectedNodeId, removeNode]);

  const clearNodeHighlight = useCallback(() => {
    setSelectedNodeId(null);
    setConnectAnchorId(null);
  }, []);

  return {
    inputText,
    graph,
    parseError,
    meta,
    selectedNodeId,
    setSelectedNodeId,
    connectAnchorId,
    buildMode,
    setBuildMode,
    edgeWeightDraft,
    setEdgeWeightDraft,
    updateGraphFromInput,
    clearGraph,
    addNode,
    removeNode,
    removeSelectedNode,
    handleNodeClick,
    clearNodeHighlight,
  };
}
