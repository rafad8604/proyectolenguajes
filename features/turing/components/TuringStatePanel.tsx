'use client';

import { useTuringStore } from '../store/turing-store';

export function TuringStatePanel() {
  const machine = useTuringStore((s) => s.machine);
  const selectedStateId = useTuringStore((s) => s.selectedStateId);
  const addState = useTuringStore((s) => s.addState);
  const removeState = useTuringStore((s) => s.removeState);
  const renameState = useTuringStore((s) => s.renameState);
  const setInitialState = useTuringStore((s) => s.setInitialState);
  const toggleAcceptingState = useTuringStore((s) => s.toggleAcceptingState);
  const toggleRejectingState = useTuringStore((s) => s.toggleRejectingState);
  const selectState = useTuringStore((s) => s.selectState);

  const selected = machine.states.find((s) => s.id === selectedStateId);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => addState()}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          + Estado
        </button>
      </div>
      <ul className="space-y-1 text-sm">
        {machine.states.map((s) => (
          <li
            key={s.id}
            className={`flex flex-wrap items-center gap-2 rounded px-2 py-1 ${
              selectedStateId === s.id ? 'bg-blue-50 dark:bg-blue-950' : ''
            }`}
          >
            <button
              type="button"
              onClick={() => selectState(s.id)}
              className="font-mono font-medium hover:underline"
            >
              {s.name}
            </button>
            {machine.initialStateId === s.id && (
              <span className="text-xs text-blue-600">inicial</span>
            )}
            {machine.acceptingStateIds.includes(s.id) && (
              <span className="text-xs text-green-600">acepta</span>
            )}
            {machine.rejectingStateIds.includes(s.id) && (
              <span className="text-xs text-red-600">rechaza</span>
            )}
            <button
              type="button"
              onClick={() => removeState(s.id)}
              className="ml-auto text-xs text-red-600"
            >
              eliminar
            </button>
          </li>
        ))}
      </ul>
      {selected && (
        <div className="space-y-2 border-t pt-3 dark:border-neutral-700">
          <input
            type="text"
            value={selected.name}
            onChange={(e) => renameState(selected.id, e.target.value)}
            className="w-full rounded border px-2 py-1 text-sm dark:bg-neutral-800"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={machine.initialStateId === selected.id}
              onChange={() => setInitialState(selected.id)}
            />
            Estado inicial
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={machine.acceptingStateIds.includes(selected.id)}
              onChange={() => toggleAcceptingState(selected.id)}
            />
            Estado de aceptación
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={machine.rejectingStateIds.includes(selected.id)}
              onChange={() => toggleRejectingState(selected.id)}
            />
            Estado de rechazo
          </label>
        </div>
      )}
    </div>
  );
}
