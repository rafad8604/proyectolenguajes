'use client';

import { useEffect, useMemo } from 'react';
import { useTuringStore } from '../store/turing-store';
import { useTuringSimulationStore } from '../store/turing-simulation-store';
import { getTuringOutcomeLabel } from 'lib/core/turing';
import { TapeView } from './TapeView';
import { cn } from 'lib/utils/cn';
import { TURING_PRESETS } from '../examples/presets';
import { PresetBar } from 'components/ui/preset-bar';

export function TuringSimulationPanel() {
  const machine = useTuringStore((s) => s.machine);
  const loadMachine = useTuringStore((s) => s.loadMachine);

  const input = useTuringSimulationStore((s) => s.input);
  const maxSteps = useTuringSimulationStore((s) => s.maxSteps);
  const trace = useTuringSimulationStore((s) => s.trace);
  const currentStepIndex = useTuringSimulationStore((s) => s.currentStepIndex);
  const isRunning = useTuringSimulationStore((s) => s.isRunning);
  const isPaused = useTuringSimulationStore((s) => s.isPaused);
  const setInput = useTuringSimulationStore((s) => s.setInput);
  const setMaxSteps = useTuringSimulationStore((s) => s.setMaxSteps);
  const runSimulation = useTuringSimulationStore((s) => s.runSimulation);
  const nextStep = useTuringSimulationStore((s) => s.nextStep);
  const prevStep = useTuringSimulationStore((s) => s.prevStep);
  const runAll = useTuringSimulationStore((s) => s.runAll);
  const pause = useTuringSimulationStore((s) => s.pause);
  const resetSimulation = useTuringSimulationStore((s) => s.resetSimulation);

  const currentStep = trace?.steps[currentStepIndex] ?? null;
  const outcome =
    currentStep?.outcome ?? trace?.finalOutcome ?? 'idle';

  const stateName = (id: string) =>
    machine.states.find((s) => s.id === id)?.name ?? id;

  const appliedLabel = useMemo(() => {
    if (!currentStep?.appliedTransitionId) return '—';
    const t = machine.transitions.find(
      (tr) => tr.id === currentStep.appliedTransitionId
    );
    if (!t) return currentStep.appliedTransitionId;
    if (machine.tapeCount === 1) {
      return `δ(${stateName(t.from)}, ${t.readSymbols[0]}) → (${t.writeSymbols[0]}, ${t.moves[0]}, ${stateName(t.to)})`;
    }
    return `δ(${stateName(t.from)}, ${t.readSymbols[0]}, ${t.readSymbols[1]}) → (${t.writeSymbols[0]}, ${t.writeSymbols[1]}, ${t.moves[0]}, ${t.moves[1]}, ${stateName(t.to)})`;
  }, [currentStep, machine]);

  const machineSignature = useMemo(
    () =>
      JSON.stringify({
        tapeCount: machine.tapeCount,
        blank: machine.blankSymbol,
        initial: machine.initialStateId,
        states: machine.states.length,
        transitions: machine.transitions,
      }),
    [machine]
  );

  useEffect(() => {
    resetSimulation();
  }, [machineSignature, resetSimulation]);

  const canStep = trace !== null && trace.steps.length > 0 && !trace.error;
  const atEnd =
    trace !== null && currentStepIndex >= trace.steps.length - 1;
  const atStart = currentStepIndex <= 0;

  const handlePreset = (id: string) => {
    const preset = TURING_PRESETS.find((p) => p.id === id);
    if (preset) loadMachine(structuredClone(preset.machine));
  };

  return (
    <div className="space-y-4">
      <PresetBar
        presets={TURING_PRESETS.map((p) => ({ id: p.id, label: p.label }))}
        onSelect={handlePreset}
      />
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-sm font-medium">Cadena de entrada</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="mt-1 block w-48 rounded-md border px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Máx. pasos</label>
          <input
            type="number"
            min={10}
            max={5000}
            value={maxSteps}
            onChange={(e) => setMaxSteps(Number(e.target.value) || 500)}
            className="mt-1 block w-24 rounded-md border px-2 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
          />
        </div>
        <button
          type="button"
          onClick={() => runSimulation(machine)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Simular
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={prevStep}
          disabled={!canStep || atStart}
          className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 dark:border-neutral-600"
        >
          ← Anterior
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={!canStep || atEnd || isRunning}
          className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 dark:border-neutral-600"
        >
          Siguiente →
        </button>
        {!isRunning ? (
          <button
            type="button"
            onClick={() => runAll(machine)}
            disabled={!canStep && !trace}
            className="rounded-md border px-3 py-1.5 text-sm dark:border-neutral-600"
          >
            {isPaused ? 'Reanudar' : 'Ejecutar todo'}
          </button>
        ) : (
          <button
            type="button"
            onClick={pause}
            className="rounded-md border border-amber-400 px-3 py-1.5 text-sm text-amber-700 dark:border-amber-600"
          >
            Pausar
          </button>
        )}
        <button
          type="button"
          onClick={resetSimulation}
          className="rounded-md border px-3 py-1.5 text-sm dark:border-neutral-600"
        >
          Reiniciar
        </button>
      </div>

      {trace?.error && (
        <p className="text-sm text-red-600">{trace.error}</p>
      )}

      {currentStep && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-lg border bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900/50">
              <p>
                <span className="text-neutral-500">Estado:</span>{' '}
                <strong>{stateName(currentStep.config.stateId)}</strong>
              </p>
              <p className="mt-1">
                <span className="text-neutral-500">Transición:</span>{' '}
                <strong className="font-mono text-xs">{appliedLabel}</strong>
              </p>
              <p className="mt-1">
                <span className="text-neutral-500">Resultado:</span>{' '}
                <strong
                  className={cn(
                    outcome === 'accepted' && 'text-green-600',
                    outcome === 'rejected' && 'text-red-600',
                    outcome === 'no_transition' && 'text-amber-600'
                  )}
                >
                  {getTuringOutcomeLabel(outcome)}
                </strong>
              </p>
            </div>
            <div className="rounded-lg border bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900/50">
              <p className="text-neutral-700 dark:text-neutral-300">
                {currentStep.explanation}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {currentStep.config.tapes.map((tape, i) => (
              <TapeView
                key={i}
                tape={tape}
                blankSymbol={machine.blankSymbol}
                tapeLabel={
                  machine.tapeCount === 2
                    ? `Cinta ${i + 1} — cabezal en ${tape.head}`
                    : `Cinta — cabezal en ${tape.head}`
                }
              />
            ))}
          </div>

          <ol className="max-h-36 space-y-1 overflow-y-auto text-xs">
            {trace!.steps.map((step, i) => (
              <li
                key={step.index}
                className={cn(
                  'cursor-pointer rounded px-2 py-1',
                  i === currentStepIndex
                    ? 'bg-blue-100 dark:bg-blue-950'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
                onClick={() =>
                  useTuringSimulationStore.setState({ currentStepIndex: i })
                }
              >
                {i}. {step.explanation}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
