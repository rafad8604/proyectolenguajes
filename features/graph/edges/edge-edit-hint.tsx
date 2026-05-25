'use client';

import { EdgeLabelRenderer } from '@xyflow/react';

interface EdgeEditHintProps {
  x: number;
  y: number;
}

export function EdgeEditHint({ x, y }: EdgeEditHintProps) {
  return (
    <EdgeLabelRenderer>
      <div
        className="nodrag nopan pointer-events-none max-w-[220px] rounded border border-blue-200 bg-blue-50/95 px-2 py-1 text-[10px] leading-snug text-blue-900 shadow-sm dark:border-blue-800 dark:bg-blue-950/95 dark:text-blue-100"
        style={{
          position: 'absolute',
          transform: `translate(-50%, -100%) translate(${x}px, ${y - 28}px)`,
          zIndex: 10,
        }}
        role="tooltip"
      >
        Arrastra el punto de control para ajustar la curva. Arrastra la etiqueta
        para mover el texto.
      </div>
    </EdgeLabelRenderer>
  );
}
