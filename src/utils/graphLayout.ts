import type { GraphData } from '../types';

export const GRAPH_NODE_RADIUS = 22;

export interface GraphLayoutResult {
  positions: Map<string, { x: number; y: number }>;
  width: number;
  height: number;
}

/** Deterministic PRNG for stable layouts across re-renders for the same graph. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashGraph(graph: GraphData): number {
  const ns = [...graph.nodes].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).join(',');
  const es = [...graph.edges]
    .map((e) => `${e.from}|${e.to}|${e.weight ?? ''}`)
    .sort()
    .join(';');
  const s = `${ns}#${es}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function layoutDimensions(graph: GraphData): { width: number; height: number } {
  const n = graph.nodes.length;
  const m = graph.edges.length;
  const scale = 1 + Math.min(0.85, n * 0.055 + m * 0.025);
  return {
    width: Math.round(760 * scale),
    height: Math.round(520 * scale),
  };
}

/**
 * One force-directed pass. Strong repulsion + tuned attraction to avoid collinear collapse.
 */
function runForceLayout(
  graph: GraphData,
  width: number,
  height: number,
  rng: () => number,
): Map<string, { x: number; y: number; vx: number; vy: number }> {
  const n = graph.nodes.length;
  const positions = new Map<string, { x: number; y: number; vx: number; vy: number }>();

  const cx = width / 2;
  const cy = height / 2;
  const spread = Math.min(width, height) * 0.38;

  graph.nodes.forEach((id) => {
    const rx = (rng() - 0.5) * 2;
    const ry = (rng() - 0.5) * 2;
    positions.set(id, {
      x: cx + rx * spread,
      y: cy + ry * spread,
      vx: 0,
      vy: 0,
    });
  });

  if (n === 1) {
    const id = graph.nodes[0];
    positions.get(id)!.x = cx;
    positions.get(id)!.y = cy;
    return positions;
  }

  const area = width * height;
  const k = Math.sqrt(area / Math.max(n, 1)) * 1.15;
  const repulsionScale = 2.4;

  const pairKey = (a: string, b: string) => (a < b ? `${a}\0${b}` : `${b}\0${a}`);
  const uniqueEdges = new Map<string, { u: string; v: string; weight?: number }>();
  for (const e of graph.edges) {
    const key = pairKey(e.from, e.to);
    if (!uniqueEdges.has(key)) {
      uniqueEdges.set(key, { u: e.from, v: e.to, weight: e.weight });
    }
  }

  const iterations = 520;
  let temperature = Math.min(width, height) / 6;

  for (let iter = 0; iter < iterations; iter++) {
    const disp = new Map<string, { dx: number; dy: number }>();
    for (const id of graph.nodes) disp.set(id, { dx: 0, dy: 0 });

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const idI = graph.nodes[i];
        const idJ = graph.nodes[j];
        const pi = positions.get(idI)!;
        const pj = positions.get(idJ)!;
        let dx = pi.x - pj.x;
        let dy = pi.y - pj.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        const f = (repulsionScale * k * k) / dist;
        const fx = (dx / dist) * f;
        const fy = (dy / dist) * f;
        disp.get(idI)!.dx += fx;
        disp.get(idI)!.dy += fy;
        disp.get(idJ)!.dx -= fx;
        disp.get(idJ)!.dy -= fy;
      }
    }

    for (const { u, v, weight } of uniqueEdges.values()) {
      const pu = positions.get(u);
      const pv = positions.get(v);
      if (!pu || !pv) continue;
      let dx = pv.x - pu.x;
      let dy = pv.y - pu.y;
      const dist = Math.hypot(dx, dy) || 0.01;
      const lengthScale = weight != null ? 1 + Math.log1p(Math.abs(weight)) * 0.12 : 1;
      const ideal = k * lengthScale * 0.95;
      const f = (dist * dist) / ideal;
      const fx = (dx / dist) * f;
      const fy = (dy / dist) * f;
      disp.get(u)!.dx += fx;
      disp.get(u)!.dy += fy;
      disp.get(v)!.dx -= fx;
      disp.get(v)!.dy -= fy;
    }

    // Weak pull toward center — reduces drifting to a line at the border
    const gravity = 0.018 * (1 - iter / iterations);
    for (const id of graph.nodes) {
      const p = positions.get(id)!;
      const d = disp.get(id)!;
      d.dx += (cx - p.x) * gravity;
      d.dy += (cy - p.y) * gravity;
    }

    // Early-phase noise helps escape degenerate (collinear) local minima
    const noiseAmp = temperature * 0.04 * Math.max(0, 1 - iter / (iterations * 0.35));
    for (const id of graph.nodes) {
      const d = disp.get(id)!;
      d.dx += (rng() - 0.5) * noiseAmp;
      d.dy += (rng() - 0.5) * noiseAmp;
    }

    for (const id of graph.nodes) {
      const d = disp.get(id)!;
      const move = Math.hypot(d.dx, d.dy) || 0;
      const capped = Math.min(temperature, move);
      const p = positions.get(id)!;
      if (move > 0) {
        p.x += (d.dx / move) * capped;
        p.y += (d.dy / move) * capped;
      }
      const pad = GRAPH_NODE_RADIUS + 18;
      p.x = Math.max(pad, Math.min(width - pad, p.x));
      p.y = Math.max(pad, Math.min(height - pad, p.y));
    }

    temperature *= 0.965;
  }

  return positions;
}

/** Minimum pairwise distance among nodes (centers). */
function minNodeSeparation(
  graph: GraphData,
  pos: Map<string, { x: number; y: number }>,
): number {
  const nodes = graph.nodes;
  let minD = Infinity;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = pos.get(nodes[i]);
      const b = pos.get(nodes[j]);
      if (!a || !b) continue;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < minD) minD = d;
    }
  }
  return minD === Infinity ? 0 : minD;
}

/**
 * Fruchterman–Reingold–style layout with multiple random restarts; keeps the least crowded trial.
 */
export function computeGraphLayout(graph: GraphData, width?: number, height?: number): GraphLayoutResult {
  const dim = width !== undefined && height !== undefined ? { width, height } : layoutDimensions(graph);
  const w = dim.width;
  const h = dim.height;
  const n = graph.nodes.length;

  if (n === 0) {
    return { positions: new Map(), width: w, height: h };
  }

  const baseSeed = hashGraph(graph);
  const trials = n <= 2 ? 1 : n <= 6 ? 6 : 10;

  let bestPos: Map<string, { x: number; y: number; vx: number; vy: number }> | null = null;
  let bestScore = -Infinity;

  for (let t = 0; t < trials; t++) {
    const rng = mulberry32(baseSeed + t * 2654435761);
    const trial = runForceLayout(graph, w, h, rng);
    const flat = new Map<string, { x: number; y: number }>();
    for (const id of graph.nodes) {
      const p = trial.get(id)!;
      flat.set(id, { x: p.x, y: p.y });
    }
    const sep = minNodeSeparation(graph, flat);
    const cx = w / 2;
    const cy = h / 2;
    let spread = 0;
    for (const id of graph.nodes) {
      const p = flat.get(id)!;
      spread += Math.hypot(p.x - cx, p.y - cy);
    }
    const score = sep * 1.4 + (spread / Math.max(n, 1)) * 0.15;
    if (score > bestScore) {
      bestScore = score;
      bestPos = trial;
    }
  }

  const out = new Map<string, { x: number; y: number }>();
  for (const id of graph.nodes) {
    const p = bestPos!.get(id)!;
    out.set(id, { x: p.x, y: p.y });
  }
  return { positions: out, width: w, height: h };
}
