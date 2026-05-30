import type { Automaton } from 'types/automaton';
import type { Grammar, Production } from 'types/grammar';
import type { State } from 'types/state';
import type { Transition } from 'types/transition';
import { deriveAlphabet } from '../automata/alphabet';
import { EPSILON_SYMBOL } from '../automata/constants';
import {
  createState,
  createTransition,
  generateId,
  nextStateName,
} from '../automata/factory';
import { formatProd } from './chomsky-validation';
import {
  checkType3,
  getRegularGrammarOrientation,
} from './chomsky-validation';

export const NOT_REGULAR_MESSAGE =
  'Esta gramática no es regular; no se puede convertir de forma equivalente a un autómata finito.';

export const NOT_RIGHT_LINEAR_MESSAGE =
  'La conversión a autómata requiere gramática regular por la derecha (A → aB, A → a o A → ε). Esta gramática no está en esa forma (p. ej. es lineal por la izquierda o mezcla ambos sentidos).';

export interface AutomatonFromGrammarResult {
  automaton: Automaton;
  explanation: string[];
  warnings: string[];
  error?: string;
}

interface ParsedRightSide {
  terminals: string[];
  trailingVariable: string | null;
}

function isEpsilonProduction(prod: Production): boolean {
  return prod.right.length === 0 || (prod.right.length === 1 && prod.right[0] === null);
}

function parseRightLinearRight(
  prod: Production,
  variables: Set<string>
): ParsedRightSide {
  if (isEpsilonProduction(prod)) {
    return { terminals: [], trailingVariable: null };
  }

  const symbols = prod.right.filter((s): s is string => s !== null);
  if (symbols.length === 0) {
    return { terminals: [], trailingVariable: null };
  }

  const last = symbols[symbols.length - 1]!;
  if (variables.has(last)) {
    return {
      terminals: symbols.slice(0, -1),
      trailingVariable: last,
    };
  }

  return { terminals: symbols, trailingVariable: null };
}

function freshSinkName(variables: Set<string>): string {
  for (const candidate of ['qf', 'q_accept', 'qF']) {
    if (!variables.has(candidate)) return candidate;
  }
  return 'qf';
}

function layoutVariableStates(
  grammar: Grammar,
  varToStateId: Map<string, string>,
  states: State[],
  sink: State
): void {
  grammar.variables.forEach((variable, index) => {
    const id = varToStateId.get(variable);
    const state = states.find((s) => s.id === id);
    if (state) {
      state.position = { x: 80 + index * 140, y: 120 };
    }
  });
  sink.position = { x: 80 + grammar.variables.length * 140, y: 120 };
}

/**
 * Convierte una gramática regular **por la derecha** en un AFND equivalente.
 *
 * - A → aB   ⇒  δ(A, a) ∋ B
 * - A → a    ⇒  δ(A, a) ∋ qf  (estado final nuevo)
 * - A → ε    ⇒  A ∈ F
 * - A → B    ⇒  δ(A, ε) ∋ B  (solo variables en el lado derecho)
 */
