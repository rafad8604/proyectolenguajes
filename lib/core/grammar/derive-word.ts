import type { ChomskyType, Grammar, Production } from 'types/grammar';
import { EPSILON_SYMBOL } from '../automata/constants';
import { formatProd } from './chomsky-validation';

export interface DerivationLimits {
  maxSteps: number;
  maxFormLength: number;
  maxNodesExplored: number;
}

export const DEFAULT_DERIVATION_LIMITS: DerivationLimits = {
  maxSteps: 40,
  maxFormLength: 64,
  maxNodesExplored: 8000,
};

export interface DerivationStepRecord {
  stepIndex: number;
  /** Símbolos de la forma sentencial intermedia. */
  form: string[];
  /** Cadena concatenada para mostrar. */
  display: string;
  production: Production | null;
  productionLabel: string;
  /** Índice donde se aplicó la producción. */
  replaceStart: number;
  replaceLength: number;
}

export interface DerivationTreeNode {
  id: string;
  label: string;
  isVariable: boolean;
  productionLabel?: string;
  children: DerivationTreeNode[];
}

export type DerivationStatus =
  | 'found'
  | 'not_found'
  | 'limit_exceeded'
  | 'invalid_target';

export interface DerivationResult {
  status: DerivationStatus;
  targetWord: string;
  steps: DerivationStepRecord[];
  tree: DerivationTreeNode | null;
  nodesExplored: number;
  message: string;
  /** Si el árbol no se construyó, explicación pedagógica. */
  treeNote?: string;
}

interface BfsNode {
  form: string[];
  steps: DerivationStepRecord[];
}

function isEpsilonProduction(prod: Production): boolean {
  return prod.right.length === 0 || (prod.right.length === 1 && prod.right[0] === null);
}

function expandRight(prod: Production): string[] {
  if (isEpsilonProduction(prod)) return [];
  return prod.right.filter((s): s is string => s !== null);
}

function formDisplay(form: string[]): string {
  if (form.length === 0) return EPSILON_SYMBOL;
  return form.join('');
}

function formKey(form: string[]): string {
  return form.join('\0');
}

function isTerminalOnly(form: string[], variables: Set<string>): boolean {
  return form.every((sym) => !variables.has(sym));
}

function terminalString(form: string[], variables: Set<string>): string {
  return form.filter((sym) => !variables.has(sym)).join('');
}

/** Comprueba compatibilidad parcial con la palabra objetivo (podado). */
export function matchesTerminalPrefix(
  form: string[],
  target: string,
  variables: Set<string>
): boolean {
  let pos = 0;
  for (const sym of form) {
    if (variables.has(sym)) continue;
    if (pos >= target.length || sym !== target[pos]) return false;
    pos += 1;
  }
  return true;
}

function countTerminals(form: string[], variables: Set<string>): number {
  return form.filter((sym) => !variables.has(sym)).length;
}

function findLeftmostApplications(
  form: string[],
  productions: Production[],
  variables: Set<string>,
  grammarType: ChomskyType
): Array<{ index: number; production: Production }> {
  const matches: Array<{ index: number; production: Production }> = [];

  for (let i = 0; i < form.length; i++) {
    for (const prod of productions) {
      if (i + prod.left.length > form.length) continue;
      let ok = true;
      for (let j = 0; j < prod.left.length; j++) {
        if (form[i + j] !== prod.left[j]) {
          ok = false;
          break;
        }
      }
      if (ok) matches.push({ index: i, production: prod });
    }
  }

  if (matches.length === 0) return matches;

  if (grammarType === 3 || grammarType === 2) {
    const leftmostVar = form.findIndex((sym) => variables.has(sym));
    if (leftmostVar === -1) return [];
    return matches.filter(
      (m) =>
        m.index === leftmostVar &&
        m.production.left.length === 1 &&
        variables.has(m.production.left[0]!)
    );
  }

  const minIndex = Math.min(...matches.map((m) => m.index));
  return matches.filter((m) => m.index === minIndex);
}

function applyAt(
  form: string[],
  index: number,
  production: Production
): string[] {
  const right = expandRight(production);
  return [
    ...form.slice(0, index),
    ...right,
    ...form.slice(index + production.left.length),
  ];
}

function buildTreeFromSteps(
  grammar: Grammar,
  steps: DerivationStepRecord[],
  variables: Set<string>
): DerivationTreeNode | null {
  if (steps.length === 0) return null;

  const onlySingleVariableLhs = steps
    .slice(1)
    .every(
      (s) =>
        s.production !== null &&
        s.production.left.length === 1 &&
        variables.has(s.production.left[0]!)
    );

  if (!onlySingleVariableLhs) return null;

  const startForm = steps[0]!.form;
  if (startForm.length !== 1) return null;

  const nodes: DerivationTreeNode[] = startForm.map((sym, i) => ({
    id: `n-0-${i}`,
    label: sym,
    isVariable: variables.has(sym),
    children: [],
  }));

  // Keep a stable reference to the original root node so that
  // subsequent splices do not change which object represents the root.
  const root = nodes[0] ?? null;

  for (let s = 1; s < steps.length; s++) {
    const step = steps[s]!;
    if (!step.production) continue;
    const parent = nodes[step.replaceStart];
    if (!parent) return null;
    const right = expandRight(step.production);
    parent.productionLabel = step.productionLabel;
    parent.children = right.map((sym, i) => ({
      id: `n-${s}-${i}`,
      label: sym,
      isVariable: variables.has(sym),
      children: [],
    }));
    nodes.splice(step.replaceStart, step.replaceLength, ...parent.children);
  }

  return root;
}

