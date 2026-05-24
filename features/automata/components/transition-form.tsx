'use client';

import { useState } from 'react';
import { useAutomatonStore } from '../store/automaton-store';
import { EPSILON_SYMBOL } from 'lib/core/automata';

export function TransitionForm() {
  const automaton = useAutomatonStore((s) => s.automaton);
  const pendingConnection = useAutomatonStore((s) => s.pendingConnection);
  const addTransition = useAutomatonStore((s) => s.addTransition);
  const clearPendingConnection = useAutomatonStore((s) => s.clearPendingConnection);

  const [symbol, setSymbol] = useState('a');
  const [isEpsilon, setIsEpsilon] = useState(false);
  const [manualFrom, setManualFrom] = useState('');
  const [manualTo, setManualTo] = useState('');

  const fromId = pendingConnection?.from ?? manualFrom;
  const toId = pendingConnection?.to ?? manualTo;

  const fromName = automaton.states.find((s) => s.id === fromId)?.name;
  const toName = automaton.states.find((s) => s.id === toId)?.name;

  const handleAdd = () => {
    if (!fromId || !toId) return;
    if (automaton.type === 'dfa' && isEpsilon) return;
    if (!isEpsilon && !symbol.trim()) return;

    addTransition(fromId, toId, symbol.trim(), isEpsilon);
    clearPendingConnection();
    setSymbol('a');
    setIsEpsilon(false);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Nueva transición</h3>

      {pendingConnection ? (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Conexión: <strong>{fromName}</strong> → <strong>{toName}</strong>
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-neutral-500">Desde</label>
            <select
              value={manualFrom}
              onChange={(e) => setManualFrom(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800"
            >
              <option value="">—</option>
              {automaton.states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-neutral-500">Hacia</label>
            <select
              value={manualTo}
              onChange={(e) => setManualTo(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800"
            >
              <option value="">—</option>
              {automaton.states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {automaton.type === 'nfa' && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isEpsilon}
            onChange={(e) => setIsEpsilon(e.target.checked)}
          />
          Transición ε ({EPSILON_SYMBOL})
        </label>
      )}

      {!isEpsilon && (
        <div>
          <label htmlFor="trans-symbol" className="text-xs text-neutral-500">
            Símbolo
          </label>
          <input
            id="trans-symbol"
            type="text"
            maxLength={1}
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
            placeholder="a"
          />
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!fromId || !toId}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Agregar δ
        </button>
        {pendingConnection && (
          <button
            type="button"
            onClick={clearPendingConnection}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-600"
          >
            Cancelar
          </button>
        )}
      </div>

      <p className="text-xs text-neutral-500">
        Arrastra entre estados en el diagrama o usa el formulario manual.
        {automaton.type === 'nfa' &&
          ' En AFND puedes agregar varias transiciones con el mismo símbolo.'}
      </p>
    </div>
  );
}
