import type { GraphData, GraphEdge } from '../types';

export type GraphInputKind = 'edgeList' | 'leetcode';

export interface ParseGraphMeta {
  kind: GraphInputKind;
  /** Present when kind === 'leetcode' */
  leetcodeVariant?: 'array' | 'object';
}

export type ParseGraphResult =
  | { ok: true; graph: GraphData; meta: ParseGraphMeta }
  | { ok: false; error: string };

/**
 * Edge list, comma-separated.
 * Unweighted: 0-1, 1-2, 2-0
 * Weighted:   0-1:5, 1-2:3 (use : after the pair)
 */
const EDGE_TOKEN =
  /^\s*(\S+?)\s*[-−]\s*(\S+?)(?:\s*:\s*(-?(?:\d+(?:\.\d+)?|\.\d+)))?\s*$/;

function normalizeNodeId(s: string): string {
  return s.trim();
}

function parseEdgeListOnly(trimmed: string): ParseGraphResult {
  const rawParts = trimmed.split(',').map((p) => p.trim());
  const segments: string[] = [];
  for (const p of rawParts) {
    if (p) segments.push(p);
  }

  if (segments.length === 0) {
    return { ok: true, graph: { nodes: [], edges: [] }, meta: { kind: 'edgeList' } };
  }

  const edges: GraphEdge[] = [];
  const nodeSet = new Set<string>();

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const m = seg.match(EDGE_TOKEN);
    if (!m) {
      return {
        ok: false,
        error: `Invalid edge "${seg}". Use a-b or a-b:weight, or LeetCode JSON [[u,v],[u,v,w]] / {"n":5,"edges":[]}.`,
      };
    }
    const from = normalizeNodeId(m[1]);
    const to = normalizeNodeId(m[2]);
    if (!from || !to) {
      return { ok: false, error: `Empty node name in "${seg}".` };
    }
    if (from === to) {
      return { ok: false, error: `Self-loop "${seg}" is not supported.` };
    }
    let weight: number | undefined;
    if (m[3] !== undefined && m[3] !== '') {
      const w = Number(m[3]);
      if (Number.isNaN(w)) {
        return { ok: false, error: `Invalid weight in "${seg}".` };
      }
      weight = w;
    }
    nodeSet.add(from);
    nodeSet.add(to);
    edges.push({ from, to, weight });
  }

  const nodes = Array.from(nodeSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return { ok: true, graph: { nodes, edges }, meta: { kind: 'edgeList' } };
}

function parseLeetEdgeRows(rows: unknown[]): { ok: true; edges: GraphEdge[] } | { ok: false; error: string } {
  const edges: GraphEdge[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row)) {
      return { ok: false, error: `edges[${i}] must be an array.` };
    }
    if (row.length !== 2 && row.length !== 3) {
      return { ok: false, error: `edges[${i}] must be [u,v] or [u,v,w] (LeetCode style).` };
    }
    const u = row[0];
    const v = row[1];
    if (typeof u !== 'number' || typeof v !== 'number' || !Number.isInteger(u) || !Number.isInteger(v)) {
      return { ok: false, error: `edges[${i}]: u and v must be integers.` };
    }
    if (u === v) {
      return { ok: false, error: `Self-loop [${u},${v}] is not supported.` };
    }
    let weight: number | undefined;
    if (row.length === 3) {
      const w = row[2];
      if (typeof w !== 'number' || Number.isNaN(w)) {
        return { ok: false, error: `edges[${i}]: weight must be a number.` };
      }
      weight = w;
    }
    edges.push({ from: String(u), to: String(v), weight });
  }
  return { ok: true, edges };
}

function parseLeetCodeObject(o: Record<string, unknown>): ParseGraphResult {
  const nRaw = o.n;
  const edgesRaw = o.edges;
  if (typeof nRaw !== 'number' || !Number.isInteger(nRaw) || nRaw < 0) {
    return { ok: false, error: '"n" must be a non-negative integer (LeetCode {n, edges}).' };
  }
  if (!Array.isArray(edgesRaw)) {
    return { ok: false, error: '"edges" must be an array.' };
  }
  const parsed = parseLeetEdgeRows(edgesRaw);
  if (!parsed.ok) return parsed;
  for (let i = 0; i < parsed.edges.length; i++) {
    const e = parsed.edges[i];
    const u = Number(e.from);
    const v = Number(e.to);
    if (u >= nRaw || v >= nRaw || u < 0 || v < 0) {
      return {
        ok: false,
        error: `edges[${i}] uses vertices outside 0..n-1 (n=${nRaw}).`,
      };
    }
  }
  const nodes = Array.from({ length: nRaw }, (_, i) => String(i));
  return {
    ok: true,
    graph: { nodes, edges: parsed.edges },
    meta: { kind: 'leetcode', leetcodeVariant: 'object' },
  };
}

function parseLeetCodeArray(arr: unknown[]): ParseGraphResult {
  const parsed = parseLeetEdgeRows(arr);
  if (!parsed.ok) return parsed;
  const nodeSet = new Set<string>();
  for (const e of parsed.edges) {
    nodeSet.add(e.from);
    nodeSet.add(e.to);
  }
  const nodes = Array.from(nodeSet).sort((a, b) => Number(a) - Number(b));
  return {
    ok: true,
    graph: { nodes, edges: parsed.edges },
    meta: { kind: 'leetcode', leetcodeVariant: 'array' },
  };
}

/**
 * Accepts:
 * - LeetCode `[[u,v],...]` or `[[u,v,w],...]` (nodes = endpoints only)
 * - LeetCode `{"n":5,"edges":[[0,1],...]}` (vertices 0..n-1, isolates allowed)
 * - Text edge list `0-1, 1-2:3`
 */
