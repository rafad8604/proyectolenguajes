'use client';

import { useAutomatonStore } from '../store/automaton-store';
import { AUTOMATON_PRESETS } from '../examples/presets';
import { PresetBar } from 'components/ui/preset-bar';
import type { AutomatonType } from 'types/automaton';

export function StateToolbar() {
  const automaton = useAutomatonStore((s) => s.automaton);
  const setType = useAutomatonStore((s) => s.setType);
  const addState = useAutomatonStore((s) => s.addState);
  const removeState = useAutomatonStore((s) => s.removeState);
  const selectedStateId = useAutomatonStore((s) => s.selectedStateId);
  const reset = useAutomatonStore((s) => s.reset);
  const loadAutomaton = useAutomatonStore((s) => s.loadAutomaton);

  const selectedState = automaton.states.find((s) => s.id === selectedStateId);

  const handlePreset = (id: string) => {
    const preset = AUTOMATON_PRESETS.find((p) => p.id === id);
    if (preset) loadAutomaton(structuredClone(preset.automaton));
  };

  return (
    <div className="space-y-3">
      <PresetBar
        presets={AUTOMATON_PRESETS.map((p) => ({ id: p.id, label: p.label }))}
        onSelect={handlePreset}
      />
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-center gap-2">
        <label htmlFor="automaton-type" className="text-sm font-medium">
          Tipo:
        </label>
        <select
          id="automaton-type"
          value={automaton.type}
          onChange={(e) => setType(e.target.value as AutomatonType)}
          className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800"
        >
          <option value="dfa">AFD</option>
          <option value="nfa">AFND</option>
        </select>
      </div>

      <button
        type="button"
        onClick={() => addState()}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        + Estado
      </button>

      {selectedState && (
        <button
          type="button"
          onClick={() => removeState(selectedState.id)}
          className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
        >
          Eliminar {selectedState.name}
        </button>
      )}

      <button
        type="button"
        onClick={reset}
        className="ml-auto rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 dark:border-neutral-600 dark:hover:bg-neutral-800"
      >
        Reiniciar
      </button>
    </div>
    </div>
  );
}
