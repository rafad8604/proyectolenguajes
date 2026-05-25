'use client';

import { useTuringStore } from '../store/turing-store';
import { TuringStatePanel } from './TuringStatePanel';
import { TuringTransitionTable } from './TuringTransitionTable';
import { TuringSimulationPanel } from './TuringSimulationPanel';
import { TuringCanvas } from './TuringCanvas';
import { TuringTransitionForm } from './TuringTransitionForm';
import { JflapImportExport } from 'features/jflap/components/JflapImportExport';

function parseSymbolList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function TuringEditor() {
  const machine = useTuringStore((s) => s.machine);
  const setTapeCount = useTuringStore((s) => s.setTapeCount);
  const setInputAlphabet = useTuringStore((s) => s.setInputAlphabet);
  const setTapeAlphabet = useTuringStore((s) => s.setTapeAlphabet);
  const setBlankSymbol = useTuringStore((s) => s.setBlankSymbol);
  const reset = useTuringStore((s) => s.reset);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="mb-3 text-sm font-semibold">JFLAP (.jff)</h2>
        <JflapImportExport mode="turing" />
      </section>
      <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="mb-3 text-sm font-semibold">Configuración</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-neutral-500">
              Tipo de máquina
            </label>
            <select
              value={machine.tapeCount}
              onChange={(e) =>
                setTapeCount(Number(e.target.value) as 1 | 2)
              }
              className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm dark:bg-neutral-800"
            >
              <option value={1}>1 banda</option>
              <option value={2}>2 bandas</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500">
              Alfabeto de entrada Σ
            </label>
            <input
              type="text"
              value={machine.inputAlphabet.join(', ')}
              onChange={(e) => setInputAlphabet(parseSymbolList(e.target.value))}
              className="mt-1 w-full rounded-md border px-2 py-1.5 font-mono text-sm dark:bg-neutral-800"
              placeholder="0, 1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500">
              Alfabeto de cinta Γ
            </label>
            <input
              type="text"
              value={machine.tapeAlphabet.join(', ')}
              onChange={(e) => setTapeAlphabet(parseSymbolList(e.target.value))}
              className="mt-1 w-full rounded-md border px-2 py-1.5 font-mono text-sm dark:bg-neutral-800"
              placeholder="0, 1, _"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500">
              Símbolo blanco
            </label>
            <input
              type="text"
              maxLength={1}
              value={machine.blankSymbol}
              onChange={(e) => setBlankSymbol(e.target.value || '_')}
              className="mt-1 w-full rounded-md border px-2 py-1.5 font-mono text-sm dark:bg-neutral-800"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={reset}
              className="rounded-md border px-3 py-1.5 text-sm dark:border-neutral-600"
            >
              Reiniciar máquina
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="mb-3 text-sm font-semibold">Diagrama</h2>
          <TuringCanvas />
        </section>
        <aside className="space-y-4">
          <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <h2 className="mb-3 text-sm font-semibold">Estados</h2>
            <TuringStatePanel />
          </section>
          <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <TuringTransitionForm />
          </section>
        </aside>
      </div>

      <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="mb-3 text-sm font-semibold">Tabla de transiciones δ</h2>
        <TuringTransitionTable />
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="mb-3 text-sm font-semibold">Simulación</h2>
        <TuringSimulationPanel />
      </section>
    </div>
  );
}
