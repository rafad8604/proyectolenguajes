import type { Edge, Node } from '@xyflow/react';
import type { Automaton } from 'types/automaton';
import { EPSILON_SYMBOL } from 'lib/core/automata';

export interface StateNodeData extends Record<string, unknown> {
  label: string;
  stateId: string;
  isInitial: boolean;
  isAccepting: boolean;
}

export function automatonToNodes(automaton: Automaton): Node<StateNodeData>[] {
  return automaton.states.map((state) => ({
    id: state.id,
    type: 'stateNode',
    position: state.position ?? { x: 0, y: 0 },
    data: {
      label: state.name,
      stateId: state.id,
      isInitial: state.isInitial,
      isAccepting: state.isAccepting,
    },
  }));
}

export function automatonToEdges(automaton: Automaton): Edge[] {
  return automaton.transitions.map((t) => ({
    id: t.id,
    source: t.from,
    target: t.to,
    label: t.isEpsilon ? EPSILON_SYMBOL : t.symbol,
    type: 'smoothstep',
    animated: t.isEpsilon,
    style: t.isEpsilon ? { strokeDasharray: '5 5' } : undefined,
  }));
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
