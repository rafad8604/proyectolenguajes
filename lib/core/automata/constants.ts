/** Símbolo visual para transiciones épsilon. */
export const EPSILON_SYMBOL = 'ε';

/** Símbolo interno almacenado para transiciones épsilon. */
export const EPSILON_INTERNAL = '';

const EPSILON_ALPHABET_ALIASES = new Set([
  EPSILON_SYMBOL,
  'ϵ',
  'λ',
  'epsilon',
  'EPSILON',
  'Epsilon',
  'lambda',
  'LAMBDA',
  'Lambda',
]);

/** Indica si un símbolo de transición representa épsilon (no debe aparecer en AFD). */
export function isEpsilonSymbol(symbol: string): boolean {
  if (symbol.trim() === '') return true;
  return EPSILON_ALPHABET_ALIASES.has(symbol) || EPSILON_ALPHABET_ALIASES.has(symbol.toLowerCase());
}
