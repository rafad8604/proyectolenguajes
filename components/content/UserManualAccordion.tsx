import Link from 'next/link';
import type { ManualSection } from 'lib/config/user-manual';

interface UserManualAccordionProps {
  sections: ManualSection[];
}

export function UserManualAccordion({ sections }: UserManualAccordionProps) {
  return (
    <nav
      className="mb-6 rounded-lg border border-neutral-200 bg-neutral-50/80 p-4 dark:border-neutral-700 dark:bg-neutral-900/40"
      aria-label="Índice del manual"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Ir al módulo
      </p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#manual-${section.id}`}
              className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs font-medium hover:border-blue-300 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:border-blue-700"
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

interface UserManualSectionsProps {
  sections: ManualSection[];
}

export function UserManualSections({ sections }: UserManualSectionsProps) {
  return (
    <div className="space-y-3">
      {sections.map((section, index) => (
        <details
          key={section.id}
          id={`manual-${section.id}`}
          open={index === 0}
          className="group rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900/50"
        >
          <summary className="cursor-pointer list-none px-4 py-3 font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex flex-wrap items-center justify-between gap-2">
              <span>{section.title}</span>
              <span className="text-xs font-normal text-neutral-400 group-open:rotate-180">
                ▼
              </span>
            </span>
          </summary>
          <div className="border-t border-neutral-100 px-4 py-4 dark:border-neutral-800">
            {section.intro && (
              <p className="mb-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {section.intro}
              </p>
            )}
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
              {section.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="mt-4">
              <Link
                href={section.href}
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Abrir {section.title} →
              </Link>
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}
