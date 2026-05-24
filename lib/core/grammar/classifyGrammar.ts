import type { ChomskyType, Grammar, Production } from 'types/grammar';
import { EPSILON_SYMBOL } from '../automata/constants';
import { generateId } from '../automata/factory';
import { formatGrammarAsText } from './fromFiniteAutomaton';

export interface GrammarInput {
  name?: string;
  /** Variables separadas por coma o espacio. */
  variablesText: string;
  /** Terminales separados por coma o espacio. */
  terminalsText: string;
  startSymbol: string;
  /** Una producción por línea: A -> α | β */
  productionsText: string;
}

export interface ProductionValidationIssue {
  line: number;
  message: string;
}

export interface GrammarValidationResult {
  valid: boolean;
  issues: ProductionValidationIssue[];
  grammar: Grammar | null;
}

export interface TypeCheckResult {
  type: ChomskyType;
  label: string;
  /** Cumple la forma sintáctica de este tipo. */
  belongs: boolean;
  reasons: string[];
  /** Avisos sobre límites del análisis (p. ej. lenguaje vs forma). */
  caveats: string[];
}

export interface ClassificationResult {
  /** Tipo más restrictivo que cumple la forma de todas las producciones. */
  inferredType: ChomskyType;
  inferredLabel: string;
  /** Clasificación por nivel (3 → 0). */
  hierarchy: TypeCheckResult[];
  /** Resumen pedagógico en español. */
  summary: string[];
  warnings: string[];
}

const ARROW_PATTERN = /\s*(?:->|→|=>)\s*/;
const EPSILON_ALIASES = new Set(['ε', 'ϵ', 'epsilon', 'EPSILON', 'λ']);

const TYPE_LABELS: Record<ChomskyType, string> = {
  3: 'Tipo 3 — Regular',
  2: 'Tipo 2 — Libre de contexto',
  1: 'Tipo 1 — Sensible al contexto',
  0: 'Tipo 0 — Irrestricta',
};

function parseSymbolList(text: string): string[] {
  return text
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function tokenizeString(
  raw: string,
  variables: Set<string>,
  terminals: Set<string>
): { tokens: string[] } | { error: string } {
  const symbols = [...variables, ...terminals].sort((a, b) => b.length - a.length);
  const tokens: string[] = [];
  let i = 0;

  while (i < raw.length) {
    if (/\s/.test(raw[i]!)) {
      i += 1;
      continue;
    }
    let matched = false;
    for (const sym of symbols) {
      if (raw.startsWith(sym, i)) {
        tokens.push(sym);
        i += sym.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      return { error: `Símbolo no reconocido cerca de «${raw.slice(i, i + 8)}…»` };
    }
  }

  return { tokens };
}

function parseAlternative(
  alt: string,
  variables: Set<string>,
  terminals: Set<string>
): { right: (string | null)[] } | { error: string } {
  const trimmed = alt.trim();
  if (!trimmed || EPSILON_ALIASES.has(trimmed)) {
    return { right: [null] };
  }

  const parsed = tokenizeString(trimmed, variables, terminals);
  if ('error' in parsed) {
    return parsed;
  }
  return { right: parsed.tokens };
}

/** Parsea el texto del editor y construye una gramática. */
export function parseGrammarInput(input: GrammarInput): GrammarValidationResult {
  const issues: ProductionValidationIssue[] = [];
  const variables = parseSymbolList(input.variablesText);
  const terminals = parseSymbolList(input.terminalsText);
  const variableSet = new Set(variables);
  const terminalSet = new Set(terminals);

  for (const v of variables) {
    if (terminalSet.has(v)) {
      issues.push({
        line: 0,
        message: `«${v}» aparece en V y en Σ; deben ser disjuntos.`,
      });
    }
  }

  const startSymbol = input.startSymbol.trim();
  if (!startSymbol) {
    issues.push({ line: 0, message: 'Falta el símbolo inicial.' });
  } else if (!variableSet.has(startSymbol)) {
    issues.push({
      line: 0,
      message: `El símbolo inicial «${startSymbol}» no está en V.`,
    });
  }

  const lines = input.productionsText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  if (lines.length === 0) {
    issues.push({ line: 0, message: 'Agrega al menos una producción.' });
  }

  const productions: Production[] = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i]!;

    if (!ARROW_PATTERN.test(line)) {
      issues.push({
        line: lineNum,
        message: `Formato inválido. Usa A -> α | β (flecha -> o →).`,
      });
      continue;
    }

    const [leftRaw, rightRaw] = line.split(ARROW_PATTERN);
    const leftTrim = leftRaw!.trim();
    if (!leftTrim) {
      issues.push({ line: lineNum, message: 'Lado izquierdo vacío.' });
      continue;
    }

    const leftParsed = tokenizeString(leftTrim, variableSet, terminalSet);
    if ('error' in leftParsed) {
      issues.push({ line: lineNum, message: leftParsed.error });
      continue;
    }

    for (const sym of leftParsed.tokens) {
      if (!variableSet.has(sym)) {
        issues.push({
          line: lineNum,
          message: `En el lado izquierdo, «${sym}» debe ser una variable (V).`,
        });
      }
    }

    const alternatives = rightRaw!.split('|').map((a) => a.trim());
    for (const alt of alternatives) {
      const parsed = parseAlternative(alt, variableSet, terminalSet);
      if ('error' in parsed) {
        issues.push({ line: lineNum, message: parsed.error });
        continue;
      }

      for (const sym of parsed.right) {
        if (sym !== null && !variableSet.has(sym) && !terminalSet.has(sym)) {
          issues.push({
            line: lineNum,
            message: `«${sym}» no está declarado en V ni en Σ.`,
          });
        }
      }

      productions.push({
        id: generateId('prod'),
        left: leftParsed.tokens,
        right: parsed.right,
      });
    }
  }

  if (issues.length > 0) {
    return { valid: false, issues, grammar: null };
  }

  const grammar: Grammar = {
    id: generateId('grammar'),
    name: input.name?.trim() || 'Gramática ingresada',
    variables,
    terminals,
    startSymbol,
    productions,
  };

  return { valid: true, issues: [], grammar };
}

