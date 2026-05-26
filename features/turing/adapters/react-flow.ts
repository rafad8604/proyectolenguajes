import type { Edge, Node } from '@xyflow/react';
import type { TuringMachine } from 'types/turing';
import { formatTransitionLabel } from 'lib/core/turing/formatTransitionLabel';
import { assignParallelEdgeOffsets } from 'features/graph/utils/parallel-edge-offset';
import type { GraphEdgeData } from 'features/graph/edges/edge-types';
import type { GraphStateNodeData } from 'features/graph/nodes/graph-state-node';

export interface TuringGraphHighlight {
  activeStateIds?: string[];
  activeTransitionIds?: string[];
}

export function turingToNodes(
  machine: TuringMachine,
  highlight?: TuringGraphHighlight
): Node<GraphStateNodeData>[] {
  const active = new Set(highlight?.activeStateIds ?? []);
  const rejecting = new Set(machine.rejectingStateIds);

  return machine.states.map((state) => ({
    id: state.id,
    type: 'stateNode',
    position: state.position ?? { x: 0, y: 0 },
    data: {
      label: state.name,
      stateId: state.id,
      isInitial: state.isInitial,
      isAccepting: state.isAccepting,
      isRejecting: rejecting.has(state.id),
      isActive: active.has(state.id),
    },
  }));
}

export function turingToEdges(
  machine: TuringMachine,
  highlight?: TuringGraphHighlight
): Edge<GraphEdgeData>[] {
  const activeTransitions = new Set(highlight?.activeTransitionIds ?? []);
  const transitionsWithLabel = machine.transitions.map((t) => ({
    t,
    label: formatTransitionLabel(t, machine.tapeCount, machine.blankSymbol),
  }));

  const offsets = assignParallelEdgeOffsets(
    transitionsWithLabel.map(({ t, label }) => ({
      id: t.id,
      from: t.from,
      to: t.to,
      sortKey: label,
    }))
  );

  return transitionsWithLabel.map(({ t, label }) => {
    const isActive = activeTransitions.has(t.id);
    const meta = offsets.get(t.id);
    const isSelfLoop = t.from === t.to;

    return {
      id: t.id,
      source: t.from,
      target: t.to,
      type: isSelfLoop ? 'selfLoop' : 'directed',
      // Handles deterministas para self-loops: el midpoint right/left = centro
      // del nodo, lo que mantiene la geometría del arco por encima del nodo.
      ...(isSelfLoop
        ? { sourceHandle: 'right', targetHandle: 'left' }
        : {}),
      label,
      animated: isActive,
      data: {
        label,
        transitionId: t.id,
        visual: t.visual,
        isActive,
        offsetIndex: meta?.offsetIndex ?? 0,
        totalSiblings: meta?.totalSiblings ?? 1,
        curveSign: meta?.curveSign ?? 1,
      },
    };
  });
}
