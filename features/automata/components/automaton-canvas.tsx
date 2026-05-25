'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Connection,
  type Node,
  type OnNodesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Automaton } from 'types/automaton';
import { sharedEdgeTypes, sharedNodeTypes } from 'features/graph';
import { defaultDirectedMarker } from 'features/graph/edges/edge-types';
import { useAutomatonStore } from '../store/automaton-store';
import { useSimulationStore } from '../store/simulation-store';
import {
  automatonToEdges,
  automatonToNodes,
  type AutomatonGraphHighlight,
} from '../adapters/react-flow';
import {
  buildVisualSnapshot,
  snapshotToGraphHighlight,
  type SimulationTrace,
} from 'lib/core/automata';

export interface AutomatonCanvasProps {
  /** Si se omite, usa el autómata del store global. */
  automaton?: Automaton;
  readOnly?: boolean;
  /** Permite arrastrar nodos para reordenar el layout sin editar transiciones. */
  layoutDraggable?: boolean;
  onStatePositionChange?: (
    stateId: string,
    position: { x: number; y: number }
  ) => void;
  highlight?: AutomatonGraphHighlight;
  /** Traza controlada (p. ej. Thompson dual); evita el store global. */
  trace?: SimulationTrace | null;
  stepIndex?: number;
  className?: string;
  ariaLabel?: string;
}

export function AutomatonCanvas({
  automaton: automatonProp,
  readOnly = false,
  layoutDraggable = false,
  onStatePositionChange,
  highlight: highlightProp,
  trace: traceProp,
  stepIndex: stepIndexProp,
  className = 'h-[min(420px,50vh)] min-h-[320px]',
  ariaLabel = 'Diagrama del autómata finito',
}: AutomatonCanvasProps) {
  const storeAutomaton = useAutomatonStore((s) => s.automaton);
  const updateStatePosition = useAutomatonStore((s) => s.updateStatePosition);
  const setPendingConnection = useAutomatonStore((s) => s.setPendingConnection);
  const selectState = useAutomatonStore((s) => s.selectState);

  const storeTrace = useSimulationStore((s) => s.trace);
  const storeStepIndex = useSimulationStore((s) => s.currentStepIndex);
  const useControlledSim =
    traceProp !== undefined && stepIndexProp !== undefined;
  const trace = useControlledSim ? traceProp : storeTrace;
  const currentStepIndex = useControlledSim ? stepIndexProp : storeStepIndex;

  const automaton = automatonProp ?? storeAutomaton;
  const canDragLayout = layoutDraggable || !!onStatePositionChange;
  const isEditable = !readOnly && !automatonProp;

  const highlightFromSim = useMemo(() => {
    if (highlightProp !== undefined) return highlightProp;
    if (!trace || trace.steps.length === 0) return undefined;
    const snapshot = buildVisualSnapshot(trace, currentStepIndex, automaton);
    return snapshotToGraphHighlight(snapshot);
  }, [highlightProp, trace, currentStepIndex, automaton, useControlledSim]);

  const nodes = useMemo(
    () => automatonToNodes(automaton, highlightFromSim),
    [automaton, highlightFromSim]
  );
  const edges = useMemo(
    () => automatonToEdges(automaton, highlightFromSim),
    [automaton, highlightFromSim]
  );

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const persistLayout = canDragLayout || isEditable;
      if (!persistLayout) return;

      for (const change of changes) {
        if (
          change.type === 'position' &&
          change.position &&
          change.dragging === false
        ) {
          if (onStatePositionChange) {
            onStatePositionChange(change.id, {
              x: change.position.x,
              y: change.position.y,
            });
          } else if (isEditable) {
            updateStatePosition(
              change.id,
              change.position.x,
              change.position.y
            );
          }
        }
      }
    },
    [canDragLayout, isEditable, onStatePositionChange, updateStatePosition]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isEditable) return;
      if (connection.source && connection.target) {
        setPendingConnection(connection.source, connection.target);
      }
    },
    [isEditable, setPendingConnection]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (!isEditable) return;
      selectState(node.id);
    },
    [isEditable, selectState]
  );

  return (
    <div
      className={`${className} w-full rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/50`}
      role="img"
      aria-label={ariaLabel}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={sharedNodeTypes}
        edgeTypes={sharedEdgeTypes}
        nodesDraggable={isEditable || canDragLayout}
        nodesConnectable={isEditable}
        elementsSelectable={isEditable || canDragLayout}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={() => {
          if (isEditable) selectState(null);
        }}
        defaultEdgeOptions={{
          type: 'directed',
          markerEnd: defaultDirectedMarker,
        }}
        elevateEdgesOnSelect
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} size={1} />
        <Controls />
        <MiniMap zoomable pannable />
      </ReactFlow>
    </div>
  );
}
