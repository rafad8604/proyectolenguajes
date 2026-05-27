import type { Automaton } from 'types/automaton';
import type { SimulationTrace, SimulationOutcome } from './simulation';

/** Snapshot visual eficiente (solo IDs) para un paso de simulación. */
export interface SimulationVisualSnapshot {
  stepIndex: number;
  activeStateIds: string[];
  /** Estados activos en pasos anteriores al actual (sin incluir el paso actual). */
  previouslyVisitedStateIds: string[];
  /** Unión histórica hasta el paso actual (incluye activos). */
  visitedStateIds: string[];
  /** Activos en este paso que ya habían sido visitados antes. */
  revisitedStateIds: string[];
  activeAcceptingStateIds: string[];
  activeTransitionIds: string[];
  /** Transiciones aplicadas en pasos anteriores al actual. */
  previouslyVisitedTransitionIds: string[];
  visitedTransitionIds: string[];
  revisitedTransitionIds: string[];
  rejectingStateIds: string[];
  currentSymbol: string | null;
  consumedPrefix: string;
  remainingInput: string;
  outcome: SimulationOutcome;
  explanation: string;
}

function accumulateBeforeStep(
  trace: SimulationTrace,
  stepIndex: number
): {
  previouslyVisitedStates: Set<string>;
  previouslyVisitedTransitions: Set<string>;
} {
  const previouslyVisitedStates = new Set<string>();
  const previouslyVisitedTransitions = new Set<string>();
  const limit = Math.min(stepIndex - 1, trace.steps.length - 1);

  for (let i = 0; i <= limit; i++) {
    const step = trace.steps[i];
    if (!step) continue;
    for (const id of step.activeStateIds) {
      previouslyVisitedStates.add(id);
    }
    for (const tid of step.appliedTransitionIds) {
      previouslyVisitedTransitions.add(tid);
    }
  }

  return { previouslyVisitedStates, previouslyVisitedTransitions };
}

function accumulateThroughStep(
  trace: SimulationTrace,
  stepIndex: number
): {
  visitedStates: Set<string>;
  visitedTransitions: Set<string>;
} {
  const visitedStates = new Set<string>();
  const visitedTransitions = new Set<string>();
  const limit = Math.min(stepIndex, trace.steps.length - 1);

  for (let i = 0; i <= limit; i++) {
    const step = trace.steps[i];
    if (!step) continue;
    for (const id of step.activeStateIds) {
      visitedStates.add(id);
    }
    for (const tid of step.appliedTransitionIds) {
      visitedTransitions.add(tid);
    }
  }

  return { visitedStates, visitedTransitions };
}

/** Deriva resaltado acumulado hasta el paso indicado (camino recorrido + paso actual). */
export function buildVisualSnapshot(
  trace: SimulationTrace,
  stepIndex: number,
  automaton: Automaton
): SimulationVisualSnapshot | undefined {
  if (trace.steps.length === 0) return undefined;

  const idx = Math.max(0, Math.min(stepIndex, trace.steps.length - 1));
  const step = trace.steps[idx];
  if (!step) return undefined;

  const { previouslyVisitedStates, previouslyVisitedTransitions } =
    accumulateBeforeStep(trace, idx);
  const { visitedStates, visitedTransitions } = accumulateThroughStep(trace, idx);
  const acceptingSet = new Set(automaton.acceptingStateIds);

  const activeAcceptingStateIds = step.activeStateIds.filter((id) =>
    acceptingSet.has(id)
  );

  const revisitedStateIds = step.activeStateIds.filter((id) =>
    previouslyVisitedStates.has(id)
  );
  const revisitedTransitionIds = step.appliedTransitionIds.filter((id) =>
    previouslyVisitedTransitions.has(id)
  );

  const rejectingStateIds: string[] = [];
  if (
    step.kind === 'halt' &&
    step.outcome === 'rejected' &&
    step.activeStateIds.length === 0
  ) {
    const previous = trace.steps[idx - 1];
    if (previous) {
      rejectingStateIds.push(...previous.activeStateIds);
    }
  }

  return {
    stepIndex: idx,
    activeStateIds: [...step.activeStateIds],
    previouslyVisitedStateIds: [...previouslyVisitedStates],
    visitedStateIds: [...visitedStates],
    revisitedStateIds,
    activeAcceptingStateIds,
    activeTransitionIds: [...step.appliedTransitionIds],
    previouslyVisitedTransitionIds: [...previouslyVisitedTransitions],
    visitedTransitionIds: [...visitedTransitions],
    revisitedTransitionIds,
    rejectingStateIds,
    currentSymbol: step.currentSymbol,
    consumedPrefix: step.consumedPrefix,
    remainingInput: step.remainingInput,
    outcome: step.outcome,
    explanation: step.explanation,
  };
}

/** Convierte snapshot a formato del adaptador React Flow. */
export function snapshotToGraphHighlight(
  snapshot: SimulationVisualSnapshot | undefined
): {
  stepIndex: number;
  activeStateIds: string[];
  previouslyVisitedStateIds: string[];
  visitedStateIds: string[];
  revisitedStateIds: string[];
  activeAcceptingStateIds: string[];
  activeTransitionIds: string[];
  previouslyVisitedTransitionIds: string[];
  visitedTransitionIds: string[];
  revisitedTransitionIds: string[];
  rejectingStateIds: string[];
} | undefined {
  if (!snapshot) return undefined;

  const activeStateSet = new Set(snapshot.activeStateIds);
  const activeTransitionSet = new Set(snapshot.activeTransitionIds);

  return {
    stepIndex: snapshot.stepIndex,
    activeStateIds: snapshot.activeStateIds,
    previouslyVisitedStateIds: snapshot.previouslyVisitedStateIds,
    visitedStateIds: snapshot.visitedStateIds.filter(
      (id) => !activeStateSet.has(id)
    ),
    revisitedStateIds: snapshot.revisitedStateIds,
    activeAcceptingStateIds: snapshot.activeAcceptingStateIds,
    activeTransitionIds: snapshot.activeTransitionIds,
    previouslyVisitedTransitionIds: snapshot.previouslyVisitedTransitionIds,
    visitedTransitionIds: snapshot.visitedTransitionIds.filter(
      (id) => !activeTransitionSet.has(id)
    ),
    revisitedTransitionIds: snapshot.revisitedTransitionIds,
    rejectingStateIds: snapshot.rejectingStateIds,
  };
}

/** Índice de paso acotado a la longitud de una traza (comparación dual). */
export function resolveTraceStepIndex(
  trace: SimulationTrace | null | undefined,
  unifiedStepIndex: number
): number {
  if (!trace || trace.steps.length === 0) return 0;
  return Math.max(0, Math.min(unifiedStepIndex, trace.steps.length - 1));
}

/** Longitud unificada para avanzar dos trazas en paralelo. */
export function unifiedSimulationStepCount(
  ...traces: (SimulationTrace | null | undefined)[]
): number {
  return traces.reduce((max, trace) => {
    if (!trace || trace.error) return max;
    return Math.max(max, trace.steps.length);
  }, 0);
}
