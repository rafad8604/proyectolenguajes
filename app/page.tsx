import Link from 'next/link';
import { ModuleCard } from 'components/ui/module-card';
import { ConceptsOverview } from 'components/content/ConceptsOverview';
import { mainModules } from 'lib/config/navigation';

export default function HomePage() {
  return (
    <>
      <section>
        <div className="mb-10">
          <p className="text-sm font-medium uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Proyecto final — Teoría de lenguajes
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight title sm:text-4xl">
            Laboratorio de Lenguajes Formales
          </h1>
          <p className="mt-4 max-w-3xl text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Construye, edita, simula e importa modelos de teoría de lenguajes:
            autómatas finitos, máquinas de Turing, expresiones regulares,
            gramáticas y el lema de bombeo. Todo el trabajo se realiza en memoria,
            en el navegador, sin base de datos.
          </p>
          <Link
            href="/acerca"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Acerca del proyecto →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mainModules.map((module) => (
            <ModuleCard key={module.href} module={module} />
          ))}
        </div>
      </section>

      
    </>
  );
}
