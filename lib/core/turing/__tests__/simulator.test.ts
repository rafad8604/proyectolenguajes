import { describe, expect, it } from 'vitest';
import type { TuringMachine } from 'types/turing';
import {
  buildTuringSimulationTrace,
  isTerminalTuringOutcome,
  resolveStepDisplayOutcome,
} from '../simulator';

const TM_ACCEPTS_EMPTY: TuringMachine = {
  id: 'test_empty',
  name: 'solo ε',
  tapeCount: 1,
  inputAlphabet: ['a'],
  tapeAlphabet: ['a', '_'],
  blankSymbol: '_',
  states: [
    { id: 'q0', name: 'q0', isInitial: true, isAccepting: true, position: { x: 0, y: 0 } },
    { id: 'qr', name: 'qr', isInitial: false, isAccepting: false, position: { x: 0, y: 80 } },
  ],
  transitions: [
    { id: 't1', from: 'q0', to: 'qr', readSymbols: ['a'], writeSymbols: ['a'], moves: ['S'] },
  ],
  initialStateId: 'q0',
  acceptingStateIds: ['q0'],
  rejectingStateIds: ['qr'],
};

const TM_ACCEPTS_ENDS_WITH_1: TuringMachine = {
  id: 'test_ends1',
  name: 'termina en 1',
  tapeCount: 1,
  inputAlphabet: ['0', '1'],
  tapeAlphabet: ['0', '1', '_'],
  blankSymbol: '_',
  states: [
    { id: 'q0', name: 'q0', isInitial: true, isAccepting: false, position: { x: 0, y: 0 } },
    { id: 'q1', name: 'q1', isInitial: false, isAccepting: true, position: { x: 120, y: 0 } },
    { id: 'qr', name: 'qr', isInitial: false, isAccepting: false, position: { x: 120, y: 80 } },
  ],
  transitions: [
    { id: 't0', from: 'q0', to: 'q0', readSymbols: ['0'], writeSymbols: ['0'], moves: ['R'] },
    { id: 't1', from: 'q0', to: 'q1', readSymbols: ['1'], writeSymbols: ['1'], moves: ['R'] },
    { id: 't2', from: 'q0', to: 'qr', readSymbols: ['_'], writeSymbols: ['_'], moves: ['S'] },
    { id: 't3', from: 'q1', to: 'q1', readSymbols: ['1'], writeSymbols: ['1'], moves: ['R'] },
    { id: 't4', from: 'q1', to: 'q0', readSymbols: ['0'], writeSymbols: ['0'], moves: ['R'] },
  ],
  initialStateId: 'q0',
  acceptingStateIds: ['q1'],
  rejectingStateIds: ['qr'],
};

const TM_NO_TRANSITION_ON_2: TuringMachine = {
  id: 'test_no_trans',
  name: 'sin δ para 2',
  tapeCount: 1,
  inputAlphabet: ['0', '1', '2'],
  tapeAlphabet: ['0', '1', '2', '_'],
  blankSymbol: '_',
  states: [
    { id: 'q0', name: 'q0', isInitial: true, isAccepting: false, position: { x: 0, y: 0 } },
    { id: 'qa', name: 'qa', isInitial: false, isAccepting: true, position: { x: 120, y: 0 } },
  ],
  transitions: [
    { id: 't0', from: 'q0', to: 'q0', readSymbols: ['0'], writeSymbols: ['0'], moves: ['R'] },
    { id: 't1', from: 'q0', to: 'q0', readSymbols: ['1'], writeSymbols: ['1'], moves: ['R'] },
  ],
  initialStateId: 'q0',
  acceptingStateIds: ['qa'],
  rejectingStateIds: [],
};

const TM_TWO_TAPE_REJECT: TuringMachine = {
  id: 'test_2tape_reject',
  name: '2 bandas rechazo',
  tapeCount: 2,
  inputAlphabet: ['0'],
  tapeAlphabet: ['0', '_'],
  blankSymbol: '_',
  states: [
    { id: 'q0', name: 'q0', isInitial: true, isAccepting: false, position: { x: 0, y: 0 } },
    { id: 'qr', name: 'qr', isInitial: false, isAccepting: false, position: { x: 120, y: 0 } },
  ],
  transitions: [
    { id: 't0', from: 'q0', to: 'q0', readSymbols: ['0', '_'], writeSymbols: ['0', '0'], moves: ['S', 'S'] },
    { id: 't1', from: 'q0', to: 'qr', readSymbols: ['0', '0'], writeSymbols: ['0', '0'], moves: ['S', 'S'] },
  ],
  initialStateId: 'q0',
  acceptingStateIds: [],
  rejectingStateIds: ['qr'],
};

