/** Tipo de gramática según la jerarquía de Chomsky (0–3). */
export type ChomskyType = 0 | 1 | 2 | 3;

/** Producción de una gramática formal. */
export interface Production {
  id: string;
  /** Lado izquierdo: secuencia de variables. */
  left: string[];
  /**
   * Lado derecho: secuencia de terminales y variables.
   * `null` representa la producción épsilon.
   */
  right: (string | null)[];
}

/** Gramática formal con clasificación opcional. */
export interface Grammar {
  id: string;
  name: string;
  variables: string[];
  terminals: string[];
  startSymbol: string;
  productions: Production[];
  /** Tipo inferido o asignado manualmente. */
  chomskyType?: ChomskyType;
}
