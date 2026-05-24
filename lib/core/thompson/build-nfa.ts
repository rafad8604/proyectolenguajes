import type { Automaton } from 'types/automaton';
import type { State } from 'types/state';
import type { Transition } from 'types/transition';
import { generateId } from 'lib/core/automata/factory';
import type { Token } from './tokenizer';
import { tokenize, normalizeTokens } from './tokenizer';
import { toPostfix } from './postfix';

export interface ThompsonBuildStep {
  index: number;
  description: string;
  postfixSoFar: string;
}

export interface ThompsonResult {
  automaton: Automaton;
  rawInput: string;
  tokens: Token[];
  normalized: string;
  postfix: string[];
  steps: ThompsonBuildStep[];
  error?: string;
}

interface NfaFragment {
  startStateId: string;
  endStateId: string;
  states: State[];
  transitions: Transition[];
}

let stateCounter = 0;

function newState(name?: string): State {
  const id = generateId('th');
  const label = name ?? `q${stateCounter++}`;
  return {
    id,
    name: label,
    isInitial: false,
    isAccepting: false,
    position: { x: 80 + (stateCounter % 6) * 90, y: 80 + Math.floor(stateCounter / 6) * 80 },
  };
}

function epsTransition(from: string, to: string): Transition {
  return {
    id: generateId('th_t'),
    from,
    to,
    symbol: '',
    isEpsilon: true,
  };
}

function symTransition(from: string, to: string, symbol: string): Transition {
  return {
    id: generateId('th_t'),
    from,
    to,
    symbol,
    isEpsilon: false,
  };
}

function fragmentForChar(ch: string): NfaFragment {
  const s = newState();
  const e = newState();
  const t = ch === 'ε' ? epsTransition(s.id, e.id) : symTransition(s.id, e.id, ch);
  return { startStateId: s.id, endStateId: e.id, states: [s, e], transitions: [t] };
}

function concat(a: NfaFragment, b: NfaFragment): NfaFragment {
  return {
    startStateId: a.startStateId,
    endStateId: b.endStateId,
    states: [...a.states, ...b.states],
    transitions: [...a.transitions, epsTransition(a.endStateId, b.startStateId), ...b.transitions],
  };
}

function union(a: NfaFragment, b: NfaFragment): NfaFragment {
  const start = newState();
  const end = newState();
  return {
    startStateId: start.id,
    endStateId: end.id,
    states: [start, end, ...a.states, ...b.states],
    transitions: [
      epsTransition(start.id, a.startStateId),
      epsTransition(start.id, b.startStateId),
      ...a.transitions,
      ...b.transitions,
      epsTransition(a.endStateId, end.id),
      epsTransition(b.endStateId, end.id),
    ],
  };
}

function star(f: NfaFragment): NfaFragment {
  const start = newState();
  const end = newState();
  return {
    startStateId: start.id,
    endStateId: end.id,
    states: [start, end, ...f.states],
    transitions: [
      epsTransition(start.id, f.startStateId),
      epsTransition(start.id, end.id),
      ...f.transitions,
      epsTransition(f.endStateId, f.startStateId),
      epsTransition(f.endStateId, end.id),
    ],
  };
}

function plus(f: NfaFragment): NfaFragment {
  return {
    startStateId: f.startStateId,
    endStateId: f.endStateId,
    states: [...f.states],
    transitions: [...f.transitions, epsTransition(f.endStateId, f.startStateId)],
  };
}

function optional(f: NfaFragment): NfaFragment {
  const start = newState();
  const end = newState();
  return {
    startStateId: start.id,
    endStateId: end.id,
    states: [start, end, ...f.states],
    transitions: [
      epsTransition(start.id, f.startStateId),
      epsTransition(start.id, end.id),
      ...f.transitions,
      epsTransition(f.endStateId, end.id),
    ],
  };
}

