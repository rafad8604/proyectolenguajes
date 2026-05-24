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
      'Construye AFD y AFND, simula cadenas y convierte AFND a AFD.',
  },
  {
    href: '/turing',
    label: 'Máquinas de Turing',
    description:
      'Diseña máquinas de 1 o 2 bandas y simula su ejecución paso a paso.',
  },
  {
    href: '/gramaticas',
    label: 'Gramáticas',
    description:
      'Edita producciones y explora la jerarquía de Chomsky.',
  },
  {
    href: '/thompson',
    label: 'Thompson',
    description:
      'Construye un AFND a partir de una expresión regular.',
  },
  {
    href: '/lema-bombeo',
    label: 'Lema de bombeo',
    description:
      'Asistente guiado para demostrar que un lenguaje no es regular.',
  },
  {
    href: '/jflap',
    label: 'Importar / Exportar JFLAP',
    description:
      'Carga y descarga ejercicios en formato .jff compatible con JFLAP.',
  },
];
