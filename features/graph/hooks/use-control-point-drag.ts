'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useGraphEdit } from '../context/graph-edit-context';

interface UseControlPointDragOptions {
  transitionId: string;
  enabled: boolean;
  controlPoint: { x: number; y: number } | undefined;
  defaultControlPoint: { x: number; y: number };
}

export function useControlPointDrag({
  transitionId,
  enabled,
  controlPoint,
  defaultControlPoint,
}: UseControlPointDragOptions) {
  const { edgeLayoutEditable, onTransitionVisualChange } = useGraphEdit();
  const { screenToFlowPosition } = useReactFlow();
  const draggingRef = useRef(false);

  const persistControl = useCallback(
    (clientX: number, clientY: number) => {
      if (!onTransitionVisualChange) return;
      const pos = screenToFlowPosition({ x: clientX, y: clientY });
      onTransitionVisualChange(transitionId, {
        controlPoint: pos,
        manuallyPositioned: true,
      });
    },
    [transitionId, onTransitionVisualChange, screenToFlowPosition]
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      persistControl(e.clientX, e.clientY);
    };

    const onUp = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      persistControl(e.clientX, e.clientY);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [persistControl]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled || !edgeLayoutEditable || !onTransitionVisualChange) return;
      e.stopPropagation();
      e.preventDefault();
      draggingRef.current = true;
      if (!controlPoint) {
        onTransitionVisualChange(transitionId, {
          controlPoint: defaultControlPoint,
          manuallyPositioned: true,
        });
      }
      persistControl(e.clientX, e.clientY);
    },
    [
      enabled,
      edgeLayoutEditable,
      onTransitionVisualChange,
      controlPoint,
      defaultControlPoint,
      transitionId,
      persistControl,
    ]
  );

  return {
    onPointerDown,
    canDrag: enabled && edgeLayoutEditable,
  };
}
