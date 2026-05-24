'use client';

import { useMemo, useState } from 'react';
import type { Grammar, Production } from 'types/grammar';
import {
  formatGrammarAsText,
  validateAndClassify,
  type GrammarInput,
} from 'lib/core/grammar/classifyGrammar';
import { EPSILON_SYMBOL } from 'lib/core/automata';
import { downloadTextFile } from 'lib/utils/download';
import { ChomskyHierarchyPanel } from './ChomskyHierarchyPanel';

const EXAMPLES: Array<{ label: string; input: GrammarInput }> = [
  {
    label: 'Regular (derecha)',
    input: {
      name: 'Regular derecha',
      variablesText: 'S, A',
      terminalsText: 'a, b',
      startSymbol: 'S',
      productionsText: 'S -> aA | b\nA -> aA | b',
    },
  },
  {
    label: 'Libre de contexto',
    input: {
      name: 'Palíndromos',
      variablesText: 'S',
      terminalsText: 'a, b',
      startSymbol: 'S',
      productionsText: 'S -> aSa | bSb | a | b | ε',
    },
  },
  {
    label: 'Sensible al contexto',
    input: {
      name: 'Copiar a^n b^n c^n (fragmento)',
      variablesText: 'S, A, B, C',
      terminalsText: 'a, b, c',
      startSymbol: 'S',
      productionsText: 'S -> aSBC | abc\nCB -> BC\nbB -> bb\nbC -> bc\ncC -> cc',
    },
  },
  {
    label: 'Irrestricta',
    input: {
      name: 'Acortamiento',
      variablesText: 'S, A, B',
      terminalsText: 'a, b',
      startSymbol: 'S',
      productionsText: 'S -> aAB\nAB -> a',
    },
  },
];

function isEpsilonProd(prod: Production): boolean {
  return prod.right.length === 0 || (prod.right.length === 1 && prod.right[0] === null);
}

function groupProductions(grammar: Grammar): string[] {
  const byLeft = new Map<string, Production[]>();
  for (const p of grammar.productions) {
    const key = p.left.join('');
    if (!byLeft.has(key)) byLeft.set(key, []);
    byLeft.get(key)!.push(p);
  }

  const lines: string[] = [];
  for (const variable of grammar.variables) {
    const prods = byLeft.get(variable);
    if (!prods?.length) continue;
    const alts = prods.map((p) => {
      if (isEpsilonProd(p)) return EPSILON_SYMBOL;
      return p.right.map((s) => (s === null ? EPSILON_SYMBOL : s)).join('');
    });
    lines.push(`${variable} → ${alts.join(' | ')}`);
  }

  for (const [key, prods] of byLeft) {
    if (grammar.variables.includes(key)) continue;
    const alts = prods.map((p) => {
      if (isEpsilonProd(p)) return EPSILON_SYMBOL;
      return p.right.map((s) => (s === null ? EPSILON_SYMBOL : s)).join('');
    });
    lines.push(`${key} → ${alts.join(' | ')}`);
  }

  return lines;
}

