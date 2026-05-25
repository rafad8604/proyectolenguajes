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
  const offsets = assignParallelEdgeOffsets(
    machine.transitions.map((t) => ({
      id: t.id,
      from: t.from,
      to: t.to,
    }))
  );

  return machine.transitions.map((t) => {
    const isActive = activeTransitions.has(t.id);
    const meta = offsets.get(t.id);
    const isSelfLoop = t.from === t.to;
    const label = formatTransitionLabel(
      t,
      machine.tapeCount,
      machine.blankSymbol
    );

    return {
      id: t.id,
      source: t.from,
      target: t.to,
      type: isSelfLoop ? 'selfLoop' : 'directed',
      label,
      animated: isActive,
      data: {
        label,
        isActive,
        offsetIndex: meta?.offsetIndex ?? 0,
        totalSiblings: meta?.totalSiblings ?? 1,
        curveSign: meta?.curveSign ?? 1,
      },
    };
  });
}
