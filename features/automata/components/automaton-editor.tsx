'use client';

import { AutomatonCanvas } from './automaton-canvas';
import { StateToolbar } from './state-toolbar';
import { StateProperties } from './state-properties';
import { TransitionForm } from './transition-form';
import { TransitionTable } from './transition-table';
import { FormalDefinitionPanel } from './formal-definition-panel';
import { ValidationPanel } from './validation-panel';

export function AutomatonEditor() {
  return (
    <div className="space-y-4">
      <StateToolbar />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <AutomatonCanvas />
        <aside className="space-y-4">
          <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <StateProperties />
          </section>
          <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <TransitionForm />
          </section>
        </aside>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <h3 className="mb-3 text-sm font-semibold">Tabla de transiciones</h3>
          <TransitionTable />
        </section>
        <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <FormalDefinitionPanel />
        </section>
      </div>
      <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <ValidationPanel />
      </section>
    </div>
  );
}
