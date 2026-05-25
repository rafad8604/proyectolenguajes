export { DirectedEdge } from './edges/directed-edge';
export { SelfLoopEdge } from './edges/self-loop-edge';
export {
  defaultDirectedMarker,
  graphEdgeTypes,
  markerEndForEdge,
  type GraphEdgeData,
} from './edges/edge-types';
export { GRAPH_NODE_RADIUS } from './constants';
export { FlowDiagramChrome } from './components/flow-diagram-chrome';
export { GraphStateNode, type GraphStateNodeData } from './nodes/graph-state-node';
export {
  assignParallelEdgeOffsets,
  parallelPathOffset,
} from './utils/parallel-edge-offset';

import { DirectedEdge } from './edges/directed-edge';
import { SelfLoopEdge } from './edges/self-loop-edge';
import { GraphStateNode } from './nodes/graph-state-node';

export const sharedEdgeTypes = {
  directed: DirectedEdge,
  selfLoop: SelfLoopEdge,
};

export const sharedNodeTypes = {
  stateNode: GraphStateNode,
};
