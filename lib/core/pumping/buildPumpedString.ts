export interface PumpingDivision {
  x: string;
  y: string;
  z: string;
}

export interface PumpingLemmaInput {
  /** Descripción del lenguaje (notación matemática o textual). */
  languageDescription: string;
  /** Longitud de bombeo p (entero positivo). */
  pumpingLength: number;
  /** Cadena elegida w. */
  w: string;
  x: string;
  y: string;
  z: string;
  /** Valores de i para bombar (p. ej. [0, 1, 2, 3]). */
  pumpIndices: number[];
}

export interface PumpingStep {
  id: string;
  title: string;
  /** Explicación pedagógica en español. */
  explanation: string;
  passed: boolean;
  detail: string;
}

export interface PumpedStringRow {
  i: number;
  /** Cadena xy^i z. */
  value: string;
  /** Longitud |xy^i z|. */
  length: number;
}

export interface PumpingLemmaResult {
  steps: PumpingStep[];
  division: PumpingDivision;
  /** w coincide con xyz. */
  divisionMatchesW: boolean;
  pumpedStrings: PumpedStringRow[];
  /** Condiciones mecánicas del lema (|w|≥p, |xy|≤p, |y|>0, xyz). */
  mechanicalConditionsMet: boolean;
  summary: string[];
  warnings: string[];
  /** Texto plano para exportar. */
  exportText: string;
}

const DISCLAIMER = [
  'El lema de bombeo para lenguajes regulares se usa habitualmente para demostrar que un lenguaje NO es regular.',
  'Cumplir las condiciones sobre w, xyz e i no implica que el lenguaje sea regular; una demostración de no regularidad requiere exhibir algún i tal que xy^i z ∉ L.',
  'Esta herramienta no decide automáticamente si una cadena pertenece a L ni resuelve todos los casos.',
];

/** Construye xy^i z = x + y^i + z (con y^0 = ε). */
export function buildPumpedString(
  x: string,
  y: string,
  z: string,
  i: number
): string {
  if (!Number.isInteger(i) || i < 0) {
    throw new Error('El índice de bombeo i debe ser un entero no negativo.');
  }
  return x + y.repeat(i) + z;
}

/** Parsea valores de i desde texto: "0, 1, 2" o "0 1 2" o "0..3". */
export function parsePumpIndices(text: string): {
  indices: number[];
  error?: string;
} {
  const trimmed = text.trim();
  if (!trimmed) {
    return { indices: [0, 1, 2], error: undefined };
  }

  const rangeMatch = trimmed.match(/^(\d+)\s*\.\.\s*(\d+)$/);
  if (rangeMatch) {
    const from = Number(rangeMatch[1]);
    const to = Number(rangeMatch[2]);
    if (from > to) {
      return { indices: [], error: 'En un rango a..b debe cumplirse a ≤ b.' };
    }
    const indices: number[] = [];
    for (let n = from; n <= to; n += 1) indices.push(n);
    return { indices };
  }

  const parts = trimmed.split(/[,;\s]+/).filter(Boolean);
  const indices: number[] = [];
  for (const part of parts) {
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0) {
      return {
        indices: [],
        error: `«${part}» no es un entero no negativo válido.`,
      };
    }
    indices.push(n);
  }

  const unique = [...new Set(indices)].sort((a, b) => a - b);
  return { indices: unique };
}

function step(
  id: string,
  title: string,
  explanation: string,
  passed: boolean,
  detail: string
): PumpingStep {
  return { id, title, explanation, passed, detail };
}

