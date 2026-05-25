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
import { sharedEdgeTypes, sharedNodeTypes } from 'features/graph';
import { defaultDirectedMarker } from 'features/graph/edges/edge-types';
import { useTuringStore } from '../store/turing-store';
import { useTuringSimulationStore } from '../store/turing-simulation-store';
import { turingToEdges, turingToNodes } from '../adapters/react-flow';

export function TuringCanvas() {
  const machine = useTuringStore((s) => s.machine);
  const updateStatePosition = useTuringStore((s) => s.updateStatePosition);
  const setPendingConnection = useTuringStore((s) => s.setPendingConnection);
  const selectState = useTuringStore((s) => s.selectState);

  const trace = useTuringSimulationStore((s) => s.trace);
  const currentStepIndex = useTuringSimulationStore((s) => s.currentStepIndex);

  const highlight = useMemo(() => {
    const step = trace?.steps[currentStepIndex];
    if (!step) return undefined;
    return {
      activeStateIds: [step.config.stateId],
      activeTransitionIds: step.appliedTransitionId
        ? [step.appliedTransitionId]
        : [],
    };
  }, [trace, currentStepIndex]);

  const nodes = useMemo(
    () => turingToNodes(machine, highlight),
    [machine, highlight]
  );
  const edges = useMemo(
    () => turingToEdges(machine, highlight),
    [machine, highlight]
  );

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      for (const change of changes) {
        if (
          change.type === 'position' &&
          change.position &&
          change.dragging === false
        ) {
          updateStatePosition(
            change.id,
            change.position.x,
            change.position.y
          );
        }
      }
    },
    [updateStatePosition]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        setPendingConnection(connection.source, connection.target);
      }
    },
    [setPendingConnection]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectState(node.id);
    },
    [selectState]
  );

  return (
    <div
      className="h-[min(420px,50vh)] min-h-[320px] w-full rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/50"
      role="img"
      aria-label="Diagrama de la máquina de Turing"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={sharedNodeTypes}
        edgeTypes={sharedEdgeTypes}
        nodesDraggable
        nodesConnectable
        elementsSelectable
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={() => selectState(null)}
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
