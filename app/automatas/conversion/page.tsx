import type { Metadata } from 'next';
import { NfaToDfaPanel } from 'features/automata/components/nfa-to-dfa-panel';

export const metadata: Metadata = {
  title: 'AFND → AFD',
  description:
    'Conversión de autómatas finitos no deterministas a deterministas por construcción de subconjuntos.',
};

export default function ConversionPage() {
  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Conversión AFND → AFD
        </h1>
        <p className="mt-2 max-w-3xl text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Aplica la construcción por subconjuntos: calcula cerraduras ε, forma
          estados del AFD como conjuntos de estados del AFND y marca como finales
          los subconjuntos que contienen algún estado final original.
        </p>
      </header>
      <NfaToDfaPanel />
    </section>
  );
}
