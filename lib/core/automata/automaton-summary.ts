import type { Automaton } from 'types/automaton';
import { deriveAlphabet } from './alphabet';

export interface AutomatonSummary {
  name: string;
  typeLabel: 'AFD' | 'AFND' | 'AFND con ε';
  stateCount: number;
  alphabet: string[];
  initialState: string | null;
  acceptingStates: string[];
  transitionCount: number;
  hasEpsilon: boolean;
  isReady: boolean;
}

/** Indica si el autómata tiene la información mínima para generar gramática. */
export function isAutomatonReady(automaton: Automaton): boolean {
  return automaton.states.length > 0 && automaton.initialStateId !== null;
}

export function getAutomatonTypeLabel(automaton: Automaton): AutomatonSummary['typeLabel'] {
  if (automaton.type === 'dfa') return 'AFD';
  const hasEpsilon = automaton.transitions.some((t) => t.isEpsilon);
  return hasEpsilon ? 'AFND con ε' : 'AFND';
}

function stateName(automaton: Automaton, id: string | null): string | null {
  if (!id) return null;
  return automaton.states.find((s) => s.id === id)?.name ?? id;
}

/** Resumen legible del autómata para compartir entre módulos. */
export function summarizeAutomaton(automaton: Automaton): AutomatonSummary {
  const hasEpsilon = automaton.transitions.some((t) => t.isEpsilon);
  const alphabet = deriveAlphabet(automaton);

  return {
    name: automaton.name,
    typeLabel: getAutomatonTypeLabel(automaton),
    stateCount: automaton.states.length,
    alphabet,
    initialState: stateName(automaton, automaton.initialStateId),
    acceptingStates: automaton.acceptingStateIds
      .map((id) => stateName(automaton, id))
      .filter((name): name is string => name !== null),
    transitionCount: automaton.transitions.length,
    hasEpsilon,
    isReady: isAutomatonReady(automaton),
  };
}

/** Autómata vacío recién creado (sin trabajo del usuario). */
export function isBlankAutomaton(automaton: Automaton): boolean {
  return (
    automaton.states.length === 0 &&
    automaton.transitions.length === 0 &&
    automaton.initialStateId === null
  );
}
