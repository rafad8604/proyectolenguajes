'use client';

import {
  getOutcomeLabel,
  getStepSymbolDisplay,
  type SimulationOutcome,
} from 'lib/core/automata';
import type { Automaton } from 'types/automaton';
import type { AutomatonSimulationController } from '../hooks/use-automaton-simulation';
import { PLAYBACK_SPEED_OPTIONS } from '../store/simulation-store';
import { SimulationTape } from './simulation-tape';
import { useSimulationPlayback } from '../hooks/use-simulation-playback';
import { cn } from 'lib/utils/cn';

interface SimulationControlsProps {
  automaton: Automaton;
  controller: AutomatonSimulationController;
  title?: string;
}

function OutcomeBadge({ outcome }: { outcome: SimulationOutcome }) {
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
      {getOutcomeLabel(outcome)}
    </span>
  );
}

export function SimulationControls({
  automaton,
  controller,
  title = 'Simulación',
}: SimulationControlsProps) {
  useSimulationPlayback(automaton, {
    mode: 'controller',
    controller,
  });

  const {
    input,
    trace,
    currentStepIndex,
    playbackSpeedMs,
    isPlaying,
    setInput,
    setPlaybackSpeed,
    run,
    goToStep,
    nextStep,
    prevStep,
    startPlayback,
    pausePlayback,
    reset,
    getCurrentOutcome,
  } = controller;

  const currentStep = trace?.steps[currentStepIndex] ?? null;
  const displayOutcome = getCurrentOutcome();
  const canStep = trace !== null && trace.steps.length > 0 && !trace.error;
  const atEnd =
    trace !== null && currentStepIndex >= trace.steps.length - 1;
  const atStart = currentStepIndex <= 0;

  const stateName = (id: string) =>
    automaton.states.find((s) => s.id === id)?.name ?? id;

  const activeNames =
    currentStep?.activeStateIds.map(stateName).join(', ') ?? '—';

  const handleRunAllAnimated = () => {
    if (!canStep) return;
    if (atEnd) goToStep(0);
    startPlayback(automaton);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <OutcomeBadge outcome={displayOutcome} />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label htmlFor={`sim-input-${automaton.id}`} className="text-sm font-medium">
            Cadena de entrada
          </label>
          <input
            id={`sim-input-${automaton.id}`}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
            placeholder="ej: aab"
          />
        </div>
        <button
          type="button"
          onClick={() => run(automaton)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Simular
        </button>
      </div>

      {trace && !trace.error && (
        <SimulationTape
          input={trace.input}
          consumedPrefix={currentStep?.consumedPrefix ?? ''}
          currentSymbol={currentStep?.currentSymbol ?? null}
          inputIndex={currentStep?.inputIndex ?? 0}
        />
      )}

      {trace?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{trace.error}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-neutral-500" htmlFor={`sim-speed-${automaton.id}`}>
          Velocidad
        </label>
        <select
          id={`sim-speed-${automaton.id}`}
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
          onClick={reset}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-600"
        >
          Reiniciar
        </button>
      </div>

      {currentStep && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm dark:border-neutral-700 dark:bg-neutral-900/50">
          <p>
            <span className="text-neutral-500">Símbolo actual:</span>{' '}
            <strong className="font-mono">
              {getStepSymbolDisplay(currentStep)}
            </strong>
          </p>
          <p className="mt-2">
            <span className="text-neutral-500">
              {automaton.type === 'dfa' ? 'Estado activo:' : 'Estados activos:'}
            </span>{' '}
            <strong>{activeNames || '∅'}</strong>
          </p>
          <p className="mt-2 text-neutral-700 dark:text-neutral-300">
            {currentStep.explanation}
          </p>
        </div>
      )}

      {trace && trace.steps.length > 0 && (
        <ol className="max-h-32 space-y-1 overflow-y-auto text-xs">
          {trace.steps.map((step, i) => (
            <li
              key={step.index}
              className={cn(
                'cursor-pointer rounded px-2 py-1 font-mono',
                i === currentStepIndex
                  ? 'bg-blue-100 dark:bg-blue-950'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
              onClick={() => goToStep(i)}
            >
              {i}. [{step.kind}] {step.explanation}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
