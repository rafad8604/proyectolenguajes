'use client';

import { useMemo } from 'react';
import type { Automaton } from 'types/automaton';
import { buildFormalDefinition } from 'lib/core/automata';

interface AutomatonFormalDefinitionReadonlyProps {
  automaton: Automaton;
}

export function AutomatonFormalDefinitionReadonly({
  automaton,
}: AutomatonFormalDefinitionReadonlyProps) {
  const formal = useMemo(() => buildFormalDefinition(automaton), [automaton]);

  return (
    <div className="space-y-3 font-mono text-sm">
      <h4 className="font-sans text-sm font-semibold">Definición formal</h4>
      <p>
        <span className="text-neutral-500">Q =</span>{' '}
        {formal.Q.length > 0 ? `{${formal.Q.join(', ')}}` : '∅'}
      </p>
      <p>
        <span className="text-neutral-500">Σ =</span>{' '}
        {formal.sigma.length > 0 ? `{${formal.sigma.join(', ')}}` : '∅'}
      </p>
      <p>
        <span className="text-neutral-500">q₀ =</span> {formal.q0 ?? '—'}
      </p>
      <p>
        <span className="text-neutral-500">F =</span>{' '}
        {formal.F.length > 0 ? `{${formal.F.join(', ')}}` : '∅'}
      </p>
      <div>
        <p className="mb-1 text-neutral-500">δ:</p>
        {formal.delta.length === 0 ? (
          <p className="text-neutral-400">∅</p>
        ) : (
          <ul className="max-h-48 space-y-0.5 overflow-y-auto pl-2 text-xs">
            {formal.delta.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
