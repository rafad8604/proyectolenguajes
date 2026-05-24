import type { Automaton } from 'types/automaton';

/** Conjunto ordenado de ids de estados (estable para UI). */
export function sortStateIds(ids: Iterable<string>): string[] {
  return Array.from(ids).sort();
}

/** Cerradura épsilon de un conjunto de estados en un AFND. */
export function epsilonClosure(
  automaton: Automaton,
  stateIds: Iterable<string>
): string[] {
  const result = new Set(stateIds);
  const stack = [...result];

  while (stack.length > 0) {
    const q = stack.pop()!;
    for (const t of automaton.transitions) {
      if (t.isEpsilon && t.from === q && !result.has(t.to)) {
        result.add(t.to);
        stack.push(t.to);
      }
    }
  }

  return sortStateIds(result);
}

/** Transiciones ε usadas para alcanzar `targetIds` desde `sourceIds`. */
export function epsilonTransitionsUsed(
  automaton: Automaton,
  sourceIds: string[],
  targetIds: string[]
): string[] {
  const targetSet = new Set(targetIds);
  const needed = new Set<string>();
  for (const id of targetIds) {
    if (!sourceIds.includes(id)) needed.add(id);
  }

  const used: string[] = [];
  const visited = new Set(sourceIds);
  const queue = [...sourceIds];

  while (queue.length > 0) {
    const q = queue.shift()!;
    for (const t of automaton.transitions) {
      if (t.isEpsilon && t.from === q) {
        if (!visited.has(t.to)) {
          visited.add(t.to);
          queue.push(t.to);
          if (needed.has(t.to) || targetSet.has(t.to)) {
            used.push(t.id);
          }
        }
      }
    }
  }

  return [...new Set(used)];
}
