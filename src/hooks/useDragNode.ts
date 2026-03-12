import { useState, useCallback, useRef } from 'react';
import type { DragPayload, DropTarget, LayoutNode } from '../types';
import { NODE_RADIUS } from '../utils/treeLayout';

export function useDragNode() {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoverTarget, setHoverTarget] = useState<DropTarget | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const getSVGPoint = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return { x: clientX, y: clientY };
      const svg = svgRef.current;
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return { x: clientX, y: clientY };
      const svgPt = pt.matrixTransform(ctm.inverse());
      return { x: svgPt.x, y: svgPt.y };
    },
    [],
  );

  const startDrag = useCallback(
    (payload: DragPayload, clientX: number, clientY: number) => {
      setDragPayload(payload);
      setIsDragging(true);
      setPointerPos(getSVGPoint(clientX, clientY));
    },
    [getSVGPoint],
  );

  const updateDrag = useCallback(
    (clientX: number, clientY: number, layoutNodes: LayoutNode[]) => {
      const svgPt = getSVGPoint(clientX, clientY);
      setPointerPos(svgPt);

      let closestTarget: DropTarget | null = null;
      let closestDist = Infinity;
      const threshold = NODE_RADIUS * 4;

      for (const ln of layoutNodes) {
        if (dragPayload && ln.id === dragPayload.nodeId) continue;

        const dist = Math.sqrt((svgPt.x - ln.x) ** 2 + (svgPt.y - ln.y) ** 2);
        if (dist < threshold && dist < closestDist) {
          const side: 'left' | 'right' = svgPt.x < ln.x ? 'left' : 'right';

          if (
            (side === 'left' && !ln.hasLeft) ||
            (side === 'right' && !ln.hasRight)
          ) {
            closestDist = dist;
            closestTarget = { parentId: ln.id, side };
          }
        }
      }

      setHoverTarget(closestTarget);
    },
    [dragPayload, getSVGPoint],
  );

  const endDrag = useCallback(() => {
    const result = hoverTarget && dragPayload ? { target: hoverTarget, payload: dragPayload } : null;
    setIsDragging(false);
    setDragPayload(null);
    setHoverTarget(null);
    return result;
  }, [hoverTarget, dragPayload]);

  const cancelDrag = useCallback(() => {
    setIsDragging(false);
    setDragPayload(null);
    setHoverTarget(null);
  }, []);

  return {
    isDragging,
    dragPayload,
    pointerPos,
    hoverTarget,
    svgRef,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
  };
}
