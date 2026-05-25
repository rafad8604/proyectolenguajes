'use client';

import { useCallback } from 'react';
import { BaseEdge, getSmoothStepPath, useReactFlow, type EdgeProps } from '@xyflow/react';
import {
  offsetEdgeLabelPosition,
  parallelPathOffset,
  pathSpacingForTotal,
} from '../utils/parallel-edge-offset';
import {
  buildQuadraticEdgePath,
  defaultQuadraticControlPoint,
} from '../utils/quadratic-edge-path';
import {
  pointAtAlongQuadratic,
  pointAtAlongSvgPath,
  projectOntoQuadraticBezier,
  projectOntoSvgPath,
} from '../utils/project-point-on-path';
import { resolveLabelPosition } from '../utils/label-position';
import { useGraphEdit } from '../context/graph-edit-context';
import { useControlPointDrag } from '../hooks/use-control-point-drag';
import { DraggableEdgeLabel } from './draggable-edge-label';
import { EdgeEditHint } from './edge-edit-hint';
import {
  edgeLabelStyle,
  edgeStrokeStyle,
  type GraphEdgeData,
} from './edge-types';

const CONTROL_HANDLE_R = 8;

export function DirectedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  label,
  markerEnd,
  selected,
}: EdgeProps) {
  const edgeData = (data ?? {}) as GraphEdgeData;
  const { edgeLayoutEditable } = useGraphEdit();
  const { screenToFlowPosition } = useReactFlow();
  const visual = edgeData.visual;
  const manual = visual?.manuallyPositioned === true;
  const transitionId = edgeData.transitionId ?? id;

  const totalSiblings = edgeData.totalSiblings ?? 1;
  const offsetIndex = edgeData.offsetIndex ?? 0;
  const curveSign = edgeData.curveSign ?? 1;

  const defaultControl = defaultQuadraticControlPoint(
    sourceX,
    sourceY,
    targetX,
    targetY
  );
  const controlX = visual?.controlPoint?.x ?? defaultControl.x;
  const controlY = visual?.controlPoint?.y ?? defaultControl.y;
  const isQuadratic = !!visual?.controlPoint;

  let edgePath: string;

  if (isQuadratic) {
    edgePath = buildQuadraticEdgePath(
      sourceX,
      sourceY,
      targetX,
      targetY,
      controlX,
      controlY
    );
  } else {
    const pathSpacing = pathSpacingForTotal(totalSiblings);
    const offset = manual
      ? 0
      : parallelPathOffset(offsetIndex, totalSiblings, pathSpacing) * curveSign;

    const [smoothPath] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: totalSiblings > 2 ? 16 : 12,
      offset,
    });
    edgePath = smoothPath;
  }

  const pointAtAlong = useCallback(
    (t: number) => {
      if (isQuadratic) {
        return pointAtAlongQuadratic(
          sourceX,
          sourceY,
          controlX,
          controlY,
          targetX,
          targetY,
          t
        );
      }
      return pointAtAlongSvgPath(edgePath, t);
    },
    [
      isQuadratic,
      sourceX,
      sourceY,
      controlX,
      controlY,
      targetX,
      targetY,
      edgePath,
    ]
  );

  const inferAlongFromPoint = useCallback(
    (point: { x: number; y: number }) => {
      if (isQuadratic) {
        return projectOntoQuadraticBezier(
          point,
          sourceX,
          sourceY,
          controlX,
          controlY,
          targetX,
          targetY
        ).along;
      }
      return projectOntoSvgPath(edgePath, point).along;
    },
    [
      isQuadratic,
      sourceX,
      sourceY,
      controlX,
      controlY,
      targetX,
      targetY,
      edgePath,
    ]
  );

  const projectLabelFromScreen = useCallback(
    (clientX: number, clientY: number) => {
      const flow = screenToFlowPosition({ x: clientX, y: clientY });
      if (isQuadratic) {
        return projectOntoQuadraticBezier(
          flow,
          sourceX,
          sourceY,
          controlX,
          controlY,
          targetX,
          targetY
        );
      }
      return projectOntoSvgPath(edgePath, flow);
    },
    [
      screenToFlowPosition,
      isQuadratic,
      sourceX,
      sourceY,
      controlX,
      controlY,
      targetX,
      targetY,
      edgePath,
    ]
  );

  const { x: finalLabelX, y: finalLabelY } = resolveLabelPosition(
    visual,
    0.5,
    pointAtAlong,
    { inferAlongFromPoint }
  );

  const displayLabel = (label as string) ?? edgeData.label ?? '';
  const showEditUi = !!(edgeLayoutEditable && selected);

  const { onPointerDown: onControlPointerDown, canDrag } = useControlPointDrag({
    transitionId,
    enabled: showEditUi,
    controlPoint: visual?.controlPoint,
    defaultControlPoint: defaultControl,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={edgeStrokeStyle(edgeData)}
        interactionWidth={20}
      />
      {showEditUi && canDrag ? (
        <circle
          cx={controlX}
          cy={controlY}
          r={CONTROL_HANDLE_R}
          fill="#ffffff"
          stroke="#2563eb"
          strokeWidth={2}
          className="cursor-grab"
          style={{ pointerEvents: 'all' }}
          onPointerDown={onControlPointerDown}
          aria-label="Ajustar curvatura de la transición"
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
          style={edgeLabelStyle(edgeData)}
        >
          {displayLabel}
        </DraggableEdgeLabel>
      ) : null}
    </>
  );
}