function productionLength(symbols: (string | null)[]): number {
  return symbols.filter((s) => s !== null).length;
}

function isEpsilonProduction(prod: Production): boolean {
  return prod.right.length === 0 || (prod.right.length === 1 && prod.right[0] === null);
}

/** Producción en forma regular derecha: A → wB, A → w o A → ε. */
function isRightLinearProduction(
  prod: Production,
  variables: Set<string>,
  terminals: Set<string>
): { ok: boolean; reason?: string } {
  if (prod.left.length !== 1 || !variables.has(prod.left[0]!)) {
    return {
      ok: false,
      reason: `${formatProd(prod)}: el lado izquierdo debe ser una sola variable.`,
    };
  }

  if (isEpsilonProduction(prod)) {
    return { ok: true };
  }

  const right = prod.right.filter((s) => s !== null) as string[];
  if (right.length === 0) {
    return { ok: true };
  }

  const last = right[right.length - 1]!;
  const hasVariable = right.some((s) => variables.has(s));
  const hasTerminal = right.some((s) => terminals.has(s));

  if (hasVariable && !variables.has(last)) {
    return {
      ok: false,
      reason: `${formatProd(prod)}: en forma derecha la variable solo puede estar al final.`,
    };
  }

  if (right.filter((s) => variables.has(s)).length > 1) {
    return {
      ok: false,
      reason: `${formatProd(prod)}: hay más de una variable en el lado derecho.`,
    };
  }

  for (const sym of right.slice(0, -1)) {
    if (variables.has(sym)) {
      return {
        ok: false,
        reason: `${formatProd(prod)}: la variable no está al final (no es lineal derecha).`,
      };
    }
    if (!terminals.has(sym)) {
      return { ok: false, reason: `${formatProd(prod)}: símbolo «${sym}» inválido.` };
    }
  }

  if (hasVariable && variables.has(last) && hasTerminal) {
    for (const sym of right.slice(0, -1)) {
      if (!terminals.has(sym)) {
        return { ok: false, reason: `${formatProd(prod)}: prefijo debe ser terminales.` };
      }
    }
  }

  if (!hasVariable && !right.every((s) => terminals.has(s))) {
    return {
      ok: false,
      reason: `${formatProd(prod)}: sin variable, el lado derecho debe ser solo terminales.`,
    };
  }

  return { ok: true };
}

/** Producción en forma regular izquierda: A → Bw, A → w o A → ε. */
function isLeftLinearProduction(
  prod: Production,
  variables: Set<string>,
  terminals: Set<string>
): { ok: boolean; reason?: string } {
  if (prod.left.length !== 1 || !variables.has(prod.left[0]!)) {
    return {
      ok: false,
      reason: `${formatProd(prod)}: el lado izquierdo debe ser una sola variable.`,
    };
  }

  if (isEpsilonProduction(prod)) {
    return { ok: true };
  }

  const right = prod.right.filter((s) => s !== null) as string[];
  if (right.length === 0) {
    return { ok: true };
  }

  const first = right[0]!;
  if (right.filter((s) => variables.has(s)).length > 1) {
    return {
      ok: false,
      reason: `${formatProd(prod)}: hay más de una variable en el lado derecho.`,
    };
  }

  if (variables.has(first)) {
    for (const sym of right.slice(1)) {
      if (variables.has(sym)) {
        return {
          ok: false,
          reason: `${formatProd(prod)}: la variable no está al inicio (no es lineal izquierda).`,
        };
      }
    }
  } else if (right.some((s) => variables.has(s))) {
    return {
      ok: false,
      reason: `${formatProd(prod)}: en forma izquierda la variable debe estar al inicio.`,
    };
  }

  for (const sym of right) {
    if (!variables.has(sym) && !terminals.has(sym)) {
      return { ok: false, reason: `${formatProd(prod)}: símbolo «${sym}» inválido.` };
    }
  }

  return { ok: true };
}