function buildFromPostfix(
  postfixTokens: Token[],
  steps: ThompsonBuildStep[]
): { fragment: NfaFragment | null; error?: string } {
  const stack: NfaFragment[] = [];
  let stepIndex = 0;

  const record = (desc: string) => {
    steps.push({
      index: stepIndex++,
      description: desc,
      postfixSoFar: postfixTokens
        .slice(0, Math.min(stepIndex, postfixTokens.length))
        .map((t) => (t.type === 'CONCAT' ? '·' : t.value))
        .join(' '),
    });
  };

  for (const token of postfixTokens) {
    switch (token.type) {
      case 'CHAR':
        stack.push(fragmentForChar(token.value));
        record(`Símbolo «${token.value}»: fragmento básico con transición ${token.value}.`);
        break;
      case 'EPSILON':
        stack.push(fragmentForChar('ε'));
        record('Épsilon ε: fragmento con transición vacía.');
        break;
      case 'CONCAT': {
        if (stack.length < 2) {
          return { fragment: null, error: 'Postfix inválido: concat requiere dos operandos.' };
        }
        const b = stack.pop()!;
        const a = stack.pop()!;
        stack.push(concat(a, b));
        record('Concatenación (·): se conecta el final del primer AFND al inicio del segundo con ε.');
        break;
      }
      case 'UNION': {
        if (stack.length < 2) {
          return { fragment: null, error: 'Postfix inválido: unión requiere dos operandos.' };
        }
        const b = stack.pop()!;
        const a = stack.pop()!;
        stack.push(union(a, b));
        record('Unión (|): nuevo inicio con ε hacia ambos sub-AFND y nuevo final desde ambos.');
        break;
      }
      case 'STAR': {
        if (stack.length < 1) {
          return { fragment: null, error: 'Postfix inválido: * requiere un operando.' };
        }
        stack.push(star(stack.pop()!));
        record('Estrella (*): bucle ε de vuelta y atajo ε al estado final (Kleene).');
        break;
      }
      case 'PLUS': {
        if (stack.length < 1) {
          return { fragment: null, error: 'Postfix inválido: + requiere un operando.' };
        }
        stack.push(plus(stack.pop()!));
        record('Más (+): una o más repeticiones mediante bucle ε al inicio del fragmento.');
        break;
      }
      case 'OPTIONAL': {
        if (stack.length < 1) {
          return { fragment: null, error: 'Postfix inválido: ? requiere un operando.' };
        }
        stack.push(optional(stack.pop()!));
        record('Opcional (?): atajo ε que omite el fragmento.');
        break;
      }
      default:
        break;
    }
  }

  if (stack.length !== 1) {
    return { fragment: null, error: 'La expresión no produce un único AFND.' };
  }

  record('Construcción completada: un único fragmento en la pila.');
  return { fragment: stack[0] };
}

/** Pipeline completo: regex → AFND por construcción de Thompson. */
export function buildNfaFromRegex(input: string): ThompsonResult {
  stateCounter = 0;
  const steps: ThompsonBuildStep[] = [];

  const { tokens: rawTokens, error: tokErr } = tokenize(input);
  if (tokErr) {
    return {
      automaton: emptyAutomaton(input),
      rawInput: input,
      tokens: [],
      normalized: '',
      postfix: [],
      steps: [],
      error: tokErr,
    };
  }

  const { tokens: normTokens, display: normalized } = normalizeTokens(
    rawTokens.filter((t) => t.type !== 'EOF')
  );

  const { postfix, tokens: postfixTokens, error: postErr } = toPostfix(normTokens);
  if (postErr) {
    return {
      automaton: emptyAutomaton(input),
      rawInput: input,
      tokens: rawTokens.filter((t) => t.type !== 'EOF'),
      normalized,
      postfix: [],
      steps: [],
      error: postErr,
    };
  }

  steps.push({
    index: 0,
    description: `Expresión normalizada: ${normalized}. Postfix: ${postfix.join(' ')}.`,
    postfixSoFar: '',
  });

  const { fragment, error: buildErr } = buildFromPostfix(postfixTokens, steps);
  if (buildErr || !fragment) {
    return {
      automaton: emptyAutomaton(input),
      rawInput: input,
      tokens: rawTokens.filter((t) => t.type !== 'EOF'),
      normalized,
      postfix,
      steps,
      error: buildErr ?? 'Error al construir el AFND.',
    };
  }

  const states = fragment.states.map((s) => ({
    ...s,
    isInitial: s.id === fragment.startStateId,
    isAccepting: s.id === fragment.endStateId,
  }));

  const alphabet = [
    ...new Set(
      fragment.transitions.filter((t) => !t.isEpsilon).map((t) => t.symbol)
    ),
  ].sort();

  const automaton: Automaton = {
    id: generateId('auto'),
    name: `Thompson: ${input}`,
    type: 'nfa',
    alphabet,
    states,
    transitions: fragment.transitions,
    initialStateId: fragment.startStateId,
    acceptingStateIds: [fragment.endStateId],
  };

  return {
    automaton,
    rawInput: input,
    tokens: rawTokens.filter((t) => t.type !== 'EOF'),
    normalized,
    postfix,
    steps,
  };
}

function emptyAutomaton(name: string): Automaton {
  return {
    id: generateId('auto'),
    name: `Thompson: ${name}`,
    type: 'nfa',
    alphabet: [],
    states: [],
    transitions: [],
    initialStateId: null,
    acceptingStateIds: [],
  };
}

/** Alias solicitado en la arquitectura. */
export const buildThompsonNfa = buildNfaFromRegex;
