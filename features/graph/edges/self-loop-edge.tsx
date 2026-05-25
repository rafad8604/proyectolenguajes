'use client';

import { useCallback, useEffect, useRef } from 'react';
import { BaseEdge, useReactFlow, type EdgeProps } from '@xyflow/react';
import { GRAPH_NODE_RADIUS } from '../constants';
import type { TransitionVisual } from 'types/transition-visual';
import {
  pointAtAlongSvgPath,
  projectOntoSvgPath,
} from '../utils/project-point-on-path';
import { resolveLabelPosition } from '../utils/label-position';
import { useGraphEdit } from '../context/graph-edit-context';
import { DraggableEdgeLabel } from './draggable-edge-label';
import { EdgeEditHint } from './edge-edit-hint';
import {
  edgeLabelStyle,
  edgeStrokeStyle,
  type GraphEdgeData,
} from './edge-types';

export interface SelfLoopGeometry {
  path: string;
  labelX: number;
  labelY: number;
  handleX: number;
  handleY: number;
  lift: number;
  spread: number;
}

/**
 * Arco abierto encima del nodo (no cerrado) para que markerEnd sea visible.
 */
export function buildSelfLoopGeometry(
  x: number,
  y: number,
  index: number,
  total: number,
  nodeRadius = GRAPH_NODE_RADIUS,
  visual?: TransitionVisual
): SelfLoopGeometry {
  const r = nodeRadius;
  const stack = index;
  const defaultLift = 14 + stack * 10;
  const defaultSpread = 20 + stack * 8;
  const lift =
    visual?.manuallyPositioned && visual.loopLift != null
      ? visual.loopLift
      : defaultLift;
  const spread =
    visual?.manuallyPositioned && visual.loopSpread != null
      ? visual.loopSpread
      : defaultSpread;

  const startX = x + r * 0.55;
  const startY = y - r * 0.75;
  const endX = x - r * 0.55;
  const endY = y - r * 0.75;

  const apexY = y - r - lift;
  const ctrl1X = x + spread;
  const ctrl1Y = apexY;
  const ctrl2X = x - spread;
  const ctrl2Y = apexY;

  const path = `M ${startX} ${startY} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${endX} ${endY}`;

  const labelX = x;
  const labelY = apexY - 14 - (total > 1 ? stack * 4 : 0);

  return {
    path,
    labelX,
    labelY,
    handleX: x,
    handleY: apexY - 8,
    lift,
    spread,
  };
}

const LOOP_HANDLE_R = 8;

export function SelfLoopEdge({
  id,
  sourceX,
  sourceY,
  data,
  label,
  markerEnd,
  selected,
}: EdgeProps) {
  const edgeData = (data ?? {}) as GraphEdgeData;
  const { edgeLayoutEditable, onTransitionVisualChange } = useGraphEdit();
  const { screenToFlowPosition } = useReactFlow();
  const visual = edgeData.visual;
  const transitionId = edgeData.transitionId ?? id;

  const { path, handleX, handleY, lift, spread } = buildSelfLoopGeometry(
    sourceX,
    sourceY,
    edgeData.offsetIndex ?? 0,
    edgeData.totalSiblings ?? 1,
    GRAPH_NODE_RADIUS,
    visual
  );

  const pointAtAlong = useCallback(
    (t: number) => pointAtAlongSvgPath(path, t),
    [path]
  );

  const inferAlongFromPoint = useCallback(
    (point: { x: number; y: number }) =>
      projectOntoSvgPath(path, point).along,
    [path]
  );

  const projectLabelFromScreen = useCallback(
    (clientX: number, clientY: number) => {
      const flow = screenToFlowPosition({ x: clientX, y: clientY });
      return projectOntoSvgPath(path, flow);
    },
    [screenToFlowPosition, path]
  );

  const { x: finalLabelX, y: finalLabelY } = resolveLabelPosition(
    visual,
    0.5,
    pointAtAlong,
    { inferAlongFromPoint }
  );

  const displayLabel = (label as string) ?? edgeData.label ?? '';
  const showEditUi = !!(edgeLayoutEditable && selected);

  const draggingRef = useRef(false);
  const startRef = useRef<{ clientY: number; lift: number; spread: number } | null>(
    null
  );

  const onLoopPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!showEditUi || !onTransitionVisualChange) return;
      e.stopPropagation();
      e.preventDefault();
      draggingRef.current = true;
      startRef.current = {
        clientY: e.clientY,
        lift,
        spread,
      };
    },
    [showEditUi, onTransitionVisualChange, lift, spread]
  );

  useEffect(() => {
    if (!onTransitionVisualChange) return;

    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current || !startRef.current) return;
      const dy = startRef.current.clientY - e.clientY;
      const dx = e.clientX - handleX;
      onTransitionVisualChange(transitionId, {
        loopLift: Math.max(8, startRef.current.lift + dy * 0.5),
        loopSpread: Math.max(12, startRef.current.spread + dx * 0.3),
        manuallyPositioned: true,
      });
    };

    const onUp = () => {
      draggingRef.current = false;
      startRef.current = null;
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [transitionId, onTransitionVisualChange, handleX]);

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          ...edgeStrokeStyle(edgeData),
          zIndex: 1,
        }}
        interactionWidth={20}
      />
      {showEditUi ? (
        <circle
          cx={handleX}
          cy={handleY}
          r={LOOP_HANDLE_R}
          fill="#ffffff"
          stroke="#2563eb"
          strokeWidth={2}
          className="cursor-grab"
          style={{ pointerEvents: 'all' }}
          onPointerDown={onLoopPointerDown}
          aria-label="Ajustar arco del self-loop"
        />
      ) : null}
      {showEditUi ? (
        <EdgeEditHint x={finalLabelX} y={finalLabelY} />
      ) : null}
      {displayLabel ? (
        <DraggableEdgeLabel
          transitionId={transitionId}
          x={finalLabelX}
          y={finalLabelY}
          edgeLayoutEditable={edgeLayoutEditable}
          projectLabelFromScreen={projectLabelFromScreen}
          style={{ ...edgeLabelStyle(edgeData), zIndex: 2 }}
        >
          {displayLabel}
        </DraggableEdgeLabel>
      ) : null}
    </>
  );
}
