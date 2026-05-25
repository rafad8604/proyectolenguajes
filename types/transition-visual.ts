/** Geometría visual opcional de una transición (solo presentación, no semántica). */
export interface TransitionVisual {
  /** Coordenadas absolutas del canvas (React Flow) del punto de control de la curva. */
  controlPoint?: { x: number; y: number };
  /** Fracción 0–1 a lo largo del path de la arista donde va la etiqueta. */
  labelAlong?: number;
  /** Posición absoluta de la etiqueta (derivada o legacy JFLAP). */
  labelPosition?: { x: number; y: number };
  /** Desplazamiento legacy respecto a la posición por defecto. */
  labelOffset?: { x: number; y: number };
  /** Self-loop: elevación del arco sobre el nodo. */
  loopLift?: number;
  /** Self-loop: separación horizontal de los puntos de control del arco. */
  loopSpread?: number;
  /** Si true, no recalcular offset automático de curva al re-renderizar. */
  manuallyPositioned?: boolean;
}

/** Fusiona parciales de geometría visual en un objeto existente. */
export function mergeTransitionVisual(
  existing: TransitionVisual | undefined,
  partial: Partial<TransitionVisual>
): TransitionVisual {
  const base = existing ?? {};
  const next: TransitionVisual = { ...base, ...partial };
  if (partial.controlPoint !== undefined) {
    next.controlPoint = { ...partial.controlPoint };
  }
  if (partial.labelPosition !== undefined) {
    next.labelPosition = { ...partial.labelPosition };
  }
  if (partial.labelOffset !== undefined) {
    next.labelOffset = { ...partial.labelOffset };
  }
  if (partial.labelAlong !== undefined) {
    next.labelAlong = partial.labelAlong;
  }
  return next;
}
