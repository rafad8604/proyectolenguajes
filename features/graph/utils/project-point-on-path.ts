import {
  quadraticBezierPoint,
  type FlowPoint,
} from './quadratic-edge-path';

export const LABEL_ALONG_MIN = 0.08;
export const LABEL_ALONG_MAX = 0.92;

export interface PathProjection extends FlowPoint {
  along: number;
}

export function clampLabelAlong(t: number): number {
  return Math.max(LABEL_ALONG_MIN, Math.min(LABEL_ALONG_MAX, t));
}

const QUADRATIC_SAMPLES = 48;

/** Punto en t sobre Bézier cuadrática source → control → target. */
export function pointAtAlongQuadratic(
  sourceX: number,
  sourceY: number,
  controlX: number,
  controlY: number,
  targetX: number,
  targetY: number,
  along: number
): FlowPoint {
  return quadraticBezierPoint(
    sourceX,
    sourceY,
    controlX,
    controlY,
    targetX,
    targetY,
    clampLabelAlong(along)
  );
}

/** Proyecta un punto al lugar más cercano sobre una Bézier cuadrática. */
export function projectOntoQuadraticBezier(
  point: FlowPoint,
  sourceX: number,
  sourceY: number,
  controlX: number,
  controlY: number,
  targetX: number,
  targetY: number
): PathProjection {
  let bestDist = Infinity;
  let bestT = 0.5;
  let best = point;

  for (let i = 0; i <= QUADRATIC_SAMPLES; i++) {
    const t = i / QUADRATIC_SAMPLES;
    const p = quadraticBezierPoint(
      sourceX,
      sourceY,
      controlX,
      controlY,
      targetX,
      targetY,
      t
    );
    const d = Math.hypot(point.x - p.x, point.y - p.y);
    if (d < bestDist) {
      bestDist = d;
      bestT = t;
      best = p;
    }
  }

  const along = clampLabelAlong(bestT);
  const snapped = pointAtAlongQuadratic(
    sourceX,
    sourceY,
    controlX,
    controlY,
    targetX,
    targetY,
    along
  );

  return { x: snapped.x, y: snapped.y, along };
}

const svgPathCache = new Map<string, SVGPathElement>();

function getSvgPathElement(pathD: string): SVGPathElement | null {
  if (typeof document === 'undefined') return null;
  let el = svgPathCache.get(pathD);
  if (!el) {
    el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', pathD);
    svgPathCache.set(pathD, el);
  }
  return el;
}

const SVG_PATH_SAMPLES = 56;

/** Punto a lo largo de un path SVG (0–1 = fracción de longitud de arco). */
export function pointAtAlongSvgPath(pathD: string, along: number): FlowPoint {
  const path = getSvgPathElement(pathD);
  if (!path) return { x: 0, y: 0 };
  const total = path.getTotalLength();
  if (total <= 0) return { x: 0, y: 0 };
  const p = path.getPointAtLength(clampLabelAlong(along) * total);
  return { x: p.x, y: p.y };
}

/** Proyecta un punto al lugar más cercano sobre un path SVG (smooth-step, self-loop, etc.). */
export function projectOntoSvgPath(
  pathD: string,
  point: FlowPoint
): PathProjection {
  const path = getSvgPathElement(pathD);
  if (!path) {
    return { x: point.x, y: point.y, along: 0.5 };
  }

  const total = path.getTotalLength();
  if (total <= 0) {
    return { x: point.x, y: point.y, along: 0.5 };
  }

  let bestDist = Infinity;
  let bestAlong = 0.5;

  for (let i = 0; i <= SVG_PATH_SAMPLES; i++) {
    const len = (i / SVG_PATH_SAMPLES) * total;
    const p = path.getPointAtLength(len);
    const d = Math.hypot(point.x - p.x, point.y - p.y);
    if (d < bestDist) {
      bestDist = d;
      bestAlong = len / total;
    }
  }

  const along = clampLabelAlong(bestAlong);
  const snapped = pointAtAlongSvgPath(pathD, along);
  return { x: snapped.x, y: snapped.y, along };
}
