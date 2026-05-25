import type { Automaton } from 'types/automaton';
import type { SimulationTrace, SimulationOutcome } from './simulation';

/** Snapshot visual eficiente (solo IDs) para un paso de simulación. */
export interface SimulationVisualSnapshot {
  stepIndex: number;
  activeStateIds: string[];
  visitedStateIds: string[];
  activeAcceptingStateIds: string[];
  activeTransitionIds: string[];
  visitedTransitionIds: string[];
  currentSymbol: string | null;
  consumedPrefix: string;
  remainingInput: string;
  outcome: SimulationOutcome;
  explanation: string;
}

function unionIds(upToStep: SimulationTrace, stepIndex: number): {
  visitedStates: Set<string>;
  visitedTransitions: Set<string>;
} {
  const visitedStates = new Set<string>();
  const visitedTransitions = new Set<string>();
  const limit = Math.min(stepIndex, upToStep.steps.length - 1);

  for (let i = 0; i <= limit; i++) {
    const step = upToStep.steps[i];
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

  const { visitedStates, visitedTransitions } = unionIds(trace, idx);
  const acceptingSet = new Set(automaton.acceptingStateIds);

  const activeAcceptingStateIds = step.activeStateIds.filter((id) =>
    acceptingSet.has(id)
  );

  return {
    stepIndex: idx,
    activeStateIds: [...step.activeStateIds],
    visitedStateIds: [...visitedStates],
    activeAcceptingStateIds,
    activeTransitionIds: [...step.appliedTransitionIds],
    visitedTransitionIds: [...visitedTransitions],
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
  activeStateIds: string[];
  visitedStateIds: string[];
  activeAcceptingStateIds: string[];
  activeTransitionIds: string[];
  visitedTransitionIds: string[];
} | undefined {
  if (!snapshot) return undefined;
  return {
    activeStateIds: snapshot.activeStateIds,
    visitedStateIds: snapshot.visitedStateIds,
    activeAcceptingStateIds: snapshot.activeAcceptingStateIds,
    activeTransitionIds: snapshot.activeTransitionIds,
    visitedTransitionIds: snapshot.visitedTransitionIds,
  };
}
