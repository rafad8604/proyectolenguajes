import { MarkerType } from '@xyflow/react';
import type { CSSProperties } from 'react';

export interface GraphEdgeData extends Record<string, unknown> {
  label?: string;
  isActive?: boolean;
  isEpsilon?: boolean;
  offsetIndex?: number;
  totalSiblings?: number;
}

export const defaultDirectedMarker = {
  type: MarkerType.ArrowClosed,
  width: 18,
  height: 18,
  color: '#525252',
};

export const activeEdgeColor = '#2563eb';

export function edgeStrokeStyle(data: GraphEdgeData | undefined): CSSProperties {
  const isActive = data?.isActive;
  const isEpsilon = data?.isEpsilon;
  return {
    stroke: isActive ? activeEdgeColor : '#525252',
    strokeWidth: isActive ? 3 : 1.5,
    ...(isEpsilon ? { strokeDasharray: '6 4' } : {}),
  };
}

export function edgeLabelStyle(data: GraphEdgeData | undefined): CSSProperties {
  return {
    fontSize: 11,
    fontWeight: data?.isActive ? 700 : 500,
    fill: data?.isActive ? activeEdgeColor : '#404040',
  };
}

export const graphEdgeTypes = {
  directed: 'directed',
  selfLoop: 'selfLoop',
} as const;

export type GraphEdgeType = keyof typeof graphEdgeTypes;
