import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { TreeNode, LayoutNode, DragPayload, DropTarget } from '../types';
import { computeLayout, getDropGhostPositions, NODE_RADIUS } from '../utils/treeLayout';
import { findNode, cloneTree } from '../utils/treeParser';
import TreeNodeSVG from './TreeNodeSVG';
import TreeEdge from './TreeEdge';
import DropGhost from './DropGhost';

interface TreeCanvasProps {
  root: TreeNode | null;
  selectedNodeId: string | null;
  highlightedNodeId?: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onEditValue: (id: string, newVal: number) => void;
  onAddNode: (parentId: string, side: 'left' | 'right', val: number, subtree?: TreeNode | null) => void;
  onMoveNode: (nodeId: string, parentId: string, side: 'left' | 'right') => void;
  onSetRoot: (val: number) => void;
  defaultNodeValue: number;
  externalDragPayload: DragPayload | null;
  onExternalDrop: (target: DropTarget) => void;
  isExternalDragging: boolean;
}

const TreeCanvas: React.FC<TreeCanvasProps> = ({
  root,
  selectedNodeId,
  highlightedNodeId = null,
  onSelect,
  onDelete,
  onEditValue,
  onAddNode: _onAddNode,
  onMoveNode,
  onSetRoot,
  defaultNodeValue: _defaultNodeValue,
  externalDragPayload,
  onExternalDrop,
  isExternalDragging,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  // Internal drag state
  const [internalDrag, setInternalDrag] = useState<{
    payload: DragPayload;
    pointerPos: { x: number; y: number };
  } | null>(null);
  const [hoverTarget, setHoverTarget] = useState<DropTarget | null>(null);

  const { nodes, width, height } = useMemo(() => computeLayout(root), [root]);
  const layoutNodeMap = useMemo(() => {
    const map = new Map<string, LayoutNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  const svgWidth = Math.max(width, 300);
  const svgHeight = Math.max(height, 200);

  const getSVGPoint = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return { x: clientX, y: clientY };
      const pt = svgRef.current.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svgRef.current.getScreenCTM();
      if (!ctm) return { x: clientX, y: clientY };
      const svgPt = pt.matrixTransform(ctm.inverse());
      return { x: svgPt.x, y: svgPt.y };
    },
    [],
  );

  const findDropTarget = useCallback(
    (svgPt: { x: number; y: number }, dragNodeId: string | null): DropTarget | null => {
      const threshold = NODE_RADIUS * 4;
      let closestTarget: DropTarget | null = null;
      let closestDist = Infinity;

      for (const ln of nodes) {
        if (dragNodeId && ln.id === dragNodeId) continue;
        const dist = Math.sqrt((svgPt.x - ln.x) ** 2 + (svgPt.y - ln.y) ** 2);
        if (dist < threshold && dist < closestDist) {
          const side: 'left' | 'right' = svgPt.x < ln.x ? 'left' : 'right';
          if ((side === 'left' && !ln.hasLeft) || (side === 'right' && !ln.hasRight)) {
            closestDist = dist;
            closestTarget = { parentId: ln.id, side };
          }
        }
      }
      return closestTarget;
    },
    [nodes],
  );

  const handleNodeDragStart = useCallback(
    (nodeId: string, clientX: number, clientY: number) => {
      if (!root) return;
      const node = findNode(root, nodeId);
      if (!node) return;
      const svgPt = getSVGPoint(clientX, clientY);
      setInternalDrag({
        payload: { nodeId, val: node.val, subtree: cloneTree(node) },
        pointerPos: svgPt,
      });
      setEditingNodeId(null);
      onSelect(null);

      const handleMove = (e: PointerEvent) => {
        const newPt = getSVGPoint(e.clientX, e.clientY);
        setInternalDrag((prev) => (prev ? { ...prev, pointerPos: newPt } : null));
        setHoverTarget(findDropTarget(newPt, nodeId));
      };

      const handleUp = () => {
        setInternalDrag((prev) => {
          if (prev) {
            setHoverTarget((currentTarget) => {
              if (currentTarget && prev.payload.subtree) {
                onMoveNode(nodeId, currentTarget.parentId, currentTarget.side);
              }
              return null;
            });
          }
          return null;
        });
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      };

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    },
    [root, getSVGPoint, findDropTarget, onMoveNode, onSelect],
  );

  // Handle external drag (from NodeSource) pointer move over canvas
  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isExternalDragging || !externalDragPayload) return;
      const svgPt = getSVGPoint(e.clientX, e.clientY);
      const target = findDropTarget(svgPt, null);
      setHoverTarget(target);
    },
    [isExternalDragging, externalDragPayload, getSVGPoint, findDropTarget],
  );

  const handleCanvasPointerUp = useCallback(
    (_e: React.PointerEvent) => {
      if (!isExternalDragging || !externalDragPayload) return;

      if (!root) {
        onSetRoot(externalDragPayload.val);
        return;
      }

      if (hoverTarget) {
        onExternalDrop(hoverTarget);
        setHoverTarget(null);
      }
    },
    [isExternalDragging, externalDragPayload, root, hoverTarget, onSetRoot, onExternalDrop],
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as SVGElement).tagName === 'svg' || (e.target as SVGElement).classList.contains('canvas-bg')) {
        onSelect(null);
        setEditingNodeId(null);
      }
    },
    [onSelect],
  );

  const handleNodeSelect = useCallback(
    (id: string) => {
      onSelect(selectedNodeId === id ? null : id);
      setEditingNodeId(null);
    },
    [onSelect, selectedNodeId],
  );

  const handleNodeDoubleClick = useCallback((id: string) => {
    setEditingNodeId(id);
  }, []);

  const handleEditComplete = useCallback(
    (id: string, newVal: number) => {
      onEditValue(id, newVal);
      setEditingNodeId(null);
    },
    [onEditValue],
  );

  // Ghost positions for the hovered target
  const activeTarget = hoverTarget;
  const ghostPositions = useMemo(() => {
    if (!activeTarget) return null;
    const parentLayout = layoutNodeMap.get(activeTarget.parentId);
    if (!parentLayout) return null;
    const positions = getDropGhostPositions(parentLayout.x, parentLayout.y);
    return positions[activeTarget.side];
  }, [activeTarget, layoutNodeMap]);

  return (
    <div className="tree-canvas-container">
      {selectedNodeId && (
        <div className="node-actions">
          <button className="btn btn-danger" onClick={() => onDelete(selectedNodeId)}>
            Delete Node
          </button>
        </div>
      )}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="tree-canvas-svg"
        onClick={handleCanvasClick}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        style={{ touchAction: 'none' }}
      >
        <rect
          className="canvas-bg"
          width={svgWidth}
          height={svgHeight}
          fill="transparent"
        />

        {!root && (
          <text
            x={svgWidth / 2}
            y={svgHeight / 2}
            textAnchor="middle"
            fontSize={16}
            className="canvas-empty-text"
          >
            Drag a node here or type in the input above
          </text>
        )}

        {/* Edges */}
        {nodes.map(
          (n) =>
            n.parentX !== undefined &&
            n.parentY !== undefined && (
              <TreeEdge key={`edge-${n.id}`} x1={n.parentX} y1={n.parentY} x2={n.x} y2={n.y} />
            ),
        )}

        {/* Ghost drop zone */}
        {ghostPositions && activeTarget && (
          <DropGhost
            x={ghostPositions.x}
            y={ghostPositions.y}
            side={activeTarget.side}
            isValid={true}
          />
        )}

        {/* Nodes */}
        {nodes.map((n) => (
          <TreeNodeSVG
            key={n.id}
            id={n.id}
            val={n.val}
            x={n.x}
            y={n.y}
            isSelected={n.id === selectedNodeId}
            isHighlighted={n.id === highlightedNodeId}
            onSelect={handleNodeSelect}
            onDoubleClick={handleNodeDoubleClick}
            onDragStart={handleNodeDragStart}
            onEditComplete={handleEditComplete}
            isEditing={n.id === editingNodeId}
          />
        ))}

        {/* Drag preview */}
        {internalDrag && (
          <g opacity={0.6} pointerEvents="none" className="canvas-drag-preview">
            <circle
              cx={internalDrag.pointerPos.x}
              cy={internalDrag.pointerPos.y}
              r={NODE_RADIUS}
              strokeWidth={2}
            />
            <text
              x={internalDrag.pointerPos.x}
              y={internalDrag.pointerPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={14}
              fontWeight="bold"
            >
              {internalDrag.payload.val}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default TreeCanvas;
