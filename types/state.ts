/** Posición de un estado en el lienzo del editor gráfico. */
export interface StatePosition {
  x: number;
  y: number;
}

/** Estado de un autómata finito o de una máquina de Turing. */
export interface State {
  id: string;
  name: string;
  isInitial: boolean;
  isAccepting: boolean;
  position?: StatePosition;
}
