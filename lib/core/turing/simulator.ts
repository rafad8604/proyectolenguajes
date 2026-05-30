import type { TuringMachine, TuringTransition, TapeMove } from 'types/turing';

export type TuringOutcome =
  | 'idle'
  | 'running'
  | 'accepted'
  | 'rejected'
  | 'no_transition'
  | 'step_limit';

/** Cinta infinita representada como mapa disperso índice → símbolo. */
export interface TapeSnapshot {
  cells: Record<number, string>;
  head: number;
}

export interface TuringConfiguration {
  stateId: string;
  tapes: TapeSnapshot[];
  stepNumber: number;
}

export interface TuringSimStep {
  index: number;
  config: TuringConfiguration;
  readSymbols: string[];
  appliedTransitionId: string | null;
  explanation: string;
  outcome: TuringOutcome;
}

export interface TuringSimulationTrace {
  input: string;
  steps: TuringSimStep[];
  finalOutcome: TuringOutcome;
  error?: string;
}

function stateName(tm: TuringMachine, id: string): string {
  return tm.states.find((s) => s.id === id)?.name ?? id;
}

function getCell(
  cells: Record<number, string>,
  index: number,
  blank: string
): string {
  return cells[index] ?? blank;
}

function cloneCells(cells: Record<number, string>): Record<number, string> {
  return { ...cells };
}

function initTapes(
  tm: TuringMachine,
  input: string
): TapeSnapshot[] {
  const tape0: Record<number, string> = {};
  for (let i = 0; i < input.length; i++) {
    tape0[i] = input[i];
  }
  const tapes: TapeSnapshot[] = [{ cells: tape0, head: 0 }];

  if (tm.tapeCount === 2) {
    tapes.push({ cells: {}, head: 0 });
  }
  return tapes;
}

function findTransition(
  tm: TuringMachine,
  stateId: string,
  readSymbols: string[]
): TuringTransition | undefined {
  return tm.transitions.find(
    (t) =>
      t.from === stateId &&
      t.readSymbols.length === readSymbols.length &&
      t.readSymbols.every((s, i) => s === readSymbols[i])
  );
}

function applyMove(head: number, move: TapeMove): number {
  if (move === 'L') return head - 1;
  if (move === 'R') return head + 1;
  return head;
}

function formatTransition(
  tm: TuringMachine,
  t: TuringTransition,
  readSymbols: string[]
): string {
  const q = stateName(tm, t.from);
  const qn = stateName(tm, t.to);
  if (tm.tapeCount === 1) {
    return `δ(${q}, ${readSymbols[0]}) = (${t.writeSymbols[0]}, ${t.moves[0]}, ${qn})`;
  }
  return `δ(${q}, ${readSymbols[0]}, ${readSymbols[1]}) = (${t.writeSymbols[0]}, ${t.writeSymbols[1]}, ${t.moves[0]}, ${t.moves[1]}, ${qn})`;
}

/** Resultado al detenerse sin transición aplicable. */
export function resolveHaltingOutcome(
  tm: TuringMachine,
  stateId: string
): TuringOutcome {
  if (tm.acceptingStateIds.includes(stateId)) return 'accepted';
  if (tm.rejectingStateIds.includes(stateId)) return 'rejected';
  return 'no_transition';
}

export function isTerminalTuringOutcome(outcome: TuringOutcome): boolean {
  return (
    outcome === 'accepted' ||
    outcome === 'rejected' ||
    outcome === 'no_transition' ||
    outcome === 'step_limit'
  );
}

/** Resultado visible para un paso concreto (no adelanta el resultado final). */
export function resolveStepDisplayOutcome(
  step: TuringSimStep | null | undefined,
  trace: TuringSimulationTrace | null | undefined
): TuringOutcome {
  if (!step) return trace?.finalOutcome ?? 'idle';
  if (isTerminalTuringOutcome(step.outcome)) return step.outcome;
  return 'running';
}

