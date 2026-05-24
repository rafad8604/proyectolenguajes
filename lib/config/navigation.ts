export interface NavModule {
  href: string;
  label: string;
  description: string;
}

export const mainModules: NavModule[] = [
  {
    href: '/automatas',
    label: 'Autómatas finitos',
    description:
      'Editor gráfico de AFD y AFND, simulación paso a paso, tabla δ y definición formal.',
  },
  {
    href: '/automatas/conversion',
    label: 'AFND → AFD',
    description:
      'Construcción por subconjuntos con pasos explicados y simulación del AFD resultante.',
  },
  {
    href: '/turing',
    label: 'Máquinas de Turing',
    description:
      'Máquinas de 1 o 2 bandas con simulación de cinta y exportación JFLAP.',
  },
  {
    href: '/gramaticas',
    label: 'Gramáticas',
    description:
      'Editor de producciones, jerarquía de Chomsky y gramática regular desde autómata.',
  },
  {
    href: '/thompson',
    label: 'Thompson',
    description:
      'Expresión regular → AFND con tokenización, postfix y pasos del algoritmo.',
  },
  {
    href: '/lema-bombeo',
    label: 'Lema de bombeo',
    description:
      'Asistente guiado: p, w, división xyz y cadenas bombeadas xy^i z.',
  },
  {
    href: '/jflap',
    label: 'JFLAP',
    description:
      'Importar y exportar archivos .jff compatibles con JFLAP.',
  },
];

export const footerLinks: NavModule[] = [
  { href: '/acerca', label: 'Acerca del proyecto', description: '' },
  { href: '/', label: 'Inicio', description: '' },
];
