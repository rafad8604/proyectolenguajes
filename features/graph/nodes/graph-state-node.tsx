'use client';

import type { CSSProperties } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from 'lib/utils/cn';

export interface GraphStateNodeData extends Record<string, unknown> {
  label: string;
  fullLabel?: string;
  labelLines?: string[];
  labelFontSizeClass?: string;
  stateId: string;
  isInitial: boolean;
  isAccepting: boolean;
  isRejecting?: boolean;
  /** Estado(s) activos en el paso actual. */
  isActive?: boolean;
  /** Estados ya visitados en pasos anteriores del recorrido. */
  isVisited?: boolean;
  /** Activo otra vez tras haber sido visitado antes. */
  isRevisited?: boolean;
  /** Estado final activo y de aceptación simultáneamente. */
  isActiveAccepting?: boolean;
  /** Paso de simulación actual (fuerza pulso visual al cambiar). */
  highlightStepIndex?: number;
}

export function GraphStateNode({ data, selected }: NodeProps) {
  const nodeData = data as GraphStateNodeData;
  const lines = nodeData.labelLines ?? [nodeData.label];
  const fullLabel = nodeData.fullLabel ?? nodeData.label;
  const isComposite = lines.length > 1 || fullLabel.startsWith('{');

  return (
    <div className="relative" title={fullLabel}>
      {nodeData.isInitial && (
        <span
          className="absolute -left-7 top-1/2 -translate-y-1/2 text-lg font-bold text-blue-600 dark:text-blue-400"
          aria-hidden
        >
          →
        </span>
      )}
      <div
        key={
          nodeData.isActive
            ? `active-${nodeData.highlightStepIndex ?? 0}-${nodeData.stateId}`
            : nodeData.stateId
        }
        className={cn(
          'flex items-center justify-center rounded-full border-2 bg-white font-semibold shadow-sm dark:bg-neutral-900',
          isComposite
            ? 'min-h-14 min-w-14 max-w-[92px] px-1.5 py-1 text-center'
            : 'h-14 w-14',
          nodeData.labelFontSizeClass ?? 'text-sm',
          nodeData.isRejecting &&
            'border-red-600 ring-2 ring-red-400/40 dark:border-red-500',
          nodeData.isAccepting &&
            !nodeData.isRejecting &&
            'border-neutral-900 dark:border-neutral-100 ring-2 ring-neutral-900 ring-offset-2 dark:ring-neutral-100 dark:ring-offset-neutral-950',
          !nodeData.isAccepting &&
            !nodeData.isRejecting &&
            'border-neutral-400 dark:border-neutral-500',
          nodeData.isActiveAccepting &&
            'sim-node-active-accepting border-green-600 bg-green-50 ring-4 ring-green-400/60 dark:border-green-500 dark:bg-green-950',
          nodeData.isActive &&
            !nodeData.isActiveAccepting &&
            'sim-node-active border-blue-600 bg-blue-50 ring-4 ring-blue-400/50 dark:border-blue-400 dark:bg-blue-950',
          nodeData.isRevisited &&
            nodeData.isActive &&
            'ring-amber-300/80 dark:ring-amber-500/70',
          nodeData.isVisited &&
            !nodeData.isActive &&
            'border-amber-500 bg-amber-50/80 ring-2 ring-amber-300/70 dark:border-amber-600 dark:bg-amber-950/50',
          selected &&
            !nodeData.isActive &&
            'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-neutral-950'
        )}
        style={
          nodeData.isActive
            ? ({
                animation: 'sim-node-pulse 0.55s ease-out',
                ['--sim-pulse-key' as string]:
                  nodeData.highlightStepIndex ?? 0,
              } as CSSProperties)
            : undefined
        }
      >
        <span className="block max-w-full whitespace-pre-line break-all leading-tight">
          {lines.map((line, index) => (
            <span key={`${line}-${index}`} className="block">
              {line}
            </span>
          ))}
        </span>
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
