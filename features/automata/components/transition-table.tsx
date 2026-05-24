'use client';

import { useAutomatonStore } from '../store/automaton-store';
import { EPSILON_SYMBOL } from 'lib/core/automata';

export function TransitionTable() {
  const automaton = useAutomatonStore((s) => s.automaton);
  const updateTransition = useAutomatonStore((s) => s.updateTransition);
  const removeTransition = useAutomatonStore((s) => s.removeTransition);

  const getStateName = (id: string) =>
    automaton.states.find((s) => s.id === id)?.name ?? id;

  if (automaton.transitions.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        No hay transiciones. Agrega estados y conéctalos en el diagrama.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-700">
            <th className="py-2 pr-3 font-medium">Desde</th>
            <th className="py-2 pr-3 font-medium">Símbolo</th>
            <th className="py-2 pr-3 font-medium">Hacia</th>
            <th className="py-2 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {automaton.transitions.map((t) => (
            <tr
              key={t.id}
              className="border-b border-neutral-100 dark:border-neutral-800"
            >
              <td className="py-2 pr-3">
                <select
                  value={t.from}
                  onChange={(e) =>
                    updateTransition(t.id, { from: e.target.value })
                  }
                  className="rounded border border-neutral-300 px-1 py-0.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                >
                  {automaton.states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-2 pr-3">
                {automaton.type === 'nfa' ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={!!t.isEpsilon}
                      onChange={(e) =>
                        updateTransition(t.id, {
                          isEpsilon: e.target.checked,
                          symbol: e.target.checked ? '' : t.symbol || 'a',
                        })
                      }
                      title="ε"
                    />
                    {!t.isEpsilon ? (
                      <input
                        type="text"
                        maxLength={1}
                        value={t.symbol}
                        onChange={(e) =>
                          updateTransition(t.id, { symbol: e.target.value })
                        }
                        className="w-10 rounded border border-neutral-300 px-1 py-0.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                      />
                    ) : (
                      <span>{EPSILON_SYMBOL}</span>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    maxLength={1}
                    value={t.symbol}
                    onChange={(e) =>
                      updateTransition(t.id, { symbol: e.target.value })
                    }
                    className="w-10 rounded border border-neutral-300 px-1 py-0.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                  />
                )}
              </td>
              <td className="py-2 pr-3">
                <select
                  value={t.to}
                  onChange={(e) =>
                    updateTransition(t.id, { to: e.target.value })
                  }
                  className="rounded border border-neutral-300 px-1 py-0.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
                >
                  {automaton.states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-2">
                <button
                  type="button"
                  onClick={() => removeTransition(t.id)}
                  className="text-red-600 hover:underline text-xs"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
