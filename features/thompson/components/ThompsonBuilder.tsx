'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { buildNfaFromRegex } from 'lib/core/thompson/build-nfa';
import { convertNfaToDfa } from 'lib/core/automata';
import { exportAutomatonToJff } from 'lib/jflap';
import { downloadTextFile } from 'lib/utils/download';
import { AutomatonCanvas } from 'features/automata/components/automaton-canvas';
import { SimulationPanel } from 'features/automata/components/simulation-panel';
import { EPSILON_SYMBOL } from 'lib/core/automata';
import type { Automaton } from 'types/automaton';
import { cn } from 'lib/utils/cn';

const EXAMPLES = [
  { label: '(a|b)*abb', regex: '(a|b)*abb' },
  { label: 'a+b', regex: 'a+b' },
  { label: 'a?', regex: 'a?' },
  { label: '[ab]*', regex: '[ab]*' },
  { label: 'ε|a', regex: 'ε|a' },
];

function TransitionTableReadonly({ automaton }: { automaton: Automaton }) {
  const name = (id: string) =>
    automaton.states.find((s) => s.id === id)?.name ?? id;

  if (automaton.transitions.length === 0) {
    return <p className="text-sm text-neutral-500">Sin transiciones.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[400px] text-left text-xs">
        <thead>
          <tr className="border-b dark:border-neutral-700">
            <th className="py-2 pr-2">Desde</th>
            <th className="py-2 pr-2">Símbolo</th>
            <th className="py-2">Hacia</th>
          </tr>
        </thead>
        <tbody>
          {automaton.transitions.map((t) => (
            <tr key={t.id} className="border-b border-neutral-100 dark:border-neutral-800">
              <td className="py-1 pr-2 font-mono">{name(t.from)}</td>
              <td className="py-1 pr-2 font-mono">
                {t.isEpsilon ? EPSILON_SYMBOL : t.symbol}
              </td>
              <td className="py-1 font-mono">{name(t.to)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ThompsonBuilder() {
  const [regex, setRegex] = useState('(a|b)*abb');
  const [result, setResult] = useState<ReturnType<typeof buildNfaFromRegex> | null>(
    null
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [dfa, setDfa] = useState<Automaton | null>(null);

  const handleBuild = () => {
    const built = buildNfaFromRegex(regex);
    setResult(built);
    setStepIndex(0);
    setDfa(null);
  };

  const nfa = result?.automaton ?? null;
  const currentStep = result?.steps[stepIndex];

  const tokenDisplay = useMemo(
    () =>
      result?.tokens
        .map((t) => (t.type === 'CONCAT' ? '·' : `${t.value}(${t.type})`))
        .join(', ') ?? '',
    [result]
  );

  const handleExport = () => {
    if (!nfa || nfa.states.length === 0) return;
    const xml = exportAutomatonToJff(nfa);
    downloadTextFile(xml, 'thompson_nfa.jff');
  };

  const handleConvertDfa = () => {
    if (!nfa) return;
    const conversion = convertNfaToDfa(nfa);
    if (!conversion.error) {
      setDfa(conversion.dfa);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[240px]">
          <label htmlFor="regex-input" className="text-sm font-medium">
            Expresión regular
          </label>
          <input
            id="regex-input"
            type="text"
            value={regex}
            onChange={(e) => setRegex(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
            placeholder="(a|b)*abb"
          />
        </div>
        <button
          type="button"
          onClick={handleBuild}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Construir AFND
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-neutral-500">Ejemplos:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.regex}
            type="button"
            onClick={() => setRegex(ex.regex)}
            className="rounded border px-2 py-1 text-xs dark:border-neutral-600"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {result?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
      )}

      {result && !result.error && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-lg border p-4 dark:border-neutral-700">
              <h3 className="text-sm font-semibold">Tokens</h3>
              <p className="mt-2 font-mono text-xs break-all">{tokenDisplay}</p>
            </section>
            <section className="rounded-lg border p-4 dark:border-neutral-700">
              <h3 className="text-sm font-semibold">Normalizada / Postfix</h3>
              <p className="mt-2 text-xs">
                <span className="text-neutral-500">Normalizada:</span>{' '}
                <span className="font-mono">{result.normalized}</span>
              </p>
              <p className="mt-1 text-xs">
                <span className="text-neutral-500">Postfix:</span>{' '}
                <span className="font-mono">{result.postfix.join(' ')}</span>
              </p>
            </section>
          </div>

          <section className="rounded-lg border p-4 dark:border-neutral-700">
            <h3 className="text-sm font-semibold">Pasos de construcción (Thompson)</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                disabled={stepIndex <= 0}
                className="rounded border px-2 py-1 text-xs disabled:opacity-40"
              >
                ← Anterior
              </button>
              <button
                type="button"
                onClick={() =>
                  setStepIndex((i) =>
                    Math.min(i + 1, result.steps.length - 1)
                  )
                }
                disabled={stepIndex >= result.steps.length - 1}
                className="rounded border px-2 py-1 text-xs disabled:opacity-40"
              >
                Siguiente →
              </button>
              <span className="self-center text-xs text-neutral-500">
                Paso {stepIndex + 1} / {result.steps.length}
              </span>
            </div>
            {currentStep && (
              <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
                {currentStep.description}
              </p>
            )}
            <ol className="mt-3 max-h-40 space-y-1 overflow-y-auto text-xs">
              {result.steps.map((s, i) => (
                <li
                  key={s.index}
                  className={cn(
                    'cursor-pointer rounded px-2 py-1',
                    i === stepIndex
                      ? 'bg-blue-100 dark:bg-blue-950'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  )}
                  onClick={() => setStepIndex(i)}
                >
                  {i + 1}. {s.description}
                </li>
              ))}
            </ol>
          </section>

          {nfa && (
            <>
              <section>
                <h3 className="mb-2 text-sm font-semibold">AFND resultante</h3>
                <AutomatonCanvas automaton={nfa} readOnly className="h-[360px]" />
              </section>

              <section className="rounded-lg border p-4 dark:border-neutral-700">
                <h3 className="mb-2 text-sm font-semibold">Tabla de transiciones</h3>
                <TransitionTableReadonly automaton={nfa} />
              </section>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExport}
                  className="rounded-md border px-4 py-2 text-sm dark:border-neutral-600"
                >
                  Exportar JFLAP
                </button>
                <button
                  type="button"
                  onClick={handleConvertDfa}
                  className="rounded-md border px-4 py-2 text-sm dark:border-neutral-600"
                >
                  Convertir a AFD
                </button>
                <Link
                  href="/automatas/conversion"
                  className="rounded-md border px-4 py-2 text-sm dark:border-neutral-600"
                >
                  Ver conversión detallada →
                </Link>
              </div>

              {dfa && (
                <section>
                  <h3 className="mb-2 text-sm font-semibold">AFD equivalente</h3>
                  <AutomatonCanvas automaton={dfa} readOnly className="h-[320px]" />
                </section>
              )}

              <section className="rounded-lg border p-4 dark:border-neutral-700">
                <h3 className="mb-3 text-sm font-semibold">
                  Simular cadenas sobre el AFND
                </h3>
                <SimulationPanel automaton={nfa} showPresets={false} />
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
