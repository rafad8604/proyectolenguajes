import { describe, expect, it } from 'vitest';
import {
  LABEL_ALONG_MAX,
  LABEL_ALONG_MIN,
  clampLabelAlong,
} from '../project-point-on-path';

describe('clampLabelAlong', () => {
  it('permite el rango completo del path (0 a 1)', () => {
    expect(LABEL_ALONG_MIN).toBe(0);
    expect(LABEL_ALONG_MAX).toBe(1);
  });

  it('mantiene los valores dentro del rango sin tocarlos', () => {
    expect(clampLabelAlong(0)).toBe(0);
    expect(clampLabelAlong(0.5)).toBe(0.5);
    expect(clampLabelAlong(1)).toBe(1);
    expect(clampLabelAlong(0.05)).toBe(0.05);
    expect(clampLabelAlong(0.95)).toBe(0.95);
  });

  it('recorta valores fuera del rango [0, 1]', () => {
    expect(clampLabelAlong(-0.5)).toBe(0);
    expect(clampLabelAlong(1.7)).toBe(1);
  });

  it('devuelve 0.5 ante NaN para evitar etiquetas fuera de pantalla', () => {
    expect(clampLabelAlong(Number.NaN)).toBe(0.5);
  });
});
