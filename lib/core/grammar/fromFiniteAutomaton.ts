import type { Automaton } from 'types/automaton';
import type { Grammar, Production } from 'types/grammar';
import { deriveAlphabet } from '../automata/alphabet';
import { generateId } from '../automata/factory';
import { EPSILON_SYMBOL } from '../automata/constants';

export interface GrammarFromAutomatonResult {
  grammar: Grammar;
  /** Explicación pedagógica paso a paso en español. */
  explanation: string[];
  warnings: string[];
  error?: string;
}

function stateVariable(automaton: Automaton, stateId: string): string {
  return automaton.states.find((s) => s.id === stateId)?.name ?? stateId;
}

function formatProductionRight(production: Production): string {
  if (production.right.length === 0) return EPSILON_SYMBOL;
  if (production.right.length === 1 && production.right[0] === null) {
    return EPSILON_SYMBOL;
  }
  return production.right
    .map((sym) => (sym === null ? EPSILON_SYMBOL : sym))
    .join('');
}

/** Agrupa producciones por variable y las formatea como texto. */
export function formatGrammarAsText(grammar: Grammar): string {
  const lines: string[] = [
    `Gramática G = (V, Σ, P, ${grammar.startSymbol})`,
    `V = {${grammar.variables.join(', ')}}`,
    `Σ = {${grammar.terminals.join(', ')}}`,
    `Símbolo inicial: ${grammar.startSymbol}`,
    '',
    'Producciones P:',
  ];

  const byVariable = new Map<string, Production[]>();
  for (const p of grammar.productions) {
    const v = p.left[0];
    if (!byVariable.has(v)) byVariable.set(v, []);
    byVariable.get(v)!.push(p);
  }

  for (const variable of grammar.variables) {
    const prods = byVariable.get(variable) ?? [];
    if (prods.length === 0) continue;
    const alternatives = prods.map(formatProductionRight).join(' | ');
    lines.push(`${variable} → ${alternatives}`);
  }

  return lines.join('\n');
}

/**
 * Genera una gramática regular derecha equivalente a un AFD o AFND.
 *
 * Reglas aplicadas:
 * - Cada estado q se convierte en variable Q (usando el nombre del estado).
 * - Transición q --a--> p  ⇒  Q → aP
 * - Transición q --ε--> p  ⇒  Q → P  (solo variables; documentado para AFND)
 * - Si q es final         ⇒  Q → ε
 * - El estado inicial es el símbolo inicial S.
 */
export function grammarFromFiniteAutomaton(
  automaton: Automaton
): GrammarFromAutomatonResult {
  const explanation: string[] = [];
  const warnings: string[] = [];

  if (automaton.states.length === 0) {
    return {
      grammar: emptyGrammar(),
      explanation: [],
      warnings: [],
      error: 'El autómata no tiene estados.',
    };
  }

  if (!automaton.initialStateId) {
    return {
      grammar: emptyGrammar(),
      explanation: [],
      warnings: [],
      error: 'El autómata debe tener un estado inicial para definir S.',
    };
  }

  const variables = automaton.states.map((s) => s.name);
  const variableSet = new Set(variables);
  if (variableSet.size !== variables.length) {
    warnings.push(
      'Hay nombres de estado duplicados; las variables de la gramática podrían colisionar.'
    );
  }

  const terminals = deriveAlphabet(automaton);
  const startSymbol = stateVariable(automaton, automaton.initialStateId);
  const productions: Production[] = [];

  explanation.push(
    'Se construye una gramática regular derecha equivalente al autómata finito.'
  );
  explanation.push(
    `Cada estado del autómata se convierte en una variable: V = {${variables.join(', ')}}.`
  );
  explanation.push(
    `El alfabeto de terminales es Σ = {${terminals.length > 0 ? terminals.join(', ') : '∅'}} (símbolos de las transiciones no ε).`
  );
  explanation.push(
    `El estado inicial ${startSymbol} es el símbolo inicial S de la gramática.`
  );

  if (automaton.type === 'nfa') {
    explanation.push(
      'Para un AFND, cada transición genera una producción independiente; si hay varias transiciones con el mismo símbolo desde un estado, aparecen como alternativas Q → aP₁ | aP₂ | …'
    );
    const hasEpsilon = automaton.transitions.some((t) => t.isEpsilon);
    if (hasEpsilon) {
      explanation.push(
        `Las transiciones ε se modelan como producciones sin terminal: Q → P (equivalente a moverse sin consumir entrada). En notación: Q → ${EPSILON_SYMBOL}P no se usa; se escribe Q → P.`
      );
      warnings.push(
        'Esta gramática incluye producciones solo con variables (por ε). Sigue siendo regular (tipo 3) si se interpreta como gramática derecha con movimientos ε explícitos en el autómata.'
      );
    }
  }

  for (const state of automaton.states) {
    const Q = state.name;
    const stateTransitions = automaton.transitions.filter(
      (t) => t.from === state.id
    );

    for (const t of stateTransitions) {
      const P = stateVariable(automaton, t.to);
      if (t.isEpsilon) {
        productions.push({
          id: generateId('prod'),
          left: [Q],
          right: [P],
        });
      } else {
        productions.push({
          id: generateId('prod'),
          left: [Q],
          right: [t.symbol, P],
        });
      }
    }

    if (automaton.acceptingStateIds.includes(state.id)) {
      productions.push({
        id: generateId('prod'),
        left: [Q],
        right: [null],
      });
      explanation.push(
        `${Q} es estado final → se agrega la producción ${Q} → ${EPSILON_SYMBOL}.`
      );
    }
  }

  explanation.push(
    `Se generaron ${productions.length} producción(es) en total (transiciones + producciones ε para estados finales).`
  );
  explanation.push(
    'La gramática resultante es de tipo 3 (regular) en forma derecha: A → aB, A → a o A → ε.'
  );

  const grammar: Grammar = {
    id: generateId('grammar'),
    name: `Gramática de ${automaton.name}`,
    variables,
    terminals,
    startSymbol,
    productions,
    chomskyType: 3,
  };

  return { grammar, explanation, warnings };
}

function emptyGrammar(): Grammar {
  return {
    id: generateId('grammar'),
    name: 'Gramática vacía',
    variables: [],
    terminals: [],
    startSymbol: '',
    productions: [],
  };
}
