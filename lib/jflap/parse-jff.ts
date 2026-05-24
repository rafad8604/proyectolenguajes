import { XMLParser } from 'fast-xml-parser';
import type { Automaton } from 'types/automaton';
import type { State } from 'types/state';
import type { Transition } from 'types/transition';
import type { TuringMachine, TuringTransition, TapeMove } from 'types/turing';
import { generateId } from 'lib/core/automata/factory';
import type {
  JffDocumentType,
  JffParseResult,
  JffParseSuccess,
} from './types';

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function textValue(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim();
  }
  if (typeof value === 'object' && value !== null && '#text' in value) {
    return String((value as { '#text': unknown })['#text']).trim();
  }
  return '';
}

function hasTag(value: unknown): boolean {
  return value !== undefined && value !== null;
}

function fail(error: string, warnings: string[] = []): JffParseResult {
  return { ok: false, error, warnings };
}

function success(partial: Omit<JffParseSuccess, 'ok'>): JffParseResult {
  return { ok: true, ...partial };
}

function parseDocumentType(typeRaw: unknown): JffDocumentType {
  const type = textValue(typeRaw).toLowerCase();
  if (type === 'fa' || type === 'finiteautomaton') return 'fa';
  if (
    type === 'turing' ||
    type === 'turingmachine' ||
    type === 'tm' ||
    type === 'turing2' ||
    type === 'tu20'
  ) {
    return 'turing';
  }
  return 'unknown';
}

function isDeterministic(transitions: Transition[]): boolean {
  const map = new Map<string, string>();
  for (const t of transitions) {
    if (t.isEpsilon) return false;
    const key = `${t.from}|${t.symbol}`;
    const existing = map.get(key);
    if (existing && existing !== t.to) return false;
    if (!existing) map.set(key, t.to);
  }
  return true;
}

function deriveFaAlphabet(transitions: Transition[]): string[] {
  const symbols = new Set<string>();
  for (const t of transitions) {
    if (!t.isEpsilon && t.symbol) symbols.add(t.symbol);
  }
  return Array.from(symbols).sort();
}

function parseFaStates(
  rawStates: unknown[],
  warnings: string[]
): { states: State[]; idMap: Map<number, string> } {
  const states: State[] = [];
  const idMap = new Map<number, string>();

  for (const raw of rawStates) {
    if (!raw || typeof raw !== 'object') continue;
    const obj = raw as Record<string, unknown>;
    const jflapId = Number(obj['@_id']);
    if (Number.isNaN(jflapId)) {
      warnings.push('Estado sin id numérico omitido.');
      continue;
    }
    const internalId = generateId('jflap_s');
    idMap.set(jflapId, internalId);
    const name = textValue(obj['@_name']) || `q${jflapId}`;
    states.push({
      id: internalId,
      name,
      isInitial: hasTag(obj.initial),
      isAccepting: hasTag(obj.final),
      position: {
        x: Number(textValue(obj.x)) || 100 + jflapId * 80,
        y: Number(textValue(obj.y)) || 100,
      },
    });
  }

  return { states, idMap };
}

function parseFaTransitions(
  rawTransitions: unknown[],
  idMap: Map<number, string>,
  warnings: string[]
): Transition[] {
  const transitions: Transition[] = [];

  for (const raw of rawTransitions) {
    if (!raw || typeof raw !== 'object') continue;
    const obj = raw as Record<string, unknown>;
    const fromNum = Number(textValue(obj.from));
    const toNum = Number(textValue(obj.to));
    const from = idMap.get(fromNum);
    const to = idMap.get(toNum);

    if (!from || !to) {
      warnings.push(
        `Transición con from/to inválido (${fromNum} → ${toNum}) omitida.`
      );
      continue;
    }

    const reads = asArray(obj.read).map(textValue);
    if (reads.length === 0) {
      warnings.push(`Transición ${fromNum}→${toNum} sin símbolo de lectura omitida.`);
      continue;
    }

    for (const read of reads) {
      const isEpsilon = read === '' || read === 'ε' || read === 'epsilon';
      transitions.push({
        id: generateId('jflap_t'),
        from,
        to,
        symbol: isEpsilon ? '' : read,
        isEpsilon,
      });
    }
  }

  return transitions;
}

