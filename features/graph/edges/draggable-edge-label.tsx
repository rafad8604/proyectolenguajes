'use client';

import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { EdgeLabelRenderer } from '@xyflow/react';
import { useGraphEdit } from '../context/graph-edit-context';
import { labelVisualFromProjection, type PathProjection } from '../utils/label-position';

export type ProjectLabelFromScreen = (
  clientX: number,
  clientY: number
) => PathProjection;

interface DraggableEdgeLabelProps {
  transitionId: string;
  x: number;
  y: number;
  edgeLayoutEditable: boolean;
  projectLabelFromScreen: ProjectLabelFromScreen;
  style?: CSSProperties;
  children: ReactNode;
}

export function DraggableEdgeLabel({
  transitionId,
  x,
  y,
  edgeLayoutEditable,
  projectLabelFromScreen,
  style,
  children,
}: DraggableEdgeLabelProps) {
  const { onTransitionVisualChange } = useGraphEdit();
  const draggingRef = useRef(false);

  const persistLabel = useCallback(
    (clientX: number, clientY: number) => {
      if (!onTransitionVisualChange) return;
      const projection = projectLabelFromScreen(clientX, clientY);
      onTransitionVisualChange(transitionId, labelVisualFromProjection(projection));
    },
    [transitionId, onTransitionVisualChange, projectLabelFromScreen]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!edgeLayoutEditable || !onTransitionVisualChange) return;
      e.stopPropagation();
      e.preventDefault();
      draggingRef.current = true;
      persistLabel(e.clientX, e.clientY);
    },
    [edgeLayoutEditable, onTransitionVisualChange, persistLabel]
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      persistLabel(e.clientX, e.clientY);
    };

    const onUp = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      persistLabel(e.clientX, e.clientY);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [persistLabel]);

  return (
    <EdgeLabelRenderer>
      <div
        className={`nodrag nopan rounded border border-neutral-200 bg-white/95 px-1.5 py-0.5 font-mono text-[10px] shadow-sm dark:border-neutral-600 dark:bg-neutral-900/95 ${
          edgeLayoutEditable ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        style={{
          position: 'absolute',
          transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
          pointerEvents: 'all',
          zIndex: 6,
          ...style,
        }}
        onPointerDown={onPointerDown}
        aria-label="Mover etiqueta a lo largo de la transición"
      >
        {children}
      </div>
    </EdgeLabelRenderer>
  );
}
