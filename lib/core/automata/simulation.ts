import type { Automaton } from 'types/automaton';
import { EPSILON_SYMBOL } from './constants';
import {
  epsilonClosure,
  epsilonTransitionsUsed,
  sortStateIds,
} from './epsilon-closure';

export type SimulationOutcome = 'idle' | 'in_progress' | 'accepted' | 'rejected';

export type SimStepKind = 'start' | 'epsilon' | 'consume' | 'halt';

export interface SimStep {
  index: number;
  kind: SimStepKind;
  activeStateIds: string[];
  inputIndex: number;
  currentSymbol: string | null;
  consumedPrefix: string;
  remainingInput: string;
  appliedTransitionIds: string[];
  explanation: string;
  outcome: SimulationOutcome;
}

export interface SimulationTrace {
  input: string;
  steps: SimStep[];
  finalOutcome: SimulationOutcome;
  error?: string;
}

function stateName(automaton: Automaton, id: string): string {
  return automaton.states.find((s) => s.id === id)?.name ?? id;
}

function stateNames(automaton: Automaton, ids: string[]): string {
  return ids.map((id) => stateName(automaton, id)).join(', ');
}

function formatStateSet(automaton: Automaton, ids: string[]): string {
  if (ids.length === 0) return '∅';
  if (automaton.type === 'dfa' && ids.length === 1) {
    return stateName(automaton, ids[0]);
  }
  return `{${stateNames(automaton, ids)}}`;
}

function isAccepting(automaton: Automaton, stateIds: string[]): boolean {
  return stateIds.some((id) => automaton.acceptingStateIds.includes(id));
}

function moveDfa(
  automaton: Automaton,
  stateId: string,
  symbol: string
): { nextIds: string[]; transitionIds: string[] } {
  const matches = automaton.transitions.filter(
    (t) => t.from === stateId && !t.isEpsilon && t.symbol === symbol
  );
  if (matches.length === 0) return { nextIds: [], transitionIds: [] };
  return {
    nextIds: [matches[0].to],
    transitionIds: [matches[0].id],
  };
}

function moveNfaOnSymbol(
  automaton: Automaton,
  stateIds: string[],
  symbol: string
): {
  nextIds: string[];
  symbolTransitionIds: string[];
  needsEpsilonStep: boolean;
  afterSymbolIds: string[];
} {
  const targets = new Set<string>();
  const symbolTransitionIds: string[] = [];

  for (const q of stateIds) {
    for (const t of automaton.transitions) {
      if (!t.isEpsilon && t.from === q && t.symbol === symbol) {
        targets.add(t.to);
        symbolTransitionIds.push(t.id);
      }
    }
  }

  const afterSymbolIds = sortStateIds(targets);
  if (afterSymbolIds.length === 0) {
    return {
      nextIds: [],
      symbolTransitionIds,
      needsEpsilonStep: false,
      afterSymbolIds: [],
    };
  }

  const withClosure = epsilonClosure(automaton, afterSymbolIds);
  const needsEpsilonStep =
    withClosure.length !== afterSymbolIds.length ||
    withClosure.some((id) => !afterSymbolIds.includes(id));

  return {
    nextIds: withClosure,
    symbolTransitionIds,
    needsEpsilonStep,
    afterSymbolIds,
  };
}

function createStep(
  index: number,
  input: string,
  partial: Omit<SimStep, 'index' | 'remainingInput' | 'outcome'> & {
    outcome?: SimulationOutcome;
  }
): SimStep {
  const inputIndex = partial.inputIndex;
  return {
    index,
    kind: partial.kind,
    activeStateIds: partial.activeStateIds,
    inputIndex,
    currentSymbol: partial.currentSymbol,
    consumedPrefix: partial.consumedPrefix,
    remainingInput: input.slice(inputIndex),
    appliedTransitionIds: partial.appliedTransitionIds,
    explanation: partial.explanation,
    outcome: partial.outcome ?? 'in_progress',
  };
}

