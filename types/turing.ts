import type { State } from './state';

/** Dirección de movimiento del cabezal en una cinta. */
export type TapeMove = 'L' | 'R' | 'S';

/** Transición de una máquina de Turing (1 o 2 bandas). */
export interface TuringTransition {
  id: string;
  from: string;
  to: string;
  /** Símbolos leídos, uno por banda. */
  readSymbols: string[];
  /** Símbolos escritos, uno por banda. */
  writeSymbols: string[];
  /** Movimientos del cabezal, uno por banda. */
  moves: TapeMove[];
}

/** Máquina de Turing de una o dos bandas. */
export interface TuringMachine {
  id: string;
  name: string;
  tapeCount: 1 | 2;
  inputAlphabet: string[];
  tapeAlphabet: string[];
  blankSymbol: string;
  states: State[];
  transitions: TuringTransition[];
  initialStateId: string | null;
  acceptingStateIds: string[];
  rejectingStateIds: string[];
}
