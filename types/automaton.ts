import type { State } from './state';
import type { Transition } from './transition';

export type AutomatonType = 'dfa' | 'nfa';

/** Autómata finito determinista o no determinista. */
export interface Automaton {
  id: string;
  name: string;
  type: AutomatonType;
  alphabet: string[];
  states: State[];
  transitions: Transition[];
  initialStateId: string | null;
  acceptingStateIds: string[];
}
