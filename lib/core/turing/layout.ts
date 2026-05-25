import type { TuringMachine } from 'types/turing';
import type { TransitionVisual } from 'types/transition-visual';
import { mergeTransitionVisual } from 'types/transition-visual';

/** Actualiza la geometría visual de una transición TM sin mutar el objeto original. */
export function patchTuringTransitionVisual(
  machine: TuringMachine,
  transitionId: string,
  partial: Partial<TransitionVisual>
): TuringMachine {
  return {
    ...machine,
    transitions: machine.transitions.map((t) =>
      t.id === transitionId
        ? { ...t, visual: mergeTransitionVisual(t.visual, partial) }
        : t
    ),
  };
}
