'use client';

import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
} from '@xyflow/react';
import {
  edgeLabelStyle,
  edgeStrokeStyle,
  type GraphEdgeData,
} from './edge-types';

/** Arco de self-loop encima del nodo (centro aproximado del nodo 56px). */
function buildSelfLoopPath(
  x: number,
  y: number,
  index: number,
  total: number
): string {
  const loopW = 36 + (total > 1 ? index * 8 : 0);
  const loopH = 40 + (total > 1 ? index * 6 : 0);
  const top = y - 28 - (total > 1 ? index * 6 : 0);
  const left = x - loopW / 2;
  const right = x + loopW / 2;
  const bottom = top + loopH;
  return `M ${x} ${y - 8} C ${right} ${top}, ${right} ${bottom}, ${x} ${y + 6} C ${left} ${bottom}, ${left} ${top}, ${x} ${y - 8}`;
}

export function SelfLoopEdge({
  id,
  sourceX,
  sourceY,
  data,
  label,
  markerEnd,
}: EdgeProps) {
  const edgeData = (data ?? {}) as GraphEdgeData;
  const path = buildSelfLoopPath(
    sourceX,
    sourceY,
    edgeData.offsetIndex ?? 0,
    edgeData.totalSiblings ?? 1
  );
  const displayLabel = (label as string) ?? edgeData.label ?? '';
  const labelX = sourceX;
  const labelY = sourceY - 52 - (edgeData.offsetIndex ?? 0) * 8;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
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
