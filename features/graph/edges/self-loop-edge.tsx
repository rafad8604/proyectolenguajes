'use client';

import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
} from '@xyflow/react';
import { GRAPH_NODE_RADIUS } from '../constants';
import {
  edgeLabelStyle,
  edgeStrokeStyle,
  type GraphEdgeData,
} from './edge-types';

export interface SelfLoopGeometry {
  path: string;
  labelX: number;
  labelY: number;
}

/**
 * Arco abierto encima del nodo (no cerrado) para que markerEnd sea visible.
 */
export function buildSelfLoopGeometry(
  x: number,
  y: number,
  index: number,
  total: number,
  nodeRadius = GRAPH_NODE_RADIUS
): SelfLoopGeometry {
  const r = nodeRadius;
  const stack = index;
  const lift = 14 + stack * 10;
  const spread = 20 + stack * 8;

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

  return {
    path,
    labelX: x,
    labelY: apexY - 14 - (total > 1 ? stack * 4 : 0),
  };
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
  const { path, labelX, labelY } = buildSelfLoopGeometry(
    sourceX,
    sourceY,
    edgeData.offsetIndex ?? 0,
    edgeData.totalSiblings ?? 1
  );
  const displayLabel = (label as string) ?? edgeData.label ?? '';

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
      {displayLabel ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan rounded border border-neutral-200 bg-white/95 px-1.5 py-0.5 font-mono text-[10px] shadow-sm dark:border-neutral-600 dark:bg-neutral-900/95"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
              zIndex: 2,
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