function successMessage(target: string, steps: number): string {
  if (target.length === 0) {
    return `Se encontró una derivación de ${steps - 1} paso(s) hasta la cadena vacía (ε).`;
  }
  return `Se encontró una derivación de ${steps - 1} paso(s) hasta «${target}».`;
}

/**
 * Busca una derivación (BFS acotada) desde S hasta la palabra objetivo.
 */
export function deriveWord(
  grammar: Grammar,
  targetWord: string,
  grammarType: ChomskyType,
  limits: DerivationLimits = DEFAULT_DERIVATION_LIMITS
): DerivationResult {
  const variables = new Set(grammar.variables);
  const terminals = new Set(grammar.terminals);
  const target = targetWord.trim();

  for (const char of target) {
    if (!terminals.has(char)) {
      return {
        status: 'invalid_target',
        targetWord: target,
        steps: [],
        tree: null,
        nodesExplored: 0,
        message: `El símbolo «${char}» no pertenece al alfabeto Σ = {${grammar.terminals.join(', ')}}.`,
      };
    }
  }

  if (!grammar.startSymbol) {
    return {
      status: 'invalid_target',
      targetWord: target,
      steps: [],
      tree: null,
      nodesExplored: 0,
      message: 'La gramática no tiene símbolo inicial.',
    };
  }

  const initialForm = [grammar.startSymbol];
  const initialStep: DerivationStepRecord = {
    stepIndex: 0,
    form: initialForm,
    display: formDisplay(initialForm),
    production: null,
    productionLabel: 'Símbolo inicial',
    replaceStart: 0,
    replaceLength: 0,
  };

  const queue: BfsNode[] = [{ form: initialForm, steps: [initialStep] }];
  const visited = new Set<string>([formKey(initialForm)]);
  let nodesExplored = 0;

  while (queue.length > 0) {
    const current = queue.shift()!;
    nodesExplored += 1;

    if (nodesExplored > limits.maxNodesExplored) {
      return {
        status: 'limit_exceeded',
        targetWord: target,
        steps: current.steps,
        tree: null,
        nodesExplored,
        message: `Se exploraron ${limits.maxNodesExplored} configuraciones sin encontrar derivación. Aumenta el límite o acota la gramática.`,
        treeNote: treeNoteForType(grammarType),
      };
    }

    const { form, steps } = current;

    if (steps.length - 1 > limits.maxSteps) {
      continue;
    }

    if (isTerminalOnly(form, variables)) {
      const produced = terminalString(form, variables);
      if (produced === target) {
        const tree = buildTreeFromSteps(grammar, steps, variables);
        return {
          status: 'found',
          targetWord: target,
          steps,
          tree,
          nodesExplored,
          message: successMessage(target, steps.length),
          treeNote: tree
            ? undefined
            : treeNoteForType(grammarType, true),
        };
      }
      continue;
    }

    if (form.length > limits.maxFormLength) continue;
    if (countTerminals(form, variables) > target.length) continue;
    if (!matchesTerminalPrefix(form, target, variables)) continue;

    const applications = findLeftmostApplications(
      form,
      grammar.productions,
      variables,
      grammarType
    );

    for (const { index, production } of applications) {
      const nextForm = applyAt(form, index, production);
      const key = formKey(nextForm);
      if (visited.has(key)) continue;
      visited.add(key);

      const step: DerivationStepRecord = {
        stepIndex: steps.length,
        form: nextForm,
        display: formDisplay(nextForm),
        production,
        productionLabel: formatProd(production),
        replaceStart: index,
        replaceLength: production.left.length,
      };

      queue.push({ form: nextForm, steps: [...steps, step] });
    }
  }

  const typeHint =
    grammarType <= 1
      ? ' Para gramáticas sensibles al contexto o irrestrictas no se garantiza decidibilidad; solo se busca dentro del límite.'
      : '';

  return {
    status: 'not_found',
    targetWord: target,
    steps: [],
    tree: null,
    nodesExplored,
    message: `No se encontró derivación para «${target}» dentro de los límites (pasos ≤ ${limits.maxSteps}, nodos ≤ ${limits.maxNodesExplored}).${typeHint}`,
    treeNote: treeNoteForType(grammarType),
  };
}

function treeNoteForType(
  grammarType: ChomskyType,
  partialOnly = false
): string | undefined {
  if (grammarType === 3 || grammarType === 2) {
    return partialOnly
      ? 'La derivación usa producciones con contexto en el lado izquierdo; el árbol no se muestra en ese caso.'
      : undefined;
  }
  return 'Para gramáticas Tipo 1 o Tipo 0 el árbol de derivación no se garantiza: la búsqueda es acotada y el problema puede ser indedecidable en general.';
}

export function formatSententialWithHighlight(step: DerivationStepRecord): {
  prefix: string;
  highlight: string;
  suffix: string;
} {
  if (step.stepIndex === 0 || !step.production) {
    return { prefix: '', highlight: step.display, suffix: '' };
  }
  const before = step.form.slice(0, step.replaceStart).join('');
  const mid = step.form
    .slice(step.replaceStart, step.replaceStart + step.replaceLength)
    .join('');
  const after = step.form.slice(step.replaceStart + step.replaceLength).join('');
  return {
    prefix: before,
    highlight: mid,
    suffix: after,
  };
}
