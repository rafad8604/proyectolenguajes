import { create } from 'zustand';
import {
  buildSimulationTrace,
  type SimulationTrace,
  type SimulationOutcome,
} from 'lib/core/automata';
import type { Automaton } from 'types/automaton';

interface SimulationStore {
  input: string;
  trace: SimulationTrace | null;
  currentStepIndex: number;

  setInput: (input: string) => void;
  runSimulation: (automaton: Automaton) => void;
  nextStep: () => void;
  prevStep: () => void;
  runAll: () => void;
  resetSimulation: () => void;
  getCurrentOutcome: () => SimulationOutcome;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  input: 'aab',
  trace: null,
  currentStepIndex: 0,

  setInput: (input) => set({ input, trace: null, currentStepIndex: 0 }),

  runSimulation: (automaton) => {
    const { input } = get();
    const trace = buildSimulationTrace(automaton, input);
    set({ trace, currentStepIndex: 0 });
  },

  nextStep: () => {
    const { trace, currentStepIndex } = get();
    if (!trace || trace.steps.length === 0) return;
    const max = trace.steps.length - 1;
    set({ currentStepIndex: Math.min(currentStepIndex + 1, max) });
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    set({ currentStepIndex: Math.max(currentStepIndex - 1, 0) });
  },

  runAll: () => {
    const { trace } = get();
    if (!trace || trace.steps.length === 0) return;
    set({ currentStepIndex: trace.steps.length - 1 });
  },

  resetSimulation: () => set({ trace: null, currentStepIndex: 0 }),

  getCurrentOutcome: () => {
    const { trace, currentStepIndex } = get();
    if (!trace || trace.steps.length === 0) return 'idle';
    return trace.steps[currentStepIndex]?.outcome ?? trace.finalOutcome;
  },
}));
