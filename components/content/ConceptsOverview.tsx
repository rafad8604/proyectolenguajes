import Link from 'next/link';
import { concepts } from 'lib/config/concepts';

export function ConceptsOverview() {
  return (
    <section aria-labelledby="concepts-heading">
      <h2 id="concepts-heading" className="text-xl font-semibold tracking-tight">
        Conceptos del laboratorio
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-neutral-600 dark:text-neutral-400">
        Resumen de los modelos que puedes construir y analizar en esta aplicación.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {concepts.map((concept) => (
          <li key={concept.id}>
            <article className="h-full rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="font-semibold">{concept.shortTitle}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {concept.summary}
              </p>
              {concept.href && (
                <Link
                  href={concept.href}
                  className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  Ir al módulo →
                </Link>
              )}
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
