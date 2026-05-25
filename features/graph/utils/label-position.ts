import type { TransitionVisual } from 'types/transition-visual';
import {
  clampLabelAlong,
  type PathProjection,
} from './project-point-on-path';

export type { PathProjection };

export interface ResolveLabelOptions {
  inferAlongFromPoint?: (point: { x: number; y: number }) => number;
}

/**
 * Resuelve la posición de la etiqueta sobre el path de la transición.
 * Prioridad: labelAlong → labelPosition (con inferencia) → defaultAlong + labelOffset.
 */
export function resolveLabelPosition(
  visual: TransitionVisual | undefined,
  defaultAlong: number,
  pointAtAlong: (t: number) => { x: number; y: number },
  options?: ResolveLabelOptions
): { x: number; y: number } {
  if (visual?.labelAlong !== undefined) {
    return pointAtAlong(visual.labelAlong);
  }

  if (visual?.labelPosition && options?.inferAlongFromPoint) {
    const along = clampLabelAlong(
      options.inferAlongFromPoint(visual.labelPosition)
    );
    return pointAtAlong(along);
  }

  if (visual?.labelPosition) {
    return { x: visual.labelPosition.x, y: visual.labelPosition.y };
  }

  const base = pointAtAlong(defaultAlong);
  return {
    x: base.x + (visual?.labelOffset?.x ?? 0),
    y: base.y + (visual?.labelOffset?.y ?? 0),
  };
}

export function labelVisualFromProjection(
  projection: PathProjection
): Pick<TransitionVisual, 'labelAlong' | 'labelPosition' | 'manuallyPositioned'> {
  return {
    labelAlong: projection.along,
    labelPosition: { x: projection.x, y: projection.y },
    manuallyPositioned: true,
  };
}
