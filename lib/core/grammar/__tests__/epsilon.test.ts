import { describe, expect, it } from 'vitest';
import {
  epsilonAliasLengthAt,
  isEpsilonAlias,
  normalizeDerivationTarget,
} from '../epsilon';

describe('isEpsilonAlias', () => {
  it.each(['ε', 'λ', 'epsilon', 'Epsilon', 'EPSILON', 'lambda', 'Lambda', 'LAMBDA', ''])(
    'acepta %j',
    (value) => {
      expect(isEpsilonAlias(value)).toBe(true);
    }
  );

  it('rechaza símbolos que no son vacío', () => {
    expect(isEpsilonAlias('aab')).toBe(false);
  });
});

describe('epsilonAliasLengthAt', () => {
  it('no coincide epsilon dentro de un identificador', () => {
    expect(epsilonAliasLengthAt('myepsilon', 2)).toBeNull();
  });

  it('coincide epsilon como palabra', () => {
    expect(epsilonAliasLengthAt('a epsilon b', 2)).toBe(7);
  });
});

describe('normalizeDerivationTarget', () => {
  it('convierte alias a cadena vacía', () => {
    expect(normalizeDerivationTarget('lambda')).toEqual({
      target: '',
      aliasUsed: true,
    });
  });
});
