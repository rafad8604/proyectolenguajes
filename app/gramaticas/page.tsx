import type { Metadata } from 'next';
import { GramaticasFromAutomatonPage } from 'features/grammar/components/gramaticas-from-automaton';

export const metadata: Metadata = {
  title: 'Gramáticas',
  description:
    'Generación de gramáticas regulares equivalentes desde autómatas finitos.',
};

export default function GramaticasPage() {
  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Gramáticas formales</h1>
        <p className="mt-2 max-w-3xl text-neutral-600 dark:text-neutral-400">
          Genera una gramática regular (tipo 3) equivalente a un AFD o AFND
          mediante la construcción estándar estado → variable.
        </p>
      </header>
      <GramaticasFromAutomatonPage />
    </section>
  );
}
