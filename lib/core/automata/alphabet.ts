import type { Automaton } from 'types/automaton';
import { isEpsilonSymbol } from './constants';

/** Extrae el alfabeto de entrada a partir de las transiciones (sin ε). */
export function deriveAlphabet(automaton: Automaton): string[] {
  const symbols = new Set<string>();

  for (const transition of automaton.transitions) {
    if (transition.isEpsilon) continue;
    const sym = transition.symbol.trim();
    if (sym !== '' && !isEpsilonSymbol(sym)) {
      symbols.add(transition.symbol);
    }
  }

  for (const symbol of automaton.alphabet) {
    if (!isEpsilonSymbol(symbol)) {
      symbols.add(symbol);
    }
  }

  return Array.from(symbols).sort();
}

export function syncAlphabet(automaton: Automaton): Automaton {
  return {
    ...automaton,
    alphabet: deriveAlphabet(automaton),
  };
}
