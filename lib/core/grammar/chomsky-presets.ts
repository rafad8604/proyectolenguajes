import type { ChomskyType } from 'types/grammar';

export const TYPE_LABELS: Record<ChomskyType, string> = {
  3: 'Tipo 3 — Regular',
  2: 'Tipo 2 — Libre de contexto',
  1: 'Tipo 1 — Sensible al contexto',
  0: 'Tipo 0 — Irrestricta',
};

export const TYPE_SHORT_LABELS: Record<ChomskyType, string> = {
  3: 'Regular (Tipo 3)',
  2: 'Libre de contexto (Tipo 2)',
  1: 'Sensible al contexto (Tipo 1)',
  0: 'Irrestricta (Tipo 0)',
};

export interface ChomskyTypeHelp {
  title: string;
  rules: string[];
  placeholder: string;
}

export const TYPE_HELP: Record<ChomskyType, ChomskyTypeHelp> = {
  3: {
    title: 'Gramática regular (Tipo 3)',
    rules: [
      'El lado izquierdo debe ser una sola variable (A).',
      'Forma derecha: A → wB | w | ε (lineal por la derecha), o A → Bw | w | ε (lineal por la izquierda).',
      'No mezcles lineal derecha e izquierda en la misma gramática.',
    ],
    placeholder: 'S -> aA | b\nA -> aA | b',
  },
  2: {
    title: 'Gramática libre de contexto (Tipo 2)',
    rules: [
      'El lado izquierdo debe ser exactamente una variable/no terminal.',
      'El lado derecho puede combinar variables y terminales libremente.',
      'Ejemplo: S → aSb | ε.',
    ],
    placeholder: 'S -> aSb | bSb | a | b | ε',
  },
  1: {
    title: 'Gramática sensible al contexto (Tipo 1)',
    rules: [
      'El lado izquierdo puede incluir terminales y variables (contexto).',
      'Debe contener al menos una variable en α.',
      'Se exige |α| ≤ |β|, salvo S → ε si S es el símbolo inicial.',
      'Ejemplo: aA → aa.',
    ],
    placeholder: 'S -> aSA | ε\naA -> aa',
  },
  0: {
    title: 'Gramática irrestricta (Tipo 0)',
    rules: [
      'El lado izquierdo puede ser cualquier cadena α ≠ ε con al menos una variable.',
      'No se exige |α| ≤ |β| (puede acortar cadenas).',
      'Ejemplo: AB → a.',
    ],
    placeholder: 'S -> aAB\nAB -> a',
  },
};

export interface ChomskyExampleInput {
  name?: string;
  selectedType: ChomskyType;
  variablesText: string;
  terminalsText: string;
  startSymbol: string;
  productionsText: string;
}

export const CHOMSKY_EXAMPLES: Array<{
  type: ChomskyType;
  label: string;
  input: ChomskyExampleInput;
}> = [
  {
    type: 3,
    label: 'Regular (Tipo 3)',
    input: {
      name: 'Regular derecha',
      selectedType: 3,
      variablesText: 'S, A',
      terminalsText: 'a, b',
      startSymbol: 'S',
      productionsText: 'S -> aA | b\nA -> aA | b',
    },
  },
  {
    type: 2,
    label: 'Libre de contexto (Tipo 2)',
    input: {
      name: 'Palíndromos',
      selectedType: 2,
      variablesText: 'S',
      terminalsText: 'a, b',
      startSymbol: 'S',
      productionsText: 'S -> aSb | bSb | a | b | ε',
    },
  },
  {
    type: 1,
    label: 'Sensible al contexto (Tipo 1)',
    input: {
      name: 'Contexto con terminales',
      selectedType: 1,
      variablesText: 'S, A',
      terminalsText: 'a, b',
      startSymbol: 'S',
      productionsText: 'S -> aSA | ε\naA -> aa',
    },
  },
  {
    type: 1,
    label: 'CSG clásica (fragmento)',
    input: {
      name: 'Copiar a^n b^n c^n (fragmento)',
      selectedType: 1,
      variablesText: 'S, A, B, C',
      terminalsText: 'a, b, c',
      startSymbol: 'S',
      productionsText:
        'S -> aSBC | abc\nCB -> BC\nbB -> bb\nbC -> bc\ncC -> cc',
    },
  },
  {
    type: 0,
    label: 'Irrestricta (Tipo 0)',
    input: {
      name: 'Acortamiento',
      selectedType: 0,
      variablesText: 'S, A, B',
      terminalsText: 'a, b',
      startSymbol: 'S',
      productionsText: 'S -> aAB\nAB -> a',
    },
  },
];

export function getExampleForType(type: ChomskyType): ChomskyExampleInput {
  const match = CHOMSKY_EXAMPLES.find((ex) => ex.type === type);
  return match?.input ?? CHOMSKY_EXAMPLES[0]!.input;
}
