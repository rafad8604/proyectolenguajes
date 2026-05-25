'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type { TransitionVisual } from 'types/transition-visual';

export interface GraphEditContextValue {
  edgeLayoutEditable: boolean;
  onTransitionVisualChange?: (
    transitionId: string,
    partial: Partial<TransitionVisual>
  ) => void;
}

const GraphEditContext = createContext<GraphEditContextValue>({
  edgeLayoutEditable: false,
});

export function useGraphEdit(): GraphEditContextValue {
  return useContext(GraphEditContext);
}

interface GraphEditProviderProps {
  edgeLayoutEditable: boolean;
  onTransitionVisualChange?: (
    transitionId: string,
    partial: Partial<TransitionVisual>
  ) => void;
  children: ReactNode;
}

function GraphEditProviderInner({
  edgeLayoutEditable,
  onTransitionVisualChange,
  children,
}: GraphEditProviderProps) {
  const value = useMemo(
    () => ({ edgeLayoutEditable, onTransitionVisualChange }),
    [edgeLayoutEditable, onTransitionVisualChange]
  );
  return (
    <GraphEditContext.Provider value={value}>
      {children}
    </GraphEditContext.Provider>
  );
}

/** Provee contexto de edición de aristas; debe envolver el componente ReactFlow. */
export function GraphEditProvider(props: GraphEditProviderProps) {
  return <GraphEditProviderInner {...props} />;
}
