'use client';

import { useEffect, useMemo } from 'react';
import type { SimulationOutcome } from 'lib/core/automata';
import { useAutomatonStore } from '../store/automaton-store';
import {
  useSimulationStore,
  PLAYBACK_SPEED_OPTIONS,
} from '../store/simulation-store';
import { useSimulationPlayback } from '../hooks/use-simulation-playback';
import {
  buildVisualSnapshot,
  getOutcomeLabel,
  getStepSymbolDisplay,
} from 'lib/core/automata';
import { SimulationTape } from './simulation-tape';
import { cn } from 'lib/utils/cn';
import { AUTOMATON_PRESETS } from '../examples/presets';
import type { Automaton } from 'types/automaton';

interface SimulationPanelProps {
  /** Autómata a simular; por defecto el del store del editor. */
  automaton?: Automaton;
  showPresets?: boolean;
}

function OutcomeBadge({ outcome }: { outcome: SimulationOutcome }) {
  const label = getOutcomeLabel(outcome);
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        outcome === 'accepted' &&
          'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
        outcome === 'rejected' &&
          'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
        outcome === 'in_progress' &&
          'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
        outcome === 'idle' &&
          'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
      )}
    >
      {label}
    </span>
  );
}

export function SimulationPanel({
  automaton: automatonProp,
  showPresets = true,
}: SimulationPanelProps) {
  const storeAutomaton = useAutomatonStore((s) => s.automaton);
  const loadAutomaton = useAutomatonStore((s) => s.loadAutomaton);
  const automaton = automatonProp ?? storeAutomaton;

  const input = useSimulationStore((s) => s.input);
  const trace = useSimulationStore((s) => s.trace);
  const currentStepIndex = useSimulationStore((s) => s.currentStepIndex);
  const playbackSpeedMs = useSimulationStore((s) => s.playbackSpeedMs);
  const isPlaying = useSimulationStore((s) => s.isPlaying);
  const setInput = useSimulationStore((s) => s.setInput);
  const setPlaybackSpeed = useSimulationStore((s) => s.setPlaybackSpeed);
  const runSimulation = useSimulationStore((s) => s.runSimulation);
  const goToStep = useSimulationStore((s) => s.goToStep);
  const nextStep = useSimulationStore((s) => s.nextStep);
  const prevStep = useSimulationStore((s) => s.prevStep);
  const startPlayback = useSimulationStore((s) => s.startPlayback);
  const pausePlayback = useSimulationStore((s) => s.pausePlayback);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);
  const getCurrentOutcome = useSimulationStore((s) => s.getCurrentOutcome);

  useSimulationPlayback(automaton);

  const snapshot = useMemo(
    () =>
      trace && !trace.error
        ? buildVisualSnapshot(trace, currentStepIndex, automaton)
        : undefined,
    [trace, currentStepIndex, automaton]
  );

  const currentStep = trace?.steps[currentStepIndex] ?? null;
  const displayOutcome = getCurrentOutcome();

  const stateName = (id: string) =>
    automaton.states.find((s) => s.id === id)?.name ?? id;

  const activeNames = useMemo(
    () => snapshot?.activeStateIds.map(stateName).join(', ') ?? '—',
    [snapshot, automaton.states]
  );

  const visitedNames = useMemo(
    () =>
      snapshot
        ? snapshot.visitedStateIds
            .filter((id) => !snapshot.activeStateIds.includes(id))
            .map(stateName)
            .join(', ') || '—'
        : '—',
    [snapshot, automaton.states]
  );

  const appliedTransitionLabel = useMemo(() => {
    if (!currentStep || currentStep.appliedTransitionIds.length === 0) {
      return currentStep?.kind === 'epsilon' ? `ε (cerradura)` : '—';
    }
    return currentStep.appliedTransitionIds
      .map((tid) => {
        const t = automaton.transitions.find((tr) => tr.id === tid);
        if (!t) return tid;
        const sym = t.isEpsilon ? 'ε' : t.symbol;
        return `δ(${stateName(t.from)}, ${sym}) → ${stateName(t.to)}`;
      })
      .join('; ');
  }, [currentStep, automaton.transitions, automaton.states]);

  const automatonSignature = useMemo(
    () =>
      JSON.stringify({
        type: automaton.type,
        initialStateId: automaton.initialStateId,
        acceptingStateIds: automaton.acceptingStateIds,
        states: automaton.states.map((s) => ({
          id: s.id,
          name: s.name,
          isInitial: s.isInitial,
          isAccepting: s.isAccepting,
        })),
        transitions: automaton.transitions.map((t) => ({
          id: t.id,
          from: t.from,
          to: t.to,
          symbol: t.symbol,
          isEpsilon: t.isEpsilon,
        })),
      }),
    [automaton]
  );

  useEffect(() => {
    resetSimulation();
  }, [automatonSignature, resetSimulation, automatonProp]);

  const handleStart = () => runSimulation(automaton);

  const canStep =
    trace !== null && trace.steps.length > 0 && !trace.error;
  const atEnd =
    trace !== null && currentStepIndex >= trace.steps.length - 1;
  const atStart = currentStepIndex <= 0;

  const handleRunAllAnimated = () => {
    if (!canStep) return;
    if (atEnd) goToStep(0);
    startPlayback(automaton);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Simulación</h3>
        <OutcomeBadge outcome={displayOutcome} />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="sim-input" className="text-sm font-medium">
            Cadena de entrada
          </label>
          <input
            id="sim-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
            placeholder="ej: aab"
          />
        </div>
        <button
          type="button"
          onClick={handleStart}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Simular
        </button>
      </div>

      {trace && !trace.error && (
        <SimulationTape
          input={trace.input}
          consumedPrefix={snapshot?.consumedPrefix ?? ''}
          currentSymbol={snapshot?.currentSymbol ?? null}
          inputIndex={currentStep?.inputIndex ?? 0}
        />
      )}

      {showPresets && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium text-neutral-500">Ejemplos:</span>
          {AUTOMATON_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                loadAutomaton(structuredClone(preset.automaton));
                setInput(preset.id === 'dfa-ends-ab' ? 'aab' : '');
                resetSimulation();
              }}
              className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {trace?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{trace.error}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-neutral-500" htmlFor="sim-speed">
          Velocidad
        </label>
        <select
          id="sim-speed"
          value={playbackSpeedMs}
          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          className="rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800"
        >
          {PLAYBACK_SPEED_OPTIONS.map((opt) => (
            <option key={opt.ms} value={opt.ms}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={prevStep}
          disabled={!canStep || atStart || isPlaying}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-neutral-600"
        >
          ← Anterior
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={!canStep || atEnd || isPlaying}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-neutral-600"
        >
          Siguiente →
        </button>
        <button
          type="button"
          onClick={handleRunAllAnimated}
          disabled={!canStep || isPlaying}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-neutral-600"
        >
          Ejecutar todo
        </button>
        {isPlaying ? (
          <button
            type="button"
            onClick={pausePlayback}
            className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
          >
            Pausa
          </button>
        ) : (
          canStep &&
          !atEnd && (
            <button
              type="button"
              onClick={() => startPlayback(automaton)}
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-600"
            >
              Reproducir
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => {
            pausePlayback();
            resetSimulation();
          }}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-600"
        >
          Reiniciar
        </button>
      </div>

      {currentStep && snapshot && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm dark:border-neutral-700 dark:bg-neutral-900/50">
            <p>
              <span className="text-neutral-500">Símbolo actual:</span>{' '}
              <strong className="font-mono">
                {getStepSymbolDisplay(currentStep)}
              </strong>
            </p>
            <p className="mt-2">
              <span className="text-neutral-500">
                {automaton.type === 'dfa'
                  ? 'Estado activo:'
                  : 'Estados activos:'}
              </span>{' '}
              <strong className="text-blue-700 dark:text-blue-300">
                {activeNames || '∅'}
              </strong>
            </p>
            {automaton.type !== 'dfa' && (
              <p className="mt-2">
                <span className="text-neutral-500">Visitados:</span>{' '}
                <strong className="text-amber-700 dark:text-amber-400">
                  {visitedNames}
                </strong>
              </p>
            )}
            {snapshot.activeAcceptingStateIds.length > 0 && (
              <p className="mt-2">
                <span className="text-neutral-500">Aceptación activa:</span>{' '}
                <strong className="text-green-700 dark:text-green-400">
                  {snapshot.activeAcceptingStateIds.map(stateName).join(', ')}
                </strong>
              </p>
            )}
            <p className="mt-2">
              <span className="text-neutral-500">Transición:</span>{' '}
              <strong className="font-mono text-xs">
                {appliedTransitionLabel}
              </strong>
            </p>
            <p className="mt-2">
              <span className="text-neutral-500">Consumido:</span>{' '}
              <strong className="font-mono">
                {currentStep.consumedPrefix || 'ε'}
              </strong>
            </p>
            <p className="mt-2">
              <span className="text-neutral-500">Restante:</span>{' '}
              <strong className="font-mono">
                {currentStep.remainingInput || 'ε'}
              </strong>
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm dark:border-neutral-700 dark:bg-neutral-900/50">
            <p>
              <span className="text-neutral-500">Paso:</span>{' '}
              <strong>
                {currentStepIndex + 1} / {trace?.steps.length ?? 0}
              </strong>
            </p>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              {currentStep.explanation}
            </p>
            <p className="mt-3 text-xs text-neutral-500">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500 align-middle" />{' '}
              activo ·{' '}
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500 align-middle" />{' '}
              visitado ·{' '}
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 align-middle" />{' '}
              aceptación activa
            </p>
          </div>
        </div>
      )}

      {trace && trace.steps.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold">Historial de pasos</h4>
          <ol className="max-h-48 space-y-1 overflow-y-auto text-sm">
            {trace.steps.map((step, i) => (
              <li
                key={step.index}
                className={cn(
                  'cursor-pointer rounded px-2 py-1 font-mono text-xs',
                  i === currentStepIndex
                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
                onClick={() => goToStep(i)}
              >
                {i}. [{step.kind}] {step.explanation}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
