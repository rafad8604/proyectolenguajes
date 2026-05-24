import Link from 'next/link';
import { getConcept } from 'lib/config/concepts';
import { cn } from 'lib/utils/cn';

interface ModuleIntroProps {
  /** Identificador en `lib/config/concepts`. */
  conceptId: string;
  /** Texto adicional bajo el resumen del concepto. */
  children?: React.ReactNode;
  className?: string;
}

export function ModuleIntro({ conceptId, children, className }: ModuleIntroProps) {
  const concept = getConcept(conceptId);
  if (!concept) return null;

  return (
    <aside
      className={cn(
        'rounded-lg border border-neutral-200 bg-neutral-50/80 p-4 text-sm dark:border-neutral-700 dark:bg-neutral-900/50',
        className
      )}
      aria-labelledby={`intro-${conceptId}`}
    >
      <h2 id={`intro-${conceptId}`} className="font-semibold text-neutral-900 dark:text-neutral-100">
        ¿Qué es {concept.shortTitle}?
      </h2>
      <p className="mt-2 leading-relaxed text-neutral-700 dark:text-neutral-300">
        {concept.summary}
      </p>
      {children}
      <p className="mt-3">
        <Link
          href="/acerca"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Más información en Acerca del proyecto →
        </Link>
      </p>
    </aside>
  );
}
