'use client';

import { useMemo, useState } from 'react';
import type { ChomskyType, Grammar, Production } from 'types/grammar';
import {
  formatGrammarAsText,
  validateAndClassify,
  type GrammarInput,
} from 'lib/core/grammar/classifyGrammar';
import {
  CHOMSKY_EXAMPLES,
  TYPE_HELP,
  TYPE_SHORT_LABELS,
  getExampleForType,
} from 'lib/core/grammar/chomsky-presets';
import { EPSILON_SYMBOL } from 'lib/core/automata';
import { downloadTextFile } from 'lib/utils/download';
import { cn } from 'lib/utils/cn';
import { ChomskyHierarchyPanel } from './ChomskyHierarchyPanel';
import { GrammarDerivationPanel } from './GrammarDerivationPanel';

const CHOMSKY_TYPES: ChomskyType[] = [3, 2, 1, 0];

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
  const initialExample = getExampleForType(3);
  const [selectedType, setSelectedType] = useState<ChomskyType>(3);
  const [variablesText, setVariablesText] = useState(initialExample.variablesText);
  const [terminalsText, setTerminalsText] = useState(initialExample.terminalsText);
  const [startSymbol, setStartSymbol] = useState(initialExample.startSymbol);
  const [productionsText, setProductionsText] = useState(
    initialExample.productionsText
  );
  const [name, setName] = useState(initialExample.name ?? 'Gramática de ejemplo');
  const [copied, setCopied] = useState(false);

  const input: GrammarInput = useMemo(
    () => ({
      name,
      selectedType,
      variablesText,
      terminalsText,
      startSymbol,
      productionsText,
    }),
    [name, selectedType, variablesText, terminalsText, startSymbol, productionsText]
  );

  const { validation, classification } = useMemo(
    () => validateAndClassify(input),
    [input]
  );

  const grammar = validation.grammar;
  const productionLines = grammar ? groupProductions(grammar) : [];
  const textForm = grammar ? formatGrammarAsText(grammar) : '';
  const typeHelp = TYPE_HELP[selectedType];

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
    if (example.selectedType !== undefined) {
      setSelectedType(example.selectedType);
    }
    setVariablesText(example.variablesText);
    setTerminalsText(example.terminalsText);
    setStartSymbol(example.startSymbol);
    setProductionsText(example.productionsText);
  };

  const handleTypeChange = (type: ChomskyType) => {
    setSelectedType(type);
    loadExample(getExampleForType(type));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border p-4 dark:border-neutral-700">
        <h3 className="text-sm font-semibold">Tipo de gramática (jerarquía de Chomsky)</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {CHOMSKY_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              className={cn(
                'rounded-md border px-3 py-2 text-xs font-medium transition-colors',
                selectedType === type
                  ? 'border-blue-600 bg-blue-50 text-blue-800 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-200'
                  : 'dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
              )}
            >
              {TYPE_SHORT_LABELS[type]}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm dark:border-neutral-700 dark:bg-neutral-900/40">
          <p className="font-medium">{typeHelp.title}</p>
          <ul className="mt-2 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
            {typeHelp.rules.map((rule) => (
              <li key={rule}>• {rule}</li>
            ))}
          </ul>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <span className="self-center text-xs text-neutral-500">Más ejemplos:</span>
        {CHOMSKY_EXAMPLES.filter((ex) => ex.type === selectedType).map((ex) => (
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
          placeholder={typeHelp.placeholder}
        />
        <span className="mt-1 block text-xs text-neutral-500">
          Una regla por línea. Usa <code className="font-mono">-&gt;</code>,{' '}
          <code className="font-mono">→</code> o <code className="font-mono">=&gt;</code>.
          Alternativas con <code className="font-mono">|</code>. Épsilon: ε.
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
            <ChomskyHierarchyPanel
              classification={classification}
              selectedType={selectedType}
            />
          </section>

          <GrammarDerivationPanel grammar={grammar} grammarType={selectedType} />

          <pre className="overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs font-mono dark:border-neutral-700 dark:bg-neutral-900/50">
            {textForm}
          </pre>
        </>
      )}
    </div>
  );
}
