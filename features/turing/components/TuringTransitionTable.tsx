'use client';

import type { TapeMove } from 'types/turing';
import { useTuringStore } from '../store/turing-store';

const MOVES: TapeMove[] = ['L', 'R', 'S'];

export function TuringTransitionTable() {
  const machine = useTuringStore((s) => s.machine);
  const addTransition = useTuringStore((s) => s.addTransition);
  const updateTransition = useTuringStore((s) => s.updateTransition);
  const removeTransition = useTuringStore((s) => s.removeTransition);

  const defaultRead = machine.blankSymbol;
  const defaultWrite = machine.blankSymbol;

  const handleAdd = () => {
    const from = machine.states[0]?.id;
    const to = machine.states[0]?.id;
    if (!from || !to) return;
    const reads = machine.tapeCount === 1 ? [defaultRead] : [defaultRead, defaultRead];
    const writes = machine.tapeCount === 1 ? [defaultWrite] : [defaultWrite, defaultWrite];
    const moves: TapeMove[] = machine.tapeCount === 1 ? ['R'] : ['R', 'R'];
    addTransition({ from, to, readSymbols: reads, writeSymbols: writes, moves });
  };

  if (machine.states.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Agrega estados antes de definir transiciones.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Tabla de transiciones δ</h3>
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
        >
          + Transición
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700">
              <th className="py-2 pr-2">Desde</th>
              {machine.tapeCount === 1 ? (
                <th className="py-2 pr-2">Leer</th>
              ) : (
                <>
                  <th className="py-2 pr-2">Leer B1</th>
                  <th className="py-2 pr-2">Leer B2</th>
                </>
              )}
              <th className="py-2 pr-2">Hacia</th>
              {machine.tapeCount === 1 ? (
                <>
                  <th className="py-2 pr-2">Escribir</th>
                  <th className="py-2 pr-2">Mov.</th>
                </>
              ) : (
                <>
                  <th className="py-2 pr-2">Esc. B1</th>
                  <th className="py-2 pr-2">Esc. B2</th>
                  <th className="py-2 pr-2">Mov. B1</th>
                  <th className="py-2 pr-2">Mov. B2</th>
                </>
              )}
              <th className="py-2">Acc.</th>
            </tr>
          </thead>
          <tbody>
            {machine.transitions.map((t) => (
              <tr
                key={t.id}
                className="border-b border-neutral-100 dark:border-neutral-800"
              >
                <td className="py-1 pr-2">
                  <select
                    value={t.from}
                    onChange={(e) =>
                      updateTransition(t.id, { from: e.target.value })
                    }
                    className="rounded border px-1 py-0.5 dark:bg-neutral-800"
                  >
                    {machine.states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </td>
                {t.readSymbols.map((sym, i) => (
                  <td key={`r${i}`} className="py-1 pr-2">
                    <input
                      maxLength={1}
                      value={sym}
                      onChange={(e) => {
                        const readSymbols = [...t.readSymbols];
                        readSymbols[i] = e.target.value;
                        updateTransition(t.id, { readSymbols });
                      }}
                      className="w-8 rounded border px-1 py-0.5 font-mono dark:bg-neutral-800"
                    />
                  </td>
                ))}
                <td className="py-1 pr-2">
                  <select
                    value={t.to}
                    onChange={(e) =>
                      updateTransition(t.id, { to: e.target.value })
                    }
                    className="rounded border px-1 py-0.5 dark:bg-neutral-800"
                  >
                    {machine.states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </td>
                {t.writeSymbols.map((sym, i) => (
                  <td key={`w${i}`} className="py-1 pr-2">
                    <input
                      maxLength={1}
                      value={sym}
                      onChange={(e) => {
                        const writeSymbols = [...t.writeSymbols];
                        writeSymbols[i] = e.target.value;
                        updateTransition(t.id, { writeSymbols });
                      }}
                      className="w-8 rounded border px-1 py-0.5 font-mono dark:bg-neutral-800"
                    />
                  </td>
                ))}
                {t.moves.map((mv, i) => (
                  <td key={`m${i}`} className="py-1 pr-2">
                    <select
                      value={mv}
                      onChange={(e) => {
                        const moves = [...t.moves] as TapeMove[];
                        moves[i] = e.target.value as TapeMove;
                        updateTransition(t.id, { moves });
                      }}
                      className="rounded border px-1 py-0.5 dark:bg-neutral-800"
                    >
                      {MOVES.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </td>
                ))}
                <td className="py-1">
                  <button
                    type="button"
                    onClick={() => removeTransition(t.id)}
                    className="text-red-600 hover:underline"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {machine.transitions.length === 0 && (
        <p className="text-xs text-neutral-500">
          Formato 1 banda: (q, a) → (q&apos;, b, M). Formato 2 bandas: (q, a₁, a₂) → (q&apos;, b₁, b₂, M₁, M₂).
        </p>
      )}
    </div>
  );
}
