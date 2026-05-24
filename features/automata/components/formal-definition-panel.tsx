'use client';

import { useMemo } from 'react';
import { useAutomatonStore } from '../store/automaton-store';
import { buildFormalDefinition } from 'lib/core/automata';

export function FormalDefinitionPanel() {
  const automaton = useAutomatonStore((s) => s.automaton);
  const formal = useMemo(
    () => buildFormalDefinition(automaton),
    [automaton]
  );

  return (
    <div className="space-y-3 font-mono text-sm">
      <h3 className="font-sans text-sm font-semibold">Definición formal</h3>
      <p>
        <span className="text-neutral-500">Q =</span>{' '}
        {formal.Q.length > 0 ? `{${formal.Q.join(', ')}}` : '∅'}
      </p>
      <p>
        <span className="text-neutral-500">Σ =</span>{' '}
        {formal.sigma.length > 0 ? `{${formal.sigma.join(', ')}}` : '∅'}
      </p>
      <p>
        <span className="text-neutral-500">q₀ =</span>{' '}
        {formal.q0 ?? '—'}
      </p>
      <p>
        <span className="text-neutral-500">F =</span>{' '}
        {formal.F.length > 0 ? `{${formal.F.join(', ')}}` : '∅'}
      </p>
      <div>
        <p className="text-neutral-500 mb-1">δ:</p>
        {formal.delta.length === 0 ? (
          <p className="text-neutral-400">∅</p>
        ) : (
          <ul className="space-y-0.5 pl-2">
            {formal.delta.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
