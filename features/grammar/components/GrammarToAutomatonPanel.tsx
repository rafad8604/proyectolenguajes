'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Automaton } from 'types/automaton';
import type { Grammar } from 'types/grammar';
import type { TransitionVisual } from 'types/transition-visual';
import { AutomatonCanvas } from 'features/automata/components/automaton-canvas';
import { SimulationPanel } from 'features/automata/components/simulation-panel';
import { AutomatonTransitionTableReadonly } from 'features/automata/components/automaton-transition-table-readonly';
import { AutomatonFormalDefinitionReadonly } from 'features/automata/components/automaton-formal-definition-readonly';
import { useAutomatonStore } from 'features/automata/store/automaton-store';
import {
  finiteAutomatonFromRegularGrammar,
  NOT_REGULAR_MESSAGE,
} from 'lib/core/grammar/toFiniteAutomaton';
import {
  checkType3,
  getRegularGrammarOrientation,
} from 'lib/core/grammar/chomsky-validation';
import { patchStatePosition, patchTransitionVisual } from 'lib/core/automata';
import { exportToJff, defaultJffFilename } from 'lib/jflap';
import { downloadTextFile } from 'lib/utils/download';

interface GrammarToAutomatonPanelProps {
  grammar: Grammar;
}

export function GrammarToAutomatonPanel({ grammar }: GrammarToAutomatonPanelProps) {
  const loadAutomaton = useAutomatonStore((s) => s.loadAutomaton);
  const [showResult, setShowResult] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [displayAutomaton, setDisplayAutomaton] = useState<Automaton | null>(null);

  const conversion = useMemo(() => {
    if (!showResult) return null;
    return finiteAutomatonFromRegularGrammar(grammar);
  }, [grammar, showResult]);

  const canConvert = useMemo(() => {
    const variables = new Set(grammar.variables);
    const terminals = new Set(grammar.terminals);
    const t3 = checkType3(grammar, variables, terminals);
    return t3.belongs && getRegularGrammarOrientation(grammar) === 'right';
  }, [grammar]);

  const handlePositionChange = useCallback(
    (stateId: string, position: { x: number; y: number }) => {
      setDisplayAutomaton((prev) =>
        prev ? patchStatePosition(prev, stateId, position) : prev
      );
    },
    []
  );

  const handleTransitionVisualChange = useCallback(
    (transitionId: string, partial: Partial<TransitionVisual>) => {
      setDisplayAutomaton((prev) =>
        prev ? patchTransitionVisual(prev, transitionId, partial) : prev
      );
    },
    []
  );

  const handleGenerate = () => {
    setShowResult(true);
    setExportMsg(null);
    const result = finiteAutomatonFromRegularGrammar(grammar);
    if (result.automaton && !result.error) {
      setDisplayAutomaton(structuredClone(result.automaton));
    } else {
      setDisplayAutomaton(null);
    }
  };

  const handleLoadInEditor = () => {
    if (!displayAutomaton) return;
    loadAutomaton(structuredClone(displayAutomaton));
  };

  const handleExportJflap = () => {
    if (!displayAutomaton) return;
    try {
      const xml = exportToJff({ kind: 'automaton', automaton: displayAutomaton });
      const filename = defaultJffFilename({
        kind: 'automaton',
        automaton: displayAutomaton,
      });
      downloadTextFile(xml, filename);
      setExportMsg(`Archivo ${filename} descargado.`);
    } catch (err) {
      setExportMsg(
        err instanceof Error ? err.message : 'No se pudo exportar el autómata.'
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canConvert}
          className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Generar autómata desde gramática regular
        </button>
        {canConvert && (
          <span className="self-center text-xs text-neutral-500">
            Gramática lineal por la derecha detectada.
          </span>
        )}
      </div>

      {!canConvert && grammar.productions.length > 0 && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {(() => {
            const variables = new Set(grammar.variables);
            const terminals = new Set(grammar.terminals);
            if (!checkType3(grammar, variables, terminals).belongs) {
              return NOT_REGULAR_MESSAGE;
            }
            return 'La conversión requiere gramática regular por la derecha (A → aB, A → a o A → ε).';
          })()}
        </p>
      )}

      {showResult && conversion && (
        <div className="space-y-4 border-t pt-4 dark:border-neutral-800">
          {conversion.error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {conversion.error}
            </p>
          ) : displayAutomaton ? (
            <>
              <p className="text-sm text-green-800 dark:text-green-200">
                AFND generado: {displayAutomaton.states.length} estados,{' '}
                {displayAutomaton.transitions.length} transiciones.
              </p>

              {conversion.explanation.length > 0 && (
                <ul className="space-y-1 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs dark:border-neutral-700 dark:bg-neutral-900/40">
                  {conversion.explanation.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              )}

              {conversion.warnings.map((w) => (
                <p
                  key={w}
                  className="text-xs text-amber-800 dark:text-amber-200"
                >
                  {w}
                </p>
              ))}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleLoadInEditor}
                  className="rounded-md border px-3 py-1.5 text-sm dark:border-neutral-600"
                >
                  Abrir en el editor de autómatas
                </button>
                <button
                  type="button"
                  onClick={handleExportJflap}
                  className="rounded-md border px-3 py-1.5 text-sm dark:border-neutral-600"
                >
                  Exportar JFLAP (.jff)
                </button>
                <Link
                  href="/automatas/conversion"
                  onClick={handleLoadInEditor}
                  className="rounded-md border border-blue-300 px-3 py-1.5 text-sm text-blue-700 dark:border-blue-800 dark:text-blue-300"
                >
                  Convertir a AFD (subconjuntos) →
                </Link>
              </div>
              {exportMsg && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {exportMsg}
                </p>
              )}

              <AutomatonCanvas
                automaton={displayAutomaton}
                readOnly
                layoutDraggable
                onStatePositionChange={handlePositionChange}
                onTransitionVisualChange={handleTransitionVisualChange}
                className="h-[360px]"
                ariaLabel="AFND generado desde gramática regular"
              />

              <div className="grid gap-4 lg:grid-cols-2">
                <section className="rounded-lg border p-4 dark:border-neutral-700">
                  <h4 className="mb-3 text-sm font-semibold">Tabla de transiciones</h4>
                  <AutomatonTransitionTableReadonly automaton={displayAutomaton} />
                </section>
                <section className="rounded-lg border p-4 dark:border-neutral-700">
                  <AutomatonFormalDefinitionReadonly automaton={displayAutomaton} />
                </section>
              </div>

              <section className="rounded-lg border p-4 dark:border-neutral-700">
                <h4 className="mb-3 text-sm font-semibold">Simulación</h4>
                <SimulationPanel automaton={displayAutomaton} showPresets={false} />
              </section>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
