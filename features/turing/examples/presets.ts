import type { TuringMachine } from 'types/turing';

/** MT 1 banda: acepta cadenas sobre {0,1} que terminan en «1». */
export const TM_ACCEPTS_ENDS_WITH_1: TuringMachine = {
  id: 'preset_tm_1',
  name: 'MT — termina en 1',
  tapeCount: 1,
  inputAlphabet: ['0', '1'],
  tapeAlphabet: ['0', '1', '_'],
  blankSymbol: '_',
  states: [
    { id: 'tm_q0', name: 'q0', isInitial: true, isAccepting: false, position: { x: 80, y: 100 } },
    { id: 'tm_q1', name: 'q1', isInitial: false, isAccepting: true, position: { x: 260, y: 100 } },
    { id: 'tm_qr', name: 'qr', isInitial: false, isAccepting: false, position: { x: 260, y: 220 } },
  ],
  transitions: [
    { id: 'tm_t0', from: 'tm_q0', to: 'tm_q0', readSymbols: ['0'], writeSymbols: ['0'], moves: ['R'] },
    { id: 'tm_t1', from: 'tm_q0', to: 'tm_q1', readSymbols: ['1'], writeSymbols: ['1'], moves: ['R'] },
    { id: 'tm_t2', from: 'tm_q0', to: 'tm_qr', readSymbols: ['_'], writeSymbols: ['_'], moves: ['S'] },
    { id: 'tm_t3', from: 'tm_q1', to: 'tm_q1', readSymbols: ['1'], writeSymbols: ['1'], moves: ['R'] },
    { id: 'tm_t4', from: 'tm_q1', to: 'tm_q0', readSymbols: ['0'], writeSymbols: ['0'], moves: ['R'] },
  ],
  initialStateId: 'tm_q0',
  acceptingStateIds: ['tm_q1'],
  rejectingStateIds: ['tm_qr'],
};

/** MT 1 banda: acepta solo la cadena vacía. */
export const TM_ACCEPTS_EMPTY: TuringMachine = {
  id: 'preset_tm_empty',
  name: 'MT — solo ε',
  tapeCount: 1,
  inputAlphabet: ['a', 'b'],
  tapeAlphabet: ['a', 'b', '_'],
  blankSymbol: '_',
  states: [
    { id: 'tm_e_q0', name: 'q0', isInitial: true, isAccepting: true, position: { x: 120, y: 100 } },
    { id: 'tm_e_qr', name: 'qr', isInitial: false, isAccepting: false, position: { x: 120, y: 220 } },
  ],
  transitions: [
    { id: 'tm_e_t1', from: 'tm_e_q0', to: 'tm_e_qr', readSymbols: ['a'], writeSymbols: ['a'], moves: ['S'] },
    { id: 'tm_e_t2', from: 'tm_e_q0', to: 'tm_e_qr', readSymbols: ['b'], writeSymbols: ['b'], moves: ['S'] },
  ],
  initialStateId: 'tm_e_q0',
  acceptingStateIds: ['tm_e_q0'],
  rejectingStateIds: ['tm_e_qr'],
};

/** MT 2 bandas: recorre la entrada en banda 1; acepta al llegar al blanco con banda 2 vacía. */
export const TM_TWO_TAPE_SCAN: TuringMachine = {
  id: 'preset_tm_2tape',
  name: 'MT — escaneo 2 bandas',
  tapeCount: 2,
  inputAlphabet: ['0', '1'],
  tapeAlphabet: ['0', '1', '_'],
  blankSymbol: '_',
  states: [
    { id: 'tm2_q0', name: 'q0', isInitial: true, isAccepting: false, position: { x: 80, y: 120 } },
    { id: 'tm2_q1', name: 'q1', isInitial: false, isAccepting: true, position: { x: 280, y: 120 } },
    { id: 'tm2_qr', name: 'qr', isInitial: false, isAccepting: false, position: { x: 280, y: 240 } },
  ],
  transitions: [
    { id: 'tm2_t0', from: 'tm2_q0', to: 'tm2_q0', readSymbols: ['0', '_'], writeSymbols: ['0', '_'], moves: ['R', 'S'] },
    { id: 'tm2_t1', from: 'tm2_q0', to: 'tm2_q0', readSymbols: ['1', '_'], writeSymbols: ['1', '_'], moves: ['R', 'S'] },
    { id: 'tm2_t2', from: 'tm2_q0', to: 'tm2_q1', readSymbols: ['_', '_'], writeSymbols: ['_', '_'], moves: ['S', 'S'] },
    { id: 'tm2_t3', from: 'tm2_q0', to: 'tm2_qr', readSymbols: ['0', '0'], writeSymbols: ['0', '0'], moves: ['S', 'S'] },
  ],
  initialStateId: 'tm2_q0',
  acceptingStateIds: ['tm2_q1'],
  rejectingStateIds: ['tm2_qr'],
};

/** MT 1 banda: no tiene transición para el símbolo «2». */
export const TM_NO_TRANSITION_ON_2: TuringMachine = {
  id: 'preset_tm_no_trans',
  name: 'MT — sin δ para 2',
  tapeCount: 1,
  inputAlphabet: ['0', '1', '2'],
  tapeAlphabet: ['0', '1', '2', '_'],
  blankSymbol: '_',
  states: [
    { id: 'tm_nt_q0', name: 'q0', isInitial: true, isAccepting: false, position: { x: 100, y: 100 } },
    { id: 'tm_nt_qa', name: 'qa', isInitial: false, isAccepting: true, position: { x: 280, y: 100 } },
  ],
  transitions: [
    { id: 'tm_nt_t0', from: 'tm_nt_q0', to: 'tm_nt_q0', readSymbols: ['0'], writeSymbols: ['0'], moves: ['R'] },
    { id: 'tm_nt_t1', from: 'tm_nt_q0', to: 'tm_nt_q0', readSymbols: ['1'], writeSymbols: ['1'], moves: ['R'] },
  ],
  initialStateId: 'tm_nt_q0',
  acceptingStateIds: ['tm_nt_qa'],
  rejectingStateIds: [],
};

export const TURING_PRESETS = [
  { id: 'tm-ends-1', label: 'MT: termina en 1', machine: TM_ACCEPTS_ENDS_WITH_1 },
  { id: 'tm-empty', label: 'MT: solo ε', machine: TM_ACCEPTS_EMPTY },
  { id: 'tm-2tape', label: 'MT: 2 bandas (marcador)', machine: TM_TWO_TAPE_SCAN },
  { id: 'tm-no-trans', label: 'MT: sin δ para 2', machine: TM_NO_TRANSITION_ON_2 },
] as const;
