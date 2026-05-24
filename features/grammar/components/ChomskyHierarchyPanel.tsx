'use client';

import type { ClassificationResult, TypeCheckResult } from 'lib/core/grammar/classifyGrammar';
import { cn } from 'lib/utils/cn';

interface ChomskyHierarchyPanelProps {
  classification: ClassificationResult | null;
  className?: string;
}

function TypeCard({ check }: { check: TypeCheckResult }) {
  return (
    <article
      className={cn(
        'rounded-lg border p-4',
        check.belongs
          ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/30'
          : 'border-neutral-200 dark:border-neutral-700'
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">{check.label}</h4>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium',
            check.belongs
              ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100'
              : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
          )}
        >
          {check.belongs ? 'Cumple la forma' : 'No cumple la forma'}
        </span>
      </div>

      <ul className="mt-3 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
        {check.reasons.map((reason, i) => (
          <li key={i}>• {reason}</li>
        ))}
      </ul>

      {check.caveats.length > 0 && (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50/80 p-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="font-medium">Notas</p>
          <ul className="mt-1 space-y-1">
            {check.caveats.map((c, i) => (
              <li key={i}>• {c}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

export function ChomskyHierarchyPanel({
  classification,
  className,
}: ChomskyHierarchyPanelProps) {
  if (!classification) {
    return (
      <p className={cn('text-sm text-neutral-500', className)}>
        Ingresa y valida una gramática para ver la clasificación.
      </p>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900 dark:bg-blue-950/30">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">
          Resultado
        </p>
        <p className="mt-1 text-lg font-semibold">{classification.inferredLabel}</p>
        <ul className="mt-2 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
          {classification.summary.map((line, i) => (
            <li key={i}>• {line}</li>
          ))}
        </ul>
      </div>

      {classification.warnings.length > 0 && (
        <ul className="space-y-1 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {classification.warnings.map((w, i) => (
            <li key={i}>• {w}</li>
          ))}
        </ul>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {classification.hierarchy.map((check) => (
          <TypeCard key={check.type} check={check} />
        ))}
      </div>

      <p className="text-xs text-neutral-500">
        La jerarquía se evalúa por forma sintáctica de las producciones (contención
        3 ⊂ 2 ⊂ 1 ⊂ 0). El lenguaje generado puede pertenecer a una clase más
        restrictiva sin que la gramática lo refleje; no afirmamos equivalencias
        con autómatas ni decidibilidad completa.
      </p>
    </div>
  );
}
