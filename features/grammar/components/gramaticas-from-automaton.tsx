'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Automaton } from 'types/automaton';
import { GrammarViewer } from 'features/grammar/components/GrammarViewer';
import { useAutomatonStore } from 'features/automata/store/automaton-store';
import {
  DFA_ENDS_WITH_AB,
  NFA_ENDS_WITH_A,
  NFA_EPSILON,
} from 'features/automata/examples/presets';
import {
  isAutomatonReady,
  isBlankAutomaton,
  summarizeAutomaton,
} from 'lib/core/automata/automaton-summary';
import { cn } from 'lib/utils/cn';

type GrammarSource =
  | { kind: 'current' }
  | { kind: 'example'; label: string; automaton: Automaton };

const EXAMPLE_PRESETS: Array<{ label: string; automaton: Automaton }> = [
  { label: 'AFD: termina en ab', automaton: DFA_ENDS_WITH_AB },
  { label: 'AFND: con ε', automaton: NFA_EPSILON },
  { label: 'AFND: termina en a', automaton: NFA_ENDS_WITH_A },
];

function AutomatonSummaryCard({
  summary,
  badge,
}: {
  summary: ReturnType<typeof summarizeAutomaton>;
  badge: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-700 dark:bg-neutral-900/40">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-200">
          {badge}
        </span>
        <span className="font-semibold">{summary.name}</span>
        <span className="text-xs text-neutral-500">({summary.typeLabel})</span>
      </div>
      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-neutral-500">Estados</dt>
          <dd className="font-mono">{summary.stateCount}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Transiciones</dt>
          <dd className="font-mono">{summary.transitionCount}</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Alfabeto (Σ)</dt>
          <dd className="font-mono">
            {summary.alphabet.length > 0
              ? `{${summary.alphabet.join(', ')}}`
              : '∅'}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Estado inicial</dt>
          <dd className="font-mono">{summary.initialState ?? '—'}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-neutral-500">Estados finales</dt>
          <dd className="font-mono">
            {summary.acceptingStates.length > 0
              ? summary.acceptingStates.join(', ')
              : '—'}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function GramaticasFromAutomatonPage() {
  const storeAutomaton = useAutomatonStore((s) => s.automaton);
  const [selectedSource, setSelectedSource] = useState<GrammarSource | null>(
    null
  );
  const [showGrammar, setShowGrammar] = useState(false);

  const currentSummary = useMemo(
    () => summarizeAutomaton(storeAutomaton),
    [storeAutomaton]
  );

  const activeAutomaton = useMemo((): Automaton | null => {
    if (!selectedSource) return null;
    if (selectedSource.kind === 'current') return storeAutomaton;
    return selectedSource.automaton;
  }, [selectedSource, storeAutomaton]);

  const activeSummary = useMemo(
    () => (activeAutomaton ? summarizeAutomaton(activeAutomaton) : null),
    [activeAutomaton]
  );

  const canGenerateCurrent = isAutomatonReady(storeAutomaton);
  const hasUserAutomaton = !isBlankAutomaton(storeAutomaton);

  const handleSelectExample = (label: string, automaton: Automaton) => {
    setSelectedSource({
      kind: 'example',
      label,
      automaton: structuredClone(automaton),
    });
    setShowGrammar(false);
  };

  const handleGenerate = () => {
    if (!selectedSource) return;
    const automaton =
      selectedSource.kind === 'current'
        ? storeAutomaton
        : selectedSource.automaton;
    if (!isAutomatonReady(automaton)) return;
    setShowGrammar(true);
  };

  const sourceBadge =
    selectedSource?.kind === 'current'
      ? 'Autómata actual (constructor)'
      : selectedSource?.kind === 'example'
        ? `Ejemplo: ${selectedSource.label}`
        : null;

  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Genera una gramática regular (tipo 3) equivalente al autómata que
        construiste en{' '}
        <Link href="/automatas" className="font-medium text-blue-600 underline dark:text-blue-400">
          Autómatas finitos
        </Link>
        . El autómata se conserva al cambiar de módulo (almacenamiento local del
        navegador).
      </p>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Autómata actual en memoria</h3>
        {hasUserAutomaton ? (
          <AutomatonSummaryCard
            summary={currentSummary}
            badge="Autómata del constructor"
          />
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            No hay un autómata creado actualmente. Primero construye o importa
            un autómata en el módulo de{' '}
            <Link href="/automatas" className="font-medium underline">
              Autómatas
            </Link>
            .
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              if (!canGenerateCurrent) return;
              setSelectedSource({ kind: 'current' });
              setShowGrammar(true);
            }}
            disabled={!canGenerateCurrent}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generar gramática desde autómata actual
          </button>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-dashed border-neutral-300 p-4 dark:border-neutral-600">
        <div>
          <h3 className="text-sm font-semibold">Ejemplos precargados</h3>
          <p className="mt-1 text-xs text-neutral-500">
            Solo para demostración. No modifican el autómata que guardaste en el
            constructor.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleSelectExample(preset.label, preset.automaton)}
              className={cn(
                'rounded-md border px-3 py-1.5 text-xs dark:border-neutral-600',
                selectedSource?.kind === 'example' &&
                  selectedSource.label === preset.label &&
                  'border-blue-500 bg-blue-50 dark:bg-blue-950'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
        {selectedSource?.kind === 'example' && activeSummary && (
          <>
            <AutomatonSummaryCard
              summary={activeSummary}
              badge={`Ejemplo — ${selectedSource.label}`}
            />
            <button
              type="button"
              onClick={handleGenerate}
              className="rounded-md border px-4 py-2 text-sm font-medium dark:border-neutral-600"
            >
              Generar gramática desde este ejemplo
            </button>
          </>
        )}
      </section>

      {showGrammar && activeAutomaton && sourceBadge && activeSummary?.isReady && (
        <section className="space-y-3 border-t pt-6 dark:border-neutral-800">
          <p className="text-xs font-medium text-neutral-500">Fuente: {sourceBadge}</p>
          <GrammarViewer automaton={activeAutomaton} />
        </section>
      )}
    </div>
  );
}
