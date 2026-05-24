import type { Metadata } from 'next';
import { ModuleIntro } from 'components/content/ModuleIntro';
import { JflapImportExport } from 'features/jflap/components/JflapImportExport';

export const metadata: Metadata = {
  title: 'Importar / Exportar JFLAP',
  description:
    'Importa y exporta autómatas y máquinas de Turing en formato .jff compatible con JFLAP.',
};

export default function JflapPage() {
  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Importar / Exportar JFLAP
        </h1>
        <p className="mt-2 max-w-3xl text-neutral-600 dark:text-neutral-400">
          Carga ejercicios desde archivos .jff de JFLAP o descarga los modelos
          que construyas en la aplicación. Todo se procesa en el navegador, sin
          base de datos.
        </p>
      </header>
      <ModuleIntro conceptId="jflap" className="mb-6" />
      <JflapImportExport mode="auto" redirectOnImport={false} />
    </section>
  );
}
