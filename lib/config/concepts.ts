export interface Concept {
  id: string;
  title: string;
  shortTitle: string;
  summary: string;
  href?: string;
}

/** Explicaciones breves para la landing y la sección «Acerca del proyecto». */
export const concepts: Concept[] = [
  {
    id: 'afd',
    title: 'Autómata finito determinista (AFD)',
    shortTitle: 'AFD',
    summary:
      'Modelo de computación con un estado actual, un alfabeto de entrada y una función de transición δ(q, a) que indica exactamente un siguiente estado. No admite ambigüedad: desde cada estado y símbolo hay a lo sumo una transición. Útil para reconocer lenguajes regulares de forma eficiente.',
    href: '/automatas',
  },
  {
    id: 'afnd',
    title: 'Autómata finito no determinista (AFND)',
    shortTitle: 'AFND',
    summary:
      'Permite varias transiciones posibles con el mismo símbolo desde un estado, e incluso transiciones ε (sin consumir entrada). Una cadena se acepta si existe al menos un camino que termina en un estado final. Todo AFND puede convertirse en un AFD equivalente (construcción por subconjuntos).',
    href: '/automatas',
  },
  {
    id: 'turing',
    title: 'Máquina de Turing',
    shortTitle: 'Máquina de Turing',
    summary:
      'Modelo con cinta infinita, cabezal y reglas que leen, escriben y mueven el cabezal. Generaliza a los autómatas finitos y captura lenguajes recursivamente enumerables. En esta app puedes simular máquinas de 1 o 2 bandas paso a paso.',
    href: '/turing',
  },
  {
    id: 'thompson',
    title: 'Construcción de Thompson',
    shortTitle: 'Thompson',
    summary:
      'Algoritmo que transforma una expresión regular en un AFND con transiciones ε, componiendo fragmentos para unión, concatenación, estrella, más, opcional y paréntesis. Es la base típica para pasar de regex a autómata.',
    href: '/thompson',
  },
  {
    id: 'grammar',
    title: 'Gramáticas formales',
    shortTitle: 'Gramáticas',
    summary:
      'Sistema de reescritura con variables (V), terminales (Σ), símbolo inicial y producciones P. Clasificamos la forma según la jerarquía de Chomsky (tipos 0–3) y generamos gramáticas regulares equivalentes a autómatas finitos.',
    href: '/gramaticas',
  },
  {
    id: 'pumping',
    title: 'Lema de bombeo',
    shortTitle: 'Lema de bombeo',
    summary:
      'Herramienta para demostrar que un lenguaje no es regular: existe una longitud p tal que toda cadena w suficientemente larga se puede dividir en xyz cumpliendo |xy|≤p, |y|>0, y xy^i z debe seguir en L para todo i. El asistente verifica las condiciones mecánicas; la pertenencia a L la argumentas tú.',
    href: '/lema-bombeo',
  },
  {
    id: 'jflap',
    title: 'JFLAP (.jff)',
    shortTitle: 'JFLAP',
    summary:
      'Formato XML usado por JFLAP para guardar autómatas y máquinas de Turing. Puedes importar archivos .jff a la aplicación o exportar tus modelos para abrirlos en JFLAP u otras herramientas compatibles.',
    href: '/jflap',
  },
];

export function getConcept(id: string): Concept | undefined {
  return concepts.find((c) => c.id === id);
}
