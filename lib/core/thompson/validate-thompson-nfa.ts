import type { Automaton } from 'types/automaton';
import { validateAutomaton } from 'lib/core/automata/validate';
import type { ValidationIssue, ValidationResult } from 'lib/core/automata/types';

function duplicateStateIds(automaton: Automaton): ValidationIssue[] {
  const seen = new Set<string>();
  const issues: ValidationIssue[] = [];
  for (const s of automaton.states) {
    if (seen.has(s.id)) {
      issues.push({
        code: 'DUPLICATE_STATE_ID',
        message: `ID de estado duplicado: ${s.id}.`,
        severity: 'error',
      });
    }
    seen.add(s.id);
  }
  return issues;
}

function epsilonConsistency(automaton: Automaton): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const t of automaton.transitions) {
    if (t.isEpsilon && t.symbol !== '') {
      issues.push({
        code: 'EPSILON_SYMBOL_MISMATCH',
        message: `Transición ε (${t.id}) tiene símbolo no vacío.`,
        severity: 'error',
      });
    }
    if (!t.isEpsilon && t.symbol === '') {
      issues.push({
        code: 'MISSING_EPSILON_FLAG',
        message: `Transición con símbolo vacío sin marcar como ε (${t.id}).`,
        severity: 'error',
      });
    }
  }
  const epsilonCount = automaton.transitions.filter((t) => t.isEpsilon).length;
  if (epsilonCount === 0 && automaton.states.length > 2) {
    issues.push({
      code: 'NO_EPSILON_TRANSITIONS',
      message:
        'No hay transiciones ε; Thompson suele generar al menos una ε en uniones/concatenaciones.',
      severity: 'warning',
    });
  }
  return issues;
}

function acceptingStateConsistency(automaton: Automaton): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (automaton.acceptingStateIds.length !== 1) {
    issues.push({
      code: 'THOMPSON_ACCEPTING_COUNT',
      message: `Se espera exactamente un estado final; hay ${automaton.acceptingStateIds.length}.`,
      severity: 'error',
    });
  }
  for (const id of automaton.acceptingStateIds) {
    const state = automaton.states.find((s) => s.id === id);
    if (state && !state.isAccepting) {
      issues.push({
        code: 'ACCEPTING_FLAG_MISMATCH',
        message: `Estado final ${state.name} no tiene isAccepting=true.`,
        severity: 'error',
      });
    }
  }
  const extraAccepting = automaton.states.filter(
    (s) => s.isAccepting && !automaton.acceptingStateIds.includes(s.id)
  );
  if (extraAccepting.length > 0) {
    issues.push({
      code: 'EXTRA_ACCEPTING_FLAGS',
      message: `Estados marcados como finales sin estar en F: ${extraAccepting.map((s) => s.name).join(', ')}.`,
      severity: 'warning',
    });
  }
  return issues;
}

function orphanStates(automaton: Automaton): ValidationIssue[] {
  if (automaton.states.length <= 2) return [];
  const issues: ValidationIssue[] = [];
  for (const s of automaton.states) {
    const hasEdge = automaton.transitions.some(
      (t) => t.from === s.id || t.to === s.id
    );
    if (!hasEdge) {
      issues.push({
        code: 'ORPHAN_STATE',
        message: `Estado ${s.name} sin transiciones entrantes ni salientes.`,
        severity: 'warning',
      });
    }
  }
  return issues;
}

/** Validaciones estándar + chequeos específicos de AFND Thompson. */
export function validateThompsonNfa(automaton: Automaton): ValidationResult[] {
  const base = validateAutomaton(automaton);
  const thompsonIssues: ValidationIssue[] = [
    ...duplicateStateIds(automaton),
    ...epsilonConsistency(automaton),
    ...acceptingStateConsistency(automaton),
    ...orphanStates(automaton),
  ];

  const errors = thompsonIssues.filter((i) => i.severity === 'error');
  const thompsonResult: ValidationResult = {
    id: 'thompson',
    label: 'Construcción Thompson',
    passed: errors.length === 0,
    issues: thompsonIssues,
  };

  return [...base, thompsonResult];
}

export function hasThompsonValidationErrors(
  results: ValidationResult[]
): boolean {
  return results.some(
    (r) => !r.passed && r.issues.some((i) => i.severity === 'error')
  );
}
