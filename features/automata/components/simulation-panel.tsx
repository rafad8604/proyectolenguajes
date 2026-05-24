'use client';

import { useEffect, useMemo } from 'react';
import { useAutomatonStore } from '../store/automaton-store';
import { useSimulationStore } from '../store/simulation-store';
import { getOutcomeLabel, getStepSymbolDisplay } from 'lib/core/automata';
import { cn } from 'lib/utils/cn';
import { AUTOMATON_PRESETS } from '../examples/presets';
import type { Automaton } from 'types/automaton';

interface SimulationPanelProps {
  /** Autómata a simular; por defecto el del store del editor. */
  automaton?: Automaton;
  showPresets?: boolean;
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
  const setInput = useSimulationStore((s) => s.setInput);
  const runSimulation = useSimulationStore((s) => s.runSimulation);
  const nextStep = useSimulationStore((s) => s.nextStep);
  const prevStep = useSimulationStore((s) => s.prevStep);
  const runAll = useSimulationStore((s) => s.runAll);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);

  const currentStep = trace?.steps[currentStepIndex] ?? null;
  const displayOutcome = currentStep?.outcome ?? trace?.finalOutcome ?? 'idle';

  const stateName = (id: string) =>
    automaton.states.find((s) => s.id === id)?.name ?? id;

  const activeNames = useMemo(
    () => currentStep?.activeStateIds.map(stateName).join(', ') ?? '—',
    [currentStep, automaton.states]
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

  return (
    <div className="space-y-4">
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

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={prevStep}
          disabled={!canStep || atStart}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-neutral-600"
        >
          ← Anterior
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={!canStep || atEnd}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-neutral-600"
        >
          Siguiente →
        </button>
        <button
          type="button"
          onClick={runAll}
          disabled={!canStep || atEnd}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-neutral-600"
        >
          Ejecutar todo
        </button>
        <button
          type="button"
          onClick={resetSimulation}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-600"
        >
          Reiniciar
        </button>
      </div>

      {currentStep && (
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
                {automaton.type === 'dfa' ? 'Estado activo:' : 'Estados activos:'}
              </span>{' '}
              <strong>{activeNames || '∅'}</strong>
            </p>
            <p className="mt-2">
              <span className="text-neutral-500">Transición:</span>{' '}
              <strong className="font-mono text-xs">{appliedTransitionLabel}</strong>
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
              <span className="text-neutral-500">Resultado:</span>{' '}
              <strong
                className={cn(
                  displayOutcome === 'accepted' && 'text-green-600 dark:text-green-400',
                  displayOutcome === 'rejected' && 'text-red-600 dark:text-red-400',
                  displayOutcome === 'in_progress' && 'text-blue-600 dark:text-blue-400'
                )}
              >
                {getOutcomeLabel(displayOutcome)}
              </strong>
            </p>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              {currentStep.explanation}
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
                onClick={() =>
                  useSimulationStore.setState({ currentStepIndex: i })
                }
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
