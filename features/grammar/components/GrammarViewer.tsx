'use client';

import { useMemo, useState } from 'react';
import type { Automaton } from 'types/automaton';
import type { Grammar } from 'types/grammar';
import {
  formatGrammarAsText,
  grammarFromFiniteAutomaton,
} from 'lib/core/grammar/fromFiniteAutomaton';
import { EPSILON_SYMBOL } from 'lib/core/automata';
import { cn } from 'lib/utils/cn';

interface GrammarViewerProps {
  automaton: Automaton;
  className?: string;
}

function formatProductionLine(grammar: Grammar, variable: string): string {
  const prods = grammar.productions.filter((p) => p.left[0] === variable);
  if (prods.length === 0) return `${variable} → (sin producciones)`;

  const alternatives = prods.map((p) => {
    if (p.right.length === 1 && p.right[0] === null) return EPSILON_SYMBOL;
    return p.right.map((s) => (s === null ? EPSILON_SYMBOL : s)).join('');
  });

  return `${variable} → ${alternatives.join(' | ')}`;
}

export function GrammarViewer({ automaton, className }: GrammarViewerProps) {
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => grammarFromFiniteAutomaton(automaton),
    [automaton]
  );

  const textForm = useMemo(
    () => (result.grammar ? formatGrammarAsText(result.grammar) : ''),
    [result.grammar]
  );

  const handleCopy = async () => {
    if (!textForm) return;
    await navigator.clipboard.writeText(textForm);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (result.error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
    );
  }

  const { grammar, explanation, warnings } = result;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">
          Gramática regular equivalente
          <span className="ml-2 text-xs font-normal text-neutral-500">
            (tipo 3 — Chomsky)
          </span>
        </h3>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 dark:border-neutral-600 dark:hover:bg-neutral-800"
        >
          {copied ? '¡Copiado!' : 'Copiar gramática'}
        </button>
      </div>

      {warnings.length > 0 && (
        <ul className="space-y-1 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {warnings.map((w, i) => (
            <li key={i}>• {w}</li>
          ))}
        </ul>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-neutral-500">Variables (V)</dt>
            <dd className="font-mono">
              {grammar.variables.length > 0
                ? `{${grammar.variables.join(', ')}}`
                : '∅'}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Terminales (Σ)</dt>
            <dd className="font-mono">
              {grammar.terminals.length > 0
                ? `{${grammar.terminals.join(', ')}}`
                : '∅'}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Símbolo inicial (S)</dt>
            <dd className="font-mono">{grammar.startSymbol}</dd>
          </div>
        </dl>

        <div>
          <p className="mb-2 text-xs font-medium text-neutral-500">
            Producciones (P)
          </p>
          <ul className="space-y-1 font-mono text-sm">
            {grammar.variables.map((v) => (
              <li key={v}>{formatProductionLine(grammar, v)}</li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-neutral-500">
          Explicación
        </p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-neutral-700 dark:text-neutral-300">
          {explanation.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>
      </div>

      <pre className="overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs font-mono dark:border-neutral-700 dark:bg-neutral-900/50">
        {textForm}
      </pre>
    </div>
  );
}
