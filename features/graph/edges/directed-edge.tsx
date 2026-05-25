'use client';

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import { parallelPathOffset } from '../utils/parallel-edge-offset';
import {
  edgeLabelStyle,
  edgeStrokeStyle,
  type GraphEdgeData,
} from './edge-types';

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
}: EdgeProps) {
  const edgeData = (data ?? {}) as GraphEdgeData;
  const offset = parallelPathOffset(
    edgeData.offsetIndex ?? 0,
    edgeData.totalSiblings ?? 1
  );

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
    offset,
  });

  const displayLabel = (label as string) ?? edgeData.label ?? '';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={edgeStrokeStyle(edgeData)}
        interactionWidth={20}
      />
      {displayLabel ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan rounded border border-neutral-200 bg-white/95 px-1.5 py-0.5 font-mono text-[10px] shadow-sm dark:border-neutral-600 dark:bg-neutral-900/95"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
              ...edgeLabelStyle(edgeData),
            }}
          >
            {displayLabel}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
