import type { Metadata } from 'next';
import { ThompsonConversionView } from 'features/thompson/components/ThompsonConversionView';

export const metadata: Metadata = {
  title: 'Conversión detallada — Thompson',
  description:
    'Construcción por subconjuntos del AFND generado con el algoritmo de Thompson.',
};

export default function ThompsonConversionPage() {
  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Conversión detallada AFND → AFD
        </h1>
        <p className="mt-2 max-w-3xl text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Vista paso a paso de la construcción por subconjuntos sobre el AFND
          generado desde Thompson: cerraduras ε, nuevos estados del AFD y tabla
          de conversión.
        </p>
      </header>

      <ThompsonConversionView />
    </section>
  );
}
