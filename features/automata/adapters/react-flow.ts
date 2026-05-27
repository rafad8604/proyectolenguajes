import type { Edge, Node } from '@xyflow/react';
import type { Automaton } from 'types/automaton';
import { EPSILON_SYMBOL } from 'lib/core/automata';
import { getStateLabelDisplay } from 'lib/core/automata/state-label-display';
import { assignParallelEdgeOffsets } from 'features/graph/utils/parallel-edge-offset';
import type { GraphEdgeData } from 'features/graph/edges/edge-types';
import { markerEndForEdge } from 'features/graph/edges/edge-types';
import type { GraphStateNodeData } from 'features/graph/nodes/graph-state-node';

export type { GraphStateNodeData as StateNodeData };

export interface AutomatonGraphHighlight {
  stepIndex?: number;
  activeStateIds?: string[];
  previouslyVisitedStateIds?: string[];
  visitedStateIds?: string[];
  revisitedStateIds?: string[];
  activeAcceptingStateIds?: string[];
  activeTransitionIds?: string[];
  previouslyVisitedTransitionIds?: string[];
  visitedTransitionIds?: string[];
  revisitedTransitionIds?: string[];
  rejectingStateIds?: string[];
}

export function automatonToNodes(
  automaton: Automaton,
  highlight?: AutomatonGraphHighlight
): Node<GraphStateNodeData>[] {
  const active = new Set(highlight?.activeStateIds ?? []);
  const previouslyVisited = new Set(highlight?.previouslyVisitedStateIds ?? []);
  const visited = new Set(highlight?.visitedStateIds ?? []);
  const revisited = new Set(highlight?.revisitedStateIds ?? []);
  const activeAccepting = new Set(highlight?.activeAcceptingStateIds ?? []);
  const rejecting = new Set(highlight?.rejectingStateIds ?? []);
  const highlightStepIndex = highlight?.stepIndex;

  return automaton.states.map((state) => {
    const isActive = active.has(state.id);
    const isPreviouslyVisited =
      previouslyVisited.has(state.id) || visited.has(state.id);
    const isVisited = isPreviouslyVisited && !isActive;
    const isRevisited = revisited.has(state.id) && isActive;
    const isActiveAccepting = activeAccepting.has(state.id);
    const isRejecting = rejecting.has(state.id);
    const labelDisplay = getStateLabelDisplay(state.name);

    return {
      id: state.id,
      type: 'stateNode',
      position: state.position ?? { x: 0, y: 0 },
      data: {
        label: labelDisplay.displayText,
        fullLabel: labelDisplay.fullText,
        labelLines: labelDisplay.lines,
        labelFontSizeClass: labelDisplay.fontSizeClass,
        stateId: state.id,
        isInitial: state.isInitial,
        isAccepting: state.isAccepting,
        isActive,
        isVisited,
        isRevisited,
        isActiveAccepting,
        isRejecting,
        highlightStepIndex,
      },
    };
  });
}

export function automatonToEdges(
  automaton: Automaton,
  highlight?: AutomatonGraphHighlight
): Edge<GraphEdgeData>[] {
  const activeTransitions = new Set(highlight?.activeTransitionIds ?? []);
  const previouslyVisitedTransitions = new Set(
    highlight?.previouslyVisitedTransitionIds ?? []
  );
  const visitedTransitions = new Set(highlight?.visitedTransitionIds ?? []);
  const revisitedTransitions = new Set(highlight?.revisitedTransitionIds ?? []);
  const highlightStepIndex = highlight?.stepIndex;
  const offsets = assignParallelEdgeOffsets(
    automaton.transitions.map((t) => ({
      id: t.id,
      from: t.from,
      to: t.to,
      sortKey: t.isEpsilon ? EPSILON_SYMBOL : t.symbol,
    }))
  );

  return automaton.transitions.map((t) => {
    const isActive = activeTransitions.has(t.id);
    const isPreviouslyVisited =
      previouslyVisitedTransitions.has(t.id) || visitedTransitions.has(t.id);
    const isVisited = isPreviouslyVisited && !isActive;
    const isRevisited = revisitedTransitions.has(t.id) && isActive;
    const meta = offsets.get(t.id);
    const isSelfLoop = t.from === t.to;

    const data: GraphEdgeData = {
      label: t.isEpsilon ? EPSILON_SYMBOL : t.symbol,
      transitionId: t.id,
      visual: t.visual,
      isEpsilon: t.isEpsilon,
      isActive,
      isVisited,
      isRevisited,
      highlightStepIndex,
      offsetIndex: meta?.offsetIndex ?? 0,
      totalSiblings: meta?.totalSiblings ?? 1,
      curveSign: meta?.curveSign ?? 1,
    };

    return {
      id: t.id,
      source: t.from,
      target: t.to,
      type: isSelfLoop ? 'selfLoop' : 'directed',
      ...(isSelfLoop
        ? { sourceHandle: 'right', targetHandle: 'left' }
        : {}),
      label: t.isEpsilon ? EPSILON_SYMBOL : t.symbol,
      animated: isActive,
      markerEnd: markerEndForEdge(data),
      data,
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