/** Construye la traza completa de simulación para una cadena. */
export function buildSimulationTrace(
  automaton: Automaton,
  input: string
): SimulationTrace {
  if (!automaton.initialStateId) {
    return {
      input,
      steps: [],
      finalOutcome: 'rejected',
      error: 'El autómata no tiene estado inicial.',
    };
  }

  if (automaton.states.length === 0) {
    return {
      input,
      steps: [],
      finalOutcome: 'rejected',
      error: 'El autómata no tiene estados.',
    };
  }

  const steps: SimStep[] = [];
  let stepIndex = 0;
  const q0 = automaton.initialStateId;

  steps.push(
    createStep(stepIndex++, input, {
      kind: 'start',
      activeStateIds: [q0],
      inputIndex: 0,
      currentSymbol: null,
      consumedPrefix: '',
      appliedTransitionIds: [],
      explanation: `Inicio en estado ${stateName(automaton, q0)}.`,
      outcome: 'in_progress',
    })
  );

  let activeStateIds: string[] =
    automaton.type === 'dfa' ? [q0] : epsilonClosure(automaton, [q0]);

  if (automaton.type === 'nfa') {
    const before = [q0];
    const expanded =
      activeStateIds.length > 1 ||
      (activeStateIds.length === 1 && activeStateIds[0] !== q0);

    if (expanded) {
      const epsIds = epsilonTransitionsUsed(
        automaton,
        before,
        activeStateIds
      );
      steps.push(
        createStep(stepIndex++, input, {
          kind: 'epsilon',
          activeStateIds,
          inputIndex: 0,
          currentSymbol: null,
          consumedPrefix: '',
          appliedTransitionIds: epsIds,
          explanation: `Cerradura ε: ${formatStateSet(automaton, activeStateIds)}.`,
          outcome: 'in_progress',
        })
      );
    }
  }

  for (let i = 0; i < input.length; i++) {
    const symbol = input[i];
    const consumedPrefix = input.slice(0, i);
    const fromLabel = formatStateSet(automaton, activeStateIds);

    if (automaton.type === 'dfa') {
      const stateId = activeStateIds[0];
      const { nextIds, transitionIds } = moveDfa(automaton, stateId, symbol);

      if (nextIds.length === 0) {
        steps.push(
          createStep(stepIndex++, input, {
            kind: 'halt',
            activeStateIds: [],
            inputIndex: i,
            currentSymbol: symbol,
            consumedPrefix,
            appliedTransitionIds: [],
            explanation: `No hay transición δ(${stateName(automaton, stateId)}, ${symbol}). La cadena es rechazada.`,
            outcome: 'rejected',
          })
        );
        return { input, steps, finalOutcome: 'rejected' };
      }

      const toName = stateName(automaton, nextIds[0]);
      steps.push(
        createStep(stepIndex++, input, {
          kind: 'consume',
          activeStateIds: nextIds,
          inputIndex: i + 1,
          currentSymbol: symbol,
          consumedPrefix: consumedPrefix + symbol,
          appliedTransitionIds: transitionIds,
          explanation: `Lee «${symbol}»: ${stateName(automaton, stateId)} → ${toName}.`,
          outcome: 'in_progress',
        })
      );
      activeStateIds = nextIds;
    } else {
      const {
        nextIds,
        symbolTransitionIds,
        needsEpsilonStep,
        afterSymbolIds,
      } = moveNfaOnSymbol(automaton, activeStateIds, symbol);

      if (nextIds.length === 0) {
        steps.push(
          createStep(stepIndex++, input, {
            kind: 'halt',
            activeStateIds: [],
            inputIndex: i,
            currentSymbol: symbol,
            consumedPrefix,
            appliedTransitionIds: [],
            explanation: `No hay transición con «${symbol}» desde ${fromLabel}. La cadena es rechazada.`,
            outcome: 'rejected',
          })
        );
        return { input, steps, finalOutcome: 'rejected' };
      }

      const targetsLabel = stateNames(automaton, afterSymbolIds);
      steps.push(
        createStep(stepIndex++, input, {
          kind: 'consume',
          activeStateIds: afterSymbolIds,
          inputIndex: i + 1,
          currentSymbol: symbol,
          consumedPrefix: consumedPrefix + symbol,
          appliedTransitionIds: symbolTransitionIds,
          explanation: `Lee «${symbol}» desde ${fromLabel} hacia {${targetsLabel}}.`,
          outcome: 'in_progress',
        })
      );

      if (needsEpsilonStep) {
        const epsIds = epsilonTransitionsUsed(
          automaton,
          afterSymbolIds,
          nextIds
        );
        steps.push(
          createStep(stepIndex++, input, {
            kind: 'epsilon',
            activeStateIds: nextIds,
            inputIndex: i + 1,
            currentSymbol: null,
            consumedPrefix: consumedPrefix + symbol,
            appliedTransitionIds: epsIds,
            explanation: `Cerradura ε tras «${symbol}»: ${formatStateSet(automaton, nextIds)}.`,
            outcome: 'in_progress',
          })
        );
      }

      activeStateIds = nextIds;
    }
  }

  const accepted = isAccepting(automaton, activeStateIds);
  const finalOutcome: SimulationOutcome = accepted ? 'accepted' : 'rejected';
  const activeLabel = formatStateSet(automaton, activeStateIds);

  steps.push(
    createStep(stepIndex, input, {
      kind: 'halt',
      activeStateIds,
      inputIndex: input.length,
      currentSymbol: null,
      consumedPrefix: input,
      appliedTransitionIds: [],
      explanation: accepted
        ? `Cadena consumida. ${activeLabel} ∈ F → aceptada.`
        : `Cadena consumida. Ningún estado activo es final → rechazada.`,
      outcome: finalOutcome,
    })
  );

  return { input, steps, finalOutcome };
}

export function getOutcomeLabel(outcome: SimulationOutcome): string {
  switch (outcome) {
    case 'idle':
      return 'Sin simular';
    case 'in_progress':
      return 'En proceso';
    case 'accepted':
      return 'Aceptada';
    case 'rejected':
      return 'Rechazada';
  }
}

export function getStepSymbolDisplay(step: SimStep): string {
  if (step.kind === 'epsilon') return EPSILON_SYMBOL;
  return step.currentSymbol ?? '—';
}
