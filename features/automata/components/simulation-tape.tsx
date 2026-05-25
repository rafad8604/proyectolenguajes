'use client';

import { cn } from 'lib/utils/cn';

interface SimulationTapeProps {
  input: string;
  consumedPrefix: string;
  currentSymbol: string | null;
  inputIndex: number;
  className?: string;
}

/** Cinta de entrada estilo JFLAP con cursor sobre el símbolo actual. */
export function SimulationTape({
  input,
  consumedPrefix,
  currentSymbol,
  inputIndex,
  className,
}: SimulationTapeProps) {
  if (input.length === 0) {
    return (
      <div
        className={cn(
          'rounded-md border border-dashed border-neutral-300 px-3 py-2 font-mono text-sm text-neutral-500 dark:border-neutral-600',
          className
        )}
      >
        ε (cadena vacía)
      </div>
    );
  }

  const chars = input.split('');
  const consumedLen = consumedPrefix.length;
  const atEnd = inputIndex >= input.length;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-0.5 rounded-md border border-neutral-200 bg-white p-2 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-900',
        className
      )}
      role="group"
      aria-label="Cinta de entrada"
    >
      {chars.map((ch, i) => {
        const isConsumed = i < consumedLen;
        const isCurrent = !atEnd && i === inputIndex;
        const isPending = i >= inputIndex && !atEnd;

        return (
          <span
            key={`${i}-${ch}`}
            className={cn(
              'inline-flex min-w-[1.25rem] items-center justify-center rounded px-1 py-0.5',
              isConsumed &&
                !isCurrent &&
                'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
              isCurrent &&
                'bg-blue-600 text-white ring-2 ring-blue-400 scale-110',
              isPending && 'text-neutral-400 dark:text-neutral-500'
            )}
            title={isCurrent ? 'Símbolo actual' : undefined}
          >
            {ch}
          </span>
        );
      })}
      {atEnd && (
        <span className="ml-1 text-xs text-neutral-500 dark:text-neutral-400">
          fin
        </span>
      )}
      {currentSymbol && !atEnd && (
        <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
          → «{currentSymbol}»
        </span>
      )}
    </div>
  );
}
