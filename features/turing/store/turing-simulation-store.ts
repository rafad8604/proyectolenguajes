import { create } from 'zustand';
import type { TuringMachine } from 'types/turing';
import {
  buildTuringSimulationTrace,
  type TuringSimulationTrace,
  type TuringOutcome,
  resolveStepDisplayOutcome,
} from 'lib/core/turing';

interface TuringSimulationStore {
  input: string;
  maxSteps: number;
  trace: TuringSimulationTrace | null;
  currentStepIndex: number;
  isRunning: boolean;
  isPaused: boolean;
  runTimer: ReturnType<typeof setInterval> | null;

  setInput: (input: string) => void;
  setMaxSteps: (n: number) => void;
  runSimulation: (machine: TuringMachine) => void;
  nextStep: () => void;
  prevStep: () => void;
  runAll: (machine: TuringMachine) => void;
  pause: () => void;
  resume: (machine: TuringMachine) => void;
  resetSimulation: () => void;
  getOutcome: () => TuringOutcome;
}

export const useTuringSimulationStore = create<TuringSimulationStore>(
  (set, get) => ({
    input: '101',
    maxSteps: 500,
    trace: null,
    currentStepIndex: 0,
    isRunning: false,
    isPaused: false,
    runTimer: null,

    setInput: (input) =>
      set({ input, trace: null, currentStepIndex: 0, isRunning: false }),

    setMaxSteps: (maxSteps) => set({ maxSteps }),

    runSimulation: (machine) => {
      const { input, maxSteps, runTimer } = get();
      if (runTimer) clearInterval(runTimer);
      const trace = buildTuringSimulationTrace(machine, input, maxSteps);
      set({
        trace,
        currentStepIndex: 0,
        isRunning: false,
        isPaused: false,
        runTimer: null,
      });
    },

    nextStep: () => {
      const { trace, currentStepIndex } = get();
      if (!trace?.steps.length) return;
      set({
        currentStepIndex: Math.min(
          currentStepIndex + 1,
          trace.steps.length - 1
        ),
      });
    },

    prevStep: () => {
      set({ currentStepIndex: Math.max(get().currentStepIndex - 1, 0) });
    },

    runAll: (machine) => {
      const { runTimer, isRunning, isPaused } = get();
      if (runTimer) clearInterval(runTimer);

      if (!isRunning) {
        get().runSimulation(machine);
      }

      if (isPaused) {
        set({ isPaused: false, isRunning: true });
      } else if (!isRunning) {
        set({ isRunning: true, isPaused: false });
      }

      const timer = setInterval(() => {
        const { trace, currentStepIndex } = get();
        if (!trace?.steps.length) {
          clearInterval(timer);
          set({ isRunning: false, runTimer: null });
          return;
        }
        if (currentStepIndex >= trace.steps.length - 1) {
          clearInterval(timer);
          set({ isRunning: false, runTimer: null });
          return;
        }
        set({ currentStepIndex: currentStepIndex + 1 });
      }, 400);

      set({ runTimer: timer, isRunning: true });
    },

    pause: () => {
      const { runTimer } = get();
      if (runTimer) clearInterval(runTimer);
      set({ isPaused: true, isRunning: false, runTimer: null });
    },

    resume: (machine) => {
      get().runAll(machine);
    },

    resetSimulation: () => {
      const { runTimer } = get();
      if (runTimer) clearInterval(runTimer);
      set({
        trace: null,
        currentStepIndex: 0,
        isRunning: false,
        isPaused: false,
        runTimer: null,
      });
    },

    getOutcome: () => {
      const { trace, currentStepIndex } = get();
      if (!trace?.steps.length) return 'idle';
      return resolveStepDisplayOutcome(
        trace.steps[currentStepIndex],
        trace
      );
    },
  })
);
