import { describe, expect, it } from 'vitest';
import { buildSelfLoopGeometry } from '../self-loop-edge';
import { GRAPH_NODE_RADIUS } from '../../constants';

describe('buildSelfLoopGeometry', () => {
  const centerX = 100;
  const centerY = 200;
  const r = GRAPH_NODE_RADIUS;

  it('dibuja el arco por encima del nodo (apex sobre el borde superior)', () => {
    const geo = buildSelfLoopGeometry(centerX, centerY, 0, 1);

    const defaultLift = 14;
    const expectedApexY = centerY - r - defaultLift;
    const m = /M\s+([-\d.]+)\s+([-\d.]+)\s+C\s+([-\d.]+)\s+([-\d.]+),\s+([-\d.]+)\s+([-\d.]+),\s+([-\d.]+)\s+([-\d.]+)/.exec(
      geo.path
    );
    expect(m).not.toBeNull();
    if (!m) return;

    const [, , , c1x, c1y, c2x, c2y] = m.map(Number);

    expect(c1y).toBe(expectedApexY);
    expect(c2y).toBe(expectedApexY);
    expect(c1y).toBeLessThan(centerY - r);
    expect(c2y).toBeLessThan(centerY - r);
    expect(c1x).toBeGreaterThan(centerX);
    expect(c2x).toBeLessThan(centerX);
  });

  it('apoya inicio y fin del arco cerca del borde superior del nodo', () => {
    const geo = buildSelfLoopGeometry(centerX, centerY, 0, 1);
    const m = /M\s+([-\d.]+)\s+([-\d.]+)\s+C\s+[-\d.]+\s+[-\d.]+,\s+[-\d.]+\s+[-\d.]+,\s+([-\d.]+)\s+([-\d.]+)/.exec(
      geo.path
    );
    expect(m).not.toBeNull();
    if (!m) return;

    const [, sx, sy, ex, ey] = m.map(Number);
    const expectedY = centerY - r * 0.75;

    expect(sy).toBe(expectedY);
    expect(ey).toBe(expectedY);
    expect(sx).toBeGreaterThan(centerX);
    expect(ex).toBeLessThan(centerX);
    expect(sy).toBeLessThan(centerY);
    expect(ey).toBeLessThan(centerY);
  });

  it('coloca la etiqueta por encima del apex del arco', () => {
    const geo = buildSelfLoopGeometry(centerX, centerY, 0, 1);
    const defaultLift = 14;
    const apexY = centerY - r - defaultLift;

    expect(geo.labelX).toBe(centerX);
    expect(geo.labelY).toBeLessThan(apexY);
  });

  it('respeta loopLift y loopSpread cuando manuallyPositioned=true', () => {
    const geo = buildSelfLoopGeometry(centerX, centerY, 0, 1, r, {
      manuallyPositioned: true,
      loopLift: 60,
      loopSpread: 40,
    });

    expect(geo.lift).toBe(60);
    expect(geo.spread).toBe(40);

    const m = /C\s+([-\d.]+)\s+([-\d.]+),\s+([-\d.]+)\s+([-\d.]+),/.exec(
      geo.path
    );
    expect(m).not.toBeNull();
    if (!m) return;

    const [, c1x, c1y, c2x] = m.map(Number);
    expect(c1y).toBe(centerY - r - 60);
    expect(c1x).toBe(centerX + 40);
    expect(c2x).toBe(centerX - 40);
  });

  it('apila self-loops paralelos elevando el arco cuando hay varios', () => {
    const first = buildSelfLoopGeometry(centerX, centerY, 0, 2);
    const second = buildSelfLoopGeometry(centerX, centerY, 1, 2);

    expect(second.lift).toBeGreaterThan(first.lift);
    expect(second.spread).toBeGreaterThan(first.spread);
    expect(second.labelY).toBeLessThan(first.labelY);
  });
});
