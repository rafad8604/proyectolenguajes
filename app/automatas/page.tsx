import type { Metadata } from 'next';
import { AutomatonEditor } from 'features/automata/components/automaton-editor';

export const metadata: Metadata = {
  title: 'Autómatas finitos',
  description:
    'Constructor gráfico de AFD y AFND con tabla de transiciones y definición formal.',
};

export default function AutomatasPage() {
  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Autómatas finitos
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Construye un AFD o AFND arrastrando estados, conectando transiciones y
          editando la tabla. La definición formal y las validaciones se actualizan
          en tiempo real.
        </p>
      </header>
      <AutomatonEditor />
    </section>
  );
}