function parseFiniteAutomaton(
  automatonNode: unknown,
  fileName?: string
): JffParseResult {
  const warnings: string[] = [];
  if (!automatonNode || typeof automatonNode !== 'object') {
    return fail('El archivo no contiene un autómata finito válido.');
  }

  const node = automatonNode as Record<string, unknown>;
  const rawStates = asArray(node.state);
  if (rawStates.length === 0) {
    return fail('El autómata no tiene estados.');
  }

  const { states, idMap } = parseFaStates(rawStates, warnings);
  const transitions = parseFaTransitions(
    asArray(node.transition),
    idMap,
    warnings
  );

  if (transitions.length === 0) {
    warnings.push('El autómata no tiene transiciones.');
  }

  const initialStates = states.filter((s) => s.isInitial);
  let initialStateId = initialStates[0]?.id ?? null;
  if (initialStates.length > 1) {
    warnings.push('Hay varios estados iniciales; se usará el primero.');
  }
  if (!initialStateId && states[0]) {
    initialStateId = states[0].id;
    states[0].isInitial = true;
    warnings.push('No había estado inicial; se marcó el primero.');
  }

  const acceptingStateIds = states.filter((s) => s.isAccepting).map((s) => s.id);
  const type = isDeterministic(transitions) ? 'dfa' : 'nfa';

  const automaton: Automaton = {
    id: generateId('auto'),
    name: fileName?.replace(/\.jff$/i, '') || 'Importado JFLAP',
    type,
    alphabet: deriveFaAlphabet(transitions),
    states,
    transitions,
    initialStateId,
    acceptingStateIds,
  };

  return success({
    kind: 'automaton',
    documentType: 'fa',
    automaton,
    warnings,
    fileName,
  });
}

function parseTapeMove(value: string): TapeMove | null {
  const v = value.toUpperCase();
  if (v === 'L' || v === 'R' || v === 'S') return v;
  return null;
}

function deriveTuringAlphabets(
  transitions: TuringTransition[],
  blank: string
): { input: string[]; tape: string[] } {
  const input = new Set<string>();
  const tape = new Set<string>([blank]);
  for (const t of transitions) {
    for (const s of t.readSymbols) {
      if (s && s !== blank) {
        input.add(s);
        tape.add(s);
      }
    }
    for (const s of t.writeSymbols) {
      if (s) tape.add(s);
    }
  }
  return {
    input: Array.from(input).sort(),
    tape: Array.from(tape).sort(),
  };
}

