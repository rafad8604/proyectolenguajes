import type { Automaton } from 'types/automaton';
import type { State } from 'types/state';
import type { Transition } from 'types/transition';
import { deriveAlphabet } from './alphabet';
import { epsilonClosure, sortStateIds } from './epsilon-closure';
import { generateId } from './factory';
import { sanitizeDeterministicAutomaton } from './sanitize-dfa';

export interface ConversionTableRow {
  sourceDfaStateId: string;
  sourceSubsetLabel: string;
  symbol: string;
  nfaStatesBeforeMove: string[];
  nfaStatesAfterSymbol: string[];
  epsilonClosure: string[];
  targetDfaStateId: string;
  targetSubsetLabel: string;
  isNewState: boolean;
}

export interface ConversionExplanationStep {
  index: number;
  explanation: string;
  relatedRowIndex?: number;
}

export interface NfaToDfaResult {
  dfa: Automaton;
  table: ConversionTableRow[];
  steps: ConversionExplanationStep[];
  error?: string;
}

interface SubsetRecord {
  id: string;
  nfaStateIds: string[];
  name: string;
}

function nfaStateName(nfa: Automaton, id: string): string {
  return nfa.states.find((s) => s.id === id)?.name ?? id;
}

export function subsetKey(ids: string[]): string {
  return sortStateIds(ids).join('|');
}

export function formatSubsetLabel(nfa: Automaton, ids: string[]): string {
  if (ids.length === 0) return '∅';
  const names = ids.map((id) => nfaStateName(nfa, id)).sort();
  return `{${names.join(', ')}}`;
}

function moveOnSymbol(
  nfa: Automaton,
  stateIds: string[],
  symbol: string
): string[] {
  const targets = new Set<string>();
  for (const q of stateIds) {
    for (const t of nfa.transitions) {
      if (!t.isEpsilon && t.from === q && t.symbol === symbol) {
        targets.add(t.to);
      }
    }
  }
  return sortStateIds(targets);
}

function buildDfaStates(
  nfa: Automaton,
  subsets: SubsetRecord[],
  initialKey: string
): State[] {
  return subsets.map((subset, index) => ({
    id: subset.id,
    name: subset.name,
    isInitial: subsetKey(subset.nfaStateIds) === initialKey,
    isAccepting: subset.nfaStateIds.some((id) =>
      nfa.acceptingStateIds.includes(id)
    ),
    position: {
      x: 80 + (index % 4) * 180,
      y: 80 + Math.floor(index / 4) * 130,
    },
  }));
}

/**
 * Construcción por subconjuntos: AFND (con ε) → AFD equivalente.
 */
