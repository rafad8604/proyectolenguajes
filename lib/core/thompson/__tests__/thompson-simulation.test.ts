import { describe, expect, it } from 'vitest';
import { buildNfaFromRegex } from '../build-nfa';
import { validateThompsonNfa, hasThompsonValidationErrors } from '../validate-thompson-nfa';
import { convertNfaToDfa } from 'lib/core/automata/nfa-to-dfa';
import { checkEquivalenceOnSamples } from 'lib/core/automata/equivalence-check';
import { compareSimulations } from 'lib/core/automata/compare-simulations';
import { MAX_SIMULATION_STEPS } from 'lib/core/automata/simulation';

const REGEX_CASES = [
  {
    regex: 'a*',
    samples: ['', 'a', 'aaa', 'b'],
    expected: ['accepted', 'accepted', 'accepted', 'rejected'] as const,
  },
  {
    regex: 'ab',
    samples: ['ab', 'a', 'aba'],
    expected: ['accepted', 'rejected', 'rejected'] as const,
  },
  {
    regex: '(a|b)*',
    samples: ['', 'abba', 'c'],
    expected: ['accepted', 'accepted', 'rejected'] as const,
  },
  {
    regex: 'a+b?',
    samples: ['a', 'aa', 'ab', ''],
    expected: ['accepted', 'accepted', 'accepted', 'rejected'] as const,
  },
  {
    regex: '(ab|ba)*',
    samples: ['', 'ab', 'ba', 'abba'],
    expected: ['accepted', 'accepted', 'accepted', 'accepted'] as const,
  },
] as const;

describe('Thompson NFA build and validation', () => {
  for (const { regex } of REGEX_CASES) {
    it(`builds NFA for ${regex}`, () => {
      const result = buildNfaFromRegex(regex);
      expect(result.error).toBeUndefined();
      expect(result.automaton.states.length).toBeGreaterThan(0);
      expect(result.automaton.transitions.length).toBeGreaterThan(0);
      expect(result.automaton.initialStateId).not.toBeNull();
      expect(result.automaton.acceptingStateIds).toHaveLength(1);
    });

    it(`validates Thompson NFA for ${regex}`, () => {
      const { automaton } = buildNfaFromRegex(regex);
      const results = validateThompsonNfa(automaton);
      expect(hasThompsonValidationErrors(results)).toBe(false);
    });
  }
});

describe('NFA to DFA conversion', () => {
  for (const { regex } of REGEX_CASES) {
    it(`converts NFA to DFA for ${regex}`, () => {
      const { automaton: nfa } = buildNfaFromRegex(regex);
      const conversion = convertNfaToDfa(nfa);
      expect(conversion.error).toBeUndefined();
      expect(conversion.dfa.type).toBe('dfa');
      expect(conversion.dfa.states.length).toBeGreaterThan(0);
      expect(conversion.dfa.initialStateId).not.toBeNull();
    });
  }
});

describe('NFA/DFA equivalence on samples', () => {
  for (const { regex, samples, expected } of REGEX_CASES) {
    it(`equivalent outcomes for ${regex}`, () => {
      const { automaton: nfa } = buildNfaFromRegex(regex);
      const { dfa } = convertNfaToDfa(nfa);
      const check = checkEquivalenceOnSamples(nfa, dfa, [...samples]);
      expect(check.allMatch).toBe(true);
      check.samples.forEach((s, i) => {
        expect(s.nfaOutcome).toBe(expected[i]);
        expect(s.dfaOutcome).toBe(expected[i]);
      });
    });
  }
});

describe('compareSimulations', () => {
  it('reports matching outcomes for (a|b)*abb on aabb', () => {
    const { automaton: nfa } = buildNfaFromRegex('(a|b)*abb');
    const { dfa } = convertNfaToDfa(nfa);
    const cmp = compareSimulations(nfa, dfa, 'aabb');
    expect(cmp.outcomesMatch).toBe(true);
    expect(cmp.nfaOutcome).toBe('accepted');
    expect(cmp.dfaOutcome).toBe('accepted');
  });
});

describe('simulation safety', () => {
  it('exports MAX_SIMULATION_STEPS', () => {
    expect(MAX_SIMULATION_STEPS).toBeGreaterThan(0);
  });
});
