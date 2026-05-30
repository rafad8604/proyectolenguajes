export interface ManualSection {
  id: string;
  title: string;
  href: string;
  intro?: string;
  steps: string[];
}

/** Manual de usuario por módulo (sección Acerca de). */
export const userManualSections: ManualSection[] = [
  {
    id: 'automatas',
    title: 'Autómatas finitos',
    href: '/automatas',
    intro:
      'Editor gráfico de AFD y AFND con simulación, tabla de transiciones y definición formal M = (Q, Σ, δ, q₀, F).',
    steps: [
      'Abre el módulo Autómatas finitos. Elige el tipo AFD o AFND en la barra superior.',
      'Crea estados con el botón «Agregar estado». Arrastra los nodos en el diagrama para ordenarlos.',
      'Selecciona un estado en el diagrama. En el panel «Propiedades del estado», marca el botón de opción Estado inicial (q₀). Solo puede haber uno.',
      'En el mismo panel, activa la casilla Estado final (F) para marcar estados de aceptación. Puedes tener varios.',
      'Para crear transiciones: arrastra desde un estado hacia otro en el diagrama, o usa el formulario de transiciones. En AFND puedes marcar transiciones ε (sin consumir símbolo).',
      'Simula una palabra en la sección Simulación: escribe la cadena, pulsa Simular y avanza con Anterior / Siguiente o Ejecutar todo. La cinta resalta el símbolo leído y el diagrama muestra el estado activo.',
      'Convierte AFND → AFD en Autómatas → AFND → AFD (/automatas/conversion): revisa la tabla de subconjuntos paso a paso y simula el AFD resultante.',
      'Genera una gramática regular equivalente en la sección inferior del editor de autómatas (Gramática desde autómata). También disponible en el módulo Gramáticas si guardaste el autómata en memoria local.',
    ],
  },
  {
    id: 'turing',
    title: 'Máquinas de Turing',
    href: '/turing',
    intro:
      'Simulación de máquinas de 1 o 2 bandas con cinta infinita, cabezales independientes y traza paso a paso.',
    steps: [
      'En Configuración elige 1 banda o 2 bandas según el modelo que quieras construir.',
      'Define el Alfabeto de entrada Σ, el Alfabeto de cinta Γ y el Símbolo blanco (por defecto «_»). El blanco representa celdas vacías no escritas explícitamente.',
      'Agrega estados en el diagrama y selecciónalos para marcar inicial, de aceptación o de rechazo.',
      'Crea transiciones en la tabla o formulario: indica símbolos leídos (uno por banda), símbolos escritos y movimientos L (izquierda), R (derecha) o S (quieto) por banda.',
      'Escribe la cadena de entrada y pulsa Simular. Usa Siguiente → para avanzar paso a paso o Ejecutar todo para recorrer la traza completa.',
      'Interpreta la cinta: la celda resaltada es la posición del cabezal; símbolos a la izquierda ya procesados forman el prefijo consumido. El resultado solo es Aceptada cuando la MT se detiene en un estado de aceptación sin transición aplicable.',
      'Reiniciar borra la traza y vuelve al inicio. Exporta o importa modelos .jff desde la sección JFLAP del editor.',
    ],
  },
  {
    id: 'thompson',
    title: 'Construcción de Thompson',
    href: '/thompson',
    intro:
      'Transforma expresiones regulares en AFND con transiciones ε mediante el algoritmo de Thompson.',
    steps: [
      'Escribe la expresión regular en el campo de entrada o elige un ejemplo precargado.',
      'Operadores aceptados: unión |, concatenación implícita o explícita (·), estrella Kleene *, más +, opcional ?, paréntesis (), clases [abc] o [a-z], épsilon ε, y escape con \\ para metacaracteres.',
      'Pulsa Construir AFND. Revisa la tokenización, la forma postfix y los pasos del algoritmo antes del diagrama resultante.',
      'Convierte a AFD con el botón «Convertir a AFD» o abre la conversión detallada en /thompson/conversion.',
      'En Comparar AFND y AFD simula la misma cadena en ambos modelos. El AFND puede mostrar pasos de cerradura ε; el AFD avanza símbolo a símbolo.',
      'Exporta el AFND a JFLAP (.jff) o ábrelo en el módulo Autómatas para seguir editándolo.',
    ],
  },
  {
    id: 'gramaticas',
    title: 'Gramáticas formales',
    href: '/gramaticas',
    intro:
      'Editor de producciones, clasificación en la jerarquía de Chomsky, derivación de palabras y conversión gramática regular → autómata.',
    steps: [
      'Elige el tipo de gramática (3 Regular, 2 Libre de contexto, 1 Sensible al contexto, 0 Irrestricta). Cada tipo muestra reglas de forma y ejemplos precargados.',
      'Completa Variables (V), Terminales (Σ), símbolo inicial y producciones. Usa ->, → o =>. Alternativas con | en la misma línea.',
      'Para la cadena vacía escribe ε, λ, epsilon o lambda en el lado derecho. La app los normaliza internamente a ε.',
      'Revisa la tabla de producciones y el panel de jerarquía de Chomsky. Corrige errores de forma indicados en rojo.',
      'En Derivación de palabras escribe la palabra objetivo (o epsilon/lambda para vacío), ajusta límites de pasos si hace falta y pulsa Derivar. La secuencia muestra cada reescritura; el árbol aparece cuando la forma lo permite.',
      'Si la gramática es regular por la derecha (Tipo 3), usa «Generar autómata desde gramática regular» para obtener un AFND equivalente con diagrama, tabla, simulación y exportación JFLAP.',
      'En la sección inferior puedes generar una gramática regular desde un autómata guardado en el constructor (flujo inverso).',
    ],
  },
  {
    id: 'pumping',
    title: 'Lema de bombeo',
    href: '/lema-bombeo',
    intro:
      'Asistente para verificar condiciones mecánicas del lema de bombeo para lenguajes regulares. No demuestra automáticamente que xy^i z ∉ L.',
    steps: [
      'Describe el lenguaje en notación L = { … } (puedes usar ejemplos precargados como a^n b^n o palíndromos).',
      'Ingresa la longitud de bombeo p (entero positivo) que supones en la demostración por contradicción.',
      'Escribe la cadena w con |w| ≥ p y la descomposición w = xyz: campos x, y, z deben cumplir w = x + y + z.',
      'Indica los valores de i para calcular xy^i z (por ejemplo 0, 1, 2, 3). El asistente comprueba |xy| ≤ p, |y| > 0 y genera las cadenas bombeadas.',
      'Interpreta xy^i z: si alguna cadena bombeada debería estar fuera de L según tu argumento, eso apoya que L no es regular. La pertenencia real a L debes justificarla tú en la demostración escrita.',
      'Exporta el análisis a .txt para incluirlo en apuntes o entregas.',
    ],
  },
  {
    id: 'jflap',
    title: 'JFLAP (.jff)',
    href: '/jflap',
    intro:
      'Intercambio de autómatas finitos y máquinas de Turing con el formato XML de JFLAP.',
    steps: [
      'En el módulo JFLAP o en las secciones JFLAP de Autómatas y Turing, pulsa Importar JFLAP y selecciona un archivo .jff.',
      'La app detecta si el archivo es autómata finito o máquina de Turing y te redirige al módulo correspondiente.',
      'Exportar JFLAP genera un .jff del modelo actual en memoria (autómata del constructor o máquina de Turing activa).',
      'Limitaciones: la geometría avanzada de flechas puede guardarse en extensión pl:visual; JFLAP oficial puede ignorarla. Soporte principal para AFD, AFND con ε y MT de 1 banda; 2 bandas según estructura del archivo. No hay persistencia automática: exporta tu trabajo antes de cerrar el navegador.',
    ],
  },
];
