import { describe, expect, it } from 'vitest';
import { parseGrammarInput, validateAndClassify } from '../classifyGrammar';

describe('parseGrammarInput por tipo de Chomsky', () => {
  it('Tipo 2: rechaza terminales en el lado izquierdo', () => {
    const result = parseGrammarInput({
      selectedType: 2,
      variablesText: 'S, A',
      terminalsText: 'a',
      startSymbol: 'S',
      productionsText: 'aA -> aa',
    });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.message.includes('Tipo 2'))).toBe(true);
  });

  it('Tipo 1: acepta contexto con terminales en el lado izquierdo', () => {
    const result = parseGrammarInput({
      selectedType: 1,
      variablesText: 'S, A',
      terminalsText: 'a, b',
      startSymbol: 'S',
      productionsText: 'S -> aSA | ε\naA -> aa',
    });
    expect(result.valid).toBe(true);
    expect(result.grammar?.productions.some((p) => p.left.join('') === 'aA')).toBe(
      true
    );
  });

  it('Tipo 1: acepta la CSG clásica con bB -> bb', () => {
    const result = parseGrammarInput({
      selectedType: 1,
      variablesText: 'S, A, B, C',
      terminalsText: 'a, b, c',
      startSymbol: 'S',
      productionsText:
        'S -> aSBC | abc\nCB -> BC\nbB -> bb\nbC -> bc\ncC -> cc',
    });
    expect(result.valid).toBe(true);
  });

  it('Tipo 0: acepta producciones que acortan (AB -> a)', () => {
    const { validation, classification } = validateAndClassify({
      selectedType: 0,
      variablesText: 'S, A, B',
      terminalsText: 'a, b',
      startSymbol: 'S',
      productionsText: 'S -> aAB\nAB -> a',
    });
    expect(validation.valid).toBe(true);
    expect(classification?.selectedTypeCheck?.belongs).toBe(true);
    expect(classification?.inferredType).toBe(0);
  });

  it('Tipo 3: acepta gramática regular derecha', () => {
    const { validation, classification } = validateAndClassify({
      selectedType: 3,
      variablesText: 'S, A',
      terminalsText: 'a, b',
      startSymbol: 'S',
      productionsText: 'S -> aA | b\nA -> aA | b',
    });
    expect(validation.valid).toBe(true);
    expect(classification?.selectedTypeCheck?.belongs).toBe(true);
    expect(classification?.inferredType).toBe(3);
  });

  it('Tipo 0: rechaza lado izquierdo sin variables', () => {
    const result = parseGrammarInput({
      selectedType: 0,
      variablesText: 'S',
      terminalsText: 'a, b',
      startSymbol: 'S',
      productionsText: 'ab -> ba',
    });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.message.includes('Tipo 0'))).toBe(true);
  });
});

describe('classifyGrammar', () => {
  it('marca Tipo 1 cuando AB -> a viola longitud pero Tipo 0 sí cumple', () => {
    const { classification } = validateAndClassify({
      selectedType: 0,
      variablesText: 'S, A, B',
      terminalsText: 'a',
      startSymbol: 'S',
      productionsText: 'S -> aAB\nAB -> a',
    });
    const t1 = classification?.hierarchy.find((h) => h.type === 1);
    const t0 = classification?.hierarchy.find((h) => h.type === 0);
    expect(t1?.belongs).toBe(false);
    expect(t0?.belongs).toBe(true);
  });
});
