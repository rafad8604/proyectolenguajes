import type { ChomskyType, Grammar, Production } from 'types/grammar';
import { generateId } from '../automata/factory';
import { formatGrammarAsText } from './fromFiniteAutomaton';
import {
  TYPE_LABELS,
  getExampleForType,
} from './chomsky-presets';
import {
  checkType0,
  checkType1,
  checkType2,
  checkType3,
  getTypeCheck,
  validateLeftSideForType,
  type ProductionValidationIssue,
  type TypeCheckResult,
} from './chomsky-validation';
import { epsilonAliasLengthAt, isEpsilonAlias } from './epsilon';

export type { ProductionValidationIssue, TypeCheckResult };
export { TYPE_LABELS, getExampleForType };

export interface GrammarInput {
  name?: string;
  /** Variables separadas por coma o espacio. */
  variablesText: string;
  /** Terminales separados por coma o espacio. */
  terminalsText: string;
  startSymbol: string;
  /** Una producción por línea: A -> α | β */
  productionsText: string;
  /** Tipo de gramática que el usuario está construyendo. */
  selectedType?: ChomskyType;
}

export interface GrammarValidationResult {
  valid: boolean;
  issues: ProductionValidationIssue[];
  grammar: Grammar | null;
}

export interface ClassificationResult {
  /** Tipo más restrictivo que cumple la forma de todas las producciones. */
  inferredType: ChomskyType;
  inferredLabel: string;
  /** Clasificación por nivel (3 → 0). */
  hierarchy: TypeCheckResult[];
  /** Comprobación contra el tipo elegido por el usuario. */
  selectedTypeCheck: TypeCheckResult | null;
  /** Resumen pedagógico en español. */
  summary: string[];
  warnings: string[];
}

const ARROW_PATTERN = /\s*(?:->|→|=>)\s*/;

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
): { tokens: (string | null)[] } | { error: string } {
  const symbols = [...variables, ...terminals].sort((a, b) => b.length - a.length);
  const tokens: (string | null)[] = [];
  let i = 0;

  while (i < raw.length) {
    if (/\s/.test(raw[i]!)) {
      i += 1;
      continue;
    }
    const epsLen = epsilonAliasLengthAt(raw, i);
    if (epsLen !== null) {
      tokens.push(null);
      i += epsLen;
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
  if (isEpsilonAlias(trimmed)) {
    return { right: [null] };
  }

  const parsed = tokenizeString(trimmed, variables, terminals);
  if ('error' in parsed) {
    return parsed;
  }
  return { right: parsed.tokens };
}

/** Parsea el texto del editor y construye una gramática según el tipo seleccionado. */
export function parseGrammarInput(input: GrammarInput): GrammarValidationResult {
  const issues: ProductionValidationIssue[] = [];
  const selectedType: ChomskyType = input.selectedType ?? 0;
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
        message: `Formato inválido. Usa A -> α | β (flecha ->, → o =>).`,
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

    if (leftParsed.tokens.some((sym) => sym === null)) {
      issues.push({
        line: lineNum,
        message: 'El lado izquierdo no puede contener ε (cadena vacía).',
      });
      continue;
    }

    const leftSymbols = leftParsed.tokens.filter((sym): sym is string => sym !== null);

    issues.push(
      ...validateLeftSideForType(
        leftSymbols,
        variableSet,
        terminalSet,
        selectedType,
        lineNum
      )
    );

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
        left: leftSymbols,
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
    chomskyType: selectedType,
  };

  return { valid: true, issues: [], grammar };
}

/** Clasifica una gramática según la jerarquía de Chomsky (análisis sintáctico). */
export function classifyGrammar(
  grammar: Grammar,
  selectedType?: ChomskyType
): ClassificationResult {
  const variables = new Set(grammar.variables);
  const terminals = new Set(grammar.terminals);
  const warnings: string[] = [];

  if (grammar.productions.length === 0) {
    return {
      inferredType: 0,
      inferredLabel: TYPE_LABELS[0],
      hierarchy: [],
      selectedTypeCheck: null,
      summary: ['La gramática no tiene producciones.'],
      warnings: ['Agrega producciones para clasificar.'],
    };
  }

  const t3 = checkType3(grammar, variables, terminals);
  const t2 = checkType2(grammar, variables);
  const t1 = checkType1(grammar, variables);
  const t0 = checkType0(grammar, variables);

  const hierarchy = [t3, t2, t1, t0];

  let inferredType: ChomskyType = 0;
  if (t3.belongs) inferredType = 3;
  else if (t2.belongs) inferredType = 2;
  else if (t1.belongs) inferredType = 1;
  else inferredType = 0;

  const targetType = selectedType ?? grammar.chomskyType;
  const selectedTypeCheck =
    targetType !== undefined ? getTypeCheck(grammar, targetType) : null;

  if (!t0.belongs) {
    warnings.push('La gramática tiene errores de forma que impiden clasificarla correctamente.');
  }

  if (selectedTypeCheck && !selectedTypeCheck.belongs) {
    warnings.push(
      `La gramática no cumple la forma del ${selectedTypeCheck.label} seleccionado.`
    );
  } else if (
    selectedTypeCheck &&
    selectedTypeCheck.belongs &&
    inferredType < selectedTypeCheck.type
  ) {
    warnings.push(
      `La gramática cumple el tipo seleccionado, pero también pertenece a una clase más restrictiva (${TYPE_LABELS[inferredType]}).`
    );
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

  if (selectedTypeCheck) {
    summary.push(
      selectedTypeCheck.belongs
        ? `Cumple el tipo seleccionado (${selectedTypeCheck.label}).`
        : `No cumple el tipo seleccionado (${selectedTypeCheck.label}).`
    );
  }

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
      'Las producciones no acortan cadenas; el contexto (terminales y variables en α) influye en las reglas.'
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
    selectedTypeCheck,
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
  const classification = classifyGrammar(
    validation.grammar,
    input.selectedType
  );
  return { validation, classification };
}

export { formatGrammarAsText };
