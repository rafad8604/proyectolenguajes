import type { Automaton } from 'types/automaton';
import type { TransitionVisual } from 'types/transition-visual';
import { mergeTransitionVisual } from 'types/transition-visual';

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

/** Actualiza la geometría visual de una transición sin mutar el objeto original. */
export function patchTransitionVisual(
  automaton: Automaton,
  transitionId: string,
  partial: Partial<TransitionVisual>
): Automaton {
  return {
    ...automaton,
    transitions: automaton.transitions.map((t) =>
      t.id === transitionId
        ? { ...t, visual: mergeTransitionVisual(t.visual, partial) }
        : t
    ),
  };
}
