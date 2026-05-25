/** Punto en el canvas (coordenadas de flujo React Flow). */
export interface FlowPoint {
  x: number;
  y: number;
}

/** Punto de control por defecto: medio de la arista con ligera curvatura perpendicular. */
export function defaultQuadraticControlPoint(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  bend = 0.15
): FlowPoint {
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.hypot(dx, dy) || 1;
  const perpX = (-dy / len) * len * bend;
  const perpY = (dx / len) * len * bend;
  return { x: midX + perpX, y: midY + perpY };
}

/** Path SVG cuadrático M source Q control target. */
export function buildQuadraticEdgePath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  controlX: number,
  controlY: number
): string {
  return `M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`;
}

/** Posición en t ∈ [0,1] sobre una curva cuadrática Bézier. */
export function quadraticBezierPoint(
  sourceX: number,
  sourceY: number,
  controlX: number,
  controlY: number,
  targetX: number,
  targetY: number,
  t: number
): FlowPoint {
  const u = 1 - t;
  return {
    x: u * u * sourceX + 2 * u * t * controlX + t * t * targetX,
    y: u * u * sourceY + 2 * u * t * controlY + t * t * targetY,
  };
}

/** Etiqueta por defecto en el punto medio de la curva (t = 0.5). */
export function quadraticEdgeLabelPosition(
  sourceX: number,
  sourceY: number,
  controlX: number,
  controlY: number,
  targetX: number,
  targetY: number
): FlowPoint {
  return quadraticBezierPoint(
    sourceX,
    sourceY,
    controlX,
    controlY,
    targetX,
    targetY,
    0.5
  );
}