/** Ejecuta las comprobaciones mecánicas del lema de bombeo. */
export function analyzePumpingLemma(input: PumpingLemmaInput): PumpingLemmaResult {
  const steps: PumpingStep[] = [];
  const warnings = [...DISCLAIMER];
  const summary: string[] = [];

  const p = input.pumpingLength;
  const w = input.w;
  const { x, y, z } = input;
  const concatenated = x + y + z;
  const divisionMatchesW = concatenated === w;

  steps.push(
    step(
      'division',
      'División w = xyz',
      'Primero se elige una cadena w ∈ L con |w| ≥ p y se divide en tres bloques x, y y z.',
      divisionMatchesW,
      divisionMatchesW
        ? `w = «${w}» coincide con x + y + z (|x|=${x.length}, |y|=${y.length}, |z|=${z.length}).`
        : `w = «${w}» pero x + y + z = «${concatenated}» (no coinciden).`
    )
  );

  if (!divisionMatchesW) {
    warnings.push(
      'La división no reconstruye w; corrige x, y o z antes de interpretar el resto de pasos.'
    );
  }

  const lengthOk = w.length >= p;
  steps.push(
    step(
      'length',
      'Condición |w| ≥ p',
      'El lema exige una cadena w en el lenguaje con longitud al menos p (la constante de bombeo).',
      lengthOk,
      lengthOk
        ? `|w| = ${w.length} ≥ p = ${p}.`
        : `|w| = ${w.length} < p = ${p}; esta w no cumple el requisito inicial.`
    )
  );

  const xyLen = x.length + y.length;
  const windowOk = xyLen <= p;
  steps.push(
    step(
      'window',
      'Condición |xy| ≤ p',
      'La subcadena bombeable y debe quedar dentro de los primeros p símbolos de w (junto con x).',
      windowOk,
      windowOk
        ? `|xy| = ${xyLen} ≤ p = ${p}.`
        : `|xy| = ${xyLen} > p = ${p}; viola la condición de la ventana de bombeo.`
    )
  );

  const yNonEmpty = y.length > 0;
  steps.push(
    step(
      'y-nonempty',
      'Condición |y| > 0',
      'La parte que se repite (y) debe ser no vacía; de lo contrario el bombeo no altera la cadena.',
      yNonEmpty,
      yNonEmpty ? `|y| = ${y.length} > 0.` : '|y| = 0; no se puede bombear.'
    )
  );

  const pumpedStrings: PumpedStringRow[] = input.pumpIndices.map((i) => {
    const value = buildPumpedString(x, y, z, i);
    return { i, value, length: value.length };
  });

  const pumpList =
    pumpedStrings.length > 0
      ? pumpedStrings.map((r) => `i=${r.i}: xy^${r.i}z = «${r.value}» (|·|=${r.length})`).join('\n')
      : 'Sin valores de i.';

  steps.push(
    step(
      'pump',
      'Cadenas bombeadas xy^i z',
      'Para demostrar que L no es regular, debes argumentar que existe algún i ≥ 0 tal que xy^i z ∉ L. Aquí se listan las cadenas según los i que indicaste.',
      pumpedStrings.length > 0,
      pumpList
    )
  );

  const mechanicalConditionsMet =
    divisionMatchesW && lengthOk && windowOk && yNonEmpty;

  if (mechanicalConditionsMet) {
    summary.push(
      'Las condiciones mecánicas del lema (división, |w|≥p, |xy|≤p, |y|>0) se cumplen para esta configuración.'
    );
    summary.push(
      'Siguiente paso (manual): verifica para algún i si xy^i z pertenece o no a L y concluye la demostración.'
    );
  } else {
    summary.push(
      'Al menos una condición mecánica no se cumple; revisa p, w o la división xyz.'
    );
  }

  if (input.languageDescription.trim()) {
    summary.unshift(`Lenguaje analizado: ${input.languageDescription.trim()}`);
  }

  const exportText = formatPumpingExport(input, {
    steps,
    pumpedStrings,
    divisionMatchesW,
    mechanicalConditionsMet,
    summary,
    warnings,
  });

  return {
    steps,
    division: { x, y, z },
    divisionMatchesW,
    pumpedStrings,
    mechanicalConditionsMet,
    summary,
    warnings,
    exportText,
  };
}

function formatPumpingExport(
  input: PumpingLemmaInput,
  result: {
    steps: PumpingStep[];
    pumpedStrings: PumpedStringRow[];
    divisionMatchesW: boolean;
    mechanicalConditionsMet: boolean;
    summary: string[];
    warnings: string[];
  }
): string {
  const lines: string[] = [
    '=== Lema de bombeo (asistente) ===',
    '',
    `L: ${input.languageDescription || '(sin descripción)'}`,
    `p = ${input.pumpingLength}`,
    `w = ${input.w}`,
    `x = ${input.x}`,
    `y = ${input.y}`,
    `z = ${input.z}`,
    `w = xyz: ${result.divisionMatchesW ? 'sí' : 'no'}`,
    '',
    '--- Pasos ---',
  ];

  for (const s of result.steps) {
    lines.push(`[${s.passed ? 'OK' : '—'}] ${s.title}`);
    lines.push(`  ${s.detail}`);
  }

  lines.push('', '--- Cadenas bombeadas ---');
  for (const row of result.pumpedStrings) {
    lines.push(`i = ${row.i}: ${row.value}  (|·| = ${row.length})`);
  }

  lines.push('', '--- Resumen ---');
  result.summary.forEach((line) => lines.push(`• ${line}`));

  lines.push('', '--- Advertencias ---');
  result.warnings.forEach((line) => lines.push(`• ${line}`));

  return lines.join('\n');
}
