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

  // Mantener referencias frescas a callbacks y datos sin re-suscribir los
  // listeners en cada render del padre. Antes el useEffect se desmontaba y
  // remontaba en cada pointermove (porque persistLabel cambiaba), lo que hacía
  // que el arrastre con ratón se sintiera entrecortado.
  const projectRef = useRef(projectLabelFromScreen);
  const onChangeRef = useRef(onTransitionVisualChange);
  const transitionIdRef = useRef(transitionId);

  useEffect(() => {
    projectRef.current = projectLabelFromScreen;
  }, [projectLabelFromScreen]);

  useEffect(() => {
    onChangeRef.current = onTransitionVisualChange;
  }, [onTransitionVisualChange]);

  useEffect(() => {
    transitionIdRef.current = transitionId;
  }, [transitionId]);

  const persistLabel = useCallback((clientX: number, clientY: number) => {
    const onChange = onChangeRef.current;
    if (!onChange) return;
    const projection = projectRef.current(clientX, clientY);
    onChange(transitionIdRef.current, labelVisualFromProjection(projection));
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!edgeLayoutEditable || !onChangeRef.current) return;
      e.stopPropagation();
      e.preventDefault();
      draggingRef.current = true;
      // Captura el puntero al elemento para que todos los pointermove/pointerup
      // lleguen aquí aunque el cursor salga del div (incluso si pasa por
      // encima de un nodo o de otra arista).
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // setPointerCapture puede fallar si el navegador descarta el evento;
        // los listeners de window cubren ese caso.
      }
      persistLabel(e.clientX, e.clientY);
    },
    [edgeLayoutEditable, persistLabel]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      e.stopPropagation();
      persistLabel(e.clientX, e.clientY);
    },
    [persistLabel]
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignorable: el navegador puede haber liberado la captura solo.
      }
      persistLabel(e.clientX, e.clientY);
    },
    [persistLabel]
  );

  // Listeners de respaldo a nivel ventana por si el navegador pierde la
  // captura del puntero (algunos casos con iframes/portales).
  useEffect(() => {
    const onWindowMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      persistLabel(e.clientX, e.clientY);
    };

    const onWindowUp = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      persistLabel(e.clientX, e.clientY);
    };

    window.addEventListener('pointermove', onWindowMove);
    window.addEventListener('pointerup', onWindowUp);
    window.addEventListener('pointercancel', onWindowUp);
    return () => {
      window.removeEventListener('pointermove', onWindowMove);
      window.removeEventListener('pointerup', onWindowUp);
      window.removeEventListener('pointercancel', onWindowUp);
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
          touchAction: 'none',
          zIndex: 6,
          userSelect: 'none',
          ...style,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        aria-label="Mover etiqueta a lo largo de la transición"
      >
        {children}
      </div>
    </EdgeLabelRenderer>
  );
}
