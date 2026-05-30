import { describe, expect, it } from 'vitest';
import type { Grammar } from 'types/grammar';
import { generateId } from '../../automata/factory';
import { parseGrammarInput } from '../classifyGrammar';
import {
  DEFAULT_DERIVATION_LIMITS,
  deriveWord,
  matchesSententialFormTarget,
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
      { id: 'p1', left: ['S'], right: ['a', 'S', 'a'] },
      { id: 'p2', left: ['S'], right: ['b', 'S', 'b'] },
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

function palindromeGrammarFromPreset(): Grammar {
  const parsed = parseGrammarInput({
    selectedType: 2,
    variablesText: 'S',
    terminalsText: 'a, b',
    startSymbol: 'S',
    productionsText: 'S -> aSa | bSb | a | b | ε',
  });
  if (!parsed.grammar) throw new Error('gramática de palíndromos inválida');
  return parsed.grammar;
}

describe('deriveWord — palíndromos (Tipo 2)', () => {
  const words = ['', 'a', 'b', 'aa', 'bb', 'aba', 'bab', 'abba', 'baab'] as const;

  it.each(words)('deriva «%s» con la gramática clásica', (word) => {
    const result = deriveWord(cfgPalindromes(), word, 2);
    expect(result.status).toBe('found');
    expect(result.steps.at(-1)?.display).toBe(word.length === 0 ? 'ε' : word);
    expect(result.tree).not.toBeNull();
  });

  it.each(words.filter((w) => w.length > 0))(
    'deriva «%s» con el ejemplo precargado (parseado)',
    (word) => {
      const grammar = palindromeGrammarFromPreset();
      const result = deriveWord(grammar, word, 2);
      expect(result.status).toBe('found');
    }
  );

  it('deriva ε con alias epsilon en el objetivo', () => {
    const result = deriveWord(cfgPalindromes(), 'epsilon', 2);
    expect(result.status).toBe('found');
    expect(result.steps.at(-1)?.display).toBe('ε');
  });

  it('no afirma imposibilidad cuando solo se agota el límite de pasos', () => {
    const result = deriveWord(cfgPalindromes(), 'aba', 2, {
      ...DEFAULT_DERIVATION_LIMITS,
      maxSteps: 1,
    });
    expect(result.status).toBe('not_found');
    expect(result.message).toContain('dentro del límite configurado');
    expect(result.message).toContain('no implica');
  });
});

describe('deriveWord — regular (Tipo 3)', () => {
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
});

describe('matchesSententialFormTarget', () => {
  const vars = new Set(['S', 'A']);

  it('permite variables entre terminales ya fijados (palíndromos)', () => {
    expect(matchesSententialFormTarget(['a', 'S', 'a'], 'aba', vars)).toBe(true);
  });

  it('poda cadenas incompatibles por prefijo', () => {
    expect(matchesSententialFormTarget(['a', 'S'], 'ab', vars)).toBe(true);
    expect(matchesSententialFormTarget(['b', 'S'], 'ab', vars)).toBe(false);
  });

  it('coincide con matchesTerminalPrefix en formas lineales', () => {
    expect(matchesTerminalPrefix(['a', 'S'], 'ab', vars)).toBe(
      matchesSententialFormTarget(['a', 'S'], 'ab', vars)
    );
  });
});
