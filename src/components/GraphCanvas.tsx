import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GraphData } from '../types';
import { computeGraphLayout, GRAPH_NODE_RADIUS } from '../utils/graphLayout';

interface GraphCanvasProps {
  graph: GraphData;
  parseError: string | null;
  /** Node to ring-highlight (anchor in connect mode or selection in select mode) */
  highlightNodeId: string | null;
  onNodeClick: (id: string) => void;
  onClearHighlight: () => void;
}

function useGraphZoom() {
  const zoomWrapperRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState({ scale: 1, tx: 0, ty: 0 });
  const lastPinchDist = useRef<number | null>(null);
  const pinchContentPoint = useRef<{ x: number; y: number } | null>(null);
  const pinchInitialZoom = useRef<{ scale: number; tx: number; ty: number } | null>(null);
  const isPanning = useRef(false);
  const [isPanningCursor, setIsPanningCursor] = useState(false);
  const panStart = useRef({ clientX: 0, clientY: 0, tx: 0, ty: 0 });

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const el = zoomWrapperRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;
        const factor = 1 - e.deltaY * 0.002;
        setZoom((z) => {
          const newScale = Math.min(3, Math.max(0.25, z.scale * factor));
          const contentX = (localX - z.tx) / z.scale;
          const contentY = (localY - z.ty) / z.scale;
          return { scale: newScale, tx: localX - contentX * newScale, ty: localY - contentY * newScale };
        });
      }
    },
    [],
  );

  const handleWheelCapture = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) e.preventDefault();
  }, []);

  const getTouchCenter = (touches: React.TouchList) => ({
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  });
  const getTouchDistance = (touches: React.TouchList) =>
    Math.hypot(touches[1].clientX - touches[0].clientX, touches[1].clientY - touches[0].clientY);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        lastPinchDist.current = getTouchDistance(e.touches);
        const center = getTouchCenter(e.touches);
        const el = zoomWrapperRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const localX = center.x - rect.left;
          const localY = center.y - rect.top;
          setZoom((z) => {
            pinchContentPoint.current = {
              x: (localX - z.tx) / z.scale,
              y: (localY - z.ty) / z.scale,
            };
            pinchInitialZoom.current = { scale: z.scale, tx: z.tx, ty: z.ty };
            return z;
          });
        }
      }
    },
    [],
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (
      e.touches.length === 2 &&
      lastPinchDist.current !== null &&
      pinchContentPoint.current &&
      pinchInitialZoom.current
    ) {
      e.preventDefault();
      const dist = getTouchDistance(e.touches);
      const el = zoomWrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = getTouchCenter(e.touches);
      const localX = center.x - rect.left;
      const localY = center.y - rect.top;
      const init = pinchInitialZoom.current;
      const newScale = Math.min(3, Math.max(0.25, init.scale * (dist / lastPinchDist.current)));
      const content = pinchContentPoint.current;
      setZoom({
        scale: newScale,
        tx: localX - content.x * newScale,
        ty: localY - content.y * newScale,
      });
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastPinchDist.current = null;
    pinchContentPoint.current = null;
    pinchInitialZoom.current = null;
  }, []);

  useEffect(() => {
    const el = zoomWrapperRef.current;
    if (!el) return;
    const preventTouchZoom = (e: TouchEvent) => {
      if (e.touches.length === 2) e.preventDefault();
    };
    el.addEventListener('touchmove', preventTouchZoom, { passive: false });
    return () => el.removeEventListener('touchmove', preventTouchZoom);
  }, []);

  useEffect(() => {
    const el = zoomWrapperRef.current;
    if (!el) return;
    const preventWheelZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    el.addEventListener('wheel', preventWheelZoom, { passive: false });
    return () => el.removeEventListener('wheel', preventWheelZoom);
  }, []);

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const target = e.target as Element;
      if (target.closest('.graph-node-group')) return;
      const el = target as SVGElement;
      const isBg =
        target === e.currentTarget ||
        el.classList?.contains('canvas-bg') ||
        el.classList?.contains('graph-canvas-svg') ||
        el.classList?.contains('graph-edge-line');
      if (isBg) {
        e.preventDefault();
        isPanning.current = true;
        setIsPanningCursor(true);
        setZoom((z) => {
          panStart.current = { clientX: e.clientX, clientY: e.clientY, tx: z.tx, ty: z.ty };
          return z;
        });
        (e.target as Element).setPointerCapture(e.pointerId);
      }
    },
    [],
  );

  const handleCanvasPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning.current) return;
    setZoom((z) => ({
      ...z,
      tx: panStart.current.tx + (e.clientX - panStart.current.clientX),
      ty: panStart.current.ty + (e.clientY - panStart.current.clientY),
    }));
  }, []);

  const handleCanvasPointerUp = useCallback((e: React.PointerEvent) => {
    if (isPanning.current) {
      isPanning.current = false;
      setIsPanningCursor(false);
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
  }, []);

  return {
    zoomWrapperRef,
    zoom,
    isPanningCursor,
    handleWheel,
    handleWheelCapture,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUp,
  };
}

