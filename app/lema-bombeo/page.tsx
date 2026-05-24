import type { Metadata } from 'next';
import { ModuleIntro } from 'components/content/ModuleIntro';
import { PumpingLemmaWizard } from 'features/pumping-lemma/components/PumpingLemmaWizard';

export const metadata: Metadata = {
  title: 'Lema de bombeo',
  description:
    'Asistente guiado para aplicar el lema de bombeo: elige p, w, divide en xyz y explora xy^i z.',
};

export default function LemaBombeoPage() {
  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Lema de bombeo</h1>
        <p className="mt-2 max-w-3xl text-neutral-600 dark:text-neutral-400">
          Herramienta educativa paso a paso para analizar lenguajes con el lema de
          bombeo para lenguajes regulares. Verifica las condiciones sobre p, w y la
          división xyz, y genera las cadenas bombeadas xy^i z.
        </p>
      </header>
      <ModuleIntro conceptId="pumping" className="mb-6" />
      <PumpingLemmaWizard />
    </section>
  );
}
