import type { Automaton } from 'types/automaton';
import { EPSILON_SYMBOL } from './constants';

/** Extrae el alfabeto de entrada a partir de las transiciones (sin ε). */
export function deriveAlphabet(automaton: Automaton): string[] {
  const symbols = new Set<string>();

  for (const transition of automaton.transitions) {
    if (transition.isEpsilon) continue;
    if (transition.symbol.trim() !== '') {
      symbols.add(transition.symbol);
    }
  }

  for (const symbol of automaton.alphabet) {
    if (symbol !== EPSILON_SYMBOL) {
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
