/** Metadatos de offset para aristas paralelas entre el mismo par de nodos. */
export interface ParallelEdgeMeta {
  offsetIndex: number;
  totalSiblings: number;
}

/**
 * Asigna índice y total de hermanos a cada arista agrupada por (source, target).
 * Self-loops se agrupan por source solamente.
 */
export function assignParallelEdgeOffsets<
  T extends { id: string; from: string; to: string }
>(transitions: T[]): Map<string, ParallelEdgeMeta> {
  const groups = new Map<string, string[]>();

  for (const t of transitions) {
    const key =
      t.from === t.to ? `loop:${t.from}` : `${t.from}::${t.to}`;
    const list = groups.get(key) ?? [];
    list.push(t.id);
    groups.set(key, list);
  }

  const result = new Map<string, ParallelEdgeMeta>();
  for (const ids of groups.values()) {
    const total = ids.length;
    ids.forEach((id, index) => {
      result.set(id, { offsetIndex: index, totalSiblings: total });
    });
  }

  return result;
}

/** Desplazamiento en píxeles para separar curvas paralelas. */
export function parallelPathOffset(
  index: number,
  total: number,
  spacing = 18
): number {
  if (total <= 1) return 0;
  const center = (total - 1) / 2;
  return (index - center) * spacing;
}
