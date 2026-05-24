import type { Automaton } from 'types/automaton';
import { deriveAlphabet } from './alphabet';
import { EPSILON_SYMBOL } from './constants';
import type { FormalDefinition } from './types';

function getStateName(automaton: Automaton, stateId: string): string {
  return automaton.states.find((s) => s.id === stateId)?.name ?? stateId;
}

function formatSymbol(symbol: string, isEpsilon?: boolean): string {
  return isEpsilon ? EPSILON_SYMBOL : symbol || EPSILON_SYMBOL;
}

/** Genera la definición formal M = (Q, Σ, δ, q₀, F). */
export function buildFormalDefinition(automaton: Automaton): FormalDefinition {
  const Q = automaton.states.map((s) => s.name).sort();
  const sigma = deriveAlphabet(automaton);
  const q0 = automaton.initialStateId
    ? getStateName(automaton, automaton.initialStateId)
    : null;
  const F = automaton.acceptingStateIds
    .map((id) => getStateName(automaton, id))
    .sort();

  const deltaLines: string[] = [];
  const grouped = new Map<string, { to: string[]; isEpsilon: boolean }>();

  for (const t of automaton.transitions) {
    const fromName = getStateName(automaton, t.from);
    const sym = formatSymbol(t.symbol, t.isEpsilon);
    const key = `${fromName}|${sym}`;
    const toName = getStateName(automaton, t.to);

    const existing = grouped.get(key);
    if (existing) {
      if (!existing.to.includes(toName)) {
        existing.to.push(toName);
      }
    } else {
      grouped.set(key, { to: [toName], isEpsilon: !!t.isEpsilon });
    }
  }

  const sortedKeys = Array.from(grouped.keys()).sort();
  for (const key of sortedKeys) {
    const [fromName, sym] = key.split('|');
    const { to } = grouped.get(key)!;
    const toFormatted =
      to.length === 1 ? to[0] : `{${to.sort().join(', ')}}`;
    deltaLines.push(`δ(${fromName}, ${sym}) = ${toFormatted}`);
  }

  return { Q, sigma, delta: deltaLines, q0, F };
}
