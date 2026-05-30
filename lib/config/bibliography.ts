export interface BibliographyEntry {
  authors: string;
  title: string;
  edition?: string;
  year?: string;
  publisher?: string;
  url?: string;
  note?: string;
}

export interface BibliographyTopic {
  id: string;
  topic: string;
  conceptId?: string;
  entries: BibliographyEntry[];
}

/** Referencias académicas por concepto teórico. */
export const bibliographyTopics: BibliographyTopic[] = [
  {
    id: 'afd',
    topic: 'Autómata finito determinista (AFD)',
    conceptId: 'afd',
    entries: [
      {
        authors: 'Hopcroft, J. E.; Motwani, R.; Ullman, J. D.',
        title: 'Introduction to Automata Theory, Languages, and Computation',
        edition: '3.ª ed.',
        year: '2006',
        publisher: 'Addison-Wesley',
        note: 'Capítulos 1–2: autómatas finitos, expresiones regulares y equivalencias.',
      },
      {
        authors: 'Sipser, M.',
        title: 'Introduction to the Theory of Computation',
        edition: '3.ª ed.',
        year: '2013',
        publisher: 'Cengage Learning',
        note: 'Capítulo 1: lenguajes regulares y autómatas finitos.',
      },
      {
        authors: 'Linz, P.',
        title: 'An Introduction to Formal Languages and Automata',
        edition: '7.ª ed.',
        year: '2022',
        publisher: 'Jones & Bartlett Learning',
        note: 'Capítulos 2–3: autómatas finitos deterministas y no deterministas.',
      },
    ],
  },
  {
    id: 'afnd',
    topic: 'Autómata finito no determinista (AFND)',
    conceptId: 'afnd',
    entries: [
      {
        authors: 'Hopcroft, J. E.; Motwani, R.; Ullman, J. D.',
        title: 'Introduction to Automata Theory, Languages, and Computation',
        edition: '3.ª ed.',
        year: '2006',
        publisher: 'Addison-Wesley',
        note: 'Sección 4.1: AFND y equivalencia con AFD (construcción por subconjuntos).',
      },
      {
        authors: 'Sipser, M.',
        title: 'Introduction to the Theory of Computation',
        edition: '3.ª ed.',
        year: '2013',
        publisher: 'Cengage Learning',
        note: 'Subsección 1.2: no determinismo y cerradura por subconjuntos.',
      },
      {
        authors: 'Linz, P.',
        title: 'An Introduction to Formal Languages and Automata',
        edition: '7.ª ed.',
        year: '2022',
        publisher: 'Jones & Bartlett Learning',
        note: 'Capítulo 3: equivalencia AFND–AFD y transiciones ε.',
      },
    ],
  },
  {
    id: 'turing',
    topic: 'Máquinas de Turing',
    conceptId: 'turing',
    entries: [
      {
        authors: 'Sipser, M.',
        title: 'Introduction to the Theory of Computation',
        edition: '3.ª ed.',
        year: '2013',
        publisher: 'Cengage Learning',
        note: 'Capítulos 3–4: definición, variantes y tesis de Church–Turing.',
      },
      {
        authors: 'Hopcroft, J. E.; Motwani, R.; Ullman, J. D.',
        title: 'Introduction to Automata Theory, Languages, and Computation',
        edition: '3.ª ed.',
        year: '2006',
        publisher: 'Addison-Wesley',
        note: 'Capítulos 8–9: máquinas de Turing y decidibilidad.',
      },
      {
        authors: 'Linz, P.',
        title: 'An Introduction to Formal Languages and Automata',
        edition: '7.ª ed.',
        year: '2022',
        publisher: 'Jones & Bartlett Learning',
        note: 'Capítulos 10–11: modelos de Turing y extensiones (varias cintas).',
      },
    ],
  },
  {
    id: 'grammar',
    topic: 'Gramáticas formales',
    conceptId: 'grammar',
    entries: [
      {
        authors: 'Hopcroft, J. E.; Motwani, R.; Ullman, J. D.',
        title: 'Introduction to Automata Theory, Languages, and Computation',
        edition: '3.ª ed.',
        year: '2006',
        publisher: 'Addison-Wesley',
        note: 'Capítulos 5–6: gramáticas libres de contexto y formas normales.',
      },
      {
        authors: 'Linz, P.',
        title: 'An Introduction to Formal Languages and Automata',
        edition: '7.ª ed.',
        year: '2022',
        publisher: 'Jones & Bartlett Learning',
        note: 'Capítulos 1 y 5–6: gramáticas, derivaciones y árboles.',
      },
      {
        authors: 'Sipser, M.',
        title: 'Introduction to the Theory of Computation',
        edition: '3.ª ed.',
        year: '2013',
        publisher: 'Cengage Learning',
        note: 'Capítulo 2: gramáticas libres de contexto y lenguajes.',
      },
    ],
  },
  {
    id: 'chomsky',
    topic: 'Jerarquía de Chomsky',
    conceptId: 'grammar',
    entries: [
      {
        authors: 'Chomsky, N.',
        title: 'Three models for the description of language',
        year: '1956',
        publisher: 'IRE Transactions on Information Theory',
        note: 'Artículo fundacional que introduce la clasificación de gramáticas.',
      },
      {
        authors: 'Hopcroft, J. E.; Motwani, R.; Ullman, J. D.',
        title: 'Introduction to Automata Theory, Languages, and Computation',
        edition: '3.ª ed.',
        year: '2006',
        publisher: 'Addison-Wesley',
        note: 'Cuadro resumen tipos 0–3 y correspondencia con autómatas.',
      },
      {
        authors: 'Linz, P.',
        title: 'An Introduction to Formal Languages and Automata',
        edition: '7.ª ed.',
        year: '2022',
        publisher: 'Jones & Bartlett Learning',
        note: 'Capítulo 1: jerarquía de Chomsky y ejemplos por tipo.',
      },
    ],
  },
  {
    id: 'thompson',
    topic: 'Algoritmo de Thompson',
    conceptId: 'thompson',
    entries: [
      {
        authors: 'Thompson, K.',
        title: 'Programming Techniques: Regular expression search algorithm',
        year: '1968',
        publisher: 'Communications of the ACM',
        note: 'Construcción original de AFND desde expresiones regulares.',
      },
      {
        authors: 'Hopcroft, J. E.; Motwani, R.; Ullman, J. D.',
        title: 'Introduction to Automata Theory, Languages, and Computation',
        edition: '3.ª ed.',
        year: '2006',
        publisher: 'Addison-Wesley',
        note: 'Sección 3.2: de expresiones regulares a autómatas.',
      },
      {
        authors: 'Sipser, M.',
        title: 'Introduction to the Theory of Computation',
        edition: '3.ª ed.',
        year: '2013',
        publisher: 'Cengage Learning',
        note: 'Conversión regex → AFND en el capítulo de lenguajes regulares.',
      },
    ],
  },
  {
    id: 'pumping',
    topic: 'Lema de bombeo',
    conceptId: 'pumping',
    entries: [
      {
        authors: 'Sipser, M.',
        title: 'Introduction to the Theory of Computation',
        edition: '3.ª ed.',
        year: '2013',
        publisher: 'Cengage Learning',
        note: 'Sección 1.4: lema de bombeo para lenguajes regulares y demostraciones por contradicción.',
      },
      {
        authors: 'Hopcroft, J. E.; Motwani, R.; Ullman, J. D.',
        title: 'Introduction to Automata Theory, Languages, and Computation',
        edition: '3.ª ed.',
        year: '2006',
        publisher: 'Addison-Wesley',
        note: 'Sección 4.1.1: lema de bombeo y aplicaciones.',
      },
      {
        authors: 'Linz, P.',
        title: 'An Introduction to Formal Languages and Automata',
        edition: '7.ª ed.',
        year: '2022',
        publisher: 'Jones & Bartlett Learning',
        note: 'Capítulo 4: lema de bombeo y ejemplos clásicos (a^n b^n, palíndromos).',
      },
    ],
  },
  {
    id: 'jflap',
    topic: 'JFLAP',
    conceptId: 'jflap',
    entries: [
      {
        authors: 'JFLAP Team',
        title: 'JFLAP — JFLAP: An Interactive Formal Languages and Automata Package',
        url: 'https://www.jflap.org/',
        note: 'Sitio oficial: descargas, tutoriales y documentación del formato .jff.',
      },
      {
        authors: 'Rodger, S. H.; Finley, T. W.',
        title: 'JFLAP: An Interactive Formal Languages and Automata Package',
        year: '2006',
        publisher: 'Journal of Automata, Languages and Combinatorics',
        note: 'Descripción académica del paquete y su uso pedagógico.',
      },
      {
        authors: 'Linz, P.; Rodger, S. H.',
        title: 'Teaching automata theory with JFLAP',
        year: '2009',
        publisher: 'ACM Inroads',
        note: 'Experiencias docentes con JFLAP en cursos de lenguajes formales.',
      },
    ],
  },
];
