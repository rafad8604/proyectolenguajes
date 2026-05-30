'use client';

import type { Automaton } from 'types/automaton';
import { EPSILON_SYMBOL } from 'lib/core/automata';

interface AutomatonTransitionTableReadonlyProps {
  automaton: Automaton;
}

export function AutomatonTransitionTableReadonly({
  automaton,
}: AutomatonTransitionTableReadonlyProps) {
  const getStateName = (id: string) =>
    automaton.states.find((s) => s.id === id)?.name ?? id;

  if (automaton.transitions.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        No hay transiciones.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[360px] text-left text-sm">
        <thead>
          <tr className="border-b text-xs text-neutral-500 dark:border-neutral-700">
            <th className="py-2 pr-3 font-medium">Desde</th>
            <th className="py-2 pr-3 font-medium">Símbolo</th>
            <th className="py-2 font-medium">Hacia</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {automaton.transitions.map((t) => (
            <tr
              key={t.id}
              className="border-b border-neutral-100 dark:border-neutral-800"
            >
              <td className="py-2 pr-3">{getStateName(t.from)}</td>
              <td className="py-2 pr-3">
                {t.isEpsilon ? EPSILON_SYMBOL : t.symbol}
              </td>
              <td className="py-2">{getStateName(t.to)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
