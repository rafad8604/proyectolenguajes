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
        <Link href="/" className="group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded-sm">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Lenguajes de programación
          </p>
        </Link>
        <Link
          href="/acerca"
          className={cn(
            'self-start text-sm font-medium sm:self-center',
            pathname === '/acerca'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
          )}
          aria-current={pathname === '/acerca' ? 'page' : undefined}
        >
          Acerca del proyecto
        </Link>
      </div>

      <nav
        className="mt-4 -mx-1 flex gap-1 overflow-x-auto pb-1"
        aria-label="Módulos principales"
      >
        {mainModules
          .filter((module) => module.showInNav !== false)
          .map((module) => {
          const isActive =
            pathname === module.href || pathname.startsWith(`${module.href}/`);

          return (
            <Link
              key={module.href}
              href={module.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
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
