'use client';

import type { Automaton } from 'types/automaton';
import type { TransitionVisual } from 'types/transition-visual';
import { AutomatonCanvas } from 'features/automata/components/automaton-canvas';
import { SimulationControls } from 'features/automata/components/simulation-controls';
import { useAutomatonSimulation } from 'features/automata/hooks/use-automaton-simulation';

interface ThompsonNfaSimulationProps {
  nfa: Automaton;
  defaultInput?: string;
  onStatePositionChange?: (
    stateId: string,
    position: { x: number; y: number }
  ) => void;
  onTransitionVisualChange?: (
    transitionId: string,
    partial: Partial<TransitionVisual>
  ) => void;
}

export function ThompsonNfaSimulation({
  nfa,
  defaultInput = 'aab',
  onStatePositionChange,
  onTransitionVisualChange,
}: ThompsonNfaSimulationProps) {
  const controller = useAutomatonSimulation(defaultInput);

  return (
    <section className="space-y-4 rounded-lg border p-4 dark:border-neutral-700">
      <AutomatonCanvas
        automaton={nfa}
        readOnly
        layoutDraggable
        onStatePositionChange={onStatePositionChange}
        onTransitionVisualChange={onTransitionVisualChange}
        trace={controller.trace}
        stepIndex={controller.currentStepIndex}
        className="h-[320px]"
        ariaLabel="AFND Thompson simulación"
      />
      <SimulationControls
        automaton={nfa}
        controller={controller}
        title="Simular cadenas sobre el AFND"
      />
    </section>
  );
}
