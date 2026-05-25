import type { Automaton } from 'types/automaton';
import { deriveAlphabet } from './alphabet';
import type { ValidationIssue, ValidationResult } from './types';

function getStateName(automaton: Automaton, stateId: string): string {
  return automaton.states.find((s) => s.id === stateId)?.name ?? stateId;
}

export function validateInitialState(automaton: Automaton): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!automaton.initialStateId) {
    issues.push({
      code: 'NO_INITIAL',
      message: 'No hay estado inicial definido.',
      severity: 'error',
    });
  } else if (
    !automaton.states.some((s) => s.id === automaton.initialStateId)
  ) {
    issues.push({
      code: 'INVALID_INITIAL',
      message: 'El estado inicial referenciado no existe.',
      severity: 'error',
    });
  }

  const initialStates = automaton.states.filter((s) => s.isInitial);
  if (initialStates.length > 1) {
    issues.push({
      code: 'MULTIPLE_INITIAL',
      message: `Hay ${initialStates.length} estados marcados como iniciales; debe haber exactamente uno.`,
      severity: 'error',
    });
  }

  return {
    id: 'initial',
    label: 'Estado inicial',
    passed: issues.length === 0,
    issues,
  };
}

export function validateAcceptingStates(automaton: Automaton): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (automaton.acceptingStateIds.length === 0) {
    issues.push({
      code: 'NO_ACCEPTING',
      message: 'No hay estados finales (de aceptación) definidos.',
      severity: 'error',
    });
  }

  for (const id of automaton.acceptingStateIds) {
    if (!automaton.states.some((s) => s.id === id)) {
      issues.push({
        code: 'INVALID_ACCEPTING',
        message: `El estado final "${id}" no existe.`,
        severity: 'error',
      });
    }
  }

  const acceptingWithoutFlag = automaton.states.filter(
    (s) => automaton.acceptingStateIds.includes(s.id) && !s.isAccepting
  );
  if (acceptingWithoutFlag.length > 0) {
    issues.push({
      code: 'ACCEPTING_MISMATCH',
      message: 'Hay inconsistencia entre estados marcados como finales y la lista F.',
      severity: 'warning',
    });
  }

  return {
    id: 'accepting',
    label: 'Estados finales',
    passed: issues.filter((i) => i.severity === 'error').length === 0,
    issues,
  };
}

export function validateCompleteness(automaton: Automaton): ValidationResult {
  const issues: ValidationIssue[] = [];
  const alphabet = deriveAlphabet(automaton);

  if (automaton.states.length === 0) {
    issues.push({
      code: 'NO_STATES',
      message: 'El autómata no tiene estados.',
      severity: 'error',
    });
    return { id: 'complete', label: 'Completitud', passed: false, issues };
  }

  if (alphabet.length === 0) {
    issues.push({
      code: 'NO_ALPHABET',
      message: 'El alfabeto Σ está vacío; agrega transiciones con símbolos.',
      severity: 'warning',
    });
  }

  if (automaton.type === 'dfa') {
    const missing: string[] = [];
    for (const state of automaton.states) {
      for (const symbol of alphabet) {
        const hasTransition = automaton.transitions.some(
          (t) =>
            t.from === state.id &&
            !t.isEpsilon &&
            t.symbol === symbol
        );
        if (!hasTransition) {
          missing.push(`δ(${state.name}, ${symbol})`);
        }
      }
    }
    if (missing.length > 0) {
      issues.push({
        code: 'INCOMPLETE_DFA',
        message: `Faltan ${missing.length} transición(es) en el AFD: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '…' : ''}.`,
        severity: 'error',
      });
    }
  } else {
    const orphanStates = automaton.states.filter(
      (s) =>
        !automaton.transitions.some((t) => t.from === s.id || t.to === s.id) &&
        automaton.states.length > 1
    );
    if (orphanStates.length > 0) {
      issues.push({
        code: 'DISCONNECTED',
        message: `Estados sin transiciones: ${orphanStates.map((s) => s.name).join(', ')}.`,
        severity: 'warning',
      });
    }
  }

  for (const t of automaton.transitions) {
    if (!automaton.states.some((s) => s.id === t.from)) {
      issues.push({
        code: 'INVALID_FROM',
        message: `Transición con origen inexistente (${t.id}).`,
        severity: 'error',
      });
    }
    if (!automaton.states.some((s) => s.id === t.to)) {
      issues.push({
        code: 'INVALID_TO',
        message: `Transición con destino inexistente (${t.id}).`,
        severity: 'error',
      });
    }
  }

  return {
    id: 'complete',
    label: 'Completitud',
    passed: issues.filter((i) => i.severity === 'error').length === 0,
    issues,
  };
}

export function validateDeterministic(automaton: Automaton): ValidationResult {
  const issues: ValidationIssue[] = [];
  const keyMap = new Map<string, string[]>();

  for (const t of automaton.transitions) {
    const sym = t.isEpsilon ? 'ε' : t.symbol;
    const key = `${t.from}|${sym}`;
    const targets = keyMap.get(key) ?? [];
    if (!targets.includes(t.to)) {
      targets.push(t.to);
    }
    keyMap.set(key, targets);
  }

  for (const [key, targets] of keyMap.entries()) {
    if (targets.length > 1) {
      const [fromId, sym] = key.split('|');
      if (automaton.type === 'nfa' && sym === 'ε') {
        continue;
      }
      const fromName = getStateName(automaton, fromId);
      issues.push({
        code: 'NON_DETERMINISTIC',
        message: `Desde ${fromName} con símbolo "${sym}" hay ${targets.length} destinos distintos.`,
        severity: 'error',
      });
    }
  }

  if (automaton.type === 'dfa') {
    const epsilonTransitions = automaton.transitions.filter((t) => t.isEpsilon);
    if (epsilonTransitions.length > 0) {
      issues.push({
        code: 'EPSILON_IN_DFA',
        message: 'Un AFD no puede tener transiciones ε.',
        severity: 'error',
      });
    }
  }

  const isDet = issues.filter((i) => i.severity === 'error').length === 0;

  if (automaton.type === 'nfa' && isDet && automaton.transitions.length > 0) {
    issues.push({
      code: 'IS_DETERMINISTIC',
      message: 'Este AFND es determinista (equivalente a un AFD).',
      severity: 'warning',
    });
  }

  return {
    id: 'deterministic',
    label: automaton.type === 'dfa' ? 'Determinismo (AFD)' : 'Determinismo',
    passed: isDet,
    issues,
  };
}

export function validateAutomaton(automaton: Automaton): ValidationResult[] {
  return [
    validateInitialState(automaton),
    validateAcceptingStates(automaton),
    validateCompleteness(automaton),
    validateDeterministic(automaton),
  ];
}
