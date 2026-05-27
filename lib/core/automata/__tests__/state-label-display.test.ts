import { describe, expect, it } from 'vitest';
import { getStateLabelDisplay } from '../state-label-display';

describe('getStateLabelDisplay', () => {
  it('mantiene etiquetas cortas sin cambios', () => {
    const result = getStateLabelDisplay('q0');
    expect(result.displayText).toBe('q0');
    expect(result.fullText).toBe('q0');
    expect(result.fontSizeClass).toContain('text-sm');
  });

  it('reduce fuente para subconjuntos medianos', () => {
    const result = getStateLabelDisplay('{q0, q1}');
    expect(result.fullText).toBe('{q0, q1}');
    expect(result.fontSizeClass).toContain('10px');
  });

  it('abrevia subconjuntos largos conservando tooltip completo', () => {
    const label = '{q0, q1, q2, q3, q4}';
    const result = getStateLabelDisplay(label);
    expect(result.fullText).toBe(label);
    expect(result.displayText).toContain('…');
    expect(result.displayText.length).toBeLessThan(label.length);
  });
});
