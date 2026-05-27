import { MarkerType, type EdgeMarker } from '@xyflow/react';
import type { CSSProperties } from 'react';
import type { TransitionVisual } from 'types/transition-visual';

export interface GraphEdgeData extends Record<string, unknown> {
  label?: string;
  transitionId?: string;
  visual?: TransitionVisual;
  isActive?: boolean;
  isVisited?: boolean;
  isRevisited?: boolean;
  isEpsilon?: boolean;
  highlightStepIndex?: number;
  offsetIndex?: number;
  totalSiblings?: number;
  /** Lado de curvatura para separar aristas bidireccionales. */
  curveSign?: 1 | -1;
}

export const defaultDirectedMarker = {
  type: MarkerType.ArrowClosed,
  width: 18,
  height: 18,
  color: '#525252',
};

export const activeEdgeColor = '#2563eb';
export const visitedEdgeColor = '#d97706';
export const defaultEdgeColor = '#525252';

export function edgeStrokeStyle(data: GraphEdgeData | undefined): CSSProperties {
  const isActive = data?.isActive;
  const isVisited = data?.isVisited;
  const isRevisited = data?.isRevisited;
  const isEpsilon = data?.isEpsilon;
  const pulseKey = data?.highlightStepIndex;

  return {
    stroke: isActive
      ? activeEdgeColor
      : isVisited
        ? visitedEdgeColor
        : defaultEdgeColor,
    strokeWidth: isActive ? 3.5 : isVisited ? 2 : 1.5,
    opacity: isVisited && !isActive ? 0.88 : 1,
    ...(isEpsilon ? { strokeDasharray: '6 4' } : {}),
    ...(isActive
      ? {
          animation: `sim-edge-pulse 0.55s ease-out`,
          animationIterationCount: 1,
          ['--sim-pulse-key' as string]: pulseKey ?? 0,
        }
      : {}),
    ...(isRevisited
      ? {
          filter: 'drop-shadow(0 0 4px rgba(217, 119, 6, 0.55))',
        }
      : {}),
  };
}

export function edgeLabelStyle(data: GraphEdgeData | undefined): CSSProperties {
  const isActive = data?.isActive;
  const isVisited = data?.isVisited && !isActive;
  return {
    fontSize: 11,
    fontWeight: isActive ? 700 : 500,
    fill: isActive
      ? activeEdgeColor
      : isVisited
        ? visitedEdgeColor
        : '#404040',
  };
}

export function edgeMarkerColor(data: GraphEdgeData | undefined): string {
  if (data?.isActive) return activeEdgeColor;
  if (data?.isVisited) return visitedEdgeColor;
  return defaultEdgeColor;
}

/** Marcador de flecha con color acorde al estado de la arista. */
export function markerEndForEdge(data: GraphEdgeData | undefined): EdgeMarker {
  return {
    type: MarkerType.ArrowClosed,
    width: 18,
    height: 18,
    color: edgeMarkerColor(data),
  };
}

export const graphEdgeTypes = {
  directed: 'directed',
  selfLoop: 'selfLoop',
} as const;

export type GraphEdgeType = keyof typeof graphEdgeTypes;