function formatProd(prod: Production): string {
  const left = prod.left.join('');
  const right =
    isEpsilonProduction(prod)
      ? EPSILON_SYMBOL
      : prod.right.map((s) => (s === null ? EPSILON_SYMBOL : s)).join('');
  return `${left} → ${right}`;
}

function checkType3(
  grammar: Grammar,
  variables: Set<string>,
  terminals: Set<string>
): TypeCheckResult {
  const reasons: string[] = [];
  const caveats: string[] = [
    'Esta comprobación es sintáctica: verifica la forma de las producciones, no si el lenguaje generado es regular en sentido estricto.',
    'Una gramática equivalente más restrictiva podría existir aunque esta no sea lineal.',
  ];
  const rightFails: string[] = [];
  const leftFails: string[] = [];

  for (const prod of grammar.productions) {
    const r = isRightLinearProduction(prod, variables, terminals);
    const l = isLeftLinearProduction(prod, variables, terminals);
    if (!r.ok && r.reason) rightFails.push(r.reason);
    if (!l.ok && l.reason) leftFails.push(l.reason);
  }

  const allRight = rightFails.length === 0;
  const allLeft = leftFails.length === 0;

  if (allRight) {
    reasons.push(
      'Todas las producciones tienen forma regular derecha: A → wB, A → w o A → ε (w ∈ Σ*).'
    );
    return {
      type: 3,
      label: TYPE_LABELS[3],
      belongs: true,
      reasons,
      caveats,
    };
  }

  if (allLeft) {
    reasons.push(
      'Todas las producciones tienen forma regular izquierda: A → Bw, A → w o A → ε.'
    );
    return {
      type: 3,
      label: TYPE_LABELS[3],
      belongs: true,
      reasons,
      caveats,
    };
  }

  reasons.push('No todas las producciones son lineales derechas ni lineales izquierdas.');
  if (rightFails.length > 0) {
    reasons.push(`Ejemplo (derecha): ${rightFails[0]}`);
  }
  if (leftFails.length > 0) {
    reasons.push(`Ejemplo (izquierda): ${leftFails[0]}`);
  }

  return {
    type: 3,
    label: TYPE_LABELS[3],
    belongs: false,
    reasons,
    caveats,
  };
}

function checkType2(grammar: Grammar, variables: Set<string>): TypeCheckResult {
  const reasons: string[] = [];
  const caveats: string[] = [
    'Ser libre de contexto en forma no implica que el lenguaje no sea regular; solo indica que la gramática no está en forma lineal.',
  ];
  const fails: string[] = [];

  for (const prod of grammar.productions) {
    if (prod.left.length !== 1 || !variables.has(prod.left[0]!)) {
      fails.push(
        `${formatProd(prod)}: en tipo 2 el lado izquierdo debe ser exactamente una variable.`
      );
    }
  }

  if (fails.length === 0) {
    reasons.push(
      'Cada producción tiene una sola variable en el lado izquierdo: α → β con |α| = 1 y α ∈ V.'
    );
    return { type: 2, label: TYPE_LABELS[2], belongs: true, reasons, caveats };
  }

  reasons.push('Al menos una producción viola la forma libre de contexto.');
  reasons.push(fails[0]!);
  return { type: 2, label: TYPE_LABELS[2], belongs: false, reasons, caveats };
}

