import type { ChomskyType, Grammar, Production } from 'types/grammar';
import { EPSILON_SYMBOL } from '../automata/constants';
import { TYPE_LABELS } from './chomsky-presets';

export interface ProductionValidationIssue {
  line: number;
  message: string;
}

export interface TypeCheckResult {
  type: ChomskyType;
  label: string;
  belongs: boolean;
  reasons: string[];
  caveats: string[];
}

function productionLength(symbols: (string | null)[]): number {
  return symbols.filter((s) => s !== null).length;
}

function isEpsilonProduction(prod: Production): boolean {
  return prod.right.length === 0 || (prod.right.length === 1 && prod.right[0] === null);
}

export function formatProd(prod: Production): string {
  const left = prod.left.join('');
  const right = isEpsilonProduction(prod)
    ? EPSILON_SYMBOL
    : prod.right.map((s) => (s === null ? EPSILON_SYMBOL : s)).join('');
  return `${left} → ${right}`;
}

/** Valida el lado izquierdo según el tipo de gramática seleccionado. */
export function validateLeftSideForType(
  tokens: string[],
  variableSet: Set<string>,
  terminalSet: Set<string>,
  selectedType: ChomskyType,
  lineNum: number
): ProductionValidationIssue[] {
  const issues: ProductionValidationIssue[] = [];

  if (tokens.length === 0) {
    issues.push({ line: lineNum, message: 'Lado izquierdo vacío (α no puede ser ε).' });
    return issues;
  }

  const hasVariable = tokens.some((sym) => variableSet.has(sym));

  for (const sym of tokens) {
    if (!variableSet.has(sym) && !terminalSet.has(sym)) {
      issues.push({
        line: lineNum,
        message: `«${sym}» no está declarado en V ni en Σ.`,
      });
    }
  }

  if (selectedType === 3 || selectedType === 2) {
    if (tokens.length !== 1 || !variableSet.has(tokens[0]!)) {
      issues.push({
        line: lineNum,
        message:
          selectedType === 3
            ? 'Tipo 3: el lado izquierdo debe ser exactamente una variable (ej. S -> aA | b).'
            : 'Tipo 2: el lado izquierdo debe ser exactamente una variable/no terminal (ej. S -> aSb | ε).',
      });
    }
    for (const sym of tokens) {
      if (terminalSet.has(sym)) {
        issues.push({
          line: lineNum,
          message: `Tipo ${selectedType}: «${sym}» es terminal; en el lado izquierdo solo se permiten variables.`,
        });
      }
    }
    return issues;
  }

  if (!hasVariable) {
    issues.push({
      line: lineNum,
      message:
        selectedType === 1
          ? 'Tipo 1: el lado izquierdo debe contener al menos una variable (ej. aA -> aa).'
          : 'Tipo 0: el lado izquierdo debe contener al menos una variable (ej. AB -> a).',
    });
  }

  return issues;
}

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

export function checkType3(
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
    return { type: 3, label: TYPE_LABELS[3], belongs: true, reasons, caveats };
  }

  if (allLeft) {
    reasons.push(
      'Todas las producciones tienen forma regular izquierda: A → Bw, A → w o A → ε.'
    );
    return { type: 3, label: TYPE_LABELS[3], belongs: true, reasons, caveats };
  }

  reasons.push('No todas las producciones son lineales derechas ni lineales izquierdas.');
  if (rightFails.length > 0 && leftFails.length > 0) {
    reasons.push(
      'Advertencia: mezclaste producciones lineales por la derecha y por la izquierda; una gramática regular debe ser homogénea en un solo sentido.'
    );
  }
  if (rightFails.length > 0) {
    reasons.push(`Ejemplo (derecha): ${rightFails[0]}`);
  }
  if (leftFails.length > 0) {
    reasons.push(`Ejemplo (izquierda): ${leftFails[0]}`);
  }

  return { type: 3, label: TYPE_LABELS[3], belongs: false, reasons, caveats };
}

export function checkType2(
  grammar: Grammar,
  variables: Set<string>
): TypeCheckResult {
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

export function checkType1(
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
        `${formatProd(prod)}: |α| > |β| (${leftLen} > ${rightLen}); viola tipo 1 (no puede acortar).`
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

export function checkType0(
  grammar: Grammar,
  variables: Set<string>
): TypeCheckResult {
  const reasons: string[] = [];
  const caveats: string[] = [
    'Tipo 0 es la clase más general: α → β con α ≠ ε y al menos una variable en α.',
    'No se impone |α| ≤ |β|; las producciones pueden acortar cadenas.',
  ];
  const fails: string[] = [];

  for (const prod of grammar.productions) {
    if (prod.left.length === 0) {
      fails.push(`${formatProd(prod)}: el lado izquierdo no puede estar vacío.`);
      continue;
    }
    const leftHasVar = prod.left.some((s) => variables.has(s));
    if (!leftHasVar) {
      fails.push(
        `${formatProd(prod)}: el lado izquierdo debe contener al menos una variable/no terminal.`
      );
    }
  }

  if (fails.length === 0) {
    reasons.push(
      'Todas las producciones tienen α ≠ ε y α contiene al menos una variable.'
    );
    return { type: 0, label: TYPE_LABELS[0], belongs: true, reasons, caveats };
  }

  reasons.push('Hay producciones que violan la forma irrestricta mínima.');
  reasons.push(fails[0]!);
  return { type: 0, label: TYPE_LABELS[0], belongs: false, reasons, caveats };
}

export function getTypeCheck(
  grammar: Grammar,
  type: ChomskyType
): TypeCheckResult {
  const variables = new Set(grammar.variables);
  const terminals = new Set(grammar.terminals);
  switch (type) {
    case 3:
      return checkType3(grammar, variables, terminals);
    case 2:
      return checkType2(grammar, variables);
    case 1:
      return checkType1(grammar, variables);
    default:
      return checkType0(grammar, variables);
  }
}
