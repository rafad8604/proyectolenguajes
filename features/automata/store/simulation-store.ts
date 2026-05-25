import { create } from 'zustand';
import {
  buildSimulationTrace,
  type SimulationTrace,
  type SimulationOutcome,
} from 'lib/core/automata';
import type { Automaton } from 'types/automaton';

export const PLAYBACK_SPEED_OPTIONS = [
  { label: 'Lenta', ms: 900 },
  { label: 'Normal', ms: 500 },
  { label: 'Rápida', ms: 250 },
  { label: 'Muy rápida', ms: 120 },
] as const;

interface SimulationStore {
  input: string;
  trace: SimulationTrace | null;
  currentStepIndex: number;
  playbackSpeedMs: number;
  isPlaying: boolean;

  setInput: (input: string) => void;
  setPlaybackSpeed: (ms: number) => void;
  runSimulation: (automaton: Automaton) => void;
  goToStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  runAll: () => void;
  startPlayback: (automaton: Automaton) => void;
  pausePlayback: () => void;
  resetSimulation: () => void;
  getCurrentOutcome: () => SimulationOutcome;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  input: 'aab',
  trace: null,
  currentStepIndex: 0,
  playbackSpeedMs: PLAYBACK_SPEED_OPTIONS[1].ms,
  isPlaying: false,

  setInput: (input) =>
    set({ input, trace: null, currentStepIndex: 0, isPlaying: false }),

  setPlaybackSpeed: (ms) => set({ playbackSpeedMs: ms }),

  runSimulation: (automaton) => {
    const { input } = get();
    const trace = buildSimulationTrace(automaton, input);
    set({ trace, currentStepIndex: 0, isPlaying: false });
  },

  goToStep: (index) => {
    const { trace } = get();
    if (!trace || trace.steps.length === 0) return;
    const max = trace.steps.length - 1;
    set({
      currentStepIndex: Math.max(0, Math.min(index, max)),
      isPlaying: false,
    });
  },

  nextStep: () => {
    const { trace, currentStepIndex } = get();
    if (!trace || trace.steps.length === 0) return;
    const max = trace.steps.length - 1;
    if (currentStepIndex >= max) {
      set({ isPlaying: false });
      return;
    }
    set({ currentStepIndex: currentStepIndex + 1 });
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    set({
      currentStepIndex: Math.max(currentStepIndex - 1, 0),
      isPlaying: false,
    });
  },

  runAll: () => {
    const { trace } = get();
    if (!trace || trace.steps.length === 0) return;
    set({
      currentStepIndex: trace.steps.length - 1,
      isPlaying: false,
    });
  },

  startPlayback: (automaton) => {
    const { trace, input } = get();
    const activeTrace = trace ?? buildSimulationTrace(automaton, input);
    if (activeTrace.error || activeTrace.steps.length === 0) {
      set({ trace: activeTrace, isPlaying: false });
      return;
    }
    const atEnd =
      get().currentStepIndex >= activeTrace.steps.length - 1;
    set({
      trace: activeTrace,
      currentStepIndex: atEnd ? 0 : get().currentStepIndex,
      isPlaying: true,
    });
  },

  pausePlayback: () => set({ isPlaying: false }),

  resetSimulation: () =>
    set({ trace: null, currentStepIndex: 0, isPlaying: false }),

  getCurrentOutcome: () => {
    const { trace, currentStepIndex } = get();
    if (!trace || trace.steps.length === 0) return 'idle';
    return trace.steps[currentStepIndex]?.outcome ?? trace.finalOutcome;
  },
}));
