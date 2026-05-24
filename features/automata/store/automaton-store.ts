import { create } from 'zustand';
import type { Automaton, AutomatonType } from 'types/automaton';
import type { Transition } from 'types/transition';
import {
  createEmptyAutomaton,
  createState,
  createTransition,
  syncAlphabet,
} from 'lib/core/automata';

interface AutomatonStore {
  automaton: Automaton;
  selectedStateId: string | null;
  pendingConnection: { from: string; to: string } | null;

  setType: (type: AutomatonType) => void;
  setName: (name: string) => void;
  addState: (x?: number, y?: number) => void;
  removeState: (stateId: string) => void;
  renameState: (stateId: string, name: string) => void;
  setInitialState: (stateId: string) => void;
  toggleAcceptingState: (stateId: string) => void;
  updateStatePosition: (stateId: string, x: number, y: number) => void;
  addTransition: (
    from: string,
    to: string,
    symbol: string,
    isEpsilon?: boolean
  ) => void;
  updateTransition: (
    transitionId: string,
    updates: Partial<Pick<Transition, 'from' | 'to' | 'symbol' | 'isEpsilon'>>
  ) => void;
  removeTransition: (transitionId: string) => void;
  setPendingConnection: (from: string, to: string) => void;
  clearPendingConnection: () => void;
  selectState: (stateId: string | null) => void;
  reset: () => void;
}

function applyAlphabet(automaton: Automaton): Automaton {
  return syncAlphabet(automaton);
}

export const useAutomatonStore = create<AutomatonStore>((set, get) => ({
  automaton: createEmptyAutomaton('dfa'),
  selectedStateId: null,
  pendingConnection: null,

  setType: (type) =>
    set((s) => {
      let transitions = s.automaton.transitions;
      if (type === 'dfa') {
        transitions = transitions.filter((t) => !t.isEpsilon);
      }
      return {
        automaton: applyAlphabet({
          ...s.automaton,
          type,
          name: type === 'dfa' ? 'Nuevo AFD' : 'Nuevo AFND',
          transitions,
        }),
      };
    }),

  setName: (name) =>
    set((s) => ({ automaton: { ...s.automaton, name } })),

  addState: (x, y) =>
    set((s) => {
      const newState = createState(s.automaton.states, {
        x: x ?? 120 + s.automaton.states.length * 100,
        y: y ?? 120 + (s.automaton.states.length % 3) * 80,
      });
      const isFirst = s.automaton.states.length === 0;
      const states = [...s.automaton.states, newState];
      return {
        automaton: applyAlphabet({
          ...s.automaton,
          states,
          initialStateId: isFirst ? newState.id : s.automaton.initialStateId,
          acceptingStateIds: isFirst
            ? [newState.id]
            : s.automaton.acceptingStateIds,
        }),
        selectedStateId: newState.id,
      };
    }),

  removeState: (stateId) =>
    set((s) => {
      const states = s.automaton.states.filter((st) => st.id !== stateId);
      const transitions = s.automaton.transitions.filter(
        (t) => t.from !== stateId && t.to !== stateId
      );
      let initialStateId = s.automaton.initialStateId;
      if (initialStateId === stateId) {
        initialStateId = states[0]?.id ?? null;
      }
      const acceptingStateIds = s.automaton.acceptingStateIds.filter(
        (id) => id !== stateId
      );
      return {
        automaton: applyAlphabet({
          ...s.automaton,
          states: states.map((st) => ({
            ...st,
            isInitial: st.id === initialStateId,
            isAccepting: acceptingStateIds.includes(st.id),
          })),
          transitions,
          initialStateId,
          acceptingStateIds,
        }),
        selectedStateId:
          s.selectedStateId === stateId ? null : s.selectedStateId,
      };
    }),

  renameState: (stateId, name) =>
    set((s) => ({
      automaton: {
        ...s.automaton,
        states: s.automaton.states.map((st) =>
          st.id === stateId ? { ...st, name: name.trim() || st.name } : st
        ),
      },
    })),

  setInitialState: (stateId) =>
    set((s) => ({
      automaton: {
        ...s.automaton,
        initialStateId: stateId,
        states: s.automaton.states.map((st) => ({
          ...st,
          isInitial: st.id === stateId,
        })),
      },
    })),

  toggleAcceptingState: (stateId) =>
    set((s) => {
      const isAccepting = s.automaton.acceptingStateIds.includes(stateId);
      const acceptingStateIds = isAccepting
        ? s.automaton.acceptingStateIds.filter((id) => id !== stateId)
        : [...s.automaton.acceptingStateIds, stateId];
      return {
        automaton: {
          ...s.automaton,
          acceptingStateIds,
          states: s.automaton.states.map((st) =>
            st.id === stateId ? { ...st, isAccepting: !isAccepting } : st
          ),
        },
      };
    }),

  updateStatePosition: (stateId, x, y) =>
    set((s) => ({
      automaton: {
        ...s.automaton,
        states: s.automaton.states.map((st) =>
          st.id === stateId ? { ...st, position: { x, y } } : st
        ),
      },
    })),

  addTransition: (from, to, symbol, isEpsilon = false) =>
    set((s) => {
      const { automaton } = s;
      if (automaton.type === 'dfa') {
        const duplicate = automaton.transitions.some(
          (t) =>
            t.from === from &&
            !t.isEpsilon &&
            t.symbol === symbol &&
            !isEpsilon
        );
        if (duplicate) {
          return s;
        }
      }
      const transition = createTransition(from, to, symbol, isEpsilon);
      return {
        automaton: applyAlphabet({
          ...automaton,
          transitions: [...automaton.transitions, transition],
        }),
      };
    }),

  updateTransition: (transitionId, updates) =>
    set((s) => {
      const transitions = s.automaton.transitions.map((t) => {
        if (t.id !== transitionId) return t;
        const isEpsilon = updates.isEpsilon ?? t.isEpsilon;
        return {
          ...t,
          ...updates,
          symbol: isEpsilon ? '' : (updates.symbol ?? t.symbol),
          isEpsilon,
        };
      });
      return {
        automaton: applyAlphabet({ ...s.automaton, transitions }),
      };
    }),

  removeTransition: (transitionId) =>
    set((s) => ({
      automaton: applyAlphabet({
        ...s.automaton,
        transitions: s.automaton.transitions.filter((t) => t.id !== transitionId),
      }),
    })),

  setPendingConnection: (from, to) => set({ pendingConnection: { from, to } }),
  clearPendingConnection: () => set({ pendingConnection: null }),
  selectState: (stateId) => set({ selectedStateId: stateId }),

  reset: () =>
    set({
      automaton: createEmptyAutomaton('dfa'),
      selectedStateId: null,
      pendingConnection: null,
    }),
}));
