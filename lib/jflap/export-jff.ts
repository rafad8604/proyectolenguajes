import type { Automaton } from 'types/automaton';
import type { TuringMachine } from 'types/turing';
import { escapeXml, sanitizeFilename } from './xml-utils';
import { transitionVisualToJffXml } from './transition-visual-jff';
import type { JffExportTarget } from './types';

function buildStateIdMap(states: { id: string }[]): Map<string, number> {
  const map = new Map<string, number>();
  states.forEach((s, i) => map.set(s.id, i));
  return map;
}

/** Exporta un AFD/AFND a XML JFLAP 7 (.jff). */
export function exportAutomatonToJff(automaton: Automaton): string {
  const stateIdMap = buildStateIdMap(automaton.states);

  const stateXml = automaton.states
    .map((s) => {
      const id = stateIdMap.get(s.id)!;
      const x = Math.round(s.position?.x ?? 100 + id * 80);
      const y = Math.round(s.position?.y ?? 100);
      const initial = s.isInitial ? '<initial/>' : '';
      const final = s.isAccepting ? '<final/>' : '';
      return `    <state id="${id}" name="${escapeXml(s.name)}">
      <x>${x}</x>
      <y>${y}</y>
      ${initial}
      ${final}
    </state>`;
    })
    .join('\n');

  const transitionXml = automaton.transitions
    .map((t) => {
      const from = stateIdMap.get(t.from) ?? 0;
      const to = stateIdMap.get(t.to) ?? 0;
      const read = t.isEpsilon ? '' : escapeXml(t.symbol);
      const visualXml = transitionVisualToJffXml(t.visual);
      return `    <transition>
      <from>${from}</from>
      <to>${to}</to>
      <read>${read}</read>${visualXml}
    </transition>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<structure>
  <type>fa</type>
  <automaton>
${stateXml}
${transitionXml}
  </automaton>
</structure>
`;
}

/** Exporta una MT de 1 o 2 bandas a XML JFLAP 7 (.jff). */
export function exportTuringToJff(machine: TuringMachine): string {
  const stateIdMap = buildStateIdMap(machine.states);

  const stateXml = machine.states
    .map((s) => {
      const id = stateIdMap.get(s.id)!;
      const x = Math.round(s.position?.x ?? 100 + id * 80);
      const y = Math.round(s.position?.y ?? 100);
      const initial = machine.initialStateId === s.id ? '<initial/>' : '';
      const final = machine.acceptingStateIds.includes(s.id) ? '<final/>' : '';
      return `    <state id="${id}" name="${escapeXml(s.name)}">
      <x>${x}</x>
      <y>${y}</y>
      ${initial}
      ${final}
    </state>`;
    })
    .join('\n');

  const transitionXml = machine.transitions
    .map((t) => {
      const from = stateIdMap.get(t.from) ?? 0;
      const to = stateIdMap.get(t.to) ?? 0;
      const reads = t.readSymbols
        .map((s) => `      <read>${escapeXml(s)}</read>`)
        .join('\n');
      const writes = t.writeSymbols
        .map((s) => `      <write>${escapeXml(s)}</write>`)
        .join('\n');
      const moves = t.moves.map((m) => `      <move>${m}</move>`).join('\n');
      const visualXml = transitionVisualToJffXml(t.visual);
      return `    <transition>
      <from>${from}</from>
      <to>${to}</to>
${reads}
${writes}
${moves}${visualXml}
    </transition>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<structure>
  <type>turing</type>
  <automaton>
${stateXml}
${transitionXml}
  </automaton>
</structure>
`;
}

/** Exporta un modelo interno al XML .jff correspondiente. */
export function exportToJff(target: JffExportTarget): string {
  if (target.kind === 'automaton' && target.automaton) {
    return exportAutomatonToJff(target.automaton);
  }
  if (target.kind === 'turing' && target.turingMachine) {
    return exportTuringToJff(target.turingMachine);
  }
  throw new Error('No hay modelo válido para exportar.');
}

export function defaultJffFilename(target: JffExportTarget): string {
  const base =
    target.kind === 'automaton'
      ? target.automaton?.name
      : target.turingMachine?.name;
  const prefix = target.kind === 'automaton' ? 'automata' : 'turing';
  return `${sanitizeFilename(base ?? prefix)}.jff`;
}

/** @deprecated Usar exportAutomatonToJff */
export const serializeAutomatonToJflap = exportAutomatonToJff;
