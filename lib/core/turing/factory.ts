import type { TuringMachine } from 'types/turing';
import type { State } from 'types/state';
import type { TuringTransition, TapeMove } from 'types/turing';

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

let stateCounter = 0;

function nextStateName(existing: State[]): string {
  const used = new Set(existing.map((s) => s.name));
  let i = stateCounter;
  while (used.has(`q${i}`)) i += 1;
  stateCounter = i + 1;
  return `q${i}`;
}

export function createEmptyTuringMachine(tapeCount: 1 | 2 = 1): TuringMachine {
  return {
    id: generateId('tm'),
    name: tapeCount === 1 ? 'MT 1 banda' : 'MT 2 bandas',
    tapeCount,
    inputAlphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', '_'],
    blankSymbol: '_',
    states: [],
    transitions: [],
    initialStateId: null,
    acceptingStateIds: [],
    rejectingStateIds: [],
  };
}

export function createTuringState(
  existing: State[],
  position?: { x: number; y: number }
): State {
  return {
    id: generateId('tmstate'),
    name: nextStateName(existing),
    isInitial: false,
    isAccepting: false,
    position: position ?? { x: 100 + existing.length * 90, y: 100 },
  };
}

export function createTuringTransition(
  from: string,
  to: string,
  tapeCount: 1 | 2,
  readSymbols: string[],
  writeSymbols: string[],
  moves: TapeMove[]
): TuringTransition {
  return {
    id: generateId('tmtrans'),
    from,
    to,
    readSymbols: readSymbols.slice(0, tapeCount),
    writeSymbols: writeSymbols.slice(0, tapeCount),
    moves: moves.slice(0, tapeCount),
  };
}
