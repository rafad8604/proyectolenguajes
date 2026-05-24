'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { mainModules } from 'lib/config/navigation';
import { cn } from 'lib/utils/cn';

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="group">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Teoría de lenguajes
          </p>
          <h1 className="text-lg font-semibold tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Laboratorio de Lenguajes Formales
          </h1>
        </Link>
      </div>

      <nav
        className="mt-4 flex flex-wrap gap-1"
        aria-label="Módulos principales"
      >
        {mainModules.map((module) => {
          const isActive =
            pathname === module.href || pathname.startsWith(`${module.href}/`);

          return (
            <Link
              key={module.href}
              href={module.href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm transition-colors',
                isActive
                  ? 'bg-blue-600 text-white dark:bg-blue-500'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
              )}
            >
              {module.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