export function convertNfaToDfa(nfa: Automaton): NfaToDfaResult {
  const emptyDfa = (): Automaton => ({
    id: generateId('dfa'),
    name: 'AFD convertido',
    type: 'dfa',
    alphabet: [],
    states: [],
    transitions: [],
    initialStateId: null,
    acceptingStateIds: [],
  });

  if (nfa.type !== 'nfa') {
    return {
      dfa: emptyDfa(),
      table: [],
      steps: [],
      error: 'La conversión por subconjuntos requiere un AFND.',
    };
  }

  if (!nfa.initialStateId) {
    return {
      dfa: emptyDfa(),
      table: [],
      steps: [],
      error: 'El AFND debe tener un estado inicial.',
    };
  }

  const alphabet = deriveAlphabet(nfa);
  const subsetMap = new Map<string, SubsetRecord>();
  const dfaTransitions: Transition[] = [];
  const table: ConversionTableRow[] = [];
  const steps: ConversionExplanationStep[] = [];
  let stepCounter = 0;

  const addStep = (explanation: string, relatedRowIndex?: number) => {
    steps.push({ index: stepCounter++, explanation, relatedRowIndex });
  };

  const initialRaw = [nfa.initialStateId];
  const initialClosure = epsilonClosure(nfa, initialRaw);
  const initialKey = subsetKey(initialClosure);
  const initialName = formatSubsetLabel(nfa, initialClosure);

  addStep(
    `Paso 1 — Cerradura ε del estado inicial ${nfaStateName(nfa, nfa.initialStateId)}: ${initialName}.`
  );

  const initialId = generateId('dfa');
  subsetMap.set(initialKey, {
    id: initialId,
    nfaStateIds: initialClosure,
    name: initialName,
  });

  addStep(
    `Se crea el estado inicial del AFD, que representa el conjunto ${initialName}.`
  );

  const queue: string[] = [initialKey];
  const processed = new Set<string>();

  while (queue.length > 0) {
    const key = queue.shift()!;
    if (processed.has(key)) continue;
    processed.add(key);

    const source = subsetMap.get(key)!;
    const S = source.nfaStateIds;
    const fromLabel = source.name;

    addStep(
      `Se procesa el subconjunto ${fromLabel} del AFD (estados NFA: ${fromLabel}).`
    );

    for (const symbol of alphabet) {
      const afterSymbol = moveOnSymbol(nfa, S, symbol);
      const afterClosure = epsilonClosure(nfa, afterSymbol);
      const rowIndex = table.length;

      if (afterClosure.length === 0) {
        table.push({
          sourceDfaStateId: source.id,
          sourceSubsetLabel: fromLabel,
          symbol,
          nfaStatesBeforeMove: [...S],
          nfaStatesAfterSymbol: [],
          epsilonClosure: [],
          targetDfaStateId: '',
          targetSubsetLabel: '∅',
          isNewState: false,
        });
        addStep(
          `Desde ${fromLabel} con «${symbol}»: ningún estado alcanzable (sin transición en el AFD).`,
          rowIndex
        );
        continue;
      }

      const afterSymbolLabel = formatSubsetLabel(nfa, afterSymbol);
      const closureLabel = formatSubsetLabel(nfa, afterClosure);
      const targetKey = subsetKey(afterClosure);
      const isNew = !subsetMap.has(targetKey);

      let targetId: string;
      if (isNew) {
        targetId = generateId('dfa');
        subsetMap.set(targetKey, {
          id: targetId,
          nfaStateIds: afterClosure,
          name: closureLabel,
        });
        queue.push(targetKey);
      } else {
        targetId = subsetMap.get(targetKey)!.id;
      }

      dfaTransitions.push({
        id: generateId('trans'),
        from: source.id,
        to: targetId,
        symbol,
        isEpsilon: false,
      });

      table.push({
        sourceDfaStateId: source.id,
        sourceSubsetLabel: fromLabel,
        symbol,
        nfaStatesBeforeMove: [...S],
        nfaStatesAfterSymbol: afterSymbol,
        epsilonClosure: afterClosure,
        targetDfaStateId: targetId,
        targetSubsetLabel: closureLabel,
        isNewState: isNew,
      });

      addStep(
        isNew
          ? `Desde ${fromLabel} con «${symbol}»: δ(${fromLabel}, ${symbol}) = ${afterSymbolLabel}; cerradura ε → ${closureLabel}. Nuevo estado del AFD.`
          : `Desde ${fromLabel} con «${symbol}»: δ(${fromLabel}, ${symbol}) = ${afterSymbolLabel}; cerradura ε → ${closureLabel}.`,
        rowIndex
      );
    }
  }

  const subsets = Array.from(subsetMap.values());
  const states = buildDfaStates(nfa, subsets, initialKey);
  const initialStateId = subsetMap.get(initialKey)!.id;
  const acceptingStateIds = states
    .filter((s) => s.isAccepting)
    .map((s) => s.id);

  addStep(
    `Conversión completada: ${states.length} estado(es) en el AFD, ${dfaTransitions.length} transición(es). Los subconjuntos que contienen un estado final del AFND se marcan como finales.`
  );

  const dfa: Automaton = sanitizeDeterministicAutomaton({
    id: generateId('auto'),
    name: `${nfa.name} → AFD`,
    type: 'dfa',
    alphabet,
    states,
    transitions: dfaTransitions,
    initialStateId,
    acceptingStateIds,
  });

  return { dfa, table, steps };
}
