import { create } from 'zustand';
import type { TuringMachine } from 'types/turing';
import type { TuringTransition, TapeMove } from 'types/turing';
import type { TransitionVisual } from 'types/transition-visual';
import { mergeTransitionVisual } from 'types/transition-visual';
import {
  createEmptyTuringMachine,
  createTuringState,
  createTuringTransition,
} from 'lib/core/turing';

interface TuringStore {
  machine: TuringMachine;
  selectedStateId: string | null;
  pendingConnection: { from: string; to: string } | null;

  setTapeCount: (count: 1 | 2) => void;
  setName: (name: string) => void;
  setInputAlphabet: (symbols: string[]) => void;
  setTapeAlphabet: (symbols: string[]) => void;
  setBlankSymbol: (symbol: string) => void;
  addState: () => void;
  removeState: (stateId: string) => void;
  renameState: (stateId: string, name: string) => void;
  setInitialState: (stateId: string) => void;
  toggleAcceptingState: (stateId: string) => void;
  toggleRejectingState: (stateId: string) => void;
  updateStatePosition: (stateId: string, x: number, y: number) => void;
  addTransition: (transition: Omit<TuringTransition, 'id'>) => void;
  updateTransition: (
    id: string,
    updates: Partial<Omit<TuringTransition, 'id'>>
  ) => void;
  updateTransitionVisual: (
    id: string,
    partial: Partial<TransitionVisual>
  ) => void;
  removeTransition: (id: string) => void;
  setPendingConnection: (from: string, to: string) => void;
  clearPendingConnection: () => void;
  loadMachine: (machine: TuringMachine) => void;
  selectState: (id: string | null) => void;
  reset: () => void;
}

export const useTuringStore = create<TuringStore>((set) => ({
  machine: createEmptyTuringMachine(1),
  selectedStateId: null,
  pendingConnection: null,

  setTapeCount: (count) =>
    set((s) => ({
      machine: {
        ...createEmptyTuringMachine(count),
        name: s.machine.name,
      },
      selectedStateId: null,
    })),

  setName: (name) =>
    set((s) => ({ machine: { ...s.machine, name } })),

  setInputAlphabet: (symbols) =>
    set((s) => ({ machine: { ...s.machine, inputAlphabet: symbols } })),

  setTapeAlphabet: (symbols) =>
    set((s) => ({ machine: { ...s.machine, tapeAlphabet: symbols } })),

  setBlankSymbol: (symbol) =>
    set((s) => ({ machine: { ...s.machine, blankSymbol: symbol || '_' } })),

  addState: () =>
    set((s) => {
      const newState = createTuringState(s.machine.states);
      const isFirst = s.machine.states.length === 0;
      const states = [...s.machine.states, newState];
      return {
        machine: {
          ...s.machine,
          states,
          initialStateId: isFirst ? newState.id : s.machine.initialStateId,
        },
        selectedStateId: newState.id,
      };
    }),

  removeState: (stateId) =>
    set((s) => {
      const states = s.machine.states.filter((st) => st.id !== stateId);
      let initialStateId = s.machine.initialStateId;
      if (initialStateId === stateId) {
        initialStateId = states[0]?.id ?? null;
      }
      return {
        machine: {
          ...s.machine,
          states: states.map((st) => ({
            ...st,
            isInitial: st.id === initialStateId,
          })),
          transitions: s.machine.transitions.filter(
            (t) => t.from !== stateId && t.to !== stateId
          ),
          initialStateId,
          acceptingStateIds: s.machine.acceptingStateIds.filter(
            (id) => id !== stateId
          ),
          rejectingStateIds: s.machine.rejectingStateIds.filter(
            (id) => id !== stateId
          ),
        },
        selectedStateId:
          s.selectedStateId === stateId ? null : s.selectedStateId,
      };
    }),

  renameState: (stateId, name) =>
    set((s) => ({
      machine: {
        ...s.machine,
        states: s.machine.states.map((st) =>
          st.id === stateId ? { ...st, name: name.trim() || st.name } : st
        ),
      },
    })),

  setInitialState: (stateId) =>
    set((s) => ({
      machine: {
        ...s.machine,
        initialStateId: stateId,
        states: s.machine.states.map((st) => ({
          ...st,
          isInitial: st.id === stateId,
        })),
      },
    })),

  toggleAcceptingState: (stateId) =>
    set((s) => {
      const ids = s.machine.acceptingStateIds;
      const isAcc = ids.includes(stateId);
      const acceptingStateIds = isAcc
        ? ids.filter((id) => id !== stateId)
        : [...ids, stateId];
      return {
        machine: {
          ...s.machine,
          acceptingStateIds,
          states: s.machine.states.map((st) =>
            st.id === stateId ? { ...st, isAccepting: !isAcc } : st
          ),
        },
      };
    }),

  toggleRejectingState: (stateId) =>
    set((s) => {
      const ids = s.machine.rejectingStateIds;
      const isRej = ids.includes(stateId);
      return {
        machine: {
          ...s.machine,
          rejectingStateIds: isRej
            ? ids.filter((id) => id !== stateId)
            : [...ids, stateId],
        },
      };
    }),

  updateStatePosition: (stateId, x, y) =>
    set((s) => ({
      machine: {
        ...s.machine,
        states: s.machine.states.map((st) =>
          st.id === stateId ? { ...st, position: { x, y } } : st
        ),
      },
    })),

  addTransition: (partial) =>
    set((s) => {
      const t = createTuringTransition(
        partial.from,
        partial.to,
        s.machine.tapeCount,
        partial.readSymbols,
        partial.writeSymbols,
        partial.moves
      );
      return {
        machine: {
          ...s.machine,
          transitions: [...s.machine.transitions, t],
        },
      };
    }),

  updateTransition: (id, updates) =>
    set((s) => ({
      machine: {
        ...s.machine,
        transitions: s.machine.transitions.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      },
    })),

  updateTransitionVisual: (id, partial) =>
    set((s) => ({
      machine: {
        ...s.machine,
        transitions: s.machine.transitions.map((t) =>
          t.id === id
            ? { ...t, visual: mergeTransitionVisual(t.visual, partial) }
            : t
        ),
      },
    })),

  removeTransition: (id) =>
    set((s) => ({
      machine: {
        ...s.machine,
        transitions: s.machine.transitions.filter((t) => t.id !== id),
      },
    })),

  setPendingConnection: (from, to) =>
    set({ pendingConnection: { from, to } }),

  clearPendingConnection: () => set({ pendingConnection: null }),

  loadMachine: (machine) =>
    set({
      machine: structuredClone(machine),
      selectedStateId: null,
      pendingConnection: null,
    }),

  selectState: (id) => set({ selectedStateId: id }),

  reset: () =>
    set({
      machine: createEmptyTuringMachine(1),
      selectedStateId: null,
      pendingConnection: null,
    }),
}));
