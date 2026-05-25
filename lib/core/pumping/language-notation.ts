export interface LanguageNotationValidation {
  valid: boolean;
  error?: string;
  normalized: string;
}

/** Caracteres permitidos en descripciones de lenguaje (notación matemática). */
const ALLOWED_CHAR =
  /^[\w\s|*^+_.,:;'"\\\-<>=!≠≤≥∈εϵ{}()[\]/àáéíóúüñÀÁÉÍÓÚÜÑ]*$/u;

const UNICODE_OPERATOR_REPLACEMENTS: [string, string][] = [
  ['≥', '>='],
  ['≤', '<='],
  ['≠', '!='],
  ['≧', '>='],
  ['≦', '<='],
];

/** Convierte operadores Unicode a forma ASCII sin romper secuencias ya ASCII. */
export function normalizeMathOperators(text: string): string {
  let result = text;
  for (const [from, to] of UNICODE_OPERATOR_REPLACEMENTS) {
    result = result.split(from).join(to);
  }
  return result;
}

function hasControlChars(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code === 9 || code === 10 || code === 13) continue;
    if (code < 32 || code === 127) return true;
  }
  return false;
}

function balancedBraces(text: string): boolean {
  let depth = 0;
  for (const ch of text) {
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth < 0) return false;
    }
  }
  return depth === 0;
}

/** Detecta operadores comparativos incompletos al final (p. ej. termina en ">="). */
function hasTrailingIncompleteOperator(text: string): boolean {
  const trimmed = text.trimEnd();
  return /(?:>=|<=|!=|>|<|=|≥|≤|≠)$/.test(trimmed);
}

/**
 * Valida notación de lenguaje de forma permisiva.
 * Acepta >=, <=, >, <, =, != y variantes Unicode.
 */
export function validateLanguageNotation(
  text: string
): LanguageNotationValidation {
  const trimmed = text.trim();
  if (!trimmed) {
    return { valid: true, normalized: '' };
  }

  const normalized = normalizeMathOperators(text);

  if (hasControlChars(text)) {
    return {
      valid: false,
      error: 'La descripción contiene caracteres de control no permitidos.',
      normalized,
    };
  }

  if (!ALLOWED_CHAR.test(text)) {
    return {
      valid: false,
      error:
        'Hay símbolos no reconocidos. Use letras, números, {}, |, ^, comparadores (>=, <=, >, <, =, !=) y notación habitual.',
      normalized,
    };
  }

  if (!balancedBraces(text)) {
    return {
      valid: false,
      error: 'Las llaves { } no están balanceadas.',
      normalized,
    };
  }

  if (hasTrailingIncompleteOperator(trimmed)) {
    return {
      valid: false,
      error:
        'La condición parece terminar en un operador incompleto (falta el operando derecho).',
      normalized,
    };
  }

  return { valid: true, normalized };
}
