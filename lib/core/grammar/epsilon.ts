import { EPSILON_SYMBOL } from '../automata/constants';

/** Palabras reservadas (comparación sin distinguir mayúsculas). */
const EPSILON_WORD_ALIASES = ['epsilon', 'lambda'] as const;

/** Símbolos Unicode de cadena vacía. */
const EPSILON_CHAR_ALIASES = new Set(['ε', 'ϵ', 'λ']);

/** Indica si un fragmento completo representa la cadena vacía (épsilon). */
export function isEpsilonAlias(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (EPSILON_CHAR_ALIASES.has(trimmed)) return true;
  return EPSILON_WORD_ALIASES.includes(
    trimmed.toLowerCase() as (typeof EPSILON_WORD_ALIASES)[number]
  );
}

/**
 * Longitud del alias épsilon en `raw` desde `index`, o null si no hay coincidencia.
 * Las palabras epsilon/lambda no coinciden dentro de identificadores más largos.
 */
export function epsilonAliasLengthAt(raw: string, index: number): number | null {
  for (const word of EPSILON_WORD_ALIASES) {
    if (raw.length - index < word.length) continue;
    const slice = raw.slice(index, index + word.length);
    if (slice.toLowerCase() !== word) continue;
    const before = index > 0 ? raw[index - 1]! : '';
    const after = index + word.length < raw.length ? raw[index + word.length]! : '';
    if (/[a-zA-Z0-9_]/.test(before) || /[a-zA-Z0-9_]/.test(after)) continue;
    return word.length;
  }
  const ch = raw[index];
  if (ch && EPSILON_CHAR_ALIASES.has(ch)) return 1;
  return null;
}

/** Texto de ayuda para el editor de producciones. */
export const EPSILON_INPUT_HELP =
  `Puedes escribir ${EPSILON_SYMBOL}, λ, epsilon o lambda para representar la cadena vacía.`;

/** Terminales que chocan con alias reservados de vacío. */
export function findReservedEpsilonTerminals(terminals: Iterable<string>): string[] {
  const found: string[] = [];
  for (const t of terminals) {
    const lower = t.toLowerCase();
    if (
      EPSILON_WORD_ALIASES.includes(lower as (typeof EPSILON_WORD_ALIASES)[number])
    ) {
      found.push(t);
    }
  }
  return found;
}

export function reservedTerminalWarning(terminals: string[]): string | null {
  if (terminals.length === 0) return null;
  const list = terminals.map((t) => `«${t}»`).join(', ');
  return `${list} está reservado para la cadena vacía; en producciones se interpretará como ε, no como terminal.`;
}

/** Normaliza la palabra objetivo de derivación (vacío si el usuario escribe un alias). */
export function normalizeDerivationTarget(raw: string): {
  target: string;
  aliasUsed: boolean;
} {
  const trimmed = raw.trim();
  if (!trimmed) return { target: '', aliasUsed: false };
  if (isEpsilonAlias(trimmed)) return { target: '', aliasUsed: true };
  return { target: trimmed, aliasUsed: false };
}
