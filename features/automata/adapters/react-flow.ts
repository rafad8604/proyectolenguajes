import type { Edge, Node } from '@xyflow/react';
import type { Automaton } from 'types/automaton';
import { EPSILON_SYMBOL } from 'lib/core/automata';
import { assignParallelEdgeOffsets } from 'features/graph/utils/parallel-edge-offset';
import type { GraphEdgeData } from 'features/graph/edges/edge-types';
import type { GraphStateNodeData } from 'features/graph/nodes/graph-state-node';

export type { GraphStateNodeData as StateNodeData };

export interface AutomatonGraphHighlight {
  activeStateIds?: string[];
  visitedStateIds?: string[];
  activeAcceptingStateIds?: string[];
  activeTransitionIds?: string[];
  visitedTransitionIds?: string[];
}

export function automatonToNodes(
  automaton: Automaton,
  highlight?: AutomatonGraphHighlight
): Node<GraphStateNodeData>[] {
  const active = new Set(highlight?.activeStateIds ?? []);
  const visited = new Set(highlight?.visitedStateIds ?? []);
  const activeAccepting = new Set(highlight?.activeAcceptingStateIds ?? []);

  return automaton.states.map((state) => {
    const isActive = active.has(state.id);
    const isVisited = visited.has(state.id) && !isActive;
    const isActiveAccepting = activeAccepting.has(state.id);

    return {
      id: state.id,
      type: 'stateNode',
      position: state.position ?? { x: 0, y: 0 },
      data: {
        label: state.name,
        stateId: state.id,
        isInitial: state.isInitial,
        isAccepting: state.isAccepting,
        isActive,
        isVisited,
        isActiveAccepting,
      },
    };
  });
}

export function automatonToEdges(
  automaton: Automaton,
  highlight?: AutomatonGraphHighlight
): Edge<GraphEdgeData>[] {
  const activeTransitions = new Set(highlight?.activeTransitionIds ?? []);
  const visitedTransitions = new Set(highlight?.visitedTransitionIds ?? []);
  const offsets = assignParallelEdgeOffsets(
    automaton.transitions.map((t) => ({
      id: t.id,
      from: t.from,
      to: t.to,
    }))
  );

  return automaton.transitions.map((t) => {
    const isActive = activeTransitions.has(t.id);
    const isVisited = visitedTransitions.has(t.id) && !isActive;
    const meta = offsets.get(t.id);
    const isSelfLoop = t.from === t.to;

    return {
      id: t.id,
      source: t.from,
      target: t.to,
      type: isSelfLoop ? 'selfLoop' : 'directed',
      label: t.isEpsilon ? EPSILON_SYMBOL : t.symbol,
      animated: t.isEpsilon || isActive,
      data: {
        label: t.isEpsilon ? EPSILON_SYMBOL : t.symbol,
        isEpsilon: t.isEpsilon,
        isActive,
        isVisited,
        offsetIndex: meta?.offsetIndex ?? 0,
        totalSiblings: meta?.totalSiblings ?? 1,
        curveSign: meta?.curveSign ?? 1,
      },
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
