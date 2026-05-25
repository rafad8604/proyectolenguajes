'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Automaton } from 'types/automaton';
import {
  compareSimulations,
  formatVisitedStates,
  getOutcomeLabel,
  type SimulationComparison,
} from 'lib/core/automata';
import { AutomatonCanvas } from 'features/automata/components/automaton-canvas';
import { SimulationTape } from 'features/automata/components/simulation-tape';
import { PLAYBACK_SPEED_OPTIONS } from 'features/automata/store/simulation-store';
import { cn } from 'lib/utils/cn';

interface ThompsonComparisonPanelProps {
  nfa: Automaton;
  dfa: Automaton;
  defaultInput?: string;
  onNfaPositionChange?: (
    stateId: string,
    position: { x: number; y: number }
  ) => void;
  onDfaPositionChange?: (
    stateId: string,
    position: { x: number; y: number }
  ) => void;
}

export function ThompsonComparisonPanel({
  nfa,
  dfa,
  defaultInput = 'aab',
  onNfaPositionChange,
  onDfaPositionChange,
}: ThompsonComparisonPanelProps) {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState(defaultInput);
  const [comparison, setComparison] = useState<SimulationComparison | null>(
    null
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [playbackSpeedMs, setPlaybackSpeedMs] = useState<number>(
    PLAYBACK_SPEED_OPTIONS[1].ms
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSimulate = useCallback(() => {
    const result = compareSimulations(nfa, dfa, input);
    setComparison(result);
    setStepIndex(0);
    setIsPlaying(false);
  }, [nfa, dfa, input]);

  const nfaTrace = comparison?.nfaTrace ?? null;
  const dfaTrace = comparison?.dfaTrace ?? null;
  const canStep =
    nfaTrace !== null && nfaTrace.steps.length > 0 && !nfaTrace.error;
  const atEnd =
    nfaTrace !== null && stepIndex >= nfaTrace.steps.length - 1;
  const atStart = stepIndex <= 0;

  useEffect(() => {
    if (!isPlaying || !nfaTrace || nfaTrace.steps.length === 0) return;

    const timer = window.setInterval(() => {
      setStepIndex((i) => {
        const max = nfaTrace.steps.length - 1;
        if (i >= max) {
          setIsPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, playbackSpeedMs);

    return () => window.clearInterval(timer);
  }, [isPlaying, nfaTrace, playbackSpeedMs]);

  const currentStep = nfaTrace?.steps[stepIndex] ?? null;

  const handleRunAll = () => {
    if (!canStep) return;
    if (atEnd) setStepIndex(0);
    setIsPlaying(true);
  };

  const nfaVisited = nfaTrace
    ? formatVisitedStates(nfaTrace, nfa, stepIndex)
    : '—';
  const dfaVisited = dfaTrace
    ? formatVisitedStates(dfaTrace, dfa, stepIndex)
    : '—';

  return (
    <section className="rounded-lg border dark:border-neutral-700">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
      >
        Comparar AFND y AFD (misma cadena)
        <span className="text-neutral-400">{open ? '▼' : '▶'}</span>
      </button>

      {open && (
        <div className="space-y-4 border-t px-4 py-4 dark:border-neutral-700">
          {comparison && (
            <div
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium',
                comparison.outcomesMatch
                  ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300'
                  : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300'
              )}
            >
              {comparison.outcomesMatch
                ? 'Resultados coinciden'
                : 'Resultados difieren'}{' '}
              — NFA: {getOutcomeLabel(comparison.nfaOutcome)} · AFD:{' '}
              {getOutcomeLabel(comparison.dfaOutcome)}
            </div>
          )}

          <div className="grid gap-2 text-xs text-neutral-600 dark:text-neutral-400 sm:grid-cols-2">
            <p>
              |Q<sub>NFA</sub>| = {comparison?.structuralSummary.nfaStateCount ?? nfa.states.length}
              , |δ| ={' '}
              {comparison?.structuralSummary.nfaTransitionCount ??
                nfa.transitions.length}
              {comparison?.structuralSummary.nfaHasEpsilon !== false
                ? ', con ε'
                : ''}
            </p>
            <p>
              |Q<sub>DFA</sub>| = {comparison?.structuralSummary.dfaStateCount ?? dfa.states.length}
              , |δ| ={' '}
              {comparison?.structuralSummary.dfaTransitionCount ??
                dfa.transitions.length}
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[200px] flex-1">
              <label htmlFor="thompson-compare-input" className="text-sm font-medium">
                Cadena compartida
              </label>
              <input
                id="thompson-compare-input"
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setComparison(null);
                }}
                className="mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
              />
            </div>
            <button
              type="button"
              onClick={handleSimulate}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Simular en ambos
            </button>
          </div>

          {nfaTrace && !nfaTrace.error && (
            <SimulationTape
              input={nfaTrace.input}
              consumedPrefix={currentStep?.consumedPrefix ?? ''}
              currentSymbol={currentStep?.currentSymbol ?? null}
              inputIndex={currentStep?.inputIndex ?? 0}
            />
          )}

          {nfaTrace?.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {nfaTrace.error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={playbackSpeedMs}
              onChange={(e) => setPlaybackSpeedMs(Number(e.target.value))}
              className="rounded-md border px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800"
              aria-label="Velocidad"
            >
              {PLAYBACK_SPEED_OPTIONS.map((opt) => (
                <option key={opt.ms} value={opt.ms}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setStepIndex((i) => Math.max(i - 1, 0));
                setIsPlaying(false);
              }}
              disabled={!canStep || atStart || isPlaying}
              className="rounded border px-2 py-1 text-xs disabled:opacity-40"
            >
              ← Anterior
            </button>
            <button
              type="button"
              onClick={() => setStepIndex((i) => i + 1)}
              disabled={!canStep || atEnd || isPlaying}
              className="rounded border px-2 py-1 text-xs disabled:opacity-40"
            >
              Siguiente →
            </button>
            <button
              type="button"
              onClick={handleRunAll}
              disabled={!canStep || isPlaying}
              className="rounded border px-2 py-1 text-xs disabled:opacity-40"
            >
              Ejecutar todo
            </button>
            {isPlaying ? (
              <button
                type="button"
                onClick={() => setIsPlaying(false)}
                className="rounded bg-amber-600 px-2 py-1 text-xs text-white"
              >
                Pausa
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setComparison(null);
                setStepIndex(0);
                setIsPlaying(false);
              }}
              className="rounded border px-2 py-1 text-xs"
            >
              Reiniciar
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <h4 className="mb-1 text-xs font-semibold text-neutral-500">
                AFND Thompson
              </h4>
              <AutomatonCanvas
                automaton={nfa}
                readOnly
                layoutDraggable
                onStatePositionChange={onNfaPositionChange}
                trace={nfaTrace}
                stepIndex={stepIndex}
                className="h-[280px]"
                ariaLabel="AFND Thompson en comparación"
              />
              <p className="mt-2 text-xs">
                <span className="text-neutral-500">Recorrido:</span> {nfaVisited}
              </p>
            </div>
            <div>
              <h4 className="mb-1 text-xs font-semibold text-neutral-500">
                AFD equivalente
              </h4>
              <AutomatonCanvas
                automaton={dfa}
                readOnly
                layoutDraggable
                onStatePositionChange={onDfaPositionChange}
                trace={dfaTrace}
                stepIndex={stepIndex}
                className="h-[280px]"
                ariaLabel="AFD equivalente en comparación"
              />
              <p className="mt-2 text-xs">
                <span className="text-neutral-500">Recorrido:</span> {dfaVisited}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
