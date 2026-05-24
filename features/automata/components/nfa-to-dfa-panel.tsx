'use client';

import Link from 'next/link';
import { useAutomatonStore } from '../store/automaton-store';
import { useConversionStore } from '../store/conversion-store';
import { AutomatonCanvas } from './automaton-canvas';
import { SimulationPanel } from './simulation-panel';
import { serializeAutomatonToJflap } from 'lib/jflap';
import { downloadTextFile } from 'lib/utils/download';
import { cn } from 'lib/utils/cn';
import { PresetBar } from 'components/ui/preset-bar';
import { NFA_EPSILON, NFA_ENDS_WITH_A } from '../examples/presets';

export function NfaToDfaPanel() {
  const nfa = useAutomatonStore((s) => s.automaton);
  const loadAutomaton = useAutomatonStore((s) => s.loadAutomaton);

  const result = useConversionStore((s) => s.result);
  const currentStepIndex = useConversionStore((s) => s.currentStepIndex);
  const convert = useConversionStore((s) => s.convert);
  const nextStep = useConversionStore((s) => s.nextStep);
  const prevStep = useConversionStore((s) => s.prevStep);
  const goToStep = useConversionStore((s) => s.goToStep);
  const reset = useConversionStore((s) => s.reset);

  const dfa = result?.dfa ?? null;
  const table = result?.table ?? [];
  const steps = result?.steps ?? [];
  const currentStep = steps[currentStepIndex];

  const handleConvert = () => convert(structuredClone(nfa));

  const handleExportJflap = () => {
    if (!dfa) return;
    const xml = serializeAutomatonToJflap(dfa);
    const safeName = dfa.name.replace(/[^\w\-]+/g, '_').slice(0, 40);
    downloadTextFile(xml, `${safeName}.jff`);
  };

  const formatNfaStates = (ids: string[]) =>
    ids
      .map((id) => nfa.states.find((s) => s.id === id)?.name ?? id)
      .join(', ');

  const handleNfaPreset = (id: string) => {
    const map = {
      'nfa-epsilon': NFA_EPSILON,
      'nfa-ends-a': NFA_ENDS_WITH_A,
    } as const;
    const preset = map[id as keyof typeof map];
    if (preset) {
      loadAutomaton(structuredClone(preset));
      reset();
    }
  };

  return (
    <div className="space-y-6">
      <PresetBar
        label="Ejemplos AFND"
        presets={[
          { id: 'nfa-epsilon', label: 'AFND con ε' },
          { id: 'nfa-ends-a', label: 'AFND termina en a' },
        ]}
        onSelect={handleNfaPreset}
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleConvert}
          disabled={nfa.type !== 'nfa'}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Convertir AFND actual → AFD
        </button>
        <Link
          href="/automatas"
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Editar AFND en el constructor
        </Link>
      </div>

      {nfa.type !== 'nfa' && (
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Cambia el tipo a AFND en el{' '}
          <Link href="/automatas" className="underline">
            constructor
          </Link>{' '}
          o carga el ejemplo con transición ε.
        </p>
      )}

      {result?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
      )}

      {result && !result.error && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <section>
              <h3 className="mb-2 text-sm font-semibold">AFND original</h3>
              <AutomatonCanvas automaton={nfa} readOnly className="h-[320px]" />
            </section>
            <section>
              <h3 className="mb-2 text-sm font-semibold">AFD resultante</h3>
              {dfa ? (
                <AutomatonCanvas automaton={dfa} readOnly className="h-[320px]" />
              ) : (
                <p className="text-sm text-neutral-500">Sin AFD generado.</p>
              )}
            </section>
          </div>

          <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="text-sm font-semibold">Explicación paso a paso</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStepIndex <= 0}
                className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 dark:border-neutral-600"
              >
                ← Anterior
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={currentStepIndex >= steps.length - 1}
                className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 dark:border-neutral-600"
              >
                Siguiente →
              </button>
              <span className="self-center text-xs text-neutral-500">
                Paso {currentStepIndex + 1} / {steps.length}
              </span>
            </div>
            {currentStep && (
              <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {currentStep.explanation}
              </p>
            )}
            <ol className="mt-4 max-h-40 space-y-1 overflow-y-auto text-xs">
              {steps.map((step) => (
                <li
                  key={step.index}
                  className={cn(
                    'cursor-pointer rounded px-2 py-1',
                    step.index === currentStepIndex
                      ? 'bg-blue-100 dark:bg-blue-950'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  )}
                  onClick={() => goToStep(step.index)}
                >
                  {step.index + 1}. {step.explanation}
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="mb-3 text-sm font-semibold">
              Tabla de conversión (construcción por subconjuntos)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="py-2 pr-2 font-medium">Estado AFD</th>
                    <th className="py-2 pr-2 font-medium">Σ</th>
                    <th className="py-2 pr-2 font-medium">Movimiento (sin ε)</th>
                    <th className="py-2 pr-2 font-medium">Cerradura ε</th>
                    <th className="py-2 font-medium">Destino AFD</th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((row, i) => (
                    <tr
                      key={`${row.sourceDfaStateId}-${row.symbol}-${i}`}
                      className={cn(
                        'border-b border-neutral-100 dark:border-neutral-800',
                        currentStep?.relatedRowIndex === i &&
                          'bg-blue-50 ring-1 ring-inset ring-blue-400 dark:bg-blue-950/40'
                      )}
                    >
                      <td className="py-2 pr-2 font-mono">
                        {row.sourceSubsetLabel}
                      </td>
                      <td className="py-2 pr-2 font-mono">{row.symbol}</td>
                      <td className="py-2 pr-2 font-mono">
                        {row.nfaStatesAfterSymbol.length > 0
                          ? `{${formatNfaStates(row.nfaStatesAfterSymbol)}}`
                          : '∅'}
                      </td>
                      <td className="py-2 pr-2 font-mono">
                        {row.epsilonClosure.length > 0
                          ? row.targetSubsetLabel
                          : '—'}
                      </td>
                      <td className="py-2 font-mono">
                        {row.targetSubsetLabel}
                        {row.isNewState && (
                          <span className="ml-1 text-blue-600 dark:text-blue-400">
                            (nuevo)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {dfa && (
            <>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExportJflap}
                  className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-600 dark:hover:bg-neutral-800"
                >
                  Exportar AFD a JFLAP (.jff)
                </button>
              </div>

              <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
                <h3 className="mb-3 text-sm font-semibold">
                  Simular el AFD resultante
                </h3>
                <SimulationPanel automaton={dfa} showPresets={false} />
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
