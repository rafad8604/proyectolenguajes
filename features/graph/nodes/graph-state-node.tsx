'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from 'lib/utils/cn';

export interface GraphStateNodeData extends Record<string, unknown> {
  label: string;
  stateId: string;
  isInitial: boolean;
  isAccepting: boolean;
  isRejecting?: boolean;
  /** Estado(s) activos en el paso actual. */
  isActive?: boolean;
  /** Estados ya visitados en pasos anteriores del recorrido. */
  isVisited?: boolean;
  /** Estado final activo y de aceptación simultáneamente. */
  isActiveAccepting?: boolean;
}

export function GraphStateNode({ data, selected }: NodeProps) {
  const nodeData = data as GraphStateNodeData;

  return (
    <div className="relative">
      {nodeData.isInitial && (
        <span
          className="absolute -left-7 top-1/2 -translate-y-1/2 text-lg font-bold text-blue-600 dark:text-blue-400"
          aria-hidden
        >
          →
        </span>
      )}
      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full border-2 bg-white text-sm font-semibold shadow-sm dark:bg-neutral-900',
          nodeData.isRejecting &&
            'border-red-600 ring-2 ring-red-400/40 dark:border-red-500',
          nodeData.isAccepting &&
            !nodeData.isRejecting &&
            'border-neutral-900 dark:border-neutral-100 ring-2 ring-neutral-900 ring-offset-2 dark:ring-neutral-100 dark:ring-offset-neutral-950',
          !nodeData.isAccepting &&
            !nodeData.isRejecting &&
            'border-neutral-400 dark:border-neutral-500',
          nodeData.isActiveAccepting &&
            'border-green-600 bg-green-50 ring-4 ring-green-400/60 dark:border-green-500 dark:bg-green-950',
          nodeData.isActive &&
            !nodeData.isActiveAccepting &&
            'border-blue-600 bg-blue-50 ring-4 ring-blue-400/50 dark:border-blue-400 dark:bg-blue-950',
          nodeData.isVisited &&
            !nodeData.isActive &&
            'border-amber-500 bg-amber-50/80 ring-2 ring-amber-300/70 dark:border-amber-600 dark:bg-amber-950/50',
          selected &&
            !nodeData.isActive &&
            'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-neutral-950'
        )}
      >
        {nodeData.label}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!bg-blue-500 !w-2 !h-2"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!bg-blue-500 !w-2 !h-2"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!bg-blue-500 !w-2 !h-2"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!bg-blue-500 !w-2 !h-2"
      />
    </div>
  );
}
