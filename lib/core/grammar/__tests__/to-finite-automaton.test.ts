import { describe, expect, it } from 'vitest';
import { buildSimulationTrace } from '../../automata/simulation';
import { parseGrammarInput } from '../classifyGrammar';
import { finiteAutomatonFromRegularGrammar } from '../toFiniteAutomaton';

function grammarFromText(productionsText: string) {
  const parsed = parseGrammarInput({
    selectedType: 3,
    variablesText: productionsText.includes('A') ? 'S, A' : 'S',
    terminalsText: 'a, b',
    startSymbol: 'S',
    productionsText,
  });
  if (!parsed.grammar) throw new Error(parsed.issues.map((i) => i.message).join('; '));
  return parsed.grammar;
}

describe('finiteAutomatonFromRegularGrammar', () => {
  it('convierte S -> aA | b y A -> aA | b | epsilon', () => {
    const grammar = grammarFromText('S -> aA | b\nA -> aA | b | epsilon');
    const { automaton, error } = finiteAutomatonFromRegularGrammar(grammar);
    expect(error).toBeUndefined();
    expect(automaton.type).toBe('nfa');
    expect(automaton.states.map((s) => s.name).sort()).toEqual(
      expect.arrayContaining(['S', 'A', 'qf'])
    );

    const fromS = automaton.transitions.filter(
      (t) => automaton.states.find((s) => s.id === t.from)?.name === 'S'
    );
    expect(fromS.some((t) => t.symbol === 'a' && automaton.states.find((s) => s.id === t.to)?.name === 'A')).toBe(true);
    expect(fromS.some((t) => t.symbol === 'b' && automaton.acceptingStateIds.includes(t.to))).toBe(true);

    const stateA = automaton.states.find((s) => s.name === 'A')!;
    expect(automaton.acceptingStateIds).toContain(stateA.id);

    const sim = buildSimulationTrace(automaton, 'aab');
    expect(sim.finalOutcome).toBe('accepted');
  });

  it('convierte S -> aS | bA y A -> b', () => {
    const grammar = grammarFromText('S -> aS | bA\nA -> b');
    const { automaton, error } = finiteAutomatonFromRegularGrammar(grammar);
    expect(error).toBeUndefined();

    const simAbb = buildSimulationTrace(automaton, 'abb');
    expect(simAbb.finalOutcome).toBe('accepted');

    const simBb = buildSimulationTrace(automaton, 'bb');
    expect(simBb.finalOutcome).toBe('accepted');

    const simSingleB = buildSimulationTrace(automaton, 'b');
    expect(simSingleB.finalOutcome).toBe('rejected');
  });

  it('rechaza gramática no regular (libre de contexto)', () => {
    const parsed = parseGrammarInput({
      selectedType: 2,
      variablesText: 'S',
      terminalsText: 'a, b',
      startSymbol: 'S',
      productionsText: 'S -> aSb | b',
    });
    expect(parsed.grammar).toBeTruthy();
    const { error } = finiteAutomatonFromRegularGrammar(parsed.grammar!);
    expect(error).toContain('no es regular');
  });

  it('rechaza gramática lineal por la izquierda', () => {
    const parsed = parseGrammarInput({
      selectedType: 2,
      variablesText: 'S, A',
      terminalsText: 'a, b',
      startSymbol: 'S',
      productionsText: 'S -> Aa | b\nA -> b',
    });
    expect(parsed.grammar).toBeTruthy();
    const { error } = finiteAutomatonFromRegularGrammar(parsed.grammar!);
    expect(error).toContain('por la derecha');
  });
});
