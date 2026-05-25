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
export {
  GraphEditProvider,
  useGraphEdit,
} from './context/graph-edit-context';
export { GraphStateNode, type GraphStateNodeData } from './nodes/graph-state-node';
export {
  assignParallelEdgeOffsets,
  offsetEdgeLabelPosition,
  parallelPathOffset,
  pathSpacingForTotal,
} from './utils/parallel-edge-offset';
export {
  resolveLabelPosition,
  labelVisualFromProjection,
} from './utils/label-position';
export {
  clampLabelAlong,
  pointAtAlongQuadratic,
  pointAtAlongSvgPath,
  projectOntoQuadraticBezier,
  projectOntoSvgPath,
} from './utils/project-point-on-path';
export type {
  ParallelEdgeMeta,
  ParallelTransitionRef,
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
