/** Metadatos de offset para aristas paralelas entre el mismo par de nodos. */
export interface ParallelEdgeMeta {
  offsetIndex: number;
  totalSiblings: number;
  curveSign: 1 | -1;
}

export interface ParallelTransitionRef {
  id: string;
  from: string;
  to: string;
  /** Clave estable para ordenar hermanos (p. ej. símbolo o etiqueta TM). */
  sortKey?: string;
}

const DEFAULT_PATH_SPACING = 24;
const DEFAULT_LABEL_SPACING = 30;
const ALONG_EDGE_LABEL_SPACING = 6;

function directedKey(from: string, to: string): string {
  return `${from}::${to}`;
}

function compareSortKey(a: ParallelTransitionRef, b: ParallelTransitionRef): number {
  const ka = a.sortKey ?? a.id;
  const kb = b.sortKey ?? b.id;
  return ka.localeCompare(kb, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Asigna índice y total de hermanos a cada arista agrupada por (source, target).
 * Self-loops se agrupan por source solamente.
 * Aristas bidireccionales usan curveSign opuesto para separar curvas.
 * Hermanos ordenados por sortKey para índices estables.
 */
export function assignParallelEdgeOffsets<
  T extends ParallelTransitionRef
>(transitions: T[]): Map<string, ParallelEdgeMeta> {
  const groups = new Map<string, T[]>();
  const transitionById = new Map<string, T>();

  for (const t of transitions) {
    transitionById.set(t.id, t);
    const key =
      t.from === t.to ? `loop:${t.from}` : directedKey(t.from, t.to);
    const list = groups.get(key) ?? [];
    list.push(t);
    groups.set(key, list);
  }

  const bidirectionalPairs = new Set<string>();
  for (const t of transitions) {
    if (t.from === t.to) continue;
    const reverseKey = directedKey(t.to, t.from);
    const forwardKey = directedKey(t.from, t.to);
    if (groups.has(reverseKey) && groups.has(forwardKey)) {
      const pairKey = [t.from, t.to].sort().join('::');
      bidirectionalPairs.add(pairKey);
    }
  }

  const result = new Map<string, ParallelEdgeMeta>();

  for (const ids of groups.values()) {
    const sorted = [...ids].sort(compareSortKey);
    const total = sorted.length;

    sorted.forEach((t, index) => {
      let curveSign: 1 | -1 = 1;

      if (t.from !== t.to) {
        const pairKey = [t.from, t.to].sort().join('::');
        if (bidirectionalPairs.has(pairKey)) {
          curveSign = t.from < t.to ? 1 : -1;
        }
      }

      result.set(t.id, {
        offsetIndex: index,
        totalSiblings: total,
        curveSign,
      });
    });
  }

  return result;
}

/** Desplazamiento en píxeles para separar curvas paralelas. */
export function parallelPathOffset(
  index: number,
  total: number,
  spacing = DEFAULT_PATH_SPACING
): number {
  if (total <= 1) return 0;
  const center = (total - 1) / 2;
  return (index - center) * spacing;
}

/** Spacing de path según cantidad de aristas paralelas. */
export function pathSpacingForTotal(total: number): number {
  if (total >= 3) return 28;
  if (total === 2) return DEFAULT_PATH_SPACING;
  return 0;
}

/**
 * Desplaza la posición de la etiqueta perpendicular (y ligeramente a lo largo) de la arista.
 */
export function offsetEdgeLabelPosition(
  labelX: number,
  labelY: number,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  offsetIndex: number,
  totalSiblings: number,
  curveSign: 1 | -1,
  labelSpacing = DEFAULT_LABEL_SPACING
): { x: number; y: number } {
  if (totalSiblings <= 1) {
    return { x: labelX, y: labelY };
  }

  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.hypot(dx, dy) || 1;
  const perpX = (-dy / len) * curveSign;
  const perpY = (dx / len) * curveSign;

  const shift = parallelPathOffset(offsetIndex, totalSiblings, labelSpacing);

  const center = (totalSiblings - 1) / 2;
  const along = (offsetIndex - center) * ALONG_EDGE_LABEL_SPACING;
  const alongX = (dx / len) * along;
  const alongY = (dy / len) * along;

  return {
    x: labelX + perpX * shift + alongX,
    y: labelY + perpY * shift + alongY,
  };
}
