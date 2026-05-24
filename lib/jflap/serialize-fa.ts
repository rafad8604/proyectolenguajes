import type { Automaton } from 'types/automaton';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Serializa un AFD/AFND a XML JFLAP 7 (.jff).
 * Para AFND incluye transiciones con `<read></read>` vacío como ε.
 */
export function serializeAutomatonToJflap(automaton: Automaton): string {
  const stateIdMap = new Map<string, number>();
  automaton.states.forEach((s, i) => stateIdMap.set(s.id, i));

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
      return `    <transition>
      <from>${from}</from>
      <to>${to}</to>
      <read>${read}</read>
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