function parseTuringMachine(
  automatonNode: unknown,
  fileName?: string
): JffParseResult {
  const warnings: string[] = [];
  if (!automatonNode || typeof automatonNode !== 'object') {
    return fail('El archivo no contiene una máquina de Turing válida.');
  }

  const node = automatonNode as Record<string, unknown>;
  const rawStates = asArray(node.state);
  if (rawStates.length === 0) {
    return fail('La máquina de Turing no tiene estados.');
  }

  const { states, idMap } = parseFaStates(rawStates, warnings);
  const rawTransitions = asArray(node.transition);
  const transitions: TuringTransition[] = [];
  let maxTapes = 1;

  for (const raw of rawTransitions) {
    if (!raw || typeof raw !== 'object') continue;
    const obj = raw as Record<string, unknown>;
    const fromNum = Number(textValue(obj.from));
    const toNum = Number(textValue(obj.to));
    const from = idMap.get(fromNum);
    const to = idMap.get(toNum);

    if (!from || !to) {
      warnings.push(
        `Transición TM ${fromNum}→${toNum} con estados inválidos omitida.`
      );
      continue;
    }

    const reads = asArray(obj.read).map(textValue);
    const writes = asArray(obj.write).map(textValue);
    const movesRaw = asArray(obj.move).map(textValue);

    if (reads.length === 0 || writes.length === 0 || movesRaw.length === 0) {
      warnings.push(
        `Transición TM incompleta (${fromNum}→${toNum}): faltan read/write/move.`
      );
      continue;
    }

    const tapeCount = Math.max(reads.length, writes.length, movesRaw.length);
    maxTapes = Math.max(maxTapes, tapeCount);

    if (
      reads.length !== writes.length ||
      reads.length !== movesRaw.length
    ) {
      warnings.push(
        `Transición ${fromNum}→${toNum}: cantidad distinta de read/write/move; se rellena con blanco/S.`
      );
    }

    const readSymbols = Array.from({ length: tapeCount }, (_, i) =>
      reads[i] ?? '_'
    );
    const writeSymbols = Array.from({ length: tapeCount }, (_, i) =>
      writes[i] ?? readSymbols[i]
    );
    const moves: TapeMove[] = Array.from({ length: tapeCount }, (_, i) => {
      const m = parseTapeMove(movesRaw[i] ?? 'S');
      return m ?? 'S';
    });

    transitions.push({
      id: generateId('jflap_tm'),
      from,
      to,
      readSymbols,
      writeSymbols,
      moves,
    });
  }

  if (transitions.length === 0) {
    return fail('La máquina de Turing no tiene transiciones válidas.', warnings);
  }

  const tapeCount: 1 | 2 = maxTapes >= 2 ? 2 : 1;
  if (maxTapes > 2) {
    warnings.push(
      `El archivo define ${maxTapes} bandas; solo se soportan 1 o 2. Se truncará a 2.`
    );
  }

  const normalizedTransitions = transitions.map((t) => ({
    ...t,
    readSymbols: t.readSymbols.slice(0, tapeCount),
    writeSymbols: t.writeSymbols.slice(0, tapeCount),
    moves: t.moves.slice(0, tapeCount) as TapeMove[],
  }));

  const blankSymbol =
    textValue((node as Record<string, unknown>).blank) || '_';

  const initialStates = states.filter((s) => s.isInitial);
  let initialStateId = initialStates[0]?.id ?? states[0]?.id ?? null;
  if (!initialStates.length && states[0]) {
    states[0].isInitial = true;
    warnings.push('No había estado inicial; se marcó el primero.');
  }

  const acceptingStateIds = states.filter((s) => s.isAccepting).map((s) => s.id);
  const { input, tape } = deriveTuringAlphabets(
    normalizedTransitions,
    blankSymbol
  );

  const turingMachine: TuringMachine = {
    id: generateId('tm'),
    name: fileName?.replace(/\.jff$/i, '') || 'MT importada JFLAP',
    tapeCount,
    inputAlphabet: input,
    tapeAlphabet: tape.includes(blankSymbol)
      ? tape
      : [...tape, blankSymbol].sort(),
    blankSymbol,
    states,
    transitions: normalizedTransitions,
    initialStateId,
    acceptingStateIds,
    rejectingStateIds: [],
  };

  return success({
    kind: 'turing',
    documentType: 'turing',
    turingMachine,
    warnings,
    fileName,
  });
}

/**
 * Parsea un archivo XML JFLAP (.jff) y devuelve un autómata o máquina de Turing.
 */
export function parseJff(xml: string, fileName?: string): JffParseResult {
  const warnings: string[] = [];

  if (!xml || !xml.trim()) {
    return fail('El archivo está vacío.');
  }

  let parsed: unknown;
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      trimValues: true,
      isArray: (tagName) =>
        ['state', 'transition', 'read', 'write', 'move'].includes(tagName),
    });
    parsed = parser.parse(xml);
  } catch {
    return fail('XML inválido: no se pudo interpretar el archivo .jff.');
  }

  if (!parsed || typeof parsed !== 'object') {
    return fail('Estructura XML inválida.');
  }

  const root = parsed as Record<string, unknown>;
  const structure = root.structure ?? root;
  if (!structure || typeof structure !== 'object') {
    return fail('Falta el elemento raíz <structure>.');
  }

  const struct = structure as Record<string, unknown>;
  const documentType = parseDocumentType(struct.type);

  if (documentType === 'unknown') {
    return fail(
      `Tipo de autómata no soportado: «${textValue(struct.type) || 'desconocido'}». Se admiten fa y turing.`
    );
  }

  const automatonNode = struct.automaton;
  if (!automatonNode) {
    return fail('Falta el elemento <automaton>.');
  }

  if (documentType === 'fa') {
    return parseFiniteAutomaton(automatonNode, fileName);
  }

  return parseTuringMachine(automatonNode, fileName);
}

/** Alias en camelCase solicitado en la arquitectura. */
export const parseJffFile = parseJff;

/** @deprecated Usar parseJff */
export const parseJflapXml = parseJff;
