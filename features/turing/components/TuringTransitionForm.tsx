'use client';

import { useState } from 'react';
import type { TapeMove } from 'types/turing';
import { useTuringStore } from '../store/turing-store';

export function TuringTransitionForm() {
  const machine = useTuringStore((s) => s.machine);
  const pendingConnection = useTuringStore((s) => s.pendingConnection);
  const addTransition = useTuringStore((s) => s.addTransition);
  const clearPendingConnection = useTuringStore((s) => s.clearPendingConnection);

  const [read0, setRead0] = useState('0');
  const [read1, setRead1] = useState('_');
  const [write0, setWrite0] = useState('0');
  const [write1, setWrite1] = useState('_');
  const [move0, setMove0] = useState<TapeMove>('R');
  const [move1, setMove1] = useState<TapeMove>('R');

  const fromName = machine.states.find((s) => s.id === pendingConnection?.from)
    ?.name;
  const toName = machine.states.find((s) => s.id === pendingConnection?.to)
    ?.name;

  const handleAdd = () => {
    if (!pendingConnection) return;
    const tapeCount = machine.tapeCount;

    if (tapeCount === 1) {
      addTransition({
        from: pendingConnection.from,
        to: pendingConnection.to,
        readSymbols: [read0 || machine.blankSymbol],
        writeSymbols: [write0 || machine.blankSymbol],
        moves: [move0],
      });
    } else {
      addTransition({
        from: pendingConnection.from,
        to: pendingConnection.to,
        readSymbols: [read0 || machine.blankSymbol, read1 || machine.blankSymbol],
        writeSymbols: [
          write0 || machine.blankSymbol,
          write1 || machine.blankSymbol,
        ],
        moves: [move0, move1],
      });
    }
    clearPendingConnection();
  };

  if (!pendingConnection) {
    return (
      <p className="text-sm text-neutral-500">
        Arrastra una conexión entre dos estados en el diagrama para definir una
        transición δ.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Nueva transición</h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        <strong>{fromName}</strong> → <strong>{toName}</strong>
      </p>

      {machine.tapeCount === 1 ? (
        <div className="grid grid-cols-3 gap-2 text-sm">
          <label>
            <span className="text-xs text-neutral-500">Leer</span>
            <input
              type="text"
              maxLength={1}
              value={read0}
              onChange={(e) => setRead0(e.target.value)}
              className="mt-1 w-full rounded border px-2 py-1 font-mono dark:bg-neutral-800"
            />
          </label>
          <label>
            <span className="text-xs text-neutral-500">Escribir</span>
            <input
              type="text"
              maxLength={1}
              value={write0}
              onChange={(e) => setWrite0(e.target.value)}
              className="mt-1 w-full rounded border px-2 py-1 font-mono dark:bg-neutral-800"
            />
          </label>
          <label>
            <span className="text-xs text-neutral-500">Mover</span>
            <select
              value={move0}
              onChange={(e) => setMove0(e.target.value as TapeMove)}
              className="mt-1 w-full rounded border px-2 py-1 dark:bg-neutral-800"
            >
              <option value="L">L</option>
              <option value="R">R</option>
              <option value="S">S</option>
            </select>
          </label>
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          <p className="text-xs text-neutral-500">Banda 1 / Banda 2</p>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-xs font-medium">Leer</span>
            <input
              type="text"
              maxLength={1}
              value={read0}
              onChange={(e) => setRead0(e.target.value)}
              className="rounded border px-2 py-1 font-mono dark:bg-neutral-800"
            />
            <input
              type="text"
              maxLength={1}
              value={read1}
              onChange={(e) => setRead1(e.target.value)}
              className="rounded border px-2 py-1 font-mono dark:bg-neutral-800"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-xs font-medium">Escribir</span>
            <input
              type="text"
              maxLength={1}
              value={write0}
              onChange={(e) => setWrite0(e.target.value)}
              className="rounded border px-2 py-1 font-mono dark:bg-neutral-800"
            />
            <input
              type="text"
              maxLength={1}
              value={write1}
              onChange={(e) => setWrite1(e.target.value)}
              className="rounded border px-2 py-1 font-mono dark:bg-neutral-800"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-xs font-medium">Mover</span>
            <select
              value={move0}
              onChange={(e) => setMove0(e.target.value as TapeMove)}
              className="rounded border px-2 py-1 dark:bg-neutral-800"
            >
              <option value="L">L</option>
              <option value="R">R</option>
              <option value="S">S</option>
            </select>
            <select
              value={move1}
              onChange={(e) => setMove1(e.target.value as TapeMove)}
              className="rounded border px-2 py-1 dark:bg-neutral-800"
            >
              <option value="L">L</option>
              <option value="R">R</option>
              <option value="S">S</option>
            </select>
          </div>
        </div>
      )}

      <p className="text-xs text-neutral-500">
        Etiqueta en el diagrama: leer → escribir, movimiento(s).
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Agregar transición
        </button>
        <button
          type="button"
          onClick={clearPendingConnection}
          className="rounded-md border px-3 py-1.5 text-sm dark:border-neutral-600"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
