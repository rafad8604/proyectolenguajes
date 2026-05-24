'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { cn } from 'lib/utils/cn';
import type { StateNodeData } from '../adapters/react-flow';

export function StateNode({ data, selected }: NodeProps) {
  const nodeData = data as StateNodeData;

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
          nodeData.isAccepting
            ? 'border-neutral-900 dark:border-neutral-100 ring-2 ring-neutral-900 ring-offset-2 dark:ring-neutral-100 dark:ring-offset-neutral-950'
            : 'border-neutral-400 dark:border-neutral-500',
          nodeData.isActive &&
            'border-blue-600 bg-blue-50 ring-4 ring-blue-400/50 dark:border-blue-400 dark:bg-blue-950',
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
        className="!bg-blue-500 !w-2 !h-2"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !w-2 !h-2"
      />
    </div>
  );
}
