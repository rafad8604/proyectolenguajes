import type { Metadata } from 'next';
import { ModuleIntro } from 'components/content/ModuleIntro';
import { TuringEditor } from 'features/turing/components/TuringEditor';

export const metadata: Metadata = {
  title: 'Máquinas de Turing',
  description:
    'Constructor y simulador de máquinas de Turing de 1 y 2 bandas.',
};

export default function TuringPage() {
  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Máquinas de Turing
        </h1>
        <p className="mt-2 max-w-3xl text-neutral-600 dark:text-neutral-400">
          Diseña máquinas de 1 o 2 bandas, configura alfabetos, estados de
          aceptación/rechazo y simula la ejecución paso a paso con visualización
          de cinta(s) y cabezal(es).
        </p>
      </header>
      <ModuleIntro conceptId="turing" className="mb-6" />
      <TuringEditor />
    </section>
  );
}
