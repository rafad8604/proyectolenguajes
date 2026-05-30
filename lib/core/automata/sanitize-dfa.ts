import type { Automaton } from 'types/automaton';
import { deriveAlphabet, syncAlphabet } from './alphabet';
import { isEpsilonSymbol } from './constants';

/**
 * Elimina transiciones ε y normaliza un AFD resultante de conversión.
 * Las cerraduras ε solo deben usarse al construir el AFD, no en su ejecución.
 */
export function sanitizeDeterministicAutomaton(automaton: Automaton): Automaton {
  if (automaton.type !== 'dfa') {
    return automaton;
  }

  const transitions = automaton.transitions
    .filter((t) => !t.isEpsilon && !isEpsilonSymbol(t.symbol))
    .map((t) => ({ ...t, isEpsilon: false as const }));

  const alphabet = deriveAlphabet({ ...automaton, transitions });

  return syncAlphabet({
    ...automaton,
    type: 'dfa',
    transitions,
    alphabet,
  });
}
