import { describe, expect, it } from 'vitest';
import {
  normalizeMathOperators,
  validateLanguageNotation,
} from '../language-notation';

describe('normalizeMathOperators', () => {
  it('convierte Unicode a ASCII', () => {
    expect(normalizeMathOperators('n ≥ 0')).toBe('n >= 0');
    expect(normalizeMathOperators('m ≤ n')).toBe('m <= n');
    expect(normalizeMathOperators('x ≠ y')).toBe('x != y');
  });

  it('no altera operadores ASCII ya presentes', () => {
    expect(normalizeMathOperators('n >= 0')).toBe('n >= 0');
    expect(normalizeMathOperators('|w| >= p')).toBe('|w| >= p');
  });
});

describe('validateLanguageNotation', () => {
  it('acepta condiciones con >=, <=, >, <, =, !=', () => {
    for (const expr of [
      'n >= 0',
      'm >= n',
      '|w| >= p',
      'n <= 10',
      'x != y',
      'a > b',
      'a < b',
      'k = 0',
    ]) {
      const r = validateLanguageNotation(`L = { a^n b^n | ${expr} }`);
      expect(r.valid, expr).toBe(true);
      expect(r.error).toBeUndefined();
    }
  });

  it('acepta ejemplos precargados del asistente', () => {
    const examples = [
      'L = { a^n b^n | n >= 0 }',
      'L = { a^n b^m | n >= m }',
      'L = { ww | |w| >= 1 }',
      'L = { w ∈ {a,b}* | w es palíndromo }',
    ];
    for (const lang of examples) {
      expect(validateLanguageNotation(lang).valid).toBe(true);
    }
  });

  it('acepta cadena vacía', () => {
    expect(validateLanguageNotation('').valid).toBe(true);
    expect(validateLanguageNotation('   ').valid).toBe(true);
  });

  it('rechaza llaves desbalanceadas', () => {
    const r = validateLanguageNotation('L = { a^n b^n | n >= 0');
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/llaves/i);
  });

  it('rechaza operador incompleto al final', () => {
    const r = validateLanguageNotation('n >=');
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/incompleto/i);
  });

  it('normaliza en resultado válido', () => {
    const r = validateLanguageNotation('L = { a^n | n ≥ 0 }');
    expect(r.valid).toBe(true);
    expect(r.normalized).toContain('>=');
  });
});
