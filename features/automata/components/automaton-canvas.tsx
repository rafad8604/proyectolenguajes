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
import { useAutomatonStore } from '../store/automaton-store';
import { useSimulationStore } from '../store/simulation-store';
import { automatonToEdges, automatonToNodes } from '../adapters/react-flow';
import { StateNode } from './state-node';

const nodeTypes = { stateNode: StateNode };

export function AutomatonCanvas() {
  const automaton = useAutomatonStore((s) => s.automaton);
  const updateStatePosition = useAutomatonStore((s) => s.updateStatePosition);
  const setPendingConnection = useAutomatonStore((s) => s.setPendingConnection);
  const selectState = useAutomatonStore((s) => s.selectState);

  const trace = useSimulationStore((s) => s.trace);
  const currentStepIndex = useSimulationStore((s) => s.currentStepIndex);

  const highlight = useMemo(() => {
    const step = trace?.steps[currentStepIndex];
    if (!step) return undefined;
    return {
      activeStateIds: step.activeStateIds,
      activeTransitionIds: step.appliedTransitionIds,
    };
  }, [trace, currentStepIndex]);

  const nodes = useMemo(
    () => automatonToNodes(automaton, highlight),
    [automaton, highlight]
  );
  const edges = useMemo(
    () => automatonToEdges(automaton, highlight),
    [automaton, highlight]
  );

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      for (const change of changes) {
        if (
          change.type === 'position' &&
          change.position &&
          change.dragging === false
        ) {
          updateStatePosition(change.id, change.position.x, change.position.y);
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
    <div className="h-[420px] w-full rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={() => selectState(null)}
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
