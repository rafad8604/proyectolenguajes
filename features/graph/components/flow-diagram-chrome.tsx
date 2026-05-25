'use client';

import { Background, Controls } from '@xyflow/react';

/** Controles del diagrama sin minimapa (uso compartido en todos los canvas). */
export function FlowDiagramChrome() {
  return (
    <>
      <Background gap={16} size={1} />
      <Controls />
    </>
  );
}
