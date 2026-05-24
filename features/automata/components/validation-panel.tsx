'use client';

import { useMemo } from 'react';
import { useAutomatonStore } from '../store/automaton-store';
import { validateAutomaton } from 'lib/core/automata';
import { cn } from 'lib/utils/cn';

export function ValidationPanel() {
  const automaton = useAutomatonStore((s) => s.automaton);
  const results = useMemo(() => validateAutomaton(automaton), [automaton]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Validación</h3>
      <ul className="space-y-2">
        {results.map((result) => (
          <li
            key={result.id}
            className={cn(
              'rounded-md border px-3 py-2 text-sm',
              result.passed
                ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30'
                : 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{result.label}</span>
              <span
                className={cn(
                  'text-xs font-semibold uppercase',
                  result.passed ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'
                )}
              >
                {result.passed ? 'OK' : 'Revisar'}
              </span>
            </div>
            {result.issues.length > 0 && (
              <ul className="mt-1 space-y-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                {result.issues.map((issue, i) => (
                  <li key={`${issue.code}-${i}`}>• {issue.message}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
