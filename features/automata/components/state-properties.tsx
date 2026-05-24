'use client';

import { useAutomatonStore } from '../store/automaton-store';

export function StateProperties() {
  const automaton = useAutomatonStore((s) => s.automaton);
  const selectedStateId = useAutomatonStore((s) => s.selectedStateId);
  const renameState = useAutomatonStore((s) => s.renameState);
  const setInitialState = useAutomatonStore((s) => s.setInitialState);
  const toggleAcceptingState = useAutomatonStore((s) => s.toggleAcceptingState);

  const state = automaton.states.find((s) => s.id === selectedStateId);

  if (!state) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Selecciona un estado en el diagrama para editar sus propiedades.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Propiedades del estado</h3>
      <div>
        <label htmlFor="state-name" className="text-xs font-medium text-neutral-500">
          Nombre
        </label>
        <input
          id="state-name"
          type="text"
          value={state.name}
          onChange={(e) => renameState(state.id, e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="radio"
          name="initial-state"
          checked={state.isInitial}
          onChange={() => setInitialState(state.id)}
        />
        Estado inicial (q₀)
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={state.isAccepting}
          onChange={() => toggleAcceptingState(state.id)}
        />
        Estado final (F)
      </label>
    </div>
  );
}
