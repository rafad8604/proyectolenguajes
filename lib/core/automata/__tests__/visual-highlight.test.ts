import { describe, expect, it } from 'vitest';
import type { Automaton } from 'types/automaton';
import { buildSimulationTrace } from '../simulation';
import {
  buildVisualSnapshot,
  resolveTraceStepIndex,
  unifiedSimulationStepCount,
} from '../visual-highlight';

function loopDfa(): Automaton {
  return {
    id: 'dfa-loop',
    name: 'Loop DFA',
    type: 'dfa',
    alphabet: ['a'],
    states: [
      {
        id: 'q0',
        name: 'q0',
        isInitial: true,
        isAccepting: true,
        position: { x: 0, y: 0 },
      },
    ],
    transitions: [
      {
        id: 't-loop',
        from: 'q0',
        to: 'q0',
        symbol: 'a',
        isEpsilon: false,
      },
    ],
    initialStateId: 'q0',
    acceptingStateIds: ['q0'],
  };
}

describe('buildVisualSnapshot', () => {
  it('marca como revisitados estados y arcos activos en pasos posteriores', () => {
    const dfa = loopDfa();
    const trace = buildSimulationTrace(dfa, 'aa');
    const firstConsume = 1;
    const secondConsume = 2;

    const first = buildVisualSnapshot(trace, firstConsume, dfa);
    const second = buildVisualSnapshot(trace, secondConsume, dfa);

    expect(first?.activeStateIds).toEqual(['q0']);
    expect(first?.activeTransitionIds).toEqual(['t-loop']);
    expect(first?.revisitedStateIds).toEqual(['q0']);
    expect(first?.revisitedTransitionIds).toEqual([]);

    expect(second?.activeStateIds).toEqual(['q0']);
    expect(second?.activeTransitionIds).toEqual(['t-loop']);
    expect(second?.revisitedStateIds).toEqual(['q0']);
    expect(second?.revisitedTransitionIds).toEqual(['t-loop']);
  });

  it('separa visitados previos del paso activo actual', () => {
    const dfa = loopDfa();
    const trace = buildSimulationTrace(dfa, 'a');
    const snapshot = buildVisualSnapshot(trace, 1, dfa);

    expect(snapshot?.previouslyVisitedStateIds).toContain('q0');
    expect(snapshot?.activeStateIds).toContain('q0');
    expect(snapshot?.visitedStateIds).toContain('q0');
  });

  it('resuelve índices unificados para trazas de distinta longitud', () => {
    const dfa = loopDfa();
    const nfa: Automaton = {
      ...dfa,
      id: 'nfa-loop',
      type: 'nfa',
      states: [
        ...dfa.states,
        {
          id: 'q1',
          name: 'q1',
          isInitial: false,
          isAccepting: false,
          position: { x: 80, y: 0 },
        },
      ],
      transitions: [
        ...dfa.transitions,
        {
          id: 't-extra',
          from: 'q0',
          to: 'q1',
          symbol: 'a',
          isEpsilon: false,
        },
      ],
    };

    const nfaTrace = buildSimulationTrace(nfa, 'a');
    const dfaTrace = buildSimulationTrace(dfa, 'a');
    const total = unifiedSimulationStepCount(nfaTrace, dfaTrace);

    expect(total).toBeGreaterThanOrEqual(dfaTrace.steps.length);
    expect(resolveTraceStepIndex(dfaTrace, total - 1)).toBe(
      dfaTrace.steps.length - 1
    );
  });
});