function checkType1(
  grammar: Grammar,
  variables: Set<string>
): TypeCheckResult {
  const reasons: string[] = [];
  const caveats: string[] = [
    'La sensibilidad al contexto también depende de restricciones globales (p. ej. S → ε). Aquí se aplica la regla estándar |α| ≤ |β| con la excepción documentada para S → ε.',
    'Determinar si una gramática genera un lenguaje sensible al contexto en sentido estricto puede requerir análisis más profundo.',
  ];
  const fails: string[] = [];
  const start = grammar.startSymbol;

  for (const prod of grammar.productions) {
    if (prod.left.length === 0) {
      fails.push(`${formatProd(prod)}: el lado izquierdo no puede estar vacío.`);
      continue;
    }

    const leftHasVar = prod.left.some((s) => variables.has(s));
    if (!leftHasVar) {
      fails.push(`${formatProd(prod)}: el lado izquierdo debe contener al menos una variable.`);
    }

    const leftLen = prod.left.length;
    const rightLen = productionLength(prod.right);

    if (isEpsilonProduction(prod)) {
      const lhs = prod.left.join('');
      if (lhs !== start) {
        fails.push(
          `${formatProd(prod)}: solo se permite ε cuando S → ε y S es el símbolo inicial.`
        );
      }
      continue;
    }

    if (leftLen > rightLen) {
      fails.push(
        `${formatProd(prod)}: |α| > |β| (${leftLen} > ${rightLen}); viola tipo 1.`
      );
    }
  }

  if (fails.length === 0) {
    reasons.push(
      'Todas las producciones cumplen |α| ≤ |β| (salvo S → ε permitido) y α contiene al menos una variable.'
    );
    return { type: 1, label: TYPE_LABELS[1], belongs: true, reasons, caveats };
  }

  reasons.push('Al menos una producción no cumple la forma sensible al contexto.');
  reasons.push(fails[0]!);
  return { type: 1, label: TYPE_LABELS[1], belongs: false, reasons, caveats };
}

function checkType0(grammar: Grammar): TypeCheckResult {
  const reasons: string[] = [];
  const caveats: string[] = [
    'Tipo 0 es la clase más general: cualquier gramática con lado izquierdo no vacío pertenece aquí en forma.',
  ];
  const fails: string[] = [];

  for (const prod of grammar.productions) {
    if (prod.left.length === 0) {
      fails.push(`${formatProd(prod)}: el lado izquierdo no puede estar vacío.`);
    }
  }

  if (fails.length === 0) {
    reasons.push('Todas las producciones tienen un lado izquierdo no vacío α → β.');
    return { type: 0, label: TYPE_LABELS[0], belongs: true, reasons, caveats };
  }

  reasons.push('Hay producciones con lado izquierdo vacío, inválidas incluso para tipo 0.');
  reasons.push(fails[0]!);
  return { type: 0, label: TYPE_LABELS[0], belongs: false, reasons, caveats };
}

/** Clasifica una gramática según la jerarquía de Chomsky (análisis sintáctico aproximado). */
export function classifyGrammar(grammar: Grammar): ClassificationResult {
  const variables = new Set(grammar.variables);
  const terminals = new Set(grammar.terminals);
  const warnings: string[] = [];

  if (grammar.productions.length === 0) {
    return {
      inferredType: 0,
      inferredLabel: TYPE_LABELS[0],
      hierarchy: [],
      summary: ['La gramática no tiene producciones.'],
      warnings: ['Agrega producciones para clasificar.'],
    };
  }

  const t3 = checkType3(grammar, variables, terminals);
  const t2 = checkType2(grammar, variables);
  const t1 = checkType1(grammar, variables);
  const t0 = checkType0(grammar);

  const hierarchy = [t3, t2, t1, t0];

  let inferredType: ChomskyType = 0;
  if (t3.belongs) inferredType = 3;
  else if (t2.belongs) inferredType = 2;
  else if (t1.belongs) inferredType = 1;
  else inferredType = 0;

  if (!t0.belongs) {
    warnings.push('La gramática tiene errores de forma que impiden clasificarla correctamente.');
  }

  if (t2.belongs && !t3.belongs) {
    warnings.push(
      'La gramática es libre de contexto en forma, pero el lenguaje podría ser regular; no afirmamos equivalencia con un autómata sin análisis adicional.'
    );
  }

  const summary = [
    `Clasificación por forma: ${TYPE_LABELS[inferredType]}.`,
    `Producciones analizadas: ${grammar.productions.length}.`,
  ];

  if (inferredType === 3) {
    summary.push(
      'Las producciones son lineales (derechas o izquierdas), típico de gramáticas regulares y autómatas finitos.'
    );
  } else if (inferredType === 2) {
    summary.push(
      'Un solo no terminal a la izquierda permite derivaciones con estructura anidada (árboles de derivación).'
    );
  } else if (inferredType === 1) {
    summary.push(
      'Las producciones no acortan cadenas; el contexto influye en las reglas de reescritura.'
    );
  } else {
    summary.push(
      'Reglas generales de reescritura; corresponde a la clase más expresiva de la jerarquía.'
    );
  }

  return {
    inferredType,
    inferredLabel: TYPE_LABELS[inferredType],
    hierarchy,
    summary,
    warnings,
  };
}

/** Valida y clasifica en un solo paso. */
export function validateAndClassify(input: GrammarInput): {
  validation: GrammarValidationResult;
  classification: ClassificationResult | null;
} {
  const validation = parseGrammarInput(input);
  if (!validation.valid || !validation.grammar) {
    return { validation, classification: null };
  }
  const classification = classifyGrammar(validation.grammar);
  return { validation, classification };
}

export { formatGrammarAsText, TYPE_LABELS };
