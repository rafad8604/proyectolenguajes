export type TokenType =
  | 'CHAR'
  | 'UNION'
  | 'CONCAT'
  | 'STAR'
  | 'PLUS'
  | 'OPTIONAL'
  | 'LPAREN'
  | 'RPAREN'
  | 'EPSILON'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

export interface TokenizeResult {
  tokens: Token[];
  error?: string;
}

const EPSILON_CHARS = new Set(['ε', 'ϵ']);

/** Expande clases de caracteres [abc] o [a-z] a forma con unión. */
function expandCharacterClasses(input: string): string {
  let result = '';
  let i = 0;
  while (i < input.length) {
    if (input[i] === '\\' && i + 1 < input.length) {
      result += input[i] + input[i + 1];
      i += 2;
      continue;
    }
    if (input[i] !== '[') {
      result += input[i];
      i += 1;
      continue;
    }
    const start = i;
    i += 1;
    let negated = false;
    if (input[i] === '^') {
      negated = true;
      i += 1;
    }
    const chars: string[] = [];
    while (i < input.length && input[i] !== ']') {
      if (input[i] === '\\' && i + 1 < input.length) {
        chars.push(input[i + 1]);
        i += 2;
        continue;
      }
      if (i + 2 < input.length && input[i + 1] === '-') {
        const from = input[i].charCodeAt(0);
        const to = input[i + 2].charCodeAt(0);
        const lo = Math.min(from, to);
        const hi = Math.max(from, to);
        for (let c = lo; c <= hi; c++) {
          chars.push(String.fromCharCode(c));
        }
        i += 3;
        continue;
      }
      chars.push(input[i]);
      i += 1;
    }
    if (i >= input.length || input[i] !== ']') {
      return input;
    }
    i += 1;
    if (negated) {
      result += input.slice(start, i);
    } else if (chars.length === 0) {
      result += '[]';
    } else if (chars.length === 1) {
      result += chars[0];
    } else {
      result += `(${chars.join('|')})`;
    }
  }
  return result;
}

function isMeta(ch: string): boolean {
  return '|*+?().\\'.includes(ch);
}

/**
 * Tokeniza una expresión regular.
 * Soporta: | * + ? () [] ε concatenación implícita.
 */
export function tokenize(input: string): TokenizeResult {
  const expanded = expandCharacterClasses(input.trim());
  const tokens: Token[] = [];
  let i = 0;

  while (i < expanded.length) {
    const ch = expanded[i];

    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    if (ch === '\\' && i + 1 < expanded.length) {
      tokens.push({ type: 'CHAR', value: expanded[i + 1], position: i });
      i += 2;
      continue;
    }

    if (EPSILON_CHARS.has(ch) || ch.toLowerCase() === 'ε') {
      tokens.push({ type: 'EPSILON', value: 'ε', position: i });
      i += 1;
      continue;
    }

    switch (ch) {
      case '|':
        tokens.push({ type: 'UNION', value: '|', position: i });
        i += 1;
        break;
      case '*':
        tokens.push({ type: 'STAR', value: '*', position: i });
        i += 1;
        break;
      case '+':
        tokens.push({ type: 'PLUS', value: '+', position: i });
        i += 1;
        break;
      case '?':
        tokens.push({ type: 'OPTIONAL', value: '?', position: i });
        i += 1;
        break;
      case '(':
        tokens.push({ type: 'LPAREN', value: '(', position: i });
        i += 1;
        break;
      case ')':
        tokens.push({ type: 'RPAREN', value: ')', position: i });
        i += 1;
        break;
      default:
        if (isMeta(ch) && ch !== '[') {
          return {
            tokens: [],
            error: `Carácter no reconocido «${ch}» en posición ${i}.`,
          };
        }
        tokens.push({ type: 'CHAR', value: ch, position: i });
        i += 1;
    }
  }

  tokens.push({ type: 'EOF', value: '', position: expanded.length });
  return { tokens, error: undefined };
}

/** Inserta operadores de concatenación explícitos (·). */
export function normalizeTokens(tokens: Token[]): { tokens: Token[]; display: string } {
  if (tokens.length === 0) return { tokens: [], display: '' };

  const needsConcatAfter = (t: TokenType) =>
    t === 'CHAR' || t === 'RPAREN' || t === 'STAR' || t === 'PLUS' || t === 'OPTIONAL' || t === 'EPSILON';

  const needsConcatBefore = (t: TokenType) =>
    t === 'CHAR' || t === 'LPAREN' || t === 'EPSILON';

  const normalized: Token[] = [];
  const displayParts: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok.type === 'EOF') break;

    if (
      normalized.length > 0 &&
      needsConcatAfter(normalized[normalized.length - 1].type) &&
      needsConcatBefore(tok.type)
    ) {
      normalized.push({ type: 'CONCAT', value: '·', position: tok.position });
      displayParts.push('·');
    }

    normalized.push(tok);
    displayParts.push(tok.type === 'CONCAT' ? '·' : tok.value);
  }

  normalized.push({ type: 'EOF', value: '', position: tokens[tokens.length - 1]?.position ?? 0 });
  return { tokens: normalized, display: displayParts.join(' ') };
}

export function tokensToString(tokens: Token[]): string {
  return tokens
    .filter((t) => t.type !== 'EOF')
    .map((t) => (t.type === 'CONCAT' ? '·' : t.value))
    .join(' ');
}