export function GrammarEditor() {
  const [variablesText, setVariablesText] = useState('S, A');
  const [terminalsText, setTerminalsText] = useState('a, b');
  const [startSymbol, setStartSymbol] = useState('S');
  const [productionsText, setProductionsText] = useState('S -> aA | b\nA -> aA | b');
  const [name, setName] = useState('Gramática de ejemplo');
  const [copied, setCopied] = useState(false);

  const input: GrammarInput = useMemo(
    () => ({
      name,
      variablesText,
      terminalsText,
      startSymbol,
      productionsText,
    }),
    [name, variablesText, terminalsText, startSymbol, productionsText]
  );

  const { validation, classification } = useMemo(
    () => validateAndClassify(input),
    [input]
  );

  const grammar = validation.grammar;
  const productionLines = grammar ? groupProductions(grammar) : [];
  const textForm = grammar ? formatGrammarAsText(grammar) : '';

  const handleCopy = async () => {
    if (!textForm) return;
    await navigator.clipboard.writeText(textForm);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!textForm) return;
    downloadTextFile(textForm, 'gramatica.txt', 'text/plain;charset=utf-8');
  };

  const loadExample = (example: GrammarInput) => {
    setName(example.name ?? 'Gramática');
    setVariablesText(example.variablesText);
    setTerminalsText(example.terminalsText);
    setStartSymbol(example.startSymbol);
    setProductionsText(example.productionsText);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <span className="self-center text-xs text-neutral-500">Ejemplos:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => loadExample(ex.input)}
            className="rounded border px-2 py-1 text-xs dark:border-neutral-600"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">Variables (V)</span>
          <input
            type="text"
            value={variablesText}
            onChange={(e) => setVariablesText(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
            placeholder="S, A, B"
          />
          <span className="mt-1 block text-xs text-neutral-500">
            Separadas por coma o espacio.
          </span>
        </label>

        <label className="block text-sm">
          <span className="font-medium">Terminales (Σ)</span>
          <input
            type="text"
            value={terminalsText}
            onChange={(e) => setTerminalsText(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
            placeholder="a, b, 0, 1"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium">Símbolo inicial (S)</span>
          <input
            type="text"
            value={startSymbol}
            onChange={(e) => setStartSymbol(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
            placeholder="S"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium">Nombre</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="font-medium">Producciones (P)</span>
        <textarea
          value={productionsText}
          onChange={(e) => setProductionsText(e.target.value)}
          rows={8}
          className="mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
          placeholder={'S -> aA | b\nA -> aA | b | ε'}
        />
        <span className="mt-1 block text-xs text-neutral-500">
          Una regla por línea. Usa <code className="font-mono">-&gt;</code> o{' '}
          <code className="font-mono">→</code>. Alternativas con <code className="font-mono">|</code>.
          Épsilon: ε.
        </span>
      </label>

      {!validation.valid && validation.issues.length > 0 && (
        <ul className="space-y-1 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {validation.issues.map((issue, i) => (
            <li key={i}>
              {issue.line > 0 ? `Línea ${issue.line}: ` : ''}
              {issue.message}
            </li>
          ))}
        </ul>
      )}

      {grammar && (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md border px-4 py-2 text-sm dark:border-neutral-600"
            >
              {copied ? '¡Copiado!' : 'Copiar gramática'}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="rounded-md border px-4 py-2 text-sm dark:border-neutral-600"
            >
              Exportar .txt
            </button>
          </div>

          <section className="rounded-lg border p-4 dark:border-neutral-700">
            <h3 className="text-sm font-semibold">Tabla de producciones</h3>
            <div className="mt-3 overflow-x-auto overflow-table">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b text-xs text-neutral-500 dark:border-neutral-700">
                    <th className="py-2 pr-4">#</th>
                    <th className="py-2 pr-4">Lado izquierdo</th>
                    <th className="py-2">Lado derecho</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {grammar.productions.map((prod, i) => (
                    <tr
                      key={prod.id}
                      className="border-b border-neutral-100 dark:border-neutral-800"
                    >
                      <td className="py-2 pr-4 text-neutral-500">{i + 1}</td>
                      <td className="py-2 pr-4">{prod.left.join('')}</td>
                      <td className="py-2">
                        {isEpsilonProd(prod)
                          ? EPSILON_SYMBOL
                          : prod.right
                              .map((s) => (s === null ? EPSILON_SYMBOL : s))
                              .join('')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="mt-4 space-y-1 font-mono text-sm">
              {productionLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold">Jerarquía de Chomsky</h3>
            <ChomskyHierarchyPanel classification={classification} />
          </section>

          <pre className="overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs font-mono dark:border-neutral-700 dark:bg-neutral-900/50">
            {textForm}
          </pre>
        </>
      )}
    </div>
  );
}
