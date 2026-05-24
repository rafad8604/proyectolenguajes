import type { TuringMachine } from 'types/turing';

/** MT 1 banda: acepta cadenas que terminan en «1». */
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
    { id: 'tm_t3', from: 'tm_q1', to: 'tm_q1', readSymbols: ['0'], writeSymbols: ['0'], moves: ['R'] },
    { id: 'tm_t4', from: 'tm_q1', to: 'tm_q1', readSymbols: ['1'], writeSymbols: ['1'], moves: ['R'] },
    { id: 'tm_t5', from: 'tm_q1', to: 'tm_q1', readSymbols: ['_'], writeSymbols: ['_'], moves: ['S'] },
  ],
  initialStateId: 'tm_q0',
  acceptingStateIds: ['tm_q1'],
  rejectingStateIds: ['tm_qr'],
};
