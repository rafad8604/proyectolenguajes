import { describe, expect, it } from 'vitest';
import { exportAutomatonToJff, parseJff } from '../index';
import type { Automaton } from 'types/automaton';
import { createEmptyAutomaton, createState, createTransition } from 'lib/core/automata';

function minimalAutomatonWithVisual(): Automaton {
  const s0 = createState([], { x: 100, y: 200 });
  const s1 = createState([s0], { x: 300, y: 200 });
  s0.isInitial = true;
  s1.isAccepting = true;
  const t = createTransition(s0.id, s1.id, 'a');
  t.visual = {
    manuallyPositioned: true,
    controlPoint: { x: 200, y: 150 },
    labelAlong: 0.7,
    labelPosition: { x: 210, y: 140 },
    labelOffset: { x: 5, y: -10 },
  };
  return {
    ...createEmptyAutomaton('dfa'),
    states: [s0, s1],
    transitions: [t],
    initialStateId: s0.id,
    acceptingStateIds: [s1.id],
  };
}

describe('transition visual JFF round-trip', () => {
  it('exporta pl:visual y control, y parse los restaura', () => {
    const automaton = minimalAutomatonWithVisual();
    const xml = exportAutomatonToJff(automaton);
    expect(xml).toContain('pl:visual');
    expect(xml).toContain('controlX="200"');
    expect(xml).toContain('<control>');

    const parsed = parseJff(xml, 'test.jff');
    expect(parsed.ok).toBe(true);
    if (!parsed.ok || !parsed.automaton) return;

    const t = parsed.automaton.transitions[0];
    expect(t.visual?.controlPoint).toEqual({ x: 200, y: 150 });
    expect(t.visual?.labelAlong).toBe(0.7);
    expect(t.visual?.labelPosition).toEqual({ x: 210, y: 140 });
    expect(t.visual?.labelOffset).toEqual({ x: 5, y: -10 });
    expect(t.visual?.manuallyPositioned).toBe(true);
  });

  it('exporta labelX, labelY y labelAlong en pl:visual', () => {
    const automaton = minimalAutomatonWithVisual();
    const xml = exportAutomatonToJff(automaton);
    expect(xml).toContain('labelX="210"');
    expect(xml).toContain('labelY="140"');
    expect(xml).toContain('labelAlong="0.7"');
  });
});
