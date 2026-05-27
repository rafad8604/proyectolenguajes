import { describe, expect, it } from 'vitest';
import type { Grammar } from 'types/grammar';
import { generateId } from '../../automata/factory';
import {
  DEFAULT_DERIVATION_LIMITS,
  deriveWord,
  matchesTerminalPrefix,
} from '../derive-word';

function cfgPalindromes(): Grammar {
  return {
    id: generateId('grammar'),
    name: 'Palíndromos',
    variables: ['S'],
    terminals: ['a', 'b'],
    startSymbol: 'S',
    chomskyType: 2,
    productions: [
      { id: 'p1', left: ['S'], right: ['a', 'S', 'b'] },
      { id: 'p2', left: ['S'], right: ['b', 'S', 'a'] },
      { id: 'p3', left: ['S'], right: ['a'] },
      { id: 'p4', left: ['S'], right: ['b'] },
      { id: 'p5', left: ['S'], right: [null] },
    ],
  };
}

function regularGrammar(): Grammar {
  return {
    id: generateId('grammar'),
    name: 'Regular',
    variables: ['S', 'A'],
    terminals: ['a', 'b'],
    startSymbol: 'S',
    chomskyType: 3,
    productions: [
      { id: 'p1', left: ['S'], right: ['a', 'A'] },
      { id: 'p2', left: ['S'], right: ['b'] },
      { id: 'p3', left: ['A'], right: ['a', 'A'] },
      { id: 'p4', left: ['A'], right: ['b'] },
    ],
  };
}

describe('deriveWord', () => {
  it('deriva ab en gramática libre de contexto (palíndromos)', () => {
    const result = deriveWord(cfgPalindromes(), 'ab', 2);
    expect(result.status).toBe('found');
    expect(result.steps[0]?.display).toBe('S');
    expect(result.steps.at(-1)?.display).toBe('ab');
    expect(result.tree).not.toBeNull();
  });

  it('deriva aab en gramática regular', () => {
    const result = deriveWord(regularGrammar(), 'aab', 3);
    expect(result.status).toBe('found');
    expect(result.steps.at(-1)?.display).toBe('aab');
    expect(result.tree).not.toBeNull();
  });

  it('rechaza símbolos fuera del alfabeto', () => {
    const result = deriveWord(regularGrammar(), 'aac', 3);
    expect(result.status).toBe('invalid_target');
  });

  it('informa cuando no hay derivación dentro del límite', () => {
    const result = deriveWord(regularGrammar(), 'aab', 3, {
      ...DEFAULT_DERIVATION_LIMITS,
      maxSteps: 1,
    });
    expect(result.status).toBe('not_found');
  });

  it('matchesTerminalPrefix poda cadenas incompatibles', () => {
    const vars = new Set(['S', 'A']);
    expect(matchesTerminalPrefix(['a', 'S'], 'ab', vars)).toBe(true);
    expect(matchesTerminalPrefix(['b', 'S'], 'ab', vars)).toBe(false);
  });
});