const TM_TWO_TAPE_SCAN: TuringMachine = {
  id: 'test_2tape',
  name: '2 bandas',
  tapeCount: 2,
  inputAlphabet: ['0', '1'],
  tapeAlphabet: ['0', '1', '_'],
  blankSymbol: '_',
  states: [
    { id: 'q0', name: 'q0', isInitial: true, isAccepting: false, position: { x: 0, y: 0 } },
    { id: 'q1', name: 'q1', isInitial: false, isAccepting: true, position: { x: 160, y: 0 } },
    { id: 'qr', name: 'qr', isInitial: false, isAccepting: false, position: { x: 160, y: 80 } },
  ],
  transitions: [
    { id: 't0', from: 'q0', to: 'q0', readSymbols: ['0', '_'], writeSymbols: ['0', '_'], moves: ['R', 'S'] },
    { id: 't1', from: 'q0', to: 'q0', readSymbols: ['1', '_'], writeSymbols: ['1', '_'], moves: ['R', 'S'] },
    { id: 't2', from: 'q0', to: 'q1', readSymbols: ['_', '_'], writeSymbols: ['_', '_'], moves: ['S', 'S'] },
    { id: 't3', from: 'q0', to: 'qr', readSymbols: ['0', '0'], writeSymbols: ['0', '0'], moves: ['S', 'S'] },
  ],
  initialStateId: 'q0',
  acceptingStateIds: ['q1'],
  rejectingStateIds: ['qr'],
};

describe('buildTuringSimulationTrace — aceptación', () => {
  it('no acepta en el paso inicial aunque q0 sea de aceptación con entrada no vacía', () => {
    const trace = buildTuringSimulationTrace(TM_ACCEPTS_EMPTY, 'a');
    expect(trace.steps[0]?.outcome).toBe('running');
    expect(trace.finalOutcome).toBe('rejected');
  });

  it('acepta ε solo al detenerse sin transición en estado de aceptación', () => {
    const trace = buildTuringSimulationTrace(TM_ACCEPTS_EMPTY, '');
    expect(trace.finalOutcome).toBe('accepted');
    const last = trace.steps.at(-1);
    expect(last?.outcome).toBe('accepted');
    expect(last?.explanation).toContain('aceptación');
  });

  it('no acepta «101» al leer el primer 1 (termina en 1)', () => {
    const trace = buildTuringSimulationTrace(TM_ACCEPTS_ENDS_WITH_1, '101');
    const earlyAccepted = trace.steps.some(
      (s, i) => i < trace.steps.length - 1 && s.outcome === 'accepted'
    );
    expect(earlyAccepted).toBe(false);
    expect(trace.finalOutcome).toBe('accepted');
  });

  it('rechaza «100» aunque haya pasado por q1', () => {
    const trace = buildTuringSimulationTrace(TM_ACCEPTS_ENDS_WITH_1, '100');
    expect(trace.finalOutcome).toBe('rejected');
  });

  it('rechaza «110» (no termina en 1)', () => {
    const trace = buildTuringSimulationTrace(TM_ACCEPTS_ENDS_WITH_1, '110');
    expect(trace.finalOutcome).toBe('rejected');
  });

  it('continúa en estado de aceptación si aún hay transición aplicable', () => {
    const trace = buildTuringSimulationTrace(TM_ACCEPTS_ENDS_WITH_1, '11');
    expect(trace.steps[0]?.outcome).toBe('running');
    expect(trace.steps.some((s) => s.outcome === 'accepted' && s.appliedTransitionId)).toBe(
      false
    );
    expect(trace.finalOutcome).toBe('accepted');
  });
});

describe('buildTuringSimulationTrace — sin transición', () => {
  it('detiene con no_transition si no hay δ y no es estado final', () => {
    const trace = buildTuringSimulationTrace(TM_NO_TRANSITION_ON_2, '12');
    expect(trace.finalOutcome).toBe('no_transition');
    expect(trace.steps.at(-1)?.explanation).toContain('no es estado final');
  });
});

describe('buildTuringSimulationTrace — 2 bandas', () => {
  it('acepta «101» tras recorrer banda 1 con banda 2 en blanco', () => {
    const trace = buildTuringSimulationTrace(TM_TWO_TAPE_SCAN, '101');
    expect(trace.finalOutcome).toBe('accepted');
  });

  it('rechaza cuando ambas cintas leen 0 en q0', () => {
    const trace = buildTuringSimulationTrace(TM_TWO_TAPE_REJECT, '0');
    expect(trace.finalOutcome).toBe('rejected');
  });

  it('no acepta antes de procesar ambas cintas', () => {
    const trace = buildTuringSimulationTrace(TM_TWO_TAPE_SCAN, '10');
    const acceptBeforeEnd = trace.steps.some(
      (s, i) => i < trace.steps.length - 2 && s.outcome === 'accepted'
    );
    expect(acceptBeforeEnd).toBe(false);
  });
});

describe('resolveStepDisplayOutcome', () => {
  it('no adelanta el resultado final en pasos intermedios', () => {
    const trace = buildTuringSimulationTrace(TM_ACCEPTS_ENDS_WITH_1, '101');
    expect(resolveStepDisplayOutcome(trace.steps[0], trace)).toBe('running');
    expect(isTerminalTuringOutcome(resolveStepDisplayOutcome(trace.steps[0], trace))).toBe(
      false
    );
  });
});
