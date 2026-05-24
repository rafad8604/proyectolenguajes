'use client';

import type { TapeSnapshot } from 'lib/core/turing';
import { getVisibleTapeRange } from 'lib/core/turing';
import { cn } from 'lib/utils/cn';

interface TapeViewProps {
  tape: TapeSnapshot;
  blankSymbol: string;
  tapeLabel?: string;
  className?: string;
}

export function TapeView({
  tape,
  blankSymbol,
  tapeLabel,
  className,
}: TapeViewProps) {
  const indices = getVisibleTapeRange(tape.head, 10);

  return (
    <div className={cn('space-y-1', className)}>
      {tapeLabel && (
        <p className="text-xs font-medium text-neutral-500">{tapeLabel}</p>
      )}
      <div className="flex items-end gap-0.5 overflow-x-auto pb-1">
        {indices.map((idx) => {
          const symbol = tape.cells[idx] ?? blankSymbol;
          const isHead = idx === tape.head;
          return (
            <div key={idx} className="flex flex-col items-center">
              <span
                className={cn(
                  'mb-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400',
                  isHead ? 'opacity-100' : 'opacity-0'
                )}
              >
                ▼
              </span>
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center border font-mono text-sm',
                  isHead
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-400 dark:border-blue-400 dark:bg-blue-950'
                    : 'border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900'
                )}
              >
                {symbol}
              </div>
              <span className="mt-0.5 text-[9px] text-neutral-400">{idx}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
