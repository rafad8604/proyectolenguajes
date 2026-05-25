import type { Automaton } from 'types/automaton';
import {
  buildSimulationTrace,
  type SimulationOutcome,
  type SimulationTrace,
} from './simulation';
import { buildVisualSnapshot } from './visual-highlight';

export interface StructuralSummary {
  nfaStateCount: number;
  dfaStateCount: number;
  nfaTransitionCount: number;
  dfaTransitionCount: number;
  nfaHasEpsilon: boolean;
  dfaHasEpsilon: boolean;
}

export interface SimulationComparison {
  input: string;
  nfaTrace: SimulationTrace;
  dfaTrace: SimulationTrace;
  nfaOutcome: SimulationOutcome;
  dfaOutcome: SimulationOutcome;
  outcomesMatch: boolean;
  structuralSummary: StructuralSummary;
}

function structuralSummary(nfa: Automaton, dfa: Automaton): StructuralSummary {
  return {
    nfaStateCount: nfa.states.length,
    dfaStateCount: dfa.states.length,
    nfaTransitionCount: nfa.transitions.length,
    dfaTransitionCount: dfa.transitions.length,
    nfaHasEpsilon: nfa.transitions.some((t) => t.isEpsilon),
    dfaHasEpsilon: dfa.transitions.some((t) => t.isEpsilon),
  };
}

/** Simula la misma cadena en NFA y AFD y compara resultados. */
export function compareSimulations(
  nfa: Automaton,
  dfa: Automaton,
  input: string
): SimulationComparison {
  const nfaTrace = buildSimulationTrace(nfa, input);
  const dfaTrace = buildSimulationTrace(dfa, input);
  const nfaOutcome = nfaTrace.finalOutcome;
  const dfaOutcome = dfaTrace.finalOutcome;

  return {
    input,
    nfaTrace,
    dfaTrace,
    nfaOutcome,
    dfaOutcome,
    outcomesMatch: nfaOutcome === dfaOutcome,
    structuralSummary: structuralSummary(nfa, dfa),
  };
}

/** Nombres de estados visitados hasta un paso (para panel de comparación). */
export function formatVisitedStates(
  trace: SimulationTrace,
  automaton: Automaton,
  stepIndex: number
): string {
  const snapshot = buildVisualSnapshot(trace, stepIndex, automaton);
  if (!snapshot) return '—';

  const name = (id: string) =>
    automaton.states.find((s) => s.id === id)?.name ?? id;

  const active = snapshot.activeStateIds.map(name).join(', ') || '∅';
  const visited = snapshot.visitedStateIds
    .filter((id) => !snapshot.activeStateIds.includes(id))
    .map(name);

  if (visited.length === 0) return active;
  return `${active} (visitados: ${visited.join(', ')})`;
}
