import type { Metadata } from 'next';
import { ThompsonBuilder } from 'features/thompson/components/ThompsonBuilder';

export const metadata: Metadata = {
  title: 'Thompson',
  description:
    'Construye un AFND equivalente a partir de una expresión regular con el algoritmo de Thompson.',
};

export default function ThompsonPage() {
  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Construcción de Thompson
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Ingresa una expresión regular y obtén el AFND equivalente. El proceso
          muestra la tokenización, la conversión a postfix y cada paso del
          algoritmo de Thompson, con simulación y exportación a JFLAP.
        </p>
      </header>
      <ThompsonBuilder />
    </section>
  );
}
