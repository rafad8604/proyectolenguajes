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
import { useAutomatonStore } from '../store/automaton-store';
import { useSimulationStore } from '../store/simulation-store';
import {
  automatonToEdges,
  automatonToNodes,
  type AutomatonGraphHighlight,
} from '../adapters/react-flow';
import { StateNode } from './state-node';

const nodeTypes = { stateNode: StateNode };

export interface AutomatonCanvasProps {
  /** Si se omite, usa el autómata del store global. */
  automaton?: Automaton;
  readOnly?: boolean;
  highlight?: AutomatonGraphHighlight;
  className?: string;
}

export function AutomatonCanvas({
  automaton: automatonProp,
  readOnly = false,
  highlight: highlightProp,
  className = 'h-[420px]',
}: AutomatonCanvasProps) {
  const storeAutomaton = useAutomatonStore((s) => s.automaton);
  const updateStatePosition = useAutomatonStore((s) => s.updateStatePosition);
  const setPendingConnection = useAutomatonStore((s) => s.setPendingConnection);
  const selectState = useAutomatonStore((s) => s.selectState);

  const trace = useSimulationStore((s) => s.trace);
  const currentStepIndex = useSimulationStore((s) => s.currentStepIndex);

  const automaton = automatonProp ?? storeAutomaton;

  const highlightFromSim = useMemo(() => {
    if (highlightProp !== undefined) return highlightProp;
    if (automatonProp) return highlightProp;
    const step = trace?.steps[currentStepIndex];
    if (!step) return undefined;
    return {
      activeStateIds: step.activeStateIds,
      activeTransitionIds: step.appliedTransitionIds,
    };
  }, [highlightProp, automatonProp, trace, currentStepIndex]);

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
      if (readOnly || automatonProp) return;
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
    [readOnly, automatonProp, updateStatePosition]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (readOnly || automatonProp) return;
      if (connection.source && connection.target) {
        setPendingConnection(connection.source, connection.target);
      }
    },
    [readOnly, automatonProp, setPendingConnection]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (readOnly || automatonProp) return;
      selectState(node.id);
    },
    [readOnly, automatonProp, selectState]
  );

  return (
    <div
      className={`${className} w-full rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/50`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={() => {
          if (!readOnly && !automatonProp) selectState(null);
        }}
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
