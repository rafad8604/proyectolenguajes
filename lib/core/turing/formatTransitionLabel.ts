import type { TuringTransition } from 'types/turing';

function displaySymbol(symbol: string, blank: string): string {
  if (symbol === blank) return '□';
  return symbol || '□';
}

/**
 * Etiqueta compacta para aristas del grafo.
 * 1 banda: `a → b, R`
 * 2 bandas: `a,b → x,y, R,L`
 */
export function formatTransitionLabel(
  transition: TuringTransition,
  tapeCount: 1 | 2,
  blankSymbol = '_'
): string {
  const read = transition.readSymbols.map((s) =>
    displaySymbol(s, blankSymbol)
  );
  const write = transition.writeSymbols.map((s) =>
    displaySymbol(s, blankSymbol)
  );
  const moves = transition.moves.join(',');

  if (tapeCount === 1) {
    return `${read[0] ?? '□'} → ${write[0] ?? '□'}, ${moves || 'S'}`;
  }

  return `${read.join(',')} → ${write.join(',')}, ${moves || 'S,S'}`;
}
