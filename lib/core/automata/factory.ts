import type { Automaton, AutomatonType } from 'types/automaton';
import type { State } from 'types/state';
import type { Transition } from 'types/transition';

let stateCounter = 0;

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function nextStateName(existing: State[]): string {
  const used = new Set(existing.map((s) => s.name));
  let index = stateCounter;
  while (used.has(`q${index}`)) {
    index += 1;
  }
  stateCounter = index + 1;
  return `q${index}`;
}

export function createEmptyAutomaton(type: AutomatonType = 'dfa'): Automaton {
  return {
    id: generateId('auto'),
    name: type === 'dfa' ? 'Nuevo AFD' : 'Nuevo AFND',
    type,
    alphabet: [],
    states: [],
    transitions: [],
    initialStateId: null,
    acceptingStateIds: [],
  };
}

export function createState(
  existing: State[],
  position?: { x: number; y: number }
): State {
  return {
    id: generateId('state'),
    name: nextStateName(existing),
    isInitial: false,
    isAccepting: false,
    position: position ?? { x: 100 + existing.length * 80, y: 100 },
  };
}

export function createTransition(
  from: string,
  to: string,
  symbol: string,
  isEpsilon = false
): Transition {
  return {
    id: generateId('trans'),
    from,
    to,
    symbol: isEpsilon ? '' : symbol,
    isEpsilon,
  };
}