/** Quadratic Bézier from p0 to p2 with control c; point at t=0.5. */
function quadAtHalf(
  x0: number,
  y0: number,
  cx: number,
  cy: number,
  x2: number,
  y2: number,
): { mx: number; my: number } {
  return {
    mx: 0.25 * x0 + 0.5 * cx + 0.25 * x2,
    my: 0.25 * y0 + 0.5 * cy + 0.25 * y2,
  };
}

/** Perpendicular offset so edges don’t stack as one straight line. */
function edgeBezierControl(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  from: string,
  to: string,
  edgeIndex: number,
): { cx: number; cy: number } {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const key = from <= to ? `${from}\0${to}` : `${to}\0${from}`;
  let h = edgeIndex * 2654435761;
  for (let i = 0; i < key.length; i++) {
    h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  }
  h >>>= 0;
  const sign = (h & 1) === 0 ? 1 : -1;
  const base = 12 + (h % 26) + edgeIndex * 16;
  const scale = Math.min(1.25, len / 90);
  const bump = sign * Math.max(8, base * scale);
  return { cx: mx + nx * bump, cy: my + ny * bump };
}

const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graph,
  parseError,
  highlightNodeId,
  onNodeClick,
  onClearHighlight,
}) => {
  const {
    zoomWrapperRef,
    zoom,
    isPanningCursor,
    handleWheel,
    handleWheelCapture,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUp,
  } = useGraphZoom();

  const { positions, width, height } = useMemo(() => computeGraphLayout(graph), [graph]);

  const svgWidth = Math.max(width, 300);
  const svgHeight = Math.max(height, 240);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      const t = e.target as SVGElement;
      if (t.tagName === 'svg' || t.classList.contains('canvas-bg')) {
        onClearHighlight();
      }
    },
    [onClearHighlight],
  );

  const handleNodePointerDown = useCallback(
    (e: React.PointerEvent, id: string) => {
      e.stopPropagation();
      onNodeClick(id);
    },
    [onNodeClick],
  );

  return (
    <div className="tree-canvas-container graph-canvas-container">
      {parseError && (
        <div className="graph-parse-banner" role="alert">
          {parseError}
        </div>
      )}
      <div
        ref={zoomWrapperRef}
        className="tree-canvas-zoom-wrapper"
        onWheel={handleWheel}
        onWheelCapture={handleWheelCapture}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        <div
          style={{
            transform: `translate(${zoom.tx}px, ${zoom.ty}px) scale(${zoom.scale})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
            minHeight: 300,
          }}
        >
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="tree-canvas-svg graph-canvas-svg"
            onClick={handleCanvasClick}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onPointerCancel={handleCanvasPointerUp}
            style={{ touchAction: 'none', cursor: isPanningCursor ? 'grabbing' : 'grab' }}
          >
            <rect className="canvas-bg" width={svgWidth} height={svgHeight} fill="transparent" />

            {graph.nodes.length === 0 && !parseError && (
              <text
                x={svgWidth / 2}
                y={svgHeight / 2}
                textAnchor="middle"
                fontSize={15}
                className="canvas-empty-text"
              >
                Type a graph above, or use Add node + Connect mode
              </text>
            )}

            {graph.edges.map((e, i) => {
              const p1 = positions.get(e.from);
              const p2 = positions.get(e.to);
              if (!p1 || !p2) return null;
              const { cx: bcx, cy: bcy } = edgeBezierControl(
                p1.x,
                p1.y,
                p2.x,
                p2.y,
                e.from,
                e.to,
                i,
              );
              const { mx, my } = quadAtHalf(p1.x, p1.y, bcx, bcy, p2.x, p2.y);
              const showW = e.weight !== undefined;
              const d = `M ${p1.x} ${p1.y} Q ${bcx} ${bcy} ${p2.x} ${p2.y}`;
              return (
                <g key={`${e.from}-${e.to}-${i}`}>
                  <path
                    d={d}
                    fill="none"
                    strokeWidth={2}
                    className="tree-edge graph-edge-line"
                    style={{ stroke: 'var(--edge-stroke)' }}
                  />
                  {showW && (
                    <g className="graph-edge-weight-group" pointerEvents="none">
                      <rect
                        x={mx - Math.max(18, (String(e.weight).length * 6 + 16) / 2)}
                        y={my - 10}
                        width={Math.max(36, String(e.weight).length * 6 + 16)}
                        height={18}
                        rx={4}
                        className="graph-edge-weight-bg"
                      />
                      <text
                        x={mx}
                        y={my + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={11}
                        fontWeight={600}
                        className="graph-edge-weight-text"
                      >
                        {String(e.weight)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {graph.nodes.map((id) => {
              const p = positions.get(id);
              if (!p) return null;
              const selected = id === highlightNodeId;
              const display =
                id.length > 6 ? `${id.slice(0, 5)}…` : id;
              return (
                <g
                  key={id}
                  className="graph-node-group tree-node-group"
                  style={{ cursor: 'pointer' }}
                  onPointerDown={(ev) => handleNodePointerDown(ev, id)}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={GRAPH_NODE_RADIUS}
                    className={selected ? 'graph-node-circle graph-node-selected' : 'graph-node-circle'}
                    strokeWidth={selected ? 3 : 2}
                  />
                  <title>{id}</title>
                  <text
                    x={p.x}
                    y={p.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={id.length > 4 ? 11 : 13}
                    fontWeight={600}
                    className="graph-node-label"
                  >
                    {display}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default GraphCanvas;
