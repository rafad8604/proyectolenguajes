import type { Automaton } from 'types/automaton';
import type { TuringMachine } from 'types/turing';

export type JffDocumentType = 'fa' | 'turing' | 'unknown';

export type JffModelKind = 'automaton' | 'turing';

export interface JffParseSuccess {
  ok: true;
  kind: JffModelKind;
  documentType: JffDocumentType;
  automaton?: Automaton;
  turingMachine?: TuringMachine;
  warnings: string[];
  fileName?: string;
}

export interface JffParseFailure {
  ok: false;
  error: string;
  warnings: string[];
}

export type JffParseResult = JffParseSuccess | JffParseFailure;

export interface JffExportTarget {
  kind: JffModelKind;
  automaton?: Automaton;
  turingMachine?: TuringMachine;
  fileName?: string;
}
