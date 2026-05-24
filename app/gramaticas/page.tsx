import type { Metadata } from 'next';
import { GrammarEditor } from 'features/grammar/components/GrammarEditor';
import { GramaticasFromAutomatonPage } from 'features/grammar/components/gramaticas-from-automaton';

export const metadata: Metadata = {
  title: 'Gramáticas',
  description:
    'Editor de gramáticas formales, clasificación en la jerarquía de Chomsky y generación desde autómatas.',
};

export default function GramaticasPage() {
  return (
    <section className="space-y-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Gramáticas formales</h1>
        <p className="mt-2 max-w-3xl text-neutral-600 dark:text-neutral-400">
          Ingresa una gramática, valida sus producciones y clasifícala según la
          jerarquía de Chomsky. También puedes generar una gramática regular (tipo
          3) equivalente a un autómata finito.
        </p>
      </header>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Editor y jerarquía de Chomsky</h2>
        <GrammarEditor />
      </div>

      <div className="border-t pt-8 dark:border-neutral-800">
        <h2 className="mb-4 text-lg font-semibold">
          Gramática regular desde autómata
        </h2>
        <GramaticasFromAutomatonPage />
      </div>
    </section>
  );
}
