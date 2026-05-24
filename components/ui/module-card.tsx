import Link from 'next/link';
import type { NavModule } from 'lib/config/navigation';

interface ModuleCardProps {
  module: NavModule;
}

export function ModuleCard({ module }: ModuleCardProps) {
  return (
    <Link
      href={module.href}
      aria-label={`${module.label}: ${module.description}`}
      className="group block rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-700"
    >
      <h2 className="text-lg font-semibold tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {module.label}
      </h2>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
        {module.description}
      </p>
      <p className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400" aria-hidden>
        Abrir módulo →
      </p>
    </Link>
  );
}