function haltingExplanation(
  tm: TuringMachine,
  stateId: string,
  outcome: TuringOutcome,
  readSymbols: string[]
): string {
  const q = stateName(tm, stateId);
  const read = readSymbols.join(', ');
  switch (outcome) {
    case 'accepted':
      return `Sin transición definida para ${q} leyendo (${read}). El estado ${q} es de aceptación → cadena aceptada.`;
    case 'rejected':
      return `Sin transición definida para ${q} leyendo (${read}). El estado ${q} es de rechazo → cadena rechazada.`;
    default:
      return `Sin transición definida para ${q} leyendo (${read}). Simulación detenida (no es estado final).`;
  }
}

export function buildTuringSimulationTrace(
  tm: TuringMachine,
  input: string,
  maxSteps = 500
): TuringSimulationTrace {
  if (!tm.initialStateId) {
    return {
      input,
      steps: [],
      finalOutcome: 'no_transition',
      error: 'La máquina no tiene estado inicial.',
    };
  }

  const steps: TuringSimStep[] = [];
  let stepIndex = 0;
  let stateId = tm.initialStateId;
  let tapes = initTapes(tm, input);
  const blank = tm.blankSymbol;

  const pushStep = (
    outcome: TuringOutcome,
    readSymbols: string[],
    appliedTransitionId: string | null,
    explanation: string
  ) => {
    steps.push({
      index: stepIndex++,
      config: {
        stateId,
        tapes: tapes.map((t) => ({
          cells: cloneCells(t.cells),
          head: t.head,
        })),
        stepNumber: steps.length,
      },
      readSymbols,
      appliedTransitionId,
      explanation,
      outcome,
    });
  };

  pushStep(
    'running',
    tapes.map((t) => getCell(t.cells, t.head, blank)),
    null,
    `Configuración inicial: estado ${stateName(tm, stateId)}, entrada «${input || 'ε'}» en la cinta 1.`
  );

  let executed = 0;
  while (executed < maxSteps) {
    const readSymbols = tapes.map((t) => getCell(t.cells, t.head, blank));
    const transition = findTransition(tm, stateId, readSymbols);

    if (!transition) {
      const haltOutcome = resolveHaltingOutcome(tm, stateId);
      pushStep(
        haltOutcome,
        readSymbols,
        null,
        haltingExplanation(tm, stateId, haltOutcome, readSymbols)
      );
      return { input, steps, finalOutcome: haltOutcome };
    }

    for (let i = 0; i < tm.tapeCount; i++) {
      tapes[i].cells[tapes[i].head] = transition.writeSymbols[i];
      tapes[i].head = applyMove(tapes[i].head, transition.moves[i]);
    }
    stateId = transition.to;
    executed += 1;

    pushStep(
      'running',
      readSymbols,
      transition.id,
      `Paso ${executed}: ${formatTransition(tm, transition, readSymbols)}.`
    );
  }

  steps[steps.length - 1].outcome = 'step_limit';
  steps[steps.length - 1].explanation +=
    ` Límite de ${maxSteps} pasos alcanzado.`;
  return { input, steps, finalOutcome: 'step_limit' };
}

export function getTuringOutcomeLabel(outcome: TuringOutcome): string {
  switch (outcome) {
    case 'idle':
      return 'Sin simular';
    case 'running':
      return 'En ejecución';
    case 'accepted':
      return 'Aceptada';
    case 'rejected':
      return 'Rechazada';
    case 'no_transition':
      return 'Detenida (sin transición)';
    case 'step_limit':
      return 'Límite de pasos';
  }
}

export function getTuringOutcomeDetail(outcome: TuringOutcome): string {
  switch (outcome) {
    case 'accepted':
      return 'Aceptada: se detuvo en un estado de aceptación sin transición aplicable.';
    case 'rejected':
      return 'Rechazada: se detuvo en un estado de rechazo sin transición aplicable.';
    case 'no_transition':
      return 'Detenida: no hay transición definida y el estado actual no es final.';
    case 'step_limit':
      return 'Límite alcanzado: se superó el máximo de pasos configurado.';
    default:
      return '';
  }
}

/** Índices visibles alrededor del cabezal para renderizar la cinta. */
export function getVisibleTapeRange(
  head: number,
  radius = 8
): number[] {
  const indices: number[] = [];
  for (let i = head - radius; i <= head + radius; i++) {
    indices.push(i);
  }
  return indices;
}
