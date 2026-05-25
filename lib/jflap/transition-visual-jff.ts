import type { TransitionVisual } from 'types/transition-visual';

export const PL_VISUAL_NS = 'https://proyectolenguajes.dev/jflap-visual/v1';

function num(value: number | undefined): string | null {
  if (value === undefined || Number.isNaN(value)) return null;
  return String(Math.round(value * 10) / 10);
}

/** Fragmento XML opcional con control JFLAP-style y extensión pl:visual. */
export function transitionVisualToJffXml(visual: TransitionVisual | undefined): string {
  if (!visual) return '';

  const parts: string[] = [];

  if (visual.controlPoint) {
    const cx = num(visual.controlPoint.x);
    const cy = num(visual.controlPoint.y);
    if (cx != null && cy != null) {
      parts.push(`      <control>
      <x>${cx}</x>
      <y>${cy}</y>
    </control>`);
    }
  }

  const attrs: string[] = [];
  if (visual.controlPoint) {
    const cx = num(visual.controlPoint.x);
    const cy = num(visual.controlPoint.y);
    if (cx != null) attrs.push(`controlX="${cx}"`);
    if (cy != null) attrs.push(`controlY="${cy}"`);
  }
  if (visual.labelAlong != null) {
    const along = num(visual.labelAlong);
    if (along != null) attrs.push(`labelAlong="${along}"`);
  }
  if (visual.labelPosition) {
    const lx = num(visual.labelPosition.x);
    const ly = num(visual.labelPosition.y);
    if (lx != null) attrs.push(`labelX="${lx}"`);
    if (ly != null) attrs.push(`labelY="${ly}"`);
  }
  if (visual.labelOffset) {
    const dx = num(visual.labelOffset.x);
    const dy = num(visual.labelOffset.y);
    if (dx != null) attrs.push(`labelDx="${dx}"`);
    if (dy != null) attrs.push(`labelDy="${dy}"`);
  }
  if (visual.loopLift != null) attrs.push(`loopLift="${visual.loopLift}"`);
  if (visual.loopSpread != null) attrs.push(`loopSpread="${visual.loopSpread}"`);
  if (visual.manuallyPositioned) attrs.push('manual="true"');

  if (attrs.length > 0) {
    parts.push(
      `      <pl:visual xmlns:pl="${PL_VISUAL_NS}" ${attrs.join(' ')}/>`
    );
  }

  return parts.length > 0 ? `\n${parts.join('\n')}` : '';
}

function parseNumber(value: unknown): number | undefined {
  const n = Number(textValue(value));
  return Number.isFinite(n) ? n : undefined;
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

/** Extrae geometría visual de un nodo transition crudo del XML. */
export function parseTransitionVisualFromJff(
  obj: Record<string, unknown>
): TransitionVisual | undefined {
  const visual: TransitionVisual = {};
  let hasData = false;

  const control = obj.control;
  if (control && typeof control === 'object') {
    const c = control as Record<string, unknown>;
    const x = parseNumber(c.x);
    const y = parseNumber(c.y);
    if (x !== undefined && y !== undefined) {
      visual.controlPoint = { x, y };
      hasData = true;
    }
  }

  const plVisual = obj['pl:visual'] ?? obj.visual;
  if (plVisual && typeof plVisual === 'object') {
    const pl = plVisual as Record<string, unknown>;
    const attrs = pl as Record<string, string>;
    const cx = parseNumber(attrs['@_controlX'] ?? attrs.controlX);
    const cy = parseNumber(attrs['@_controlY'] ?? attrs.controlY);
    if (cx !== undefined && cy !== undefined) {
      visual.controlPoint = { x: cx, y: cy };
      hasData = true;
    }
    const along = parseNumber(attrs['@_labelAlong'] ?? attrs.labelAlong);
    if (along !== undefined) {
      visual.labelAlong = along;
      hasData = true;
    }
    const lx = parseNumber(attrs['@_labelX'] ?? attrs.labelX);
    const ly = parseNumber(attrs['@_labelY'] ?? attrs.labelY);
    if (lx !== undefined && ly !== undefined) {
      visual.labelPosition = { x: lx, y: ly };
      hasData = true;
    }
    const ldx = parseNumber(attrs['@_labelDx'] ?? attrs.labelDx);
    const ldy = parseNumber(attrs['@_labelDy'] ?? attrs.labelDy);
    if (ldx !== undefined || ldy !== undefined) {
      visual.labelOffset = { x: ldx ?? 0, y: ldy ?? 0 };
      hasData = true;
    }
    const lift = parseNumber(attrs['@_loopLift'] ?? attrs.loopLift);
    const spread = parseNumber(attrs['@_loopSpread'] ?? attrs.loopSpread);
    if (lift !== undefined) {
      visual.loopLift = lift;
      hasData = true;
    }
    if (spread !== undefined) {
      visual.loopSpread = spread;
      hasData = true;
    }
    const manualRaw = String(attrs['@_manual'] ?? attrs.manual ?? '');
    const manual = manualRaw === 'true' || manualRaw === '1';
    if (manual) {
      visual.manuallyPositioned = true;
      hasData = true;
    }
  }

  if (hasData && !visual.manuallyPositioned) {
    visual.manuallyPositioned = true;
  }

  return hasData ? visual : undefined;
}
