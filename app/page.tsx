import { ModuleCard } from 'components/ui/module-card';
import { mainModules } from 'lib/config/navigation';

export default function HomePage() {
  return (
    <section>
      <div className="mb-10">
        <p className="text-sm font-medium uppercase tracking-widest text-blue-600 dark:text-blue-400">
          Bienvenido
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight title sm:text-4xl">
          Laboratorio de Lenguajes Formales
        </h1>
        <p className="mt-4 max-w-3xl text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Construye, edita, simula e importa modelos de teoría de lenguajes:
          autómatas finitos, máquinas de Turing, expresiones regulares,
          gramáticas y el lema de bombeo. Todo el trabajo se realiza en memoria,
          sin base de datos.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mainModules.map((module) => (
          <ModuleCard key={module.href} module={module} />
        ))}
      </div>

      <aside className="mt-10 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
        <strong>Fase 1 completada.</strong> La estructura base y los tipos están
        listos. Los editores gráficos, simuladores y algoritmos se implementarán
        en las siguientes fases.
      </aside>
    </section>
  );
}