export function finiteAutomatonFromRegularGrammar(
  grammar: Grammar
): AutomatonFromGrammarResult {
  const explanation: string[] = [];
  const warnings: string[] = [];

  if (grammar.productions.length === 0) {
    return {
      automaton: emptyAutomaton(grammar.name),
      explanation: [],
      warnings: [],
      error: 'La gramática no tiene producciones.',
    };
  }

  const variables = new Set(grammar.variables);
  const terminals = new Set(grammar.terminals);
  const type3 = checkType3(grammar, variables, terminals);

  if (!type3.belongs) {
    return {
      automaton: emptyAutomaton(grammar.name),
      explanation: [],
      warnings: [],
      error: NOT_REGULAR_MESSAGE,
    };
  }

  const orientation = getRegularGrammarOrientation(grammar);
  if (orientation !== 'right') {
    return {
      automaton: emptyAutomaton(grammar.name),
      explanation: [],
      warnings: [],
      error:
        orientation === 'left'
          ? NOT_RIGHT_LINEAR_MESSAGE
          : 'La gramática mezcla producciones lineales por la derecha y por la izquierda; unifica la forma antes de convertir.',
    };
  }

  if (!grammar.startSymbol || !variables.has(grammar.startSymbol)) {
    return {
      automaton: emptyAutomaton(grammar.name),
      explanation: [],
      warnings: [],
      error: 'Falta un símbolo inicial válido en V.',
    };
  }

  const states: State[] = [];
  const transitions: Transition[] = [];
  const varToStateId = new Map<string, string>();

  for (const variable of grammar.variables) {
    const state = createState(states);
    state.name = variable;
    states.push(state);
    varToStateId.set(variable, state.id);
  }

  const sinkName = freshSinkName(variables);
  const sinkState = createState(states);
  sinkState.name = sinkName;
  sinkState.isAccepting = true;
  states.push(sinkState);
  const sinkId = sinkState.id;

  const initialId = varToStateId.get(grammar.startSymbol)!;
  for (const state of states) {
    state.isInitial = state.id === initialId;
  }

  explanation.push(
    'Se construye un AFND equivalente a la gramática regular por la derecha.'
  );
  explanation.push(
    `Cada variable de V se convierte en un estado; el símbolo inicial ${grammar.startSymbol} es q₀.`
  );
  explanation.push(
    `Las producciones A → aB se convierten en transiciones A --a--> B; A → a en A --a--> ${sinkName} (estado final); A → ε marca A como final.`
  );

  const addTransition = (
    fromVar: string,
    symbol: string,
    toStateId: string,
    isEpsilon = false
  ) => {
    const fromId = varToStateId.get(fromVar);
    if (!fromId) return;
    transitions.push(createTransition(fromId, toStateId, symbol, isEpsilon));
  };

  for (const prod of grammar.productions) {
    const A = prod.left[0]!;
    if (!variables.has(A)) continue;

    if (isEpsilonProduction(prod)) {
      const state = states.find((s) => s.id === varToStateId.get(A));
      if (state) state.isAccepting = true;
      explanation.push(`${formatProd(prod)} → el estado ${A} es final.`);
      continue;
    }

    const { terminals: ts, trailingVariable } = parseRightLinearRight(
      prod,
      variables
    );

    if (ts.length === 0 && trailingVariable) {
      const toId = varToStateId.get(trailingVariable)!;
      addTransition(A, '', toId, true);
      explanation.push(
        `${formatProd(prod)} → transición ε de ${A} a ${trailingVariable}.`
      );
      continue;
    }

    const finalTargetId = trailingVariable
      ? varToStateId.get(trailingVariable)!
      : sinkId;

    let currentFromId = varToStateId.get(A)!;

    for (let i = 0; i < ts.length; i++) {
      const symbol = ts[i]!;
      const isLast = i === ts.length - 1;

      if (isLast) {
        transitions.push(
          createTransition(currentFromId, finalTargetId, symbol, false)
        );
      } else {
        const mid = createState(states);
        mid.name = nextStateName(states);
        mid.position = {
          x: 80 + states.length * 40,
          y: 220 + (i % 3) * 60,
        };
        states.push(mid);
        transitions.push(
          createTransition(currentFromId, mid.id, symbol, false)
        );
        currentFromId = mid.id;
      }
    }

    if (ts.length > 0) {
      const fromName = A;
      const dest = trailingVariable ?? sinkName;
      const label =
        ts.length === 1
          ? `${fromName} --${ts[0]}--> ${dest}`
          : `${fromName} --${ts.join('')}--> ${dest}`;
      explanation.push(`${formatProd(prod)} → transición ${label}.`);
    }
  }

  layoutVariableStates(grammar, varToStateId, states, sinkState);

  const acceptingStateIds = states.filter((s) => s.isAccepting).map((s) => s.id);

  const automaton: Automaton = {
    id: generateId('auto'),
    name: `AFND de ${grammar.name}`,
    type: 'nfa',
    alphabet: [],
    states,
    transitions,
    initialStateId: initialId,
    acceptingStateIds,
  };

  automaton.alphabet = deriveAlphabet(automaton);

  if (automaton.transitions.length === 0 && automaton.acceptingStateIds.length === 0) {
    warnings.push('No se generaron transiciones; revisa que las producciones tengan forma A → aB, A → a o A → ε.');
  }

  const hasNondeterminism = automaton.transitions.some((t1, i) =>
    automaton.transitions.some(
      (t2, j) =>
        i < j &&
        t1.from === t2.from &&
        t1.symbol === t2.symbol &&
        !t1.isEpsilon &&
        !t2.isEpsilon
    )
  );
  if (hasNondeterminism) {
    explanation.push(
      'El autómata es un AFND: varias transiciones con el mismo símbolo salen de un mismo estado (por las alternativas de la gramática).'
    );
  }

  explanation.push(
    `Resultado: ${automaton.states.length} estado(s), ${automaton.transitions.length} transición(es).`
  );

  return { automaton, explanation, warnings };
}

function emptyAutomaton(name: string): Automaton {
  return {
    id: generateId('auto'),
    name: `AFND de ${name}`,
    type: 'nfa',
    alphabet: [],
    states: [],
    transitions: [],
    initialStateId: null,
    acceptingStateIds: [],
  };
}
