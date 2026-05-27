import type { Automaton } from 'types/automaton';

export const THOMPSON_CONVERSION_STORAGE_KEY = 'thompson:nfa-for-conversion';

function isAutomaton(value: unknown): value is Automaton {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
    (record.type === 'dfa' || record.type === 'nfa') &&
    Array.isArray(record.states) &&
    Array.isArray(record.transitions)
  );
}

/** Guarda el AFND de Thompson para la vista de conversión detallada. */
export function stashThompsonNfaForConversion(nfa: Automaton): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(
    THOMPSON_CONVERSION_STORAGE_KEY,
    JSON.stringify(nfa)
  );
}

/** Lee el AFND guardado desde Thompson (si existe). */
export function readThompsonNfaForConversion(): Automaton | null {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(THOMPSON_CONVERSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isAutomaton(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearThompsonNfaForConversion(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(THOMPSON_CONVERSION_STORAGE_KEY);
}
