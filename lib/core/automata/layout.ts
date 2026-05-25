import type { Automaton } from 'types/automaton';

/** Actualiza la posición de un estado sin mutar el objeto original. */
export function patchStatePosition(
  automaton: Automaton,
  stateId: string,
  position: { x: number; y: number }
): Automaton {
  return {
    ...automaton,
    states: automaton.states.map((s) =>
      s.id === stateId ? { ...s, position: { ...position } } : s
    ),
  };
}
