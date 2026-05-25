/** Metadatos de offset para aristas paralelas entre el mismo par de nodos. */
export interface ParallelEdgeMeta {
  offsetIndex: number;
  totalSiblings: number;
  curveSign: 1 | -1;
}

const DEFAULT_PARALLEL_SPACING = 24;

function directedKey(from: string, to: string): string {
  return `${from}::${to}`;
}

/**
 * Asigna índice y total de hermanos a cada arista agrupada por (source, target).
 * Self-loops se agrupan por source solamente.
 * Aristas bidireccionales usan curveSign opuesto para separar curvas.
 */
export function assignParallelEdgeOffsets<
  T extends { id: string; from: string; to: string }
>(transitions: T[]): Map<string, ParallelEdgeMeta> {
  const groups = new Map<string, string[]>();
  const transitionById = new Map<string, T>();

  for (const t of transitions) {
    transitionById.set(t.id, t);
    const key =
      t.from === t.to ? `loop:${t.from}` : directedKey(t.from, t.to);
    const list = groups.get(key) ?? [];
    list.push(t.id);
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
    const total = ids.length;
    ids.forEach((id, index) => {
      const t = transitionById.get(id)!;
      let curveSign: 1 | -1 = 1;

      if (t.from !== t.to) {
        const pairKey = [t.from, t.to].sort().join('::');
        if (bidirectionalPairs.has(pairKey)) {
          curveSign = t.from < t.to ? 1 : -1;
        }
      }

      result.set(id, {
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
  spacing = DEFAULT_PARALLEL_SPACING
): number {
  if (total <= 1) return 0;
  const center = (total - 1) / 2;
  return (index - center) * spacing;
}