export function parseGraphInput(input: string): ParseGraphResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      ok: true,
      graph: { nodes: [], edges: [] },
      meta: { kind: 'leetcode', leetcodeVariant: 'object' },
    };
  }

  const c = trimmed[0];
  if (c === '[' || c === '{') {
    let data: unknown;
    try {
      data = JSON.parse(trimmed);
    } catch {
      return { ok: false, error: 'Invalid JSON (check brackets and commas).' };
    }
    if (Array.isArray(data)) {
      return parseLeetCodeArray(data);
    }
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return parseLeetCodeObject(data as Record<string, unknown>);
    }
    return { ok: false, error: 'JSON must be a LeetCode edge array or {"n","edges"} object.' };
  }

  return parseEdgeListOnly(trimmed);
}

export function graphToJson(graph: GraphData): object {
  return {
    nodes: graph.nodes,
    edges: graph.edges.map((e) =>
      e.weight !== undefined ? { from: e.from, to: e.to, weight: e.weight } : { from: e.from, to: e.to },
    ),
  };
}

/** LeetCode-style `{ n, edges }` where n = maxLabel+1 for included vertices (numeric ids only). */
export function serializeLeetCodeObject(graph: GraphData): string {
  const nums = graph.nodes.map((id) => (/^\d+$/.test(id) ? Number(id) : NaN));
  if (nums.some((x) => Number.isNaN(x))) {
    return serializeGraphEdgeList(graph);
  }
  const n = nums.length === 0 ? 0 : Math.max(...nums) + 1;
  const edgesLc = graph.edges.map((e) => {
    const u = Number(e.from);
    const v = Number(e.to);
    if (!Number.isInteger(u) || !Number.isInteger(v)) {
      return null;
    }
    return e.weight !== undefined ? ([u, v, e.weight] as const) : ([u, v] as const);
  });
  if (edgesLc.some((x) => x === null)) {
    return serializeGraphEdgeList(graph);
  }
  (edgesLc as (readonly [number, number] | readonly [number, number, number])[]).sort((a, b) => {
    if (a[0] !== b[0]) return a[0] - b[0];
    if (a[1] !== b[1]) return a[1] - b[1];
    const wa = a.length === 3 ? a[2] : NaN;
    const wb = b.length === 3 ? b[2] : NaN;
    return (wa as number) - (wb as number);
  });
  return JSON.stringify({ n, edges: edgesLc });
}

/** Bare LeetCode array (endpoints only; no implicit isolates). */
export function serializeLeetCodeArray(graph: GraphData): string {
  const nums = graph.nodes.map((id) => (/^\d+$/.test(id) ? Number(id) : NaN));
  if (nums.some((x) => Number.isNaN(x))) {
    return serializeGraphEdgeList(graph);
  }
  const edgeNodes = new Set<string>();
  graph.edges.forEach((e) => {
    edgeNodes.add(e.from);
    edgeNodes.add(e.to);
  });
  const orphan = graph.nodes.some((id) => !edgeNodes.has(id));
  if (orphan) {
    return serializeLeetCodeObject(graph);
  }
  const edgesLc = graph.edges.map((e) => {
    const u = Number(e.from);
    const v = Number(e.to);
    return e.weight !== undefined ? ([u, v, e.weight] as const) : ([u, v] as const);
  });
  edgesLc.sort((a, b) => {
    if (a[0] !== b[0]) return a[0] - b[0];
    if (a[1] !== b[1]) return a[1] - b[1];
    const wa = a.length === 3 ? a[2] : NaN;
    const wb = b.length === 3 ? b[2] : NaN;
    return (wa as number) - (wb as number);
  });
  return JSON.stringify(edgesLc);
}

/** Pick serialization after interactive edits (prefers {n,edges} for isolates / numeric graphs). */
export function serializeGraphAfterEdit(graph: GraphData, meta: ParseGraphMeta | null): string {
  if (graph.nodes.length === 0 && graph.edges.length === 0) return '';

  const edgeEndpoints = new Set<string>();
  graph.edges.forEach((e) => {
    edgeEndpoints.add(e.from);
    edgeEndpoints.add(e.to);
  });
  const hasIsolatedVertex = graph.nodes.some((id) => !edgeEndpoints.has(id));

  if (meta?.kind === 'edgeList') {
    if (hasIsolatedVertex && graph.nodes.every((id) => /^\d+$/.test(id))) {
      return serializeLeetCodeObject(graph);
    }
    return serializeGraphEdgeList(graph);
  }
  if (meta?.leetcodeVariant === 'array') {
    if (hasIsolatedVertex) return serializeLeetCodeObject(graph);
    return serializeLeetCodeArray(graph);
  }
  return serializeLeetCodeObject(graph);
}

/** Canonical text edge list */
export function serializeGraphEdgeList(graph: GraphData): string {
  if (graph.edges.length === 0) return '';

  const sorted = [...graph.edges].sort((a, b) => {
    const ca = a.from.localeCompare(b.from, undefined, { numeric: true });
    if (ca !== 0) return ca;
    const ct = a.to.localeCompare(b.to, undefined, { numeric: true });
    if (ct !== 0) return ct;
    const wa = a.weight ?? NaN;
    const wb = b.weight ?? NaN;
    return wa - wb;
  });

  return sorted
    .map((e) => (e.weight !== undefined ? `${e.from}-${e.to}:${e.weight}` : `${e.from}-${e.to}`))
    .join(', ');
}

/** @deprecated use serializeGraphEdgeList */
export const serializeGraph = serializeGraphEdgeList;
