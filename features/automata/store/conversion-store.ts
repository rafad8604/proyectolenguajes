import { create } from 'zustand';
import type { Automaton } from 'types/automaton';
import {
  convertNfaToDfa,
  type ConversionExplanationStep,
  type ConversionTableRow,
  type NfaToDfaResult,
} from 'lib/core/automata';

interface ConversionStore {
  sourceNfa: Automaton | null;
  result: NfaToDfaResult | null;
  currentStepIndex: number;

  convert: (nfa: Automaton) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  reset: () => void;
  getDfa: () => Automaton | null;
  getTable: () => ConversionTableRow[];
  getSteps: () => ConversionExplanationStep[];
}

export const useConversionStore = create<ConversionStore>((set, get) => ({
  sourceNfa: null,
  result: null,
  currentStepIndex: 0,

  convert: (nfa) => {
    const result = convertNfaToDfa(nfa);
    set({
      sourceNfa: nfa,
      result,
      currentStepIndex: 0,
    });
  },

  nextStep: () => {
    const { result, currentStepIndex } = get();
    if (!result?.steps.length) return;
    set({
      currentStepIndex: Math.min(
        currentStepIndex + 1,
        result.steps.length - 1
      ),
    });
  },

  prevStep: () => {
    set({ currentStepIndex: Math.max(get().currentStepIndex - 1, 0) });
  },

  goToStep: (index) => {
    const { result } = get();
    if (!result) return;
    set({
      currentStepIndex: Math.max(
        0,
        Math.min(index, result.steps.length - 1)
      ),
    });
  },

  reset: () =>
    set({ sourceNfa: null, result: null, currentStepIndex: 0 }),

  getDfa: () => get().result?.dfa ?? null,
  getTable: () => get().result?.table ?? [],
  getSteps: () => get().result?.steps ?? [],
}));
