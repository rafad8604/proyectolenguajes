'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Automaton } from 'types/automaton';
import type { TransitionVisual } from 'types/transition-visual';
import {
  compareSimulations,
  formatVisitedStates,
  getOutcomeLabel,
  getStepSymbolDisplay,
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
  onNfaTransitionVisualChange?: (
    transitionId: string,
    partial: Partial<TransitionVisual>
  ) => void;
  onDfaTransitionVisualChange?: (
    transitionId: string,
    partial: Partial<TransitionVisual>
  ) => void;
}

export function ThompsonComparisonPanel({
  nfa,
  dfa,
  defaultInput = 'aab',
  onNfaPositionChange,
  onDfaPositionChange,
  onNfaTransitionVisualChange,
  onDfaTransitionVisualChange,
}: ThompsonComparisonPanelProps) {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState(defaultInput);
  const [comparison, setComparison] = useState<SimulationComparison | null>(
    null
  );
  const [nfaStepIndex, setNfaStepIndex] = useState(0);
  const [dfaStepIndex, setDfaStepIndex] = useState(0);
  const [playbackSpeedMs, setPlaybackSpeedMs] = useState<number>(
    PLAYBACK_SPEED_OPTIONS[1].ms
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSimulate = useCallback(() => {
    const result = compareSimulations(nfa, dfa, input);
    setComparison(result);
    setNfaStepIndex(0);
    setDfaStepIndex(0);
    setIsPlaying(false);
  }, [nfa, dfa, input]);

  const nfaTrace = comparison?.nfaTrace ?? null;
  const dfaTrace = comparison?.dfaTrace ?? null;
  const nfaStepCount = nfaTrace?.steps.length ?? 0;
  const dfaStepCount = dfaTrace?.steps.length ?? 0;
  const nfaMax = Math.max(0, nfaStepCount - 1);
  const dfaMax = Math.max(0, dfaStepCount - 1);
  const canStep = nfaStepCount > 0 && !nfaTrace?.error;
  const nfaAtEnd = nfaStepIndex >= nfaMax;
  const dfaAtEnd = dfaStepIndex >= dfaMax;
  const bothAtEnd = nfaAtEnd && dfaAtEnd;

  const nfaCurrentStep = nfaTrace?.steps[nfaStepIndex] ?? null;
  const dfaCurrentStep = dfaTrace?.steps[dfaStepIndex] ?? null;

  useEffect(() => {
    if (!isPlaying || !comparison) return;

    const timer = window.setInterval(() => {
      setNfaStepIndex((i) => (i >= nfaMax ? i : i + 1));
      setDfaStepIndex((i) => (i >= dfaMax ? i : i + 1));
    }, playbackSpeedMs);

    return () => window.clearInterval(timer);
  }, [isPlaying, comparison, playbackSpeedMs, nfaMax, dfaMax]);

  useEffect(() => {
    if (isPlaying && bothAtEnd) {
      setIsPlaying(false);
    }
  }, [isPlaying, bothAtEnd]);

  const handleRunAll = () => {
    if (!canStep) return;
    if (bothAtEnd) {
      setNfaStepIndex(0);
      setDfaStepIndex(0);
    }
    setIsPlaying(true);
  };

  const nfaVisited = nfaTrace
    ? formatVisitedStates(nfaTrace, nfa, nfaStepIndex)
    : '—';
  const dfaVisited = dfaTrace
    ? formatVisitedStates(dfaTrace, dfa, dfaStepIndex)
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
                ? ', con ε en ejecución'
                : ''}
            </p>
            <p>
              |Q<sub>DFA</sub>| = {comparison?.structuralSummary.dfaStateCount ?? dfa.states.length}
              , |δ| ={' '}
              {comparison?.structuralSummary.dfaTransitionCount ??
                dfa.transitions.length}
              {comparison?.structuralSummary.dfaHasEpsilon
                ? ', ⚠ con ε (no debería)'
                : ', sin ε (símbolo a símbolo)'}
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

          {nfaTrace?.error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {nfaTrace.error}
            </p>
          )}

          {canStep && (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-medium text-neutral-500">
                    Cinta AFND (paso {nfaStepIndex + 1}/{nfaStepCount})
                  </p>
                  <SimulationTape
                    input={nfaTrace!.input}
                    consumedPrefix={nfaCurrentStep?.consumedPrefix ?? ''}
                    currentSymbol={nfaCurrentStep?.currentSymbol ?? null}
                    inputIndex={nfaCurrentStep?.inputIndex ?? 0}
                  />
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-neutral-500">
                    Cinta AFD (paso {dfaStepIndex + 1}/{dfaStepCount})
                  </p>
                  <SimulationTape
                    input={dfaTrace!.input}
                    consumedPrefix={dfaCurrentStep?.consumedPrefix ?? ''}
                    currentSymbol={dfaCurrentStep?.currentSymbol ?? null}
                    inputIndex={dfaCurrentStep?.inputIndex ?? 0}
                  />
                </div>
              </div>

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
                    setNfaStepIndex((i) => Math.max(i - 1, 0));
                    setIsPlaying(false);
                  }}
                  disabled={!canStep || nfaStepIndex <= 0 || isPlaying}
                  className="rounded border px-2 py-1 text-xs disabled:opacity-40"
                >
                  ← AFND
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNfaStepIndex((i) => Math.min(i + 1, nfaMax));
                    setIsPlaying(false);
                  }}
                  disabled={!canStep || nfaAtEnd || isPlaying}
                  className="rounded border px-2 py-1 text-xs disabled:opacity-40"
                >
                  AFND →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDfaStepIndex((i) => Math.max(i - 1, 0));
                    setIsPlaying(false);
                  }}
                  disabled={!canStep || dfaStepIndex <= 0 || isPlaying}
                  className="rounded border px-2 py-1 text-xs disabled:opacity-40"
                >
                  ← AFD
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDfaStepIndex((i) => Math.min(i + 1, dfaMax));
                    setIsPlaying(false);
                  }}
                  disabled={!canStep || dfaAtEnd || isPlaying}
                  className="rounded border px-2 py-1 text-xs disabled:opacity-40"
                >
                  AFD →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNfaStepIndex((i) => Math.min(i + 1, nfaMax));
                    setDfaStepIndex((i) => Math.min(i + 1, dfaMax));
                    setIsPlaying(false);
                  }}
                  disabled={!canStep || bothAtEnd || isPlaying}
                  className="rounded border px-2 py-1 text-xs disabled:opacity-40"
                >
                  Siguiente ambos
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
                    setNfaStepIndex(0);
                    setDfaStepIndex(0);
                    setIsPlaying(false);
                  }}
                  className="rounded border px-2 py-1 text-xs"
                >
                  Reiniciar
                </button>
              </div>
            </>
          )}

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
                onTransitionVisualChange={onNfaTransitionVisualChange}
                trace={nfaTrace}
                stepIndex={nfaStepIndex}
                className="h-[280px]"
                ariaLabel="AFND Thompson en comparación"
              />
              <p className="mt-2 text-xs">
                <span className="text-neutral-500">Recorrido:</span> {nfaVisited}
              </p>
              {nfaCurrentStep && (
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                  {getStepSymbolDisplay(nfaCurrentStep) !== '—' && (
                    <span className="font-mono">
                      [{getStepSymbolDisplay(nfaCurrentStep)}]{' '}
                    </span>
                  )}
                  {nfaCurrentStep.explanation}
                </p>
              )}
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
                onTransitionVisualChange={onDfaTransitionVisualChange}
                trace={dfaTrace}
                stepIndex={dfaStepIndex}
                className="h-[280px]"
                ariaLabel="AFD equivalente en comparación"
              />
              <p className="mt-2 text-xs">
                <span className="text-neutral-500">Recorrido:</span> {dfaVisited}
              </p>
              {dfaCurrentStep && (
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                  {dfaCurrentStep.kind === 'consume' && dfaCurrentStep.currentSymbol && (
                    <span className="font-mono">[{dfaCurrentStep.currentSymbol}] </span>
                  )}
                  {dfaCurrentStep.explanation}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
