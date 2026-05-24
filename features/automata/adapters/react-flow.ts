import type { Edge, Node } from '@xyflow/react';
import type { Automaton } from 'types/automaton';
import { EPSILON_SYMBOL } from 'lib/core/automata';

export interface StateNodeData extends Record<string, unknown> {
  label: string;
  stateId: string;
  isInitial: boolean;
  isAccepting: boolean;
  isActive?: boolean;
}

export interface AutomatonGraphHighlight {
  activeStateIds?: string[];
  activeTransitionIds?: string[];
}

export function automatonToNodes(
  automaton: Automaton,
  highlight?: AutomatonGraphHighlight
): Node<StateNodeData>[] {
  const active = new Set(highlight?.activeStateIds ?? []);
  return automaton.states.map((state) => ({
    id: state.id,
    type: 'stateNode',
    position: state.position ?? { x: 0, y: 0 },
    data: {
      label: state.name,
      stateId: state.id,
      isInitial: state.isInitial,
      isAccepting: state.isAccepting,
      isActive: active.has(state.id),
    },
  }));
}

export function automatonToEdges(
  automaton: Automaton,
  highlight?: AutomatonGraphHighlight
): Edge[] {
  const activeTransitions = new Set(highlight?.activeTransitionIds ?? []);
  return automaton.transitions.map((t) => {
    const isActive = activeTransitions.has(t.id);
    return {
      id: t.id,
      source: t.from,
      target: t.to,
      label: t.isEpsilon ? EPSILON_SYMBOL : t.symbol,
      type: 'smoothstep',
      animated: t.isEpsilon || isActive,
      style: {
        ...(t.isEpsilon ? { strokeDasharray: '5 5' } : {}),
        ...(isActive
          ? { stroke: '#2563eb', strokeWidth: 3 }
          : {}),
      },
      labelStyle: isActive
        ? { fill: '#2563eb', fontWeight: 700 }
        : undefined,
    };
  });
}

export function extractPositionUpdates(
  nodes: Node[]
): { stateId: string; x: number; y: number }[] {
  return nodes.map((node) => ({
    stateId: node.id,
    x: node.position.x,
    y: node.position.y,
  }));
}
