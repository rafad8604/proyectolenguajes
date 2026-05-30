'use client';

import { useMemo, useState } from 'react';
import type { ChomskyType, Grammar } from 'types/grammar';
import {
  DEFAULT_DERIVATION_LIMITS,
  deriveWord,
  formatSententialWithHighlight,
  type DerivationTreeNode,
} from 'lib/core/grammar/derive-word';
import { TYPE_SHORT_LABELS } from 'lib/core/grammar/chomsky-presets';
import { cn } from 'lib/utils/cn';

interface GrammarDerivationPanelProps {
  grammar: Grammar;
  grammarType: ChomskyType;
}

function DerivationTreeView({ node }: { node: DerivationTreeNode }) {
  const hasChildren = node.children.length > 0;

  return (
    <li className="list-none">
      <span
        className={cn(
          'inline-flex items-center rounded px-1.5 py-0.5 font-mono text-xs',
          node.isVariable
            ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200'
            : 'bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
        )}
      >
        {node.label}
      </span>
      {node.productionLabel && (
        <span className="ml-2 text-[10px] text-neutral-500">
          ({node.productionLabel})
        </span>
      )}
      {hasChildren && (
        <ul className="ml-4 mt-2 space-y-2 border-l-2 border-neutral-200 pl-3 dark:border-neutral-700">
          {node.children.map((child) => (
            <DerivationTreeView key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function GrammarDerivationPanel({
  grammar,
  grammarType,
}: GrammarDerivationPanelProps) {
  const [targetWord, setTargetWord] = useState('aba');
  const [maxSteps, setMaxSteps] = useState(DEFAULT_DERIVATION_LIMITS.maxSteps);
  const [maxFormLength, setMaxFormLength] = useState(
    DEFAULT_DERIVATION_LIMITS.maxFormLength
  );
  const [maxNodes, setMaxNodes] = useState(
    DEFAULT_DERIVATION_LIMITS.maxNodesExplored
  );
  const [submittedWord, setSubmittedWord] = useState<string | null>(null);

  const result = useMemo(() => {
    if (submittedWord === null) return null;
    return deriveWord(grammar, submittedWord, grammarType, {
      maxSteps,
      maxFormLength,
      maxNodesExplored: maxNodes,
    });
  }, [grammar, submittedWord, grammarType, maxSteps, maxFormLength, maxNodes]);

  const handleDerive = () => {
    setSubmittedWord(targetWord);
  };

  const handleClear = () => {
    setSubmittedWord(null);
    setTargetWord('');
  };

  const isRestrictedType = grammarType === 3 || grammarType === 2;

  return (
    <section className="space-y-4 rounded-lg border p-4 dark:border-neutral-700">
      <div>
        <h3 className="text-sm font-semibold">Derivación de palabras</h3>
        <p className="mt-1 text-xs text-neutral-500">
          Busca una secuencia de producciones desde {grammar.startSymbol} hasta
          la palabra objetivo ({TYPE_SHORT_LABELS[grammarType]}).
        </p>
      </div>

      {!isRestrictedType && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Modo asistido: para Tipo 1 y Tipo 0 la búsqueda está acotada. En general
          el problema puede ser <strong>indecidible</strong>; solo se muestran
          derivaciones encontradas dentro del límite.
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[160px] flex-1 text-sm">
          <span className="font-medium">Palabra objetivo</span>
          <input
            type="text"
            value={targetWord}
            onChange={(e) => setTargetWord(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
            placeholder="aba (vacío: ε, epsilon, lambda)"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Máx. pasos</span>
          <input
            type="number"
            min={1}
            max={200}
            value={maxSteps}
            onChange={(e) => setMaxSteps(Number(e.target.value) || 40)}
            className="mt-1 w-24 rounded-md border px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Máx. longitud</span>
          <input
            type="number"
            min={4}
            max={256}
            value={maxFormLength}
            onChange={(e) => setMaxFormLength(Number(e.target.value) || 64)}
            className="mt-1 w-24 rounded-md border px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
            title="Longitud máxima de la forma sentencial intermedia"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Máx. nodos</span>
          <input
            type="number"
            min={100}
            max={50000}
            step={500}
            value={maxNodes}
            onChange={(e) => setMaxNodes(Number(e.target.value) || 8000)}
            className="mt-1 w-28 rounded-md border px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
            title="Configuraciones exploradas en la búsqueda"
          />
        </label>
        <button
          type="button"
          onClick={handleDerive}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Derivar
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-md border px-4 py-2 text-sm dark:border-neutral-600"
        >
          Limpiar
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <p
            className={cn(
              'rounded-md px-3 py-2 text-sm',
              result.status === 'found'
                ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'
                : result.status === 'invalid_target'
                  ? 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'
                  : 'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
            )}
          >
            {result.message}
            {result.nodesExplored > 0 && (
              <span className="mt-1 block text-xs opacity-80">
                Configuraciones exploradas: {result.nodesExplored}
              </span>
            )}
          </p>

          {result.steps.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Pasos de derivación
              </h4>
              <ol className="mt-2 space-y-2">
                {result.steps.map((step) => {
                  const parts = formatSententialWithHighlight(step);
                  return (
                    <li
                      key={step.stepIndex}
                      className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                    >
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-xs font-medium text-neutral-500">
                          Paso {step.stepIndex}
                        </span>
                        <span className="font-mono">
                          {parts.prefix}
                          <span className="rounded bg-amber-200/80 px-0.5 dark:bg-amber-900/60">
                            {parts.highlight}
                          </span>
                          {parts.suffix}
                        </span>
                      </div>
                      {step.production && (
                        <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                          Regla: {step.productionLabel}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {result.tree && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Árbol de derivación
              </h4>
              <ul className="mt-2 rounded-md border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900/50">
                <DerivationTreeView node={result.tree} />
              </ul>
            </div>
          )}

          {result.treeNote && (
            <p className="text-xs text-neutral-500">{result.treeNote}</p>
          )}
        </div>
      )}
    </section>
  );
}
