import type { TransitionVisual } from './transition-visual';

/** Transición de un autómata finito (AFD o AFND). */
export interface Transition {
  id: string;
  from: string;
  to: string;
  /** Símbolo de entrada. Usar cadena vacía o constante ε para transiciones épsilon. */
  symbol: string;
  isEpsilon?: boolean;
  /** Posición/curvatura de la flecha y etiqueta (solo visual). */
  visual?: TransitionVisual;
}
