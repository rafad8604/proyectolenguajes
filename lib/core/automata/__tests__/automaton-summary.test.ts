import { describe, expect, it } from 'vitest';
import { createEmptyAutomaton, createState, createTransition } from '../factory';
import {
  getAutomatonTypeLabel,
  isAutomatonReady,
  isBlankAutomaton,
  summarizeAutomaton,
} from '../automaton-summary';

describe('automaton-summary', () => {
  it('detecta autómata vacío', () => {
    const automaton = createEmptyAutomaton('dfa');
    expect(isBlankAutomaton(automaton)).toBe(true);
    expect(isAutomatonReady(automaton)).toBe(false);
  });

  it('resume un AFD listo para gramática', () => {
    const q0 = createState([]);
    const q1 = createState([q0], { x: 100, y: 100 });
    const automaton = {
      ...createEmptyAutomaton('dfa'),
      name: 'Mi AFD',
      states: [
        { ...q0, isInitial: true, name: 'q0' },
        { ...q1, isAccepting: true, name: 'q1' },
      ],
      initialStateId: q0.id,
      acceptingStateIds: [q1.id],
      transitions: [createTransition(q0.id, q1.id, 'a')],
    };

    const summary = summarizeAutomaton(automaton);
    expect(summary.typeLabel).toBe('AFD');
    expect(summary.isReady).toBe(true);
    expect(summary.stateCount).toBe(2);
    expect(summary.transitionCount).toBe(1);
    expect(summary.initialState).toBe('q0');
    expect(summary.acceptingStates).toEqual(['q1']);
    expect(getAutomatonTypeLabel(automaton)).toBe('AFD');
  });

  it('detecta AFND con epsilon', () => {
    const q0 = createState([]);
    const automaton = {
      ...createEmptyAutomaton('nfa'),
      states: [{ ...q0, isInitial: true, name: 'q0' }],
      initialStateId: q0.id,
      transitions: [createTransition(q0.id, q0.id, '', true)],
    };
    expect(getAutomatonTypeLabel(automaton)).toBe('AFND con ε');
  });
});
