import type { Metadata } from 'next';
import Link from 'next/link';
import { concepts } from 'lib/config/concepts';
import { mainModules } from 'lib/config/navigation';

export const metadata: Metadata = {
  title: 'Acerca del proyecto',
  description:
    'Proyecto educativo de teoría de lenguajes formales: objetivos, módulos y limitaciones.',
};

export default function AcercaPage() {
  return (
    <section className="space-y-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Acerca del proyecto</h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-neutral-600 dark:text-neutral-400">
          <strong>Laboratorio de Lenguajes Formales</strong> es una aplicación web
          educativa desarrollada como proyecto final de teoría de lenguajes. Permite
          construir, simular y analizar modelos clásicos sin instalar software de
          escritorio: todo el procesamiento ocurre en el navegador, sin base de datos.
        </p>
      </header>

      <section aria-labelledby="objetivos">
        <h2 id="objetivos" className="text-lg font-semibold">
          Objetivos
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-neutral-700 dark:text-neutral-300">
          <li>Facilitar la comprensión visual de AFD, AFND, máquinas de Turing y gramáticas.</li>
          <li>Ofrecer algoritmos explicados en español (Thompson, subconjuntos, lema de bombeo).</li>
          <li>Integrar flujo de trabajo con JFLAP mediante archivos .jff.</li>
          <li>Servir como material de estudio y demostración en presentaciones académicas.</li>
        </ul>
      </section>

      <section aria-labelledby="tecnologias">
        <h2 id="tecnologias" className="text-lg font-semibold">
          Tecnologías
        </h2>
        <p className="mt-3 text-neutral-700 dark:text-neutral-300">
          Next.js 16, React 19, TypeScript estricto, Tailwind CSS v4, Zustand para
          estado en memoria, React Flow para grafos de autómatas y{' '}
          <code className="rounded bg-neutral-100 px-1 font-mono text-sm dark:bg-neutral-800">
            fast-xml-parser
          </code>{' '}
          para JFLAP.
        </p>
      </section>

      <section aria-labelledby="conceptos-acerca">
        <h2 id="conceptos-acerca" className="text-lg font-semibold">
          Conceptos implementados
        </h2>
        <dl className="mt-4 space-y-6">
          {concepts.map((c) => (
            <div key={c.id}>
              <dt className="font-semibold">{c.title}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {c.summary}
                {c.href && (
                  <>
                    {' '}
                    <Link
                      href={c.href}
                      className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Abrir módulo
                    </Link>
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="modulos-acerca">
        <h2 id="modulos-acerca" className="text-lg font-semibold">
          Módulos de la aplicación
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {mainModules.map((m) => (
            <li key={m.href}>
              <Link
                href={m.href}
                className="block rounded-lg border p-3 transition-colors hover:border-blue-300 dark:border-neutral-700 dark:hover:border-blue-700"
              >
                <span className="font-medium">{m.label}</span>
                <p className="mt-1 text-xs text-neutral-500">{m.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/40"
        aria-labelledby="limitaciones"
      >
        <h2 id="limitaciones" className="font-semibold text-amber-950 dark:text-amber-100">
          Limitaciones conocidas
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-900 dark:text-amber-200">
          <li>No hay persistencia: al recargar la página se pierde el trabajo no exportado.</li>
          <li>
            La clasificación de gramáticas es sintáctica (forma de producciones), no
            decide la clase del lenguaje en todos los casos.
          </li>
          <li>
            El lema de bombeo no verifica automáticamente si xy^i z ∈ L; esas
            conclusiones son manuales.
          </li>
          <li>
            JFLAP: soporte orientado a autómatas finitos y Turing de 1 banda; 2 bandas
            según estructura del archivo importado.
          </li>
          <li>
            El editor de Turing usa tabla de transiciones (no lienzo gráfico de estados).
          </li>
          <li>
            Autómatas muy grandes pueden volver lenta la simulación o la conversión AFND→AFD.
          </li>
        </ul>
      </section>
    </section>
  );
}
