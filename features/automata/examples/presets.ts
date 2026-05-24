import type { Automaton } from 'types/automaton';

/** AFD: acepta cadenas sobre {a,b} que terminan en «ab». */
export const DFA_ENDS_WITH_AB: Automaton = {
  id: 'preset_dfa_ends_ab',
  name: 'AFD — termina en ab',
  type: 'dfa',
  alphabet: ['a', 'b'],
  states: [
    {
      id: 'preset_dfa_q0',
      name: 'q0',
      isInitial: true,
      isAccepting: false,
      position: { x: 80, y: 120 },
    },
    {
      id: 'preset_dfa_q1',
      name: 'q1',
      isInitial: false,
      isAccepting: false,
      position: { x: 240, y: 120 },
    },
    {
      id: 'preset_dfa_q2',
      name: 'q2',
      isInitial: false,
      isAccepting: true,
      position: { x: 400, y: 120 },
    },
  ],
  transitions: [
    {
      id: 'preset_dfa_t0',
      from: 'preset_dfa_q0',
      to: 'preset_dfa_q1',
      symbol: 'a',
    },
    {
      id: 'preset_dfa_t1',
      from: 'preset_dfa_q1',
      to: 'preset_dfa_q2',
      symbol: 'b',
    },
    {
      id: 'preset_dfa_t2',
      from: 'preset_dfa_q1',
      to: 'preset_dfa_q0',
      symbol: 'a',
    },
    {
      id: 'preset_dfa_t3',
      from: 'preset_dfa_q2',
      to: 'preset_dfa_q1',
      symbol: 'a',
    },
    {
      id: 'preset_dfa_t4',
      from: 'preset_dfa_q2',
      to: 'preset_dfa_q0',
      symbol: 'b',
    },
    {
      id: 'preset_dfa_t5',
      from: 'preset_dfa_q0',
      to: 'preset_dfa_q0',
      symbol: 'b',
    },
  ],
  initialStateId: 'preset_dfa_q0',
  acceptingStateIds: ['preset_dfa_q2'],
};

/** AFND: ε desde q0 a q1 (acepta ε y cadenas que llegan a q1). */
export const NFA_EPSILON: Automaton = {
  id: 'preset_nfa_epsilon',
  name: 'AFND — transición ε',
  type: 'nfa',
  alphabet: ['a', 'b'],
  states: [
    {
      id: 'preset_nfa_q0',
      name: 'q0',
      isInitial: true,
      isAccepting: false,
      position: { x: 100, y: 140 },
    },
    {
      id: 'preset_nfa_q1',
      name: 'q1',
      isInitial: false,
      isAccepting: true,
      position: { x: 300, y: 140 },
    },
    {
      id: 'preset_nfa_q2',
      name: 'q2',
      isInitial: false,
      isAccepting: true,
      position: { x: 300, y: 280 },
    },
  ],
  transitions: [
    {
      id: 'preset_nfa_te',
      from: 'preset_nfa_q0',
      to: 'preset_nfa_q1',
      symbol: '',
      isEpsilon: true,
    },
    {
      id: 'preset_nfa_ta',
      from: 'preset_nfa_q0',
      to: 'preset_nfa_q0',
      symbol: 'a',
    },
    {
      id: 'preset_nfa_tb',
      from: 'preset_nfa_q1',
      to: 'preset_nfa_q2',
      symbol: 'b',
    },
    {
      id: 'preset_nfa_ta2',
      from: 'preset_nfa_q1',
      to: 'preset_nfa_q1',
      symbol: 'a',
    },
  ],
  initialStateId: 'preset_nfa_q0',
  acceptingStateIds: ['preset_nfa_q1', 'preset_nfa_q2'],
};

/** AFND: acepta cadenas que terminan en «a» (no determinista en el último símbolo). */
export const NFA_ENDS_WITH_A: Automaton = {
  id: 'preset_nfa_ends_a',
  name: 'AFND — termina en a',
  type: 'nfa',
  alphabet: ['a', 'b'],
  states: [
    {
      id: 'preset_nfa_a_q0',
      name: 'q0',
      isInitial: true,
      isAccepting: false,
      position: { x: 80, y: 120 },
    },
    {
      id: 'preset_nfa_a_q1',
      name: 'q1',
      isInitial: false,
      isAccepting: false,
      position: { x: 240, y: 120 },
    },
    {
      id: 'preset_nfa_a_q2',
      name: 'q2',
      isInitial: false,
      isAccepting: true,
      position: { x: 400, y: 120 },
    },
  ],
  transitions: [
    { id: 'preset_nfa_a_t0', from: 'preset_nfa_a_q0', to: 'preset_nfa_a_q0', symbol: 'a' },
    { id: 'preset_nfa_a_t1', from: 'preset_nfa_a_q0', to: 'preset_nfa_a_q0', symbol: 'b' },
    { id: 'preset_nfa_a_t2', from: 'preset_nfa_a_q0', to: 'preset_nfa_a_q1', symbol: 'a' },
    { id: 'preset_nfa_a_t3', from: 'preset_nfa_a_q0', to: 'preset_nfa_a_q1', symbol: 'b' },
    { id: 'preset_nfa_a_t4', from: 'preset_nfa_a_q1', to: 'preset_nfa_a_q2', symbol: 'a' },
    { id: 'preset_nfa_a_t5', from: 'preset_nfa_a_q1', to: 'preset_nfa_a_q0', symbol: 'b' },
  ],
  initialStateId: 'preset_nfa_a_q0',
  acceptingStateIds: ['preset_nfa_a_q2'],
};

export const AUTOMATON_PRESETS = [
  { id: 'dfa-ends-ab', label: 'AFD: termina en ab', automaton: DFA_ENDS_WITH_AB },
  { id: 'nfa-epsilon', label: 'AFND: con ε', automaton: NFA_EPSILON },
  { id: 'nfa-ends-a', label: 'AFND: termina en a', automaton: NFA_ENDS_WITH_A },
] as const;
